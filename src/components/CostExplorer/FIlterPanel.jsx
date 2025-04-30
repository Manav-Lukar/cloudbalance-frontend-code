// import React from 'react';

// const FilterPenal = ({ filterOptions, selectedFilters, onFilterChange }) => {
//   if (!filterOptions.length) return null;

//   return (
//     <div className="filter-section">
//       <h4>Filters</h4>
//       {filterOptions.map((option) => (
//         <div key={option.columnName} className="filter-group">
//           <label>{option.displayName}</label>
//           <select
//             value={selectedFilters[option.columnName] || ''}
//             onChange={(e) => onFilterChange(option.columnName, e.target.value)}
//           >
//             <option value="">All</option>
//             {option.values.map((val) => (
//               <option key={val} value={val}>
//                 {val}
//               </option>
//             ))}
//           </select>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default FilterPenal;
