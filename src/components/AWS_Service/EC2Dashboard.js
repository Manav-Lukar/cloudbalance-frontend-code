import React from 'react';
import ResourceTable from './ResourceTable';

const EC2Dashboard = ({ loading, ec2Data }) => {
  const columns = [
    {
      header: 'Instance ID',
      key: 'instanceId',
      render: (item) => (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {item.instanceId}
        </div>
      ),
    },
    { header: 'Name', key: 'name' },
    { header: 'Region', key: 'region' },
    { header: 'State', key: 'state' },
  ];

  return (
    <ResourceTable
      loading={loading}
      columns={columns}
      data={ec2Data}
      emptyMessage="No EC2 instances found."
    />
  );
};

export default EC2Dashboard;
