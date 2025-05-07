import React, { useState, useEffect, useRef } from 'react';
import Step1 from './step1';
import Step2 from './step2';
import Step3 from './step3';
import Step4 from './Step4';
import './onboardingflow.css';
import { Outlet } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../services/GetService';

const OnboardingFlow = () => {
  const [step, setStep] = useState(1);
  const [roleArn, setRoleArn] = useState('');
  const [accountId, setAccountId] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isValid, setIsValid] = useState(false);
  const onboardingContainerRef = useRef(null);

  useEffect(() => {
    if (onboardingContainerRef.current) {
      onboardingContainerRef.current.scrollTo({ top: 1, behavior: 'smooth' });
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
      const response = await api.post('http://localhost:8080/admin/add-cloud-accounts', requestBody);

      if (response.status === 403) {
        toast.error('Unauthorized! You do not have permission to perform this action.', {
          position: 'top-right',
          autoClose: 4000,
        });
        return;
      }

      toast.success('Cloud account created successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
      setStep(4);
    } catch (error) {
      console.error('Error creating cloud account:', error);
      toast.error('Failed to create cloud account. Please try again.', {
        position: 'top-right',
        autoClose: 4000,
      });
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
            setIsValid={setIsValid}
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

      <ToastContainer />
      <Outlet />
    </div>
  );
};

export default OnboardingFlow;
