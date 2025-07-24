import React, { useState } from 'react';
import { Card, Button, Row, Col, Form, ListGroup, Badge } from 'react-bootstrap';
import { FaPlus, FaTrash, FaFileUpload, FaFile, FaCheck, FaCalendarAlt } from 'react-icons/fa';

const Documents = ({ isEditing }) => {
  // Skills & Presentations
  const [skills, setSkills] = useState([
    {
      id: 1,
      skill: 'Machine Learning',
      proficiency: 'Advanced'
    },
    {
      id: 2,
      skill: 'Python',
      proficiency: 'Expert'
    }
  ]);

  const [presentations, setPresentations] = useState([
    {
      id: 1,
      title: 'AI in Education',
      date: '2023-05-15',
      venue: 'International Conference on AI'
    }
  ]);

  // Documents
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: 'Research Paper.pdf',
      type: 'Research Paper',
      date: '2023-06-01',
      size: '1.2MB'
    },
    {
      id: 2,
      name: 'Teaching Portfolio.docx',
      type: 'Teaching Materials',
      date: '2023-05-15',
      size: '2.5MB'
    }
  ]);

  // Form States
  const [showSkillsForm, setShowSkillsForm] = useState(false);
  const [showPresentationsForm, setShowPresentationsForm] = useState(false);
  const [showDocumentsForm, setShowDocumentsForm] = useState(false);

  const [newSkill, setNewSkill] = useState({
    skill: '',
    proficiency: 'Beginner'
  });

  const [newPresentation, setNewPresentation] = useState({
    title: '',
    date: '',
    venue: ''
  });

  const [newDocument, setNewDocument] = useState({
    name: '',
    type: 'Research Paper',
    file: null
  });

  // Handle Input Changes
  const handleSkillInputChange = (e) => {
    const { name, value } = e.target;
    setNewSkill({
      ...newSkill,
      [name]: value
    });
  };

  const handlePresentationInputChange = (e) => {
    const { name, value } = e.target;
    setNewPresentation({
      ...newPresentation,
      [name]: value
    });
  };

  const handleDocumentInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'file') {
      const file = e.target.files[0];
      setNewDocument({
        ...newDocument,
        file,
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(1) + 'MB'
      });
    } else {
      setNewDocument({
        ...newDocument,
        [name]: value
      });
    }
  };

  // Add Items
  const addSkill = () => {
    setSkills([
      {
        ...newSkill,
        id: Date.now()
      },
      ...skills
    ]);
    setNewSkill({
      skill: '',
      proficiency: 'Beginner'
    });
    setShowSkillsForm(false);
  };

  const addPresentation = () => {
    setPresentations([
      {
        ...newPresentation,
        id: Date.now()
      },
      ...presentations
    ]);
    setNewPresentation({
      title: '',
      date: '',
      venue: ''
    });
    setShowPresentationsForm(false);
  };

  const addDocument = () => {
    if (newDocument.file) {
      setDocuments([
        {
          ...newDocument,
          id: Date.now(),
          date: new Date().toISOString().split('T')[0]
        },
        ...documents
      ]);
      setNewDocument({
        name: '',
        type: 'Research Paper',
        file: null
      });
    }
    setShowDocumentsForm(false);
  };

  // Remove Items
  const removeItem = (id, type) => {
    if (type === 'skill') {
      setSkills(skills.filter(skill => skill.id !== id));
    } else if (type === 'presentation') {
      setPresentations(presentations.filter(p => p.id !== id));
    } else {
      setDocuments(documents.filter(d => d.id !== id));
    }
  };

  // Skill Proficiency Options
  const proficiencyOptions = [
    'Beginner', 'Intermediate', 'Advanced', 'Expert'
  ];

  // Document Types
  const documentTypes = [
    'Research Paper', 'Teaching Materials', 'Course Material', 'Thesis', 'Other'
  ];

  return (
    <Card className="mb-4">
      <Card.Body>
        <h5 className="section-title mb-4">Skills & Documents</h5>

        {/* Skills Section */}
        <div className="mb-4">
          <h6 className="mb-3">Skills</h6>
          {isEditing && (
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => setShowSkillsForm(!showSkillsForm)}
            >
              <FaPlus className="me-1" /> Add Skill
            </Button>
          )}

          {showSkillsForm && isEditing && (
            <Card className="mb-3 border-primary">
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Skill Name</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="skill" 
                    value={newSkill.skill}
                    onChange={handleSkillInputChange}
                    placeholder="e.g., Machine Learning"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Proficiency Level</Form.Label>
                  <Form.Select 
                    name="proficiency" 
                    value={newSkill.proficiency}
                    onChange={handleSkillInputChange}
                  >
                    {proficiencyOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <div className="text-end">
                  <Button 
                    variant="outline-secondary" 
                    className="me-2"
                    onClick={() => setShowSkillsForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary"
                    onClick={addSkill}
                    disabled={!newSkill.skill}
                  >
                    Add Skill
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}

          {skills.length > 0 ? (
            <ListGroup variant="flush">
              {skills.map((skill) => (
                <ListGroup.Item key={skill.id} className="py-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-0">{skill.skill}</h6>
                      <Badge bg={getProficiencyColor(skill.proficiency)}>
                        {skill.proficiency}
                      </Badge>
                    </div>
                    {isEditing && (
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => removeItem(skill.id, 'skill')}
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
              <FaFile size={32} className="text-muted mb-2" />
              <p className="text-muted">No skills added yet.</p>
              {isEditing && (
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => setShowSkillsForm(true)}
                >
                  <FaPlus className="me-1" /> Add Skill
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Presentations Section */}
        <div className="mb-4">
          <h6 className="mb-3">Presentations</h6>
          {isEditing && (
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => setShowPresentationsForm(!showPresentationsForm)}
            >
              <FaPlus className="me-1" /> Add Presentation
            </Button>
          )}

          {showPresentationsForm && isEditing && (
            <Card className="mb-3 border-primary">
              <Card.Body>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Presentation Title</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="title" 
                        value={newPresentation.title}
                        onChange={handlePresentationInputChange}
                        placeholder="e.g., AI in Education"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Group>
                      <Form.Label>Date</Form.Label>
                      <Form.Control 
                        type="date" 
                        name="date" 
                        value={newPresentation.date}
                        onChange={handlePresentationInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>Venue</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="venue" 
                        value={newPresentation.venue}
                        onChange={handlePresentationInputChange}
                        placeholder="e.g., International Conference on AI"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12} className="text-end">
                    <Button 
                      variant="outline-secondary" 
                      className="me-2"
                      onClick={() => setShowPresentationsForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="primary"
                      onClick={addPresentation}
                      disabled={!newPresentation.title || !newPresentation.date}
                    >
                      Add Presentation
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {presentations.length > 0 ? (
            <ListGroup variant="flush">
              {presentations.map((pres) => (
                <ListGroup.Item key={pres.id} className="py-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">{pres.title}</h6>
                      <p className="mb-1 text-muted">
                        <FaFile className="me-2" />
                        {pres.venue}
                      </p>
                      <p className="mb-0 text-muted small">
                        <FaCalendarAlt className="me-1" />
                        {new Date(pres.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    {isEditing && (
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => removeItem(pres.id, 'presentation')}
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
              <FaFile size={32} className="text-muted mb-2" />
              <p className="text-muted">No presentations added yet.</p>
              {isEditing && (
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => setShowPresentationsForm(true)}
                >
                  <FaPlus className="me-1" /> Add Presentation
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Documents Section */}
        <div>
          <h6 className="mb-3">Documents</h6>
          {isEditing && (
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => setShowDocumentsForm(!showDocumentsForm)}
            >
              <FaPlus className="me-1" /> Upload Document
            </Button>
          )}

          {showDocumentsForm && isEditing && (
            <Card className="mb-3 border-primary">
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Document Type</Form.Label>
                  <Form.Select 
                    name="type" 
                    value={newDocument.type}
                    onChange={handleDocumentInputChange}
                  >
                    {documentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Upload Document</Form.Label>
                  <Form.Control 
                    type="file" 
                    name="file" 
                    onChange={handleDocumentInputChange}
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                  />
                </Form.Group>
                <div className="text-end">
                  <Button 
                    variant="outline-secondary" 
                    className="me-2"
                    onClick={() => setShowDocumentsForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary"
                    onClick={addDocument}
                    disabled={!newDocument.file}
                  >
                    Upload Document
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}

          {documents.length > 0 ? (
            <ListGroup variant="flush">
              {documents.map((doc) => (
                <ListGroup.Item key={doc.id} className="py-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">
                        <FaFile className="me-2 text-muted" />
                        {doc.name}
                      </h6>
                      <p className="mb-1 text-muted">
                        <FaFileUpload className="me-2 text-muted" />
                        {doc.type}
                      </p>
                      <p className="mb-0 text-muted small">
                        <FaCalendarAlt className="me-1 text-muted" />
                        {new Date(doc.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                        {' • '}
                        <span className="text-muted">{doc.size}</span>
                      </p>
                    </div>
                    {isEditing && (
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => removeItem(doc.id, 'document')}
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
              <FaFileUpload size={32} className="text-muted mb-2" />
              <p className="text-muted">No documents uploaded yet.</p>
              {isEditing && (
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => setShowDocumentsForm(true)}
                >
                  <FaPlus className="me-1" /> Upload Document
                </Button>
              )}
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

// Helper function to get proficiency color
const getProficiencyColor = (level) => {
  switch (level) {
    case 'Beginner':
      return 'secondary';
    case 'Intermediate':
      return 'info';
    case 'Advanced':
      return 'warning';
    case 'Expert':
      return 'success';
    default:
      return 'primary';
  }
};

export default Documents;
