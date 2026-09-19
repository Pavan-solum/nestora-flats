"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { ready, isAdmin } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !isAdmin && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [ready, isAdmin, pathname, router]);

  if (!ready) {
    return (
      <div className="container-shell section-space">
        <p className="text-ink-soft">Loading admin…</p>
      </div>
    );
  }

  if (!isAdmin && pathname !== "/admin/login") {
    return null;
  }

  return <>{children}</>;
}
