// src/components/UserDashboard/useFetchUsers.js
import { useEffect, useState } from 'react';

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

export default useFetchUsers;
