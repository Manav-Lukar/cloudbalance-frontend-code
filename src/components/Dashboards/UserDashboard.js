import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
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
import api from '../../services/GetService';

const useFetchUsers = (role, selectedDashboard) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedDashboard === 'user-dashboard' && (role === 'ADMIN' || role === 'READ ONLY')) {
      const fetchUsers = async () => {
        try {
          setLoading(true);
          const response = await api.get('/login/users');
          if (!response.data) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          // const data = await response.data();
          setUsers(response.data);
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
  const location = useLocation();
  const { userId } = useParams();

  const path = location.pathname.replace('/', '').split('/')[0] || 'user-dashboard';
  const subPath = location.pathname.split('/')[2] || '';

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
    const role = localStorage.getItem('role');
    const currentPath = location.pathname;

    if (!isAuthenticated) {
      navigate('/');
    } else if (role === 'CUSTOMER' && currentPath === '/user-dashboard') {
      navigate('/cost-explorer');
    }
  }, [navigate, location]);

  useEffect(() => {
    if (location.pathname.includes('/user-dashboard/add')) {
      setShowAddUser(true);
      setShowEditUser(false);
    } else if (location.pathname.includes('/user-dashboard/edit') && userId) {
      setSelectedUserId(userId);
      setShowEditUser(true);
      setShowAddUser(false);
    } else {
      setShowAddUser(false);
      setShowEditUser(false);
    }
  }, [location.pathname, userId]);

  const { users, loading } = useFetchUsers(role, path);

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
      await api.post('auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.clear();
      navigate('/');
    }
  };

  const handleEditClick = (userId) => {
    navigate(`/user-dashboard/edit/${userId}`);
  };

  const handleAddUserClick = () => {
    navigate('/user-dashboard/add');
  };

  const handleBackToDashboard = () => {
    navigate('/user-dashboard');
    setShowAddUser(false);
    setShowEditUser(false);
    setSelectedUserId(null);
  };

  const handlePagination = useCallback((direction) => {
    setCurrentUserPage((prev) => prev + direction);
  }, []);

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
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filteredUsers;
  }, [users, sortConfig, searchQuery]);

  const renderDashboardContent = useMemo(() => {
    if (path === 'user-dashboard' && (role === 'ADMIN' || role === 'READ ONLY')) {
      const totalPages = Math.ceil(sortedUsers.length / usersPerPage);
      const paginatedUsers = sortedUsers.slice(
        currentUserPage * usersPerPage,
        (currentUserPage + 1) * usersPerPage
      );

      return (
        <>
          <div className="dashboard-header">
            <h1 className="dashboard-title">Users</h1>
            <div className="dashboard-action-btns">
              {showAddUser || showEditUser ? (
                <button className="back-btn" onClick={handleBackToDashboard}>
                  Back to Dashboard
                </button>
              ) : (
                role === 'ADMIN' && (
                  <button className="add-user-btn" onClick={handleAddUserClick}>
                    + Add New User
                  </button>
                )
              )}
            </div>
          </div>

          <div className="form-container">
            {showAddUser ? (
              <AddUserPage setShowAddUser={setShowAddUser} />
            ) : showEditUser ? (
              <EditUserPage userId={selectedUserId} setShowEditUser={setShowEditUser} />
            ) : (
              <>
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
                      paginatedUsers.map((user) => (
                        <tr key={user.id}>
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

    if (path === 'aws-services') return <AwsServicesDashboard />;
    if (path === 'onboarding-dashboard') return <OnboardingFlow />;
    if (path === 'cost-explorer') return <CostExplorer />;

    return <h1>Welcome to Dashboard</h1>;
  }, [
    path,
    role,
    sortedUsers,
    currentUserPage,
    loading,
    showAddUser,
    showEditUser,
    selectedUserId,
    searchQuery,
  ]);

  const sidebarMenu = useMemo(() => {
    const fullAccessMenu = [
      { label: 'User Management', path: 'user-dashboard' },
      { label: 'Onboarding Dashboard', path: 'onboarding-dashboard' },
      { label: 'Cost Explorer', path: 'cost-explorer' },
      { label: 'AWS Services', path: 'aws-services' },
    ];
    const readOnlyMenu = [
      { label: 'User Management', path: 'user-dashboard' },
      { label: 'Cost Explorer', path: 'cost-explorer' },
      { label: 'AWS Services', path: 'aws-services' },
    ];
    const customerMenu = [
      { label: 'Cost Explorer', path: 'cost-explorer' },
      { label: 'AWS Services', path: 'aws-services' },
    ];
    if (normalizedRole === 'ADMIN') return fullAccessMenu;
    if (normalizedRole === 'READ ONLY') return readOnlyMenu;
    if (normalizedRole === 'CUSTOMER') return customerMenu;
    return [];
  }, [normalizedRole]);

  return (
    <div className="dashboard-layout">
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

      <div className={`dashboard-content ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-toggle" onClick={toggleSidebar}>
            ☰
          </div>
          <ul className="sidebar-menu">
            {sidebarMenu.map((item, index) => (
              <li key={index} onClick={() => navigate(`/${item.path}`)} title={item.label}>
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
