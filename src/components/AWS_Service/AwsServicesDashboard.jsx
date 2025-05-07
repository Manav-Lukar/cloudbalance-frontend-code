import React, { useEffect, useState } from 'react';
import './AwsServicesDashboard.css';
import EC2Dashboard from './EC2Dashboard';
import RDSDashboard from './RDSDashboard';
import ASGDashboard from './ASGDashboard';
import api from '../../services/GetService';

const AwsServicesDashboard = () => {
  const [cloudAccounts, setCloudAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState([]);
  const [selectedService, setSelectedService] = useState('EC2');
  const [ec2Data, setEc2Data] = useState([]);
  const [rdsData, setRdsData] = useState([]);
  const [asgData, setAsgData] = useState([]);
  const [loading, setLoading] = useState(false);


  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');


  const deduplicateAccounts = (accounts) => {
    const seen = new Set();
    return accounts.filter((acc) => {
      const key = `${acc.accountId}-${acc.arnNumber}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        let response;
        if (role === 'ADMIN' || role === 'READ ONLY') {
          response = await api.get('admin/cloud-accounts');
        } else if (role === 'CUSTOMER') {
          const userId = localStorage.getItem('userId');
          response = await api.get(`/admin/assigned/${userId}`);
        }

          setCloudAccounts(deduplicateAccounts(response.data));
       
      } catch (error) {
        console.error('Error fetching cloud accounts:', error);
      }
    };

    fetchAccounts();
  }, [role, token]);



  // Generic fetch function for services
  const fetchServiceData = async (type, setData) => {
    if (!selectedAccount || selectedService !== type) return;
    setLoading(true);
    setData([]);
    try {
      const response = await api.get(
        `http://localhost:8080/api/${type.toLowerCase()}/metadata?roleArn=${selectedAccount.arnNumber}&region=us-east-1`);
      const data = await response.data();
      setData(response.data);
    } catch (error) {
      console.error(`Error fetching ${type} metadata:`, error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch metadata for EC2, RDS, ASG depending on selection
  useEffect(() => {
    if (selectedService === 'EC2') fetchServiceData('EC2', setEc2Data);
    else if (selectedService === 'RDS') fetchServiceData('RDS', setRdsData);
    else if (selectedService === 'ASG') fetchServiceData('ASG', setAsgData);
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
          <option
            key={`${account.accountId}-${account.arnNumber}`}
            value={account.accountId}
          >
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

      {/* Conditional Rendering of Service Dashboards */}
      {selectedAccount && selectedService === 'EC2' && (
        <EC2Dashboard loading={loading} ec2Data={ec2Data} />
      )}
      {selectedAccount && selectedService === 'RDS' && (
        <RDSDashboard loading={loading} rdsData={rdsData} />
      )}
      {selectedAccount && selectedService === 'ASG' && (
        <ASGDashboard loading={loading} asgData={asgData} />
      )}
    </div>
  );
};

export default AwsServicesDashboard;
