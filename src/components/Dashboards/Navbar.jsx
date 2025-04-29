// src/components/UserDashboard/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import loginIcon from '../../assets/Cloudkeeper_New.svg';
import logOutIcon from '../../assets/logout.png';
import userIcon from '../../assets/user icon.png';

const Navbar = ({ firstName, onLogout }) => (
  <div className="navbar">
    <h2>
      <Link to="/user-dashboard">
        <img src={loginIcon} alt="Cloudkeeper logo" className="clickable-logo" />
      </Link>
    </h2>

    <div className="navbar-right">
      <div className="user-info">
        <img src={userIcon} alt="User Icon" className="user-icon" />
        <p className="welcome-text">Welcome, {firstName}</p>
      </div>
      <button className="logout-btn" onClick={onLogout}>
        <img src={logOutIcon} alt="Logout" />
        Logout
      </button>
    </div>
  </div>
);

export default Navbar;
