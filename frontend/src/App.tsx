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
import AdminLogin from './pages/admin/AdminLogin';
import AdminRequests from './pages/admin/AdminRequests';
import AdminEditRequest from './pages/admin/AdminEditRequest';
import TeamAssignment from './pages/admin/TeamAssignment';
import OnHoldManagement from './pages/admin/OnHoldManagement';
import AdminCompletedRequest from './pages/admin/AdminCompletedRequest';
import Technicians from './pages/admin/Technicians';
import './styles/theme.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/line/callback" element={<Callback />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/requests" element={<AdminRequests />} />
        <Route path="/admin/technicians" element={<Technicians />} />
        <Route path="/admin/request/edit/:id" element={<AdminEditRequest />} />
        <Route path="/admin/request/complete/:id" element={<AdminCompletedRequest />} />
        <Route path="/admin/assign-team/:id" element={<TeamAssignment />} />
        <Route path="/admin/on-hold/:id" element={<OnHoldManagement />} />
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
