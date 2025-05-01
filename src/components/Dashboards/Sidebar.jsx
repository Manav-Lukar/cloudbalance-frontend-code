// src/components/UserDashboard/Sidebar.jsx
import React from 'react';

const Sidebar = ({ menuItems, isCollapsed, toggleSidebar }) => (
  <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
    <div className="sidebar-toggle" onClick={toggleSidebar}>
      {isCollapsed ? '☰' : '☰'}
    </div>
    <ul className="sidebar-menu">
      {menuItems.map((item, index) => (
        <li key={index} onClick={item.action} title={item.label}>
          {!isCollapsed && item.label}
        </li>
      ))}
    </ul>
  </div>
);
export default Sidebar;
