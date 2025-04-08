import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./UserDashboard.css"; 

const UserDashboard = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const email = localStorage.getItem("email");

  useEffect(() => {
    // Redirect to login if not authenticated
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1 className="dashboard-title">Welcome to CloudBalance Dashboard</h1>
        <p>
          <strong>Logged in as:</strong> {role}
        </p>
        <p>
          <strong>Email:</strong> {email}
        </p>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserDashboard;
