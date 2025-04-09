import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UserDashboard.css";
import loginIcon from "../../assets/Cloudkeeper_New.svg";
import logOutIcon from "../../assets/logout.png";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedDashboard, setSelectedDashboard] = useState("User Management");
  const [currentUserPage, setCurrentUserPage] = useState(0);

  const usersPerPage = 9;
  const role = localStorage.getItem("role");
  const email = localStorage.getItem("email");

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    // Only fetch users data if the dashboard is "User Management" and the role is either ADMIN or READ_ONLY
    if (selectedDashboard === "User Management" && (role === "ROLE_ADMIN" || role === "ROLE_READ_ONLY")) {
      const fetchUsers = async () => {
        try {
          const response = await fetch("http://localhost:8080/login/users");
          const data = await response.json();
          setUsers(data);
          setCurrentUserPage(0); // reset to first page on dashboard switch
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      };
      fetchUsers();
    }
  }, [selectedDashboard, role]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const renderDashboardContent = () => {
    switch (selectedDashboard) {
      case "User Management":
        if (role === "ROLE_ADMIN" || role === "ROLE_READ_ONLY") {
          const totalPages = Math.ceil(users.length / usersPerPage);
          const paginatedUsers = users.slice(
            currentUserPage * usersPerPage,
            (currentUserPage + 1) * usersPerPage
          );

          return (
            <>
              <h1 className="dashboard-title">Welcome to User Management Dashboard</h1>
              <table className="user-table">
                <thead>
                  <tr>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map((user, index) => (
                      <tr key={index}>
                        <td>{user.firstName}</td>
                        <td>{user.lastName}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">Loading users...</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination Controls */}
              <div className="pagination-controls">
                <button
                  onClick={() => setCurrentUserPage((prev) => Math.max(prev - 1, 0))}
                  disabled={currentUserPage === 0}
                >
                  Previous
                </button>
                <span>
                  Page {currentUserPage + 1} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentUserPage((prev) =>
                      prev < totalPages - 1 ? prev + 1 : prev
                    )
                  }
                  disabled={currentUserPage >= totalPages - 1}
                >
                  Next
                </button>
              </div>
            </>
          );
        } else {
          return <h1></h1>;
        }

      case "Onboarding Dashboard":
        return <h1>Welcome to Onboarding Dashboard</h1>;

      case "Cost Explorer":
        return <h1>Welcome to Cost Explorer Dashboard</h1>;

      case "AWS Services":
        return <h1>Welcome to AWS Services Dashboard</h1>;

      default:
        return null;
    }
  };

  const renderSidebar = () => {
    if (role === "ROLE_ADMIN" || role === "ROLE_READ_ONLY") {
      return (
        <ul>
          <li onClick={() => setSelectedDashboard("User Management")}>User Management</li>
          <li onClick={() => setSelectedDashboard("Onboarding Dashboard")}>Onboarding Dashboard</li>
          <li onClick={() => setSelectedDashboard("Cost Explorer")}>Cost Explorer</li>
          <li onClick={() => setSelectedDashboard("AWS Services")}>AWS Services</li>
        </ul>
      );
    } else if (role === "ROLE_CUSTOMER") {
      return (
        <ul>
          <li onClick={() => setSelectedDashboard("Cost Explorer")}>Cost Explorer</li>
          <li onClick={() => setSelectedDashboard("AWS Services")}>AWS Services</li>
        </ul>
      );
    } else {
      return null;
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Navbar */}
      <div className="navbar">
        <h2><img src={loginIcon} alt="Cloudkeeper logo" /></h2>
        <button className="logout-btn" onClick={handleLogout}>
          <img src={logOutIcon} alt="Logout" />Logout
        </button>
      </div>

      {/* Sidebar + Main Content */}
      <div className="dashboard-content">
        {/* Sidebar */}
        <div className="sidebar">
          {renderSidebar()}
        </div>

        {/* Main Content */}
        <div className="main-content">
          {renderDashboardContent()}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
