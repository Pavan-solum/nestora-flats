import { staffAllows } from "@/lib/supabase/admin-auth";
import { clearEnquiryRows, fetchEnquiries, saveEnquiry } from "@/lib/supabase/records";
import { createId } from "@/lib/storage";
import type { Enquiry } from "@/lib/types";
import { firstFieldError, validateEnquiry } from "@/lib/validation";

export async function GET() {
  if (!(await staffAllows("readEnquiries"))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return Response.json(await fetchEnquiries());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load enquiries";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as Omit<Enquiry, "id" | "createdAt">;
  const fields = validateEnquiry(body);
  const message = firstFieldError(fields);
  if (message) {
    return Response.json({ error: message, fields }, { status: 400 });
  }
  const enquiry: Enquiry = {
    ...body,
    name: body.name.trim(),
    email: body.email.trim(),
    phone: body.phone.trim(),
    message: body.message.trim(),
    id: createId("enq"),
    createdAt: new Date().toISOString(),
  };
  try {
    await saveEnquiry(enquiry);
    return Response.json(enquiry);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save enquiry";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  if (!(await staffAllows("clearEnquiries"))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await clearEnquiryRows();
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not clear enquiries";
    return Response.json({ error: message }, { status: 500 });
  }
}
