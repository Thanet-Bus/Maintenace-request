import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Callback from './pages/Callback';
import CompleteProfile from './pages/CompleteProfile';
import UserDashboard from './pages/UserDashboard';
import History from './pages/History';
import CreateRequest from './pages/CreateRequest';
import Tasks from './pages/Tasks';
import JobDetail from './pages/JobDetail';
import JobCompletion from './pages/JobCompletion';
import AdminGuard from './components/AdminGuard';
import AdminRequests from './pages/admin/AdminRequests';
import AdminEditRequest from './pages/admin/AdminEditRequest';
import TeamAssignment from './pages/admin/TeamAssignment';
import OnHoldManagement from './pages/admin/OnHoldManagement';
import AdminCompletedRequest from './pages/admin/AdminCompletedRequest';
import AdminReports from './pages/admin/AdminReports';
import Technicians from './pages/admin/Technicians';
import Users from './pages/admin/Users';
import './styles/theme.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/line/callback" element={<Callback />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />
        <Route
          path="/admin/requests"
          element={
            <AdminGuard>
              <AdminRequests />
            </AdminGuard>
          }
        />
        <Route
          path="/admin/technicians"
          element={
            <AdminGuard>
              <Technicians />
            </AdminGuard>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminGuard>
              <Users />
            </AdminGuard>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <AdminGuard>
              <AdminReports />
            </AdminGuard>
          }
        />
        <Route
          path="/admin/request/edit/:id"
          element={
            <AdminGuard>
              <AdminEditRequest />
            </AdminGuard>
          }
        />
        <Route
          path="/admin/request/complete/:id"
          element={
            <AdminGuard>
              <AdminCompletedRequest />
            </AdminGuard>
          }
        />
        <Route
          path="/admin/assign-team/:id"
          element={
            <AdminGuard>
              <TeamAssignment />
            </AdminGuard>
          }
        />
        <Route
          path="/admin/on-hold/:id"
          element={
            <AdminGuard>
              <OnHoldManagement />
            </AdminGuard>
          }
        />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/history" element={<History />} />
        <Route path="/request/:id" element={<JobDetail />} />
        <Route path="/request/:id/complete" element={<JobCompletion />} />
        <Route path="/create-request" element={<CreateRequest />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
