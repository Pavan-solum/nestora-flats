import fs from "fs";
import path from "path";
import { SEED_FLATS } from "@/lib/seed";
import type { Enquiry, EnquiryStatus, Flat } from "@/lib/types";
import { isEnquiryStatus, needsFollowUpDate } from "@/lib/types";
import { getSupabaseAdmin } from "./admin";
import {
  BUCKET,
  EXTRAS_PATH,
  FOLLOWUPS_PATH,
  applyExtra,
  bucketObjectPath,
  enquiryToRow,
  extraFromFlat,
  flatToRow,
  rowToEnquiry,
  rowToFlat,
  type FlatExtra,
} from "./map";
import { supabaseUrl } from "./client";

let extraColumns: boolean | null = null;

export async function hasExtraColumns() {
  if (extraColumns != null) return extraColumns;
  const { error } = await getSupabaseAdmin()
    .from("flats")
    .select("project_name")
    .limit(1);
  extraColumns = !error;
  return extraColumns;
}

export async function loadExtras(): Promise<Record<string, FlatExtra>> {
  const { data, error } = await getSupabaseAdmin().storage.from(BUCKET).download(EXTRAS_PATH);
  if (error || !data) return {};
  const parsed = JSON.parse(await data.text()) as Record<string, FlatExtra>;
  return parsed && typeof parsed === "object" ? parsed : {};
}

export async function saveExtras(extras: Record<string, FlatExtra>) {
  const { error } = await getSupabaseAdmin()
    .storage.from(BUCKET)
    .upload(EXTRAS_PATH, JSON.stringify(extras), {
      upsert: true,
      contentType: "application/json",
    });
  if (error) throw new Error(error.message);
}

async function writeFlatExtra(flat: Flat) {
  const extras = await loadExtras();
  const extra = extraFromFlat(flat);
  if (extra) extras[flat.id] = extra;
  else delete extras[flat.id];
  await saveExtras(extras);
}

export async function fetchFlats(): Promise<Flat[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("flats")
    .select("*")
    .order("listed_at", { ascending: false });
  if (error) throw new Error(error.message);
  const extras = await loadExtras();
  return (data ?? []).map((row) => applyExtra(rowToFlat(row), extras[row.id]));
}

export async function saveFlat(flat: Flat) {
  const includeExtraColumns = await hasExtraColumns();
  const { error } = await getSupabaseAdmin()
    .from("flats")
    .upsert(flatToRow(flat, includeExtraColumns), { onConflict: "id" });
  if (error) throw new Error(error.message);
  await writeFlatExtra(flat);
  return flat;
}

function imagePaths(images: unknown) {
  if (!Array.isArray(images)) return [];
  return images
    .filter((image): image is string => typeof image === "string")
    .map(bucketObjectPath)
    .filter((objectPath): objectPath is string => Boolean(objectPath));
}

async function removeStoragePaths(paths: string[]) {
  const unique = [...new Set(paths)];
  if (!unique.length) return;
  const { error } = await getSupabaseAdmin().storage.from(BUCKET).remove(unique);
  if (error) throw new Error(error.message);
}

export async function removeFlat(id: string) {
  const { data, error: readError } = await getSupabaseAdmin().from("flats").select("id, images");
  if (readError) throw new Error(readError.message);
  const rows = data ?? [];
  const current = rows.find((row) => row.id === id);
  const stillUsed = new Set(
    rows.filter((row) => row.id !== id).flatMap((row) => imagePaths(row.images)),
  );
  const owned = imagePaths(current?.images).filter((objectPath) => !stillUsed.has(objectPath));
  const { error } = await getSupabaseAdmin().from("flats").delete().eq("id", id);
  if (error) throw new Error(error.message);
  const extras = await loadExtras();
  if (extras[id]) {
    delete extras[id];
    await saveExtras(extras);
  }
  await removeStoragePaths(owned);
}

let followUpColumns: boolean | null = null;
let followUpsMigrated = false;

async function hasFollowUpColumns() {
  if (followUpColumns != null) return followUpColumns;
  const { error } = await getSupabaseAdmin().from("enquiries").select("status").limit(1);
  followUpColumns = !error;
  return followUpColumns;
}

type EnquiryFollowUp = { status: EnquiryStatus; reply: string; followUpAt?: string | null };

async function loadFollowups(): Promise<Record<string, EnquiryFollowUp>> {
  const { data, error } = await getSupabaseAdmin().storage.from(BUCKET).download(FOLLOWUPS_PATH);
  if (error || !data) return {};
  const parsed = JSON.parse(await data.text()) as Record<string, EnquiryFollowUp>;
  return parsed && typeof parsed === "object" ? parsed : {};
}

async function saveFollowups(notes: Record<string, EnquiryFollowUp>) {
  const { error } = await getSupabaseAdmin()
    .storage.from(BUCKET)
    .upload(FOLLOWUPS_PATH, JSON.stringify(notes), {
      upsert: true,
      contentType: "application/json",
    });
  if (error) throw new Error(error.message);
}

function enquiryFromRow(row: Record<string, unknown>) {
  const enquiry = rowToEnquiry(row as Parameters<typeof rowToEnquiry>[0]);
  return enquiry;
}

async function migrateFollowUps(rows: Record<string, unknown>[]) {
  if (followUpsMigrated) return;
  followUpsMigrated = true;
  const notes = await loadFollowups();
  const ids = Object.keys(notes);
  if (ids.length === 0) return;
  const remaining = { ...notes };
  for (const row of rows) {
    const id = String(row.id);
    const note = notes[id];
    if (!note || !isEnquiryStatus(note.status)) continue;
    const untouched = (row.status ?? "new") === "new" && !row.reply && !row.follow_up_at;
    if (untouched) {
      const followUpAt = needsFollowUpDate(note.status) ? (note.followUpAt ?? null) : null;
      const { error } = await getSupabaseAdmin()
        .from("enquiries")
        .update({ status: note.status, reply: note.reply ?? "", follow_up_at: followUpAt })
        .eq("id", id);
      if (error) throw new Error(error.message);
      row.status = note.status;
      row.reply = note.reply ?? "";
      row.follow_up_at = followUpAt;
    }
    delete remaining[id];
  }
  await saveFollowups(remaining);
}

export async function fetchEnquiries(): Promise<Enquiry[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Record<string, unknown>[];
  if (await hasFollowUpColumns()) {
    try {
      await migrateFollowUps(rows);
    } catch {
      followUpsMigrated = false;
    }
    return rows.map((row) => enquiryFromRow(row));
  }
  const notes = await loadFollowups();
  return rows.map((row) => {
    const enquiry = enquiryFromRow(row);
    const note = notes[enquiry.id];
    return {
      ...enquiry,
      status: note && isEnquiryStatus(note.status) ? note.status : "new",
      reply: note?.reply ?? "",
      followUpAt: note?.followUpAt ?? null,
    };
  });
}

export async function saveEnquiry(enquiry: Enquiry) {
  const row = enquiryToRow(enquiry) as Record<string, unknown>;
  if (await hasFollowUpColumns()) {
    row.status = enquiry.status ?? "new";
    row.reply = enquiry.reply ?? "";
    row.follow_up_at = enquiry.followUpAt ?? null;
  }
  const { error } = await getSupabaseAdmin().from("enquiries").insert(row);
  if (error) throw new Error(error.message);
  return enquiry;
}

export async function updateEnquiry(
  id: string,
  patch: { status?: EnquiryStatus; reply?: string; followUpAt?: string | null },
) {
  const { data, error } = await getSupabaseAdmin().from("enquiries").select("*").eq("id", id);
  if (error) throw new Error(error.message);
  const row = data?.[0] as Record<string, unknown> | undefined;
  if (!row) throw new Error("Enquiry not found");
  if (!(await hasFollowUpColumns())) {
    const notes = await loadFollowups();
    const current = notes[id] ?? { status: "new" as const, reply: "", followUpAt: null };
    const status = patch.status ?? current.status;
    const followUpAt = needsFollowUpDate(status) ? (patch.followUpAt ?? current.followUpAt ?? null) : null;
    if (needsFollowUpDate(status) && !followUpAt) {
      throw new Error("Choose a date and time for this follow-up.");
    }
    notes[id] = { status, reply: patch.reply ?? current.reply, followUpAt };
    await saveFollowups(notes);
    return notes[id];
  }
  const currentStatus = isEnquiryStatus(row.status) ? row.status : "new";
  const status = patch.status ?? currentStatus;
  const followUpAt = needsFollowUpDate(status)
    ? (patch.followUpAt ?? (typeof row.follow_up_at === "string" ? row.follow_up_at : null))
    : null;
  if (needsFollowUpDate(status) && !followUpAt) {
    throw new Error("Choose a date and time for this follow-up.");
  }
  const reply = patch.reply ?? (typeof row.reply === "string" ? row.reply : "");
  const { error: updateError } = await getSupabaseAdmin()
    .from("enquiries")
    .update({ status, reply, follow_up_at: followUpAt })
    .eq("id", id);
  if (updateError) throw new Error(updateError.message);
  return { status, reply, followUpAt };
}

export async function removeEnquiry(id: string) {
  const { error } = await getSupabaseAdmin().from("enquiries").delete().eq("id", id);
  if (error) throw new Error(error.message);
  if (await hasFollowUpColumns()) return;
  const notes = await loadFollowups();
  if (notes[id]) {
    delete notes[id];
    await saveFollowups(notes);
  }
}

export async function clearEnquiryRows() {
  const { error } = await getSupabaseAdmin().from("enquiries").delete().not("id", "is", null);
  if (error) throw new Error(error.message);
  if (!(await hasFollowUpColumns())) await saveFollowups({});
}

function storageName(url: string) {
  const match = url.match(/photo-([A-Za-z0-9_-]+)/);
  const id = match?.[1] ?? Buffer.from(url).toString("base64url").slice(0, 40);
  return `listings/${id}.jpg`;
}

export function publicImageUrl(objectPath: string) {
  return `${supabaseUrl()}/storage/v1/object/public/${BUCKET}/${objectPath}`;
}

const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function uploadListingFile(file: File) {
  const extension = IMAGE_TYPES[file.type];
  if (!extension) throw new Error("Upload a JPEG, PNG, WEBP, or GIF image.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Each image must be 5 MB or smaller.");
  const objectPath = `listings/${crypto.randomUUID()}.${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const { error } = await getSupabaseAdmin().storage.from(BUCKET).upload(objectPath, bytes, {
    upsert: false,
    contentType: file.type,
  });
  if (error) throw new Error(error.message);
  return publicImageUrl(objectPath);
}

async function ensureBucket() {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.storage.listBuckets();
  if (error) throw new Error(error.message);
  if (data?.some((bucket) => bucket.name === BUCKET)) return;
  const created = await admin.storage.createBucket(BUCKET, { public: true });
  if (created.error) throw new Error(created.error.message);
}

async function uploadImage(sourceUrl: string) {
  if (sourceUrl.includes(`/storage/v1/object/public/${BUCKET}/`)) return sourceUrl;
  const objectPath = storageName(sourceUrl);
  const response = await fetch(sourceUrl);
  if (!response.ok) return sourceUrl;
  const bytes = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type")?.split(";")[0] || "image/jpeg";
  const { error } = await getSupabaseAdmin().storage.from(BUCKET).upload(objectPath, bytes, {
    upsert: true,
    contentType,
  });
  if (error) throw new Error(error.message);
  return publicImageUrl(objectPath);
}

export async function tryApplySchema() {
  const sql = fs.readFileSync(path.join(process.cwd(), "supabase", "schema.sql"), "utf8");
  const ref = new URL(supabaseUrl()).hostname.split(".")[0];
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const targets = [
    `https://${ref}.supabase.co/pg/query`,
    `https://api.supabase.com/v1/projects/${ref}/database/query`,
  ];
  for (const target of targets) {
    const response = await fetch(target, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        apikey: key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    });
    if (response.ok) {
      extraColumns = null;
      return true;
    }
  }
  return false;
}

export async function seedDatabase() {
  await tryApplySchema();
  await ensureBucket();
  const includeExtraColumns = await hasExtraColumns();
  const sources = [...new Set(SEED_FLATS.flatMap((flat) => flat.images))];
  const uploaded = new Map<string, string>();
  for (const source of sources) {
    uploaded.set(source, await uploadImage(source));
  }

  const flats = SEED_FLATS.map((flat) => ({
    ...flat,
    images: flat.images.map((image) => uploaded.get(image) ?? image),
    updatedAt: new Date().toISOString(),
  }));

  const { error } = await getSupabaseAdmin()
    .from("flats")
    .upsert(
      flats.map((flat) => flatToRow(flat, includeExtraColumns)),
      { onConflict: "id" },
    );
  if (error) throw new Error(error.message);

  const extras = await loadExtras();
  for (const flat of flats) {
    const extra = extraFromFlat(flat);
    if (extra) extras[flat.id] = extra;
  }
  await saveExtras(extras);
  return { flats: flats.length, images: uploaded.size, extraColumns: includeExtraColumns };
}

export async function resetInventory() {
  const { data, error } = await getSupabaseAdmin().from("flats").select("id, images");
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  const seedIds = new Set(SEED_FLATS.map((flat) => flat.id));
  const extraRows = rows.filter((row) => !seedIds.has(row.id));
  const extraPaths = extraRows.flatMap((row) => imagePaths(row.images));
  if (extraRows.length) {
    const { error: deleteError } = await getSupabaseAdmin()
      .from("flats")
      .delete()
      .in(
        "id",
        extraRows.map((row) => row.id),
      );
    if (deleteError) throw new Error(deleteError.message);
    const extras = await loadExtras();
    let changed = false;
    for (const row of extraRows) {
      if (extras[row.id]) {
        delete extras[row.id];
        changed = true;
      }
    }
    if (changed) await saveExtras(extras);
  }
  await clearEnquiryRows();
  const seeded = await seedDatabase();
  const { data: kept, error: keptError } = await getSupabaseAdmin().from("flats").select("images");
  if (keptError) throw new Error(keptError.message);
  const keptPaths = new Set((kept ?? []).flatMap((row) => imagePaths(row.images)));
  await removeStoragePaths(extraPaths.filter((objectPath) => !keptPaths.has(objectPath)));
  return { ...seeded, removedFlats: extraRows.length };
}
