import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './UserDashboard.css';
import { IoSearchSharp } from 'react-icons/io5';
import loginIcon from '../../assets/Cloudkeeper_New.svg';
import logOutIcon from '../../assets/logout.png';
import userIcon from '../../assets/user icon.png';
import editIcon from '../../assets/pencil.svg';
import { FaFilter } from 'react-icons/fa';
import AddUserPage from '../AddUser/AddUserPage';
import EditUserPage from '../EditUser/EditUserPage';
import OnboardingFlow from '../OnboardingFlow/OnboardingFlow';
import AwsServicesDashboard from '../AWS_Service/AwsServicesDashboard';
import CostExplorer from '../CostExplorer/CostExplorer';

// Custom hook for fetching users


const useFetchUsers = (role, selectedDashboard) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedDashboard === 'User Management' && (role === 'ADMIN' || role === 'READ_ONLY')) {
      const fetchUsers = async () => {
        try {
          setLoading(true);
          const response = await fetch('http://localhost:8080/login/users');
          const data = await response.json();
          setUsers(data);
        } catch (error) {
          console.error('Error fetching users:', error);
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
    return localStorage.getItem('selectedDashboard') || 'User Management';
  });
  const [currentUserPage, setCurrentUserPage] = useState(0);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchQuery, setSearchQuery] = useState('');

  const usersPerPage = 9;
  const role = localStorage.getItem('role');
  const firstName = localStorage.getItem('firstName');
  const normalizedRole = role?.toUpperCase();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [navigate]);

  const { users, loading } = useFetchUsers(role, selectedDashboard);

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
      await fetch('http://localhost:8080/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.clear();
      navigate('/');
    }
  };

  const handleEditClick = (userId) => {
    setSelectedUserId(userId);
    setShowEditUser(true);
  };

  const handlePagination = useCallback((direction) => {
    setCurrentUserPage((prev) => prev + direction);
  }, []);

  const handleDashboardChange = (dashboard) => {
    setSelectedDashboard(dashboard);
    localStorage.setItem('selectedDashboard', dashboard);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = useMemo(() => {
    let filteredUsers = [...users];

    if (searchQuery) {
      filteredUsers = filteredUsers.filter((user) =>
        `${user.firstName} ${user.lastName} ${user.email}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    if (sortConfig.key) {
      filteredUsers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredUsers;
  }, [users, sortConfig, searchQuery]);

  const renderDashboardContent = useMemo(() => {
    if (selectedDashboard === 'User Management' && (role === 'ADMIN' || role === 'READ_ONLY')) {
      const totalPages = Math.ceil(sortedUsers.length / usersPerPage);
      const paginatedUsers = sortedUsers.slice(
        currentUserPage * usersPerPage,
        (currentUserPage + 1) * usersPerPage
      );

      return (
        <>
          {/* Heading */}
          <div className="dashboard-header">
            <h1 className="dashboard-title">Users</h1>
          </div>

          {/* Buttons below heading */}
          <div className="dashboard-action-btns">
            {showAddUser || showEditUser ? (
              <button
                className="back-btn"
                onClick={() => {
                  setShowAddUser(false);
                  setShowEditUser(false);
                  setSelectedUserId(null);
                }}
              >
                Back to Dashboard
              </button>
            ) : (
              role === 'ADMIN' && (
                <button className="add-user-btn" onClick={() => setShowAddUser(true)}>
                  + Add New User
                </button>
              )
            )}
          </div>

          <div className="form-container">
            {showAddUser ? (
              <AddUserPage setShowAddUser={setShowAddUser} />
            ) : showEditUser ? (
              <EditUserPage userId={selectedUserId} setShowEditUser={setShowEditUser} />
            ) : (
              <>
                {/* Search Bar */}
                <div className="search-container">
                  <span className="search-icon">
                    <IoSearchSharp />
                  </span>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* User Table */}
                <table className="user-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('id')}>
                        ID <FaFilter style={{ fontSize: '12px' }} />
                      </th>
                      <th onClick={() => handleSort('firstName')}>
                        First Name <FaFilter style={{ fontSize: '12px' }} />
                      </th>
                      <th onClick={() => handleSort('lastName')}>
                        Last Name <FaFilter style={{ fontSize: '12px' }} />
                      </th>
                      <th onClick={() => handleSort('email')}>
                        Email <FaFilter style={{ fontSize: '12px' }} />
                      </th>
                      <th onClick={() => handleSort('role')}>
                        Role <FaFilter style={{ fontSize: '12px' }} />
                      </th>
                      <th onClick={() => handleSort('lastLogin')}>
                        Last Login <FaFilter style={{ fontSize: '12px' }} />
                      </th>
                      {role === 'ADMIN' && <th>Edit</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={role === 'ADMIN' ? 7 : 6}>Loading users...</td>
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
                          {role === 'ADMIN' && (
                            <td>
                              <button onClick={() => handleEditClick(user.id)} className="edit-btn">
                                <img src={editIcon} alt="edit-icon" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="pagination-controls">
                  <button onClick={() => handlePagination(-1)} disabled={currentUserPage === 0}>
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

    if (selectedDashboard === 'AWS Services') return <AwsServicesDashboard />;
    if (selectedDashboard === 'Onboarding Dashboard') return <OnboardingFlow />;
    if (selectedDashboard === 'Cost Explorer') return <CostExplorer />;

    return <h1>Welcome to {selectedDashboard}</h1>;
  }, [
    selectedDashboard,
    role,
    sortedUsers,
    currentUserPage,
    loading,
    showAddUser,
    showEditUser,
    selectedUserId,
    searchQuery,
    handlePagination,
    handleSort,
  ]);

  const sidebarMenu = useMemo(() => {
    const fullAccessMenu = [
      { label: 'User Management', action: () => handleDashboardChange('User Management') },
      { label: 'Onboarding Dashboard', action: () => handleDashboardChange('Onboarding Dashboard') },
      { label: 'Cost Explorer', action: () => handleDashboardChange('Cost Explorer') },
      { label: 'AWS Services', action: () => handleDashboardChange('AWS Services') },
    ];

    const customerMenu = [
      { label: 'Cost Explorer', action: () => handleDashboardChange('Cost Explorer') },
      { label: 'AWS Services', action: () => handleDashboardChange('AWS Services') },
    ];

    if (normalizedRole === 'ADMIN' || normalizedRole === 'READ_ONLY') return fullAccessMenu;
    if (normalizedRole === 'CUSTOMER') return customerMenu;
    return [];
  }, [normalizedRole]);

  return (
    <div className="dashboard-layout">
      {/* Navbar */}
      <div className="navbar">
        <h2>
          <Link to="/user-dashboard">
            <img src={loginIcon} alt="Cloudkeeper logo" className="clickable-logo" />
          </Link>
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
      <div className={`dashboard-content ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-toggle" onClick={toggleSidebar}>
            {isSidebarCollapsed ? '☰' : '☰'}
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
