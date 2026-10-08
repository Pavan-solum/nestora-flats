"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useApp } from "@/context/AppContext";
import { roleCan, type StaffAction } from "@/lib/staff-roles";

export function RoleGate({ action, children }: { action: StaffAction; children: ReactNode }) {
  const { ready, sessionChecked, staffRole } = useApp();

  if (!ready || !sessionChecked) {
    return (
      <div className="container-shell section-space">
        <p className="text-ink-soft">Loading admin…</p>
      </div>
    );
  }

  if (!roleCan(staffRole, action)) {
    return (
      <div className="container-shell section-space">
        <h1 className="font-display text-4xl">This page is for another role</h1>
        <p className="mt-2 text-ink-soft">Your login can use the rest of the desk that matches its role.</p>
        <Link href="/admin" className="btn btn-primary mt-6">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
