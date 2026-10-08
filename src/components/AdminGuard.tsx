"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { ready, sessionChecked, isAdmin } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (sessionChecked && ready && !isAdmin && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [ready, sessionChecked, isAdmin, pathname, router]);

  if (!ready || !sessionChecked) {
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
