// src/components/FilterSidebar.jsx
import React, { useEffect, useState } from 'react';

const FilterSidebar = ({ isOpen, toggleSidebar }) => {
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFilters = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8080/snowflake/filters/{groupby}');
        if (response.ok) {
          const data = await response.json();
          setFilters(data);
        } else {
          setError('Failed to fetch filters.');
        }
      } catch (error) {
        setError('Error fetching filters.');
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
  }, []);

  return (
    <aside className={`filter-sidebar ${isOpen ? 'open' : ''}`}>
      <h3>Filters</h3>
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <p>Loading filters...</p>
      ) : (
        <div>
          <button onClick={toggleSidebar}>Close</button>
          {/* Render filter options here */}
          <div>
            {/* Example filter checkboxes */}
            {filters.map((filter) => (
              <div key={filter.id}>
                <input type="checkbox" id={filter.id} />
                <label htmlFor={filter.id}>{filter.name}</label>
              </div>
            ))}
          </div>
          <button>Apply</button>
        </div>
      )}
    </aside>
  );
};

export default FilterSidebar;