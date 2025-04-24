import React, { useEffect, useState } from "react";
import FusionCharts from "fusioncharts";
import Charts from "fusioncharts/fusioncharts.charts";
import ReactFC from "react-fusioncharts";
import FusionTheme from "fusioncharts/themes/fusioncharts.theme.fusion";

ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

const CostExplorer = () => {
  const [selectedAccount, setSelectedAccount] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [chartData, setChartData] = useState([]);

  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  const monthLabels = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Fetch accounts based on role and token
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        let response;
        if (role === "ADMIN" || role === "READ_ONLY") {
          response = await fetch("http://localhost:8080/admin/cloud-accounts", {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else if (role === "CUSTOMER") {
          const userId = localStorage.getItem("userId");
          response = await fetch(`http://localhost:8080/admin/assigned/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }

        if (response.ok) {
          const data = await response.json();
          setAccounts(data);
          if (data.length > 0) {
            setSelectedAccount(data[0].accountId); // default select first account
          }
        } else {
          console.error("Failed to fetch cloud accounts.");
        }
      } catch (error) {
        console.error("Error fetching cloud accounts:", error);
      }
    };

    fetchAccounts();
  }, [role, token]);

  // Fetch cost data when selected account changes
  useEffect(() => {
    if (selectedAccount) {
      const fetchCostData = async () => {
        try {
          const res = await fetch(
            `http://localhost:8080/api/usage-summary?accountId=${selectedAccount}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (res.ok) {
            const rawData = await res.json();
            const usageArray = rawData.totalUsage || [];

            // Convert flat array into monthly service data
            const formattedData = monthLabels.map((month, index) => ({
              month,
              ec2: usageArray[index] || 0,
              rds: usageArray[index + 12] || 0,
              cloudwatch: usageArray[index + 24] || 0,
            }));

            setChartData(formattedData);
          } else {
            console.error("Failed to fetch usage summary.");
            setChartData([]);
          }
        } catch (error) {
          console.error("Error fetching usage summary:", error);
          setChartData([]);
        }
      };

      fetchCostData();
    }
  }, [selectedAccount]);

  const chartConfig = {
    type: "mscolumn2d",
    width: "100%",
    height: "400",
    dataFormat: "json",
    dataSource: {
      chart: {
        
        xAxisName: "Month",
        yAxisName: "Cost ($)",
        theme: "fusion",
        showValues: "0",
      },
      categories: [
        {
          category: chartData.map((item) => ({ label: item.month })),
        },
      ],
      dataset: [
        {
          seriesname: "EC2",
          data: chartData.map((item) => ({ value: item.ec2 })),
        },
        {
          seriesname: "RDS",
          data: chartData.map((item) => ({ value: item.rds })),
        },
        {
          seriesname: "CloudWatch",
          data: chartData.map((item) => ({ value: item.cloudwatch })),
        },
      ],
    },
  };

  return (
    <div>
      <h2>Cost Explorer</h2>
      <select
        value={selectedAccount}
        onChange={(e) => setSelectedAccount(e.target.value)}
      >
        {accounts.map((account) => (
          <option key={account.accountId} value={account.accountId}>
            {account.accountName}
          </option>
        ))}
      </select>
      <div style={{ marginTop: "20px" }}>
        <ReactFC {...chartConfig} />
      </div>
    </div>
  );
};

export default CostExplorer;
