import { isEnquiryStatus, needsFollowUpDate, type Enquiry, type EnquiryStatus } from "@/lib/types";

export type DueWindow = "overdue" | "today" | "upcoming";

export function followUpWindow(iso: string | null | undefined, now = new Date()): DueWindow | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const next = new Date(start);
  next.setDate(next.getDate() + 1);
  if (date < start) return "overdue";
  if (date < next) return "today";
  return "upcoming";
}

export function datedFollowUp(enquiry: Enquiry) {
  return isEnquiryStatus(enquiry.status) && needsFollowUpDate(enquiry.status) && Boolean(enquiry.followUpAt);
}

export function dueLeads(enquiries: Enquiry[], now = new Date()) {
  const rank: Record<DueWindow, number> = { overdue: 0, today: 1, upcoming: 2 };
  return enquiries
    .filter((enquiry) => {
      if (!datedFollowUp(enquiry)) return false;
      const window = followUpWindow(enquiry.followUpAt, now);
      return window === "overdue" || window === "today";
    })
    .sort((a, b) => {
      const left = followUpWindow(a.followUpAt, now) ?? "upcoming";
      const right = followUpWindow(b.followUpAt, now) ?? "upcoming";
      if (rank[left] !== rank[right]) return rank[left] - rank[right];
      return new Date(a.followUpAt ?? 0).getTime() - new Date(b.followUpAt ?? 0).getTime();
    });
}

export function dayKey(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
