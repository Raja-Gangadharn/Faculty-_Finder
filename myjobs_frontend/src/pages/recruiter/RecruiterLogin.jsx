import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authService";
import {  FaTimes } from 'react-icons/fa';
import "./recruiter.css";

const RecruiterLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await loginUser(email, password);
      if (user.is_recruiter) {
        navigate("/recruiter/dashboard");
      } else {
        setError("Access denied. You're not registered as Recruiter.");
      }
    } catch (err) {
      setError(err.detail || "Login failed");
    }
  };

  return (
    <div className="login-container bg-light" style={{ minHeight: '100vh' }}>
      <div className="login-content shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: '950px' }}>
        <div className="login-left-panel d-flex flex-column justify-content-center align-items-start" style={{ padding: '40px 32px' }}>
          <div className="left-panel-content">
            <h2 className="welcome-text mb-3">Welcome Recruiter!</h2>
            <p className="subtitle mb-4">Access your recruiter account to post jobs and find talent</p>
            <div className="features-list">
              <div className="feature-item mb-3">
                <span className="feature-icon me-2">🏢</span>
                <span>Post Job Openings</span>
              </div>
              <div className="feature-item mb-3">
                <span className="feature-icon me-2">👥</span>
                <span>Manage Applications</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon me-2">📊</span>
                <span>Track Analytics</span>
              </div>
            </div>
          </div>
        </div>

        <div className="login-right-panel d-flex align-items-center justify-content-center position-relative" style={{ padding: '40px 32px' }}>
          <div className="login-form-container w-100 position-relative" style={{ maxWidth: '400px' }}>
            <button 
              onClick={() => navigate('/')} 
              className="btn p-0 position-absolute" 
              style={{top: '-2rem', right: '0', zIndex: 10, fontSize: '1.5rem', color: '#6c757d'}}
              aria-label="Close"
            >
              <FaTimes />
            </button>
              <h3 className="text-center mb-4 recruiter-title">Recruiter Login</h3>
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group mb-3">
                <label className="form-label">Email</label>
                <div className="input-group">
                  <span className="input-icon">📧</span>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Password</label>
                <div className="input-group">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"/>
                </div>
              </div>
              {error && <div className="error-message mb-2">{error}</div>}
              <button type="submit" className="login-button btn btn-success w-100 d-flex align-items-center justify-content-center gap-2" style={{ fontWeight: 600, borderRadius: '10px', fontSize: '1.1rem' }}>
                <span>Login</span>
                <span className="button-icon">→</span>
              </button>
            </form>
            <div className="text-center mt-4">
              <p className="register-text">
                New recruiter? <Link to="/recruiter/registration" className="register-link">Register here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterLogin;
