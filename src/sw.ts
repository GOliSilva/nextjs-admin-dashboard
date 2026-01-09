/// <reference lib="webworker" />
import { Serwist } from "serwist";

type PrecacheEntry = {
  url: string;
  revision?: string | null;
};

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: Array<PrecacheEntry>;
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST ?? [],
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
});

serwist.addEventListeners();

const getPushPayload = (event: PushEvent) => {
  if (!event.data) {
    return null;
  }

  try {
    return event.data.json() as Record<string, unknown>;
  } catch {
    return { body: event.data.text() };
  }
};

self.addEventListener("push", (event) => {
  const payload = getPushPayload(event) ?? {};
  const title = (payload.title as string | undefined) ?? "Nova notificacao";
  const body =
    (payload.body as string | undefined) ??
    "Voce recebeu uma nova notificacao.";
  const icon =
    (payload.icon as string | undefined) ?? "/images/logo/logo-icon.svg";
  const badge =
    (payload.badge as string | undefined) ?? "/images/logo/logo-icon.svg";
  const url = (payload.url as string | undefined) ?? "/";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      data: {
        url,
        ...(payload.data as Record<string, unknown> | undefined),
      },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification.data as { url?: string } | undefined;
  const targetUrl = data?.url ?? "/";

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      const match = windows.find((client) => client.url === targetUrl);
      if (match) {
        await match.focus();
        return;
      }

      await self.clients.openWindow?.(targetUrl);
    })(),
  );
});
