"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";

const links = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/listings", label: "Listings" },
  { href: "/enquiry", label: "Contact agent" },
  { href: "/favorites", label: "Favorites" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const { favorites, isAdmin } = useApp();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-[#f7f9fb]/90 backdrop-blur-xl">
      <div className="container-shell flex items-center justify-between gap-3 py-3 sm:py-3.5">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sage text-white font-display text-lg sm:h-10 sm:w-10 sm:rounded-2xl sm:text-xl">
            N
          </span>
          <div className="min-w-0">
            <p className="font-display text-lg leading-none sm:text-xl">Nestora</p>
            <p className="truncate text-[11px] text-ink-soft sm:text-xs">
              Property brokers
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 xl:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-link text-sm"
              data-active={
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href)
              }
            >
              {link.label}
              {link.href === "/favorites" && favorites.length > 0
                ? ` (${favorites.length})`
                : ""}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={isAdmin ? "/admin" : "/admin/login"}
            className="btn btn-secondary hidden !px-3 !py-2 text-sm lg:inline-flex"
          >
            {isAdmin ? "Admin" : "Admin"}
          </Link>
          <button
            type="button"
            className="btn btn-secondary xl:hidden !min-h-11 !px-3.5"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 top-[57px] z-40 bg-[#14212b]/35 xl:hidden" onClick={() => setOpen(false)}>
          <div
            className="max-h-[calc(100vh-57px)] overflow-y-auto border-b border-line bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="container-shell flex flex-col gap-1 py-3 pb-6">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-xl px-4 py-3.5 text-base font-semibold ${
                    (
                      link.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(link.href)
                    )
                      ? "bg-mist text-sage-deep"
                      : "hover:bg-mist"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                  {link.href === "/favorites" && favorites.length > 0
                    ? ` (${favorites.length})`
                    : ""}
                </Link>
              ))}
              <Link
                href={isAdmin ? "/admin" : "/admin/login"}
                className="mt-2 rounded-xl bg-sage px-4 py-3.5 text-center text-base font-semibold text-white"
                onClick={() => setOpen(false)}
              >
                {isAdmin ? "Agent dashboard" : "Admin login"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
