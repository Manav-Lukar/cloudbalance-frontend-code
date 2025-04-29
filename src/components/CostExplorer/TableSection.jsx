// src/components/CostExplorer/TableSection.jsx
import React from "react";
import { FaFileExcel } from "react-icons/fa";
import { DownloadTableExcel } from "react-export-table-to-excel";
import ResourceTable from "./ResourceTable";

const TableSection = ({ isLoading, tableData, tableRef }) => {
  const columns = Object.keys(tableData[0] || {});

  return (
    <div className="table-section">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <h3 style={{ margin: 0 }}>Detailed Data</h3>
        <DownloadTableExcel filename="CostExplorerData" sheet="CostData" currentTableRef={tableRef.current}>
          <button
            style={{
              background: "#eafaf1",
              border: "1px solid #b7e4c7",
              borderRadius: "6px",
              cursor: "pointer",
              padding: "6px 12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
            title="Download as Excel"
          >
            <FaFileExcel size={20} color="#217346" />
            <span style={{ color: "#217346", fontWeight: 600, fontSize: "14px" }}>Excel</span>
          </button>
        </DownloadTableExcel>
      </div>
      <ResourceTable loading={isLoading} columns={columns} data={tableData} emptyMessage="No data available" tableRef={tableRef} />
    </div>
  );
};

export default TableSection;
