"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebarContext } from "../sidebar/sidebar-context";
import { MenuIcon } from "./icons";
import { Notification } from "./notification";
import { HeaderSettings } from "./settings";
import { ThemeToggleSwitch } from "./theme-toggle";
import { NAV_DATA } from "../sidebar/data";

export function Header() {
  const { toggleSidebar } = useSidebarContext();
  const pathname = usePathname();

  const pageMeta =
    NAV_DATA.flatMap((section) => section.items)
      .flatMap((item) =>
        item.items.length ? [item, ...item.items] : [item],
      )
      .find((item) => ("url" in item ? item.url === pathname : false));

  const pageTitle = pageMeta?.title ?? "Dashboard";
  const pageDescription =
    ("description" in (pageMeta ?? {}) ? pageMeta?.description : undefined) ??
    "Next.js Admin Dashboard Solution";

  return (
    <header className="sticky top-0 z-30 border-b border-stroke bg-white px-4 py-4 shadow-1 dark:border-stroke-dark dark:bg-gray-dark md:px-5 2xl:px-10">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center">
          <button
            onClick={toggleSidebar}
            className="rounded-lg border px-1.5 py-1 dark:border-stroke-dark dark:bg-[#020D1A] hover:dark:bg-[#FFFFFF1A] lg:hidden"
          >
            <MenuIcon />
            <span className="sr-only">Toggle Sidebar</span>
          </button>

          <Link
            href={"/"}
            className="ml-2 max-[430px]:hidden min-[375px]:ml-4 min-[850px]:hidden"
          >
            <Image
              src={"/images/logo/logo-icon.svg"}
              width={32}
              height={32}
              alt=""
              role="presentation"
            />
          </Link>

          <div className="max-xl:hidden">
            <h1 className="mb-0.5 text-heading-5 font-bold text-dark dark:text-white">
              {pageTitle}
            </h1>
            <p className="font-medium">{pageDescription}</p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2 min-[375px]:gap-4">
          <ThemeToggleSwitch />
          <Notification />
          <HeaderSettings />
        </div>
      </div>

    </header>
  );
}
