import React, { useState, useRef } from 'react';
import { Row, Col, Form, Card, Button, Image } from 'react-bootstrap';
import { FaCamera, FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaMapMarkerAlt, FaLinkedin } from 'react-icons/fa';

const BasicInfo = ({ isEditing }) => {
  const [formData, setFormData] = useState({
    title: 'Dr.',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    dob: '1980-01-01',
    gender: 'male',
    state: 'New York',
    city: 'New York City',
    linkedin: 'linkedin.com/in/johndoe',
    workPreference: ['Online - Asynchronous Course'],
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked, options } = e.target;
    
    if (type === 'checkbox') {
      // Handle multiple select for work preferences
      const newPreferences = [...formData.workPreference];
      if (checked) {
        newPreferences.push(value);
      } else {
        const index = newPreferences.indexOf(value);
        if (index > -1) {
          newPreferences.splice(index, 1);
        }
      }
      setFormData({ ...formData, workPreference: newPreferences });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const workPreferenceOptions = [
    'Onsite - Residencies',
    'Online - Asynchronous Course',
    'Online - Synchronous Course',
    'Onsite',
    'Hybrid',
    'Travel Abroad',
    'Content Expert / SME Online'
  ];

  return (
    <Card className="mb-4">
      <Card.Body>
        <h5 className="section-title">Basic Information</h5>
        
        <Row className="mb-4">
          <Col xs={12} className="text-center">
            <div className="profile-photo-container">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="profile-photo" />
              ) : (
                <div className="d-flex align-items-center justify-content-center bg-light w-100 h-100">
                  <FaUser size={48} className="text-muted" />
                </div>
              )}
              {isEditing && (
                <>
                  <div className="photo-upload-overlay" onClick={triggerFileInput}>
                    <FaCamera className="me-1" /> Change Photo
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    className="d-none"
                    accept="image/*"
                  />
                </>
              )}
            </div>
          </Col>
        </Row>

        <Row>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>Title</Form.Label>
              <Form.Select 
                name="title" 
                value={formData.title} 
                onChange={handleChange}
                disabled={!isEditing}
              >
                <option value="Mr.">Mr.</option>
                <option value="Mrs.">Mrs.</option>
                <option value="Ms.">Ms.</option>
                <option value="Dr.">Dr.</option>
                <option value="Prof.">Prof.</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>First Name</Form.Label>
              <Form.Control 
                type="text" 
                name="firstName" 
                value={formData.firstName} 
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Form.Group>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>Last Name</Form.Label>
              <Form.Control 
                type="text" 
                name="lastName" 
                value={formData.lastName} 
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Form.Group>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <div className="input-group">
                <span className="input-group-text py-3"><FaEnvelope /></span>
                <Form.Control 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </Form.Group>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>Phone Number</Form.Label>
              <div className="input-group">
                <span className="input-group-text py-3"><FaPhone /></span>
                <Form.Control 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </Form.Group>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>Date of Birth</Form.Label>
              <div className="input-group">
                <span className="input-group-text py-3"><FaCalendarAlt /></span>
                <Form.Control 
                  type="date" 
                  name="dob" 
                  value={formData.dob} 
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </Form.Group>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>Gender</Form.Label>
              <div className="d-flex gap-4">
                <Form.Check
                  type="radio"
                  id="male"
                  label="Male"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
                <Form.Check
                  type="radio"
                  id="female"
                  label="Female"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
                <Form.Check
                  type="radio"
                  id="other"
                  label="Other"
                  name="gender"
                  value="other"
                  checked={formData.gender === 'other'}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </Form.Group>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>State</Form.Label>
              <Form.Control 
                type="text" 
                name="state" 
                value={formData.state} 
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Form.Group>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>City</Form.Label>
              <div className="input-group">
                <span className="input-group-text py-3"><FaMapMarkerAlt /></span>
                <Form.Control 
                  type="text" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </Form.Group>
          </Col>
          <Col md={12} className="mb-3">
            <Form.Group>
              <Form.Label>LinkedIn Profile</Form.Label>
              <div className="input-group">
                <span className="input-group-text py-3"><FaLinkedin /></span>
                <Form.Control 
                  type="url" 
                  name="linkedin" 
                  value={formData.linkedin} 
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                  disabled={!isEditing}
                />
              </div>
            </Form.Group>
          </Col>
          <Col md={12}>
            <Form.Group>
              <Form.Label>Work Preference</Form.Label>
              <div className="d-flex flex-wrap gap-3">
                {workPreferenceOptions.map((option) => (
                  <Form.Check
                    key={option}
                    type="checkbox"
                    id={`pref-${option}`}
                    label={option}
                    value={option}
                    checked={formData.workPreference.includes(option)}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="me-2"
                  />
                ))}
              </div>
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default BasicInfo;
