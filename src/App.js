import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/login-page/Login';
import UserDashboard from './components/Dashboards/UserDashboard';
import ErrorPage from './components/ErroPage/ErrorPage';
import OnboardingFlow from './components/OnboardingFlow/OnboardingFlow';
import OnboardingFlowPageTwo from './components/OnboardingFlow/step2';
import ProtectedRoute from './components/routes/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
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

        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Router>
  );
}

export default App;
