import React, { useState } from "react";
import { FaFilter } from "react-icons/fa";

const ResourceTable = ({ loading, columns, data, emptyMessage }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      } else {
        return { key, direction: "asc" };
      }
    });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key]?.toString().toLowerCase() || "";
      const bVal = b[sortConfig.key]?.toString().toLowerCase() || "";
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const getRowKey = (item, index) => {
    return (
      item.instanceId ||
      item.resourceId ||
      item.id ||
      item.name ||
      `${index}-${JSON.stringify(item)}`
    );
  };

  return (
    <>
      {loading ? (
        <p>Loading data...</p>
      ) : (
        <table className="ec2-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#003087", color: "white" }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: "12px",
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
              sortedData.map((item, rowIndex) => (
                <tr key={getRowKey(item, rowIndex)} style={{ backgroundColor: rowIndex % 2 === 0 ? "#f9f9f9" : "white" }}>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={col.className || ""}
                      style={{
                        ...col.style,
                        padding: "12px",
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
