import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import RecruiterDashboard from './pages/RecruiterDashboard';
import CandidateDashboard from './pages/CandidateDashboard';
import TestAssessment from './pages/TestAssessment';
import CreateJob from './pages/CreateJob';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
        <Route path="/candidate-dashboard" element={<CandidateDashboard />} />
        <Route path="/assessment" element={<TestAssessment />} />
        <Route path="/create-job" element={<CreateJob />} />
        {/* Redirect legacy /dashboard to recruiter dashboard for now, or login */}
        <Route path="/dashboard" element={<Navigate to="/recruiter-dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
