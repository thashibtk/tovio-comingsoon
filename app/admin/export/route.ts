import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseAdmin, isAdminConfigured } from "@/lib/supabase-admin";

function csvEscape(value: unknown) {
  const text = value == null ? "" : String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function toCsv(rows: Record<string, unknown>[]) {
  const headers = Object.keys(rows[0] ?? { empty: "" });
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ];
  return lines.join("\n");
}

export async function GET(request: Request) {
  if (cookies().get("admin_auth")?.value !== "true") {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  if (!isAdminConfigured()) {
    return new NextResponse("Supabase admin is not configured", { status: 500 });
  }

  const kind = new URL(request.url).searchParams.get("kind");
  const admin = getSupabaseAdmin();
  let filename = "tovio.csv";
  let rows: Record<string, unknown>[] = [];

  if (kind === "employers") {
    filename = "tovio-employers.csv";
    const { data, error } = await admin.from("employer_profiles").select("*").order("created_at", { ascending: false });
    if (error) return new NextResponse(error.message, { status: 500 });
    rows = (data ?? []).map((row) => ({
      name: row.full_name,
      email: row.email,
      phone: row.phone,
      designation: row.designation,
      company: row.company,
      district: row.district,
      town: row.town,
      promotional_consent: row.promo_consent,
      registered: row.created_at,
    }));
  } else if (kind === "enquiries") {
    filename = "tovio-enquiries.csv";
    const { data, error } = await admin.from("hiring_enquiries").select("*").order("created_at", { ascending: false });
    if (error) return new NextResponse(error.message, { status: 500 });
    rows = (data ?? []).map((row) => ({
      date: row.created_at,
      employer: row.employer_name,
      email: row.employer_email,
      phone: row.employer_phone,
      company: row.employer_company,
      worker_profile_id: row.worker_profile_id,
      category_id: row.category_id,
      quantity: row.quantity,
      district: row.district,
      location: row.location,
      start_date: row.start_date,
      work_type: row.work_type,
      duration: row.duration,
      budget: row.budget,
      message: row.message,
      contact_preference: row.contact_preference,
      consent: row.consent,
      status: row.status,
    }));
  } else if (kind === "contacts") {
    filename = "tovio-contact-messages.csv";
    const { data, error } = await admin.from("contact_messages").select("*").order("created_at", { ascending: false });
    if (error) return new NextResponse(error.message, { status: 500 });
    rows = data ?? [];
  } else {
    return new NextResponse("Unknown export", { status: 400 });
  }

  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
