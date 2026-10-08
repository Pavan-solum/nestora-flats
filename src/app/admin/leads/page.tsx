"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminGuard } from "@/components/AdminGuard";
import { BusyButton } from "@/components/BusyButton";
import { RoleGate } from "@/components/RoleGate";
import { useApp } from "@/context/AppContext";
import { datedFollowUp, dayKey, dueLeads, followUpWindow } from "@/lib/leads";
import { roleCan } from "@/lib/staff-roles";
import {
  ENQUIRY_STATUSES,
  ENQUIRY_STATUS_LABELS,
  isEnquiryStatus,
  needsFollowUpDate,
  type Enquiry,
  type EnquiryStatus,
} from "@/lib/types";

export default function LeadsPage() {
  return (
    <AdminGuard>
      <RoleGate action="readEnquiries">
        <LeadDesk />
      </RoleGate>
    </AdminGuard>
  );
}

function LeadDesk() {
  const { enquiries, staffRole, updateEnquiry, deleteEnquiry, clearEnquiries } = useApp();
  const canWrite = roleCan(staffRole, "writeEnquiry");
  const canDelete = roleCan(staffRole, "deleteEnquiry");
  const canClear = roleCan(staffRole, "clearEnquiries");
  const [query, setQuery] = useState("");
  const [intent, setIntent] = useState("");
  const [status, setStatus] = useState("");
  const [dueWindow, setDueWindow] = useState("");
  const [day, setDay] = useState("");
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<string | null>(null);

  const due = useMemo(() => dueLeads(enquiries), [enquiries]);
  const shown = enquiries.filter((enquiry) => {
    const haystack = `${enquiry.name} ${enquiry.phone} ${enquiry.email} ${enquiry.flatTitle ?? ""}`.toLowerCase();
    if (query && !haystack.includes(query.trim().toLowerCase())) return false;
    if (intent && enquiry.intent !== intent) return false;
    if (status && (enquiry.status ?? "new") !== status) return false;
    if (dueWindow && followUpWindow(enquiry.followUpAt) !== dueWindow) return false;
    if (day && dayKey(enquiry.followUpAt ?? "") !== day) return false;
    return true;
  });

  const run = async (key: string, action: () => Promise<void>, fallback: string) => {
    if (pending) return false;
    setPending(key);
    setError("");
    try {
      await action();
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : fallback);
      return false;
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="container-shell section-space !pt-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl">Leads</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-soft">
            Follow up buyer and seller enquiries. Dates for follow-up, a scheduled visit, and a revisit show on the calendar.
          </p>
        </div>
        <Link href="/admin" className="btn btn-secondary">
          Back to dashboard
        </Link>
      </div>

      {canWrite && (
        <section className="surface mb-8 p-5">
          <h2 className="font-display text-2xl">Due ({due.length})</h2>
          {due.length === 0 ? (
            <p className="mt-2 text-sm text-ink-soft">No leads are overdue or due today.</p>
          ) : (
            <ul className="mt-3 grid gap-2">
              {due.map((enquiry) => (
                <li key={enquiry.id}>
                  <button type="button" className="text-left" onClick={() => setSelected(enquiry.id)}>
                    <span className="font-semibold">{enquiry.name}</span>
                    <span className="text-sm text-ink-soft">
                      {" "}
                      · {ENQUIRY_STATUS_LABELS[enquiry.status ?? "new"]} ·{" "}
                      {enquiry.followUpAt ? new Date(enquiry.followUpAt).toLocaleString() : ""}
                      {followUpWindow(enquiry.followUpAt) === "overdue" ? " · Overdue" : " · Today"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <div className="mb-6 grid gap-3 md:grid-cols-4">
        <div className="field">
          <label htmlFor="leadQuery">Search</label>
          <input id="leadQuery" value={query} placeholder="Name, phone, listing" onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="leadIntent">Buyer or seller</label>
          <select id="leadIntent" value={intent} onChange={(e) => setIntent(e.target.value)}>
            <option value="">All leads</option>
            <option value="buy">Buyer leads</option>
            <option value="sell">Seller leads</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="leadStatus">Status</label>
          <select id="leadStatus" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Any status</option>
            {ENQUIRY_STATUSES.map((value) => (
              <option key={value} value={value}>
                {ENQUIRY_STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="leadWindow">Due</label>
          <select id="leadWindow" value={dueWindow} onChange={(e) => setDueWindow(e.target.value)}>
            <option value="">Any date</option>
            <option value="overdue">Overdue</option>
            <option value="today">Today</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>
      </div>

      <LeadCalendar
        cursor={cursor}
        enquiries={enquiries}
        selected={day}
        onCursor={setCursor}
        onSelect={(next) => setDay((current) => (current === next ? "" : next))}
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-soft">
          {shown.length} shown{day ? ` · ${day}` : ""}
        </p>
        {canClear && enquiries.length > 0 && (
          <BusyButton
            pending={pending === "clear"}
            pendingLabel="Clearing…"
            className="btn btn-danger !py-2"
            onClick={() => {
              if (!confirm("Clear all enquiries?")) return;
              void run("clear", clearEnquiries, "Could not clear enquiries");
            }}
          >
            Clear enquiries
          </BusyButton>
        )}
      </div>
      {error && <p className="mb-4 text-sm text-danger">{error}</p>}

      <div className="surface overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line bg-mist/70 text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Phone</th>
              <th className="px-4 py-3 font-semibold">Lead</th>
              <th className="px-4 py-3 font-semibold">Listing</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Next date</th>
              <th className="px-4 py-3 font-semibold">Note</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-ink-soft" colSpan={7}>
                  No enquiries matched.
                </td>
              </tr>
            ) : (
              shown.map((enquiry) => (
                <tr key={enquiry.id} className="border-b border-line/70 last:border-0">
                  <td className="px-4 py-3 font-semibold">{enquiry.name}</td>
                  <td className="px-4 py-3">{enquiry.phone}</td>
                  <td className="px-4 py-3">{enquiry.intent === "sell" ? "Seller" : "Buyer"}</td>
                  <td className="px-4 py-3">{enquiry.flatTitle || "General request"}</td>
                  <td className="px-4 py-3">{ENQUIRY_STATUS_LABELS[enquiry.status ?? "new"]}</td>
                  <td className="px-4 py-3">
                    {enquiry.followUpAt ? new Date(enquiry.followUpAt).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <p className="max-w-xs truncate">{enquiry.reply || enquiry.message}</p>
                    {(canWrite || canDelete) && (
                      <button type="button" className="mt-1 font-semibold text-sage" onClick={() => setSelected(enquiry.id)}>
                        {selected === enquiry.id ? "Close" : "Update"}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <LeadEditor
          key={selected}
          enquiry={enquiries.find((item) => item.id === selected) ?? null}
          canWrite={canWrite}
          canDelete={canDelete}
          pending={pending}
          onClose={() => setSelected(null)}
          onSave={async (patch) => {
            const saved = await run(
              `save:${selected}`,
              () => updateEnquiry(selected, patch),
              "Could not save this lead",
            );
            if (saved) setSelected(null);
            return saved;
          }}
          onDelete={() => {
            const enquiry = enquiries.find((item) => item.id === selected);
            if (!enquiry || !confirm(`Delete the enquiry from ${enquiry.name}?`)) return;
            void run(`delete:${selected}`, async () => {
              await deleteEnquiry(selected);
              setSelected(null);
            }, "Could not delete this lead");
          }}
        />
      )}
    </div>
  );
}

function LeadCalendar({
  cursor,
  enquiries,
  selected,
  onCursor,
  onSelect,
}: {
  cursor: Date;
  enquiries: Enquiry[];
  selected: string;
  onCursor: (date: Date) => void;
  onSelect: (day: string) => void;
}) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1).getDay();
  const count = new Date(year, month + 1, 0).getDate();
  const marks = new Set(
    enquiries
      .filter((enquiry) => datedFollowUp(enquiry))
      .map((enquiry) => dayKey(enquiry.followUpAt ?? ""))
      .filter(Boolean),
  );
  const cells = [...Array(first).fill(null), ...Array.from({ length: count }, (_, index) => index + 1)];

  return (
    <section className="surface mb-8 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl">
          {cursor.toLocaleString(undefined, { month: "long", year: "numeric" })}
        </h2>
        <div className="flex gap-2">
          <button type="button" className="btn btn-secondary !px-3 !py-2" onClick={() => onCursor(new Date(year, month - 1, 1))}>
            Previous
          </button>
          <button type="button" className="btn btn-secondary !px-3 !py-2" onClick={() => onCursor(new Date(year, month + 1, 1))}>
            Next
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => (
          <p key={label} className="py-1 text-xs text-ink-soft">{label}</p>
        ))}
        {cells.map((value, index) => {
          if (!value) return <span key={`empty-${index}`} />;
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(value).padStart(2, "0")}`;
          const marked = marks.has(key);
          return (
            <button
              key={key}
              type="button"
              className={`rounded-lg py-2 ${selected === key ? "bg-sage text-white" : marked ? "bg-mist font-semibold" : ""}`}
              onClick={() => onSelect(key)}
            >
              {value}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function LeadEditor({
  enquiry,
  canWrite,
  canDelete,
  pending,
  onClose,
  onSave,
  onDelete,
}: {
  enquiry: Enquiry | null;
  canWrite: boolean;
  canDelete: boolean;
  pending: string | null;
  onClose: () => void;
  onSave: (patch: { status: EnquiryStatus; reply: string; followUpAt: string | null }) => Promise<boolean>;
  onDelete: () => void;
}) {
  const [status, setStatus] = useState<EnquiryStatus>(enquiry?.status ?? "new");
  const [when, setWhen] = useState(toLocalInput(enquiry?.followUpAt));
  const [reply, setReply] = useState(enquiry?.reply ?? "");
  const [saving, setSaving] = useState(false);
  if (!enquiry) return null;
  const dated = needsFollowUpDate(status);

  return (
    <form
      className="surface mt-6 grid gap-4 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (saving) return;
        setSaving(true);
        void onSave({
          status,
          reply,
          followUpAt: dated && when ? new Date(when).toISOString() : null,
        }).then((saved) => {
          if (!saved) setSaving(false);
        });
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">{enquiry.name}</h2>
          <p className="text-sm text-ink-soft">
            {enquiry.email} · {enquiry.phone}
          </p>
        </div>
        <button type="button" className="btn btn-secondary !py-2" onClick={onClose}>
          Close
        </button>
      </div>
      <p className="text-sm text-ink-soft">{enquiry.message}</p>
      {canWrite && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="field">
              <label htmlFor="editorStatus">Follow-up</label>
              <select
                id="editorStatus"
                value={status}
                onChange={(event) => {
                  if (isEnquiryStatus(event.target.value)) setStatus(event.target.value);
                }}
              >
                {ENQUIRY_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {ENQUIRY_STATUS_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
            {dated && (
              <div className="field">
                <label htmlFor="editorWhen">Date and time</label>
                <input id="editorWhen" type="datetime-local" value={when} onChange={(event) => setWhen(event.target.value)} required />
              </div>
            )}
          </div>
          <div className="field">
            <label htmlFor="editorReply">Reply note</label>
            <textarea id="editorReply" rows={3} value={reply} onChange={(event) => setReply(event.target.value)} />
          </div>
        </>
      )}
      <div className="flex flex-wrap gap-2">
        {canWrite && (
          <BusyButton
            type="submit"
            pending={saving || pending === `save:${enquiry.id}`}
            pendingLabel="Saving…"
            className="btn btn-primary"
          >
            Save follow-up
          </BusyButton>
        )}
        {canDelete && (
          <BusyButton pending={pending === `delete:${enquiry.id}`} pendingLabel="Deleting…" className="btn btn-danger" onClick={onDelete}>
            Delete
          </BusyButton>
        )}
      </div>
    </form>
  );
}

function toLocalInput(iso?: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
