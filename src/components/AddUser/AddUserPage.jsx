import React, { useState, useEffect } from 'react';
import './AddUser.css';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../services/GetService';

const AddUserPage = () => {
  const navigate = useNavigate();
  const [cloudAccounts, setCloudAccounts] = useState([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState([]);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ADMIN');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  useEffect(() => {
    if (!userRole || !userRole.includes('ADMIN')) {
      navigate('/user-dashboard');
      return;
    }

    const fetchCloudAccounts = async () => {
      try {
        const response = await api.get('admin/cloud-accounts');
        setCloudAccounts(response.data);
      } catch (error) {
        console.error('Failed to fetch cloud accounts:', error);
      }
    };

    if (token) {
      fetchCloudAccounts();
    } else {
      console.warn('No token found in localStorage.');
    }
  }, [navigate, userRole, token]);

  const handleAssociate = (id) => {
    if (!selectedAccountIds.includes(id)) {
      setSelectedAccountIds((prev) => [...prev, id]);
    }
  };

  const handleRemoveAssociation = (id) => {
    setSelectedAccountIds((prev) => prev.filter((item) => item !== id));
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setRole(newRole);
    if (newRole !== 'CUSTOMER') {
      setSelectedAccountIds([]);
      setWarningMessage('');
    } else {
      setWarningMessage('');
    }
  };

  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!firstName || !lastName || !email || !password) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Invalid email address.');
      return;
    }

    const bodyData = {
      firstName,
      lastName,
      email,
      password,
      role,
      ...(role === 'CUSTOMER' && { cloudAccountIds: selectedAccountIds }),
    };

    try {
      const response = await api.post('login/add-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      });

      if (response.ok) {
        toast.success('User created successfully!');
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
        toast.error('Failed to create user: ' + errorMessage);
      }
    } catch (error) {
      console.error('Error while creating user:', error);
      toast.error('An error occurred. Check console for details.');
    }
  };

  const handleCancel = () => {
    navigate('/user-dashboard');
  };

  const availableAccounts = cloudAccounts.filter(
    (account) => !selectedAccountIds.includes(account.id)
  );
  const associatedAccounts = cloudAccounts.filter((account) =>
    selectedAccountIds.includes(account.id)
  );

  const isFormValid = firstName && lastName && email && password;
  return (
    <>
      <h2>Add New User</h2>

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
          <label>Password:</label>
          <input
            type="password"
            value={password}
            placeholder="Enter user password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Role:</label>
          <select value={role} onChange={handleRoleChange} required>
            <option value="ADMIN">ADMIN</option>
            <option value="READ ONLY">READ ONLY</option>
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
          <button type="submit" disabled={!isFormValid}>Add User</button>
          <button type="Cancel-button" onClick={handleCancel}>Cancel</button>
        </div>
      </form>

      <ToastContainer />
    </>
  );
};

export default AddUserPage;
