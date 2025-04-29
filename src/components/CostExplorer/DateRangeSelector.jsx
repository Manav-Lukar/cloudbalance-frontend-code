// src/components/CostExplorer/DateRangeSelector.jsx
import React from "react";

const DateRangeSelector = ({ months, dateRange, setDateRange }) => (
  <div className="date-controls">
    <label>
      Start Month:
      <select
        value={dateRange.startDate}
        onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
      >
        {months.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </label>
    <label>
      End Month:
      <select
        value={dateRange.endDate}
        onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
      >
        {months.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </label>
  </div>
);

export default DateRangeSelector;
