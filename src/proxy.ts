import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const hasSession = request.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-"));
  let url: string;
  let key: string;
  try {
    url = supabaseUrl();
    key = supabaseAnonKey();
  } catch {
    return response;
  }
  if (!hasSession) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  try {
    await supabase.auth.getUser();
  } catch {
    return response;
  }
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/:path*"],
};
