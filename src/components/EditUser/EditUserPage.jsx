import React, { useState, useEffect } from "react";
import "../AddUser/AddUser.css"; // Reusing the same CSS as AddUser
import { navigate } from "raviger";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../services/GetService"; // Adjust the import path as necessary

const EditUserPage = ({ userId }) => {
  const [cloudAccounts, setCloudAccounts] = useState([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState([]);
  const [originalRole, setOriginalRole] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`login/users/${userId}`);
        const userData = await response.data;
        setFirstName(userData.firstName || "");
        setLastName(userData.lastName || "");
        setEmail(userData.email || "");
        setRole(userData.role || "");
        setOriginalRole(userData.role || ""); // Store the original role to detect changes
        
        // If the user has cloud accounts, set them
        if (userData.cloudAccounts && userData.cloudAccounts.length > 0) {
          setSelectedAccountIds(userData.cloudAccounts.map(account => account.id));
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        toast.error("Failed to load user data.");
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
        const response = await api.get("admin/cloud-accounts");


        const data = await response.data;
        setCloudAccounts(response.data);
      } catch (error) {
        console.error("Failed to fetch cloud accounts:", error);
        toast.error("Failed to load cloud accounts.");
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

  const onCancel = () => {
    navigate("/user-dashboard");
  };

  const handleRemoveAssociation = (id) => {
    setSelectedAccountIds((prev) => prev.filter((item) => item !== id));
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setRole(newRole);

    // If changing to non-CUSTOMER role, clear selected accounts and show warning
    if (newRole !== "CUSTOMER") {
      setSelectedAccountIds([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Always include cloudAccountIds for CUSTOMER role users, even if empty
    const bodyData = {
      id: userId,
      firstName,
      lastName,
      email,
      role,
      // Always include cloudAccountIds for CUSTOMER role, even if empty
      ...(role === "CUSTOMER" && { cloudAccountIds: selectedAccountIds })
    };

    try {
      const response = await api.put(`login/update-user/${userId}`,bodyData);

      // if (response.ok) {
        toast.success("User updated successfully!");
        setTimeout(() => {
          onCancel(); // Go back to user dashboard
        }, 2000);
      // } 
      // else {
      //   const errorText = await response.text();
      //   let errorMessage;
      //   try {
      //     const errorData = JSON.parse(errorText);
      //     errorMessage = errorData.message || JSON.stringify(errorData);

      //     // Check for specific error (e.g., email already exists)
      //     if (errorMessage.includes("email already exists")) {
      //       toast.error("This email is already in use. Please choose another.");
      //     } else {
      //       toast.error("Failed to update user: " + errorMessage);
      //     }
      //   } catch {
      //     toast.error("Failed to update user: " + errorText);
      //   }
      // }
    } catch (error) {
      console.error("Error while updating user:", error);
      toast.error("An error occurred. Check console for details.");
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
          <select value={role} onChange={handleRoleChange} required>
            <option value="ADMIN">ADMIN</option>
            <option value="READ ONLY">READ ONLY</option>
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

      <ToastContainer />
    </>
  );
};

export default EditUserPage;
