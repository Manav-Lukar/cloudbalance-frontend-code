import React, { useState } from "react";
import Step1 from "./step1";
import Step2 from "./step2";
import Step3 from "./step3";
import Step4 from "./Step4"; // ✅ New thank you step
import "../../components/OnboardingFlow/onboardingflow.css";

const OnboardingFlow = () => {
  const [step, setStep] = useState(1);
  const [roleArn, setRoleArn] = useState("");
  const [accountId, setAccountId] = useState("");
  const [accountName, setAccountName] = useState("");  
  const [policyCopySuccess, setPolicyCopySuccess] = useState(false);
  const [roleNameCopySuccess, setRoleNameCopySuccess] = useState(false);

  const handlePolicyCopy = () => {
    navigator.clipboard.writeText("...trust policy...");
    setPolicyCopySuccess(true);
    setTimeout(() => setPolicyCopySuccess(false), 1500);
  };

  const handleRoleNameCopy = () => {
    navigator.clipboard.writeText("CK-Tuner-Role-dev2");
    setRoleNameCopySuccess(true);
    setTimeout(() => setRoleNameCopySuccess(false), 1500);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token"); // or wherever you store your token

    const requestBody = {
      accountId,
      arnNumber: roleArn,
      accountName,
      provider: "AWS",
    };

    try {
      const response = await fetch("http://localhost:8080/admin/add-cloud-accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      console.log("Cloud account created successfully");
      setStep(4); // Move to Thank You page
    } catch (error) {
      console.error("Error creating cloud account:", error);
      alert("Failed to create cloud account. Please try again.");
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1
            handlePolicyCopy={handlePolicyCopy}
            policyCopySuccess={policyCopySuccess}
            handleRoleNameCopy={handleRoleNameCopy}
            roleNameCopySuccess={roleNameCopySuccess}
            setRoleArn={setRoleArn}
            setAccountId={setAccountId}
            setAccountName={setAccountName}
          />
        );
      case 2:
        return (
          <Step2
            roleArn={roleArn}
            setRoleArn={setRoleArn}
            accountId={accountId}
            setAccountId={setAccountId}
            accountName={accountName}
            setAccountName={setAccountName}
          />
        );
      case 3:
        return <Step3 />;
      case 4:
        return <Step4 setStep={setStep} />;
      default:
        return null;
    }
  };

  const getNextButtonLabel = () => {
    switch (step) {
      case 1:
        return "Next - Add Customer Managed Policies";
      case 2:
        return "Create CUR";
      case 3:
        return "Submit";
      default:
        return "Next";
    }
  };

  return (
    <div className="onboarding-container">
      {renderStep()}

      {step < 4 && (
        <div className="onboarding-buttons">
          <div>
            {step > 1 ? (
              <button className="cancel-btn" onClick={() => setStep(step - 1)}>
                Back
              </button>
            ) : (
              <div /> // placeholder
            )}
          </div>

          <button
            className="next-btn"
            onClick={() => {
              if (step < 3) {
                setStep(step + 1);
              } else if (step === 3) {
                handleSubmit(); // trigger API
              }
            }}
          >
            {getNextButtonLabel()}
          </button>
        </div>
      )}
    </div>
  );
};

export default OnboardingFlow;
