import { NextResponse } from "next/server";
import { searchPublicWorkers } from "@/lib/search-workers";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ workers: [], hasMore: false, error: true }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  try {
    const result = await searchPublicWorkers({
      q: searchParams.get("q") ?? "",
      district: searchParams.get("district") ?? "",
      category: searchParams.get("category") ?? "",
      availability: searchParams.get("availability") ?? "",
      type: searchParams.get("type") ?? "",
      min: Number(searchParams.get("min") || 0),
      offset: Number(searchParams.get("offset") || 0),
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ workers: [], hasMore: false, error: true }, { status: 500 });
  }
}
