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

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1
            handlePolicyCopy={handlePolicyCopy}
            policyCopySuccess={policyCopySuccess}
            handleRoleNameCopy={handleRoleNameCopy}
            roleNameCopySuccess={roleNameCopySuccess}
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
      // Inside renderStep()
      case 4:
        return <Step4 setStep={setStep} />;

        return <Step4 />; 
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
                setStep(4); // ✅ Go to Thank You page
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
