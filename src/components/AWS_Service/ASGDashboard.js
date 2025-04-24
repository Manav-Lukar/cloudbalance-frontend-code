import React from 'react';
import ResourceTable from './ResourceTable';

const ASGDashboard = ({ loading, asgData }) => {
  const columns = [
    {
      header: 'Resource ID',
      key: 'resourceId',
      className: 'asg-rolearn',
      style: { wordBreak: 'break-word', maxWidth: '250px' },
    },
    { header: 'Resource Name', key: 'resourceName' },
    { header: 'Region', key: 'region' },
    { header: 'Desired Capacity', key: 'desiredCapacity' },
    { header: 'Min Size', key: 'minSize' },
    { header: 'Max Size', key: 'maxSize' },
    { header: 'Status', key: 'status' },
  ];

  return (
    <ResourceTable
      loading={loading}
      columns={columns}
      data={asgData}
      emptyMessage="No ASGs found."
    />
  );
};

export default ASGDashboard;
