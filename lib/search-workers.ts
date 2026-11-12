import { DISTRICTS, townInDistrict } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import type { PublicSkill, PublicWorker } from "@/lib/types";

const PAGE_SIZE = 12;
const PROFILE_TYPES = new Set(["individual", "agent"]);

export type WorkerSearchFilters = {
  district?: string;
  town?: string;
  category?: string;
  type?: string;
  min?: number;
  offset?: number;
};

export type WorkerCard = PublicWorker & { skills: PublicSkill[] };

export async function searchPublicWorkers(filters: WorkerSearchFilters) {
  const supabase = createClient();
  const offset = clamp(filters.offset ?? 0, 0, 5000);
  const min = clamp(filters.min ?? 0, 0, 999);
  const district = DISTRICTS.some((item) => item.id === filters.district) ? filters.district : "";
  const town =
    district && filters.town && townInDistrict(district, filters.town.trim()) ? filters.town.trim() : "";
  const profileType = PROFILE_TYPES.has(filters.type ?? "") ? filters.type : "";
  const category = /^[0-9a-f-]{36}$/i.test(filters.category ?? "") ? filters.category : "";

  let allowedIds: string[] | null = null;
  if (category || min > 0) {
    allowedIds = await matchingProfileIds(category || "", min);
    if (allowedIds.length === 0) return { workers: [] as WorkerCard[], hasMore: false };
  }

  let query = supabase.from("worker_public").select("*");
  if (allowedIds) query = query.in("id", allowedIds);
  if (town) {
    // Town is on the home place only.
    query = query.eq("district", district).eq("town", town);
  } else if (district) {
    // Home district or listed under preferred districts.
    query = query.or(`district.eq.${district},preferred_districts.cs.{${district}}`);
  }
  if (profileType) query = query.eq("profile_type", profileType);

  const { data, error } = await query
    .order("availability", { ascending: true })
    .order("name", { ascending: true })
    .range(offset, offset + PAGE_SIZE);

  if (error) throw error;

  const rows = ((data ?? []) as PublicWorker[]).slice(0, PAGE_SIZE);
  const hasMore = (data ?? []).length > PAGE_SIZE;
  const ids = rows.map((worker) => worker.id);
  let skills: PublicSkill[] = [];
  if (ids.length) {
    const { data: skillRows, error: skillError } = await supabase
      .from("worker_skills_public")
      .select("*")
      .in("profile_id", ids);
    if (skillError) throw skillError;
    skills = (skillRows ?? []) as PublicSkill[];
  }

  return {
    workers: rows.map((worker) => {
      const card = {
        ...worker,
        skills: skills.filter((skill) => skill.profile_id === worker.id),
      };
      delete card.phone;
      return card;
    }),
    hasMore,
  };
}

async function matchingProfileIds(category: string, min: number) {
  const supabase = createClient();
  let skillQuery = supabase.from("worker_skills_public").select("profile_id, available_count").limit(5000);
  if (category) skillQuery = skillQuery.eq("category_id", category);
  const { data: skillRows, error } = await skillQuery;
  if (error) throw error;

  const availableByProfile = new Map<string, number>();
  for (const row of skillRows ?? []) {
    const id = String(row.profile_id);
    availableByProfile.set(id, (availableByProfile.get(id) ?? 0) + Number(row.available_count || 0));
  }

  if (min <= 0) return [...availableByProfile.keys()];

  let workerQuery = supabase.from("worker_public").select("id, profile_type, availability").limit(5000);
  const skillIds = [...availableByProfile.keys()];
  if (category) {
    if (skillIds.length === 0) return [];
    workerQuery = workerQuery.in("id", skillIds);
  }
  const { data: workers, error: workerError } = await workerQuery;
  if (workerError) throw workerError;

  return (workers ?? [])
    .filter((worker) => {
      if (worker.profile_type === "individual") return min <= 1 && worker.availability === "available";
      return (availableByProfile.get(worker.id) ?? 0) >= min;
    })
    .map((worker) => String(worker.id));
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.floor(value)));
}
