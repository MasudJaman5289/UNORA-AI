import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/Auth.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "UNORA AI | Register";
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        { name, email, password }
    );

      navigate("/");
    } catch {
      alert("User already exists");
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
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Full Name"
            className="auth-input"
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            className="auth-input"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="auth-input"
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
            Register
          </button>
        </form>

        <div className="auth-divider">
          <div className="auth-divider-line"></div>
          or
          <div className="auth-divider-line"></div>
        </div>

        <p className="auth-switch" onClick={() => navigate("/")}>
          Already have an account? <span>Login</span>
        </p>
      </div>
    </motion.div>
  );
}

export default Register;