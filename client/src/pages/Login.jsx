import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "UNORA AI | Login";
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        { email, password }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/dashboard");
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <motion.div
      className="auth-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* HEADER */}
      <div className="auth-header">
        <img src="/logo.png" alt="logo" className="auth-logo" />
        <div className="auth-app-name">UNORA AI</div>

        <div className="auth-tagline-wrapper">
          <div className="auth-line"></div>
          <div className="auth-tagline">
            Where Understanding Meets Collaboration
          </div>
          <div className="auth-line"></div>
        </div>
      </div>

      {/* CARD */}
      <div className="auth-card">
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className="auth-input"
            value={email}                    
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="auth-input"
              value={password}             
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          <button type="submit" className="auth-button">
            Login
          </button>
        </form>

        <div className="auth-divider">
          <div className="auth-divider-line"></div>
          or
          <div className="auth-divider-line"></div>
        </div>

        <p className="auth-switch" onClick={() => navigate("/register")}>
          Don't have an account? <span>Register</span>
        </p>
      </div>
    </motion.div>
  );
}

export default Login;