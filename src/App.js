import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/login-page/Login";
import UserDashboard from "./components/Dashboards/UserDashboard";
import AddUserPage from "./components/AddUser/AddUserPage";
import ErrorPage from "./components/ErroPage/ErrorPage"; // ✅ Create this component

function App() {
  return (
    <Router>
      <Routes>
        {/* Login route */}
        <Route path="/" element={<Login />} />

        {/* Dashboard with nested AddUserPage */}
        <Route path="/user-dashboard" element={<UserDashboard />}>
          <Route path="add-user" element={<AddUserPage />} />
        </Route>

        {/* Catch-all route for 404 Not Found */}
        <Route path="error" element={<ErrorPage />} />
      </Routes>
    </Router>
  );
}

export default App;
