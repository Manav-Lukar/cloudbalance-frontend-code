import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import loginIcon from "../../assets/Cloudkeeper_New.svg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [errors, setErrors] = useState({ email: false, password: false });

  const validateInputs = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const newErrors = {
      email: !emailRegex.test(email),
      password: userPassword.trim() === "",
    };
    setErrors(newErrors);
    return !(newErrors.email || newErrors.password);
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!validateInputs()) {
      toast.error("Please fix the errors before submitting.", {
        position: "top-right",
        theme: "colored",
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: userPassword }),
      });

      if (!response.ok) {
        toast.error("Invalid credentials. Please try again.", {
          position: "top-right",
          theme: "colored",
        });
        return;
      }

      const data = await response.json();
      const token = data.token;

      localStorage.setItem("userId", data.id);
      localStorage.setItem("firstName", data.firstName);
      localStorage.setItem("lastName", data.lastName);
      localStorage.setItem("email", data.email);
      localStorage.setItem("role", data.role);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("token", token);

      toast.success("Login successful!", {
        position: "top-right",
        theme: "colored",
      });

      setTimeout(() => navigate("/user-dashboard"), 1000);
    } catch (error) {
      console.error("Login failed:", error);
      navigate("/error");
    }
  };

  return (
    <div className="login-page-wrapper">
      <ToastContainer />
      <div className="container">
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
              {errors.email && <p className="error-text">Please enter a valid email.</p>}
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                className={errors.password ? "input-error" : ""}
              />
              {errors.password && <p className="error-text">Password is required.</p>}
            </div>
          </div>
          <div className="submit-container">
            <button type="submit" className="submit">Log In</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
