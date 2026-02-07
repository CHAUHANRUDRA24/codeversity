import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute'; // Import new component

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import RecruiterDashboard from './pages/RecruiterDashboard';
import CandidateDashboard from './pages/CandidateDashboard';
import CreateJob from './pages/CreateJob';
import TestPage from './pages/TestPage';
import ResultPage from './pages/ResultPage';
import AdminSetup from './pages/AdminSetup';
import DataAdder from './pages/DataAdder';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/data-adder" element={<DataAdder />} />

          {/* Protected Recruiter Routes */}
          <Route path="/recruiter-dashboard" element={
            <ProtectedRoute requiredRole="recruiter">
              <RecruiterDashboard />
            </ProtectedRoute>
          } />
          <Route path="/create-job" element={
            <ProtectedRoute requiredRole="recruiter">
              <CreateJob />
            </ProtectedRoute>
          } />

          {/* Protected Candidate Routes */}
          <Route path="/candidate-dashboard" element={
            <ProtectedRoute requiredRole="candidate">
              <CandidateDashboard />
            </ProtectedRoute>
          } />
          <Route path="/test/:jobId" element={
            <ProtectedRoute requiredRole="candidate">
              <TestPage />
            </ProtectedRoute>
          } />
          <Route path="/result/:jobId" element={
            <ProtectedRoute requiredRole="candidate">
              <ResultPage />
            </ProtectedRoute>
          } />


          {/* Admin Setup Route */}
          <Route path="/account-create" element={<AdminSetup />} />

          {/* Redirects */}
          <Route path="/dashboard" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
