"use client";

import { SearchIcon } from "@/assets/icons";
import InputGroup from "@/components/FormElements/InputGroup";
import { PaymentsOverviewChart } from "@/components/Charts/payments-overview/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDataForGraph } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { HistoricoContainer } from "./historico-container";
import { useFirebaseData } from "@/contexts/firebase-data-context";

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
  fpa: "Fator de potência A",
  fpb: "Fator de potência B",
  fpc: "Fator de potência C",
  fpt: "Fator de potência total",
  f: "Frequência",
  t: "Temperatura",
  Ea: "Energia A",
  Eb: "Energia B",
  Ec: "Energia C",
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
  fpa: "",
  fpb: "",
  fpc: "",
  fpt: "",
  f: "Hz",
  t: "°C",
  Ea: "kWh",
  Eb: "kWh",
  Ec: "kWh",
  angVa: "°",
  angVb: "°",
  angVc: "°",
  angIa: "°",
  angIb: "°",
  angIc: "°",
};

const getVariableLabel = (key: string) => VARIABLE_LABELS[key] ?? key;
const getVariableUnit = (key: string) => VARIABLE_UNITS[key] ?? "";
const parseDateInput = (value: string) => {
  if (!value) {
    return undefined;
  }

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
  const { data } = useFirebaseData();
  const [searchTerm, setSearchTerm] = useState("");
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [resultsKey, setResultsKey] = useState(0);
  const [historyItems, setHistoryItems] = useState<HistoricoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const hasVariableFilter = filters.query.trim().length > 0;

  const variableOptions = useMemo<VariableOption[]>(() => {
    if (!data) {
      return [];
    }

    return Object.keys(data)
      .filter((key) => key !== "createdAt" && key !== "id")
      .map((key) => ({ value: key, label: getVariableLabel(key) }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
  }, [data]);

  const suggestions = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();
    if (!normalizedQuery) {
      return variableOptions;
    }

    return variableOptions.filter((option) =>
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSuggestionsOpen(false);
    applyFilters();
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    setIsSuggestionsOpen(value.trim().length > 0);
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter") {
      return;
    }

    (event.target as HTMLElement | null)?.blur();

    if (suggestions.length > 0) {
      event.preventDefault();
      const selected = suggestions[0];
      setSearchTerm(selected.label);
      setIsSuggestionsOpen(false);
      applyFilters(selected.value, selected.label);
    }
  };

  useEffect(() => {
    if (!filters.query) {
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
    );

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [filters.query, filters.startDate, filters.endDate]);

  const filteredHistory = useMemo(() => {
    if (!hasVariableFilter) {
      return [];
    }

    return [...historyItems].sort((a, b) => b.time - a.time);
  }, [historyItems, hasVariableFilter]);

  const chartSeries = useMemo(() => {
    if (!hasVariableFilter || historyItems.length === 0) {
      return [];
    }

    const sorted = [...historyItems].sort((a, b) => a.time - b.time);

    return [
      {
        name: getVariableLabel(filters.query),
        data: sorted.map((item) => ({ x: item.time, y: item.value })),
      },
    ];
  }, [filters.query, hasVariableFilter, historyItems]);

  const stats = useMemo(() => {
    if (!hasVariableFilter || filteredHistory.length === 0) {
      return null;
    }

    const [first] = filteredHistory;
    let maxItem = first;
    let minItem = first;
    let sum = 0;

    filteredHistory.forEach((item) => {
      sum += item.value;
      if (item.value > maxItem.value) {
        maxItem = item;
      }
      if (item.value < minItem.value) {
        minItem = item;
      }
    });

    return {
      maxItem,
      minItem,
      sum,
      avg: sum / filteredHistory.length,
      unit: first.unit,
    };
  }, [filteredHistory, hasVariableFilter]);

  const formatValue = (value: number, unit: string) => {
    const formatted = value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return unit ? `${formatted} ${unit}` : formatted;
  };

  return (
    <HistoricoContainer>
      <div className="border-b border-stroke pb-6 dark:border-dark-3">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5"
        >
          <div
            className="relative xl:col-span-2"
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
                          applyFilters(option.value, option.label);
                          (event.currentTarget as HTMLElement)
                            .closest("form")
                            ?.querySelector<HTMLInputElement>(
                              "input[type='search']",
                            )
                            ?.blur();
                        }}
                        className={cn(
                          "w-full px-4 py-2 text-left text-dark hover:bg-gray-100 dark:text-white dark:hover:bg-dark-2",
                          option.label.toLowerCase() ===
                            searchTerm.trim().toLowerCase() &&
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

          <InputGroup
            label="Data inicial"
            type="date"
            placeholder="AAAA-MM-DD"
            value={startDateInput}
            handleChange={(event) => setStartDateInput(event.target.value)}
          />

          <InputGroup
            label="Data final"
            type="date"
            placeholder="AAAA-MM-DD"
            value={endDateInput}
            handleChange={(event) => setEndDateInput(event.target.value)}
          />

          <div className="flex items-end">
            <button
              type="submit"
              className="h-[46px] w-full rounded-lg bg-primary px-6 font-medium text-white hover:bg-opacity-90"
            >
              Pesquisar
            </button>
          </div>
        </form>
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
            ) : chartSeries.length === 0 ? (
              <div className="flex h-[310px] items-center justify-center text-sm text-dark-5 dark:text-dark-6">
                Sem dados para o periodo selecionado.
              </div>
            ) : (
              <PaymentsOverviewChart series={chartSeries} />
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
                    <TableCell
                      colSpan={3}
                      className="py-6 text-center text-dark-5 dark:text-dark-6"
                    >
                      Selecione uma variavel para pesquisar.
                    </TableCell>
                  </TableRow>
                ) : isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="py-6 text-center text-dark-5 dark:text-dark-6"
                    >
                      Carregando dados...
                    </TableCell>
                  </TableRow>
                ) : filteredHistory.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="py-6 text-center text-dark-5 dark:text-dark-6"
                    >
                      Nenhum dado encontrado para o periodo.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHistory.map((item) => {
                    const isMax = stats?.maxItem.id === item.id;
                    const isMin = stats?.minItem.id === item.id;
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
                        className={cn(
                          "border-[#eee] dark:border-dark-3",
                          highlightClass,
                        )}
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
            <p className="text-sm font-medium text-dark-5 dark:text-dark-6">
              Maior valor
            </p>
            <p className="mt-2 text-xl font-bold text-dark dark:text-white">
              {stats ? formatValue(stats.maxItem.value, stats.unit) : "--"}
            </p>
            <p className="mt-2 text-xs text-dark-5 dark:text-dark-6">
              Data: {stats ? dayjs(stats.maxItem.time).format("YYYY-MM-DD HH:mm") : "--"}
            </p>
          </div>

          <div className="rounded-[10px] border border-stroke bg-gray-2 p-4 dark:border-dark-3 dark:bg-dark-2/60">
            <p className="text-sm font-medium text-dark-5 dark:text-dark-6">
              Menor valor
            </p>
            <p className="mt-2 text-xl font-bold text-dark dark:text-white">
              {stats ? formatValue(stats.minItem.value, stats.unit) : "--"}
            </p>
            <p className="mt-2 text-xs text-dark-5 dark:text-dark-6">
              Data: {stats ? dayjs(stats.minItem.time).format("YYYY-MM-DD HH:mm") : "--"}
            </p>
          </div>

          <div className="rounded-[10px] border border-stroke bg-gray-2 p-4 dark:border-dark-3 dark:bg-dark-2/60">
            <p className="text-sm font-medium text-dark-5 dark:text-dark-6">
              Total acumulado
            </p>
            <p className="mt-2 text-xl font-bold text-dark dark:text-white">
              {stats ? formatValue(stats.sum, stats.unit) : "--"}
            </p>
            <p className="mt-2 text-xs text-dark-5 dark:text-dark-6">
              Periodo selecionado
            </p>
          </div>

          <div className="rounded-[10px] border border-stroke bg-gray-2 p-4 dark:border-dark-3 dark:bg-dark-2/60">
            <p className="text-sm font-medium text-dark-5 dark:text-dark-6">
              Media
            </p>
            <p className="mt-2 text-xl font-bold text-dark dark:text-white">
              {stats ? formatValue(stats.avg, stats.unit) : "--"}
            </p>
            <p className="mt-2 text-xs text-dark-5 dark:text-dark-6">
              Periodo selecionado
            </p>
          </div>
        </div>
      </div>
    </HistoricoContainer>
  );
}
