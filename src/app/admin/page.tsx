"use client";

import Link from "next/link";
import { AdminGuard } from "@/components/AdminGuard";
import { useApp } from "@/context/AppContext";
import { formatPrice, statusLabel } from "@/lib/storage";

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
    clearEnquiries,
  } = useApp();

  const available = flats.filter((f) => f.status === "available").length;
  const underOffer = flats.filter((f) => f.status === "under-offer").length;
  const sold = flats.filter((f) => f.status === "sold").length;

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
          <Link href="/admin/flats/new" className="btn btn-primary btn-full-mobile">
            Add new flat
          </Link>
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
          <button
            type="button"
            className="btn btn-ghost text-sm"
            onClick={() => {
              if (confirm("Reset all flats and enquiries to demo seed data?")) {
                resetData();
              }
            }}
          >
            Reset demo data
          </button>
        </div>

        <div className="admin-card-list">
          {flats.map((flat) => (
            <article key={flat.id} className="surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-xl leading-snug">{flat.title}</h3>
                  <p className="mt-1 text-sm text-ink-soft">
                    {flat.area}, {flat.city} · {flat.bedrooms} BHK
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
                <Link
                  href={`/admin/flats/${flat.id}/edit`}
                  className="btn btn-primary btn-full-mobile !py-2.5 text-sm"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  className="btn btn-danger btn-full-mobile !py-2.5 text-sm"
                  onClick={() => {
                    if (confirm(`Delete "${flat.title}"?`)) deleteFlat(flat.id);
                  }}
                >
                  Delete
                </button>
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
              {flats.map((flat) => (
                <tr key={flat.id} className="border-b border-line/70 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{flat.title}</p>
                    <p className="text-xs text-ink-soft">{flat.area}</p>
                  </td>
                  <td className="px-4 py-3">{flat.city}</td>
                  <td className="px-4 py-3">{flat.bedrooms}</td>
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
                      <Link
                        href={`/admin/flats/${flat.id}/edit`}
                        className="text-ink font-semibold"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="font-semibold text-danger"
                        onClick={() => {
                          if (confirm(`Delete "${flat.title}"?`)) deleteFlat(flat.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-3xl">Enquiries ({enquiries.length})</h2>
          {enquiries.length > 0 && (
            <button
              type="button"
              className="btn btn-danger !py-2"
              onClick={() => {
                if (confirm("Clear all enquiries?")) clearEnquiries();
              }}
            >
              Clear enquiries
            </button>
          )}
        </div>
        {enquiries.length === 0 ? (
          <div className="surface p-6 text-ink-soft">No enquiries yet.</div>
        ) : (
          <div className="grid gap-4">
            {enquiries.map((enq) => (
              <article key={enq.id} className="surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="mb-2 flex flex-wrap gap-2">
                      <span
                        className={`chip ${
                          enq.intent === "sell" ? "chip-gold" : "chip-sage"
                        }`}
                      >
                        {enq.intent === "sell" ? "Seller lead" : "Buyer lead"}
                      </span>
                    </div>
                    <h3 className="font-display text-2xl">{enq.name}</h3>
                    <p className="text-sm text-ink-soft">
                      {enq.email} · {enq.phone}
                    </p>
                  </div>
                  <p className="text-xs text-ink-soft">
                    {new Date(enq.createdAt).toLocaleString()}
                  </p>
                </div>
                <p className="mt-3 text-sm">
                  <span className="font-semibold">Location:</span>{" "}
                  {[enq.area, enq.city].filter(Boolean).join(", ") || "Not specified"}
                </p>
                <p className="mt-1 text-sm">
                  <span className="font-semibold">Listing:</span>{" "}
                  {enq.flatTitle || "General request"}
                </p>
                {enq.preferredVisit && (
                  <p className="mt-1 text-sm">
                    <span className="font-semibold">Preferred visit:</span>{" "}
                    {enq.preferredVisit}
                  </p>
                )}
                <p className="mt-3 leading-relaxed text-ink-soft">{enq.message}</p>
              </article>
            ))}
          </div>
        )}
      </section>
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
