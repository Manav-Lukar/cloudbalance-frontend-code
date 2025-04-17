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

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1
            setStep={setStep}
            roleArn={roleArn}
            setRoleArn={setRoleArn}
            accountId={accountId}
            setAccountId={setAccountId}
            accountName={accountName}
            setAccountName={setAccountName}
          />
        );
      case 2:
        return (
          <Step2
            setStep={setStep}
            roleArn={roleArn}
            accountId={accountId}
            accountName={accountName}
          />
        );
      case 3:
        return <Step3 setStep={setStep} />;
      case 4:
        return <Step4 setStep={setStep} />;
      default:
        return null;
    }
  };

  return <div className="onboarding-container">{renderStep()}</div>;
};

export default OnboardingFlow;
