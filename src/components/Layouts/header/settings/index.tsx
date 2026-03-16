"use client";

import { useDeviceSelection } from "@/contexts/device-selection-context";
import { getLatestStateData, savePeakHoursSettings } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { SettingsIcon } from "../user-info/icons";

const isValidTimeValue = (value: unknown): value is string => {
  return typeof value === "string" && /^\d{2}:\d{2}$/.test(value);
};

export function HeaderSettings() {
  const { selectedDeviceId } = useDeviceSelection();
  const [isOpen, setIsOpen] = useState(false);
  const [inicioPonta, setInicioPonta] = useState("");
  const [fimPonta, setFimPonta] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const unsubscribe = getLatestStateData((latestState: Record<string, unknown> | null) => {
      setInicioPonta(isValidTimeValue(latestState?.inicioPonta) ? latestState.inicioPonta : "");
      setFimPonta(isValidTimeValue(latestState?.fimPonta) ? latestState.fimPonta : "");
    }, selectedDeviceId);

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [selectedDeviceId]);

  const handleOpen = () => {
    setErrorMessage("");
    setIsOpen(true);
  };

  const handleClose = () => {
    if (isSaving) return;
    setErrorMessage("");
    setIsOpen(false);
  };

  const handleSave = async () => {
    if (!inicioPonta || !fimPonta) {
      setErrorMessage("Preencha inicio e fim da ponta.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      await savePeakHoursSettings(
        {
          inicioPonta,
          fimPonta,
        },
        selectedDeviceId,
      );
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      setErrorMessage("Nao foi possivel salvar os horarios de ponta.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="grid size-12 place-items-center rounded-full border bg-gray-2 text-dark outline-none hover:text-primary focus-visible:border-primary focus-visible:text-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:focus-visible:border-primary"
        aria-label="Configurar horario de ponta"
        title="Configurar horario de ponta"
      >
        <SettingsIcon />
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-dark/70 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="peak-hours-title"
            className="w-full max-w-md rounded-xl border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3
                  id="peak-hours-title"
                  className="text-lg font-semibold text-dark dark:text-white"
                >
                  Configuracoes de ponta
                </h3>
                <p className="mt-2 text-sm text-dark-5 dark:text-dark-6">
                  Defina os horarios de inicio e fim da ponta para o dispositivo atual.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSaving}
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-stroke text-sm font-bold text-dark transition hover:bg-gray-2 disabled:cursor-not-allowed dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
                aria-label="Fechar configuracoes"
              >
                X
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="inicio-ponta-hora"
                  className="mb-1.5 block text-sm font-medium text-dark dark:text-white"
                >
                  Inicio da ponta
                </label>
                <input
                  id="inicio-ponta-hora"
                  type="time"
                  value={inicioPonta}
                  onChange={(event) => setInicioPonta(event.target.value)}
                  className="h-11 w-full rounded-lg border border-stroke bg-transparent px-4 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="fim-ponta-hora"
                  className="mb-1.5 block text-sm font-medium text-dark dark:text-white"
                >
                  Fim da ponta
                </label>
                <input
                  id="fim-ponta-hora"
                  type="time"
                  value={fimPonta}
                  onChange={(event) => setFimPonta(event.target.value)}
                  className="h-11 w-full rounded-lg border border-stroke bg-transparent px-4 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                />
              </div>

              {errorMessage ? (
                <div
                  className={cn(
                    "rounded-lg border border-[#F3B5B5] bg-[#FFF1F1] px-3 py-2 text-sm text-[#8D2C2C]",
                    "dark:border-[#7A2A2A] dark:bg-[#2A1212] dark:text-[#FFCACA]",
                  )}
                >
                  {errorMessage}
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSaving}
                className="inline-flex h-[44px] items-center justify-center rounded-lg border border-stroke px-4 text-sm font-medium text-dark transition hover:bg-gray-2 disabled:cursor-not-allowed dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className={cn(
                  "inline-flex h-[44px] items-center justify-center rounded-lg px-4 text-sm font-medium text-white transition",
                  isSaving
                    ? "cursor-not-allowed bg-[#8FB4FF]"
                    : "bg-primary hover:bg-opacity-90",
                )}
              >
                {isSaving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
