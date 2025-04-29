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

  const dropdownRef = useRef(null);
  const tableRef = useRef(null);

  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  const months = ['2024-10', '2024-11', '2024-12', '2025-01', '2025-02', '2025-03', '2025-04'];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMoreOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch group by options
  useEffect(() => {
    const fetchGroupByOptions = async () => {
      setIsLoadingGroups(true);
      try {
        const response = await fetch('http://localhost:8080/snowflake/all', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setGroupByOptions(data);
        } else {
          console.error('Failed to fetch group by options.');
        }
      } catch (error) {
        console.error('Error fetching group by options:', error);
      } finally {
        setIsLoadingGroups(false);
      }
    };
    fetchGroupByOptions();
  }, [token]);

  // Fetch accounts based on role
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
        }
      } catch (error) {
        console.error('Error fetching cloud accounts:', error);
      }
    };
    fetchAccounts();
  }, [role, token]);

  // Fetch cost data
  useEffect(() => {
    const fetchCostData = async () => {
      if (!selectedAccount) return;
      setIsLoading(true);
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
          setChartData([]);
          setTableData([]);
        }
      } catch (error) {
        console.error('Error fetching cost data:', error);
        setChartData([]);
        setTableData([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCostData();
  }, [selectedAccount, dateRange, groupBy, filters]);

  // Process chart data
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
        .filter((item) => item.MONTH === month && item.TOTAL_USAGE_COST >= 0) // filter out negative values
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
  

  // Format date range for chart subtitle
  const formatDateRange = () => {
    const start = new Date(`${dateRange.startDate}-01`);
    const [endYear, endMonth] = dateRange.endDate.split('-');
    const endDate = new Date(endYear, endMonth, 0);
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
  };

  // Chart config generator
  const getChartConfig = () => {
    if (!chartData.length) return null;

    const allKeys = chartData.reduce((keys, month) => {
      Object.keys(month).forEach((key) => {
        if (key !== 'month' && !keys.includes(key)) {
          keys.push(key);
        }
      });
      return keys;
    }, []);
    const serviceNames = allKeys.sort((a, b) => {
      if (a === 'Others') return 1;
      if (b === 'Others') return -1;
      return a.localeCompare(b);
    });

    const colors = [
      '#0075c2',
      '#1aaf5d',
      '#f2c500',
      '#FF4560',
      '#775DD0',
      '#3D9970',
      '#FF851B',
      '#7FDBFF',
      '#B10DC9',
      '#01FF70',
    ];

    const currentGroupOption = groupByOptions.find((option) => option.displayName === groupBy);
    const groupByLabel = currentGroupOption ? currentGroupOption.displayName : groupBy;

    return {
      type: 'mscolumn2d',
      width: '100%',
      height: '400',
      dataFormat: 'json',
      dataSource: {
        chart: {
          caption: `Monthly ${groupByLabel} Costs`,
          subCaption: formatDateRange(),
          xAxisName: 'Month',
          yAxisName: 'Cost (in $)',
          numberPrefix: '$',
          theme: 'fusion',
          showValues: '0',
          showSum: '1',
          usePlotGradientColor: '0',
          paletteColors: colors.slice(0, serviceNames.length).join(','),
          legendPosition: 'bottom',
          legendNumRows: serviceNames.length > 10 ? 2 : 1,
          drawCrossLine: '1',
          plotHighlightEffect: 'fadeout',
          showPlotBorder: '0',
          toolTipBgColor: '#ffffff',
          toolTipPadding: '10',
          toolTipBorderColor: '#cccccc',
          plotFillAlpha: '80',
        },
        categories: [{ category: chartData.map((item) => ({ label: item.month })) }],
        dataset: serviceNames.map((service) => ({
          seriesname: service,
          data: chartData.map((item) => ({ value: (item[service] || 0).toFixed(2) })),
        })),
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

      <ChartSection isLoading={isLoading} chartConfig={chartConfig} />

      <TableSection isLoading={isLoading} tableData={tableData} tableRef={tableRef} />
    </div>
  );
};

export default CostExplorer;
