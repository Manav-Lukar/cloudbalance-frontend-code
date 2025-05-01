// src/components/CostExplorer/TableSection.jsx
import React from 'react';
import { FaFileExcel } from 'react-icons/fa';
import { DownloadTableExcel } from 'react-export-table-to-excel';
import ResourceTable from './ResourceTable';

const TableSection = ({ isLoading, tableData, tableRef }) => {
  const columns = Object.keys(tableData[0] || {});

  return (
    <div className="table-section">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}
      >
      </div>
      <ResourceTable
        ref={tableRef}
        loading={isLoading}
        columns={columns}
        data={tableData}
        emptyMessage="No data available"
      />
    </div>
  );
};

export default TableSection;
