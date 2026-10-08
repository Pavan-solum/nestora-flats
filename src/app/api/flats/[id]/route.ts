import { staffAllows } from "@/lib/supabase/admin-auth";
import { saveFlat } from "@/lib/supabase/records";
import { removeFlat } from "@/lib/supabase/records";
import type { FlatInput } from "@/lib/types";
import { firstFieldError, validateFlatInput } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  if (!(await staffAllows("writeFlat"))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const input = (await request.json()) as FlatInput & { listedAt?: string };
  const fields = validateFlatInput(input);
  const message = firstFieldError(fields);
  if (message) {
    return Response.json({ error: message, fields }, { status: 400 });
  }
  const flat = {
    ...input,
    id,
    listedAt: input.listedAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  try {
    await saveFlat(flat);
    return Response.json(flat);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update flat";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  if (!(await staffAllows("deleteFlat"))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  try {
    await removeFlat(id);
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete flat";
    return Response.json({ error: message }, { status: 500 });
  }
}
