import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Card, Button, Row, Col, Form, Tabs, Tab, Badge, ListGroup, Spinner, Alert, Modal } from 'react-bootstrap';
import { FaPlus, FaTrash, FaBriefcase, FaUniversity, FaCalendarAlt, FaEdit, FaCheck, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import facultyService from '../../../../services/facultyService';

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'Present';

  try {
    // Handle different date string formats
    let date;
    if (typeof dateString === 'string') {
      // Try parsing ISO date string
      if (dateString.includes('T')) {
        date = new Date(dateString);
      }
      // Handle YYYY-MM-DD format
      else if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        date = new Date(dateString);
      }
      // Handle other formats by trying to parse as is
      else {
        date = new Date(dateString);
      }
    } else if (dateString instanceof Date) {
      date = dateString;
    } else {
      console.error('Invalid date format:', dateString);
      return 'Present';
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return 'Present';
    }

    const options = { year: 'numeric', month: 'short' };
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Present';
  }
};

const Experience = forwardRef(({ isEditing }, ref) => {
  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    // Add any methods you want to expose to parent components here
    refresh: () => {
      fetchExperiences();
    }
  }));

  // State for experiences and delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [experienceToDelete, setExperienceToDelete] = useState({ id: null, type: null });
  const [academicExperience, setAcademicExperience] = useState([]);
  const [nonAcademicExperience, setNonAcademicExperience] = useState([]);
  const [overallExperience, setOverallExperience] = useState({ teaching: 0, industry: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form States
  const [showAcademicForm, setShowAcademicForm] = useState(false);
  const [showNonAcademicForm, setShowNonAcademicForm] = useState(false);
  const [showOverallForm, setShowOverallForm] = useState(false);

  // Current experience being edited
  const [editingId, setEditingId] = useState(null);
  const [isAcademic, setIsAcademic] = useState(true);

  const [formData, setFormData] = useState({
    institution: '',
    company: '',
    position: '',
    responsibilities: [''],
    startDate: '',
    endDate: '',
    experience_type: 'academic' // 'academic' or 'non_academic'
  });

  // Calculate total experience in months
  const calculateExperience = (startDate, endDate, isCurrent = false) => {
    if (!startDate) return 0;

    const start = new Date(startDate);
    const end = isCurrent || !endDate ? new Date() : new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.error('Invalid date range:', { startDate, endDate, isCurrent });
      return 0;
    }

    // Calculate months between dates
    let months = (end.getFullYear() - start.getFullYear()) * 12;
    months -= start.getMonth() + 1;
    months += end.getMonth() + 1;

    // If end date is the last day of the month, include it
    const lastDayOfMonth = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
    if (end.getDate() === lastDayOfMonth) {
      months += 1;
    }

    return Math.max(0, months);
  };

  // Calculate total experience from all entries
  const calculateTotalExperience = (experiences) => {
    return experiences.reduce((total, exp) => {
      return total + calculateExperience(exp.start_date, exp.end_date, exp.is_current);
    }, 0);
  };

  // Convert months of experience to a range string with decimal precision
  const getExperienceRange = (months) => {
    const years = months / 12; // Keep as decimal for more precise ranges

    if (years < 0.5) return '0-6 months';
    if (years < 1) return '6 months - 1 year';
    if (years < 2) return '1-2 years';
    if (years < 3) return '2-3 years';
    if (years < 5) return '3-5 years';
    if (years < 7) return '5-7 years';
    if (years < 10) return '7-10 years';
    if (years < 15) return '10-15 years';
    return '15+ years';
  };

  // Update overall experience whenever academic or non-academic experiences change
  useEffect(() => {
    let isMounted = true;
    let timeoutId = null;

    const updateExperience = () => {
      const teachingMonths = calculateTotalExperience(academicExperience);
      const industryMonths = calculateTotalExperience(nonAcademicExperience);
      const totalMonths = teachingMonths + industryMonths;

      // Calculate years with decimal precision
      const teachingYears = teachingMonths / 12;
      const industryYears = industryMonths / 12;
      const totalYears = totalMonths / 12;

      if (isMounted) {
        setOverallExperience({
          teaching: parseFloat(teachingYears.toFixed(1)),
          industry: parseFloat(industryYears.toFixed(1)),
          total: parseFloat(totalYears.toFixed(1)),
          totalMonths: totalMonths
        });
      }
    };

    const handleUpdate = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(updateExperience, 100);
    };

    // Debounce the update to prevent rapid recalculations
    handleUpdate();

    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [academicExperience, nonAcademicExperience]);

  // Fetch experiences from backend
  const fetchExperiences = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('Fetching experiences...');
      const response = await facultyService.getExperiences();
      console.log('API Response:', response);

      // Ensure response is an array and handle potential nested data structure
      let experiences = [];
      if (Array.isArray(response)) {
        experiences = response;
      } else if (response && Array.isArray(response.data)) {
        experiences = response.data;
      } else if (response && response.results && Array.isArray(response.results)) {
        experiences = response.results;
      }

      console.log('Processed experiences:', experiences);

      // Process and filter experiences by type
      const academic = experiences
        .filter(exp => exp.exp_type === 'academic')
        .map(exp => ({
          ...exp,
          id: exp.id || exp._id || Date.now(),
          start_date: exp.start_date || exp.startDate,
          end_date: exp.end_date || exp.endDate,
          is_current: exp.is_current || exp.isCurrent || false,
          institution_or_company: exp.institution_or_company || exp.institution || exp.company || ''
        }));

      const nonAcademic = experiences
        .filter(exp => exp.exp_type === 'non_academic')
        .map(exp => ({
          ...exp,
          id: exp.id || exp._id || Date.now(),
          start_date: exp.start_date || exp.startDate,
          end_date: exp.end_date || exp.endDate,
          is_current: exp.is_current || exp.isCurrent || false,
          institution_or_company: exp.institution_or_company || exp.company || exp.institution || ''
        }));

      console.log('Academic experiences:', academic);
      console.log('Non-academic experiences:', nonAcademic);

      setAcademicExperience(academic);
      setNonAcademicExperience(nonAcademic);
    } catch (err) {
      console.error('Error fetching experiences:', err);
      setError('Failed to load experiences. Please try again.');
      toast.error('Failed to load experiences');

      // Set empty arrays in case of error to prevent further errors
      setAcademicExperience([]);
      setNonAcademicExperience([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchExperiences();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle responsibility changes
  const handleResponsibilityChange = (index, value) => {
    const updatedResponsibilities = [...formData.responsibilities];
    updatedResponsibilities[index] = value;
    setFormData({
      ...formData,
      responsibilities: updatedResponsibilities.filter(r => r !== '')
    });
  };

  // Add a new responsibility field
  const addResponsibility = () => {
    setFormData({
      ...formData,
      responsibilities: [...formData.responsibilities, '']
    });
  };

  // Remove a responsibility field
  const removeResponsibility = (index) => {
    const updatedResponsibilities = formData.responsibilities.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      responsibilities: updatedResponsibilities.length ? updatedResponsibilities : ['']
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      institution: '',
      company: '',
      position: '',
      responsibilities: [''],
      startDate: '',
      endDate: '',
      isCurrent: false,
      experience_type: isAcademic ? 'academic' : 'non_academic'
    });
    setEditingId(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Prepare the data for submission
      const experienceData = {
        institution: formData.institution,
        company: formData.company,
        position: formData.position,
        responsibilities: formData.responsibilities.filter(r => r.trim() !== ''),
        start_date: formData.startDate,
        end_date: formData.isCurrent ? null : formData.endDate,
        is_current: formData.isCurrent,
        experience_type: isAcademic ? 'academic' : 'non_academic'
      };

      // Remove empty strings from responsibilities
      experienceData.responsibilities = experienceData.responsibilities.filter(r => r.trim() !== '');

      if (editingId) {
        // Update existing experience
        await facultyService.updateExperience(editingId, experienceData);
      } else {
        // Create new experience
        await facultyService.createExperience(experienceData);
      }

      // Refresh the list and reset form
      await fetchExperiences();
      resetForm();
      setShowAcademicForm(false);
      setShowNonAcademicForm(false);

    } catch (err) {
      console.error('Error saving experience:', err);
      const errorMsg = err.response?.data?.message || 'Failed to save experience. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit action
  const handleEdit = (exp, isAcademicExp = true) => {
    setFormData({
      institution: exp.institution || '',
      company: exp.company || '',
      position: exp.position || '',
      responsibilities: exp.responsibilities?.length ? exp.responsibilities : [''],
      startDate: exp.start_date || '',
      endDate: exp.end_date || '',
      isCurrent: exp.is_current || false,
      experience_type: exp.experience_type || (isAcademicExp ? 'academic' : 'non_academic')
    });

    setEditingId(exp.id);
    setIsAcademic(isAcademicExp);

    if (isAcademicExp) {
      setShowAcademicForm(true);
      setShowNonAcademicForm(false);
    } else {
      setShowAcademicForm(false);
      setShowNonAcademicForm(true);
    }
  };

  // Handle delete action
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this experience?')) {
      try {
        setLoading(true);
        await facultyService.deleteExperience(id);
        await fetchExperiences();
      } catch (err) {
        console.error('Error deleting experience:', err);
        const errorMsg = err.response?.data?.message || 'Failed to delete experience. Please try again.';
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    }
  };

  // Expose save method to parent
  useImperativeHandle(ref, () => ({
    save: async () => {
      // No need to show success message here as it will be handled by the parent
      // and we don't want duplicate messages
      return { ok: true };
    }
  }));

  // Format experience range
  const formatExperienceRange = (years) => {
    if (years === 0) return 'Less than a year';
    if (years < 1) return 'Less than a year';
    if (years === 1) return '1 year';
    if (years < 2) return '1-2 years';
    if (years < 5) return '2-5 years';
    if (years < 10) return '5-10 years';
    return '10+ years';
  };

  const handleNonAcademicResponsibilityChange = (index, value) => {
    const updatedResponsibilities = [...formData.responsibilities];
    updatedResponsibilities[index] = value;
    setFormData({
      ...formData,
      responsibilities: updatedResponsibilities
    });
  };


  // Add Academic Experience
  const addAcademicExperience = async () => {
    try {
      setLoading(true);
      const experienceData = {
        institution_or_company: formData.institution,
        position: formData.position,
        responsibilities: formData.responsibilities.filter(r => r.trim() !== '').join('\n'),
        start_date: formData.startDate,
        end_date: formData.isCurrent ? null : formData.endDate,
        is_current: formData.isCurrent,
        exp_type: 'academic'  // Changed from experience_type to exp_type to match backend
      };

      await facultyService.createExperience(experienceData);
      await fetchExperiences();
      resetForm();
      setShowAcademicForm(false);
    } catch (err) {
      console.error('Error adding academic experience:', err);
      console.error('Error details:', err.response?.data);
      const errorMsg = err.response?.data?.message || 'Failed to add academic experience. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Add Non-Academic Experience
  const addNonAcademicExperience = async () => {
    try {
      setLoading(true);
      const experienceData = {
        institution_or_company: formData.company,
        position: formData.position,
        responsibilities: formData.responsibilities.filter(r => r.trim() !== '').join('\n'),
        start_date: formData.startDate,
        end_date: formData.isCurrent ? null : formData.endDate,
        is_current: formData.isCurrent,
        exp_type: 'non_academic'  // Changed from experience_type to exp_type to match backend
      };

      await facultyService.createExperience(experienceData);
      await fetchExperiences();
      resetForm();
      setShowNonAcademicForm(false);
    } catch (err) {
      console.error('Error adding professional experience:', err);
      console.error('Error details:', err.response?.data);
      const errorMsg = err.response?.data?.message || 'Failed to add professional experience. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const addOverallExperience = () => {
    setOverallExperience([
      ...overallExperience,
      {
        type: formData.overallType || 'Teaching Experience',
        range: formData.overallRange || '1-3 years',
        id: Date.now()
      }
    ]);

    // Reset the form
    setFormData({
      ...formData,
      overallType: 'Teaching Experience',
      overallRange: '1-3 years',
      range: '0-5'
    });
    setShowOverallForm(false);
  };

  // Show delete confirmation modal
  const confirmDelete = (id, type) => {
    setExperienceToDelete({ id, type });
    setShowDeleteModal(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirmed = async () => {
    const { id, type } = experienceToDelete;
    setShowDeleteModal(false);

    try {
      setLoading(true);
      await facultyService.deleteExperience(id);

      // Update local state after successful deletion
      if (type === 'academic') {
        setAcademicExperience(prev => prev.filter(exp => exp.id !== id));
      } else if (type === 'nonAcademic') {
        setNonAcademicExperience(prev => prev.filter(exp => exp.id !== id));
      } else {
        setOverallExperience(prev => prev.filter(exp => exp.id !== id));
      }

      toast.success('Experience deleted successfully');
    } catch (err) {
      console.error('Error deleting experience:', err);
      const errorMsg = err.response?.data?.message || 'Failed to delete experience. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      setExperienceToDelete({ id: null, type: null });
    }
  };

  // Close delete confirmation modal
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setExperienceToDelete({ id: null, type: null });
  };

  // Experience Ranges
  const experienceRanges = [
    '0-5 years', '5-10 years', '10-15 years', '15+ years'
  ];

  // Experience Types
  const experienceTypes = [
    'Teaching Experience', 'Non-Teaching Experience'
  ];

  return (
    <Card className="mb-4">
      <Card.Body>
        <h5 className="section-title mb-4">Experience</h5>

        <Tabs defaultActiveKey="academic" id="experience-tabs" className="mb-4">
          {/* Academic Experience Tab */}
          <Tab eventKey="academic" title="Academic Experience">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Academic Positions</h6>
              {isEditing && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => setShowAcademicForm(!showAcademicForm)}
                >
                  <FaPlus className="me-1" /> Add Academic Position
                </Button>
              )}
            </div>

            {showAcademicForm && isEditing && (
              <Card className="mb-4 border-primary">
                <Card.Body>
                  <h6 className="mb-3">Add Academic Position</h6>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Institution</Form.Label>
                        <Form.Control
                          type="text"
                          name="institution"
                          value={formData.institution}
                          onChange={handleInputChange}
                          placeholder="e.g., Stanford University"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Position/Title</Form.Label>
                        <Form.Control
                          type="text"
                          name="position"
                          value={formData.position}
                          onChange={handleInputChange}
                          placeholder="e.g., Associate Professor"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12} className="mb-3">
                      <Form.Label>Responsibilities</Form.Label>
                      {formData.responsibilities.map((resp, index) => (
                        <div key={index} className="d-flex mb-2">
                          <Form.Control
                            as="textarea"
                            rows={2}
                            value={resp}
                            onChange={(e) => handleResponsibilityChange(index, e.target.value)}
                            placeholder="Describe your responsibilities"
                          />
                          <Button
                            variant="outline-danger"
                            className="ms-2"
                            onClick={() => removeResponsibility(index)}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="mt-2"
                        onClick={addResponsibility}
                      >
                        <FaPlus className="me-1" /> Add Responsibility
                      </Button>
                    </Col>
                    <Col md={3} className="mb-3">
                      <Form.Group>
                        <Form.Label>Start Date</Form.Label>
                        <Form.Control
                          type="date"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3} className="mb-3">
                      <Form.Group>
                        <Form.Label>End Date</Form.Label>
                        <Form.Control
                          type="date"
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleInputChange}
                          disabled={formData.isCurrent}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3 d-flex align-items-end">
                      <Form.Check
                        type="checkbox"
                        id="isCurrent"
                        name="isCurrent"
                        label="I currently work here"
                        checked={formData.isCurrent}
                        onChange={handleInputChange}
                        className="ms-2"
                      />
                    </Col>
                    <Col md={12} className="text-end">
                      <Button
                        variant="outline-secondary"
                        className="me-2"
                        onClick={() => setShowAcademicForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        onClick={addAcademicExperience}
                        disabled={!formData.institution || !formData.position || !formData.startDate}
                      >
                        {editingId ? 'Update Position' : 'Add Position'}
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            )}

            {academicExperience.length > 0 ? (
              <ListGroup variant="flush">
                {academicExperience.map((exp) => (
                  <ListGroup.Item key={exp.id} className="py-3">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h6 className="mb-1">{exp.position}</h6>
                        <p className="mb-1 text-muted">
                          <FaUniversity className="me-1" />
                          {exp.institution_or_company}
                        </p>
                        <p className="mb-0 text-muted small">
                          <FaCalendarAlt className="me-1" />
                          {formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatDate(exp.endDate)}
                          {exp.isCurrent && (
                            <Badge bg="success" className="ms-2">Current</Badge>
                          )}
                        </p>
                        {exp.responsibilities && (
                          <div className="mt-2">
                            <p className="mb-1 small"><strong>Key Responsibilities:</strong></p>
                            <ul className="small">
                              {typeof exp.responsibilities === 'string'
                                ? exp.responsibilities
                                  .split('\n')
                                  .filter(r => r.trim() !== '')
                                  .map((resp, i) => (
                                    <li key={i}>{resp}</li>
                                  ))
                                : Array.isArray(exp.responsibilities)
                                  ? exp.responsibilities
                                    .filter(r => r && r.trim() !== '')
                                    .map((resp, i) => (
                                      <li key={i}>{resp}</li>
                                    ))
                                  : null
                              }
                            </ul>
                          </div>
                        )}
                      </div>
                      {isEditing && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="ms-2"
                          onClick={() => confirmDelete(exp.id, 'academic')}
                          disabled={loading}
                          title="Delete experience"
                        >
                          <FaTrash />
                        </Button>
                      )}
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <div className="text-center py-4">
                <FaUniversity size={32} className="text-muted mb-2" />
                <p className="text-muted">No academic experience added yet.</p>
                {isEditing && (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setShowAcademicForm(true)}
                  >
                    <FaPlus className="me-1" /> Add Academic Position
                  </Button>
                )}
              </div>
            )}
          </Tab>

          {/* Non-Academic Experience Tab */}
          <Tab eventKey="nonAcademic" title="Non-Academic Experience">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Professional Experience</h6>
              {isEditing && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => setShowNonAcademicForm(!showNonAcademicForm)}
                >
                  <FaPlus className="me-1" /> Add Professional Experience
                </Button>
              )}
            </div>

            {showNonAcademicForm && isEditing && (
              <Card className="mb-4 border-primary">
                <Card.Body>
                  <h6 className="mb-3">Add Professional Experience</h6>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Company/Organization</Form.Label>
                        <Form.Control
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          placeholder="e.g., Google Inc."
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Position/Title</Form.Label>
                        <Form.Control
                          type="text"
                          name="position"
                          value={formData.position}
                          onChange={handleInputChange}
                          placeholder="e.g., Senior Software Engineer"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12} className="mb-3">
                      <Form.Label>Responsibilities</Form.Label>
                      <div className="mb-3">
                        {formData.responsibilities.map((resp, index) => (
                          <div key={index} className="d-flex mb-2">
                            <Form.Control
                              as="textarea"
                              rows={2}
                              value={resp}
                              onChange={(e) => handleNonAcademicResponsibilityChange(index, e.target.value)}
                              placeholder="Describe your responsibilities"
                              className="me-2"
                            />
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => removeResponsibility(index)}
                              disabled={formData.responsibilities.length <= 1}
                              className="align-self-start mt-1"
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => addResponsibility('nonAcademic')}
                          className="mt-2"
                        >
                          <FaPlus className="me-1" /> Add Responsibility
                        </Button>
                      </div>
                    </Col>
                    <Col md={3} className="mb-3">
                      <Form.Group>
                        <Form.Label>Start Date</Form.Label>
                        <Form.Control
                          type="date"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3} className="mb-3">
                      <Form.Group>
                        <Form.Label>End Date</Form.Label>
                        <Form.Control
                          type="date"
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleInputChange}
                          disabled={formData.isCurrent}
                          min={formData.startDate}
                        />
                        <Form.Check
                          type="checkbox"
                          id="nonAcademicIsCurrent"
                          label="I currently work here"
                          name="isCurrent"
                          checked={formData.isCurrent}
                          onChange={(e) => {
                            handleInputChange(e);
                            if (e.target.checked) {
                              setNewNonAcademicExp(prev => ({
                                ...prev,
                                endDate: ''
                              }));
                            }
                          }}
                          className="mt-2"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12} className="text-end">
                      <Button
                        variant="outline-secondary"
                        className="me-2"
                        onClick={() => setShowNonAcademicForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        onClick={addNonAcademicExperience}
                        disabled={!formData.company || !formData.position || !formData.startDate}
                      >
                        Add Experience
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            )}

            {nonAcademicExperience.length > 0 ? (
              <ListGroup variant="flush">
                {nonAcademicExperience.map((exp) => (
                  <ListGroup.Item key={exp.id} className="py-3">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h6 className="mb-1">{exp.position}</h6>
                        <p className="mb-1 text-muted">
                          <FaBriefcase className="me-1" />
                          {exp.institution_or_company}
                        </p>
                        <p className="mb-0 text-muted small">
                          <FaCalendarAlt className="me-1" />
                          {formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatDate(exp.endDate)}
                          {exp.isCurrent && (
                            <Badge bg="success" className="ms-2">Current</Badge>
                          )}
                        </p>
                        {exp.responsibilities && (
                          <div className="mt-2">
                            <p className="mb-1 small"><strong>Key Responsibilities:</strong></p>
                            <ul className="small">
                              {typeof exp.responsibilities === 'string'
                                ? exp.responsibilities
                                  .split('\n')
                                  .filter(r => r.trim() !== '')
                                  .map((resp, i) => (
                                    <li key={i}>{resp}</li>
                                  ))
                                : Array.isArray(exp.responsibilities)
                                  ? exp.responsibilities
                                    .filter(r => r && r.trim() !== '')
                                    .map((resp, i) => (
                                      <li key={i}>{resp}</li>
                                    ))
                                  : null
                              }
                            </ul>
                          </div>
                        )}
                      </div>
                      {isEditing && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          disabled={loading}
                          onClick={() => removeExperience(exp.id, 'nonAcademic')}
                        >
                          <FaTrash />
                        </Button>
                      )}
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <div className="text-center py-4">
                <FaBriefcase size={32} className="text-muted mb-2" />
                <p className="text-muted">No professional experience added yet.</p>
                {isEditing && (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setShowNonAcademicForm(true)}
                  >
                    <FaPlus className="me-1" /> Add Professional Experience
                  </Button>
                )}
              </div>
            )}
          </Tab>

          {/* Overall Experience Tab */}
          <Tab eventKey="overall" title="Overall Experience">
            <div className="mb-4">
              <h6 className="mb-3">Experience Summary</h6>
              <p className="text-muted small mb-4">
                This section is automatically calculated based on your academic and professional experiences.
              </p>

              <Card className="mb-4">
                <Card.Body>
                  <Row className="text-center">
                    <Col md={4} className="border-end">
                      <div className="h4 mb-1">
                        {calculateTotalExperience(academicExperience)}
                      </div>
                      <div className="text-muted small">Academic Experience</div>
                    </Col>
                    <Col md={4} className="border-end">
                      <div className="h4 mb-1">
                        {calculateTotalExperience(nonAcademicExperience)}
                      </div>
                      <div className="text-muted small">Professional Experience</div>
                    </Col>
                    <Col md={4}>
                      <div className="h4 mb-1 text-primary">
                        {calculateTotalExperience([...academicExperience, ...nonAcademicExperience])}
                      </div>
                      <div className="text-muted small">Total Experience</div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <div className="mt-4">
                <h6 className="mb-3">Experience Breakdown</h6>
                <ListGroup variant="flush">
                  <ListGroup.Item className="d-flex justify-content-between align-items-center">
                    <span>Teaching Experience</span>
                    <Badge bg="light" text="dark">
                      {getExperienceRange(calculateTotalExperience(academicExperience))}
                    </Badge>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between align-items-center">
                    <span>Industry Experience</span>
                    <Badge bg="light" text="dark">
                      {getExperienceRange(calculateTotalExperience(nonAcademicExperience))}
                    </Badge>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between align-items-center bg-light">
                    <strong>Total Professional Experience</strong>
                    <Badge bg="primary">
                      {getExperienceRange(calculateTotalExperience([
                        ...academicExperience,
                        ...nonAcademicExperience
                      ]))}
                    </Badge>
                  </ListGroup.Item>
                </ListGroup>
              </div>
            </div>
          </Tab>
        </Tabs>
      </Card.Body>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this experience? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteConfirmed}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
});

export default Experience;
