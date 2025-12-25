"use client";

import { SearchIcon } from "@/assets/icons";
import Image from "next/image";
import Link from "next/link";
import { useSidebarContext } from "../sidebar/sidebar-context";
import { MenuIcon } from "./icons";
import { Notification } from "./notification";
import { ThemeToggleSwitch } from "./theme-toggle";
import { UserInfo } from "./user-info";

export function Header() {
  const { toggleSidebar, isMobile } = useSidebarContext();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-[rgba(14,15,48,0.75)] backdrop-blur-xl border-b border-white/10 px-4 py-5 text-[var(--dash-text)] shadow-[0_12px_32px_rgba(0,0,0,0.35)] md:px-5 2xl:px-10">
      <button
        onClick={toggleSidebar}
        className="rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface-deep)] px-1.5 py-1 text-[var(--dash-text)] hover:bg-[var(--dash-active-bg)] lg:hidden"
      >
        <MenuIcon />
        <span className="sr-only">Toggle Sidebar</span>
      </button>

      {isMobile && (
        <Link href={"/"} className="ml-2 max-[430px]:hidden min-[375px]:ml-4">
          <Image
            src={"/images/logo/logo-icon.svg"}
            width={32}
            height={32}
            alt=""
            role="presentation"
          />
        </Link>
      )}

      <div className="max-xl:hidden">
        <h1 className="mb-0.5 text-heading-5 font-bold">Dashboard</h1>
        <p className="dash-muted font-medium">
          Next.js Admin Dashboard Solution
        </p>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 min-[375px]:gap-4">
        <div className="relative w-full max-w-[300px]">
          <input
            type="search"
            placeholder="Search"
            className="flex w-full items-center gap-3.5 rounded-full border border-[var(--dash-border)] bg-[var(--dash-overlay)] py-3 pl-[53px] pr-5 text-[var(--dash-text)] outline-none transition-colors placeholder:text-[var(--dash-text-muted)] focus-visible:border-[var(--dash-ring)]"
          />

          <SearchIcon className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 max-[1015px]:size-5" />
        </div>

        <ThemeToggleSwitch />

        <Notification />

        <div className="shrink-0">
          <UserInfo />
        </div>
      </div>
    </header>
  );
}
