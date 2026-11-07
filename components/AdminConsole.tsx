"use client";

import { useMemo, useState } from "react";
import { saveCategory, setEnquiryStatus, setProfileStatus } from "@/app/admin/actions";

type WorkerRow = {
  userId: string;
  name: string;
  email: string;
  type: string;
  district: string;
  town: string;
  availability: string;
  status: string;
};

type EmployerRow = {
  name: string;
  email: string;
  phone: string;
  designation: string;
  company: string;
  district: string;
  town: string;
  promo: boolean;
  createdAt: string;
};

type EnquiryRow = {
  id: string;
  createdAt: string;
  employer: string;
  email: string;
  phone: string;
  worker: string;
  category: string;
  quantity: number;
  district: string;
  status: string;
};

type CategoryRow = {
  id: string;
  name_en: string;
  name_hi: string;
  active: boolean;
};

type ContactRow = {
  name: string;
  email: string;
  topic: string;
  message: string;
  createdAt: string;
};

const STATUSES = ["new", "viewed", "accepted", "declined", "closed"];

export default function AdminConsole({
  workers,
  employers,
  enquiries,
  categories,
  contacts,
}: {
  workers: WorkerRow[];
  employers: EmployerRow[];
  enquiries: EnquiryRow[];
  categories: CategoryRow[];
  contacts: ContactRow[];
}) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const matches = (values: Array<string | number | boolean | null | undefined>) =>
    !needle || values.some((value) => String(value ?? "").toLowerCase().includes(needle));

  const visibleWorkers = useMemo(
    () => workers.filter((row) => matches([row.name, row.email, row.district, row.town, row.type, row.availability, row.status])),
    [workers, needle]
  );
  const visibleEmployers = useMemo(
    () => employers.filter((row) => matches([row.name, row.email, row.phone, row.district, row.designation, row.company])),
    [employers, needle]
  );
  const visibleEnquiries = useMemo(
    () => enquiries.filter((row) => matches([row.employer, row.email, row.phone, row.worker, row.category, row.district, row.status])),
    [enquiries, needle]
  );

  return (
    <div className="admin-stack">
      <div className="admin-toolbar">
        <input
          className="form-input"
          placeholder="Search name, email, phone, district"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <a className="admin-action" href="/admin/export?kind=employers">Export employers</a>
        <a className="admin-action" href="/admin/export?kind=enquiries">Export enquiries</a>
        <a className="admin-action" href="/admin/export?kind=contacts">Export messages</a>
      </div>

      <section>
        <h2>Worker and agent profiles</h2>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>District</th>
                <th>Availability</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visibleWorkers.map((row) => (
                <tr key={row.userId}>
                  <td>
                    {row.name}
                    <br />
                    <span className="muted">{row.email}</span>
                  </td>
                  <td>{row.type}</td>
                  <td>
                    {row.district}
                    {row.town ? `, ${row.town}` : ""}
                  </td>
                  <td>{row.availability}</td>
                  <td>{row.status}</td>
                  <td>
                    <form action={setProfileStatus}>
                      <input type="hidden" name="userId" value={row.userId} />
                      <input type="hidden" name="status" value={row.status === "active" ? "inactive" : "active"} />
                      <button className="admin-action" type="submit">
                        {row.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {visibleWorkers.length === 0 ? (
                <tr>
                  <td colSpan={6}>No profiles.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>Employers</h2>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Designation</th>
                <th>District</th>
                <th>Promo</th>
              </tr>
            </thead>
            <tbody>
              {visibleEmployers.map((row) => (
                <tr key={`${row.email}-${row.createdAt}`}>
                  <td>
                    {row.name}
                    {row.company ? <><br /><span className="muted">{row.company}</span></> : null}
                  </td>
                  <td>
                    {row.email}
                    <br />
                    {row.phone}
                  </td>
                  <td>{row.designation}</td>
                  <td>
                    {row.district}
                    {row.town ? `, ${row.town}` : ""}
                  </td>
                  <td>{row.promo ? "Yes" : "No"}</td>
                </tr>
              ))}
              {visibleEmployers.length === 0 ? (
                <tr>
                  <td colSpan={5}>No employers.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>Hiring enquiries</h2>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Employer</th>
                <th>Worker</th>
                <th>Need</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleEnquiries.map((row) => (
                <tr key={row.id}>
                  <td>{new Date(row.createdAt).toLocaleString()}</td>
                  <td>
                    {row.employer}
                    <br />
                    <span className="muted">{row.email} · {row.phone}</span>
                  </td>
                  <td>{row.worker}</td>
                  <td>
                    {row.category} · {row.quantity}
                    <br />
                    <span className="muted">{row.district}</span>
                  </td>
                  <td>
                    <form action={setEnquiryStatus} className="inline-form">
                      <input type="hidden" name="id" value={row.id} />
                      <select name="status" defaultValue={row.status} className="form-input">
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <button className="admin-action" type="submit">Save</button>
                    </form>
                  </td>
                </tr>
              ))}
              {visibleEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={5}>No enquiries.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>Categories</h2>
        <form action={saveCategory} className="inline-form category-create">
          <input className="form-input" name="name_en" placeholder="English name" required />
          <input className="form-input" name="name_hi" placeholder="Hindi name" required />
          <button className="admin-action" type="submit">Add category</button>
        </form>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>English</th>
                <th>Hindi</th>
                <th>Active</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td colSpan={4}>
                    <form action={saveCategory} className="inline-form">
                      <input type="hidden" name="id" value={category.id} />
                      <input className="form-input" name="name_en" defaultValue={category.name_en} required />
                      <input className="form-input" name="name_hi" defaultValue={category.name_hi} required />
                      <label className="check-inline">
                        <input type="checkbox" name="active" defaultChecked={category.active} />
                        Active
                      </label>
                      <button className="admin-action" type="submit">Save</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>Contact messages</h2>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>From</th>
                <th>Topic</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {contacts.filter((row) => matches([row.name, row.email, row.topic, row.message])).map((row) => (
                <tr key={`${row.email}-${row.createdAt}`}>
                  <td>{new Date(row.createdAt).toLocaleString()}</td>
                  <td>
                    {row.name}
                    <br />
                    <span className="muted">{row.email}</span>
                  </td>
                  <td>{row.topic}</td>
                  <td>{row.message}</td>
                </tr>
              ))}
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan={4}>No messages.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
