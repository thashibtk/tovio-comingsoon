"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function login(formData: FormData) {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  const envEmail = process.env.ADMIN_USERNAME?.trim();
  const envPassword = process.env.ADMIN_PASSWORD?.trim();

  if (
    email === envEmail &&
    password === envPassword
  ) {
    cookies().set("admin_auth", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });
    return { success: true };
  }

  return { success: false, error: "Invalid credentials" };
}

export async function logout() {
  cookies().delete("admin_auth");
  redirect("/admin");
}

async function requireAdmin() {
  if (cookies().get("admin_auth")?.value !== "true") {
    throw new Error("Unauthorized");
  }
}

export async function setProfileStatus(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId") || "");
  const status = formData.get("status") === "inactive" ? "inactive" : "active";
  if (!userId) return;
  const admin = getSupabaseAdmin();
  await admin.from("profiles").update({ status }).eq("id", userId);
  revalidatePath("/admin");
}

export async function setEnquiryStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const allowed = ["new", "viewed", "accepted", "declined", "closed"];
  if (!id || !allowed.includes(status)) return;
  const admin = getSupabaseAdmin();
  await admin.from("hiring_enquiries").update({ status }).eq("id", id);
  revalidatePath("/admin");
}

export async function saveCategory(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const nameEn = String(formData.get("name_en") || "").trim();
  const nameHi = String(formData.get("name_hi") || "").trim();
  const active = formData.get("active") === "on";
  if (!nameEn || !nameHi) return;
  const admin = getSupabaseAdmin();
  if (id) {
    await admin.from("worker_categories").update({ name_en: nameEn, name_hi: nameHi, active }).eq("id", id);
  } else {
    const slug =
      nameEn
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || `category-${Date.now()}`;
    await admin.from("worker_categories").insert({
      slug,
      name_en: nameEn,
      name_hi: nameHi,
      active: true,
      sort_order: 100,
    });
  }
  revalidatePath("/admin");
}
