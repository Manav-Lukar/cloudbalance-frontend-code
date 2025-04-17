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

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      // 🔐 Step 1: Login
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

      // Save to localStorage
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("firstName", data.firstName);
      localStorage.setItem("lastName", data.lastName);
      localStorage.setItem("email", data.email);
      localStorage.setItem("role", data.role);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("token", token); // Make sure token is stored

      // 🕒 Step 2: Last login authenticate API using token in headers
      try {
        const lastLoginRes = await fetch("http://localhost:8080/login/authenticate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: email,
            password: userPassword,
          }),
        });

        if (!lastLoginRes.ok) {
          console.warn("Failed to update last login.");
        }
      } catch (lastLoginErr) {
        console.error("Error in last login API:", lastLoginErr);
      }

      // ✅ Success toast and redirect
      toast.success("Login successful!", {
        position: "top-right",
        theme: "colored",
      });

      setTimeout(() => navigate("/user-dashboard"), 1000);
    } catch (error) {
      console.error("Login failed:", error);
      navigate("/error"); // fallback
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
