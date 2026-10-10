import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { signInStaff } from "@/lib/supabase/staff-auth";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const email = body.email?.trim() ?? "";
  if (!email || !body.password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }
  const result = await signInStaff(await getSupabaseServer(), email, body.password);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}
