"use client";

import { SearchIcon } from "@/assets/icons";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSidebarContext } from "../sidebar/sidebar-context";
import { MenuIcon } from "./icons";
import { Notification } from "./notification";
import { UserInfo } from "./user-info";

export function Header() {
  const { toggleSidebar, isMobile } = useSidebarContext();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-4 z-30 mx-4 rounded-2xl px-4 py-5 text-[var(--dash-text)] md:mx-5 md:px-5 2xl:mx-10 2xl:px-10",
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 z-0 rounded-2xl border-b transition-[background-color,backdrop-filter,box-shadow,border-color] duration-300",
          isScrolled
            ? "bg-[rgba(255,255,255,0.00)] backdrop-blur-xl border-white/10 shadow-[0_0px_32px_rgba(0,0,0,0.35)]"
            : "bg-transparent backdrop-blur-none border-transparent shadow-none",
        )}
      />

      <div className="relative z-10 flex items-center justify-between">
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

        <div className="flex flex-1 items-center justify-end gap-2 min-[375px]:gap-4 max-[850px]:pl-4">
          <div className="relative w-full max-w-[300px] max-[850px]:mx-auto">
            <input
              type="search"
              placeholder="Search"
              className="flex w-full items-center gap-3.5 rounded-full border border-[var(--dash-border)] bg-[var(--dash-overlay)] py-3 pl-[53px] pr-5 text-[var(--dash-text)] outline-none transition-colors placeholder:text-[var(--dash-text-muted)] focus-visible:border-[var(--dash-ring)]"
            />

            <SearchIcon className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 max-[1015px]:size-5" />
          </div>

          <div className="max-[850px]:order-3">
            <Notification />
          </div>

          <div className="shrink-0 max-[850px]:order-2">
            <UserInfo />
          </div>
        </div>
      </div>
    </header>
  );
}
