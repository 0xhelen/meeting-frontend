import { useEffect, useMemo, useState } from "react";
import { fetchAdminOpenLogs, setAdminToken } from "../api.js";

function formatUtcPlus8(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const shifted = new Date(d.getTime() + 8 * 60 * 60 * 1000);
  const pad = (n) => String(n).padStart(2, "0");
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())} ${pad(
    shifted.getUTCHours()
  )}:${pad(shifted.getUTCMinutes())}:${pad(shifted.getUTCSeconds())} (UTC+8)`;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [limit] = useState(100);
  const [q, setQ] = useState("");
  const [os, setOs] = useState("all");

  const loadLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const list = await fetchAdminOpenLogs({ limit, kind: "apply" });
      setLogs(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e.message || "Could not load logs");
      setLogs([]);
      setAdminToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const derivedOsOptions = useMemo(() => {
    const set = new Set();
    logs.forEach((l) => {
      if (l?.os) set.add(String(l.os));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return logs.filter((l) => {
      if (os !== "all" && String(l.os || "") !== os) return false;
      if (!needle) return true;
      const hay = [l.jobKey, l.ip, l.os, l.location?.city, l.location?.region, l.location?.country, l.createdAt]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [logs, q, os]);

  return (
    <div className="admin-card">
      <div className="admin-logs-head">
        <h3 className="admin-card-title-flush">Apply open logs</h3>
        <button type="button" className="btn btn-secondary" onClick={loadLogs} disabled={loading}>
          Refresh
        </button>
      </div>
      <p className="panel-lead panel-lead--tight">Anonymous opens of the apply flow (best-effort geo).</p>

      <div className="admin-logs-filters">
        <label className="sr-only" htmlFor="log-q">
          Filter
        </label>
        <input
          id="log-q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter IP, job key, location…"
          autoComplete="off"
        />
        <label className="sr-only" htmlFor="log-os">
          OS
        </label>
        <select id="log-os" value={os} onChange={(e) => setOs(e.target.value)}>
          <option value="all">All OS</option>
          {derivedOsOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {error ? <p className="field-error">{error}</p> : null}
      {loading ? <p className="panel-lead">Loading…</p> : null}

      <div className="admin-log-table-wrap">
        <div className="admin-log-table" role="region">
          <div className="admin-log-table__head">
            <span>Time (UTC+8)</span>
            <span>Job key</span>
            <span>OS</span>
            <span>Location</span>
            <span>IP</span>
          </div>
          {filteredLogs.map((l) => (
            <div key={l.id || l._id || `${l.createdAt}-${l.ip}`} className="admin-log-row" role="row">
              <span role="cell">{formatUtcPlus8(l.createdAt)}</span>
              <span role="cell">{l.jobKey || "—"}</span>
              <span role="cell">{l.os || "—"}</span>
              <span role="cell">
                {[l.location?.city, l.location?.region, l.location?.country].filter(Boolean).join(", ") || "Unknown"}
              </span>
              <span role="cell">{l.ip || "—"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
