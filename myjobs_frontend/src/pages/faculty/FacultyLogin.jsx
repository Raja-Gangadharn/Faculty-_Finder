import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { FaUserGraduate, FaLock, FaArrowRight, FaTimes } from 'react-icons/fa';
import { loginUser } from '../../services/authService';
import './faculty.css';

// Inline SVG placeholder for login image
const loginImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAwIiBoZWlnaHQ9IjEwMDAiIHZpZXdCb3g9IjAgMCAxMDAwIDEwMDAiIGZpbGw9IiNmNWY1ZjUiPjxyZWN0IHdpZHRoPSIxMDAwIiBoZWlnaHQ9IjEwMDAiIGZpbGw9IiNlZWVlZWUiLz48cGF0aCBkPSJNMzAwLDUwMCBDMzAwLDQxMS45OTkgMzcxLjk5OSwzNDAgNDYwLDM0MCBDNTQ4LjAwMSwzNDAgNjIwLDQxMS45OTkgNjIwLDUwMCBMNjIwLDUwMCBDNjIwLDU4OC4wMDEgNTQ4LjAwMSw2NjAgNDYwLDY2MCBDMzcxLjk5OSw2NjAgMzAwLDU4OC4wMDEgMzAwLDUwMCBMMzAwLDUwMCBaIiBmaWxsPSIjZWVlZWVlIiBzdHJva2U9IiNkZGQiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik00NjAsMzAwIEM0MzEuMDQ2LDMwMCA0MDgsMzIzLjA0NiA0MDgsMzUyIEM0MDgsMzgwLjk1NCA0MzEuMDQ2LDQwNCA0NjAsNDA0IEM0ODguOTU0LDQwNCA1MTIsMzgwLjk1NCA1MTIsMzUyIEM1MTIsMzIzLjA0NiA0ODguOTU0LDMwMCA0NjAsMzAwIEw0NjAsMzAwIFoiIGZpbGw9IiNlZWVlZWEiIHN0cm9rZT0iI2RkZCIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBhdGggZD0iTTM2MCw3MDAgTDU2MCw3MDAgQzU4My4xOTYsNzAwIDYwMiw3MTguODA0IDYwMiw3NDIgQzYwMiw3NjUuMTk2IDU4My4xOTYsNzg0IDU2MCw3ODQgTDM2MCw3ODQgQzMzNi44MDQsNzg0IDMxOCw3NjUuMTk2IDMxOCw3NDIgQzMxOCw3MTguODA0IDMzNi44MDQsNzAwIDM2MCw3MDAgWiIgZmlsbD0iI2VlZWVlYSIgc3Ryb9rZT0iI2RkZCIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBhdGggZD0iTTIwMCw2MDAgTDEwMCw2MDAgQzc3LjkwOSw2MDAgNjAsNTgyLjA5MSA2MCw1NjAgTDYwLDQwMCBDNjAsMzc3LjkwOSA3Ny45MDksMzYwIDEwMCwzNjAgTDIwMCwzNjAgQzIyMi4wOTEsMzYwIDI0MCwzNzcuOTA5IDI0MCw0MDAgTDI0MCw1NjAgQzI0MCw1ODIuMDkxIDIyMi4wOTEsNjAwIDIwMCw2MDAgWiIgZmlsbD0iI2QwZTdmZiIvPjxwYXRoIGQ9Ik04MDAsNjAwIEw3MDAsNjAwIEM2NzcuOTA5LDYwMCA2NjAsNTgyLjA5MSA2NjAsNTYwIEw2NjAsNDAwIEM2NjAsMzc3LjkwOSA2NzcuOTA5LDM2MCA3MDAsMzYwIEw4MDAsMzYwIEM4MjIuMDkxLDM2MCA4NDAsMzc3LjkwOSA4NDAsNDAwIEw4NDAsNTYwIEM4NDAsNTgyLjA5MSA4MjIuMDkxLDYwMCA4MDAsNjAwIFoiIGZpbGw9IiNkMGU3ZmYiLz48L3N2Zz4=';

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
    <div className="faculty-login-container">
      <div className="faculty-login-content position-relative">
        <button 
          onClick={() => navigate('/')} 
          className="btn btn-close position-absolute" 
          style={{top: '1rem', right: '1rem', zIndex: 10, fontSize: '1.25rem'}}
          aria-label="Close"
        >
          <FaTimes />
        </button>
        {/* Left Panel with Image */}
        <div className="faculty-login-left-panel">
          <div className="login-image-container">
            <img 
              src={loginImage} 
              alt="Faculty member teaching" 
              className="login-image"
            />
          </div>
          <div className="login-left-content">
            <h2>Welcome Back!</h2>
            <p>Sign in to access your faculty account and explore academic opportunities.</p>
            
            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon"><FaUserGraduate /></span>
                <span>Connect with universities</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon"><FaUserGraduate /></span>
                <span>Find teaching positions</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon"><FaUserGraduate /></span>
                <span>Manage your profile</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="faculty-login-right-panel">
          <div className="login-form-container">
            <h2 className="text-center mb-4">Faculty Login</h2>
            <p className="text-center text-muted mb-4">Enter your credentials to access your account</p>
            
            {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
            
            <Form onSubmit={handleSubmit} className="faculty-login-form">
              <Form.Group className="mb-4">
                <div className="input-group">
                  <span className="input-icon"><FaUserGraduate /></span>
                  <Form.Control
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-control-lg p-2"
                    required
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-4">
                <div className="input-group">
                  <span className="input-icon"><FaLock /></span>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-control-lg p-2"
                    required
                  />
                </div>
                <div className="text-end mt-2">
                  <Link to="/forgot-password" className="forgot-password">
                    Forgot Password?
                  </Link>
                </div>
              </Form.Group>

              <Button 
                type="submit" 
                variant="primary" 
                className="w-100 btn-lg fac-login-button"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
                <FaArrowRight className="ms-2" />
              </Button>
            </Form>

            <div className="text-center mt-4">
              <p className="text-muted">
                Don't have an account?{' '}
                <Link to="/faculty/register" className="register-link text-primary text-decoration-none">
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyLogin;
