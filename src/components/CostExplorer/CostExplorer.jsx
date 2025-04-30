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
import FilterSidebar from './FilterSidebar';
import { BarChart2, LineChart, Download, Filter } from 'lucide-react';

import './CostExplorer.css';

ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

const CostExplorer = () => {
  const [selectedAccount, setSelectedAccount] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [dateRange, setDateRange] = useState({ startDate: '2025-04', endDate: '2025-04' });
  const [groupBy, setGroupBy] = useState('Service');
  const [groupByOptions, setGroupByOptions] = useState([]);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [filters, setFilters] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('mscolumn2d');
  
  // Filter related states
  const [showFilters, setShowFilters] = useState(false);
  const [filterGroups, setFilterGroups] = useState([]);
  const [selectedFilterGroups, setSelectedFilterGroups] = useState([]);
  const [filterOptions, setFilterOptions] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({});
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);

  const dropdownRef = useRef(null);
  const filterPanelRef = useRef(null);
  const tableRef = useRef(null);

  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  const months = ['2024-10', '2024-11', '2024-12', '2025-01', '2025-02', '2025-03', '2025-04'];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMoreOptions(false);
      }
      
      // Close filter panel when clicking outside
      if (filterPanelRef.current && 
          !filterPanelRef.current.contains(event.target) &&
          !event.target.closest('.filter-toggle-btn')) {
        setShowFilters(false);
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
        const response = await fetch('http://localhost:8080/snowflake/groupby', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setGroupByOptions(data);
          if (!groupBy && data.length > 0) {
            setGroupBy(data[0].displayName);
          }
          
          // Once we have group options, also set them as potential filter groups
          setFilterGroups(data.map(item => item.displayName));
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
  }, [token]);

  // Fetch accounts
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

  // Fetch filter options for selected filter groups
  useEffect(() => {
    const fetchFilterOptions = async (filterGroup) => {
      setIsLoadingFilters(true);
      try {
        const response = await fetch(`http://localhost:8080/snowflake/filters/${filterGroup}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.ok) {
          const data = await response.json();
          // Make sure we have full option values
          setFilterOptions(prevOptions => ({
            ...prevOptions,
            [filterGroup]: data
          }));
        } else {
          console.error(`Failed to fetch filter options for ${filterGroup}`);
        }
      } catch (error) {
        console.error(`Error fetching filter options for ${filterGroup}:`, error);
      } finally {
        setIsLoadingFilters(false);
      }
    };
    
    selectedFilterGroups.forEach(filterGroup => {
      if (!filterOptions[filterGroup]) {
        fetchFilterOptions(filterGroup);
      }
    });
  }, [selectedFilterGroups, token]);

  // Fetch cost data
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
          filters: selectedFilters,
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
  }, [selectedAccount, dateRange, groupBy, selectedFilters]);

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

  const handleFilterGroupToggle = (filterGroup) => {
    setSelectedFilterGroups(prev => {
      if (prev.includes(filterGroup)) {
        // Remove filter group and its selected values
        setSelectedFilters(prevFilters => {
          const updatedFilters = { ...prevFilters };
          delete updatedFilters[filterGroup];
          return updatedFilters;
        });
        return prev.filter(group => group !== filterGroup);
      } else {
        return [...prev, filterGroup];
      }
    });
  };

  const handleFilterChange = (filterGroup, value, checked) => {
    setSelectedFilters(prevFilters => {
      const updatedFilters = { ...prevFilters };
      
      // Initialize array if needed
      if (!updatedFilters[filterGroup]) {
        updatedFilters[filterGroup] = [];
      }
      
      // Add or remove value
      if (checked) {
        updatedFilters[filterGroup] = [...updatedFilters[filterGroup], value];
      } else {
        updatedFilters[filterGroup] = updatedFilters[filterGroup].filter(val => val !== value);
        
        // Remove empty filter groups
        if (updatedFilters[filterGroup].length === 0) {
          delete updatedFilters[filterGroup];
        }
      }
      
      return updatedFilters;
    });
  };

  const clearFilters = () => {
    setSelectedFilters({});
    // Optionally, also clear selected filter groups
    // setSelectedFilterGroups([]);
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
  
      <div className="controls-row">
        <GroupBySelector
          groupByOptions={groupByOptions}
          groupBy={groupBy}
          setGroupBy={setGroupBy}
          isLoadingGroups={isLoadingGroups}
          showMoreOptions={showMoreOptions}
          setShowMoreOptions={setShowMoreOptions}
          dropdownRef={dropdownRef}
        />
  
        <div className="chart-actions">
          <div className="chart-type-selector">
            <button
              onClick={() => setChartType('mscolumn2d')}
              className={`chart-type-btn ${chartType === 'mscolumn2d' ? 'active' : ''}`}
              title="Bar Chart"
            >
              <BarChart2 size={20} />
            </button>
            <button
              onClick={() => setChartType('msline')}
              className={`chart-type-btn ${chartType === 'msline' ? 'active' : ''}`}
              title="Line Chart"
            >
              <LineChart size={20} />
            </button>
          </div>
  
          <button
            className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(prev => !prev)}
            title="Show Filters"
          >
            <Filter size={18} />
            {Object.keys(selectedFilters).length > 0 && (
              <span className="filter-badge">{Object.keys(selectedFilters).length}</span>
            )}
          </button>
  
          
        </div>
      </div>
  
      <div className="content-wrapper">
        <div className="main-content">
          <ChartSection isLoading={isLoading} chartConfig={chartConfig} />
          <TableSection isLoading={isLoading} tableData={tableData} tableRef={tableRef} />
        </div>
  
        <FilterSidebar
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          filterGroups={filterGroups}
          selectedFilterGroups={selectedFilterGroups}
          handleFilterGroupToggle={handleFilterGroupToggle}
          filterOptions={filterOptions}
          selectedFilters={selectedFilters}
          handleFilterChange={handleFilterChange}
          clearFilters={clearFilters}
          isLoadingFilters={isLoadingFilters}
          filterPanelRef={filterPanelRef}
        />
      </div>
    </div>
  );
}

export default CostExplorer;