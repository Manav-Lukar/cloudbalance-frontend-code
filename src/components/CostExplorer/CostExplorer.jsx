// src/components/CostExplorer/CostExplorer.jsx
import React, { useState, useEffect, useRef } from 'react';
import FusionCharts from 'fusioncharts';
import Charts from 'fusioncharts/fusioncharts.charts';
import ReactFC from 'react-fusioncharts';
import FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';

import DateRangeSelector from './DateRangeSelector';
import GroupBySelector from './GroupBySelector';
import AccountSelector from './AccountSelector';
import ChartSection from './ChartSection';
import TableSection from './TableSection';

import { BarChart2, LineChart } from 'lucide-react';

import './CostExplorer.css';

ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

const CostExplorer = () => {
  const [selectedAccount, setSelectedAccount] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [dateRange, setDateRange] = useState({ startDate: '2025-04', endDate: '2025-04' });
  const [groupBy, setGroupBy] = useState('');
  const [groupByOptions, setGroupByOptions] = useState([]);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [filters, setFilters] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [error, setError] = useState(null);

  const [chartType, setChartType] = useState('mscolumn2d');

  const dropdownRef = useRef(null);
  const tableRef = useRef(null);

  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  const months = ['2024-10', '2024-11', '2024-12', '2025-01', '2025-02', '2025-03', '2025-04'];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMoreOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchGroupByOptions = async () => {
      setIsLoadingGroups(true);
      try {
        const response = await fetch('http://localhost:8080/snowflake/groupby', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setGroupByOptions(data);
          if (!groupBy && data.length > 0) {
            setGroupBy(data[0].displayName);
          }
        } else {
          console.error('Failed to fetch group by options.');
          setError('Failed to fetch group by options.');
        }
      } catch (error) {
        console.error('Error fetching group by options:', error);
        setError('Error fetching group by options.');
      } finally {
        setIsLoadingGroups(false);
      }
    };
    if (token) {
      fetchGroupByOptions();
    }
  }, [token, groupBy]);

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
          setAccounts(data);
          if (data.length > 0) setSelectedAccount(data[0].accountId);
        } else {
          console.error('Failed to fetch cloud accounts.');
          setError('Failed to fetch cloud accounts.');
        }
      } catch (error) {
        console.error('Error fetching cloud accounts:', error);
        setError('Error fetching cloud accounts.');
      }
    };
    if (role && token) {
      fetchAccounts();
    }
  }, [role, token]);

  useEffect(() => {
    const fetchCostData = async () => {
      if (!selectedAccount || !groupBy) return;

      setIsLoading(true);
      setError(null);

      try {
        const requestBody = {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          accountId: selectedAccount,
          groupBy,
          filters,
        };
        const response = await fetch('http://localhost:8080/snowflake/dynamic-cost-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const data = await response.json();
          processChartData(data);
          setTableData(data);
        } else {
          console.error('Failed to fetch cost data');
          setError('Failed to fetch cost data');
          setChartData([]);
          setTableData([]);
        }
      } catch (error) {
        console.error('Error fetching cost data:', error);
        setError('Error fetching cost data');
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
    const uniqueMonths = [...new Set(data.map((item) => item.MONTH))];

    const chartDataArr = uniqueMonths.map((month) => {
      const monthObj = { month };
      const monthData = data
        .filter((item) => item.MONTH === month && item.TOTAL_USAGE_COST >= 0)
        .sort((a, b) => (b.TOTAL_USAGE_COST || 0) - (a.TOTAL_USAGE_COST || 0));

      const topItems = monthData.slice(0, 5);
      const restItems = monthData.slice(5);

      topItems.forEach((item) => {
        const groupValue = item[groupedFieldName] || 'Unknown';
        monthObj[groupValue] = item.TOTAL_USAGE_COST || 0;
      });

      if (restItems.length > 0) {
        monthObj['Others'] = restItems.reduce((sum, item) => sum + (item.TOTAL_USAGE_COST || 0), 0);
      }

      return monthObj;
    });

    setChartData(chartDataArr);
  };

  const formatDateRange = () => {
    const start = new Date(`${dateRange.startDate}-01`);
    const [endYear, endMonth] = dateRange.endDate.split('-');
    const endDate = new Date(endYear, endMonth, 0);
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
  };

  const getChartConfig = () => {
    if (!tableData.length) return null;

    const labelKey = 'Month';
    const categoryKey = Object.keys(tableData[0]).find(
      (key) => key !== 'Month' && key !== 'Total Usage'
    );

    const categories = [
      {
        category: [...new Set(tableData.map((item) => item[labelKey]))].map((month) => ({
          label: month,
        })),
      },
    ];

    const groups = [...new Set(tableData.map((item) => item[categoryKey]))];

    const dataset = groups.map((group) => ({
      seriesname: group,
      data: categories[0].category.map((cat) => {
        const match = tableData.find(
          (item) => item[labelKey] === cat.label && item[categoryKey] === group
        );
        return { value: match ? match['Total Usage'].toFixed(2) : 0 };
      }),
    }));

    return {
      type: chartType,
      width: '100%',
      height: '400',
      dataFormat: 'json',
      dataSource: {
        chart: {
          caption: `Monthly Usage by ${categoryKey}`,
          xAxisName: 'Month',
          yAxisName: 'Total Usage',
          numberPrefix: '$',
          theme: 'fusion',
        },
        categories,
        dataset,
      },
    };
  };

  const chartConfig = getChartConfig();

  return (
    <div className="cost-explorer">
      <div className="header-controls">
        <h2>Cost Explorer</h2>
        <AccountSelector
          accounts={accounts}
          selectedAccount={selectedAccount}
          onChange={setSelectedAccount}
        />
      </div>

      {accounts.length === 0 && (
        <p className="info-message">No accounts available for this user.</p>
      )}
      {error && <div className="error-message">{error}</div>}

      <DateRangeSelector months={months} dateRange={dateRange} setDateRange={setDateRange} />

      <GroupBySelector
        groupByOptions={groupByOptions}
        groupBy={groupBy}
        setGroupBy={setGroupBy}
        isLoadingGroups={isLoadingGroups}
        showMoreOptions={showMoreOptions}
        setShowMoreOptions={setShowMoreOptions}
        dropdownRef={dropdownRef}
      />

      {/* Chart Type Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0' }}>
        <span style={{ fontWeight: 500 }}></span>
        <button
          onClick={() => setChartType('mscolumn2d')}
          style={{
            background: chartType === 'mscolumn2d' ? '#eef2ff' : 'transparent',
            border: '1px solid #ccc',
            padding: '6px',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
          title="Bar Chart"
        >
          <BarChart2 size={20} color={chartType === 'mscolumn2d' ? '#1e40af' : '#555'} />
        </button>
        <button
          onClick={() => setChartType('msline')}
          style={{
            background: chartType === 'msline' ? '#eef2ff' : 'transparent',
            border: '1px solid #ccc',
            padding: '6px',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
          title="Line Chart"
        >
          <LineChart size={20} color={chartType === 'msline' ? '#1e40af' : '#555'} />
        </button>
      </div>

      <ChartSection isLoading={isLoading} chartConfig={chartConfig} />

      <TableSection isLoading={isLoading} tableData={tableData} tableRef={tableRef} />
    </div>
  );
};

export default CostExplorer;
