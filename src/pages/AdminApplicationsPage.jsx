import { useEffect, useState } from "react";
import { fetchAdminApplications, setAdminToken } from "../api.js";

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState([]);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  const load = () => {
    setError("");
    fetchAdminApplications({ limit: 300, q: q.trim() || undefined })
      .then(setApps)
      .catch((e) => {
        setError(e.message || "Could not load");
        setApps([]);
        setAdminToken(null);
      });
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="admin-card">
      <h3 className="admin-card-title-flush">Applications</h3>
      <p className="panel-lead panel-lead--tight">Recent submissions (contact details and metadata).</p>

      <div className="admin-invites-searchbar">
        <label className="sr-only" htmlFor="app-q">
          Filter
        </label>
        <input
          id="app-q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder="Search name, email, job…"
          autoComplete="off"
        />
        <button type="button" className="btn btn-secondary" onClick={load}>
          Search
        </button>
      </div>

      {error ? <p className="field-error">{error}</p> : null}

      <div className="admin-applications-table-wrap">
        <div className="admin-log-table admin-applications-table" role="region">
          <div className="admin-applications-table__head">
            <span>When</span>
            <span>Name</span>
            <span>Email</span>
            <span>Job</span>
            <span>Location</span>
          </div>
          {apps.map((a) => (
            <div key={a.id} className="admin-application-row">
              <span>{a.submittedAt ? new Date(a.submittedAt).toLocaleString() : "—"}</span>
              <span>{a.fullName}</span>
              <span>{a.email}</span>
              <span>{a.jobTitle}</span>
              <span>
                {[a.location?.city, a.location?.region, a.location?.country].filter(Boolean).join(", ") || "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
