import { staffAllows } from "@/lib/supabase/admin-auth";
import { saveFlat } from "@/lib/supabase/records";
import { createId } from "@/lib/storage";
import type { Flat, FlatInput } from "@/lib/types";
import { firstFieldError, validateFlatInput } from "@/lib/validation";

export async function POST(request: Request) {
  if (!(await staffAllows("writeFlat"))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const input = (await request.json()) as FlatInput;
  const fields = validateFlatInput(input);
  const message = firstFieldError(fields);
  if (message) {
    return Response.json({ error: message, fields }, { status: 400 });
  }
  const now = new Date().toISOString();
  const flat: Flat = {
    ...input,
    id: createId("flat"),
    listedAt: now,
    updatedAt: now,
  };
  try {
    await saveFlat(flat);
    return Response.json(flat);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save flat";
    return Response.json({ error: message }, { status: 500 });
  }
}
