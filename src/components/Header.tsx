"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  const barRef = useRef<HTMLDivElement>(null);
  const [menuTop, setMenuTop] = useState(0);

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

  useEffect(() => {
    if (!open) return;
    const update = () => setMenuTop(Math.ceil(barRef.current?.getBoundingClientRect().bottom ?? 0));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-[#f7f9fb]">
      <div ref={barRef} className="container-shell flex items-center justify-between gap-3 py-2 sm:py-2.5">
        <Link href="/" className="min-w-0" aria-label="Prop Nexa Homes">
          <Image
            src="/logo.png"
            alt=""
            width={512}
            height={512}
            priority
            className="h-16 w-auto max-w-[46vw] rounded-xl object-contain object-left sm:h-20"
          />
        </Link>

        <nav className="hidden items-center gap-3 lg:flex">
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
          {isAdmin && (
            <Link href="/admin" className="btn btn-secondary hidden !px-3 !py-2 text-sm lg:inline-flex">
              Admin
            </Link>
          )}
          <button
            type="button"
            className="btn btn-secondary lg:hidden !min-h-11 !px-3.5"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => {
              setMenuTop(Math.ceil(barRef.current?.getBoundingClientRect().bottom ?? 0));
              setOpen((v) => !v);
            }}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-x-0 bottom-0 z-40 bg-[#14212b]/35 lg:hidden" style={{ top: menuTop }} onClick={() => setOpen(false)}>
          <div
            className="overflow-y-auto border-b border-line bg-white shadow-lg"
            style={{ maxHeight: `calc(100vh - ${menuTop}px)` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="container-shell flex flex-col gap-1 bg-[#f7f9fb] py-3 pb-6">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`min-h-12 rounded-xl px-4 py-3.5 text-base font-semibold ${
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
              {isAdmin && (
                <Link
                  href="/admin"
                  className="mt-2 rounded-xl bg-sage px-4 py-3.5 text-center text-base font-semibold text-white"
                  onClick={() => setOpen(false)}
                >
                  Agent dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
