import { useEffect, useMemo, useState } from "react";
import {
  disableAdminInvite,
  fetchAdminInvitesAll,
  hardDeleteAdminInvite,
  updateAdminInvite,
} from "../api.js";

const publicBaseUrl = import.meta.env.VITE_PUBLIC_BASE_URL || "";

export default function AdminInvitesPage() {
  const [invites, setInvites] = useState([]);
  const [msg, setMsg] = useState("");
  const [q, setQ] = useState("");

  const load = () => {
    setMsg("");
    fetchAdminInvitesAll({ limit: 500, q: q.trim() || undefined })
      .then((list) => setInvites(Array.isArray(list) ? list : []))
      .catch((e) => {
        setMsg(e.message || "Could not load invites");
        setInvites([]);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => invites, [invites]);

  const makeInviteLink = (token) =>
    `${(publicBaseUrl || window.location.origin).replace(/\/+$/, "")}/invite/${token}`;

  const saveRow = async (invite) => {
    try {
      const updated = await updateAdminInvite(invite.id, {
        label: invite.label || "",
        enabled: invite.enabled !== false,
        cameraEnabled: invite.cameraEnabled !== false,
      });
      setInvites((prev) => prev.map((x) => (x.id === invite.id ? { ...x, ...updated } : x)));
      setMsg("Saved.");
    } catch (e) {
      setMsg(e.message || "Could not save");
    }
  };

  const disableRow = async (invite) => {
    try {
      await disableAdminInvite(invite.id);
      setInvites((prev) => prev.map((x) => (x.id === invite.id ? { ...x, enabled: false } : x)));
      setMsg("Invite disabled.");
    } catch (e) {
      setMsg(e.message || "Could not disable");
    }
  };

  const deleteRow = async (invite) => {
    if (!window.confirm("Permanently delete this invite link?")) return;
    try {
      await hardDeleteAdminInvite(invite.id);
      setInvites((prev) => prev.filter((x) => x.id !== invite.id));
      setMsg("Invite deleted.");
    } catch (e) {
      setMsg(e.message || "Could not delete");
    }
  };

  return (
    <div className="admin-card admin-job-edit-card admin-invites-page">
      <h3 className="admin-card-title-flush">Invite links</h3>
      <p className="panel-lead panel-lead--tight">Search and manage invite links across all jobs.</p>

      <div className="admin-invites-searchbar">
        <label className="sr-only" htmlFor="invite-q">
          Search invites
        </label>
        <input
          id="invite-q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder="Search label, job, or paste invite URL"
          autoComplete="off"
        />
        <button type="button" className="btn btn-secondary" onClick={load}>
          Search
        </button>
      </div>

      {msg ? <p className="admin-msg">{msg}</p> : null}

      <div className="admin-invites-table-wrap">
        {filtered.length > 0 ? (
          <div className="admin-log-table admin-invites-table" role="region" aria-label="Invites table">
            <div className="admin-invites-table__head">
              <span>Job</span>
              <span>Label</span>
              <span>Enabled</span>
              <span>Camera</span>
              <span>Invite URL</span>
              <span>Actions</span>
            </div>
            {filtered.map((i) => {
              const inviteUrl = makeInviteLink(i.token);
              return (
                <div key={i.id} className="admin-invites-row admin-invites-row--wide">
                  <span className="admin-invites-muted">{i.jobTitle || "—"}</span>
                  <input
                    value={i.label || ""}
                    onChange={(e) =>
                      setInvites((prev) => prev.map((x) => (x.id === i.id ? { ...x, label: e.target.value } : x)))
                    }
                    aria-label="Invite label"
                  />
                  <label className="admin-checkbox admin-checkbox--compact">
                    <input
                      type="checkbox"
                      checked={i.enabled !== false}
                      onChange={(e) =>
                        setInvites((prev) =>
                          prev.map((x) => (x.id === i.id ? { ...x, enabled: e.target.checked } : x))
                        )
                      }
                    />
                  </label>
                  <label className="admin-checkbox admin-checkbox--compact">
                    <input
                      type="checkbox"
                      checked={i.cameraEnabled !== false}
                      onChange={(e) =>
                        setInvites((prev) =>
                          prev.map((x) => (x.id === i.id ? { ...x, cameraEnabled: e.target.checked } : x))
                        )
                      }
                    />
                  </label>
                  <button
                    type="button"
                    className="btn btn-ghost admin-invite-link"
                    title={inviteUrl}
                    onClick={() => navigator.clipboard.writeText(inviteUrl)}
                  >
                    <span className="admin-invite-link__text">{inviteUrl}</span>
                  </button>
                  <div className="admin-invites-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => saveRow(i)}>
                      Save
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => disableRow(i)}>
                      Disable
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => deleteRow(i)}>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="field-hint">No invites match.</p>
        )}
      </div>
    </div>
  );
}
