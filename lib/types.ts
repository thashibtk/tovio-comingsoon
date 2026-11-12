export type AccountType = "worker" | "agent" | "employer";
export type Availability = "available" | "busy" | "unavailable";
export type WorkType = "daily" | "contract" | "monthly" | "any";
export type EnquiryStatus = "new" | "viewed" | "accepted" | "declined" | "closed";

export type Category = {
  id: string;
  slug: string;
  name_en: string;
  name_hi: string;
  active?: boolean;
  sort_order?: number;
  group_slug?: string | null;
  group_en?: string | null;
  group_hi?: string | null;
};

export type WorkerSkill = {
  id?: string;
  profile_id?: string;
  category_id: string;
  skill_level: string | null;
  total_count: number;
  available_count: number;
};

export type PublicWorker = {
  id: string;
  profile_type: "individual" | "agent";
  name: string;
  photo_url: string | null;
  district: string;
  town: string;
  skill_level: string | null;
  experience: string | null;
  availability: Availability;
  available_from: string | null;
  work_type: WorkType | null;
  preferred_districts: string[] | null;
  description: string | null;
  phone?: string | null;
};

export type PublicSkill = {
  profile_id: string;
  category_id: string;
  skill_level: string | null;
  total_count: number;
  available_count: number;
  name_en: string;
  name_hi: string;
  slug: string;
};

export type ProfileRow = {
  id: string;
  account_type: AccountType | null;
  language: "en" | "hi";
  status: "active" | "inactive";
  email: string | null;
};

export type WorkerProfile = PublicWorker & {
  user_id: string;
  email: string | null;
  phone?: string | null;
};

export type EmployerProfile = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  designation: string;
  company: string | null;
  phone: string;
  district: string;
  town: string;
  promo_consent: boolean;
  created_at?: string;
};

export type HiringEnquiry = {
  id: string;
  employer_id: string;
  worker_profile_id: string;
  category_id: string | null;
  quantity: number;
  district: string;
  location: string | null;
  start_date: string | null;
  work_type: string | null;
  duration: string | null;
  budget: string | null;
  message: string | null;
  contact_preference: string | null;
  consent: boolean;
  status: EnquiryStatus;
  employer_name: string;
  employer_email: string;
  employer_phone: string;
  employer_company: string | null;
  created_at: string;
};
