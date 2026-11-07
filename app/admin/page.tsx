import AdminConsole from "@/components/AdminConsole";
import AdminLoginForm from "@/components/AdminLoginForm";
import { logout } from "./actions";
import { cookies } from "next/headers";
import { getSupabaseAdmin, isAdminConfigured } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function AdminPage() {
  const isAuthenticated = cookies().get("admin_auth")?.value === "true";
  if (!isAuthenticated) return <AdminLoginForm />;

  if (!isAdminConfigured()) {
    return (
      <AdminShell>
        <p className="modal-error">
          Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, then run supabase/schema.sql.
        </p>
      </AdminShell>
    );
  }

  const admin = getSupabaseAdmin();
  const [profiles, workers, skills, employers, enquiries, categories, contacts] = await Promise.all([
    admin.from("profiles").select("*"),
    admin.from("worker_profiles").select("*"),
    admin.from("worker_skills").select("profile_id, available_count"),
    admin.from("employer_profiles").select("*").order("created_at", { ascending: false }),
    admin.from("hiring_enquiries").select("*").order("created_at", { ascending: false }),
    admin.from("worker_categories").select("*").order("sort_order"),
    admin.from("contact_messages").select("*").order("created_at", { ascending: false }),
  ]);

  const error = [profiles.error, workers.error, employers.error, enquiries.error, categories.error, contacts.error].find(Boolean);
  if (error) {
    return (
      <AdminShell>
        <p className="modal-error">
          {error.message}. Run supabase/schema.sql in the Supabase SQL editor if the tables are missing.
        </p>
      </AdminShell>
    );
  }

  const profileById = new Map((profiles.data ?? []).map((profile) => [profile.id, profile]));
  const workerById = new Map((workers.data ?? []).map((worker) => [worker.id, worker]));
  const categoryById = new Map((categories.data ?? []).map((category) => [category.id, category]));
  const activeWorkerIds = new Set(
    (workers.data ?? [])
      .filter((worker) => profileById.get(worker.user_id)?.status === "active")
      .map((worker) => worker.id)
  );
  const availableCount = (skills.data ?? [])
    .filter((skill) => activeWorkerIds.has(skill.profile_id))
    .reduce((sum, skill) => sum + Number(skill.available_count || 0), 0);

  return (
    <AdminShell>
      <div className="admin-stats">
        <Stat label="Accounts" value={profiles.data?.length ?? 0} />
        <Stat label="Worker profiles" value={workers.data?.length ?? 0} />
        <Stat label="Available workers" value={availableCount} />
        <Stat label="Employers" value={employers.data?.length ?? 0} />
        <Stat label="Enquiries" value={enquiries.data?.length ?? 0} />
      </div>
      <AdminConsole
        workers={(workers.data ?? []).map((worker) => ({
          userId: worker.user_id,
          name: worker.name,
          email: worker.email ?? "",
          type: worker.profile_type,
          district: worker.district,
          town: worker.town,
          availability: worker.availability,
          status: profileById.get(worker.user_id)?.status ?? "active",
        }))}
        employers={(employers.data ?? []).map((employer) => ({
          name: employer.full_name,
          email: employer.email,
          phone: employer.phone,
          designation: employer.designation,
          company: employer.company ?? "",
          district: employer.district,
          town: employer.town,
          promo: employer.promo_consent,
          createdAt: employer.created_at,
        }))}
        enquiries={(enquiries.data ?? []).map((enquiry) => ({
          id: enquiry.id,
          createdAt: enquiry.created_at,
          employer: enquiry.employer_name,
          email: enquiry.employer_email,
          phone: enquiry.employer_phone,
          worker: workerById.get(enquiry.worker_profile_id)?.name ?? enquiry.worker_profile_id,
          category: categoryById.get(enquiry.category_id)?.name_en ?? "",
          quantity: enquiry.quantity,
          district: enquiry.district,
          status: enquiry.status,
        }))}
        categories={(categories.data ?? []).map((category) => ({
          id: category.id,
          name_en: category.name_en,
          name_hi: category.name_hi,
          active: category.active,
        }))}
        contacts={(contacts.data ?? []).map((message) => ({
          name: message.name,
          email: message.email,
          topic: message.topic ?? "",
          message: message.message,
          createdAt: message.created_at,
        }))}
      />
    </AdminShell>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>TOVIO admin</h1>
          <form action={logout}>
            <button type="submit" className="logout-btn">Log out</button>
          </form>
        </div>
      </div>
      <div className="admin-content">{children}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}
