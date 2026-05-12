import { Navigate, Route, Routes } from "react-router-dom";
import MobileBlockModal from "./components/MobileBlockModal.jsx";
import AdminApplicationsPage from "./pages/AdminApplicationsPage.jsx";
import AdminInvitesPage from "./pages/AdminInvitesPage.jsx";
import AdminJobsPage from "./pages/AdminJobsPage.jsx";
import AdminLogsPage from "./pages/AdminLogsPage.jsx";
import AdminSettingsPage from "./pages/AdminSettingsPage.jsx";
import AdminShell from "./pages/AdminShell.jsx";
import ApplyPage from "./pages/ApplyPage.jsx";
import JobsHome from "./pages/JobsHome.jsx";

export default function App() {
  return (
    <div className="app-shell">
      <MobileBlockModal />
      <Routes>
        <Route path="/" element={<JobsHome />} />
        <Route path="/apply/:jobId" element={<ApplyPage />} />
        <Route path="/invite/:inviteToken" element={<ApplyPage />} />
        <Route path="/jsg" element={<AdminShell />}>
          <Route index element={<Navigate to="jobs" replace />} />
          <Route path="jobs" element={<AdminJobsPage />} />
          <Route path="invites" element={<AdminInvitesPage />} />
          <Route path="applications" element={<AdminApplicationsPage />} />
          <Route path="logs" element={<AdminLogsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
