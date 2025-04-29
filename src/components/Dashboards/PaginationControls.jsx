// src/components/UserDashboard/PaginationControls.jsx
import React from 'react';

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => (
  <div className="pagination-controls">
    <button onClick={() => onPageChange(-1)} disabled={currentPage === 0}>
      Previous
    </button>
    <span>
      Page {currentPage + 1} of {totalPages}
    </span>
    <button onClick={() => onPageChange(1)} disabled={currentPage >= totalPages - 1}>
      Next
    </button>
  </div>
);

export default PaginationControls;
