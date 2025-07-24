import React, { useState } from 'react';
import { Card, Button, Row, Col, Form, Accordion, Badge } from 'react-bootstrap';
import { FaPlus, FaTrash, FaGraduationCap, FaBook } from 'react-icons/fa';

const EducationalInfo = ({ isEditing }) => {
  const [education, setEducation] = useState([
    {
      id: 1,
      degree: 'Ph.D.',
      specialization: 'Computer Science',
      university: 'Stanford University',
      program: 'Computer Science',
      year: '2015',
      isResearch: false,
      dissertationTitle: '',
      abstract: ''
    },
    {
      id: 2,
      degree: 'M.S.',
      specialization: 'Data Science',
      university: 'MIT',
      program: 'Data Science',
      year: '2010',
      isResearch: true,
      dissertationTitle: 'Advanced Machine Learning Techniques',
      abstract: 'A comprehensive study of modern machine learning algorithms and their applications.'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newEducation, setNewEducation] = useState({
    degree: '',
    specialization: '',
    university: '',
    program: '',
    year: '',
    isResearch: false,
    dissertationTitle: '',
    abstract: ''
  });

  const handleAddEducation = () => {
    setEducation([...education, { ...newEducation, id: Date.now() }]);
    setNewEducation({
      degree: '',
      specialization: '',
      university: '',
      program: '',
      year: '',
      isResearch: false,
      dissertationTitle: '',
      abstract: ''
    });
    setShowAddForm(false);
  };

  const handleRemoveEducation = (id) => {
    setEducation(education.filter(edu => edu.id !== id));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewEducation({
      ...newEducation,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const degreeOptions = [
    'High School', 'Associate', 'Bachelor', 'Master', 'Ph.D.', 'Post Doc', 'Other'
  ];

  const universityOptions = [
    'Stanford University', 'MIT', 'Harvard University', 'Caltech', 'Oxford University', 'Other'
  ];

  return (
    <Card className="mb-4">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="section-title mb-0">Educational Qualifications</h5>
          {isEditing && (
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <FaPlus className="me-1" /> Add Education
            </Button>
          )}
        </div>

        {showAddForm && isEditing && (
          <Card className="mb-4 border-primary">
            <Card.Body>
              <h6 className="mb-3">Add New Education</h6>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Degree</Form.Label>
                    <Form.Select 
                      name="degree" 
                      value={newEducation.degree}
                      onChange={handleInputChange}
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
                      value={newEducation.specialization}
                      onChange={handleInputChange}
                      placeholder="e.g., Computer Science"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>University/Institution</Form.Label>
                    <Form.Select 
                      name="university" 
                      value={newEducation.university}
                      onChange={handleInputChange}
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
                      value={newEducation.program}
                      onChange={handleInputChange}
                      placeholder="e.g., Computer Science and Engineering"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Year of Completion</Form.Label>
                    <Form.Control 
                      type="number" 
                      name="year" 
                      value={newEducation.year}
                      onChange={handleInputChange}
                      placeholder="e.g., 2020"
                    />
                  </Form.Group>
                </Col>
                <Col md={12} className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="isResearch"
                    label="This is a research degree (Ph.D., M.Phil, etc.)"
                    name="isResearch"
                    checked={newEducation.isResearch}
                    onChange={handleInputChange}
                  />
                </Col>
                {newEducation.isResearch && (
                  <>
                    <Col md={12} className="mb-3">
                      <Form.Group>
                        <Form.Label>Dissertation/Thesis Title</Form.Label>
                        <Form.Control 
                          type="text" 
                          name="dissertationTitle" 
                          value={newEducation.dissertationTitle}
                          onChange={handleInputChange}
                          placeholder="Title of your research work"
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
                          value={newEducation.abstract}
                          onChange={handleInputChange}
                          placeholder="Brief summary of your research work"
                        />
                      </Form.Group>
                    </Col>
                  </>
                )}
                <Col md={12} className="text-end">
                  <Button 
                    variant="outline-secondary" 
                    className="me-2"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary"
                    onClick={handleAddEducation}
                    disabled={!newEducation.degree || !newEducation.university}
                  >
                    Add Education
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        <Accordion defaultActiveKey="0" className="education-accordion">
          {education.map((edu, index) => (
            <Accordion.Item eventKey={index.toString()} key={edu.id} className="mb-2">
              <Accordion.Header>
                <div className="d-flex align-items-center w-100">
                  <div className="me-3">
                    {edu.isResearch ? (
                      <FaBook className="text-primary" />
                    ) : (
                      <FaGraduationCap className="text-primary" />
                    )}
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-0">{edu.degree} in {edu.specialization}</h6>
                    <small className="text-muted">{edu.university} • {edu.year}</small>
                  </div>
                  {edu.isResearch && (
                    <Badge bg="info" className="me-2">Research</Badge>
                  )}
                </div>
              </Accordion.Header>
              <Accordion.Body>
                <Row>
                  <Col md={6}>
                    <p><strong>Program:</strong> {edu.program}</p>
                    <p><strong>University:</strong> {edu.university}</p>
                    <p><strong>Year of Completion:</strong> {edu.year}</p>
                  </Col>
                  {edu.isResearch && (
                    <Col md={6}>
                      <p><strong>Dissertation/ Thesis Title:</strong> {edu.dissertationTitle}</p>
                      <p><strong>Abstract:</strong> {edu.abstract}</p>
                    </Col>
                  )}
                </Row>
                {isEditing && (
                  <div className="text-end mt-2">
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleRemoveEducation(edu.id)}
                    >
                      <FaTrash className="me-1" /> Remove
                    </Button>
                  </div>
                )}
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>

        {education.length === 0 && (
          <div className="text-center py-4">
            <FaGraduationCap size={32} className="text-muted mb-2" />
            <p className="text-muted">No educational qualifications added yet.</p>
            {isEditing && (
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => setShowAddForm(true)}
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
