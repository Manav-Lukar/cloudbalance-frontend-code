// src/components/UserDashboard/SearchBar.jsx
import React from 'react';
import { IoSearchSharp } from 'react-icons/io5';

const SearchBar = ({ searchQuery, setSearchQuery }) => (
  <div className="search-container">
    <span className="search-icon">
      <IoSearchSharp />
    </span>
    <input
      type="text"
      className="search-input"
      placeholder="Search by name or email..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  </div>
);

export default SearchBar;
