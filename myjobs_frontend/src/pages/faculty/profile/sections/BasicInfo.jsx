// src/pages/faculty/profile/sections/BasicInfo.jsx
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Row, Col, Form, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaCamera, FaUser, FaPhone, FaCalendarAlt, FaMapMarkerAlt, FaLinkedin } from 'react-icons/fa';
import facultyService from '../../../../services/facultyService';

const BasicInfo = forwardRef(({ isEditing }, ref) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    state: '',
    city: '',
    linkedin: '',
    workPreference: []
  });
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const fileInputRef = useRef(null);

  // Indian states for dropdown
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands',
    'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
    'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await facultyService.getFacultyProfile();
        // Check if response has data property or use the response directly
        const data = response?.data || response;

        if (data) {
          setFormData({
            title: data.title || '',
            firstName: data.first_name || data.firstName || '',
            lastName: data.last_name || data.lastName || '',
            email: data.user?.email || data.email || '',
            phone: data.phone || '',
            dob: data.dob ? (data.dob.split('T')[0] || '') : '',
            gender: data.gender || '',
            state: data.state || '',
            city: data.city || '',
            linkedin: data.linkedin || '',
            workPreference: Array.isArray(data.work_preference) ? data.work_preference :
              (Array.isArray(data.workPreference) ? data.workPreference : [])
          });

          // Handle profile photo - ensure we have the full URL
          const baseUrl = import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:8000';
          if (data.profile_photo) {
            // Check if the URL is already absolute
            const photoUrl = data.profile_photo.startsWith('http')
              ? data.profile_photo
              : `${baseUrl}${data.profile_photo}`;
            setProfilePhotoPreview(photoUrl);
          } else if (data.profilePhoto) {
            // For backward compatibility
            const photoUrl = data.profilePhoto.startsWith('http')
              ? data.profilePhoto
              : `${base.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:8000'}${data.profilePhoto}`;
            setProfilePhotoPreview(photoUrl);
          }
        }
      } catch (err) {
        console.error('Failed to load profile', err);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Expose save function to parent
  useImperativeHandle(ref, () => ({
    save: handleSave
  }));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name === 'workPreference') {
      const newPreferences = [...formData.workPreference];
      if (checked) {
        newPreferences.push(value);
      } else {
        const idx = newPreferences.indexOf(value);
        if (idx > -1) newPreferences.splice(idx, 1);
      }
      setFormData(prev => ({
        ...prev,
        workPreference: newPreferences
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      setError('Please select a valid image file (JPEG, PNG, GIF)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB');
      return;
    }

    setProfilePhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setProfilePhotoPreview(reader.result);
    reader.readAsDataURL(file);
    setError('');
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const workPreferenceOptions = [
    'Onsite - Residencies',
    'Online - Asynchronous Course',
    'Online - Synchronous Course',
    'Onsite',
    'Hybrid',
    'Travel Abroad',
    'Content Expert / SME Online'
  ];

  const handleSave = async (dataToSave = formData) => {
    try {
      setLoading(true);
      setError('');

      // Prepare the form data - don't include the file in the main payload
      // as it will be handled separately in the file upload
      const payload = {
        title: formData.title,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        dob: formData.dob || null,
        gender: formData.gender,
        state: formData.state,
        city: formData.city,
        linkedin: formData.linkedin,
        workPreference: formData.workPreference
      };

      if (profilePhotoFile) {
        payload.profile_photo = profilePhotoFile;
      }

      // Update the profile
      const response = await facultyService.updateFacultyProfile(payload);
      const responseData = response?.data || response;

      // Update local state with the response
      if (responseData) {
        setFormData(prev => ({
          ...prev,
          firstName: responseData.first_name || responseData.firstName || prev.firstName,
          lastName: responseData.last_name || responseData.lastName || prev.lastName,
          phone: responseData.phone || prev.phone,
          dob: responseData.dob ? (responseData.dob.split('T')[0] || prev.dob) : prev.dob,
          gender: responseData.gender || prev.gender,
          state: responseData.state || prev.state,
          city: responseData.city || prev.city,
          linkedin: responseData.linkedin || prev.linkedin,
          workPreference: Array.isArray(responseData.work_preference)
            ? responseData.work_preference
            : (Array.isArray(responseData.workPreference)
              ? responseData.workPreference
              : prev.workPreference)
        }));

        // Update profile photo preview if it was updated
        if (responseData.profile_photo || responseData.profilePhoto) {
          setProfilePhotoPreview(responseData.profile_photo || responseData.profilePhoto);
          setProfilePhotoFile(null); // Clear the file after successful upload
        }

        toast.success('Profile updated successfully!', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
        return { ok: true };
      }

      return { ok: false, error: 'Failed to update profile. No data returned from server.' };
    } catch (err) {
      console.error('Save failed', err);
      const errorMessage = err.response?.data?.message || 'Failed to save profile. Please try again.';
      setError(errorMessage);
      return { ok: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isEditing && !formData.email) {
    return (
      <Card className="mb-4">
        <Card.Body className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2 mb-0">Loading profile...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="section-title mb-0">Basic Information</h5>
        </div>

        {error && (
          <Alert variant="danger" onClose={() => setError('')} dismissible className="mb-4">
            {error}
          </Alert>
        )}

        <Row className="mb-4">
          <Col xs={12} className="text-center">
            <div style={{ width: 140, height: 140, margin: '0 auto 20px', position: 'relative' }}>
              {profilePhotoPreview ? (
                <img
                  src={profilePhotoPreview}
                  alt="Profile"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '50%',
                    border: '3px solid #f0f0f0'
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: '#f8f9fa',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed #dee2e6'
                }}>
                  <FaUser size={48} className="text-muted" />
                </div>
              )}
              {isEditing && (
                <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)' }}>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={triggerFileInput}
                    style={{ borderRadius: '20px' }}
                  >
                    <FaCamera />
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="d-none"
                    onChange={handlePhotoUpload}
                  />
                </div>
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
                disabled={!isEditing || loading}
              >
                <option value="">Select Title</option>
                <option value="Dr.">Dr.</option>
                <option value="Prof.">Prof.</option>
                <option value="Mr.">Mr.</option>
                <option value="Ms.">Ms.</option>
                <option value="Mrs.">Mrs.</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={!isEditing || loading}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>Last Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={!isEditing || loading}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>Email <span className="text-danger">*</span> <small className="text-muted">(unchangeable)</small></Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={true}
                required
                readOnly
              />
            </Form.Group>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>Phone <span className="text-danger">*</span></Form.Label>
              <div className="input-group">
                <span className="input-group-text"><FaPhone /></span>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing || loading}
                  required
                />
              </div>
            </Form.Group>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>Date of Birth</Form.Label>
              <div className="input-group">
                <span className="input-group-text"><FaCalendarAlt /></span>
                <Form.Control
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  disabled={!isEditing || loading}
                />
              </div>
            </Form.Group>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>Gender</Form.Label>
              <Form.Select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={!isEditing || loading}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>State</Form.Label>
              <Form.Select
                name="state"
                value={formData.state}
                onChange={handleChange}
                disabled={!isEditing || loading}
              >
                <option value="">Select State</option>
                {indianStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>City</Form.Label>
              <div className="input-group">
                <span className="input-group-text"><FaMapMarkerAlt /></span>
                <Form.Control
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!isEditing || loading}
                />
              </div>
            </Form.Group>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>LinkedIn Profile</Form.Label>
              <div className="input-group">
                <span className="input-group-text"><FaLinkedin /></span>
                <Form.Control
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  disabled={!isEditing || loading}
                  placeholder="https://www.linkedin.com/in/your-profile"
                />
              </div>
            </Form.Group>
          </Col>
        </Row>

        {isEditing && (
          <div className="mt-4">
            <h6 className="mb-3">Work Preferences</h6>
            <Row>
              {workPreferenceOptions.map((option, index) => (
                <Col md={6} key={index} className="mb-2">
                  <Form.Check
                    type="checkbox"
                    id={`work-pref-${index}`}
                    name="workPreference"
                    label={option}
                    value={option}
                    checked={formData.workPreference.includes(option)}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Card.Body>
    </Card>
  );
});

export default BasicInfo;
