import React from "react";

const RDSDashboard = ({ loading, rdsData }) => {
  return (
    <>
      {loading ? (
        <p>Loading RDS data...</p>
      ) : (
        <table className="ec2-table">
          <thead>
            <tr>
              <th>Resource ID</th>
              <th>Resource Name</th>
              <th>Engine</th>
              <th>Status</th>
              <th>Region</th>
            </tr>
          </thead>
          <tbody>
            {rdsData.length === 0 ? (
              <tr>
                <td colSpan="5">No RDS instances found.</td>
              </tr>
            ) : (
              rdsData.map((db, index) => (
                <tr key={index}>
                  <td>{db.resourceId}</td>
                  <td>{db.resourceName}</td>
                  <td>{db.engine}</td>
                  <td>{db.status}</td>
                  <td>{db.region}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </>
  );
};

export default RDSDashboard;
