import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
    const userRole = sessionStorage.getItem('userRole');

    if (!userRole) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // Redirect to the appropriate dashboard based on their actual role
        // to prevent unauthorized access to the wrong dashboard
        if (userRole === 'recruiter') {
            return <Navigate to="/recruiter-dashboard" replace />;
        } else {
            return <Navigate to="/candidate-dashboard" replace />;
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;
