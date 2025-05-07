import React, { useState, useEffect } from 'react';
import { FiCopy } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import roleImage from '../../assets/role.png'; // adjust path as needed
import './onboardingflow.css';

const trustPolicy = {
  Version: '2012-10-17',
  Statement: [
    {
      Effect: 'Allow',
      Principal: {
        AWS: 'arn:aws:iam::951485052809:root',
      },
      Action: 'sts:AssumeRole',
      Condition: {
        StringEquals: {
          'sts:ExternalId': 'Um9oaXRDS19ERUZBVUxUZDIzOTJkZTgtN2E0OS00NWQ3LTg3MzItODkyM2ExZTIzMjQw',
        },
      },
    },
    {
      Effect: 'Allow',
      Principal: {
        Service: 's3.amazonaws.com',
      },
      Action: 'sts:AssumeRole',
    },
  ],
};

const Step1 = ({
  roleArn,
  setRoleArn,
  accountId,
  setAccountId,
  accountName,
  setAccountName,
  setIsValid,
}) => {
  const [errors, setErrors] = useState({});
  const role = localStorage.getItem('role');
  const normalizedRole = role?.toUpperCase();

  const handlePolicyCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(trustPolicy, null, 2));
    toast.success('Trust policy copied!');
  };

  const handleRoleNameCopy = () => {
    navigator.clipboard.writeText('CK-Tuner-Role-dev2');
    toast.success('Role name copied!');
  };

  const validateInputs = () => {
    const newErrors = {};

    const arnRegex = /^arn:aws:iam::\d{12}:role\/[a-zA-Z0-9-_/]+$/;
    if (!roleArn.trim()) newErrors.roleArn = 'Role ARN is required';
    else if (!arnRegex.test(roleArn)) newErrors.roleArn = 'Invalid Role ARN format';

    if (!accountId.trim()) newErrors.accountId = 'Account ID is required';
    else if (!/^\d{12}$/.test(accountId)) newErrors.accountId = 'Account ID must be 12 digits';

    if (!accountName.trim()) newErrors.accountName = 'Account Name is required';

    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    validateInputs();
  }, [roleArn, accountId, accountName]);

  return (
    <div className="onboarding-container">
      <ToastContainer
        position="top-right"
        autoClose={1500}
        hideProgressBar={false}
        closeOnClick
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
      />

      <h1 className="onboarding-title">Create an IAM Role</h1>

      <ol className="onboarding-steps">
        <li>
          Log into AWS account &{' '}
          <a
            href="https://console.aws.amazon.com/iam/home#/roles"
            target="_blank"
            rel="noopener noreferrer"
          >
            Create an IAM Role
          </a>
          .
        </li>

        <li>
          In the <strong>Trusted entity type</strong> section, select{' '}
          <strong>Custom trust policy</strong>. Paste the following policy:
          <div
            className="code-block-wrapper"
            onClick={handlePolicyCopy}
            title="Click to copy policy"
            style={{ cursor: 'pointer' }}
          >
            <button
              className="copy-btn"
              onClick={(e) => {
                e.stopPropagation();
                handlePolicyCopy();
              }}
              title="Copy to clipboard"
            >
              <FiCopy />
            </button>
            <pre className="code-block">{JSON.stringify(trustPolicy, null, 2)}</pre>
          </div>
        </li>

        <li>
          In the <strong>Role name</strong> field, enter the below-mentioned role name, and click on{' '}
          <strong>Create Role</strong> -
          <div
            className="role-copy-inline"
            onClick={handleRoleNameCopy}
            title="Click to copy role name"
            style={{ cursor: 'pointer' }}
          >
            <code className="role-code">CK-Tuner-Role-dev2</code>
            <button
              className="copy-btn-inline"
              onClick={(e) => {
                e.stopPropagation();
                handleRoleNameCopy();
              }}
              title="Copy Role Name"
            >
              <FiCopy />
            </button>
          </div>
        </li>

        <li>
          Go to the created IAM role and copy the <strong>Role ARN</strong>.
          <div className="step-image">
            <img src={roleImage} alt="Step 5 Screenshot" />
          </div>
        </li>

        <li className="step-six">
          <p className="step-heading">Paste the copied Role ARN below -</p>
          <label htmlFor="roleArn" className="input-label">
            Enter the IAM Role ARN <span className="required">*</span>
          </label>
          <div className="arn-inputs-row">
            <input
              id="roleArn"
              className="arn-input"
              type="text"
              value={roleArn}
              onChange={(e) => setRoleArn(e.target.value)}
              placeholder="Enter the IAM Role ARN here"
              disabled={normalizedRole === 'READ ONLY'}
            />
            <input
              id="accountId"
              className="arn-input"
              type="text"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              placeholder="Enter the Account ID here"
              disabled={normalizedRole === 'READ ONLY'}
            />
            <input
              id="accountName"
              className="arn-input"
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Enter the Account Name here"
              disabled={normalizedRole === 'READ ONLY'}
            />
          </div>
        </li>
      </ol>
    </div>
  );
};

export default Step1;
