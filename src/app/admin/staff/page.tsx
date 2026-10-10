"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { AdminGuard } from "@/components/AdminGuard";
import { BusyButton } from "@/components/BusyButton";
import { PasswordField } from "@/components/PasswordField";
import { RoleGate } from "@/components/RoleGate";
import { useApp } from "@/context/AppContext";
import { builtinDeskRoles, ROLE_LABELS, type DeskRole } from "@/lib/staff-roles";
import type { StaffAccount } from "@/lib/supabase/staff-admin";

export default function StaffPage() {
  return (
    <AdminGuard>
      <RoleGate action="manageStaff">
        <StaffDesk />
      </RoleGate>
    </AdminGuard>
  );
}

function StaffDesk() {
  const { staffRole } = useApp();
  const [staff, setStaff] = useState<StaffAccount[]>([]);
  const [roles, setRoles] = useState<DeskRole[]>(builtinDeskRoles());
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("agent");
  const [roleName, setRoleName] = useState("");
  const [roleAccess, setRoleAccess] = useState("staff");
  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);
  const [creatingRole, setCreatingRole] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    const [staffResponse, rolesResponse] = await Promise.all([
      fetch("/api/admin/staff"),
      fetch("/api/admin/roles"),
    ]);
    const staffBody = (await staffResponse.json().catch(() => ({}))) as StaffAccount[] | { error?: string };
    if (!staffResponse.ok) {
      throw new Error("error" in staffBody ? staffBody.error || "Could not load staff" : "Could not load staff");
    }
    setStaff(staffBody as StaffAccount[]);
    if (rolesResponse.ok) {
      const roleBody = (await rolesResponse.json()) as DeskRole[];
      if (Array.isArray(roleBody) && roleBody.length > 0) setRoles(roleBody);
    }
  };

  useEffect(() => {
    load().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Could not load staff");
    });
  }, []);

  const create = async (event: FormEvent) => {
    event.preventDefault();
    if (creating) return;
    setCreating(true);
    setError("");
    try {
      const response = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, displayName, password, role }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(body.error || "Could not create staff");
        return;
      }
      setEmail("");
      setDisplayName("");
      setPassword("");
      await load();
    } finally {
      setCreating(false);
    }
  };

  const createRole = async (event: FormEvent) => {
    event.preventDefault();
    if (creatingRole) return;
    setCreatingRole(true);
    setError("");
    try {
      const response = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: roleName, access: roleAccess }),
      });
      const body = (await response.json().catch(() => ({}))) as DeskRole & { error?: string };
      if (!response.ok) {
        setError(body.error || "Could not create role");
        return;
      }
      setRoleName("");
      setRole(body.role);
      await load();
    } finally {
      setCreatingRole(false);
    }
  };

  const save = async (id: string, nextRole: string, nextPassword: string) => {
    if (savingId) return;
    setSavingId(id);
    setError("");
    try {
      const response = await fetch("/api/admin/staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          role: nextRole,
          password: nextPassword || undefined,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(body.error || "Could not update staff");
        return;
      }
      setPasswords((current) => ({ ...current, [id]: "" }));
      await load();
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="container-shell section-space !pt-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl">Staff</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-soft">
            You are signed in as {staffRole ? ROLE_LABELS[staffRole] : "staff"}. Create a login,
            add a role, or change the role on an existing account. Only an admin can do this.
          </p>
        </div>
        <Link href="/admin" className="btn btn-secondary">
          Back to dashboard
        </Link>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {roles.map((item) => (
          <span key={item.role} className={`chip ${item.role === "admin" ? "chip-gold" : "chip-sage"}`}>
            {item.role === "admin" ? "Admin" : item.label}
          </span>
        ))}
      </div>

      <form className="surface mb-8 grid gap-4 p-5 md:grid-cols-2" onSubmit={create}>
        <div className="field">
          <label htmlFor="staffEmail">Email</label>
          <input id="staffEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="staffName">Display name</label>
          <input id="staffName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="staffPassword">Password</label>
          <PasswordField
            id="staffPassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <div className="field">
          <label htmlFor="staffRole">Role</label>
          <select id="staffRole" value={role} onChange={(e) => setRole(e.target.value)}>
            {roles.map((item) => (
              <option key={item.role} value={item.role}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <BusyButton
          type="submit"
          pending={creating}
          pendingLabel="Creating staff login…"
          className="btn btn-primary w-fit"
        >
          Create staff login
        </BusyButton>
      </form>

      <form className="surface mb-8 grid gap-4 p-5 md:grid-cols-[1.2fr_1fr_auto] md:items-end" onSubmit={createRole}>
        <div className="field">
          <label htmlFor="newRoleName">New role</label>
          <input
            id="newRoleName"
            value={roleName}
            placeholder="Finance manager"
            onChange={(e) => setRoleName(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="newRoleAccess">Same access as</label>
          <select id="newRoleAccess" value={roleAccess} onChange={(e) => setRoleAccess(e.target.value)}>
            {builtinDeskRoles().map((item) => (
              <option key={item.role} value={item.access}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <BusyButton
          type="submit"
          pending={creatingRole}
          pendingLabel="Creating role…"
          className="btn btn-secondary"
        >
          Create role
        </BusyButton>
      </form>

      {error && <p className="mb-4 text-sm text-danger">{error}</p>}

      <div className="grid gap-4">
        {staff.map((account) => (
          <StaffRow
            key={account.id}
            account={account}
            password={passwords[account.id] ?? ""}
            onPassword={(value) => setPasswords((current) => ({ ...current, [account.id]: value }))}
            saving={savingId === account.id}
            roles={roles}
            onSave={save}
          />
        ))}
      </div>
    </div>
  );
}

function StaffRow({
  account,
  password,
  saving,
  roles,
  onPassword,
  onSave,
}: {
  account: StaffAccount;
  password: string;
  saving: boolean;
  roles: DeskRole[];
  onPassword: (value: string) => void;
  onSave: (id: string, role: string, password: string) => Promise<void>;
}) {
  const [role, setRole] = useState(account.role || "agent");
  const current = roles.find((item) => item.role === account.role);
  const options = roles.some((item) => item.role === account.role) || !account.role
    ? roles
    : [...roles, { role: account.role, label: account.role, access: "staff" as const }];

  return (
    <article className="surface grid gap-3 p-5 md:grid-cols-[1.4fr_0.8fr_1fr_auto] md:items-end">
      <div>
        <div className="mb-2 flex flex-wrap gap-2">
          <span className={`chip ${account.role === "admin" ? "chip-gold" : "chip-sage"}`}>
            {account.role === "admin" ? "Admin" : current?.label || account.role || "Role"}
          </span>
        </div>
        <h2 className="font-display text-2xl">{account.displayName || account.email}</h2>
        <p className="text-sm text-ink-soft">{account.email}</p>
      </div>
      <div className="field">
        <label htmlFor={`role-${account.id}`}>Role</label>
        <select id={`role-${account.id}`} value={role} onChange={(e) => setRole(e.target.value)}>
          {options.map((item) => (
            <option key={item.role} value={item.role}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor={`password-${account.id}`}>New password</label>
        <PasswordField
          id={`password-${account.id}`}
          value={password}
          placeholder="Leave blank to keep"
          autoComplete="new-password"
          onChange={(e) => onPassword(e.target.value)}
        />
      </div>
      <BusyButton
        pending={saving}
        pendingLabel="Saving…"
        className="btn btn-primary"
        onClick={() => onSave(account.id, role, password)}
      >
        Save
      </BusyButton>
    </article>
  );
}
