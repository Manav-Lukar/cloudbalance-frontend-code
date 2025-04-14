import React from "react";
import { useNavigate } from "react-router-dom";
import "./ErrorPage.css"; // You’ll need to create this CSS for styling
import errorImage from "../../assets/error-page.jpg"; // Icy error image

const ErrorPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="error-page-container">
      <div className="error-window">
        <div className="error-image-container">
          <img
            src={errorImage}
            alt="Error"
            className="error-image"
          />
        </div>
        <div className="error-text-container">
          <h1>Oops... Something Went Cold ❄️</h1>
          <p className="error-quote">"The servers are frozen. Try again later."</p>
          <button className="back-home-btn" onClick={handleBack}>
            Go Back Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
