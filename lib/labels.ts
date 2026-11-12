import type { Dictionary, Lang } from "./dictionary";
import { districtName } from "./data";
import type { Category } from "./types";

export function categoryName(category: { name_en: string; name_hi: string }, lang: Lang) {
  return lang === "hi" ? category.name_hi : category.name_en;
}

export function skillLabel(t: Dictionary, value?: string | null) {
  if (value === "helper") return t.skill.helper;
  if (value === "semi") return t.skill.semi;
  if (value === "skilled") return t.skill.skilled;
  if (value === "supervisor") return t.skill.supervisor;
  return t.skill.none;
}

export function workLabel(t: Dictionary, value?: string | null) {
  if (value === "daily") return t.workType.daily;
  if (value === "contract") return t.workType.contract;
  if (value === "monthly") return t.workType.monthly;
  if (value === "any") return t.workType.any;
  return t.workType.any;
}

export function availabilityLabel(t: Dictionary, value?: string | null) {
  if (value === "busy") return t.availability.busy;
  if (value === "unavailable") return t.availability.unavailable;
  return t.availability.available;
}

export function statusLabel(t: Dictionary, value?: string | null) {
  if (value === "viewed") return t.status.viewed;
  if (value === "accepted") return t.status.accepted;
  if (value === "declined") return t.status.declined;
  if (value === "closed") return t.status.closed;
  return t.status.new;
}

export function designationLabel(t: Dictionary, value?: string | null) {
  const map: Record<string, string> = {
    contractor: t.designation.contractor,
    engineer: t.designation.engineer,
    builder: t.designation.builder,
    supervisor: t.designation.supervisor,
    company: t.designation.company,
    homeowner: t.designation.homeowner,
    other: t.designation.other,
  };
  return (value && map[value]) || value || "";
}

export function formatDistricts(ids: string[] | null | undefined, lang: Lang) {
  if (!ids?.length) return "";
  return ids.map((id) => districtName(id, lang)).join(", ");
}

export function categoryById(categories: Category[], id: string) {
  return categories.find((category) => category.id === id);
}

export function groupLabel(category: Category, lang: Lang) {
  if (lang === "hi") return category.group_hi || category.group_en || category.group_slug || "";
  return category.group_en || category.group_slug || "";
}

export function groupedCategories(categories: Category[], lang: Lang) {
  const order: string[] = [];
  const buckets = new Map<string, { label: string; items: Category[] }>();
  for (const category of categories) {
    const key = category.group_slug || category.group_en || "other";
    const label = groupLabel(category, lang) || (lang === "hi" ? "अन्य" : "Other");
    if (!buckets.has(key)) {
      buckets.set(key, { label, items: [] });
      order.push(key);
    }
    buckets.get(key)!.items.push(category);
  }
  return order.map((key) => buckets.get(key)!);
}
