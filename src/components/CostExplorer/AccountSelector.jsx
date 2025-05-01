// src/components/CostExplorer/AccountSelector.jsx
import React from "react";

const AccountSelector = ({ accounts, selectedAccount, onChange }) => (
  <div style={{ display: "flex", gap: "10px" }}>
    <select
      className="account-selector"
      value={selectedAccount}
      onChange={(e) => onChange(e.target.value)}
    >
      {accounts.map((account,idx) => (
        <option key={idx} value={account.accountId}>
          {account.accountName}
        </option>
      ))}
    </select>
  </div>
);
export default AccountSelector;
