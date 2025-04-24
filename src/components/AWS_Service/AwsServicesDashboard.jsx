import React, { useEffect, useState } from 'react';
import './AwsServicesDashboard.css';
import EC2Dashboard from './EC2Dashboard';
import RDSDashboard from './RDSDashboard';
import ASGDashboard from './ASGDashboard'; // ✅ ASG import

const AwsServicesDashboard = () => {
  const [cloudAccounts, setCloudAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedService, setSelectedService] = useState('EC2');
  const [ec2Data, setEc2Data] = useState([]);
  const [rdsData, setRdsData] = useState([]);
  const [asgData, setAsgData] = useState([]); // ✅ ASG state
  const [loading, setLoading] = useState(false);
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  // Fetch Cloud Accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        let response;
        if (role === 'ADMIN' || role === 'READ_ONLY') {
          response = await fetch('http://localhost:8080/admin/cloud-accounts', {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else if (role === 'CUSTOMER') {
          const userId = localStorage.getItem('userId');
          response = await fetch(`http://localhost:8080/admin/assigned/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }

        if (response.ok) {
          const data = await response.json();
          setCloudAccounts(data);
        } else {
          console.error('Failed to fetch cloud accounts.');
        }
      } catch (error) {
        console.error('Error fetching cloud accounts:', error);
      }
    };

    fetchAccounts();
  }, [role, token]);

  // Fetch EC2 Metadata
  useEffect(() => {
    const fetchEC2Data = async () => {
      if (selectedAccount && selectedService === 'EC2') {
        setLoading(true);
        setEc2Data([]);
        try {
          const response = await fetch(
            `http://localhost:8080/api/ec2/metadata?roleArn=${selectedAccount.arnNumber}&region=us-east-1`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          const data = await response.json();
          setEc2Data(data);
        } catch (error) {
          console.error('Error fetching EC2 metadata:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchEC2Data();
  }, [selectedAccount, selectedService, token]);

  // Fetch RDS Metadata
  useEffect(() => {
    const fetchRDSData = async () => {
      if (selectedAccount && selectedService === 'RDS') {
        setLoading(true);
        setRdsData([]);
        try {
          const response = await fetch(
            `http://localhost:8080/api/rds/metadata?roleArn=${selectedAccount.arnNumber}&region=us-east-1`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          const data = await response.json();
          setRdsData(data);
        } catch (error) {
          console.error('Error fetching RDS metadata:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchRDSData();
  }, [selectedAccount, selectedService, token]);

  // ✅ Fetch ASG Metadata
  useEffect(() => {
    const fetchASGData = async () => {
      if (selectedAccount && selectedService === 'ASG') {
        setLoading(true);
        setAsgData([]);
        try {
          const response = await fetch(
            `http://localhost:8080/api/asg/metadata?roleArn=${selectedAccount.arnNumber}&region=us-east-1`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          const data = await response.json();
          setAsgData(data);
        } catch (error) {
          console.error('Error fetching ASG metadata:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchASGData();
  }, [selectedAccount, selectedService, token]);

  return (
    <div className="aws-service-dashboard">
      <h2>AWS Services Dashboard</h2>

      {/* Cloud Account Dropdown */}
      <select
        onChange={(e) =>
          setSelectedAccount(cloudAccounts.find((acc) => acc.accountId === e.target.value))
        }
      >
        <option value="">Select Cloud Account</option>
        {cloudAccounts.map((account) => (
          <option key={account.accountId} value={account.accountId}>
            {account.accountName} ({account.accountId})
          </option>
        ))}
      </select>

      {/* Service Buttons */}
      <div className="service-buttons">
        {['EC2', 'RDS', 'ASG'].map((service) => (
          <button
            key={service}
            onClick={() => setSelectedService(service)}
            className={selectedService === service ? 'active' : ''}
          >
            {service}
          </button>
        ))}
      </div>

      {/* Render Selected Dashboard */}
      {selectedService === 'EC2' && selectedAccount && (
        <EC2Dashboard loading={loading} ec2Data={ec2Data} />
      )}
      {selectedService === 'RDS' && selectedAccount && (
        <RDSDashboard loading={loading} rdsData={rdsData} />
      )}
      {selectedService === 'ASG' && selectedAccount && (
        <ASGDashboard loading={loading} asgData={asgData} />
      )}
    </div>
  );
};

export default AwsServicesDashboard;
