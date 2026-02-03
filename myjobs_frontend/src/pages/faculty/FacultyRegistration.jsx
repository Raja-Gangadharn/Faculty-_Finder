import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { FaUserGraduate, FaLock, FaFileAlt, FaArrowRight, FaCheck, FaTimes } from 'react-icons/fa';
import { registerFaculty } from '../../services/authService';
import './faculty.css';

const FacultyRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    workPreference: '',
    resume: null,
    transcripts: null,
    agreeTerms: false,
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fileNames, setFileNames] = useState({
    resume: 'No file chosen',
    transcripts: 'No file chosen'
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    let newValue;
    
    if (type === 'checkbox') {
      newValue = checked;
    } else if (type === 'file') {
      newValue = files[0];
      // Update file names for display
      setFileNames(prev => ({
        ...prev,
        [name]: files[0] ? files[0].name : 'No file chosen'
      }));
    } else {
      newValue = value;
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: newValue,
    }));
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.firstName) errors.push('First name is required');
    if (!formData.lastName) errors.push('Last name is required');
    if (!formData.email) {
      errors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push('Email is invalid');
    }
    if (!formData.password) {
      errors.push('Password is required');
    } else if (formData.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    if (!formData.workPreference) errors.push('Work preference is required');
    if (!formData.resume) errors.push('Resume is required');
    if (!formData.transcripts) errors.push('Transcripts are required');
    if (!formData.agreeTerms) errors.push('You must agree to the terms and conditions');
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors[0]);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // This would be your actual registration API call
      await registerFaculty(formData);
      
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/faculty/login');
      }, 2000);
    } catch (err) {
  console.error("Faculty registration error:", err.response?.data);

  if (err.response?.data) {
    const firstError = Object.values(err.response.data)[0];
    setError(Array.isArray(firstError) ? firstError[0] : firstError);
  } else {
    setError("Registration failed. Please try again.");
  }
}
 finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="faculty-registration-container">
      <div className="faculty-registration-content position-relative">
        <button 
          onClick={() => navigate('/')} 
          className="btn btn-close position-absolute" 
          style={{top: '1rem', right: '1rem', zIndex: 10, fontSize: '1.25rem'}}
          aria-label="Close"
        >
          <FaTimes />
        </button>
        {/* Left Panel with Image - Same as login */}
        <div className="faculty-registration-left-panel">
          <div className="login-image-container">
            <div className="login-image-overlay"></div>
          </div>
          <div className="login-left-content">
            <h2>Join Our Faculty Network</h2>
            <p>Register to access exclusive faculty opportunities and resources.</p>
            
            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon"><FaCheck /></span>
                <span>Connect with universities</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon"><FaCheck /></span>
                <span>Find teaching positions</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon"><FaCheck /></span>
                <span>Manage your profile</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Registration Form */}
        <div className="faculty-login-right-panel">
          <div className="login-form-container">
            <h2>Create Account</h2>
            <p className="text-center text-muted mb-4">Fill in your details to get started</p>
            
            {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
            {success && <Alert variant="success" className="mb-4">{success}</Alert>}
            
            <Form onSubmit={handleSubmit} className="faculty-registration-form">
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <div className="input-group">
                      <span className="input-icon"><FaUserGraduate /></span>
                      <Form.Control
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="form-control-lg"
                        required
                      />
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <div className="input-group">
                      <span className="input-icon"><FaUserGraduate /></span>
                      <Form.Control
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="form-control-lg"
                        required
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <div className="input-group">
                  <span className="input-icon"><FaUserGraduate /></span>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control-lg"
                    required
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-4">
                <div className="input-group">
                  <span className="input-icon"><FaLock /></span>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Create Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-control-lg"
                    required
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-4">
                <div className="input-group">
                  <span className="input-icon"><FaFileAlt /></span>
                  <Form.Select
                    name="workPreference"
                    value={formData.workPreference}
                    onChange={handleChange}
                    className="form-control-lg"
                    required
                  >
                    <option value="">Select Work Preference</option>
                    <option value="full_time">Full-time</option>
                    <option value="part_time">Part-time</option>
                    <option value="adjunct">Adjunct</option>
                    <option value="visiting">Visiting Professor</option>
                  </Form.Select>
                </div>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="mb-2 d-block">Resume (PDF, DOC, DOCX)</Form.Label>
                <div className="file-upload-wrapper" style={{ position: 'relative' }}>
                  <Form.Control
                    type="file"
                    name="resume"
                    onChange={handleChange}
                    className="form-control-lg file-upload-input"
                    accept=".pdf,.doc,.docx"
                    required
                    style={{
                      opacity: 0,
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      top: 0,
                      left: 0,
                      cursor: 'pointer',
                      zIndex: 2
                    }}
                  />
                  <div className="file-upload-display d-flex align-items-center" 
                    style={{
                      border: '1px solid #ced4da',
                      borderRadius: '0.5rem',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f8f9fa',
                      minHeight: '3.5rem',
                      transition: 'all 0.2s',
                      position: 'relative',
                      zIndex: 1
                    }}
                  >
                    <span className="text-muted">{fileNames.resume}</span>
                    <span className="ms-auto btn btn-outline-secondary btn-sm" style={{ pointerEvents: 'none' }}>
                      Choose File
                    </span>
                  </div>
                </div>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="mb-2 d-block">Transcripts (PDF, DOC, DOCX)</Form.Label>
                <div className="file-upload-wrapper" style={{ position: 'relative' }}>
                  <Form.Control
                    type="file"
                    name="transcripts"
                    onChange={handleChange}
                    className="form-control-lg file-upload-input"
                    accept=".pdf,.doc,.docx"
                    required
                    style={{
                      opacity: 0,
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      top: 0,
                      left: 0,
                      cursor: 'pointer',
                      zIndex: 2
                    }}
                  />
                  <div className="file-upload-display d-flex align-items-center"
                    style={{
                      border: '1px solid #ced4da',
                      borderRadius: '0.5rem',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f8f9fa',
                      minHeight: '3.5rem',
                      transition: 'all 0.2s',
                      position: 'relative',
                      zIndex: 1
                    }}
                  >
                    <span className="text-muted">{fileNames.transcripts}</span>
                    <span className="ms-auto btn btn-outline-secondary btn-sm" style={{ pointerEvents: 'none' }}>
                      Choose File
                    </span>
                  </div>
                </div>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Check
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  label={
                    <span>
                      I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a> and{' '}
                      <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                    </span>
                  }
                  className="form-check"
                />
              </Form.Group>

              <Button 
                type="submit" 
                variant="primary" 
                className="w-100 btn-lg fac-login-button position-relative overflow-hidden"
                disabled={isSubmitting}
                style={{
                  transition: 'all 0.3s ease',
                  border: 'none',
                  background: 'linear-gradient(45deg, #0d6efd, #0b5ed7)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(13, 110, 253, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
                <FaArrowRight className="ms-2" style={{ transition: 'transform 0.3s ease' }} />
              </Button>
            </Form>

            <div className="text-center mt-4">
              <p className="text-muted">
                Already have an account?{' '}
                <Link to="/faculty/login" className="register-link text-primary text-decoration-none">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyRegistration;
