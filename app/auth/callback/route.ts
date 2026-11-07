import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { safePath } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const cookieStore = cookies();
  const next = safePath(url.searchParams.get("next") || cookieStore.get("tovio_next")?.value);
  const role = url.searchParams.get("role") || cookieStore.get("tovio_role")?.value || "";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const params = new URLSearchParams();
      if (next) params.set("next", next);
      if (role === "worker" || role === "agent" || role === "employer") params.set("role", role);
      const response = NextResponse.redirect(
        `${url.origin}/auth/continue${params.toString() ? `?${params}` : ""}`
      );
      response.cookies.set("tovio_next", "", { path: "/", maxAge: 0 });
      response.cookies.set("tovio_role", "", { path: "/", maxAge: 0 });
      return response;
    }
  }

  return NextResponse.redirect(`${url.origin}/login?error=auth`);
}
