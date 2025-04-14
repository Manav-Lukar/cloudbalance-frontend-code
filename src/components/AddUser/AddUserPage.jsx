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
  const [role, setRole] = useState("CUSTOMER");
  const [cloudDropdownOpen, setCloudDropdownOpen] = useState(false);
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

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

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

  const handleCheckboxChange = (id) => {
    setSelectedAccountIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
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
        setSuccessMessage("✅ User created successfully!");
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
        setErrorMessage("❌ Failed to create user: " + errorMessage);
      }
    } catch (error) {
      console.error("Error while creating user:", error);
      setSuccessMessage("");
      setErrorMessage("❌ An error occurred. Check console for details.");
    }
  };

  return (
    <div className="add-user-page">
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
            <label
              className="dropdown-label"
              onClick={() => setCloudDropdownOpen(!cloudDropdownOpen)}
            >              Cloud Accounts
              <span className={`arrow ${cloudDropdownOpen ? "open" : ""}`}>▼</span>
            </label>

            {cloudDropdownOpen && (
              <div className="checkbox-dropdown">
                {cloudAccounts.length === 0 ? (
                  <p>No cloud accounts available.</p>
                ) : (
                  cloudAccounts.map((account) => (
                    <label key={account.id} className="checkbox-item">
                      <input
                        type="checkbox"
                        value={account.id}
                        checked={selectedAccountIds.includes(account.id)}
                        onChange={() => handleCheckboxChange(account.id)}
                      />
                      {account.accountName}
                    </label>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        <div className="form-row center">
          <button type="submit">Add User</button>
        </div>
      </form>
    </div>
  );
};

export default AddUserPage;
