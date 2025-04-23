import React from "react";

const EC2Dashboard = ({ loading, ec2Data }) => {
  return (
    <>
      {loading ? (
        <p>Loading EC2 data...</p>
      ) : (
        <table className="ec2-table">
          <thead>
            <tr>
              <th>Instance ID</th>
              <th>Name</th>
              <th>Region</th>
              <th>State</th>
            </tr>
          </thead>
          <tbody>
            {ec2Data.length === 0 ? (
              <tr>
                <td colSpan="4">No EC2 instances found.</td>
              </tr>
            ) : (
              ec2Data.map((instance, index) => (
                <tr key={index}>
                  <td>{instance.instanceId}</td>
                  <td>{instance.name}</td>
                  <td>{instance.region}</td>
                  <td>{instance.state}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </>
  );
};

export default EC2Dashboard;
