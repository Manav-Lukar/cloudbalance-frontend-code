// src/components/CostExplorer/GroupBySelector.jsx
import React from "react";

const GroupBySelector = ({
  groupByOptions,
  groupBy,
  setGroupBy,
  isLoadingGroups,
  showMoreOptions,
  setShowMoreOptions,
  dropdownRef,
}) => {
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
                className={`group-by-button ${groupBy === option.displayName ? "active" : ""}`}
              >
                {option.displayName}
              </button>
            ))}

            <div className="more-dropdown" ref={dropdownRef}>
              <button onClick={() => setShowMoreOptions(!showMoreOptions)} className="more-button">
                <span>More</span> <span>▼</span>
              </button>

              {showMoreOptions && (
                <div className="dropdown-menu">
                  {groupByOptions.slice(5).map((option) => (
                    <div
                      key={option.displayName}
                      onClick={() => {
                        setGroupBy(option.displayName);
                        setShowMoreOptions(false);
                      }}
                      className={`dropdown-item ${groupBy === option.displayName ? "active" : ""}`}
                    >
                      {option.displayName}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GroupBySelector;
