import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import RecruiterDashboard from './pages/RecruiterDashboard';
import CandidateDashboard from './pages/CandidateDashboard';
import TestAssessment from './pages/TestAssessment';
import CreateJob from './pages/CreateJob';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* Recruiter Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['recruiter']} />}>
          <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
          <Route path="/create-job" element={<CreateJob />} />
        </Route>

        {/* Candidate Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['candidate']} />}>
          <Route path="/candidate-dashboard" element={<CandidateDashboard />} />
          <Route path="/assessment" element={<TestAssessment />} />
        </Route>

        {/* Redirect legacy /dashboard based on role if logged in, otherwise to login */}
        <Route path="/dashboard" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
