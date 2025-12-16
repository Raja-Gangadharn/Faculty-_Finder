import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Card, Button, Row, Col, Form, Accordion, Badge, Spinner, Alert, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash, FaGraduationCap, FaEdit, FaExclamationTriangle } from 'react-icons/fa';
import facultyService from '../../../../services/facultyService';

const EducationalInfo = forwardRef(({ isEditing }, ref) => {
  // State management
  const [education, setEducation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [educationToDelete, setEducationToDelete] = useState(null);

  // Form state
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

  // State for dropdown options
  const [dropdownOptions, setDropdownOptions] = useState({
    degrees: [],
    colleges: [],
    departments: []
  });

  // Fetch dropdown options
  const fetchDropdownOptions = async () => {
    try {
      const [degreesRes, collegesRes, departmentsRes] = await Promise.all([
        facultyService.getDegrees(),
        facultyService.getColleges(),
        facultyService.getDepartments()
      ]);

      setDropdownOptions({
        degrees: degreesRes.data.results ?
          degreesRes.data.results.map(d => d.name) :
          degreesRes.data.map(d => d.name),
        colleges: collegesRes.data.results ?
          collegesRes.data.results.map(c => c.name) :
          collegesRes.data.map(c => c.name),
        departments: departmentsRes.data.results ?
          departmentsRes.data.results.map(d => d.name) :
          departmentsRes.data.map(d => d.name)
      });
    } catch (error) {
      console.error('Error fetching dropdown options:', error);
      toast.error('Failed to load form options');
    }
  };

  // Fetch education data
  const fetchEducation = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await facultyService.getEducations();

      // Handle different response formats
      let educationData = [];

      // Check for different possible response structures
      if (Array.isArray(response)) {
        educationData = response;
      } else if (response && Array.isArray(response.data)) {
        educationData = response.data;
      } else if (response?.data?.results) {
        educationData = response.data.results;
      } else if (response?.data) {
        educationData = [response.data];
      } else if (response?.results) {
        educationData = response.results;
      }

      // Process and validate education data
      const processedData = (educationData || [])
        .filter(edu => {
          const isValid = edu && (edu.degree || edu.university || edu.year);
          if (!isValid) {
            console.warn('Skipping invalid education item:', edu);
          }
          return isValid;
        })
        .map((edu, index) => ({
          id: edu.id || `temp-${Date.now()}-${index}`,
          degree: edu.degree || '',
          specialization: edu.specialization || '',
          university: edu.university || '',
          program: edu.program || '',
          year: edu.year || '',
          is_research: Boolean(edu.is_research),
          dissertation_title: edu.dissertation_title || '',
          abstract: edu.abstract || ''
        }));

      // Processed education data is ready
      setEducation(processedData);
      return processedData;
    } catch (err) {
      console.error('Error fetching education data:', err);
      setError('Failed to load education data. Please try again later.');
      setEducation([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const data = { ...formData };

      // Remove empty fields
      Object.keys(data).forEach(key => {
        if (data[key] === '') {
          delete data[key];
        }
      });

      if (editingId) {
        await facultyService.updateEducation(editingId, data);
        toast.success('Education updated successfully', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
      } else {
        await facultyService.createEducation(data);
        toast.success('Education added successfully', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
      }

      await fetchEducation();
      setShowAddForm(false);
      setFormData(initialFormState);
      setEditingId(null);
    } catch (err) {
      console.error('Error saving education:', err);
      setError(err.response?.data?.message || 'Failed to save education');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit action
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle delete action
  const handleDelete = (id) => {
    setEducationToDelete(id);
    setShowDeleteModal(true);
  };

  // Confirm delete action
  const confirmDelete = async () => {
    if (!educationToDelete) return;

    try {
      setLoading(true);
      await facultyService.deleteEducation(educationToDelete);
      await fetchEducation();

      toast.success('Education deleted successfully', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    } catch (err) {
      console.error('Error deleting education:', err);
      setError(err.response?.data?.message || 'Failed to delete education');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setEducationToDelete(null);
    }
  };

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    save: async () => {
      try {
        if (showAddForm && formData) {
          await handleSubmit({ preventDefault: () => { } });
        }
        return { ok: true };
      } catch (error) {
        console.error('Error in save:', error);
        return { ok: false, error: error.message };
      }
    }
  }));


  // Fetch data on mount
  useEffect(() => {
    fetchEducation();
    fetchDropdownOptions();
  }, []);

  // Render education list item
  const renderEducationItem = (edu, index) => {
    if (!edu) return null;

    const handleEditClick = (e) => {
      e.stopPropagation();
      handleEdit(edu);
    };

    const handleDeleteClick = (e) => {
      e.stopPropagation();
      handleDelete(edu.id);
    };

    return (
      <div key={edu.id || `edu-${index}`} className="mb-3">
        <Accordion>
          <Accordion.Item eventKey={index.toString()} className="shadow-sm">
            <div className="d-flex align-items-center w-100 bg-light p-3">
              <Accordion.Button as="div" className="flex-grow-1 p-0 border-0 bg-transparent">
                <div className="d-flex align-items-center w-100">
                  <div className="me-3">
                    <FaGraduationCap className="text-primary" size={20} />
                  </div>
                  <div className="flex-grow-1 text-start">
                    <h6 className="mb-0 d-flex align-items-center">
                      <span className="me-2">{edu.degree || 'No Degree Specified'}</span>
                      {edu.is_research && (
                        <Badge bg="info" className="me-2">Research</Badge>
                      )}
                    </h6>
                    <div className="d-flex flex-wrap align-items-center text-muted small mt-1">
                      {edu.university && (
                        <span className="me-2">{edu.university}</span>
                      )}
                      {edu.year && (
                        <span>• {edu.year}</span>
                      )}
                    </div>
                    {edu.specialization && (
                      <div className="text-muted small">
                        {edu.specialization}
                      </div>
                    )}
                  </div>
                </div>
              </Accordion.Button>
              {isEditing && (
                <div className="d-flex ms-2" onClick={e => e.stopPropagation()}>
                  <Button
                    as="div"
                    variant="link"
                    size="sm"
                    className="text-primary p-1"
                    onClick={handleEditClick}
                    title="Edit"
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    as="div"
                    variant="link"
                    size="sm"
                    className="text-danger p-1"
                    onClick={handleDeleteClick}
                    title="Delete"
                  >
                    <FaTrash />
                  </Button>
                </div>
              )}
            </div>
            <Accordion.Body className="pt-3">
              <Row className="g-3">
                <Col xs={12} md={edu.is_research ? 6 : 12}>
                  <div className="mb-3">
                    <h6 className="text-muted mb-2">Education Details</h6>
                    <div className="ps-2">
                      {edu.university && (
                        <div className="mb-2">
                          <strong className="d-block text-muted small">University</strong>
                          <span>{edu.university}</span>
                        </div>
                      )}
                      {edu.program && (
                        <div className="mb-2">
                          <strong className="d-block text-muted small">Program</strong>
                          <span>{edu.program}</span>
                        </div>
                      )}
                      {edu.year && (
                        <div className="mb-2">
                          <strong className="d-block text-muted small">Year</strong>
                          <span>{edu.year}</span>
                        </div>
                      )}
                      {edu.specialization && (
                        <div>
                          <strong className="d-block text-muted small">Specialization</strong>
                          <span>{edu.specialization}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Col>
                {edu.is_research && (
                  <Col xs={12} md={6}>
                    <div className="mb-3">
                      <h6 className="text-muted mb-2">Research Details</h6>
                      <div className="ps-2">
                        {edu.dissertation_title && (
                          <div className="mb-2">
                            <strong className="d-block text-muted small">Research Title</strong>
                            <span>{edu.dissertation_title}</span>
                          </div>
                        )}
                        {edu.abstract && (
                          <div>
                            <strong className="d-block text-muted small mb-1">Abstract</strong>
                            <div className="p-2 bg-light rounded">
                              {edu.abstract}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Col>
                )}
              </Row>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>
    );
  };

  // Render loading state
  if (loading && !showAddForm && education.length === 0) {
    return (
      <Card className="mb-4">
        <Card.Body className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2 mb-0">Loading education data...</p>
        </Card.Body>
      </Card>
    );
  }

  // Render empty state
  const renderEmptyState = () => (
    <Alert variant="info" className="mb-0">
      {isEditing ? (
        <div className="text-center py-3">
          <div className="mb-3">
            <FaGraduationCap size={32} className="text-muted" />
          </div>
          <h6 className="mb-2">No education records found</h6>
          <p className="text-muted mb-3">Add your educational qualifications to showcase your academic background.</p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setFormData(initialFormState);
              setShowAddForm(true);
            }}
            className="px-3"
          >
            <FaPlus className="me-1" /> Add Education
          </Button>
        </div>
      ) : (
        <div className="text-center py-3">
          <div className="mb-2">
            <FaGraduationCap size={32} className="text-muted" />
          </div>
          <p className="mb-0">No education records available</p>
        </div>
      )}
    </Alert>
  );

  // Render education list
  const renderEducationList = () => {
    if (loading) {
      return (
        <div className="text-center py-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading education...</span>
          </Spinner>
        </div>
      );
    }

    if (!education || education.length === 0) {
      return renderEmptyState();
    }

    try {
      return (
        <div className="education-list">
          <Accordion defaultActiveKey="0" className="education-accordion">
            {education.map((edu, index) => {
              if (!edu) return null;
              return (
                <div key={edu.id || `edu-${index}`} className="mb-3">
                  {renderEducationItem(edu, index)}
                </div>
              );
            })}
          </Accordion>
        </div>
      );
    } catch (err) {
      console.error('Error rendering education list:', err);
      return (
        <Alert variant="danger">
          Error displaying education information. Please try refreshing the page.
        </Alert>
      );
    }
  };

  // Render add/edit form
  const renderForm = () => (
    <Card className="mb-4 border-primary">
      <Card.Body>
        <h6 className="mb-3">{editingId ? 'Edit' : 'Add New'} Education</h6>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Degree <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  name="degree"
                  value={formData.degree}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  <option value="">Select Degree</option>
                  {dropdownOptions.degrees.map(degree => (
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
                  disabled={loading}
                />
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>University <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  name="university"
                  value={formData.university}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  <option value="">Select University</option>
                  {dropdownOptions.colleges.map(college => (
                    <option key={college} value={college}>{college}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Program</Form.Label>
                <Form.Control
                  type="text"
                  name="program"
                  value={formData.program}
                  onChange={handleInputChange}
                  placeholder="e.g., Full-time, Part-time"
                  disabled={loading}
                />
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Year <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  min="1900"
                  max={new Date().getFullYear() + 5}
                  required
                  disabled={loading}
                />
              </Form.Group>
            </Col>
            <Col xs={12} className="mb-3">
              <Form.Check
                type="checkbox"
                id="is_research"
                name="is_research"
                label="This is a research degree (e.g., PhD, M.Phil)"
                checked={formData.is_research}
                onChange={handleInputChange}
                disabled={loading}
              />
            </Col>
            {formData.is_research && (
              <>
                <Col md={12} className="mb-3">
                  <Form.Group>
                    <Form.Label>Research/Dissertation Title</Form.Label>
                    <Form.Control
                      type="text"
                      name="dissertation_title"
                      value={formData.dissertation_title}
                      onChange={handleInputChange}
                      disabled={loading}
                      placeholder="Enter your research/dissertation title"
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
                      disabled={loading}
                      placeholder="Brief summary of your research (optional)"
                    />
                  </Form.Group>
                </Col>
              </>
            )}
            <Col xs={12} className="text-end mt-3">
              <Button
                variant="outline-secondary"
                className="me-2"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingId(null);
                  setFormData(initialFormState);
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : editingId ? 'Update' : 'Save'}
              </Button>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );

  // Delete Confirmation Modal
  const renderDeleteModal = () => (
    <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="h5">Confirm Deletion</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <div className="mb-3">
          <FaExclamationTriangle size={48} className="text-danger mb-3" />
          <h5>Are you sure you want to delete this education record?</h5>
          <p className="text-muted">This action cannot be undone.</p>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <Button
          variant="outline-secondary"
          onClick={() => setShowDeleteModal(false)}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={confirmDelete}
          disabled={loading}
        >
          {loading ? 'Deleting...' : 'Delete'}
        </Button>
      </Modal.Footer>
    </Modal>
  );

  // Main render
  return (
    <>
      {renderDeleteModal()}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="section-title mb-0">Educational Qualifications</h5>
            {isEditing && !showAddForm && education.length > 0 && (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => {
                  setFormData(initialFormState);
                  setShowAddForm(true);
                  setEditingId(null);
                }}
                disabled={loading}
              >
                <FaPlus className="me-1" /> Add Education
              </Button>
            )}
          </div>

          {error && (
            <Alert variant="danger" onClose={() => setError('')} dismissible>
              {error}
            </Alert>
          )}

          {showAddForm ? renderForm() : renderEducationList()}
        </Card.Body>
      </Card>
    </>
  );
});

export default EducationalInfo;
