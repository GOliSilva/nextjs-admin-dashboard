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
import correnteData from "@/data/historico/corrente.json";
import correnteNeutroData from "@/data/historico/correnteNeutro.json";
import fatorPotenciaData from "@/data/historico/fator_potencia.json";
import temperaturaData from "@/data/historico/temperatura.json";
import tensaoData from "@/data/historico/tensao.json";
import historicoVariaveis from "@/data/historico-variaveis.json";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { useMemo, useState } from "react";

type HistoricoItem = {
  id: number;
  variableName: string;
  value: number;
  unit: string;
  time: string;
};

type VariableItem = {
  id: number;
  variableName: string;
};

type Filters = {
  query: string;
  startDate: string;
  endDate: string;
};

const emptyFilters: Filters = {
  query: "",
  startDate: "",
  endDate: "",
};

const historicoData: HistoricoItem[] = [
  ...(correnteData as HistoricoItem[]),
  ...(tensaoData as HistoricoItem[]),
  ...(fatorPotenciaData as HistoricoItem[]),
  ...(correnteNeutroData as HistoricoItem[]),
  ...(temperaturaData as HistoricoItem[]),
];

export function HistoricoView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const hasVariableFilter = filters.query.trim().length > 0;

  const variableOptions = useMemo(() => {
    const unique = new Set<string>();
    (historicoVariaveis as VariableItem[]).forEach((item) => {
      unique.add(item.variableName);
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, []);

  const suggestions = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();
    if (!normalizedQuery) {
      return [];
    }

    return variableOptions
      .filter((name) => name.toLowerCase().includes(normalizedQuery))
      .slice(0, 6);
  }, [searchTerm, variableOptions]);

  const showSuggestions = isSuggestionsOpen && suggestions.length > 0;

  const applyFilters = (queryOverride?: string) => {
    setFilters({
      query: (queryOverride ?? searchTerm).trim(),
      startDate: startDateInput,
      endDate: endDateInput,
    });
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
      setSearchTerm(selected);
      setIsSuggestionsOpen(false);
      applyFilters(selected);
    }
  };

  const filteredHistory = useMemo(() => {
    const normalizedQuery = filters.query.trim().toLowerCase();
    if (!normalizedQuery) {
      return [];
    }
    const startBoundary = filters.startDate ? new Date(filters.startDate) : null;
    const endBoundary = filters.endDate ? new Date(filters.endDate) : null;

    if (endBoundary) {
      endBoundary.setHours(23, 59, 59, 999);
    }

    return (historicoData as HistoricoItem[])
      .filter((item) => {
        const matchesQuery =
          item.variableName.toLowerCase() === normalizedQuery;
        const itemDate = new Date(item.time);
        const matchesStart = !startBoundary || itemDate >= startBoundary;
        const matchesEnd = !endBoundary || itemDate <= endBoundary;

        return matchesQuery && matchesStart && matchesEnd;
      })
      .sort(
        (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
      );
  }, [filters]);

  const chartSeries = useMemo(() => {
    const groups = new Map<string, { x: string; y: number }[]>();
    const sorted = [...filteredHistory].sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
    );

    sorted.forEach((item) => {
      if (!groups.has(item.variableName)) {
        groups.set(item.variableName, []);
      }

      groups.get(item.variableName)?.push({
        x: dayjs(item.time).format("MM/DD"),
        y: item.value,
      });
    });

    return Array.from(groups.entries()).map(([name, data]) => ({
      name,
      data,
    }));
  }, [filteredHistory]);

  return (
    <div className="space-y-6">
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
                {suggestions.map((name) => (
                  <li key={name}>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={(event) => {
                        setSearchTerm(name);
                        setIsSuggestionsOpen(false);
                        applyFilters(name);
                        (event.currentTarget as HTMLElement)
                          .closest("form")
                          ?.querySelector<HTMLInputElement>("input[type='search']")
                          ?.blur();
                      }}
                      className={cn(
                        "w-full px-4 py-2 text-left text-dark hover:bg-gray-100 dark:text-white dark:hover:bg-dark-2",
                        name.toLowerCase() === searchTerm.trim().toLowerCase() &&
                          "bg-gray-100 dark:bg-dark-2",
                      )}
                    >
                      {name}
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-dark dark:text-white">
              Grafico do periodo
            </h2>
          </div>

          {!hasVariableFilter ? (
            <div className="flex h-[310px] items-center justify-center text-sm text-dark-5 dark:text-dark-6">
              Selecione uma variavel para ver o historico.
            </div>
          ) : chartSeries.length === 0 ? (
            <div className="flex h-[310px] items-center justify-center text-sm text-dark-5 dark:text-dark-6">
              Sem dados para o periodo selecionado.
            </div>
          ) : (
            <PaymentsOverviewChart series={chartSeries} />
          )}
        </div>

        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-dark dark:text-white">
              Tabela do periodo
            </h2>
          </div>

          <Table wrapperClassName="max-h-[420px] overflow-y-auto">
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
                filteredHistory.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-[#eee] dark:border-dark-3"
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
