import React from "react";

const ResourceTable = ({ loading, columns, data, emptyMessage }) => {
  return (
    <>
      {loading ? (
        <p>Loading data...</p>
      ) : (
        <table className="ec2-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>{emptyMessage}</td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr key={idx}>
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={col.className || ""}
                      style={col.style}
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
