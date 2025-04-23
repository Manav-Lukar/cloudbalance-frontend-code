import React from "react";

const ASGDashboard = ({ loading, asgData }) => {
  return (
    <>
      {loading ? (
        <p>Loading ASG data...</p>
      ) : (
        <table className="ec2-table">
          <thead>
            <tr>
              <th>Resource ID</th>
              <th>Resource Name</th>
              <th>Region</th>
              <th>Desired Capacity</th>
              <th>Min Size</th>
              <th>Max Size</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {asgData.length === 0 ? (
              <tr>
                <td colSpan="6">No ASGs found.</td>
              </tr>
            ) : (
              asgData.map((asg, index) => (
                <tr key={index}>
                  <td className="asg-rolearn">{asg.resourceId}</td>
                  <td>{asg.resourceName}</td>
                  <td>{asg.region}</td>
                  <td>{asg.desiredCapacity}</td>
                  <td>{asg.minSize}</td>
                  <td>{asg.maxSize}</td>
                  <td>{asg.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </>
  );
};

export default ASGDashboard;
