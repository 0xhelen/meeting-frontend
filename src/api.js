//const BASE = import.meta.env.VITE_API_BASE || "";
const BASE = import.meta.env.VITE_API_BASE || "";

function authHeaders() {
  const token = localStorage.getItem("adminToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchPublicJobs() {
  const res = await fetch(`${BASE}/api/jobs`);
  if (!res.ok) throw new Error("Could not load positions");
  const data = await res.json();
  return data.jobs || [];
}

export async function fetchJobQuestions(jobId) {
  const res = await fetch(`${BASE}/api/jobs/${encodeURIComponent(jobId)}/questions`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Could not load this application");
  return data;
}

export async function fetchInviteQuestions(token) {
  const res = await fetch(`${BASE}/api/invites/${encodeURIComponent(token)}/questions`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Could not load this application");
  return data;
}

export async function logApplyOpen(payload) {
  await fetch(`${BASE}/api/open-log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
}

export async function submitApplication(formData) {
  const res = await fetch(`${BASE}/api/applications`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Submission failed");
  return data;
}

export function getAdminToken() {
  return localStorage.getItem("adminToken");
}

export function setAdminToken(token) {
  if (token) localStorage.setItem("adminToken", token);
  else localStorage.removeItem("adminToken");
}

export async function adminLogin(username, password) {
  const res = await fetch(`${BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data.token;
}

export async function fetchAdminJobs() {
  const res = await fetch(`${BASE}/api/admin/jobs`, { headers: { ...authHeaders() } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Could not load positions");
  return data.jobs || [];
}

export async function fetchAdminJob(jobId) {
  const res = await fetch(`${BASE}/api/admin/jobs/${encodeURIComponent(jobId)}`, {
    headers: { ...authHeaders() },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Could not load job");
  return data;
}

export async function createAdminJob(title) {
  const res = await fetch(`${BASE}/api/admin/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ title }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Could not create position");
  return data;
}

export async function saveAdminJob(jobId, payload) {
  const res = await fetch(`${BASE}/api/admin/jobs/${encodeURIComponent(jobId)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Save failed");
  return data;
}

export async function deleteAdminJob(jobId) {
  const res = await fetch(`${BASE}/api/admin/jobs/${encodeURIComponent(jobId)}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Could not delete");
  return data;
}

export async function fetchAdminInvites(jobId) {
  const res = await fetch(`${BASE}/api/admin/jobs/${encodeURIComponent(jobId)}/invites`, {
    headers: { ...authHeaders() },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Could not load invites");
  return data.invites || [];
}

export async function fetchAdminInvitesAll({ limit = 500, jobId, q } = {}) {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  if (jobId) params.set("jobId", jobId);
  if (q) params.set("q", q);
  const res = await fetch(`${BASE}/api/admin/invites?${params}`, { headers: { ...authHeaders() } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Could not load invites");
  return data.invites || [];
}

export async function createAdminInvite(jobId, payload) {
  const res = await fetch(`${BASE}/api/admin/jobs/${encodeURIComponent(jobId)}/invites`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload || {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Could not create invite");
  return data;
}

export async function disableAdminInvite(inviteId) {
  const res = await fetch(`${BASE}/api/admin/invites/${encodeURIComponent(inviteId)}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Could not disable invite");
  return data;
}

export async function hardDeleteAdminInvite(inviteId) {
  const res = await fetch(`${BASE}/api/admin/invites/${encodeURIComponent(inviteId)}/hard`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Could not delete invite");
  return data;
}

export async function updateAdminInvite(inviteId, payload) {
  const res = await fetch(`${BASE}/api/admin/invites/${encodeURIComponent(inviteId)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload || {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Could not update invite");
  return data;
}

export async function fetchAdminSettings() {
  const res = await fetch(`${BASE}/api/admin/settings`, { headers: { ...authHeaders() } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Could not load settings");
  return data;
}

export async function saveAdminSettings(payload) {
  const res = await fetch(`${BASE}/api/admin/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload || {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Could not save settings");
  return data;
}

export async function fetchAdminApplications({ limit = 200, q } = {}) {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  if (q) params.set("q", q);
  const res = await fetch(`${BASE}/api/admin/applications?${params}`, { headers: { ...authHeaders() } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Could not load applications");
  return data.applications || [];
}

export async function fetchAdminOpenLogs({ limit = 100, kind = "apply" } = {}) {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("kind", kind);
  const res = await fetch(`${BASE}/api/admin/open-logs?${params}`, { headers: { ...authHeaders() } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Could not load logs");
  return data.logs || [];
}
