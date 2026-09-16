"use client";

import { useState } from "react";
import { login } from "@/app/admin/actions";
import { useRouter } from "next/navigation";

export default function AdminLoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    
    const result = await login(formData);
    
    if (result.success) {
      router.refresh();
    } else {
      setError(result.error || "Login failed");
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h2>Admin Access</h2>
        <form action={handleSubmit} className="modal-form">
          <div className="form-group">
            <input
              type="email"
              name="email"
              required
              placeholder="Admin Email"
              className="form-input"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              name="password"
              required
              placeholder="Password"
              className="form-input"
              disabled={loading}
            />
          </div>
          {error && <p className="modal-error">{error}</p>}
          <button type="submit" className="form-button" disabled={loading}>
            {loading ? "AUTHENTICATING..." : "LOGIN"}
          </button>
        </form>
      </div>
    </div>
  );
}
