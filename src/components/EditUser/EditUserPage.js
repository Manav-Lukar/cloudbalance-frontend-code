import React, { useState, useEffect } from "react";

const EditUserPage = ({ userId, userData, setShowEditUser }) => {
  const [userFormData, setUserFormData] = useState(userData);
  
  // Get the token from localStorage or context (adjust as needed)
  const token = localStorage.getItem("token"); 
//   localStorage.setItem("token", token); // Make sure token is stored
  // Assuming the token is stored in localStorage
  
  useEffect(() => {
    if (userData) {
      setUserFormData(userData); // Set form data with user data
      console.log(userData); // Debug log
    }
  }, [userData]);

  const handleSaveChanges = async () => {
    console.log(userFormData); // Debug log to check data

    // Add validation for required fields
    if (!userFormData.firstName || !userFormData.lastName || !userFormData.email || !userFormData.role) {
      alert("All fields are required.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/users/${userId}`, {
        method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, // Pass the token in the Authorization header
        },
        body: JSON.stringify(userFormData),
      });

      if (response.ok) {
        alert("User updated successfully!");
        setShowEditUser(false); // Close the edit page
      } else {
        const errorData = await response.json();
        alert(`Failed to update user: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("An error occurred while updating the user.");
    }
  };

  return (
    <div className="edit-user-form">
      <h2>Edit User</h2>
      {/* Display form with user data */}
      <input
        type="text"
        value={userFormData.firstName}
        onChange={(e) => setUserFormData({ ...userFormData, firstName: e.target.value })}
      />
      <input
        type="text"
        value={userFormData.lastName}
        onChange={(e) => setUserFormData({ ...userFormData, lastName: e.target.value })}
      />
      <input
        type="email"
        value={userFormData.email}
        onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
      />
      <select
        value={userFormData.role}
        onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
      >
        <option value="ADMIN">ADMIN</option>
        <option value="USER">USER</option>
        <option value="READ_ONLY">READ_ONLY</option>
      </select>
      <button onClick={handleSaveChanges}>Save Changes</button>
      <button onClick={() => setShowEditUser(false)}>Cancel</button>
    </div>
  );
};

export default EditUserPage;
