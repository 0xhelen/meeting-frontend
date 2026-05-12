import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { adminLogin, getAdminToken, setAdminToken } from "../api.js";
import SiteHeader from "../components/SiteHeader.jsx";

export default function AdminShell() {
  const [authenticated, setAuthenticated] = useState(!!getAdminToken());
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const token = await adminLogin(username, password);
      setAdminToken(token);
      setAuthenticated(true);
      setPassword("");
    } catch (err) {
      setLoginError(err.message || "Login failed");
    }
  };

  const logout = () => {
    setAdminToken(null);
    setAuthenticated(false);
  };

  return (
    <div className="admin-page">
      <SiteHeader
        eyebrow="Staff"
        title="Recruiting administration"
        subtitle="Create and publish job postings, define application prompts, and review apply activity."
      />

      <main id="main-content" className="main-panel" tabIndex={-1}>
        {!authenticated ? (
          <form className="application-form" onSubmit={handleLogin}>
            <h2 className="panel-title">Sign in</h2>
            <p className="panel-lead">Staff access only.</p>
            <div className="field">
              <label htmlFor="adm-user">Username</label>
              <input
                id="adm-user"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="field">
              <label htmlFor="adm-pass">Password</label>
              <input
                id="adm-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            {loginError ? <p className="field-error">{loginError}</p> : null}
            <footer className="form-actions form-actions--compact">
              <Link to="/" className="btn btn-ghost">
                Back to openings
              </Link>
              <button type="submit" className="btn btn-primary">
                Sign in
              </button>
            </footer>
          </form>
        ) : (
          <div className="admin-shell-body">
            <div className="admin-toolbar">
              <button type="button" className="btn btn-secondary" onClick={logout}>
                Sign out
              </button>
              <NavLink
                to="/jsg/jobs"
                className={({ isActive }) => `btn btn-secondary ${isActive ? "btn-primary" : ""}`}
              >
                Manage jobs
              </NavLink>
              <Link to="/" className="btn btn-ghost">
                Public site
              </Link>
            </div>

            <nav className="admin-tab-bar" aria-label="Admin sections">
              <NavLink to="/jsg/jobs" className={({ isActive }) => `admin-tab ${isActive ? "admin-tab--active" : ""}`}>
                Jobs
              </NavLink>
              <NavLink to="/jsg/invites" className={({ isActive }) => `admin-tab ${isActive ? "admin-tab--active" : ""}`}>
                Invite links
              </NavLink>
              <NavLink
                to="/jsg/applications"
                className={({ isActive }) => `admin-tab ${isActive ? "admin-tab--active" : ""}`}
              >
                Applications
              </NavLink>
              <NavLink to="/jsg/logs" className={({ isActive }) => `admin-tab ${isActive ? "admin-tab--active" : ""}`}>
                Apply logs
              </NavLink>
              <NavLink
                to="/jsg/settings"
                className={({ isActive }) => `admin-tab ${isActive ? "admin-tab--active" : ""}`}
              >
                Settings
              </NavLink>
            </nav>

            <Outlet />
          </div>
        )}
      </main>
    </div>
  );
}
