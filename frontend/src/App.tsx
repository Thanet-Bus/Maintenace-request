import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import CreateRequest from './pages/CreateRequest';
import AdminLogin from './pages/AdminLogin';
import AdminRequests from './pages/AdminRequests';
import TeamAssignment from './pages/TeamAssignment';
import './styles/theme.css';

// Lazy load pages later or just import now for simplicity
const AssignTechnician = () => <div className="p-8"><h1>มอบหมายช่าง</h1></div>;
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/create-request" element={<CreateRequest />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
