import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Form, Accordion, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaPlus, FaTrash, FaGraduationCap, FaBook, FaEdit } from 'react-icons/fa';

const EducationalInfo = ({ isEditing }) => {
  const [education, setEducation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialFormState = {
    degree: '',
    specialization: '',
    university: '',
    program: '',
    year: new Date().getFullYear().toString(),
    is_research: false,
    dissertation_title: '',
    abstract: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    // Initialize with sample data
    const sampleData = [
      {
        id: 1,
        degree: 'PhD',
        specialization: 'Computer Science',
        university: 'Stanford University',
        program: 'Computer Science',
        year: '2020',
        is_research: true,
        dissertation_title: 'Advanced Machine Learning Techniques',
        abstract: 'Research on advanced ML algorithms'
      },
      {
        id: 2,
        degree: 'MSc',
        specialization: 'Data Science',
        university: 'MIT',
        program: 'Data Science',
        year: '2018',
        is_research: false
      }
    ];

    setEducation(sampleData);
    setLoading(false);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setLoading(true);

      if (editingId) {
        // Update existing education
        setEducation(prev => prev.map(edu =>
          edu.id === editingId ? { ...formData, id: editingId } : edu
        ));
        setSuccess('Education updated successfully');
      } else {
        // Add new education
        const newEducation = {
          ...formData,
          id: Date.now() // Generate a unique ID
        };
        setEducation(prev => [...prev, newEducation]);
        setSuccess('Education added successfully');
      }

      // Reset form
      setFormData(initialFormState);
      setShowAddForm(false);
      setEditingId(null);
    } catch (err) {
      setError('Failed to save education');
      console.error('Error saving education:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (edu) => {
    setFormData({
      degree: edu.degree || '',
      specialization: edu.specialization || '',
      university: edu.university || '',
      program: edu.program || '',
      year: edu.year || new Date().getFullYear().toString(),
      is_research: edu.is_research || false,
      dissertation_title: edu.dissertation_title || '',
      abstract: edu.abstract || ''
    });
    setEditingId(edu.id);
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this education record?')) {
      try {
        setLoading(true);
        setEducation(prev => prev.filter(edu => edu.id !== id));
        setSuccess('Education deleted successfully');
      } catch (err) {
        setError('Failed to delete education');
        console.error('Error deleting education:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && !showAddForm) {
    return (
      <Card className="mb-4">
        <Card.Body className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2 mb-0">Loading education data...</p>
        </Card.Body>
      </Card>
    );
  }

  const degreeOptions = [
    'High School', 'Associate', 'Bachelor', 'Master', 'Ph.D.', 'Post Doc', 'Other'
  ];

  // You might want to fetch this from the backend in a real app
  const universityOptions = [
    'Stanford University', 'MIT', 'Harvard University', 'Caltech', 'Oxford University', 'Other'
  ];
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="section-title mb-0">Educational Qualifications</h5>
          {isEditing && !showAddForm && (
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => setShowAddForm(true)}
              disabled={loading}
            >
              <FaPlus className="me-1" /> Add Education
            </Button>
          )}
        </div>
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {showAddForm && isEditing && (
          <Card className="mb-4 border-primary">
            <Card.Body>
              <h6 className="mb-3">Add New Education</h6>
              <Form onSubmit={handleSubmit}>
                <Row>
                <Col md={6} className="mb-3">
                  <Form.Group className="mb-3">
                    <Form.Label>Degree <span className="text-danger">*</span></Form.Label>
                    <Form.Select 
                      name="degree" 
                      value={formData.degree}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    >
                      <option value="">Select Degree</option>
                      {degreeOptions.map(degree => (
                        <option key={degree} value={degree}>{degree}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Specialization</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="specialization" 
                      value={formData.specialization}
                      onChange={handleInputChange}
                      placeholder="e.g., Computer Science"
                      required
                      disabled={loading}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>College/University</Form.Label>
                    <Form.Select 
                      name="university" 
                      value={formData.university}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    >
                      <option value="">Select University</option>
                      {universityOptions.map(univ => (
                        <option key={univ} value={univ}>{univ}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Program Name</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="program" 
                      value={formData.program}
                      onChange={handleInputChange}
                      placeholder="e.g., Computer Science and Engineering"
                      required
                      disabled={loading}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Year of Completion</Form.Label>
                    <Form.Control 
                      type="number" 
                      name="year" 
                      value={formData.year}
                      onChange={handleInputChange}
                      placeholder="e.g., 2020"
                      min="1900"
                      max={new Date().getFullYear() + 5}
                      required
                      disabled={loading}
                    />
                  </Form.Group>
                </Col>
                <Col md={12} className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="is_research"
                    label="This is a research degree (Ph.D., M.Phil, etc.)"
                    name="is_research"
                    checked={formData.is_research}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </Col>
                {formData.is_research && (
                  <>
                    <Col md={12} className="mb-3">
                      <Form.Group>
                        <Form.Label>Dissertation/Thesis Title</Form.Label>
                        <Form.Control 
                          type="text" 
                          name="dissertation_title" 
                          value={formData.dissertation_title}
                          onChange={handleInputChange}
                          placeholder="Title of your research work"
                          disabled={loading}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12} className="mb-3">
                      <Form.Group>
                        <Form.Label>Abstract/Summary</Form.Label>
                        <Form.Control 
                          as="textarea" 
                          rows={3} 
                          name="abstract" 
                          value={formData.abstract}
                          onChange={handleInputChange}
                          placeholder="Brief summary of your research work"
                          disabled={loading}
                        />
                      </Form.Group>
                    </Col>
                  </>
                )}
                <Col md={12} className="text-end">
                  <Button 
                    type="submit"
                    variant="primary"
                    disabled={!formData.degree || !formData.university || loading}
                  >
                    {loading ? (
                      <>
                        <Spinner as="span" size="sm" animation="border" role="status" aria-hidden="true" className="me-2" />
                        {editingId ? 'Updating...' : 'Adding...'}
                      </>
                    ) : editingId ? 'Update Education' : 'Add Education'}
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
        )}

        {!showAddForm && education.length > 0 ? (
          <Accordion className="education-accordion">
            {education.map((edu, index) => (
              <Accordion.Item eventKey={index.toString()} key={edu.id} className="mb-2">
                <Accordion.Header>
                  <div className="d-flex align-items-center w-100">
                    <div className="me-3">
                      {edu.is_research ? (
                        <FaBook className="text-primary" />
                      ) : (
                        <FaGraduationCap className="text-primary" />
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-0">{edu.degree} in {edu.specialization}</h6>
                      <small className="text-muted">{edu.university} • {formatDate(edu.year)}</small>
                    </div>
                    {edu.is_research && (
                      <Badge bg="info" className="me-2">Research</Badge>
                    )}
                  </div>
                </Accordion.Header>
                <Accordion.Body>
                  <Row>
                    <Col md={6}>
                      <p><strong>Program:</strong> {edu.program}</p>
                      <p><strong>University:</strong> {edu.university}</p>
                      <p><strong>Year of Completion:</strong> {formatDate(edu.year)}</p>
                    </Col>
                    {edu.is_research && (
                      <Col md={6}>
                        <p><strong>Dissertation/ Thesis Title:</strong> {edu.dissertation_title}</p>
                        <p><strong>Abstract:</strong> {edu.abstract}</p>
                      </Col>
                    )}
                  </Row>
                  {isEditing && (
                    <div className="text-end mt-2">
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(edu)}
                        disabled={loading}
                      >
                        <FaEdit className="me-1" /> Edit
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDelete(edu.id)}
                        disabled={loading}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  )}
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        ) : null}

        {!showAddForm && education.length === 0 && (
          <div className="text-center py-4">
            <FaGraduationCap size={32} className="text-muted mb-2" />
            <p className="text-muted">No educational qualifications added yet.</p>
            {isEditing && (
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => setShowAddForm(true)}
                disabled={loading}
              >
                <FaPlus className="me-1" /> Add Education
              </Button>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default EducationalInfo;
