"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminGuard } from "@/components/AdminGuard";
import { BusyButton } from "@/components/BusyButton";
import { useApp } from "@/context/AppContext";
import { formatPrice, statusLabel } from "@/lib/storage";
import { dueLeads } from "@/lib/leads";
import { roleCan } from "@/lib/staff-roles";

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <Dashboard />
    </AdminGuard>
  );
}

function Dashboard() {
  const {
    flats,
    enquiries,
    logout,
    deleteFlat,
    resetData,
    staffRole,
  } = useApp();
  const canWriteFlat = roleCan(staffRole, "writeFlat");
  const canDeleteFlat = roleCan(staffRole, "deleteFlat");
  const canManageStaff = roleCan(staffRole, "manageStaff");
  const canReset = roleCan(staffRole, "resetInventory");
  const canReadLeads = roleCan(staffRole, "readEnquiries");
  const canWriteLead = roleCan(staffRole, "writeEnquiry");
  const canPublishSocial = roleCan(staffRole, "publishSocial");
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState("");
  const [actionError, setActionError] = useState("");
  const [pending, setPending] = useState<string | null>(null);

  const runAction = async (key: string, action: () => Promise<void>, fallback: string) => {
    if (pending) return;
    setPending(key);
    setActionError("");
    try {
      await action();
    } catch (error: unknown) {
      setActionError(error instanceof Error ? error.message : fallback);
    } finally {
      setPending(null);
    }
  };

  const available = flats.filter((f) => f.status === "available").length;
  const underOffer = flats.filter((f) => f.status === "under-offer").length;
  const sold = flats.filter((f) => f.status === "sold").length;
  const cities = useMemo(
    () => [...new Set(flats.map((flat) => flat.city))].sort(),
    [flats],
  );
  const shown = flats.filter((flat) => {
    const haystack = `${flat.title} ${flat.area} ${flat.city} ${flat.projectName ?? ""}`.toLowerCase();
    if (query && !haystack.includes(query.trim().toLowerCase())) return false;
    if (city && flat.city !== city) return false;
    if (status && flat.status !== status) return false;
    return true;
  });
  const dueCount = dueLeads(enquiries).length;

  return (
    <div className="container-shell section-space !pt-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl">Agent dashboard</h1>
          <p className="mt-2 text-sm text-ink-soft sm:text-base">
            Manage Nestora inventory and buyer/seller leads for the marketing desk.
          </p>
        </div>
        <div className="mobile-stack w-full sm:w-auto">
          {canWriteFlat && (
            <Link href="/admin/flats/new" className="btn btn-primary btn-full-mobile">
              Add new flat
            </Link>
          )}
          {canReadLeads && (
            <Link href="/admin/leads" className="btn btn-secondary btn-full-mobile">
              {canWriteLead && dueCount > 0 ? `Leads (${dueCount} due)` : "Leads"}
            </Link>
          )}
          {canManageStaff && (
            <Link href="/admin/staff" className="btn btn-secondary btn-full-mobile">
              Staff
            </Link>
          )}
          {canPublishSocial && (
            <Link href="/admin/social" className="btn btn-secondary btn-full-mobile">
              Social
            </Link>
          )}
          <button type="button" className="btn btn-secondary btn-full-mobile" onClick={logout}>
            Log out
          </button>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total flats" value={String(flats.length)} />
        <Stat label="Available" value={String(available)} />
        <Stat label="Under offer" value={String(underOffer)} />
        <Stat label="Sold" value={String(sold)} />
      </div>

      <section className="mb-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl sm:text-3xl">Inventory</h2>
          {canReset && (
          <BusyButton
            pending={pending === "reset"}
            pendingLabel="Resettingâ€¦"
            className="btn btn-ghost text-sm"
            onClick={() => {
              if (
                !confirm(
                  "Replace listings with the demo seed, delete flats added after the seed, and clear every enquiry?",
                )
              ) {
                return;
              }
              void runAction("reset", resetData, "Could not reset listings");
            }}
          >
            Reset demo data
          </BusyButton>
          )}
        </div>
        {actionError && <p className="mb-4 text-sm text-danger">{actionError}</p>}

        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <div className="field">
            <label htmlFor="inventoryQuery">Search inventory</label>
            <input
              id="inventoryQuery"
              value={query}
              placeholder="Title, area, project"
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="inventoryCity">City</label>
            <select id="inventoryCity" value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">All cities</option>
              {cities.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="inventoryStatus">Status</label>
            <select id="inventoryStatus" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              <option value="available">Available</option>
              <option value="under-offer">Under offer</option>
              <option value="sold">Sold</option>
            </select>
          </div>
        </div>

        <div className="admin-card-list">
          {shown.map((flat) => (
            <article key={flat.id} className="surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-xl leading-snug">{flat.title}</h3>
                  <p className="mt-1 text-sm text-ink-soft">
                    {flat.area}, {flat.city}
                    {flat.bedrooms != null ? ` Â· ${flat.bedrooms} BHK` : ""}
                  </p>
                </div>
                <span className={`chip status-${flat.status}`}>
                  {statusLabel(flat.status)}
                </span>
              </div>
              <p className="mt-3 font-semibold text-sage-deep">
                {formatPrice(flat.price)}
              </p>
              <div className="mobile-stack mt-4">
                <Link href={`/flats/${flat.id}`} className="btn btn-secondary btn-full-mobile !py-2.5 text-sm">
                  View
                </Link>
                {canWriteFlat && (
                  <Link
                    href={`/admin/flats/${flat.id}/edit`}
                    className="btn btn-primary btn-full-mobile !py-2.5 text-sm"
                  >
                    Edit
                  </Link>
                )}
                {canDeleteFlat && (
                  <BusyButton
                    pending={pending === `flat:${flat.id}`}
                    pendingLabel="Deletingâ€¦"
                    className="btn btn-danger btn-full-mobile !py-2.5 text-sm"
                    onClick={() => {
                      if (confirm(`Delete "${flat.title}"?`)) {
                        void runAction(`flat:${flat.id}`, () => deleteFlat(flat.id), "Could not delete this listing");
                      }
                    }}
                  >
                    Delete
                  </BusyButton>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="admin-table-wrap surface overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line bg-mist/70 text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-semibold">Flat</th>
                <th className="px-4 py-3 font-semibold">City</th>
                <th className="px-4 py-3 font-semibold">BHK</th>
                <th className="px-4 py-3 font-semibold">Starting from</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((flat) => (
                <tr key={flat.id} className="border-b border-line/70 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{flat.title}</p>
                    <p className="text-xs text-ink-soft">{flat.area}</p>
                  </td>
                  <td className="px-4 py-3">{flat.city}</td>
                  <td className="px-4 py-3">{flat.bedrooms ?? "â€”"}</td>
                  <td className="px-4 py-3">{formatPrice(flat.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`chip status-${flat.status}`}>
                      {statusLabel(flat.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/flats/${flat.id}`} className="text-sage font-semibold">
                        View
                      </Link>
                      {canWriteFlat && (
                        <Link
                          href={`/admin/flats/${flat.id}/edit`}
                          className="text-ink font-semibold"
                        >
                          Edit
                        </Link>
                      )}
                      {canDeleteFlat && (
                        <BusyButton
                          pending={pending === `flat:${flat.id}`}
                          pendingLabel="Deletingâ€¦"
                          className="inline-flex items-center gap-2 font-semibold text-danger disabled:cursor-progress disabled:opacity-70"
                          onClick={() => {
                            if (confirm(`Delete "${flat.title}"?`)) {
                              void runAction(`flat:${flat.id}`, () => deleteFlat(flat.id), "Could not delete this listing");
                            }
                          }}
                        >
                          Delete
                        </BusyButton>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {canReadLeads && (
        <section className="surface flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <h2 className="font-display text-3xl">Leads ({enquiries.length})</h2>
            {canWriteLead && (
              <p className="mt-1 text-sm text-ink-soft">
                {dueCount === 0 ? "No leads are due." : `${dueCount} ${dueCount === 1 ? "lead is" : "leads are"} due.`}
              </p>
            )}
          </div>
          <Link href="/admin/leads" className="btn btn-primary">
            Open leads
          </Link>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface p-5">
      <p className="text-xs uppercase tracking-[0.14em] text-ink-soft">{label}</p>
      <p className="mt-2 font-display text-4xl">{value}</p>
    </div>
  );
}

