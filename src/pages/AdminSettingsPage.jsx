import { useEffect, useState } from "react";
import { fetchAdminSettings, saveAdminSettings } from "../api.js";

export default function AdminSettingsPage() {
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminSettings()
      .then((s) => setCameraEnabled(s.cameraEnabled !== false))
      .catch(() => setMsg("Could not load settings"))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setMsg("");
    try {
      await saveAdminSettings({ cameraEnabled });
      setMsg("Saved.");
    } catch (e) {
      setMsg(e.message || "Could not save");
    }
  };

  return (
    <div className="admin-card">
      <h3 className="admin-card-title-flush">Settings</h3>
      <p className="panel-lead panel-lead--tight">
        Global camera default matters when no invite link is used. Invite links have their own camera setting per link.
      </p>

      {loading ? <p className="panel-lead">Loading…</p> : null}

      <label className="admin-checkbox">
        <input
          type="checkbox"
          checked={cameraEnabled}
          onChange={(e) => setCameraEnabled(e.target.checked)}
        />
        <span>Global camera available (when not overridden by an invite)</span>
      </label>

      <footer className="form-actions">
        <button type="button" className="btn btn-primary" onClick={save}>
          Save settings
        </button>
      </footer>

      {msg ? <p className="admin-msg">{msg}</p> : null}

      <p className="field-hint">
        Set <code className="home-inline-code">PUBLIC_BASE_URL</code> in the API server <code className="home-inline-code">.env</code>{" "}
        for invite link prefixes. For local dev, optional{" "}
        <code className="home-inline-code">VITE_PUBLIC_BASE_URL</code> in the client env matches production invite URLs.
      </p>
    </div>
  );
}
