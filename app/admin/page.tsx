import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";
import AdminLoginForm from "@/components/AdminLoginForm";
import { logout } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = cookies();
  const isAuthenticated = cookieStore.get("admin_auth")?.value === "true";

  if (!isAuthenticated) {
    return <AdminLoginForm />;
  }

  // Fetch waitlist entries using the service role key (bypasses RLS)
  const { data: waitlist, error } = await supabaseAdmin
    .from("waitlist")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>Waitlist Dashboard</h1>
          <form action={logout}>
            <button type="submit" className="logout-btn">Log out</button>
          </form>
        </div>
      </div>
      
      <div className="admin-content">
        <div className="admin-stats">
          <div className="stat-card">
            <span className="stat-label">Total Signups</span>
            <span className="stat-value">{waitlist?.length || 0}</span>
          </div>
        </div>

        {error ? (
          <div className="modal-error" style={{ marginBottom: "20px" }}>
            Failed to load waitlist: {error.message}
          </div>
        ) : (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Sl No.</th>
                  <th>Email Address</th>
                  <th>Signup Date</th>
                </tr>
              </thead>
              <tbody>
                {waitlist?.map((entry, index) => (
                  <tr key={entry.id}>
                    <td>{index + 1}</td>
                    <td>{entry.email}</td>
                    <td>{new Date(entry.created_at).toLocaleString()}</td>
                  </tr>
                ))}
                {waitlist?.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center", padding: "40px" }}>
                      No signups yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
