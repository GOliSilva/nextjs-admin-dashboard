"use client";

import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";
import alarmsData from "@/data/alarms.json";
import dayjs from "dayjs";
import Link from "next/link";
import { useState, type SVGProps } from "react";
import { BellIcon } from "./icons";

type AlarmPriority = "low" | "medium" | "high";

type AlarmItem = {
  id: number;
  variableName: string;
  value: string;
  description: string;
  time: string;
  priority: AlarmPriority;
};

const PRIORITY_STYLES: Record<AlarmPriority, string> = {
  low: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300",
  medium:
    "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
  high: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
};

const PRIORITY_LABELS: Record<AlarmPriority, string> = {
  low: "Baixa",
  medium: "Media",
  high: "Alta",
};

type IconProps = SVGProps<SVGSVGElement>;

const ZapIcon = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
  </svg>
);

const ActivityIcon = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
  </svg>
);

const GaugeIcon = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m12 14 4-4" />
    <path d="M3.34 19a10 10 0 1 1 17.32 0" />
  </svg>
);

const PercentIcon = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="19" x2="5" y1="5" y2="19" />
    <circle cx="6.5" cy="6.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);

const WavesIcon = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
  </svg>
);

const LayersIcon = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
    <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" />
    <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />
  </svg>
);

const ThermometerIcon = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
  </svg>
);

const TriangleAlertIcon = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

const normalizeKey = (value: string) =>
  value.replace(/[\s_]/g, "").toLowerCase();

const VARIABLE_LABELS: Record<string, string> = {
  corrente: "Corrente",
  correntea: "Corrente A",
  correnteb: "Corrente B",
  correntec: "Corrente C",
  correnteneutro: "Corrente de neutro",
  tensao: "Tensao",
  tensaoa: "Tensao A",
  tensaob: "Tensao B",
  fatorpotencia: "Fator de potencia",
  fatorpotenciatotal: "Fator de potencia total",
  fatorpotenciac: "Fator de potencia C",
  potencia: "Potencia",
  potenciab: "Potencia B",
  potenciacomplexa: "Potencia complexa",
  temperatura: "Temperatura",
  dht: "DHT",
  frequencia: "Frequencia",
  frequenciac: "Frequencia C",
};

const VARIABLE_ICONS: Record<string, (props: IconProps) => JSX.Element> = {
  corrente: ActivityIcon,
  correntea: ActivityIcon,
  correnteb: ActivityIcon,
  correntec: ActivityIcon,
  correnteneutro: ActivityIcon,
  tensao: ZapIcon,
  tensaoa: ZapIcon,
  tensaob: ZapIcon,
  fatorpotencia: PercentIcon,
  fatorpotenciatotal: PercentIcon,
  fatorpotenciac: PercentIcon,
  potencia: GaugeIcon,
  potenciab: GaugeIcon,
  potenciacomplexa: LayersIcon,
  temperatura: ThermometerIcon,
  dht: WavesIcon,
  frequencia: WavesIcon,
  frequenciac: WavesIcon,
};

const getVariableLabel = (variableName: string) => {
  const key = normalizeKey(variableName);
  return VARIABLE_LABELS[key] ?? variableName;
};

const getVariableIcon = (variableName: string) => {
  const key = normalizeKey(variableName);
  return VARIABLE_ICONS[key] ?? TriangleAlertIcon;
};

export function Notification() {
  const alarmList = (alarmsData as AlarmItem[])
    .slice()
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 6);
  const unreadCount = alarmList.length;
  const [isOpen, setIsOpen] = useState(false);
  const [isDotVisible, setIsDotVisible] = useState(unreadCount > 0);

  return (
    <Dropdown
      isOpen={isOpen}
      setIsOpen={(open) => {
        setIsOpen(open);

        setIsDotVisible(false);
      }}
    >
      <DropdownTrigger
        className="grid size-12 place-items-center rounded-full border bg-gray-2 text-dark outline-none hover:text-primary focus-visible:border-primary focus-visible:text-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:focus-visible:border-primary"
        aria-label="View Notifications"
      >
        <span className="relative">
          <BellIcon />

          {isDotVisible && (
            <span
              className={cn(
                "absolute right-0 top-0 z-1 size-2 rounded-full bg-red-light ring-2 ring-gray-2 dark:ring-dark-3",
              )}
            >
              <span className="absolute inset-0 -z-1 animate-ping rounded-full bg-red-light opacity-75" />
            </span>
          )}
        </span>
      </DropdownTrigger>

      <DropdownContent
        align="end"
        className="max-h-[calc(100vh-6rem)] w-[20rem] max-w-[calc(100vw-2rem)] overflow-hidden border border-stroke bg-white px-3.5 py-3 shadow-md dark:border-dark-3 dark:bg-gray-dark"
      >
        <div className="mb-1 flex items-center justify-between px-2 py-1.5">
          <span className="text-lg font-medium text-dark dark:text-white">
            Alarmes
          </span>
          {unreadCount > 0 && (
            <span className="rounded-md bg-primary px-[9px] py-0.5 text-xs font-medium text-white">
              {unreadCount} novos
            </span>
          )}
        </div>

        <ul className="mb-3 max-h-[23rem] space-y-1.5 overflow-y-auto">
          {alarmList.map((alarm) => {
            const Icon = getVariableIcon(alarm.variableName);
            const priorityStyle = PRIORITY_STYLES[alarm.priority];
            const label = getVariableLabel(alarm.variableName);

            return (
              <li key={alarm.id} role="menuitem">
              <Link
                href="/alarms"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-4 rounded-lg px-2 py-1.5 outline-none hover:bg-gray-2 focus-visible:bg-gray-2 dark:hover:bg-dark-3 dark:focus-visible:bg-dark-3"
              >
                <span
                  className={cn(
                    "grid size-12 place-items-center rounded-full",
                    priorityStyle,
                  )}
                >
                  <Icon className="size-6" aria-hidden />
                </span>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-sm font-medium text-dark dark:text-white">
                      {label}
                    </strong>
                    <span className="rounded-full bg-gray-2 px-2 py-0.5 text-xs font-semibold text-dark-6 dark:bg-dark-3 dark:text-dark-6">
                      {alarm.value}
                    </span>
                  </div>

                  <span className="block text-sm font-medium text-dark-5 dark:text-dark-6">
                    {alarm.description}
                  </span>

                  <span className="text-xs text-dark-6 dark:text-dark-6">
                    {dayjs(alarm.time).format("DD/MM/YYYY HH:mm")} •{" "}
                    {PRIORITY_LABELS[alarm.priority]}
                  </span>
                </div>
              </Link>
            </li>
            );
          })}
        </ul>

        <Link
          href="/alarms"
          onClick={() => setIsOpen(false)}
          className="block rounded-lg border border-primary p-2 text-center text-sm font-medium tracking-wide text-primary outline-none transition-colors hover:bg-blue-light-5 focus:bg-blue-light-5 focus:text-primary focus-visible:border-primary dark:border-dark-3 dark:text-dark-6 dark:hover:border-dark-5 dark:hover:bg-dark-3 dark:hover:text-dark-7 dark:focus-visible:border-dark-5 dark:focus-visible:bg-dark-3 dark:focus-visible:text-dark-7"
        >
          Ver todos os alarmes
        </Link>
      </DropdownContent>
    </Dropdown>
  );
}
