import React from "react";
import "./step4.css";
import tick from "../../assets/green_tic.svg";

const Step4 = ({ setStep }) => {
  const handleRestart = (e) => {
    e.preventDefault();
    setStep(1);
  };

  return (
    <div className="thank-you-container">
      <div className="success-icon">
        <img src={tick} alt="green tick" />
      </div>
      <h2>Thank You For CUR Access!</h2>
      <div className="onboard-info-box">
        Alternatively, you can begin onboarding your accounts on Tuner to receive usage-based recommendations.
        <br />
        <a href="#" className="start-onboarding-link" onClick={handleRestart}>
          Go to Create IAM Role Page
        </a>
      </div>
    </div>
  );
};

export default Step4;
