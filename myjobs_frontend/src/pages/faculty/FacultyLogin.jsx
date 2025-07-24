import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Alert } from 'react-bootstrap';
import { FaArrowRight } from 'react-icons/fa';
import { loginUser } from "../../services/authService";
import "./faculty.css";

const FacultyLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const userData = await loginUser(email.trim(), password.trim());
      if (userData.is_faculty) {
        navigate("/faculty/dashboard");
      } else {
        setError("Access denied. Not a faculty member.");
      }
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container faculty-page">
      <div className="login-content">
        <div className="login-left-panel faculty-left-panel">
          <div className="left-panel-content">
            <h2 className="welcome-text">Welcome Back!</h2>
            <p className="subtitle">Access your faculty account to explore academic opportunities</p>
            <div className="features-list">
              <div className="feature-item"><span className="feature-icon">🎓</span><span>Access Academic Jobs</span></div>
              <div className="feature-item"><span className="feature-icon">📚</span><span>Manage Your Profile</span></div>
              <div className="feature-item"><span className="feature-icon">🔍</span><span>Search Opportunities</span></div>
            </div>
          </div>
        </div>

        <div className="login-right-panel">
          <div className="login-form-container">
            <button className="btn-close position-absolute top-0 end-0 m-3" onClick={() => navigate('/')}></button>
            <h3 className="text-center mb-4 faculty-title">Faculty Login</h3>
            <Form onSubmit={handleSubmit} className="login-form">
              <div className="mb-3">
                <Form.Label htmlFor="facultyEmail">Email</Form.Label>
                <div className="input-group">
                  <span className="input-icon">📧</span>
                  <Form.Control
                    id="facultyEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              <div className="mb-3">
                <Form.Label htmlFor="facultyPassword">Password</Form.Label>
                <div className="input-group">
                  <span className="input-icon">🔒</span>
                  <Form.Control
                    id="facultyPassword"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>
              {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
              <Button type="submit" variant="primary" className="fac-login-button" disabled={loading}>
                {loading ? "Logging in..." : (
                  <>
                    <span>Login</span>
                    <FaArrowRight className="button-icon ms-2" />
                  </>
                )}
              </Button>
            </Form>
            <div className="text-center mt-4">
              <p className="register-text">
                New faculty member? <Link to="/faculty/register" className="fac-register-link">Register here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyLogin;
