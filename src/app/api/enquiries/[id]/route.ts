import { staffAllows } from "@/lib/supabase/admin-auth";
import { removeEnquiry, updateEnquiry } from "@/lib/supabase/records";
import { isEnquiryStatus, needsFollowUpDate } from "@/lib/types";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  if (!(await staffAllows("writeEnquiry"))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const body = (await request.json()) as { status?: string; reply?: string; followUpAt?: string | null };
  if (body.status !== undefined && !isEnquiryStatus(body.status)) {
    return Response.json({ error: "Choose a follow-up status." }, { status: 400 });
  }
  if (body.reply !== undefined && typeof body.reply !== "string") {
    return Response.json({ error: "Reply must be text." }, { status: 400 });
  }
  if (body.followUpAt !== undefined && body.followUpAt !== null && Number.isNaN(new Date(body.followUpAt).getTime())) {
    return Response.json({ error: "Choose a valid date and time." }, { status: 400 });
  }
  if (body.status && needsFollowUpDate(body.status) && !body.followUpAt) {
    return Response.json({ error: "Choose a date and time for this follow-up." }, { status: 400 });
  }
  try {
    const note = await updateEnquiry(id, {
      status: isEnquiryStatus(body.status) ? body.status : undefined,
      reply: body.reply,
      followUpAt: body.followUpAt,
    });
    return Response.json(note);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update enquiry";
    const status = message === "Enquiry not found" ? 404 : 500;
    return Response.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, context: Context) {
  if (!(await staffAllows("deleteEnquiry"))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  try {
    await removeEnquiry(id);
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete enquiry";
    return Response.json({ error: message }, { status: 500 });
  }
}
