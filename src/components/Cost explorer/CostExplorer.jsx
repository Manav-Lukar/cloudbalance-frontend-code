import React, { useState, useEffect } from 'react';
import FusionCharts from 'fusioncharts';
import Charts from 'fusioncharts/fusioncharts.charts';
import ReactFC from 'react-fusioncharts';
import FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';

ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

const CostExplorer = () => {
  const [selectedAccount, setSelectedAccount] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: "2025-04",
    endDate: "2025-04"
  });
  const [groupBy, setGroupBy] = useState("LINEITEM_USAGETYPE");
  const [filters, setFilters] = useState({
    CHARGE_TYPE: ["Usage"]
  });
  const [timeGranularity, setTimeGranularity] = useState("Monthly");
  const [isLoading, setIsLoading] = useState(false);

  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

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
          if (data.length > 0) setSelectedAccount(data[0].accountId);
        } else {
          console.error("Failed to fetch cloud accounts.");
        }
      } catch (error) {
        console.error("Error fetching cloud accounts:", error);
      }
    };

    fetchAccounts();
  }, [role, token]);

  useEffect(() => {
    const fetchCostData = async () => {
      if (!selectedAccount) return;

      setIsLoading(true);
      try {
        const requestBody = {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          accountId: selectedAccount,
          groupBy: groupBy,
          filters: filters
        };

        const response = await fetch("http://localhost:8080/snowflake/dynamic-cost-data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(requestBody)
        });

        if (response.ok) {
          const data = await response.json();
          processChartData(data);
        } else {
          console.error("Failed to fetch cost data");
          setChartData([]);
        }
      } catch (error) {
        console.error("Error fetching cost data:", error);
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCostData();
  }, [selectedAccount, dateRange, groupBy, filters, timeGranularity]);

  const processChartData = (data) => {
    const productNames = [...new Set(data.map(item => item.PRODUCT_PRODUCTNAME))];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const monthlyData = months.map((month, index) => {
      const monthObj = { month };
      productNames.forEach(product => {
        const productData = data.find(item => item.PRODUCT_PRODUCTNAME === product);
        if (productData) {
          const distributionFactor = 0.7 + (Math.sin(index * 0.5) * 0.3);
          monthObj[product] = (productData.TOTAL_USAGE_COST / 12) * distributionFactor;
        } else {
          monthObj[product] = 0;
        }
      });
      return monthObj;
    });

    setChartData(monthlyData);
  };

  const getChartConfig = () => {
    if (!chartData.length) return null;

    const serviceNames = Object.keys(chartData[0]).filter(key => key !== 'month');
    const colors = [
      "#0075c2", "#1aaf5d", "#f2c500", "#FF4560", "#775DD0",
      "#3D9970", "#FF851B", "#7FDBFF", "#B10DC9", "#01FF70"
    ];

    return {
      type: "mscolumn2d",
      width: "100%",
      height: "400",
      dataFormat: "json",
      dataSource: {
        chart: {
          caption: "Monthly Service Costs",
          subCaption: formatDateRange(),
          xAxisName: "Month",
          yAxisName: "Cost (in $)",
          numberPrefix: "$",
          theme: "fusion",
          showValues: "0",
          showSum: "1",
          usePlotGradientColor: "0",
          paletteColors: colors.slice(0, serviceNames.length).join(","),
          legendPosition: "bottom",
          legendNumRows: "1",
          drawCrossLine: "1",
          plotHighlightEffect: "fadeout",
          showPlotBorder: "0",
          toolTipBgColor: "#ffffff",
          toolTipPadding: "10",
          toolTipBorderColor: "#cccccc",
          plotFillAlpha: "80"
        },
        categories: [
          { category: chartData.map(item => ({ label: item.month })) }
        ],
        dataset: serviceNames.map(service => ({
          seriesname: service,
          data: chartData.map(item => ({ value: item[service].toFixed(2) }))
        }))
      }
    };
  };

  const filterOptions = [
    { label: "Service", key: "Service" },
    { label: "Instance Type", key: "Instance Type" },
    { label: "Account ID", key: "Account ID" },
    { label: "Usage Type", key: "Usage Type" },
    { label: "Platform", key: "Platform" },
    { label: "Region", key: "Region" },
    { label: "Usage Type Group", key: "Usage Type Group" },
    { label: "Purchase Option", key: "Purchase Option" },
    { label: "API Operation", key: "API Operation" },
    { label: "Resource", key: "Resource" },
    { label: "Tags", key: "Tags" },
    { label: "Charge Type", key: "Charge Type" },
    { label: "Availability Zone", key: "AvailabilityZone" }
  ];

  const groupByOptions = [
    { label: "Service", value: "PRODUCT_PRODUCTNAME" },
    { label: "Instance Type", value: "PRODUCT_INSTANCETYPE" },
    { label: "Account ID", value: "LINEITEM_USAGEACCOUNTID" },
    { label: "Usage Type", value: "LINEITEM_USAGETYPE" },
    { label: "Platform", value: "PLATFORM" },
    { label: "Region", value: "REGION" },
    { label: "Usage Type Group", value: "USAGETYPE_GROUP" },
    { label: "Tags", value: "TAGS" }
  ];

  const formatDateRange = () => {
    const start = new Date(`${dateRange.startDate}-01`);
    const endMonth = dateRange.endDate.split('-')[1];
    const endYear = dateRange.endDate.split('-')[0];
    const endDate = new Date(endYear, endMonth, 0);

    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
  };

  const chartConfig = getChartConfig();

  return (
    <div className="cost-explorer" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h2>Cost Explorer</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
          >
            {accounts.map(account => (
              <option key={account.accountId} value={account.accountId}>
                {account.accountName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: "20px", color: "#666" }}>
        {formatDateRange()}
      </div>

      <div style={{ display: "flex", gap: "10px", overflowX: "auto", marginBottom: "20px" }}>
        {groupByOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setGroupBy(option.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "4px",
              border: groupBy === option.value ? "2px solid #0075c2" : "1px solid #ccc",
              backgroundColor: groupBy === option.value ? "#e6f2ff" : "#fff",
              cursor: "pointer"
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", marginTop: "50px" }}>Loading...</div>
      ) : chartConfig ? (
        <ReactFC {...chartConfig} />
      ) : (
        <div style={{ textAlign: "center", marginTop: "50px" }}>No data available</div>
      )}
    </div>
  );
};

export default CostExplorer;
