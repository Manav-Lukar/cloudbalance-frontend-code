import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import loginIcon from "../../assets/Cloudkeeper_New.svg";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [errors, setErrors] = useState({ email: false, password: false });

  const validateFields = () => {
    let isValid = true;
    const newErrors = { email: false, password: false };

    if (!email.trim()) {
      toast.error("Email is required.", { position: "top-right", theme: "colored" });
      newErrors.email = true;
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address.", { position: "top-right", theme: "colored" });
      newErrors.email = true;
      isValid = false;
    }

    if (!userPassword.trim()) {
      toast.error("Password is required.", { position: "top-right", theme: "colored" });
      newErrors.password = true;
      isValid = false;
    } else if (userPassword.length < 4) {
      toast.error("Password must be at least 6 characters long.", { position: "top-right", theme: "colored" });
      newErrors.password = true;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!validateFields()) return;

    const credentials = btoa(`${email}:${userPassword}`); // Encode credentials for Basic Auth

    try {
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "GET",
        headers: {
          Authorization: `Basic ${credentials}`
        }
      });

      if (!response.ok) {
        toast.error("Invalid credentials. Please try again.", {
          position: "top-right",
          theme: "colored"
        });
        return;
      }

      const data = await response.json();

      localStorage.setItem("email", data.email);
      localStorage.setItem("role", data.role);
      localStorage.setItem("isAuthenticated", "true");

      toast.success("Login successful!", {
        position: "top-right",
        theme: "colored"
      });

      setTimeout(() => navigate("/user-dashboard"), 1000);
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Something went wrong. Please try again.", {
        position: "top-right",
        theme: "colored"
      });
    }
  };

  return (
    <div className="container">
      <ToastContainer />
      <div className="header">
        <img src={loginIcon} alt="Login" className="login-icon" />
        <div className="underline"></div>
      </div>

      <form onSubmit={handleLogin}>
        <div className="inputs">
          <div className="input-group">
            <label>Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? "input-error" : ""}
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={userPassword}
              onChange={(e) => setUserPassword(e.target.value)}
              className={errors.password ? "input-error" : ""}
            />
          </div>
        </div>

        <div className="submit-container">
          <button type="submit" className="submit">
            Log In
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
