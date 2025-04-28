import React, { useState, useEffect } from "react";
import "../AddUser/AddUser.css"; // Reusing the same CSS as AddUser

const EditUserPage = ({ userId, onCancel }) => {
  const [cloudAccounts, setCloudAccounts] = useState([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState([]);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8080/login/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const userData = await response.json();
        setFirstName(userData.firstName || "");
        setLastName(userData.lastName || "");
        setEmail(userData.email || "");
        setRole(userData.role || "");
        
        // If the user has cloud accounts, set them
        if (userData.cloudAccounts && userData.cloudAccounts.length > 0) {
          setSelectedAccountIds(userData.cloudAccounts.map(account => account.id));
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setErrorMessage("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId, token]);

  // Fetch cloud accounts
  useEffect(() => {
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
    }
  }, [token]);

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
      id: userId,
      firstName,
      lastName,
      email,
      role,
      cloudAccountIds: selectedAccountIds,
    };

    try {
      const response = await fetch(`http://localhost:8080/admin/update-user/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      });

      if (response.ok) {
        setSuccessMessage("User updated successfully!");
        setErrorMessage("");
        setTimeout(() => {
          onCancel(); // Go back to user dashboard
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
        setErrorMessage("Failed to update user: " + errorMessage);
      }
    } catch (error) {
      console.error("Error while updating user:", error);
      setSuccessMessage("");
      setErrorMessage("An error occurred. Check console for details.");
    }
  };

  const availableAccounts = cloudAccounts.filter(
    (account) => !selectedAccountIds.includes(account.id)
  );
  const associatedAccounts = cloudAccounts.filter((account) =>
    selectedAccountIds.includes(account.id)
  );

  if (loading) {
    return <div>Loading user data...</div>;
  }

  return (
    <>
      <h2 className="edit-user-text">Edit User</h2>

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
          <button type="submit">Update User</button>
          <button type="button" onClick={onCancel} className="cancel-btn">Cancel</button>
        </div>
      </form>
    </>
  );
};

export default EditUserPage;