import { useEffect, useState } from "react";
import {
  createAdminInvite,
  createAdminJob,
  deleteAdminJob,
  disableAdminInvite,
  fetchAdminInvites,
  fetchAdminJob,
  fetchAdminJobs,
  saveAdminJob,
  updateAdminInvite,
} from "../api.js";

const publicBaseUrl = import.meta.env.VITE_PUBLIC_BASE_URL || "";

function msgClass(msg) {
  return /fail|Could not|Cannot/i.test(msg || "") ? "error" : "";
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState(null);
  const [msg, setMsg] = useState("");
  const [inviteMsg, setInviteMsg] = useState("");
  const [inviteLabel, setInviteLabel] = useState("");
  const [invites, setInvites] = useState([]);
  const [newTitle, setNewTitle] = useState("");

  const loadJobs = () =>
    fetchAdminJobs()
      .then(setJobs)
      .catch(() => setJobs([]));

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDraft(null);
      setInvites([]);
      return;
    }
    setMsg("");
    fetchAdminJob(selectedId)
      .then(setDraft)
      .catch(() => setDraft(null));
    fetchAdminInvites(selectedId)
      .then((list) => setInvites(Array.isArray(list) ? list : []))
      .catch(() => setInvites([]));
  }, [selectedId]);

  const persist = async () => {
    if (!draft?.id) return;
    setMsg("");
    try {
      const saved = await saveAdminJob(draft.id, {
        title: draft.title,
        published: draft.published,
        steps: draft.steps,
        video: draft.video,
      });
      setDraft(saved);
      setMsg("Saved.");
      loadJobs();
    } catch (e) {
      setMsg(e.message || "Save failed");
    }
  };

  const createJob = async () => {
    setMsg("");
    try {
      const j = await createAdminJob(newTitle.trim() || "New position");
      setNewTitle("");
      await loadJobs();
      setSelectedId(j.id);
      setMsg("Created.");
    } catch (e) {
      setMsg(e.message || "Could not create");
    }
  };

  const removeJob = async () => {
    if (!selectedId || !window.confirm("Delete this job and its invite links?")) return;
    setMsg("");
    try {
      await deleteAdminJob(selectedId);
      setSelectedId("");
      setDraft(null);
      await loadJobs();
      setMsg("Deleted.");
    } catch (e) {
      setMsg(e.message || "Could not delete");
    }
  };

  const createInvite = async () => {
    if (!selectedId) return;
    setInviteMsg("");
    try {
      const inv = await createAdminInvite(selectedId, { label: inviteLabel.trim() });
      setInviteLabel("");
      setInvites((prev) => [inv, ...prev]);
      setInviteMsg("Invite created.");
    } catch (e) {
      setInviteMsg(e.message || "Could not create invite");
    }
  };

  const revokeInvite = async (inviteId) => {
    setInviteMsg("");
    try {
      await disableAdminInvite(inviteId);
      setInvites((prev) => prev.map((i) => (i.id === inviteId ? { ...i, enabled: false } : i)));
      setInviteMsg("Invite disabled.");
    } catch (e) {
      setInviteMsg(e.message || "Could not disable");
    }
  };

  const saveInviteRow = async (inviteId, patch) => {
    setInviteMsg("");
    try {
      const updated = await updateAdminInvite(inviteId, patch);
      setInvites((prev) => prev.map((i) => (i.id === inviteId ? { ...i, ...updated } : i)));
      setInviteMsg("Invite updated.");
    } catch (e) {
      setInviteMsg(e.message || "Could not update");
    }
  };

  const makeInviteLink = (token) =>
    `${(publicBaseUrl || window.location.origin).replace(/\/+$/, "")}/invite/${token}`;

  const updateStep = (idx, field, value) => {
    setDraft((d) => {
      if (!d) return d;
      const steps = [...d.steps];
      steps[idx] = { ...steps[idx], [field]: value };
      return { ...d, steps };
    });
  };

  return (
    <div className="admin-card admin-job-edit-card">
      <div className="admin-job-layout">
        <aside className="admin-job-list-panel">
          <h3 className="admin-card-title-flush">Jobs</h3>
          <div className="admin-inline-form admin-inline-form--stack">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="New job title"
              aria-label="New job title"
            />
            <button type="button" className="btn btn-primary" onClick={createJob}>
              Create
            </button>
          </div>
          <ul className="admin-job-picker">
            {jobs.map((j) => (
              <li key={j.id}>
                <button
                  type="button"
                  className={`admin-job-picker__btn ${selectedId === j.id ? "is-selected" : ""}`}
                  onClick={() => setSelectedId(j.id)}
                >
                  {j.title}
                  {j.published ? <span className="admin-badge">Live</span> : null}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="admin-job-editor">
          {!draft ? (
            <p className="panel-lead">Select a job or create one.</p>
          ) : (
            <>
              <div className="admin-job-editor__head">
                <h3 className="admin-card-title-flush">Edit job</h3>
                {msg ? <p className={`admin-msg ${msgClass(msg)}`}>{msg}</p> : null}
              </div>

              <div className="field">
                <label htmlFor="job-title">Title</label>
                <input
                  id="job-title"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                />
              </div>

              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  checked={!!draft.published}
                  onChange={(e) => setDraft({ ...draft, published: e.target.checked })}
                />
                <span>Published (visible on public site)</span>
              </label>

              <section className="admin-job-section" aria-labelledby="questions-heading">
                <h4 id="questions-heading" className="admin-job-section__title">
                  Written questions
                </h4>
                {draft.steps?.map((s, idx) => (
                  <div key={s.id} className="admin-question-block">
                    <div className="field">
                      <label htmlFor={`st-${idx}`}>Section title</label>
                      <input id={`st-${idx}`} value={s.title} onChange={(e) => updateStep(idx, "title", e.target.value)} />
                    </div>
                    <div className="field">
                      <label htmlFor={`pr-${idx}`}>Question</label>
                      <textarea
                        id={`pr-${idx}`}
                        rows={4}
                        value={s.prompt}
                        onChange={(e) => updateStep(idx, "prompt", e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </section>

              <section className="admin-job-section" aria-labelledby="video-heading">
                <h4 id="video-heading" className="admin-job-section__title">
                  Video introduction
                </h4>
                <div className="field">
                  <label htmlFor="video-title">Title</label>
                  <input
                    id="video-title"
                    value={draft.video?.title || ""}
                    onChange={(e) => setDraft({ ...draft, video: { ...draft.video, title: e.target.value } })}
                  />
                </div>
                <div className="field">
                  <label htmlFor="video-inst">Instructions</label>
                  <textarea
                    id="video-inst"
                    rows={3}
                    value={draft.video?.instructions || ""}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        video: { ...draft.video, instructions: e.target.value },
                      })
                    }
                  />
                </div>
              </section>

              <footer className="form-actions">
                <button type="button" className="btn btn-primary" onClick={persist}>
                  Save changes
                </button>
                <button type="button" className="btn btn-secondary" onClick={removeJob}>
                  Delete job
                </button>
              </footer>

              <section className="admin-job-section" aria-labelledby="job-edit-invites-heading">
                <h4 id="job-edit-invites-heading" className="admin-job-section__title">
                  Invite links
                </h4>
                <p className="admin-job-section__lead">Create invite links for this job.</p>
                <div className="admin-inline-form" role="group" aria-label="Create invite link">
                  <input
                    value={inviteLabel}
                    onChange={(e) => setInviteLabel(e.target.value)}
                    placeholder="Label (optional)"
                    aria-label="Invite label"
                  />
                  <button type="button" className="btn btn-primary" onClick={createInvite}>
                    Create invite
                  </button>
                </div>
                {inviteMsg ? <p className={`admin-msg ${msgClass(inviteMsg)}`}>{inviteMsg}</p> : null}
                {invites?.length ? (
                  <div className="admin-invites-table-wrap">
                    <div className="admin-log-table admin-invites-table" role="region" aria-label="Invite links table">
                      <div className="admin-invites-table__head">
                        <span>Label</span>
                        <span>Enabled</span>
                        <span>Camera</span>
                        <span>Invite URL</span>
                        <span>Actions</span>
                      </div>
                      {invites.map((i) => {
                        const inviteUrl = makeInviteLink(i.token);
                        return (
                          <div key={i.id} className="admin-invites-row">
                            <input
                              value={i.label || ""}
                              onChange={(e) =>
                                setInvites((prev) =>
                                  prev.map((x) => (x.id === i.id ? { ...x, label: e.target.value } : x))
                                )
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
                                    prev.map((x) =>
                                      x.id === i.id ? { ...x, cameraEnabled: e.target.checked } : x
                                    )
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
                              <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() =>
                                  saveInviteRow(i.id, {
                                    label: i.label || "",
                                    enabled: i.enabled !== false,
                                    cameraEnabled: i.cameraEnabled !== false,
                                  })
                                }
                              >
                                Save row
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary"
                                disabled={i.enabled === false}
                                onClick={() => revokeInvite(i.id)}
                              >
                                Disable
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="field-hint">No invite links yet.</p>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
