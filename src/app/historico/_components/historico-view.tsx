"use client";

import { SearchIcon } from "@/assets/icons";
import { PaymentsOverviewChart } from "@/components/Charts/payments-overview/chart";
import InputGroup from "@/components/FormElements/InputGroup";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeviceSelection } from "@/contexts/device-selection-context";
import { useFirebaseData } from "@/contexts/firebase-data-context";
import { getDataForGraph, getLatestStateData, resetLatestStateGlobalStats } from "@/lib/firebase";
import { formatMeasurementValue } from "@/lib/format-measurement";
import { cn } from "@/lib/utils";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { HistoricoContainer } from "./historico-container";

type HistoricoItem = {
  id: string;
  variableKey: string;
  variableName: string;
  value: number;
  unit: string;
  time: number;
};

type Filters = {
  query: string;
  startDate: string;
  endDate: string;
};

type VariableOption = {
  value: string;
  label: string;
};

const emptyFilters: Filters = {
  query: "",
  startDate: "",
  endDate: "",
};

const VARIABLE_LABELS: Record<string, string> = {
  Va: "Tensão A",
  Vb: "Tensão B",
  Vc: "Tensão C",
  Ia: "Corrente A",
  Ib: "Corrente B",
  Ic: "Corrente C",
  In: "Corrente de neutro",
  Pa: "Potência A",
  Pb: "Potência B",
  Pc: "Potência C",
  Pdir: "Potência direta",
  Prev: "Potência reversa",
  Q: "Potência reativa",
  S: "Potência complexa",
  Ph: "Potência harmônica",
  fpa: "Fator de potência A",
  fpb: "Fator de potência B",
  fpc: "Fator de potência C",
  fpt: "Fator de potência total",
  f: "Frequência",
  t: "Temperatura",
  Ea: "Energia A",
  Eb: "Energia B",
  Ec: "Energia C",
  Ear: "Energia reativa A",
  Ebr: "Energia reativa B",
  Ecr: "Energia reativa C",
  Era: "Energia reversa A",
  Erb: "Energia reversa B",
  Erc: "Energia reversa C",
  Erar: "Energia reversa reativa A",
  Erbr: "Energia reversa reativa B",
  Ercr: "Energia reversa reativa C",
  angVa: "Ângulo de tensão A",
  angVb: "Ângulo de tensão B",
  angVc: "Ângulo de tensão C",
  angIa: "Ângulo de corrente A",
  angIb: "Ângulo de corrente B",
  angIc: "Ângulo de corrente C",
};

const VARIABLE_UNITS: Record<string, string> = {
  Va: "V",
  Vb: "V",
  Vc: "V",
  Ia: "A",
  Ib: "A",
  Ic: "A",
  In: "A",
  Pa: "W",
  Pb: "W",
  Pc: "W",
  Pdir: "W",
  Prev: "W",
  Q: "Var",
  S: "VA",
  Ph: "W",
  fpa: "",
  fpb: "",
  fpc: "",
  fpt: "",
  f: "Hz",
  t: "°C",
  Ea: "kWh",
  Eb: "kWh",
  Ec: "kWh",
  Ear: "kVArh",
  Ebr: "kVArh",
  Ecr: "kVArh",
  Era: "kVArh",
  Erb: "kVArh",
  Erc: "kVArh",
  Erar: "kVArh",
  Erbr: "kVArh",
  Ercr: "kVArh",
  angVa: "°",
  angVb: "°",
  angVc: "°",
  angIa: "°",
  angIb: "°",
  angIc: "°",
};

const ERROR_TOAST_DURATION_MS = 1500;
const byPrefixAndName = {
  far: {
    globe: faGlobe,
  },
} as const;

const getVariableLabel = (key: string) => VARIABLE_LABELS[key] ?? key;
const getVariableUnit = (key: string) => VARIABLE_UNITS[key] ?? "";
const RESERVED_NON_NUMERIC_KEYS = new Set(["createdAt", "eventAt", "id", "deviceId", "deviceName"]);

const toFiniteNumber = (value: unknown) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const formatMaybeTimestamp = (value: unknown) => {
  const timestamp = toFiniteNumber(value);
  if (timestamp == null) return "--";

  const formatted = dayjs(timestamp).format("YYYY-MM-DD HH:mm");
  return formatted === "Invalid Date" ? "--" : formatted;
};

const toRecord = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
};

const parseDateInput = (value: string) => {
  if (!value) return undefined;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split("/").map(Number);
    return new Date(year, month - 1, day);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

export function HistoricoView() {
  const { selectedDeviceId } = useDeviceSelection();
  const { data } = useFirebaseData();
  const [latestState, setLatestState] = useState<Record<string, unknown> | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState("");
  const [errorToastProgress, setErrorToastProgress] = useState(100);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [resultsKey, setResultsKey] = useState(0);
  const [historyItems, setHistoryItems] = useState<HistoricoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResettingGlobals, setIsResettingGlobals] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const hasVariableFilter = filters.query.trim().length > 0;
  const hasDateRangeFilter =
    filters.startDate.trim().length > 0 && filters.endDate.trim().length > 0;

  const variableOptions = useMemo<VariableOption[]>(() => {
    if (!data) return [];

        return Object.entries(data)
      .filter(([key, value]) => !RESERVED_NON_NUMERIC_KEYS.has(key) && toFiniteNumber(value) != null)
      .map(([key]) => ({ value: key, label: getVariableLabel(key) }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
  }, [data]);

  const suggestions = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();
    if (!normalizedQuery) return variableOptions;

    return variableOptions.filter(
      (option) =>
        option.label.toLowerCase().includes(normalizedQuery) ||
        option.value.toLowerCase().includes(normalizedQuery),
    );
  }, [searchTerm, variableOptions]);

  const showSuggestions = isSuggestionsOpen && suggestions.length > 0;

  const resolveOption = (value: string) => {
    const normalized = value.trim().toLowerCase();
    return variableOptions.find(
      (option) =>
        option.value.toLowerCase() === normalized ||
        option.label.toLowerCase() === normalized,
    );
  };

  const closeErrorModal = () => {
    setIsErrorModalOpen(false);
    setErrorModalMessage("");
    setErrorToastProgress(100);
  };

  const applyFilters = (queryOverride?: string, labelOverride?: string) => {
    const rawQuery = (queryOverride ?? searchTerm).trim();
    const resolvedOption = resolveOption(rawQuery);
    const resolvedValue = queryOverride ?? resolvedOption?.value ?? rawQuery;
    const resolvedLabel = labelOverride ?? resolvedOption?.label ?? rawQuery;

    setSearchTerm(resolvedLabel);
    setFilters({
      query: resolvedValue,
      startDate: startDateInput,
      endDate: endDateInput,
    });
    setResultsKey((prev) => prev + 1);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    setIsSuggestionsOpen(value.trim().length > 0);
    if (isErrorModalOpen) closeErrorModal();
  };

  const validateDateRange = () => {
    if (!startDateInput && !endDateInput) {
      return null;
    }

    if (!startDateInput || !endDateInput) {
      return "Preencha data inicial e data final, ou deixe ambas vazias para ver estatísticas globais.";
    }

    const startBoundary = parseDateInput(startDateInput);
    const endBoundary = parseDateInput(endDateInput);

    if (!startBoundary || !endBoundary) {
      return "As datas informadas sÃ£o invÃ¡lidas.";
    }

    if (endBoundary.getTime() <= startBoundary.getTime()) {
      return "A data final deve ser maior que a data inicial.";
    }

    return null;
  };

  const validateVariable = () => {
    const rawQuery = searchTerm.trim();
    if (!rawQuery) {
      return "Selecione uma variÃ¡vel vÃ¡lida antes de pesquisar.";
    }

    const resolvedOption = resolveOption(rawQuery);
    if (!resolvedOption) {
      return "Selecione uma variÃ¡vel vÃ¡lida antes de pesquisar.";
    }

    return null;
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter") return;

    (event.target as HTMLElement | null)?.blur();
    if (suggestions.length > 0) {
      event.preventDefault();
      setSearchTerm(suggestions[0].label);
      setIsSuggestionsOpen(false);
    }
  };

  const handleSearchButtonClick = () => {
    setIsSuggestionsOpen(false);

    const variableValidationError = validateVariable();
    if (variableValidationError) {
      setIsErrorModalOpen(true);
      setErrorModalMessage(variableValidationError);
      return;
    }

    const dateValidationError = validateDateRange();
    if (dateValidationError) {
      setIsErrorModalOpen(true);
      setErrorModalMessage(dateValidationError);
      return;
    }

    const resolvedOption = resolveOption(searchTerm.trim());
    if (!resolvedOption) {
      setIsErrorModalOpen(true);
      setErrorModalMessage("Selecione uma variÃ¡vel vÃ¡lida antes de pesquisar.");
      return;
    }

    closeErrorModal();
    applyFilters(resolvedOption.value, resolvedOption.label);
  };

  const handleGlobalSearchButtonClick = () => {
    setIsSuggestionsOpen(false);

    const variableValidationError = validateVariable();
    if (variableValidationError) {
      setIsErrorModalOpen(true);
      setErrorModalMessage(variableValidationError);
      return;
    }

    const resolvedOption = resolveOption(searchTerm.trim());
    if (!resolvedOption) {
      setIsErrorModalOpen(true);
      setErrorModalMessage("Selecione uma variÃ¡vel vÃ¡lida antes de pesquisar.");
      return;
    }

    setStartDateInput("");
    setEndDateInput("");
    closeErrorModal();
    setSearchTerm(resolvedOption.label);
    setFilters({
      query: resolvedOption.value,
      startDate: "",
      endDate: "",
    });
    setResultsKey((prev) => prev + 1);
  };

  const handleResetGlobalStatsClick = () => {
    setIsResetConfirmOpen(true);
  };

  const handleResetGlobalStatsConfirm = async () => {
    setIsResettingGlobals(true);
    try {
      await resetLatestStateGlobalStats(selectedDeviceId);
      setIsResetConfirmOpen(false);
    } catch (error) {
      console.error(error);
      setErrorModalMessage("Nao foi possivel apagar os valores globais.");
      setIsErrorModalOpen(true);
    } finally {
      setIsResettingGlobals(false);
    }
  };

  useEffect(() => {
    const unsubscribe = getLatestStateData(
      (state: Record<string, unknown> | null) => {
        setLatestState(state);
      },
      selectedDeviceId,
    );

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [selectedDeviceId]);

  useEffect(() => {
    if (!filters.query) {
      setHistoryItems([]);
      setIsLoading(false);
      return;
    }

    if (!hasDateRangeFilter) {
      setHistoryItems([]);
      setIsLoading(false);
      return;
    }

    const startBoundary = parseDateInput(filters.startDate);
    const endBoundary = parseDateInput(filters.endDate);

    setIsLoading(true);
    const variableLabel = getVariableLabel(filters.query);
    const variableUnit = getVariableUnit(filters.query);

    const unsubscribe = getDataForGraph(
      filters.query,
      startBoundary,
      endBoundary,
      500,
      (points: { x: unknown; y: number }[]) => {
        const items = points.map((point, index) => {
          const timeMs =
            typeof point.x === "number"
              ? point.x
              : new Date(point.x as string | number | Date).getTime();

          return {
            id: `${filters.query}-${timeMs}-${index}`,
            variableKey: filters.query,
            variableName: variableLabel,
            value: point.y,
            unit: variableUnit,
            time: timeMs,
          };
        });

        setHistoryItems(items);
        setIsLoading(false);
      },
      selectedDeviceId,
    );

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [
    filters.query,
    filters.startDate,
    filters.endDate,
    hasDateRangeFilter,
    selectedDeviceId,
  ]);

  useEffect(() => {
    if (!isErrorModalOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeErrorModal();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isErrorModalOpen]);

  useEffect(() => {
    if (!isErrorModalOpen) return;

    setErrorToastProgress(100);
    const frameId = requestAnimationFrame(() => setErrorToastProgress(0));
    const timeoutId = setTimeout(closeErrorModal, ERROR_TOAST_DURATION_MS);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
    };
  }, [isErrorModalOpen]);

  const filteredHistory = useMemo(() => {
    if (!hasVariableFilter) return [];
    return [...historyItems].sort((a, b) => b.time - a.time);
  }, [historyItems, hasVariableFilter]);

  const chartSeries = useMemo(() => {
    if (!hasVariableFilter || historyItems.length === 0) return [];

    const sorted = [...historyItems].sort((a, b) => a.time - b.time);
    return [
      {
        name: getVariableLabel(filters.query),
        data: sorted.map((item) => ({ x: item.time, y: item.value })),
      },
    ];
  }, [filters.query, hasVariableFilter, historyItems]);

  const periodStats = useMemo(() => {
    if (!hasVariableFilter || filteredHistory.length === 0) return null;

    const [first] = filteredHistory;
    let maxItem = first;
    let minItem = first;
    let sum = 0;

    filteredHistory.forEach((item) => {
      sum += item.value;
      if (item.value > maxItem.value) maxItem = item;
      if (item.value < minItem.value) minItem = item;
    });

    return {
      maxItem,
      minItem,
      sum,
      avg: sum / filteredHistory.length,
      unit: first.unit,
    };
  }, [filteredHistory, hasVariableFilter]);

  const globalStats = useMemo(() => {
    if (!hasVariableFilter || hasDateRangeFilter) return null;

    const globalMin = toRecord(latestState?.globalMin);
    const globalMax = toRecord(latestState?.globalMax);
    const globalMinTime = toRecord(latestState?.globalMinTime);
    const globalMaxTime = toRecord(latestState?.globalMaxTime);
    const globalSum = toRecord(latestState?.globalSum);
    const globalAvg = toRecord(latestState?.globalAvg);
    const key = filters.query;

    const minValue = toFiniteNumber(globalMin[key]);
    const maxValue = toFiniteNumber(globalMax[key]);
    const minTimestamp = toFiniteNumber(globalMinTime[key]);
    const maxTimestamp = toFiniteNumber(globalMaxTime[key]);
    const sumValue = toFiniteNumber(globalSum[key]);
    const avgValue = toFiniteNumber(globalAvg[key]);

    if (minValue == null && maxValue == null && sumValue == null && avgValue == null) {
      return null;
    }

    return {
      minValue,
      maxValue,
      minTimestamp,
      maxTimestamp,
      sumValue,
      avgValue,
      unit: getVariableUnit(key),
    };
  }, [filters.query, hasDateRangeFilter, hasVariableFilter, latestState]);

  const formatValue = (value: number, unit: string) => {
    return formatMeasurementValue(value, unit, { withSpace: true });
  };

  const formatMaybeValue = (value: number | null | undefined, unit: string) => {
    if (value == null) return "--";
    return formatValue(value, unit);
  };

  return (
    <HistoricoContainer>
      <div className="border-b border-stroke pb-6 dark:border-dark-3">
        <div
          data-historico-filters
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12"
        >
          <div
            className="relative xl:col-span-4"
            onFocus={() => setIsSuggestionsOpen(true)}
            onBlur={() => setIsSuggestionsOpen(false)}
            onKeyDown={handleSearchKeyDown}
          >
            <InputGroup
              label="Pesquisar variavel"
              type="search"
              placeholder="Buscar por variavel"
              value={searchTerm}
              handleChange={handleSearchChange}
              icon={<SearchIcon className="text-dark-4 dark:text-dark-6" />}
              iconPosition="left"
            />

            {showSuggestions && (
              <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-lg border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark">
                <ul className="max-h-48 overflow-y-auto py-2 text-sm">
                  {suggestions.map((option) => (
                    <li key={option.value}>
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={(event) => {
                          setSearchTerm(option.label);
                          setIsSuggestionsOpen(false);
                          (event.currentTarget as HTMLElement)
                            .closest("[data-historico-filters]")
                            ?.querySelector<HTMLInputElement>("input[type='search']")
                            ?.blur();
                        }}
                        className={cn(
                          "w-full px-4 py-2 text-left text-dark hover:bg-gray-100 dark:text-white dark:hover:bg-dark-2",
                          option.label.toLowerCase() === searchTerm.trim().toLowerCase() &&
                            "bg-gray-100 dark:bg-dark-2",
                        )}
                      >
                        {option.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="xl:col-span-2">
            <InputGroup
              label="Data inicial"
              type="date"
              placeholder="AAAA-MM-DD"
              required
              value={startDateInput}
              handleChange={(event) => {
                setStartDateInput(event.target.value);
                if (isErrorModalOpen) closeErrorModal();
              }}
            />
          </div>

          <div className="xl:col-span-2">
            <InputGroup
              label="Data final"
              type="date"
              placeholder="AAAA-MM-DD"
              required
              value={endDateInput}
              handleChange={(event) => {
                setEndDateInput(event.target.value);
                if (isErrorModalOpen) closeErrorModal();
              }}
            />
          </div>

          <div className="flex items-end gap-4 xl:col-span-4">
            <button
              type="button"
              onClick={handleSearchButtonClick}
              className="h-[46px] flex-1 rounded-lg bg-primary px-6 font-medium text-white hover:bg-opacity-90"
            >
              Pesquisar
            </button>

            <button
              type="button"
              onClick={handleGlobalSearchButtonClick}
              className="inline-flex size-[46px] shrink-0 items-center justify-center rounded-lg bg-primary text-lg text-white transition hover:bg-opacity-90"
              aria-label="Pesquisa global"
              title="Pesquisa global"
            >
              <FontAwesomeIcon icon={byPrefixAndName.far.globe} />
            </button>

            <button
              type="button"
              onClick={handleResetGlobalStatsClick}
              disabled={isResettingGlobals || !latestState}
              className={cn(
                "inline-flex size-[46px] shrink-0 items-center justify-center rounded-lg text-lg font-bold text-white transition",
                isResettingGlobals || !latestState
                  ? "cursor-not-allowed bg-[#D9A5A5]"
                  : "bg-[#C24141] hover:bg-[#A83434]",
              )}
              aria-label="Apagar valores globais"
              title="Apagar valores globais"
            >
              X
            </button>
          </div>
        </div>
      </div>

      <div
        key={resultsKey}
        className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-1 duration-500"
      >
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-[10px] border border-stroke bg-gray-2 p-4 dark:border-dark-3 dark:bg-dark-2/60 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-dark dark:text-white">
                Grafico do periodo
              </h2>
            </div>

            {!hasVariableFilter ? (
              <div className="flex h-[310px] items-center justify-center text-sm text-dark-5 dark:text-dark-6">
                Selecione uma variavel para ver o historico.
              </div>
            ) : isLoading ? (
              <div className="flex h-[310px] items-center justify-center text-sm text-dark-5 dark:text-dark-6">
                Carregando dados...
              </div>
            ) : !hasDateRangeFilter ? (
              <div className="flex h-[310px] items-center justify-center text-sm text-dark-5 dark:text-dark-6">
                Preencha as datas para visualizar o grafico do periodo.
              </div>
            ) : chartSeries.length === 0 ? (
              <div className="flex h-[310px] items-center justify-center text-sm text-dark-5 dark:text-dark-6">
                Sem dados para o periodo selecionado.
              </div>
            ) : (
              <PaymentsOverviewChart
                series={chartSeries}
                yUnit={getVariableUnit(filters.query)}
              />
            )}
          </div>

          <div className="rounded-[10px] border border-stroke bg-gray-2 p-4 dark:border-dark-3 dark:bg-dark-2/60 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-dark dark:text-white">
                Tabela do periodo
              </h2>
            </div>

            <Table wrapperClassName="max-h-[300px] overflow-y-auto">
              <TableHeader>
                <TableRow className="border-none [&>th]:py-3 [&>th]:text-sm [&>th]:font-medium [&>th]:text-dark [&>th]:dark:text-white">
                  <TableHead className="sticky top-0 z-10 min-w-[160px] bg-[#F7F9FC] dark:bg-dark-2">
                    Variavel
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 min-w-[140px] bg-[#F7F9FC] dark:bg-dark-2">
                    Valor
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 min-w-[180px] bg-[#F7F9FC] dark:bg-dark-2">
                    Horario
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!hasVariableFilter ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-6 text-center text-dark-5 dark:text-dark-6">
                      Selecione uma variavel para pesquisar.
                    </TableCell>
                  </TableRow>
                ) : isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-6 text-center text-dark-5 dark:text-dark-6">
                      Carregando dados...
                    </TableCell>
                  </TableRow>
                ) : !hasDateRangeFilter ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-6 text-center text-dark-5 dark:text-dark-6">
                      Preencha as datas para listar os dados do periodo.
                    </TableCell>
                  </TableRow>
                ) : filteredHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-6 text-center text-dark-5 dark:text-dark-6">
                      Nenhum dado encontrado para o periodo.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHistory.map((item) => {
                    const isMax = periodStats?.maxItem.id === item.id;
                    const isMin = periodStats?.minItem.id === item.id;
                    const highlightClass =
                      isMax && isMin
                        ? "bg-[#EAF6FF] dark:bg-[#1D2B3A]/70"
                        : isMax
                          ? "bg-[#E7F7EE] dark:bg-[#153326]/70"
                          : isMin
                            ? "bg-[#FDECEC] dark:bg-[#3A1B1B]/70"
                            : "";

                    return (
                      <TableRow
                        key={item.id}
                        className={cn("border-[#eee] dark:border-dark-3", highlightClass)}
                      >
                        <TableCell>
                          <span className="font-medium text-dark dark:text-white">
                            {item.variableName}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-dark dark:text-white">
                            {item.value} {item.unit}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-dark dark:text-white">
                            {dayjs(item.time).format("YYYY-MM-DD HH:mm")}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[10px] border border-stroke bg-gray-2 p-4 dark:border-dark-3 dark:bg-dark-2/60">
            <p className="text-sm font-medium text-dark-5 dark:text-dark-6">Maior valor</p>
            <p className="mt-2 text-xl font-bold text-dark dark:text-white">
              {hasDateRangeFilter
                ? periodStats
                  ? formatValue(periodStats.maxItem.value, periodStats.unit)
                  : "--"
                : formatMaybeValue(globalStats?.maxValue, globalStats?.unit ?? getVariableUnit(filters.query))}
            </p>
            <p className="mt-2 text-xs text-dark-5 dark:text-dark-6">
              {hasDateRangeFilter
                ? `Data: ${periodStats ? dayjs(periodStats.maxItem.time).format("YYYY-MM-DD HH:mm") : "--"}`
                : `Data: ${formatMaybeTimestamp(globalStats?.maxTimestamp)}`}
            </p>
          </div>

          <div className="rounded-[10px] border border-stroke bg-gray-2 p-4 dark:border-dark-3 dark:bg-dark-2/60">
            <p className="text-sm font-medium text-dark-5 dark:text-dark-6">Menor valor</p>
            <p className="mt-2 text-xl font-bold text-dark dark:text-white">
              {hasDateRangeFilter
                ? periodStats
                  ? formatValue(periodStats.minItem.value, periodStats.unit)
                  : "--"
                : formatMaybeValue(globalStats?.minValue, globalStats?.unit ?? getVariableUnit(filters.query))}
            </p>
            <p className="mt-2 text-xs text-dark-5 dark:text-dark-6">
              {hasDateRangeFilter
                ? `Data: ${periodStats ? dayjs(periodStats.minItem.time).format("YYYY-MM-DD HH:mm") : "--"}`
                : `Data: ${formatMaybeTimestamp(globalStats?.minTimestamp)}`}
            </p>
          </div>

          <div className="rounded-[10px] border border-stroke bg-gray-2 p-4 dark:border-dark-3 dark:bg-dark-2/60">
            <p className="text-sm font-medium text-dark-5 dark:text-dark-6">Total acumulado</p>
            <p className="mt-2 text-xl font-bold text-dark dark:text-white">
              {hasDateRangeFilter
                ? periodStats
                  ? formatValue(periodStats.sum, periodStats.unit)
                  : "--"
                : formatMaybeValue(globalStats?.sumValue, globalStats?.unit ?? getVariableUnit(filters.query))}
            </p>
            <p className="mt-2 text-xs text-dark-5 dark:text-dark-6">
              {hasDateRangeFilter ? "Periodo selecionado" : "Global (sem periodo)"}
            </p>
          </div>

          <div className="rounded-[10px] border border-stroke bg-gray-2 p-4 dark:border-dark-3 dark:bg-dark-2/60">
            <p className="text-sm font-medium text-dark-5 dark:text-dark-6">Media</p>
            <p className="mt-2 text-xl font-bold text-dark dark:text-white">
              {hasDateRangeFilter
                ? periodStats
                  ? formatValue(periodStats.avg, periodStats.unit)
                  : "--"
                : formatMaybeValue(globalStats?.avgValue, globalStats?.unit ?? getVariableUnit(filters.query))}
            </p>
            <p className="mt-2 text-xs text-dark-5 dark:text-dark-6">
              {hasDateRangeFilter ? "Periodo selecionado" : "Global (sem periodo)"}
            </p>
          </div>
        </div>
      </div>

      {isErrorModalOpen ? (
        <div className="fixed bottom-4 right-4 z-[999] w-[min(92vw,320px)]">
          <div
            role="alertdialog"
            aria-labelledby="historico-modal-title"
            className="rounded-xl border border-[#F3B5B5] bg-[#FFF1F1] p-3.5 shadow-1 dark:border-[#7A2A2A] dark:bg-[#2A1212]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3
                  id="historico-modal-title"
                  className="text-sm font-semibold text-[#7A1212] dark:text-[#FFB3B3]"
                >
                  Pesquisa invalida
                </h3>
                <p className="mt-1 text-xs text-[#8D2C2C] dark:text-[#FFCACA]">
                  {errorModalMessage}
                </p>
              </div>
              <button
                type="button"
                onClick={closeErrorModal}
                className="inline-flex size-6 shrink-0 items-center justify-center rounded-md border border-[#E3A0A0] bg-[#FFD9D9] text-sm font-bold text-[#8D2C2C] hover:bg-[#FECACA] dark:border-[#8D3A3A] dark:bg-[#3A1D1D] dark:text-[#FFB3B3]"
                aria-label="Fechar aviso"
              >
                X
              </button>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#F8CACA] dark:bg-[#4A2323]">
              <div
                className="h-full rounded-full bg-[#D74848] transition-[width] ease-linear dark:bg-[#F47A7A]"
                style={{
                  width: `${errorToastProgress}%`,
                  transitionDuration: `${ERROR_TOAST_DURATION_MS}ms`,
                }}
              />
            </div>
          </div>
        </div>
      ) : null}

      {isResetConfirmOpen ? (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-dark/70 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="historico-reset-title"
            className="w-full max-w-md rounded-xl border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3
                  id="historico-reset-title"
                  className="text-lg font-semibold text-dark dark:text-white"
                >
                  Apagar valores globais?
                </h3>
                <p className="mt-2 text-sm text-dark-5 dark:text-dark-6">
                  Esta acao limpa minimos, maximos, total acumulado e media globais do
                  dispositivo selecionado.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                disabled={isResettingGlobals}
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-stroke text-sm font-bold text-dark transition hover:bg-gray-2 disabled:cursor-not-allowed dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
                aria-label="Fechar confirmacao"
              >
                X
              </button>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                disabled={isResettingGlobals}
                className="inline-flex h-[44px] items-center justify-center rounded-lg border border-stroke px-4 text-sm font-medium text-dark transition hover:bg-gray-2 disabled:cursor-not-allowed dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleResetGlobalStatsConfirm}
                disabled={isResettingGlobals}
                className={cn(
                  "inline-flex h-[44px] items-center justify-center rounded-lg px-4 text-sm font-medium text-white transition",
                  isResettingGlobals
                    ? "cursor-not-allowed bg-[#D9A5A5]"
                    : "bg-[#C24141] hover:bg-[#A83434]",
                )}
              >
                {isResettingGlobals ? "Apagando..." : "Apagar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </HistoricoContainer>
  );
}
