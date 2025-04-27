import React, { useState } from "react";
import { FaFilter } from "react-icons/fa";

const ResourceTable = ({ loading, columns, data, emptyMessage }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        // If clicking same column, toggle between asc/desc
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      } else {
        // New column clicked, default to ascending
        return { key, direction: "asc" };
      }
    });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;
    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortConfig.key] ? a[sortConfig.key].toString().toLowerCase() : "";
      const bVal = b[sortConfig.key] ? b[sortConfig.key].toString().toLowerCase() : "";
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [data, sortConfig]);

  return (
    <>
      {loading ? (
        <p>Loading data...</p>
      ) : (
        <table className="ec2-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#003087", color: "white" }}>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  style={{
                    padding: "12px",
                    // border: "1px solid #003087",
                    textAlign: "left",
                    position: "relative",
                    cursor: "pointer",
                  }}
                  onClick={() => handleSort(col.key)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {col.header}
                    <FaFilter style={{ fontSize: "12px" }} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: "center", padding: "20px" }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((item, idx) => (
                <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "white" }}>
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={col.className || ""}
                      style={{
                        ...col.style,
                        padding: "12px",
                        // border: "1px solid #ddd",
                      }}
                    >
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </>
  );
};

export default ResourceTable;
