import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UserDashboard.css";
import loginIcon from "../../assets/Cloudkeeper_New.svg";
import logOutIcon from "../../assets/logout.png";
import userIcon from "../../assets/user icon.png";
import AddUserPage from "../AddUser/AddUserPage";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedDashboard, setSelectedDashboard] = useState("User Management");
  const [currentUserPage, setCurrentUserPage] = useState(0);
  const [showAddUser, setShowAddUser] = useState(false);

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
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:8080/login/users");
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data);
        setCurrentUserPage(0);
      } catch (error) {
        console.error("Error fetching users:", error);
        navigate("/error"); // Navigate to error page
      }
    };

    if (
      selectedDashboard === "User Management" &&
      (role === "ADMIN" || role === "READ_ONLY")
    ) {
      fetchUsers();
    }
  }, [selectedDashboard, role, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const renderDashboardContent = () => {
    switch (selectedDashboard) {
      case "User Management":
        if (role === "ADMIN" || role === "READ_ONLY") {
          const totalPages = Math.ceil(users.length / usersPerPage);
          const paginatedUsers = users.slice(
            currentUserPage * usersPerPage,
            (currentUserPage + 1) * usersPerPage
          );

          return (
            <>
              <div className="dashboard-header">
                <h1 className="dashboard-title">Users</h1>
              </div>
              {role === "ADMIN" && (
                <button
                  className="add-user-btn"
                  onClick={() => setShowAddUser(true)}
                >
                  ✚ Add New User
                </button>
              )}
              {showAddUser && (
                <div className="add-user-overlay">
                  <AddUserPage />
                  <button
                    className="close-add-user"
                    onClick={() => setShowAddUser(false)}
                  ></button>
                </div>
              )}
              {!showAddUser && (
                <>
                  <table className="user-table">
                    <thead>
                      <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Last Login</th>
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
                            <td>{user.lastLogin}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5">Loading users...</td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <div className="pagination-controls">
                    <button
                      onClick={() =>
                        setCurrentUserPage((prev) => Math.max(prev - 1, 0))
                      }
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
              )}
            </>
          );
        } else {
          return <h1>No Permission</h1>;
        }

      default:
        return null;
    }
  };

  const renderSidebar = () => {
    if (role === "ADMIN" || role === "READ_ONLY") {
      return (
        <ul>
          <li onClick={() => setSelectedDashboard("User Management")}>
            User Management
          </li>
          <li onClick={() => setSelectedDashboard("Onboarding Dashboard")}>
            Onboarding Dashboard
          </li>
          <li onClick={() => setSelectedDashboard("Cost Explorer")}>
            Cost Explorer
          </li>
          <li onClick={() => setSelectedDashboard("AWS Services")}>
            AWS Services
          </li>
        </ul>
      );
    } else if (role === "CUSTOMER") {
      return (
        <ul>
          <li onClick={() => setSelectedDashboard("Cost Explorer")}>
            Cost Explorer
          </li>
          <li onClick={() => setSelectedDashboard("AWS Services")}>
            AWS Services
          </li>
        </ul>
      );
    } else {
      return null;
    }
  };

  return (
    <div className="dashboard-layout">
      <div className="navbar">
        <h2>
          <img src={loginIcon} alt="Cloudkeeper logo" />
        </h2>
        <div className="navbar-right">
          <div className="user-info">
            <img src={userIcon} alt="User Icon" className="user-icon" />
            <p className="welcome-text">
              Welcome, {role?.replace("ROLE_", "")}
            </p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <img src={logOutIcon} alt="Logout" />
            Logout
          </button>
        </div>
      </div>
      <div className="dashboard-content">
        <div className="sidebar">{renderSidebar()}</div>
        <div className="main-content">{renderDashboardContent()}</div>
      </div>
    </div>
  );
};

export default UserDashboard;
