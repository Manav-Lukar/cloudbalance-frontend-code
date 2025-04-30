// src/components/CostExplorer/FilterSidebar.jsx
import React from 'react';
import { X } from 'lucide-react';

const FilterSidebar = ({
  showFilters,
  setShowFilters,
  filterGroups,
  selectedFilterGroups,
  handleFilterGroupToggle,
  filterOptions,
  selectedFilters,
  handleFilterChange,
  clearFilters,
  isLoadingFilters,
  filterPanelRef
}) => {
  if (!showFilters) return null;

  return (
    <div className="filter-sidebar" ref={filterPanelRef}>
      <div className="filter-panel-header">
        <h3>Filters</h3>
        <button className="close-filter-btn" onClick={() => setShowFilters(false)}>
          <X size={16} />
        </button>
      </div>

      <div className="filter-groups">
        <h4>Select Filter Groups</h4>
        <div className="filter-groups-list">
          {filterGroups.map((group) => (
            <div key={group} className="filter-group-item">
              <label>
                <input
                  type="checkbox"
                  checked={selectedFilterGroups.includes(group)}
                  onChange={() => handleFilterGroupToggle(group)}
                />
                {group}
              </label>
            </div>
          ))}
        </div>
      </div>

      {selectedFilterGroups.length > 0 && (
        <div className="selected-filters">
          {selectedFilterGroups.map((group) => (
            <div key={group} className="filter-options-group">
              <h4>{group}</h4>
              {isLoadingFilters && !filterOptions[group] ? (
                <div className="filter-loading">Loading options...</div>
              ) : (
                <div className="filter-options-list">
                  {filterOptions[group]?.map((option, index) => {
                    const optionValue = typeof option === 'object' && option !== null
                      ? (Object.values(option)[0] || 'Unknown')
                      : (option || 'Unknown');
                    return (
                      <div key={index} className="filter-option-item">
                        <label>
                          <input
                            type="checkbox"
                            value={optionValue}
                            checked={selectedFilters[group]?.includes(optionValue) || false}
                            onChange={(e) =>
                              handleFilterChange(group, optionValue, e.target.checked)
                            }
                          />
                          {optionValue}
                        </label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          <button className="clear-filters-btn" onClick={clearFilters}>
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterSidebar;