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

            // Ensure usageArray has at least 36 elements (12 for each service)
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
        caption: "Monthly Service Costs",
        xAxisName: "Month",
        yAxisName: "Cost (in $)",
        numberPrefix: "$",
        theme: "fusion",
        drawCrossLine: "1",
        plotFillAlpha: "80",
        usePlotGradientColor: "0",
        showPlotBorder: "0",
        showValues: "0",
        paletteColors: "#0075c2,#1aaf5d,#f2c500", // Blue, Green, Yellow
        toolTipBgColor: "#ffffff",
        toolTipPadding: "10",
        toolTipBorderColor: "#cccccc",
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
    <div style={{ padding: "20px" }}>
      <h2>Cost Explorer</h2>
      <select
        value={selectedAccount}
        onChange={(e) => setSelectedAccount(e.target.value)}
        style={{ padding: "8px", marginBottom: "20px" }}
      >
        {accounts.map((account) => (
          <option key={account.accountId} value={account.accountId}>
            {account.accountName}
          </option>
        ))}
      </select>
      <ReactFC {...chartConfig} />
    </div>
  );
};

export default CostExplorer;
