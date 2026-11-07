import { NextResponse } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  if (!isSupabaseConfigured()) return NextResponse.json({ phone: null }, { status: 503 });
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) return NextResponse.json({ phone: null }, { status: 400 });

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ phone: null }, { status: 401 });

  const member = await supabase.from("worker_phone_for_members").select("phone").eq("id", params.id).maybeSingle();
  if (!member.error) return NextResponse.json({ phone: member.data?.phone ?? null });

  const legacy = await supabase.from("worker_public").select("phone").eq("id", params.id).maybeSingle();
  if (!legacy.error && legacy.data && typeof (legacy.data as { phone?: unknown }).phone === "string") {
    return NextResponse.json({ phone: (legacy.data as { phone: string }).phone });
  }

  return NextResponse.json({ phone: null }, { status: 503 });
}
