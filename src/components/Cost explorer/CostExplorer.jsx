import React, { useState, useEffect, useRef } from 'react';
import FusionCharts from 'fusioncharts';
import Charts from 'fusioncharts/fusioncharts.charts';
import ReactFC from 'react-fusioncharts';
import FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';
import { FaFilter } from 'react-icons/fa'; // For table filter icon
import "./CostExplorer.css"; // Assuming you have a CSS file for styles

ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

const CostExplorer = () => {
  const [selectedAccount, setSelectedAccount] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: "2025-04",
    endDate: "2025-04"
  });
  const [groupBy, setGroupBy] = useState("PRODUCT_PRODUCTNAME");
  const [groupByOptions, setGroupByOptions] = useState([]);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [filters, setFilters] = useState({
    CHARGE_TYPE: ["Usage"]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  
  const dropdownRef = useRef(null);

  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  const months = [
    "2024-10", "2024-11", "2024-12", "2025-01", "2025-02", "2025-03", "2025-04"
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMoreOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchGroupByOptions = async () => {
      setIsLoadingGroups(true);
      try {
        const response = await fetch("http://localhost:8080/snowflake/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setGroupByOptions(data);
        } else {
          console.error("Failed to fetch group by options.");
        }
      } catch (error) {
        console.error("Error fetching group by options:", error);
      } finally {
        setIsLoadingGroups(false);
      }
    };
    fetchGroupByOptions();
  }, [token]);

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
          setTableData(data);
        } else {
          console.error("Failed to fetch cost data");
          setChartData([]);
          setTableData([]);
        }
      } catch (error) {
        console.error("Error fetching cost data:", error);
        setChartData([]);
        setTableData([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCostData();
  }, [selectedAccount, dateRange, groupBy, filters]);

  const processChartData = (data) => {
    if (!data || data.length === 0) {
      setChartData([]);
      return;
    }

    const groupedFieldName = groupBy;
    const uniqueMonths = [...new Set(data.map(item => item.MONTH))];
    
    const chartDataArr = uniqueMonths.map(month => {
      const monthObj = { month };
      const monthData = data.filter(item => item.MONTH === month);
      monthData.sort((a, b) => (b.TOTAL_USAGE_COST || 0) - (a.TOTAL_USAGE_COST || 0));
      const topItems = monthData.slice(0, 5);
      const restItems = monthData.slice(5);

      topItems.forEach(item => {
        const groupValue = item[groupedFieldName] || "Unknown";
        monthObj[groupValue] = item.TOTAL_USAGE_COST || 0;
      });

      if (restItems.length > 0) {
        monthObj["Others"] = restItems.reduce((sum, item) => sum + (item.TOTAL_USAGE_COST || 0), 0);
      }
      
      return monthObj;
    });

    setChartData(chartDataArr);
  };

  const getChartConfig = () => {
    if (!chartData.length) return null;
    
    const allKeys = chartData.reduce((keys, month) => {
      Object.keys(month).forEach(key => {
        if (key !== 'month' && !keys.includes(key)) {
          keys.push(key);
        }
      });
      return keys;
    }, []);
    
    const serviceNames = allKeys.sort((a, b) => {
      if (a === "Others") return 1;
      if (b === "Others") return -1;
      return a.localeCompare(b);
    });
    
    const colors = [
      "#0075c2", "#1aaf5d", "#f2c500", "#FF4560", "#775DD0",
      "#3D9970", "#FF851B", "#7FDBFF", "#B10DC9", "#01FF70"
    ];

    const currentGroupOption = groupByOptions.find(option => option.displayName === groupBy);
    const groupByLabel = currentGroupOption ? currentGroupOption.displayName : groupBy;

    return {
      type: "mscolumn2d",
      width: "100%",
      height: "400",
      dataFormat: "json",
      dataSource: {
        chart: {
          caption: `Monthly ${groupByLabel} Costs`,
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
          legendNumRows: serviceNames.length > 10 ? 2 : 1,
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
          data: chartData.map(item => ({ 
            value: (item[service] || 0).toFixed(2) 
          }))
        }))
      }
    };
  };

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
    <div className="cost-explorer">
      {/* Top section - header */}
      <div className="header-controls">
        <h2>Cost Explorer</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <select
            className="account-selector"
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
          >
            {accounts.map(account => (
              <option key={account.accountId} value={account.accountId}>
                {account.accountName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Start/End Month */}
      <div className="date-controls">
        <label>
          Start Month:
          <select
            value={dateRange.startDate}
            onChange={e => setDateRange({ ...dateRange, startDate: e.target.value })}
          >
            {months.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </label>
        <label>
          End Month:
          <select
            value={dateRange.endDate}
            onChange={e => setDateRange({ ...dateRange, endDate: e.target.value })}
          >
            {months.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Group By */}
      <div className="group-by-section">
        <div className="group-by-title">Group By:</div>
        <div className="group-by-options">
          {isLoadingGroups ? (
            <div>Loading options...</div>
          ) : (
            <>
              {groupByOptions.slice(0, 5).map((option) => (
                <button
                  key={option.displayName}
                  onClick={() => setGroupBy(option.displayName)}
                  className={`group-by-button ${groupBy === option.displayName ? 'active' : ''}`}
                >
                  {option.displayName}
                </button>
              ))}

              {/* More Dropdown */}
              <div className="more-dropdown" ref={dropdownRef}>
                <button
                  onClick={() => setShowMoreOptions(!showMoreOptions)}
                  className="more-button"
                >
                  <span>More</span>
                  <span>▼</span>
                </button>
                
                {showMoreOptions && (
                  <div className="dropdown-menu">
                    {groupByOptions.slice(5).map((option) => (
                      <div
                        key={option.displayName}
                        onClick={() => {
                          setGroupBy(option.displayName);
                          setShowMoreOptions(false);
                        }}
                        className={`dropdown-item ${groupBy === option.displayName ? 'active' : ''}`}
                      >
                        {option.displayName}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Chart Section */}
      {isLoading ? (
        <div className="loading-indicator"></div>
      ) : chartConfig ? (
        <div className="fusioncharts-container">
          <ReactFC {...chartConfig} />
        </div>
      ) : (
        <div className="no-data-message">No data available</div>
      )}

      {/* Table Section */}
      <div className="table-section">
        <h3>Detailed Data</h3>
        <ResourceTable 
          loading={isLoading}
          columns={Object.keys(tableData[0] || {})}
          data={tableData}
          emptyMessage="No data available"
        />
      </div>
    </div>
  );
};

export default CostExplorer;

// ResourceTable component
const ResourceTable = ({ loading, columns, data, emptyMessage }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key] || "";
    const bVal = b[sortConfig.key] || "";
    if (sortConfig.direction === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  if (loading) {
    return <div>Loading Table...</div>;
  }

  if (!data.length) {
    return <div>{emptyMessage}</div>;
  }

  return (
    <div className="resource-table-container">
      <table className="resource-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                onClick={() => handleSort(col)}
              >
                {col} <FaFilter className="filter-icon" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, idx) => (
            <tr key={idx}>
              {columns.map((col) => (
                <td key={col}>
                  {row[col]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};