import { useState } from 'react';
import { registerRecruiter } from '../../services/authService';
import { Link, useNavigate } from "react-router-dom";
import './recruiter.css';
import { FaTimes } from 'react-icons/fa';

const RecruiterRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    college: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required.';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required.';
    if (!formData.college) newErrors.college = 'Please select a college.';
    if (!formData.email.trim()) newErrors.email = 'College email is required.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address.';
    if (!formData.password.trim()) newErrors.password = 'Password is required.';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
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
      const registrationData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        college: formData.college
      };

      await registerRecruiter(registrationData);
      alert('Recruiter registration successful!');
      // Clear form after successful registration
      setFormData({
        firstName: '',
        lastName: '',
        college: '',
        email: '',
        password: ''
      });
    } catch (err) {
      console.error('Registration error:', err);
      if (err.detail) {
        alert(err.detail);
      } else if (err.email) {
        alert(err.email);
      } else if (err.password) {
        alert(err.password);
      } else {
        alert('Registration failed. Please check your details and try again.');
      }
    }
  };
  
  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="row g-0 card-shadow shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: '950px', width: '100%' }}>
        {/* Left Panel */}
        <div className="col-md-6 d-none d-md-flex flex-column justify-content-center align-items-center login-left-panel text-white p-4 rounded-start">
          <h4 className="text-center mb-3">Welcome to Faculty Recruiter</h4>
          <p className="text-center">
            We connect universities with a professional network of qualified faculty — quickly, efficiently, and affordably.
          </p>
        </div>
        {/* Right Panel */}
        <div className="col-md-6 col-12 bg-white p-4 rounded-end d-flex align-items-center justify-content-center position-relative" style={{ minHeight: '600px' }}>
          <button 
            onClick={() => navigate('/')} 
            className="btn p-0 position-absolute" 
            style={{top: '1.5rem', right: '2rem', zIndex: 10, fontSize: '1.5rem', color: '#6c757d'}}
            aria-label="Close"
          >
            <FaTimes />
          </button>
          <div className="w-100 position-relative" style={{ maxWidth: '400px' }}>
            <h4 className="mb-3 text-center text-md-start recruiter-title">Recruiter Registration</h4>
            <form onSubmit={handleSubmit} noValidate>
              {/* First Name */}
              <div className="mb-3">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
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
                  className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                />
                {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
              </div>
              {/* College */}
              <div className="mb-3">
                <label className="form-label">Choose College *</label>
                <select
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  className={`form-select ${errors.college ? 'is-invalid' : ''}`}>
                  <option value="">-- Select College --</option>
                  <option value="College A">College A</option>
                  <option value="College B">College B</option>
                  <option value="College C">College C</option>
                </select>
                {errors.college && <div className="invalid-feedback">{errors.college}</div>}
              </div>
              {/* Email */}
              <div className="mb-3">
                <label className="form-label">College Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
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
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                />
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>
              <button type="submit" className="login-button btn btn-success w-100 d-flex align-items-center justify-content-center gap-2" style={{ fontWeight: 600, borderRadius: '10px', fontSize: '1.1rem' }}>
                <span>Sign Up</span>
                <span className="button-icon">→</span>
              </button>
              <p className="text-center mt-3 register-text">
                Already have an account? <Link to="/recruiter/login" className="register-link">Sign in</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterRegistration;