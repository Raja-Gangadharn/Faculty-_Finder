import React, { useState } from 'react';
import { Card, Button, Row, Col, Form, Tabs, Tab, Badge, ListGroup } from 'react-bootstrap';
import { FaPlus, FaTrash, FaBriefcase, FaUniversity, FaCalendarAlt, FaEdit, FaCheck } from 'react-icons/fa';

const Experience = ({ isEditing }) => {
  // Academic Experience
  const [academicExperience, setAcademicExperience] = useState([
    {
      id: 1,
      institution: 'Stanford University',
      position: 'Associate Professor',
      responsibilities: [
        'Teaching advanced courses in Machine Learning and AI',
        'Supervising graduate student research',
        'Leading research projects in AI ethics'
      ],
      startDate: '2018-06-01',
      endDate: '',
      isCurrent: true
    }
  ]);

  // Non-Academic Experience
  const [nonAcademicExperience, setNonAcademicExperience] = useState([
    {
      id: 1,
      company: 'Tech Solutions Inc.',
      position: 'Senior Software Engineer',
      responsibilities: [
        'Led a team of developers',
        'Designed and implemented scalable systems',
        'Mentored junior developers'
      ],
      startDate: '2010-06-01',
      endDate: '2012-07-31',
      isCurrent: false
    }
  ]);

  // Overall Experience
  const [overallExperience, setOverallExperience] = useState([
    { id: 1, type: 'Teaching Experience', range: '11-15' }
  ]);

  // Form States
  const [showAcademicForm, setShowAcademicForm] = useState(false);
  const [showNonAcademicForm, setShowNonAcademicForm] = useState(false);
  const [showOverallForm, setShowOverallForm] = useState(false);

  const [newAcademicExp, setNewAcademicExp] = useState({
    institution: '',
    position: '',
    responsibilities: [''],
    startDate: '',
    endDate: '',
    isCurrent: false
  });

  const [newNonAcademicExp, setNewNonAcademicExp] = useState({
    company: '',
    position: '',
    responsibilities: [''],
    startDate: '',
    endDate: '',
    isCurrent: false
  });

  const [newOverallExp, setNewOverallExp] = useState({
    type: 'Teaching Experience',
    range: '0-5'
  });

  // Handle Input Changes
  const handleAcademicInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAcademicExp({
      ...newAcademicExp,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleNonAcademicInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewNonAcademicExp({
      ...newNonAcademicExp,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleOverallInputChange = (e) => {
    const { name, value } = e.target;
    setNewOverallExp({
      ...newOverallExp,
      [name]: value
    });
  };

  // Handle Responsibility Changes
  const handleAcademicResponsibilityChange = (index, value) => {
    const updatedResponsibilities = [...newAcademicExp.responsibilities];
    updatedResponsibilities[index] = value;
    setNewAcademicExp({
      ...newAcademicExp,
      responsibilities: updatedResponsibilities
    });
  };

  const handleNonAcademicResponsibilityChange = (index, value) => {
    const updatedResponsibilities = [...newNonAcademicExp.responsibilities];
    updatedResponsibilities[index] = value;
    setNewNonAcademicExp({
      ...newNonAcademicExp,
      responsibilities: updatedResponsibilities
    });
  };

  // Add Responsibility
  const addResponsibility = (type) => {
    if (type === 'academic') {
      setNewAcademicExp({
        ...newAcademicExp,
        responsibilities: [...newAcademicExp.responsibilities, '']
      });
    } else {
      setNewNonAcademicExp({
        ...newNonAcademicExp,
        responsibilities: [...newNonAcademicExp.responsibilities, '']
      });
    }
  };

  // Remove Responsibility
  const removeResponsibility = (index, type) => {
    if (type === 'academic') {
      const updatedResponsibilities = [...newAcademicExp.responsibilities];
      updatedResponsibilities.splice(index, 1);
      setNewAcademicExp({
        ...newAcademicExp,
        responsibilities: updatedResponsibilities
      });
    } else {
      const updatedResponsibilities = [...newNonAcademicExp.responsibilities];
      updatedResponsibilities.splice(index, 1);
      setNewNonAcademicExp({
        ...newNonAcademicExp,
        responsibilities: updatedResponsibilities
      });
    }
  };

  // Add Experience
  const addAcademicExperience = () => {
    setAcademicExperience([
      {
        ...newAcademicExp,
        id: Date.now(),
        responsibilities: newAcademicExp.responsibilities.filter(r => r.trim() !== '')
      },
      ...academicExperience
    ]);
    setNewAcademicExp({
      institution: '',
      position: '',
      responsibilities: [''],
      startDate: '',
      endDate: '',
      isCurrent: false
    });
    setShowAcademicForm(false);
  };

  const addNonAcademicExperience = () => {
    setNonAcademicExperience([
      {
        ...newNonAcademicExp,
        id: Date.now(),
        responsibilities: newNonAcademicExp.responsibilities.filter(r => r.trim() !== '')
      },
      ...nonAcademicExperience
    ]);
    setNewNonAcademicExp({
      company: '',
      position: '',
      responsibilities: [''],
      startDate: '',
      endDate: '',
      isCurrent: false
    });
    setShowNonAcademicForm(false);
  };

  const addOverallExperience = () => {
    setOverallExperience([
      ...overallExperience,
      { ...newOverallExp, id: Date.now() }
    ]);
    setNewOverallExp({
      type: 'Teaching Experience',
      range: '0-5'
    });
    setShowOverallForm(false);
  };

  // Remove Experience
  const removeExperience = (id, type) => {
    if (type === 'academic') {
      setAcademicExperience(academicExperience.filter(exp => exp.id !== id));
    } else if (type === 'nonAcademic') {
      setNonAcademicExperience(nonAcademicExperience.filter(exp => exp.id !== id));
    } else {
      setOverallExperience(overallExperience.filter(exp => exp.id !== id));
    }
  };

  // Format Date
  const formatDate = (dateString) => {
    if (!dateString) return 'Present';
    const options = { year: 'numeric', month: 'short' };
    return new Date(dateString).toLocaleDateString('en-US', options);
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
                          value={newAcademicExp.institution}
                          onChange={handleAcademicInputChange}
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
                          value={newAcademicExp.position}
                          onChange={handleAcademicInputChange}
                          placeholder="e.g., Associate Professor"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12} className="mb-3">
                      <Form.Label>Responsibilities</Form.Label>
                      {newAcademicExp.responsibilities.map((resp, index) => (
                        <div key={index} className="d-flex mb-2">
                          <Form.Control
                            as="textarea"
                            rows={2}
                            value={resp}
                            onChange={(e) => handleAcademicResponsibilityChange(index, e.target.value)}
                            placeholder="Describe your responsibilities"
                          />
                          <Button 
                            variant="outline-danger" 
                            className="ms-2"
                            onClick={() => removeResponsibility(index, 'academic')}
                            disabled={newAcademicExp.responsibilities.length <= 1}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      ))}
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => addResponsibility('academic')}
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
                          value={newAcademicExp.startDate}
                          onChange={handleAcademicInputChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3} className="mb-3">
                      <Form.Group>
                        <Form.Label>End Date</Form.Label>
                        <Form.Control 
                          type="date" 
                          name="endDate" 
                          value={newAcademicExp.endDate}
                          onChange={handleAcademicInputChange}
                          disabled={newAcademicExp.isCurrent}
                          min={newAcademicExp.startDate}
                        />
                        <Form.Check
                          type="checkbox"
                          id="academicIsCurrent"
                          label="I currently work here"
                          name="isCurrent"
                          checked={newAcademicExp.isCurrent}
                          onChange={(e) => {
                            handleAcademicInputChange(e);
                            if (e.target.checked) {
                              setNewAcademicExp(prev => ({
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
                        onClick={() => setShowAcademicForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="primary"
                        onClick={addAcademicExperience}
                        disabled={!newAcademicExp.institution || !newAcademicExp.position || !newAcademicExp.startDate}
                      >
                        Add Position
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
                          {exp.institution}
                        </p>
                        <p className="mb-0 text-muted small">
                          <FaCalendarAlt className="me-1" />
                          {formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatDate(exp.endDate)}
                          {exp.isCurrent && (
                            <Badge bg="success" className="ms-2">Current</Badge>
                          )}
                        </p>
                        {exp.responsibilities && exp.responsibilities.length > 0 && (
                          <div className="mt-2">
                            <p className="mb-1 small"><strong>Key Responsibilities:</strong></p>
                            <ul className="small">
                              {exp.responsibilities.map((resp, i) => (
                                <li key={i}>{resp}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      {isEditing && (
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => removeExperience(exp.id, 'academic')}
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
                          value={newNonAcademicExp.company}
                          onChange={handleNonAcademicInputChange}
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
                          value={newNonAcademicExp.position}
                          onChange={handleNonAcademicInputChange}
                          placeholder="e.g., Senior Software Engineer"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12} className="mb-3">
                      <Form.Label>Responsibilities</Form.Label>
                      {newNonAcademicExp.responsibilities.map((resp, index) => (
                        <div key={index} className="d-flex mb-2">
                          <Form.Control
                            as="textarea"
                            rows={2}
                            value={resp}
                            onChange={(e) => handleNonAcademicResponsibilityChange(index, e.target.value)}
                            placeholder="Describe your responsibilities"
                          />
                          <Button 
                            variant="outline-danger" 
                            className="ms-2"
                            onClick={() => removeResponsibility(index, 'nonAcademic')}
                            disabled={newNonAcademicExp.responsibilities.length <= 1}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      ))}
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => addResponsibility('nonAcademic')}
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
                          value={newNonAcademicExp.startDate}
                          onChange={handleNonAcademicInputChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3} className="mb-3">
                      <Form.Group>
                        <Form.Label>End Date</Form.Label>
                        <Form.Control 
                          type="date" 
                          name="endDate" 
                          value={newNonAcademicExp.endDate}
                          onChange={handleNonAcademicInputChange}
                          disabled={newNonAcademicExp.isCurrent}
                          min={newNonAcademicExp.startDate}
                        />
                        <Form.Check
                          type="checkbox"
                          id="nonAcademicIsCurrent"
                          label="I currently work here"
                          name="isCurrent"
                          checked={newNonAcademicExp.isCurrent}
                          onChange={(e) => {
                            handleNonAcademicInputChange(e);
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
                        disabled={!newNonAcademicExp.company || !newNonAcademicExp.position || !newNonAcademicExp.startDate}
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
                          {exp.company}
                        </p>
                        <p className="mb-0 text-muted small">
                          <FaCalendarAlt className="me-1" />
                          {formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatDate(exp.endDate)}
                          {exp.isCurrent && (
                            <Badge bg="success" className="ms-2">Current</Badge>
                          )}
                        </p>
                        {exp.responsibilities && exp.responsibilities.length > 0 && (
                          <div className="mt-2">
                            <p className="mb-1 small"><strong>Key Responsibilities:</strong></p>
                            <ul className="small">
                              {exp.responsibilities.map((resp, i) => (
                                <li key={i}>{resp}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      {isEditing && (
                        <Button 
                          variant="outline-danger" 
                          size="sm"
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
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Experience Summary</h6>
              {isEditing && (
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => setShowOverallForm(!showOverallForm)}
                >
                  <FaPlus className="me-1" /> Add Experience Summary
                </Button>
              )}
            </div>

            {showOverallForm && isEditing && (
              <Card className="mb-4 border-primary">
                <Card.Body>
                  <h6 className="mb-3">Add Experience Summary</h6>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Experience Type</Form.Label>
                        <Form.Select 
                          name="type" 
                          value={newOverallExp.type}
                          onChange={handleOverallInputChange}
                        >
                          {experienceTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Experience Range</Form.Label>
                        <Form.Select 
                          name="range" 
                          value={newOverallExp.range}
                          onChange={handleOverallInputChange}
                        >
                          {experienceRanges.map(range => (
                            <option key={range} value={range}>{range}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={12} className="text-end">
                      <Button 
                        variant="outline-secondary" 
                        className="me-2"
                        onClick={() => setShowOverallForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="primary"
                        onClick={addOverallExperience}
                      >
                        Add Summary
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            )}

            {overallExperience.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Experience Type</th>
                      <th>Duration</th>
                      {isEditing && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {overallExperience.map((exp) => (
                      <tr key={exp.id}>
                        <td>{exp.type}</td>
                        <td>{exp.range}</td>
                        {isEditing && (
                          <td>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => removeExperience(exp.id, 'overall')}
                            >
                              <FaTrash />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4">
                <FaBriefcase size={32} className="text-muted mb-2" />
                <p className="text-muted">No experience summary added yet.</p>
                {isEditing && (
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => setShowOverallForm(true)}
                  >
                    <FaPlus className="me-1" /> Add Experience Summary
                  </Button>
                )}
              </div>
            )}
          </Tab>
        </Tabs>
      </Card.Body>
    </Card>
  );
};

export default Experience;
