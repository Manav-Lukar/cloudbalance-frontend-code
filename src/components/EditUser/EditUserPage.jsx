import React, { useState, useEffect } from 'react';
import '../AddUser/AddUser.css'; // Reuse the same CSS for styling
import { useNavigate, useParams } from 'react-router-dom';

const EditUserPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams(); // Get userId from URL parameters

  const [cloudAccounts, setCloudAccounts] = useState([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState([]);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('ADMIN');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  const id = localStorage.getItem('userId');

  // Fetch user data and their associated cloud accounts
  useEffect(() => {
    if (!userRole || !userRole.includes('ADMIN')) {
      navigate('/user-dashboard');
      return;
    }

    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        // Fetch user details using the userId from URL
        const userResponse = await fetch(`http://localhost:8080/login/users/${userId}`, {
          headers: {
            method: 'GET',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!userResponse.ok) throw new Error(`HTTP error! status: ${userResponse.status}`);

        const userData = await userResponse.json();

        // Set user data to state
        setFirstName(userData.firstName);
        setLastName(userData.lastName);
        setEmail(userData.email);
        setRole(userData.role);

        // If user has associated cloud accounts, set them
        if (userData.cloudAccounts && userData.cloudAccounts.length > 0) {
          setSelectedAccountIds(userData.cloudAccounts.map((account) => account.id));
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setErrorMessage('Failed to load user data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCloudAccounts = async () => {
      try {
        const response = await fetch('http://localhost:8080/admin/cloud-accounts', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        setCloudAccounts(data);
      } catch (error) {
        console.error('Failed to fetch cloud accounts:', error);
      }
    };

    if (token) {
      fetchUserData();
      fetchCloudAccounts();
    } else {
      console.warn('No token found in localStorage.');
      navigate('/');
    }
  }, [navigate, userRole, token, userId]);

  const handleAssociate = (id) => {
    if (!selectedAccountIds.includes(id)) {
      setSelectedAccountIds((prev) => [...prev, id]);
    }
  };

  const handleRemoveAssociation = (id) => {
    setSelectedAccountIds((prev) => prev.filter((item) => item !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const bodyData = {
      firstName,
      lastName,
      email,
      role,
      cloudAccountIds: selectedAccountIds,
    };

    try {
      const response = await fetch(`http://localhost:8080/admin/update-user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      });

      if (response.ok) {
        setSuccessMessage('User updated successfully!');
        setErrorMessage('');
        setTimeout(() => {
          navigate('/user-dashboard');
        }, 2000);
      } else {
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || JSON.stringify(errorData);
        } catch {
          errorMessage = errorText;
        }
        setSuccessMessage('');
        setErrorMessage('Failed to update user: ' + errorMessage);
      }
    } catch (error) {
      console.error('Error while updating user:', error);
      setSuccessMessage('');
      setErrorMessage('An error occurred. Check console for details.');
    }
  };

  const availableAccounts = cloudAccounts.filter(
    (account) => !selectedAccountIds.includes(account.id)
  );
  const associatedAccounts = cloudAccounts.filter((account) =>
    selectedAccountIds.includes(account.id)
  );

  if (isLoading) {
    return <div className="loading">Loading user data...</div>;
  }

  return (
    <>
      <h2>Edit User</h2>

      {successMessage && <div className="message success">{successMessage}</div>}
      {errorMessage && <div className="message error">{errorMessage}</div>}

      <form onSubmit={handleSubmit} className="add-user-form">
        <div className="form-group">
          <label>First Name:</label>
          <input
            type="text"
            value={firstName}
            placeholder="Enter first name"
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Last Name:</label>
          <input
            type="text"
            value={lastName}
            placeholder="Enter last name"
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            placeholder="Enter user email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Role:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="ADMIN">ADMIN</option>
            <option value="READ_ONLY">READ_ONLY</option>
            <option value="CUSTOMER">CUSTOMER</option>
          </select>
        </div>

        {role === 'CUSTOMER' && (
          <div className="form-group full-width">
            <label className="cloud-label">Cloud Accounts</label>
            <div className="cloud-account-container">
              <div className="cloud-box">
                <h4>Available Cloud Accounts</h4>
                {availableAccounts.length === 0 ? (
                  <p>No accounts</p>
                ) : (
                  availableAccounts.map((account) => (
                    <div key={account.id} className="cloud-item">
                      {account.accountName}
                      <button type="button" onClick={() => handleAssociate(account.id)}>
                        →
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="cloud-box">
                <h4>Associated Cloud Accounts</h4>
                {associatedAccounts.length === 0 ? (
                  <p>No associated accounts</p>
                ) : (
                  associatedAccounts.map((account) => (
                    <div key={account.id} className="cloud-item">
                      {account.accountName}
                      <button type="button" onClick={() => handleRemoveAssociation(account.id)}>
                        ←
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <div className="form-row center">
          <button type="submit">Update User</button>
          <button type="button" className="cancel-btn" onClick={() => navigate('/user-dashboard')}>
            Cancel
          </button>
        </div>
      </form>
    </>
  );
};

export default EditUserPage;
