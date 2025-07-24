import { useState } from 'react';
import { registerFaculty } from '../../services/authService';
import { Link, useNavigate } from "react-router-dom";
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

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required.';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required.';
    if (!formData.email.trim()) newErrors.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format.';
    if (!formData.password) newErrors.password = 'Password is required.';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
    if (!formData.workPreference) newErrors.workPreference = 'Select a work preference.';
    if (!formData.resume) newErrors.resume = 'Resume is required.';
    if (!formData.transcripts) newErrors.transcripts = 'Transcripts are required.';
    if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the terms.';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await registerFaculty(formData);
      setSuccessMessage('Registration successful! Redirecting to login...');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        workPreference: '',
        resume: null,
        transcripts: null,
        agreeTerms: false,
      });
      setErrors({});
      setTimeout(() => {
        navigate('/faculty/login');
      }, 2000);
    } catch (err) {
      alert(err.detail || 'Registration failed.');
    }
  };
  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="row g-0 card-shadow shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: '950px', width: '100%' }}>
        {/* Left Panel */}
        <div className="col-md-6 d-none d-md-flex flex-column justify-content-center align-items-center fav-login-left-panel text-white p-4 rounded-start">
          <h4 className="text-center mb-3">Welcome to Faculty Finder</h4>
          <p className="text-center">
            We connect universities with a professional network of qualified faculty — quickly, efficiently, and affordably.
          </p>
        </div>
        {/* Right Panel */}
        <div className="col-md-6 col-12 bg-white p-4 rounded-end d-flex align-items-center justify-content-center" style={{ minHeight: '600px' }}>
          <div className="w-100" style={{ maxWidth: '400px' }}>
            <h4 className="mb-3 text-center text-md-start fac-recruiter-title">Faculty Registration</h4>
            <form onSubmit={handleSubmit} noValidate>
              {successMessage && (
                <div className="alert alert-success text-center" role="alert">
                  {successMessage}
                </div>
              )}
              {/* First Name */}
              <div className="mb-3">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`form-control field-control ${errors.firstName ? 'is-invalid' : ''}`}
                />
                {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
              </div>

              {/* Last Name */}
              <div className="mb-3">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`form-control field-control ${errors.lastName ? 'is-invalid' : ''}`}
                />
                {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-control field-control ${errors.email ? 'is-invalid' : ''}`}
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>

              {/* Password */}
              <div className="mb-3">
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-control field-control ${errors.password ? 'is-invalid' : ''}`}
                />
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>

              {/* Work Preference */}
              <div className="mb-3">
                <label className="form-label">Work Preference *</label>
                <select
                  name="workPreference"
                  value={formData.workPreference}
                  onChange={handleChange}
                  className={`fac-form-select field-control ${errors.workPreference ? 'is-invalid' : ''}`}
                >
                  <option value="">-- Select Work Preference --</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="remote">Remote</option>
                </select>
                {errors.workPreference && <div className="invalid-feedback">{errors.workPreference}</div>}
              </div>

              {/* Resume */}
              <div className="mb-3">
                <label className="form-label">Resume *</label>
                <input
                  type="file"
                  name="resume"
                  onChange={handleChange}
                  className={`form-control field-control ${errors.resume ? 'is-invalid' : ''}`}
                  accept=".pdf,.doc,.docx"
                />
                {errors.resume && <div className="invalid-feedback">{errors.resume}</div>}
              </div>

              {/* Transcripts */}
              <div className="mb-3">
                <label className="form-label">Transcripts *</label>
                <input
                  type="file"
                  name="transcripts"
                  onChange={handleChange}
                  className={`form-control field-control ${errors.transcripts ? 'is-invalid' : ''}`}
                  accept=".pdf,.doc,.docx"
                />
                {errors.transcripts && <div className="invalid-feedback">{errors.transcripts}</div>}
              </div>

              {/* Terms and Conditions */}
              <div className="mb-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className={`form-check-input ${errors.agreeTerms ? 'is-invalid' : ''}`}
                  />
                  <label className="form-check-label">
                    I agree to the <a href="/terms" target="_blank">Terms and Conditions</a>
                  </label>
                </div>
                {errors.agreeTerms && <div className="invalid-feedback">{errors.agreeTerms}</div>}
              </div>
              <button type="submit" className="btn btn-primary w-100">
                Register
              </button>
            </form>
            <p className="text-center mt-3">
              Already have an account? <Link to="/faculty/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyRegistration;