export const STAFF_ROLES = [
  "admin",
  "agent",
  "staff",
  "lead-manager",
  "social-media-manager",
] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

export const ROLE_LABELS: Record<StaffRole, string> = {
  admin: "Admin",
  agent: "Agent",
  staff: "Staff",
  "lead-manager": "Lead manager",
  "social-media-manager": "Social media manager",
};

export type StaffAction =
  | "manageStaff"
  | "resetInventory"
  | "clearEnquiries"
  | "writeFlat"
  | "deleteFlat"
  | "uploadImage"
  | "readEnquiries"
  | "writeEnquiry"
  | "deleteEnquiry"
  | "publishSocial"
  | "deleteSocialHistory";

const PERMISSIONS: Record<StaffAction, readonly StaffRole[]> = {
  manageStaff: ["admin"],
  resetInventory: ["admin"],
  clearEnquiries: ["admin"],
  writeFlat: ["admin", "agent", "social-media-manager"],
  deleteFlat: ["admin", "agent"],
  uploadImage: ["admin", "agent", "social-media-manager"],
  readEnquiries: ["admin", "agent", "staff", "lead-manager"],
  writeEnquiry: ["admin", "agent", "lead-manager"],
  deleteEnquiry: ["admin", "agent", "lead-manager"],
  publishSocial: ["admin", "social-media-manager"],
  deleteSocialHistory: ["admin"],
};

export type DeskRole = {
  role: string;
  label: string;
  access: StaffRole;
};

export function builtinDeskRoles(): DeskRole[] {
  return STAFF_ROLES.map((role) => ({ role, label: ROLE_LABELS[role], access: role }));
}

export function slugRoleName(label: string) {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isStaffRole(value: unknown): value is StaffRole {
  return typeof value === "string" && (STAFF_ROLES as readonly string[]).includes(value);
}

export function roleCan(role: string | null | undefined, action: StaffAction) {
  return isStaffRole(role) && PERMISSIONS[action].includes(role);
}
