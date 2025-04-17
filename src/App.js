import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/login-page/Login";
import UserDashboard from "./components/Dashboards/UserDashboard";
import ErrorPage from "./components/ErroPage/ErrorPage";
import OnboardingFlow from "./components/OnboardingFlow/OnboardingFlow";
import CustomerManagedPolicies from "./components/OnboardingFlow/step2";
import ProtectedRoute from "./components/routes/ProtectedRoute"; // ← Import this
import OnboardingFlowPageTwo from "./components/OnboardingFlow/step2";

function App() {
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* ✅ Protected Routes */}
        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingFlow />
            </ProtectedRoute>
          }
        >
          <Route
            path="customer-managed-policies"
            element={
              <ProtectedRoute>
                <OnboardingFlowPageTwo />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Router>
  );
}

export default App;
