"use client";

import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_DATA } from "./data";
import { ArrowLeftIcon, ChevronUp } from "./icons";
import { MenuItem } from "./menu-item";
import { useSidebarContext } from "./sidebar-context";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { setIsOpen, isOpen, toggleSidebar } = useSidebarContext();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? [] : [title]));

    // Uncomment the following line to enable multiple expanded items
    // setExpandedItems((prev) =>
    //   prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
    // );
  };

  useEffect(() => {
    // Auto-expand the active section on navigation, but don't force it open after manual collapse.
    const activeTitle =
      NAV_DATA.flatMap((section) => section.items).find((item) =>
        item.items.some((subItem) => subItem.url === pathname),
      )?.title || "";

    if (!activeTitle) {
      return;
    }

    setExpandedItems((prev) =>
      prev.includes(activeTitle) ? prev : [activeTitle],
    );
  }, [pathname]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 hidden max-[849px]:block"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "max-w-[290px] overflow-hidden border-r border-gray-200 bg-white transition-[width] duration-200 ease-linear dark:border-gray-800 dark:bg-gray-dark",
          "max-[849px]:fixed max-[849px]:bottom-0 max-[849px]:top-0 max-[849px]:z-50",
          "min-[850px]:sticky min-[850px]:top-0 min-[850px]:h-screen min-[850px]:w-full",
          isOpen ? "max-[849px]:w-full max-[849px]:pointer-events-auto" : "max-[849px]:w-0 max-[849px]:pointer-events-none",
        )}
        aria-label="Main navigation"
      >
        <div className="flex h-full flex-col py-10 pl-[25px] pr-[7px]">
          <div className="relative pr-4.5">
            <Link
              href={"/"}
              className="px-0 py-2.5 min-[850px]:py-0"
            >
              <Logo />
            </Link>

            <button
              onClick={toggleSidebar}
              className="absolute left-3/4 right-4.5 top-1/2 -translate-y-1/2 text-right min-[850px]:hidden"
            >
              <span className="sr-only">Close Menu</span>

              <ArrowLeftIcon className="ml-auto size-7" />
            </button>
          </div>

          {/* Navigation */}
          <div className="custom-scrollbar mt-6 flex-1 overflow-y-auto pr-3 min-[850px]:mt-10">
            {NAV_DATA.map((section, index) => {
              const sectionLabel = section.label.trim();

              return (
                <div
                  key={sectionLabel || `section-${index}`}
                  className="mb-6"
                >
                  {sectionLabel ? (
                    <h2 className="mb-5 text-sm font-medium text-dark-4 dark:text-dark-6">
                      {sectionLabel}
                    </h2>
                  ) : null}

                  <nav
                    role="navigation"
                    aria-label={sectionLabel || "Navigation"}
                  >
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li key={item.title}>
                        {item.items.length ? (
                          <div>
                            <MenuItem
                              isActive={
                                item.items.some(({ url }) => url === pathname) ||
                                ("url" in item && item.url === pathname)
                              }
                              onClick={() => {
                                toggleExpanded(item.title);
                                if (item.url) {
                                  router.push(item.url);
                                }
                              }}
                            >
                              <item.icon
                                className="size-6 shrink-0"
                                aria-hidden="true"
                              />

                              <span>{item.title}</span>

                              <ChevronUp
                                className={cn(
                                  "ml-auto rotate-180 transition-transform duration-200",
                                  expandedItems.includes(item.title) &&
                                    "rotate-0",
                                )}
                                aria-hidden="true"
                              />
                            </MenuItem>

                            {expandedItems.includes(item.title) && (
                              <ul
                                className="ml-9 mr-0 space-y-1.5 pb-[15px] pr-0 pt-2"
                                role="menu"
                              >
                                {item.items.map((subItem) => (
                                  <li key={subItem.title} role="none">
                                    <MenuItem
                                      as="link"
                                      href={subItem.url}
                                      isActive={pathname === subItem.url}
                                    >
                                      <span>{subItem.title}</span>
                                    </MenuItem>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ) : (
                          (() => {
                            const href =
                              "url" in item
                                ? item.url + ""
                                : "/" +
                                  item.title.toLowerCase().split(" ").join("-");

                            return (
                              <MenuItem
                                className="flex items-center gap-3 py-3"
                                as="link"
                                href={href}
                                isActive={pathname === href}
                              >
                                <item.icon
                                  className="size-6 shrink-0"
                                  aria-hidden="true"
                                />

                                <span>{item.title}</span>
                              </MenuItem>
                            );
                          })()
                        )}
                      </li>
                    ))}
                  </ul>
                  </nav>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}
