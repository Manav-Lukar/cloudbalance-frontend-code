import React, { useState, useEffect } from "react";
import "./AddUser.css";
import { useNavigate } from "react-router-dom";

const AddUserPage = () => {
  const navigate = useNavigate();
  const [cloudAccounts, setCloudAccounts] = useState([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState([]);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ADMIN");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  useEffect(() => {
    if (!userRole || !userRole.includes("ADMIN")) {
      navigate("/user-dashboard");
      return;
    }

    const fetchCloudAccounts = async () => {
      try {
        const response = await fetch("http://localhost:8080/admin/cloud-accounts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        setCloudAccounts(data);
      } catch (error) {
        console.error("Failed to fetch cloud accounts:", error);
      }
    };

    if (token) {
      fetchCloudAccounts();
    } else {
      console.warn("No token found in localStorage.");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const bodyData = {
      firstName,
      lastName,
      email,
      password,
      role,
      cloudAccountIds: selectedAccountIds,
    };

    try {
      const response = await fetch("http://localhost:8080/admin/add-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      });

      if (response.ok) {
        setSuccessMessage("User created successfully!");
        setErrorMessage("");
        setTimeout(() => {
          navigate("/user-dashboard");
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
        setSuccessMessage("");
        setErrorMessage(" Failed to create user: " + errorMessage);
      }
    } catch (error) {
      console.error("Error while creating user:", error);
      setSuccessMessage("");
      setErrorMessage(" An error occurred. Check console for details.");
    }
  };

  const availableAccounts = cloudAccounts.filter(
    (account) => !selectedAccountIds.includes(account.id)
  );
  const associatedAccounts = cloudAccounts.filter((account) =>
    selectedAccountIds.includes(account.id)
  );

  return (
    <>
      <h2>Add New User</h2>

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
          <select value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="ADMIN">ADMIN</option>
            <option value="READ_ONLY">READ_ONLY</option>
            <option value="CUSTOMER">CUSTOMER</option>
          </select>
        </div>

        {role === "CUSTOMER" && (
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
          <button type="submit">Add User</button>
        </div>
      </form>
    </>
  );
};

export default AddUserPage;
