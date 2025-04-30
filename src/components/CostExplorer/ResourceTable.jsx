import React, { useState, forwardRef } from "react";
import { FaFilter } from "react-icons/fa";

const ResourceTable = forwardRef(({ loading, columns, data, emptyMessage }, tableRef) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key] || "";
      const bVal = b[sortConfig.key] || "";
      return sortConfig.direction === "asc" ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  }, [data, sortConfig]);

  if (loading) return <div>Loading Table...</div>;
  if (!data.length) return <div>{emptyMessage}</div>;

  return (
    <div style={{ overflowX: "auto", padding: "2rem", backgroundColor: "#f9f9f9" }}>
      <table ref={tableRef} style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Arial, sans-serif", fontSize: "14px" }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            {columns.map((col) => (
              <th
                key={col}
                onClick={() => handleSort(col)}
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  borderBottom: "2px solid #ccc",
                  cursor: "pointer",
                  color: "#333",
                  userSelect: "none",
                }}
              >
                {col} <FaFilter style={{ marginLeft: "8px", color: "#666" }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, idx) => (
            <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f7f7f7" }}>
              {columns.map((col) => (
                <td
                  key={col}
                  style={{
                    padding: "10px 16px",
                    borderBottom: "1px solid #e0e0e0",
                    color: "#444",
                  }}
                >
                  {row[col]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default ResourceTable;
