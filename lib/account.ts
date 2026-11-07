import { createClient } from "./supabase/server";
import type {
  Category,
  EmployerProfile,
  HiringEnquiry,
  ProfileRow,
  WorkerProfile,
  WorkerSkill,
} from "./types";

export async function loadAccount() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null as null };
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  let profile = existingProfile as ProfileRow | null;
  if (!profile) {
    const { data: created } = await supabase
      .from("profiles")
      .insert({ id: user.id, email: user.email })
      .select("*")
      .single();
    profile = created as ProfileRow | null;
  }

  const [{ data: categories }, { data: worker }, { data: employer }] = await Promise.all([
    supabase.from("worker_categories").select("*").order("sort_order"),
    supabase.from("worker_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("employer_profiles").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  const workerProfile = worker as WorkerProfile | null;
  const employerProfile = employer as EmployerProfile | null;

  let skills: WorkerSkill[] = [];
  let enquiries: HiringEnquiry[] = [];
  let workerNames: Record<string, { name: string; district: string }> = {};

  if (workerProfile) {
    const [{ data: skillRows }, { data: enquiryRows }] = await Promise.all([
      supabase.from("worker_skills").select("*").eq("profile_id", workerProfile.id),
      supabase
        .from("hiring_enquiries")
        .select("*")
        .eq("worker_profile_id", workerProfile.id)
        .order("created_at", { ascending: false }),
    ]);
    skills = (skillRows ?? []) as WorkerSkill[];
    enquiries = (enquiryRows ?? []) as HiringEnquiry[];
  } else if (employerProfile) {
    const { data: enquiryRows } = await supabase
      .from("hiring_enquiries")
      .select("*")
      .eq("employer_id", employerProfile.id)
      .order("created_at", { ascending: false });
    enquiries = (enquiryRows ?? []) as HiringEnquiry[];
    const ids = enquiries.map((enquiry) => enquiry.worker_profile_id);
    if (ids.length) {
      const { data: names } = await supabase.from("worker_public").select("id, name, district").in("id", ids);
      workerNames = Object.fromEntries(
        ((names ?? []) as { id: string; name: string; district: string }[]).map((row) => [
          row.id,
          { name: row.name, district: row.district },
        ])
      );
    }
  }

  return {
    user,
    profile,
    categories: (categories ?? []) as Category[],
    worker: workerProfile,
    employer: employerProfile,
    skills,
    enquiries,
    workerNames,
  };
}
