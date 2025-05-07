
// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/login-page/Login';
import UserDashboard from './components/Dashboards/UserDashboard';
import ErrorPage from './components/ErroPage/ErrorPage';
import OnboardingFlow from './components/OnboardingFlow/OnboardingFlow';
import OnboardingFlowPageTwo from './components/OnboardingFlow/step2';
import ProtectedRoute from './components/routes/ProtectedRoute';
import CostExplorer from './components/CostExplorer/CostExplorer';
import AwsServicesDashboard from './components/AWS_Service/AwsServicesDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard defaultTab="User Management" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cost-explorer"
          element={
            <ProtectedRoute>
              <UserDashboard defaultTab="Cost Explorer" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/aws-services"
          element={
            <ProtectedRoute>
              <UserDashboard defaultTab="AWS Services" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/onboarding-dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard defaultTab="Onboarding Dashboard" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/onboarding-container"
          element={
            <ProtectedRoute>
              <OnboardingFlow />
            </ProtectedRoute>
          }
        />

        <Route
          path="/onboarding/customer-managed-policies"
          element={
            <ProtectedRoute>
              <OnboardingFlowPageTwo />
            </ProtectedRoute>
          }
        />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/user-dashboard/add" element={<UserDashboard />} />
        <Route path="/user-dashboard/edit/:userId" element={<UserDashboard />} />

        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Router>
  );
}

export default App;
