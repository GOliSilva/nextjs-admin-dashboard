"use client";

import { ChevronUpIcon } from "@/assets/icons";
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { LogOutIcon, SettingsIcon, UserIcon } from "./icons";

export function UserInfo() {
  const [isOpen, setIsOpen] = useState(false);

  const USER = {
    name: "John Smith",
    email: "johnson@nextadmin.com",
    img: "/images/user/user-03.png",
  };

  return (
    <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
      <DropdownTrigger className="rounded align-middle outline-none ring-offset-2 ring-offset-[var(--dash-surface-deep)] focus-visible:ring-1 focus-visible:ring-[var(--dash-ring)]">
        <span className="sr-only">My Account</span>

        <figure className="flex items-center gap-3">
          <Image
            src={USER.img}
            className="size-12"
            alt={`Avatar of ${USER.name}`}
            role="presentation"
            width={200}
            height={200}
          />
          <figcaption className="flex items-center gap-1 font-medium text-[var(--dash-text)] max-[1024px]:sr-only">
            <span>{USER.name}</span>

            <ChevronUpIcon
              aria-hidden
              className={cn(
                "rotate-180 transition-transform",
                isOpen && "rotate-0",
              )}
              strokeWidth={1.5}
            />
          </figcaption>
        </figure>
      </DropdownTrigger>

      <DropdownContent
        className="border border-white/10 bg-[rgba(14,14,48,0.8)] shadow-[0_0px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl min-[230px]:min-w-[17.5rem]"
        align="end"
      >
        <h2 className="sr-only">User information</h2>

        <figure className="flex items-center gap-2.5 px-5 py-3.5">
          <Image
            src={USER.img}
            className="size-12"
            alt={`Avatar for ${USER.name}`}
            role="presentation"
            width={200}
            height={200}
          />

          <figcaption className="space-y-1 text-base font-medium">
            <div className="mb-2 leading-none text-[var(--dash-text)]">
              {USER.name}
            </div>

            <div className="leading-none text-[var(--dash-text-muted)]">
              {USER.email}
            </div>
          </figcaption>
        </figure>

        <hr className="border-[var(--dash-border)]" />

        <div className="p-2 text-base text-[var(--dash-text)] [&>*]:cursor-pointer">
          <Link
            href={"/profile"}
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] outline-none transition-colors hover:bg-[var(--dash-active-bg)] focus-visible:bg-[var(--dash-active-bg)]"
          >
            <UserIcon />

            <span className="mr-auto text-base font-medium">View profile</span>
          </Link>

          <Link
            href={"/pages/settings"}
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] outline-none transition-colors hover:bg-[var(--dash-active-bg)] focus-visible:bg-[var(--dash-active-bg)]"
          >
            <SettingsIcon />

            <span className="mr-auto text-base font-medium">
              Account Settings
            </span>
          </Link>
        </div>

        <hr className="border-[var(--dash-border)]" />

        <div className="p-2 text-base text-[var(--dash-text)]">
          <button
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] outline-none transition-colors hover:bg-[var(--dash-active-bg)] focus-visible:bg-[var(--dash-active-bg)]"
            onClick={() => setIsOpen(false)}
          >
            <LogOutIcon />

            <span className="text-base font-medium">Log out</span>
          </button>
        </div>
      </DropdownContent>
    </Dropdown>
  );
}
