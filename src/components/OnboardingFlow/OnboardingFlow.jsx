import React, { useState, useEffect, useRef } from 'react';
import Step1 from './step1';
import Step2 from './step2';
import Step3 from './step3';
import Step4 from './Step4'; // ✅ Thank you step
import './onboardingflow.css';
import { Outlet } from 'react-router-dom';

const OnboardingFlow = () => {
  const [step, setStep] = useState(1);
  const [roleArn, setRoleArn] = useState('');
  const [accountId, setAccountId] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isValid, setIsValid] = useState(false);  // Track validation state
  const onboardingContainerRef = useRef(null);

  useEffect(() => {
    if (onboardingContainerRef.current) {
      onboardingContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [step]);

  useEffect(() => {
    window.scrollTo({ top: 1, behavior: 'smooth' });
  }, [step]);

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');

    const requestBody = {
      accountId,
      arnNumber: roleArn,
      accountName,
    };

    try {
      const response = await fetch('http://localhost:8080/admin/add-cloud-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      console.log('Cloud account created successfully');
      setStep(4);
    } catch (error) {
      console.error('Error creating cloud account:', error);
      alert('Failed to create cloud account. Please try again.');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1
            roleArn={roleArn}
            setRoleArn={setRoleArn}
            accountId={accountId}
            setAccountId={setAccountId}
            accountName={accountName}
            setAccountName={setAccountName}
            setIsValid={setIsValid} // Pass setIsValid to Step1
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
        return 'Next - Add Customer Managed Policies';
      case 2:
        return 'Create CUR';
      case 3:
        return 'Submit';
      default:
        return 'Next';
    }
  };

  return (
    <div className="onboarding-container" ref={onboardingContainerRef}>
      {renderStep()}

      {step < 4 && (
        <div className="onboarding-buttons">
          <button
            className={`cancel-btn ${step === 1 ? 'invisible-btn' : ''}`}
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
          >
            Back
          </button>

          <button
            className="next-btn"
            onClick={() => {
              if (step < 3 && isValid) {
                setStep(step + 1);
              } else if (step === 3) {
                handleSubmit();
              }
            }}
          >
            {getNextButtonLabel()}
          </button>
        </div>
      )}
      <Outlet />
    </div>
  );
};

export default OnboardingFlow;
