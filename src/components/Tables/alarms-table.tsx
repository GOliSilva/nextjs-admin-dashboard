"use client";

import { SearchIcon } from "@/assets/icons";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import alarmsData from "@/data/alarms.json";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { useMemo, useState } from "react";

type Priority = "low" | "medium" | "high";
type PriorityFilter = Priority | "all";

type Alarm = {
  id: number;
  variableName: string;
  value: string;
  description: string;
  time: string;
  priority: Priority;
};

const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

const PRIORITY_STYLES: Record<Priority, string> = {
  low: "text-[#F2C94C]",
  medium: "text-[#F2994A]",
  high: "text-[#EB5757]",
};

const PRIORITY_OPTIONS = [
  { value: "all", label: "Todas as prioridades" },
  { value: "low", label: "Baixa (Amarelo)" },
  { value: "medium", label: "Média (Laranja)" },
  { value: "high", label: "Alta (Vermelho)" },
];

export function AlarmsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState<PriorityFilter>("all");
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  const variableOptions = useMemo(() => {
    const unique = new Set<string>();
    (alarmsData as Alarm[]).forEach((alarm) => {
      unique.add(alarm.variableName);
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

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    setIsSuggestionsOpen(value.trim().length > 0);
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter") {
      return;
    }

    if (suggestions.length > 0) {
      event.preventDefault();
      setSearchTerm(suggestions[0]);
    }

    setIsSuggestionsOpen(false);
  };

  const filteredAlarms = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();
    const startBoundary = startDate ? new Date(startDate) : null;
    const endBoundary = endDate ? new Date(endDate) : null;

    if (endBoundary) {
      endBoundary.setHours(23, 59, 59, 999);
    }

    return (alarmsData as Alarm[]).filter((alarm) => {
      const matchesSearch =
        !normalizedQuery ||
        [alarm.variableName, alarm.value, alarm.description].some((field) =>
          field.toLowerCase().includes(normalizedQuery),
        );

      const matchesPriority =
        priority === "all" || alarm.priority === priority;

      const alarmDate = new Date(alarm.time);
      const matchesStart = !startBoundary || alarmDate >= startBoundary;
      const matchesEnd = !endBoundary || alarmDate <= endBoundary;

      return matchesSearch && matchesPriority && matchesStart && matchesEnd;
    });
  }, [searchTerm, startDate, endDate, priority]);

  return (
    <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div
          className="relative"
          onFocus={() => {
            if (searchTerm.trim().length > 0) {
              setIsSuggestionsOpen(true);
            }
          }}
          onBlur={() => setIsSuggestionsOpen(false)}
          onKeyDown={handleSearchKeyDown}
        >
          <InputGroup
            label="Pesquisar alarmes"
            type="search"
            placeholder="Buscar por variável, valor ou descrição"
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
                      onClick={() => {
                        setSearchTerm(name);
                        setIsSuggestionsOpen(false);
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
          value={startDate}
          handleChange={(event) => setStartDate(event.target.value)}
        />

        <InputGroup
          label="Data final"
          type="date"
          placeholder="AAAA-MM-DD"
          value={endDate}
          handleChange={(event) => setEndDate(event.target.value)}
        />

        <Select
          label="Prioridade"
          items={PRIORITY_OPTIONS}
          value={priority}
          onChange={(value) => setPriority(value as PriorityFilter)}
        />
      </div>

      <div className="mt-6">
        <Table wrapperClassName="max-h-[520px] overflow-y-auto">
          <TableHeader>
            <TableRow className="border-none [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
              <TableHead className="sticky top-0 z-10 min-w-[180px] bg-[#F7F9FC] xl:pl-7.5 dark:bg-dark-2">
                Variável
              </TableHead>
              <TableHead className="sticky top-0 z-10 min-w-[120px] bg-[#F7F9FC] dark:bg-dark-2">
                Valor
              </TableHead>
              <TableHead className="sticky top-0 z-10 bg-[#F7F9FC] dark:bg-dark-2">
                Descrição
              </TableHead>
              <TableHead className="sticky top-0 z-10 min-w-[170px] bg-[#F7F9FC] dark:bg-dark-2">
                Horário
              </TableHead>
              <TableHead className="sticky top-0 z-10 min-w-[120px] bg-[#F7F9FC] text-left xl:pr-7.5 dark:bg-dark-2">
                Prioridade
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredAlarms.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-dark-5 dark:text-dark-6"
                >
                  Nenhum alarme corresponde aos filtros selecionados.
                </TableCell>
              </TableRow>
            ) : (
              filteredAlarms.map((alarm) => (
                <TableRow
                  key={alarm.id}
                  className="border-[#eee] dark:border-dark-3"
                >
                  <TableCell className="xl:pl-7.5">
                    <p className="font-medium text-dark dark:text-white">
                      {alarm.variableName}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-dark dark:text-white">{alarm.value}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-dark dark:text-white">
                      {alarm.description}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-dark dark:text-white">
                      {dayjs(alarm.time).format("MMM DD, YYYY HH:mm")}
                    </p>
                  </TableCell>
                  <TableCell className="xl:pr-7.5">
                    <span
                      className={cn(
                        "font-medium",
                        PRIORITY_STYLES[alarm.priority],
                      )}
                    >
                      {PRIORITY_LABELS[alarm.priority]}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
