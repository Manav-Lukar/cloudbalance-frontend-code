// src/components/CostExplorer/GroupBySelector.jsx
import React from 'react';

const GroupBySelector = ({
  groupByOptions,
  groupBy,
  setGroupBy,
  isLoadingGroups,
  showMoreOptions,
  setShowMoreOptions,
  dropdownRef,
}) => {
  const handleSelect = (option) => {
    setGroupBy(option.displayName);
    setShowMoreOptions(false);
  };

  return (
    <div className="group-by-section">
      <div className="group-by-title">Group By:</div>
      <div className="group-by-options">
        {isLoadingGroups ? (
          <div>Loading options...</div>
        ) : (
          <>
            {groupByOptions.slice(0, 5).map((option) => (
              <button
                key={option.displayName}
                onClick={() => setGroupBy(option.displayName)}
                className={`group-by-button ${groupBy === option.displayName ? 'active' : ''}`}
              >
                {option.displayName}
              </button>
            ))}

            {groupByOptions.length > 5 && (
              <div className="more-dropdown" ref={dropdownRef}>
                <button
                  onClick={() => setShowMoreOptions(!showMoreOptions)}
                  className="more-button"
                  aria-expanded={showMoreOptions}
                  aria-haspopup="menu"
                >
                  <span>More</span> <span>▼</span>
                </button>

                {showMoreOptions && (
                  <div className="dropdown-menu" role="menu">
                    {groupByOptions.slice(5).map((option) => (
                      <div
                        key={option.displayName}
                        onClick={() => handleSelect(option)}
                        className={`dropdown-item ${groupBy === option.displayName ? 'active' : ''}`}
                        role="menuitem"
                        tabIndex={0}
                      >
                        {option.displayName}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GroupBySelector;
