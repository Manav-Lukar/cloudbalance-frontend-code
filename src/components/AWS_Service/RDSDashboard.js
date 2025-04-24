import React from 'react';
import ResourceTable from './ResourceTable';

const RDSDashboard = ({ loading, rdsData }) => {
  const columns = [
    { header: 'Resource ID', key: 'resourceId' },
    { header: 'Resource Name', key: 'resourceName' },
    { header: 'Engine', key: 'engine' },
    { header: 'Status', key: 'status' },
    { header: 'Region', key: 'region' },
  ];

  return (
    <ResourceTable
      loading={loading}
      columns={columns}
      data={rdsData}
      emptyMessage="No RDS instances found."
    />
  );
};

export default RDSDashboard;
