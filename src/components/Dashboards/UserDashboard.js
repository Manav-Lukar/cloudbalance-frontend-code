import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./UserDashboard.css";
import loginIcon from "../../assets/Cloudkeeper_New.svg";
import logOutIcon from "../../assets/logout.png";
import userIcon from "../../assets/user icon.png";
import editIcon from "../../assets/pencil.svg";
import AddUserPage from "../AddUser/AddUserPage";
import OnboardingFlow from "../OnboardingFlow/OnboardingFlow";
import AwsServicesDashboard from "../AWS_Service/AwsServicesDashboard";


// Custom hook for fetching users
const useFetchUsers = (role, selectedDashboard) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (
      selectedDashboard === "User Management" &&
      (role === "ADMIN" || role === "READ_ONLY")
    ) {
      const fetchUsers = async () => {
        try {
          setLoading(true);
          const response = await fetch("http://localhost:8080/login/users");
          const data = await response.json();
          setUsers(data);
        } catch (error) {
          console.error("Error fetching users:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchUsers();
    }
  }, [selectedDashboard, role]);

  return { users, loading };
};

const UserDashboard = () => {
  const navigate = useNavigate();

  const [selectedDashboard, setSelectedDashboard] = useState(() => {
    return localStorage.getItem("selectedDashboard") || "User Management";
  });
  const [currentUserPage, setCurrentUserPage] = useState(0);
  const [showAddUser, setShowAddUser] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const usersPerPage = 9;
  const role = localStorage.getItem("role");
  const firstName = localStorage.getItem("firstName");
  const email = localStorage.getItem("email");

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [navigate]);

  const { users, loading } = useFetchUsers(role, selectedDashboard);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    try {
      await fetch("http://localhost:8080/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.clear();
      navigate("/");
    }
  };

  const handleEditClick = (userId) => {
    console.log(`Editing user with ID: ${userId}`);
  };

  const handlePagination = useCallback((direction) => {
    setCurrentUserPage((prev) => prev + direction);
  }, []);

  const handleDashboardChange = (dashboard) => {
    setSelectedDashboard(dashboard);
    localStorage.setItem("selectedDashboard", dashboard);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const renderDashboardContent = useMemo(() => {
    if (
      selectedDashboard === "User Management" &&
      (role === "ADMIN" || role === "READ_ONLY")
    ) {
      const totalPages = Math.ceil(users.length / usersPerPage);
      const paginatedUsers = users.slice(
        currentUserPage * usersPerPage,
        (currentUserPage + 1) * usersPerPage
      );

      return (
        <>
          {!showAddUser && (
            <div className="dashboard-header">
              <h1 className="dashboard-title">Users</h1>
            </div>
          )}

          {showAddUser ? (
            <button className="back-btn" onClick={() => setShowAddUser(false)}>
              Back to Dashboard
            </button>
          ) : (
            role === "ADMIN" && (
              <button
                className="add-user-btn"
                onClick={() => setShowAddUser(true)}
              >
                + Add New User
              </button>
            )
          )}

          <div className={`form-container ${showAddUser ? "no-margin" : ""}`}>
            {showAddUser ? (
              <AddUserPage setShowAddUser={setShowAddUser} />
            ) : (
              <>
                <table className="user-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Last Login</th>
                      <th>Edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="7">Loading users...</td>
                      </tr>
                    ) : (
                      paginatedUsers.map((user, index) => (
                        <tr key={index}>
                          <td>{user.id}</td>
                          <td>{user.firstName}</td>
                          <td>{user.lastName}</td>
                          <td>{user.email}</td>
                          <td>{user.role}</td>
                          <td>{user.lastLogin}</td>
                          <td>
                            <button
                              onClick={() => handleEditClick(user.id)}
                              className="edit-btn"
                            >
                              <img src={editIcon} alt="edit-icon" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                <div className="pagination-controls">
                  <button
                    onClick={() => handlePagination(-1)}
                    disabled={currentUserPage === 0}
                  >
                    Previous
                  </button>
                  <span>
                    Page {currentUserPage + 1} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePagination(1)}
                    disabled={currentUserPage >= totalPages - 1}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      );
    }
    if (selectedDashboard === "AWS Services") {
      return <AwsServicesDashboard />;
    }
    

    if (selectedDashboard === "Onboarding Dashboard") {
      return <OnboardingFlow />;
    }

    return <h1>Welcome to {selectedDashboard}</h1>;
  }, [selectedDashboard, role, users, currentUserPage, loading, showAddUser]);

  const sidebarMenu = useMemo(() => {
    const menuItems = {
      ADMIN: [
        {
          label: "User Management",
          action: () => handleDashboardChange("User Management"),
        },
        {
          label: "Onboarding Dashboard",
          action: () => handleDashboardChange("Onboarding Dashboard"),
        },
        {
          label: "Cost Explorer",
          action: () => handleDashboardChange("Cost Explorer"),
        },
        {
          label: "AWS Services",
          action: () => handleDashboardChange("AWS Services"),
        },
      ],
      CUSTOMER: [
        {
          label: "Cost Explorer",
          action: () => handleDashboardChange("Cost Explorer"),
        },
        {
          label: "AWS Services",
          action: () => handleDashboardChange("AWS Services"),
        },
      ],
    };
    return menuItems[role] || [];
  }, [role]);

  return (
    <div className="dashboard-layout">
      {/* Navbar */}
      <div className="navbar">
        <h2>
          <Link to="/user-dashboard">
            <img
              src={loginIcon}
              alt="Cloudkeeper logo"
              className="clickable-logo"
            />
          </Link>{" "}
        </h2>

        <div className="navbar-right">
          <div className="user-info">
            <img src={userIcon} alt="User Icon" className="user-icon" />
            <p className="welcome-text">Welcome, {firstName}</p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <img src={logOutIcon} alt="Logout" />
            Logout
          </button>
        </div>
      </div>

      {/* Sidebar + Main Content */}
      <div
        className={`dashboard-content ${
          isSidebarCollapsed ? "collapsed" : ""
        }`}
      >
        <div className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
          <div className="sidebar-toggle" onClick={toggleSidebar}>
            {isSidebarCollapsed ? "☰" : "☰"}
          </div>
          <ul className="sidebar-menu">
            {sidebarMenu.map((item, index) => (
              <li key={index} onClick={item.action} title={item.label}>
                {isSidebarCollapsed ? null : item.label}
              </li>
            ))}
          </ul>
        </div>
        <div className="main-content">{renderDashboardContent}</div>
      </div>
    </div>
  );
};

export default UserDashboard;
