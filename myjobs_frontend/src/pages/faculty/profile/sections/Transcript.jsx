import React, { useState } from 'react';
import { Card, Button, Row, Col, Form, Table, Accordion, Badge } from 'react-bootstrap';
import { FaPlus, FaTrash, FaBook, FaFileUpload, FaSearch } from 'react-icons/fa';

const Transcript = ({ isEditing }) => {
  const [transcripts, setTranscripts] = useState([
    {
      id: 1,
      degree: 'Ph.D. in Computer Science',
      college: 'Stanford University',
      major: 'Computer Science',
      department: 'Computer Science',
      courses: [
        { id: 1, code: 'CS101', name: 'Introduction to Programming', credits: 4, grade: 'A' },
        { id: 2, code: 'CS201', name: 'Data Structures', credits: 4, grade: 'A' },
      ]
    },
    {
      id: 2,
      degree: 'M.S. in Data Science',
      college: 'MIT',
      major: 'Data Science',
      department: 'Data Science',
      courses: [
        { id: 3, code: 'DS501', name: 'Machine Learning', credits: 3, grade: 'A+' },
        { id: 4, code: 'DS502', name: 'Big Data Analytics', credits: 3, grade: 'A' },
      ]
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTranscript, setNewTranscript] = useState({
    degree: '',
    college: '',
    major: '',
    department: '',
    courses: []
  });

  const [newCourse, setNewCourse] = useState({
    code: '',
    name: '',
    credits: '',
    department: ''
  });

  const [activeTranscriptId, setActiveTranscriptId] = useState(null);

  const degreeOptions = [
    'Ph.D. in Computer Science',
    'M.S. in Data Science',
    'B.Tech in Computer Science',
    'M.Tech in Artificial Intelligence',
    'Other'
  ];

  const collegeOptions = [
    'Stanford University',
    'MIT',
    'Harvard University',
    'Caltech',
    'Other'
  ];

  const departmentOptions = [
    'Computer Science',
    'Data Science',
    'Artificial Intelligence',
    'Information Technology',
    'Other'
  ];

  const handleAddTranscript = () => {
    setTranscripts([...transcripts, { ...newTranscript, id: Date.now(), courses: [] }]);
    setNewTranscript({
      degree: '',
      college: '',
      major: '',
      department: '',
      courses: []
    });
    setShowAddForm(false);
  };

  const handleRemoveTranscript = (id) => {
    setTranscripts(transcripts.filter(transcript => transcript.id !== id));
  };

  const handleAddCourse = (transcriptId) => {
    const updatedTranscripts = transcripts.map(transcript => {
      if (transcript.id === transcriptId) {
        return {
          ...transcript,
          courses: [...transcript.courses, { ...newCourse, id: Date.now() }]
        };
      }
      return transcript;
    });
    setTranscripts(updatedTranscripts);
    setNewCourse({
      code: '',
      name: '',
      credits: '',
      department: ''
    });
    setActiveTranscriptId(null);
  };

  const handleRemoveCourse = (transcriptId, courseId) => {
    const updatedTranscripts = transcripts.map(transcript => {
      if (transcript.id === transcriptId) {
        return {
          ...transcript,
          courses: transcript.courses.filter(course => course.id !== courseId)
        };
      }
      return transcript;
    });
    setTranscripts(updatedTranscripts);
  };

  const handleInputChange = (e, setter, state) => {
    const { name, value } = e.target;
    setter({ ...state, [name]: value });
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="section-title mb-0">Transcript</h5>
          {isEditing && (
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <FaPlus className="me-1" /> Add Transcript
            </Button>
          )}
        </div>

        {showAddForm && isEditing && (
          <Card className="mb-4 border-primary">
            <Card.Body>
              <h6 className="mb-3">Add New Transcript</h6>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Degree</Form.Label>
                    <Form.Select 
                      name="degree" 
                      value={newTranscript.degree}
                      onChange={(e) => handleInputChange(e, setNewTranscript, newTranscript)}
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
                    <Form.Label>College/University</Form.Label>
                    <Form.Select 
                      name="college" 
                      value={newTranscript.college}
                      onChange={(e) => handleInputChange(e, setNewTranscript, newTranscript)}
                    >
                      <option value="">Select College/University</option>
                      {collegeOptions.map(college => (
                        <option key={college} value={college}>{college}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Major</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="major" 
                      value={newTranscript.major}
                      onChange={(e) => handleInputChange(e, setNewTranscript, newTranscript)}
                      placeholder="e.g., Computer Science"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Department</Form.Label>
                    <Form.Select 
                      name="department" 
                      value={newTranscript.department}
                      onChange={(e) => handleInputChange(e, setNewTranscript, newTranscript)}
                    >
                      <option value="">Select Department</option>
                      {departmentOptions.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
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
                    onClick={handleAddTranscript}
                    disabled={!newTranscript.degree || !newTranscript.college}
                  >
                    Add Transcript
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        <Accordion defaultActiveKey="0" className="education-accordion">
          {transcripts.map((transcript, index) => (
            <Accordion.Item eventKey={index.toString()} key={transcript.id} className="mb-3">
              <Accordion.Header>
                <div className="d-flex align-items-center w-100">
                  <div className="me-3">
                    <FaBook className="text-primary" />
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-0">{transcript.degree}</h6>
                    <small className="text-muted">{transcript.college} • {transcript.major}</small>
                  </div>
                  <Badge bg="secondary" className="me-2">
                    {transcript.courses.length} {transcript.courses.length === 1 ? 'Course' : 'Courses'}
                  </Badge>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <p className="mb-1"><strong>College/University:</strong> {transcript.college}</p>
                    <p className="mb-1"><strong>Major:</strong> {transcript.major}</p>
                    <p className="mb-0"><strong>Department:</strong> {transcript.department}</p>
                  </div>
                  {isEditing && (
                    <div>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleRemoveTranscript(transcript.id)}
                        className="me-2"
                      >
                        <FaTrash className="me-1" /> Remove
                      </Button>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => setActiveTranscriptId(activeTranscriptId === transcript.id ? null : transcript.id)}
                      >
                        <FaPlus className="me-1" /> Add Course
                      </Button>
                    </div>
                  )}
                </div>

                {activeTranscriptId === transcript.id && isEditing && (
                  <Card className="mb-3 border-primary">
                    <Card.Body>
                      <h6 className="mb-3">Add New Course</h6>
                      <Row>
                        <Col md={3} className="mb-2">
                          <Form.Control 
                            type="text" 
                            name="code" 
                            value={newCourse.code}
                            onChange={(e) => handleInputChange(e, setNewCourse, newCourse)}
                            placeholder="Course Code"
                          />
                        </Col>
                        <Col md={3} className="mb-2">
                          <Form.Control 
                            type="text" 
                            name="name" 
                            value={newCourse.name}
                            onChange={(e) => handleInputChange(e, setNewCourse, newCourse)}
                            placeholder="Course Name"
                          />
                        </Col>
                        <Col md={2} className="mb-2">
                          <Form.Control 
                            type="number" 
                            name="credits" 
                            value={newCourse.credits}
                            onChange={(e) => handleInputChange(e, setNewCourse, newCourse)}
                            placeholder="Credits"
                          />
                        </Col>
                        <Col md={3} className="mb-2">
                          <Form.Select 
                            name="department" 
                            value={newCourse.department}
                            onChange={(e) => handleInputChange(e, setNewCourse, newCourse)}
                          >
                            <option value="">Select Department</option>
                            {departmentOptions.map(dept => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </Form.Select>
                        </Col>
                        <Col md={1} className="mb-2 d-flex align-items-center">
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => handleAddCourse(transcript.id)}
                            disabled={!newCourse.code || !newCourse.name}
                          >
                            Add
                          </Button>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                )}

                {transcript.courses.length > 0 ? (
                  <div className="table-responsive">
                    <Table striped bordered hover size="sm">
                      <thead>
                        <tr>
                          <th>Course Code</th>
                          <th>Course Name</th>
                          <th>Credits</th>
                          <th>Department</th>
                          {isEditing && <th>Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {transcript.courses.map(course => (
                          <tr key={course.id}>
                            <td>{course.code}</td>
                            <td>{course.name}</td>
                            <td>{course.credits}</td>
                            <td>{course.department}</td>
                            {isEditing && (
                              <td>
                                <Button 
                                  variant="outline-danger" 
                                  size="sm"
                                  onClick={() => handleRemoveCourse(transcript.id, course.id)}
                                >
                                  <FaTrash />
                                </Button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <FaBook size={24} className="text-muted mb-2" />
                    <p className="text-muted mb-0">No courses added yet.</p>
                    {isEditing && (
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => setActiveTranscriptId(transcript.id)}
                      >
                        <FaPlus className="me-1" /> Add Course
                      </Button>
                    )}
                  </div>
                )}
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>

        {transcripts.length === 0 && (
          <div className="text-center py-4">
            <FaFileUpload size={32} className="text-muted mb-2" />
            <p className="text-muted">No transcripts added yet.</p>
            {isEditing && (
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => setShowAddForm(true)}
              >
                <FaPlus className="me-1" /> Add Transcript
              </Button>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default Transcript;
