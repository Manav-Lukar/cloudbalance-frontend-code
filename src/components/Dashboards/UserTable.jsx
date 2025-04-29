// src/components/UserDashboard/UserTable.jsx
import React from 'react';
import { FaFilter } from 'react-icons/fa';
import editIcon from '../../assets/pencil.svg';

const UserTable = ({ users, loading, onEditClick, role, onSort, sortConfig }) => (
  <table className="user-table">
    <thead>
      <tr>
        {['id', 'firstName', 'lastName', 'email', 'role', 'lastLogin'].map((key) => (
          <th key={key} onClick={() => onSort(key)} style={{ cursor: 'pointer' }}>
            {key.charAt(0).toUpperCase() + key.slice(1)} <FaFilter style={{ fontSize: '12px' }} />
          </th>
        ))}
        {role === 'ADMIN' && <th>Edit</th>}
      </tr>
    </thead>
    <tbody>
      {loading ? (
        <tr>
          <td colSpan={role === 'ADMIN' ? 7 : 6}>Loading users...</td>
        </tr>
      ) : (
        users.map((user, index) => (
          <tr key={index}>
            <td>{user.id}</td>
            <td>{user.firstName}</td>
            <td>{user.lastName}</td>
            <td>{user.email}</td>
            <td>{user.role}</td>
            <td>{user.lastLogin}</td>
            {role === 'ADMIN' && (
              <td>
                <button onClick={() => onEditClick(user.id)} className="edit-btn">
                  <img src={editIcon} alt="edit-icon" />
                </button>
              </td>
            )}
          </tr>
        ))
      )}
    </tbody>
  </table>
);

export default UserTable;
