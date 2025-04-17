import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";

import { FiCopy } from "react-icons/fi";
import cktuner from "../../assets/cktuner.png"; // adjust path as needed
import permission from "../../assets/permission_policy.png"; // adjust path as needed
import create_policy from "../../assets/create policy.png"; // adjust path as needed
import report from "../../assets/report details.png";
import delivery from "../../assets/delivery.png";
import reportDelivery from "../../assets/report_delivery.png";
import "./onboardingflow.css";
import { useNavigate } from "react-router-dom";

const trustPolicyFour = {
  Version: "2012-10-17",
  Statement: [
    {
      Action: [
        "cur:ValidateReportDestination",
        "cur:DescribeReportDefinitions",
      ],
      Resource: ["*"],
      Effect: "Allow",
      Sid: "ReadCostAndUsageReport",
    },
    {
      Action: [
        "s3:ListBucket",
        "s3:GetReplicationConfiguration",
        "s3:GetObjectVersionForReplication",
        "s3:GetObjectVersionAcl",
        "s3:GetObjectVersionTagging",
        "s3:GetObjectRetention",
        "s3:GetObjectLegalHold",
        "s3:GetObject",
      ],
      Resource: [
        "arn:aws:s3:::ck-tuner-275595855473",
        "arn:aws:s3:::ck-tuner-275595855473/*",
      ],
      Effect: "Allow",
      Sid: "S3LimitedRead",
    },
    {
      Action: [
        "s3:GetObjectVersionTagging",
        "s3:GetBucketVersioning",
        "s3:ReplicateObject",
        "s3:ReplicateDelete",
        "s3:ReplicateTags",
        "s3:ObjectOwnerOverrideToBucketOwner",
      ],
      Resource: [
        "arn:aws:s3:::ck-tuner-cur-dev2-1000291",
        "arn:aws:s3:::ck-tuner-cur-dev2-1000291/*",
      ],
      Effect: "Allow",
      Sid: "S3Replicate",
    },
    {
      Action: ["s3:PutObject", "s3:GetObject"],
      Resource: "arn:aws:s3:::ck-tuner-275595855473/CKTunerTestFile",
      Effect: "Allow",
      Sid: "S3ReplicationCheck",
    },
  ],
};

const Step3 = ({setStep}) => {
  const navigate = useNavigate();

  const handlePolicyCopy = (policy) => {
    navigator.clipboard.writeText(JSON.stringify(policy, null, 2));
    toast.success("Data Copied!");
  };

  const handleRoleNameCopy = (name) => {
    navigator.clipboard.writeText(name);
    toast.success("Data Copied!");
  };

  const renderCodeBlock = (policy) => (
    <div
      className="code-block-wrapper"
      onClick={() => handlePolicyCopy(policy)}
      title="Click to copy"
      style={{ cursor: "pointer" }}
    >
      <button
        className="copy-btn"
        title="Copy to clipboard"
        onClick={(e) => {
          e.stopPropagation();
          handlePolicyCopy(policy);
        }}
      >
        <FiCopy />
      </button>
      <pre className="code-block">{JSON.stringify(policy, null, 2)}</pre>
    </div>
  );

  const renderRoleName = (name) => (
    <div
      className="role-copy-inline"
      onClick={() => handleRoleNameCopy(name)}
      title="Click to copy"
      style={{ cursor: "pointer" }}
    >
      <code className="role-code">{name}</code>
      <button
        className="copy-btn-inline"
        onClick={(e) => {
          e.stopPropagation();
          handleRoleNameCopy(name);
        }}
        title="Copy"
      >
        <FiCopy />
      </button>
    </div>
  );

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

      <h1 className="onboarding-title">Create Cost & Usage Report</h1>

      <ol className="onboarding-steps">
        <li>
          Go to <span className="link-highlight">Cost and Usage Reports</span>{" "}
          in the Billing Dashboard and click on <strong>Create report.</strong>
        </li>

        <li>
          Name the report as shown below and select the{" "}
          <strong>Include resource IDs</strong> checkbox –
          {renderRoleName("ck-tuner-275595855473-hourly-cur")}
          <br />
          <span>Ensure that the following configuration is checked</span>
          <div className="checkbox-section" style={{ marginTop: "0.5rem" }}>
            <input type="checkbox" checked readOnly />
            <label style={{ marginLeft: "0.5rem" }}>
              <strong>Include Resource IDs</strong>
            </label>
          </div>
          <p>
            Click on <strong>Next</strong>
          </p>
          <div className="step-image">
            <img src={report} alt="report details" />
          </div>
        </li>

        <li>
          In <i>Configure S3 Bucket</i>, provide the name of the S3 bucket that
          was created -
          <span>Ensure that the following configuration is checked</span>
          <div className="checkbox-section" style={{ marginTop: "0.5rem" }}>
            <input type="checkbox" checked readOnly />
            <label style={{ marginLeft: "0.5rem" }}>
              <strong>
                The following default policy will be applied to your bucket
              </strong>
            </label>
          </div>
          <p>
            Click on <strong>Save</strong>
          </p>
          <div className="step-image">
            <img src={delivery} alt="report details" />
          </div>
        </li>

        <li>
          In the Delivery options section, enter the below-mentioned Report path
          prefix –{renderRoleName("275595855473")}
          <span>
            Additionally, ensure that the following checks are in place
            <div>
              <span>Time granularity:</span>
            </div>
          </span>
          <div className="checkbox-section" style={{ marginTop: "0.5rem" }}>
            <input type="checkbox" checked readOnly />
            <label style={{ marginLeft: "0.5rem" }}>
              <strong>Hourly</strong>
            </label>
          </div>
          <p>
            Please make sure these checks are Enabled in Enable report data
            integration for:
          </p>
          <div className="checkbox-section" style={{ marginTop: "0.5rem" }}>
            <input type="checkbox" checked readOnly />
            <label style={{ marginLeft: "0.5rem" }}>
              <strong>Amazon Athena</strong>
            </label>
          </div>
          <div className="step-image">
            <img src={reportDelivery} alt="report details" />
          </div>
        </li>

        <li>
          Click on <strong>Next</strong>. Now, review the configuration of the
          Cost and Usage Report. Once satisfied, click on{" "}
          <strong>Create Report</strong>
        </li>
      </ol>
      <div className="onboarding-buttons">
        <button className="cancel-btn" onClick={() => setStep(2)}>
          Back
        </button>
        <button className="next-btn" onClick={() => setStep(4)}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default Step3;
