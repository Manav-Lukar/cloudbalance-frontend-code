// src/components/CostExplorer/ChartSection.jsx
import React from "react";
import ReactFC from "react-fusioncharts";

import './CostExplorer.css';


const ChartSection = ({ isLoading, chartConfig }) => {
  if (isLoading) return <div className="loading-indicator"></div>;
  if (!chartConfig) return <div className="no-data-message">No data available</div>;

  return (
    <div className="fusioncharts-container">
      <ReactFC {...chartConfig} />
    </div>
  );
};

export default ChartSection;
