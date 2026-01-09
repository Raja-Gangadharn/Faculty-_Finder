import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Tab, Nav, Spinner, Alert, Button, Modal, Table } from 'react-bootstrap';
import "./recruiter.css";
import {
  FaUser, FaGraduationCap, FaFileAlt,
  FaUserTie, FaFilePdf, FaDownload, FaArrowLeft
} from 'react-icons/fa';
import JobSelectionModal from '../../components/recruiter/JobSelectionModal';
import recruiterService from '../../services/recruiterService';

// Default API configuration
const API_BASE_URL = (import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:8000/api').replace(/\/+$/, ''); // Remove trailing slashes

const FacultyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [faculty, setFaculty] = useState(null);
  const [showMarkConfirm, setShowMarkConfirm] = useState(false);
  const [showJobSelectModal, setShowJobSelectModal] = useState(false);
  const [isInviteSent, setIsInviteSent] = useState(false);
  const [isProfileMarked, setIsProfileMarked] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showCoursesModal, setShowCoursesModal] = useState(false);
  const [selectedDegree, setSelectedDegree] = useState(null);

  // Load current user data
  useEffect(() => {
    // In a real app, you would fetch the current user from your auth context or API
    const mockCurrentUser = {
      id: 'recruiter-123', // This would come from your auth system
      name: 'Recruiter Name',
      email: 'recruiter@example.com',
      role: 'recruiter'
    };
    setCurrentUser(mockCurrentUser);
  }, []);

  const handleJobSelect = async (selectedJob) => {
    try {
      // Here you would typically send the invite to the backend
      console.log('Sending invite with job:', selectedJob, 'to faculty:', id);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setIsInviteSent(true);
      setShowJobSelectModal(false);
    } catch (error) {
      console.error('Error sending invite:', error);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const data = await recruiterService.getFacultyDetails(id);
        if (!active) return;
        setFaculty(data);
        setError('');
      } catch (err) {
        if (!active) return;
        setError('Failed to load faculty details.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  const handleDownload = (fileUrl, fileName) => {
    // In a real app, this would initiate a download
    window.open(fileUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          {error}
        </Alert>
      </Container>
    );
  }

  if (!faculty) return null;

  const basic = faculty.basic_info || {};
  const education = faculty.education || {};
  const experience = faculty.experience || [];
  const degrees = (faculty.applicable_courses && faculty.applicable_courses.degrees) || [];
  const documents = faculty.documents || [];
  const openDegree = (deg) => {
    setSelectedDegree(deg);
    setShowCoursesModal(true);
  };

  return (
    <Container className="faculty-details-container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <a
          href="#"
          className="btn btn-outline-success text-decoration-none"
          onClick={(e) => {
            e.preventDefault();
            navigate(-1);
          }}
        >
          <FaArrowLeft className="me-1" /> Back to Results
        </a>
        <div className="d-flex gap-2">
          <Button
            variant="primary"
            className="me-2"
            onClick={() => setShowJobSelectModal(true)}
            disabled={isInviteSent}
          >
            {isInviteSent ? 'Invitation Sent' : 'Send Job Invite'}
          </Button>
          <button
            className={`btn ${isProfileMarked ? 'btn-danger' : 'btn-outline-danger'}`}
            onClick={() => isProfileMarked ? null : setShowMarkConfirm(true)}
            disabled={isProfileMarked}
          >
            {isProfileMarked ? 'Profile Marked' : 'Mark Profile'}
          </button>
        </div>
      </div>

      {/* Job Selection Modal */}
      <JobSelectionModal
        show={showJobSelectModal}
        onHide={() => setShowJobSelectModal(false)}
        onSelect={handleJobSelect}
        recruiterId={currentUser?.id}
      />

      {/* Mark Profile Confirmation Modal */}
      {showMarkConfirm && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Mark</h5>
                <button type="button" className="btn-close" onClick={() => setShowMarkConfirm(false)}></button>
              </div>
              <div className="modal-body">
                Are you sure you want to mark this faculty profile for further action?
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowMarkConfirm(false)}>Cancel</button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    setIsProfileMarked(true);
                    setShowMarkConfirm(false);
                    // Here you would typically make an API call to mark the profile
                  }}
                >
                  Yes, Mark Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Card className="shadow-sm mb-4 profile-header">
        <Card.Body className="p-4">
          <div className="d-flex align-items-center">
            {basic.profile_photo_url ? (
              <img src={basic.profile_photo_url} alt={basic.full_name || 'Faculty'} className="rounded-circle" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
            ) : (
              <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                {(basic.full_name || 'F').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="ms-4">
              <h2 className="mb-1">{basic.full_name || 'Faculty Member'}</h2>
              {Array.isArray(basic.departments) && basic.departments.length > 0 && (
                <div className="d-flex flex-wrap gap-2">
                  {basic.departments.map((d, idx) => (
                    <span key={idx} className="badge bg-primary">{d}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>

      <Tab.Container defaultActiveKey="basic">
        <Card className="shadow-sm">
          <Card.Header className="bg-white border-bottom-0">
            <Nav variant="tabs" className="border-0">
              <Nav.Item>
                <Nav.Link eventKey="basic" className="text-dark">
                  <FaUser className="me-2" /> Basic Info
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="education" className="text-dark">
                  <FaGraduationCap className="me-2" /> Education
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="experience" className="text-dark">
                  <FaUserTie className="me-2" /> Experience
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="courses" className="text-dark">
                  <FaFileAlt className="me-2" /> Applicable Course(s)
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="documents" className="text-dark">
                  <FaFileAlt className="me-2" /> Documents
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>

          <Card.Body>
            <Tab.Content>
              {/* Basic Information Tab */}
              <Tab.Pane eventKey="basic">
                <h4 className="mb-4">Basic Information</h4>
                <Row className="mb-3">
                  <Col md={6} className="mb-3">
                    <h6 className="text-muted">Full Name</h6>
                    <p>{basic.full_name || 'Not provided'}</p>
                  </Col>
                  <Col md={6} className="mb-3">
                    <h6 className="text-muted">Email</h6>
                    <p>{basic.email || 'Not provided'}</p>
                  </Col>
                  <Col md={6} className="mb-3">
                    <h6 className="text-muted">Phone</h6>
                    <p>{basic.phone || 'Not provided'}</p>
                  </Col>
                  <Col md={6} className="mb-3">
                    <h6 className="text-muted">Department</h6>
                    <p>{(basic.departments && basic.departments.length) ? basic.departments.join(', ') : 'Not specified'}</p>
                  </Col>
                  <Col md={6} className="mb-3">
                    <h6 className="text-muted">Work Preference</h6>
                    <p>{basic.work_preference || 'Not specified'}</p>
                  </Col>
                  <Col md={6} className="mb-3">
                    <h6 className="text-muted">Location</h6>
                    <p>{[basic.city, basic.state].filter(Boolean).join(', ') || 'Not specified'}</p>
                  </Col>
                </Row>
              </Tab.Pane>

              {/* Education Tab */}
              <Tab.Pane eventKey="education">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4>Education</h4>
                </div>
                {education?.educations?.length > 0 ? (
                  <div className="timeline">
                    {education.educations.map((edu, index) => (
                      <div key={index} className="timeline-item">
                        <div className="timeline-badge bg-primary"></div>
                        <div className="timeline-content p-3 mb-3 border rounded">
                          <h5>{edu.degree}</h5>
                          <p className="mb-1">{edu.institution}</p>
                          <p className="text-muted small mb-1">
                            {edu.start_year} - {edu.end_year || 'Present'}
                            {edu.gpa && ` • GPA: ${edu.gpa}`}
                          </p>
                          {edu.description && <p className="mb-0">{edu.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert variant="info">No education information provided.</Alert>
                )}
              </Tab.Pane>

              {/* Experience Tab */}
              <Tab.Pane eventKey="experience">
                <h4 className="mb-4">Work Experience</h4>
                {Array.isArray(experience) && experience.length > 0 ? (
                  <div className="timeline">
                    {experience.map((exp, index) => (
                      <div key={index} className="timeline-item">
                        <div className="timeline-badge bg-success"></div>
                        <div className="timeline-content p-3 mb-3 border rounded">
                          <div className="d-flex justify-content-between">
                            <h5 className="mb-1">{exp.position || exp.exp_type}</h5>
                            <span className="text-muted">
                              {exp.start_date} - {exp.end_date || 'Present'}
                            </span>
                          </div>
                          <p className="mb-1">{exp.institution_or_company}</p>
                          {exp.responsibilities && (
                            <div className="mt-2">
                              <h6>Responsibilities:</h6>
                              <p className="mb-0">{exp.responsibilities}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert variant="info">No work experience provided.</Alert>
                )}
              </Tab.Pane>

              {/* Applicable Course(s) Tab */}
              <Tab.Pane eventKey="courses">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="mb-0">Applicable Course(s)</h4>
                </div>
                {degrees.length === 0 ? (
                  <Alert variant="info">No transcript degrees found.</Alert>
                ) : (
                  <div className="table-responsive">
                    <Table hover className="align-middle">
                      <thead className="table-dark">
                        <tr>
                          <th>Degree Name</th>
                          <th>College Name</th>
                          <th>Degree</th>
                          <th>Major</th>
                          <th>Department</th>
                        </tr>
                      </thead>
                      <tbody>
                        {degrees.map((d) => (
                          <tr key={d.transcript_id} style={{ cursor: 'pointer' }} onClick={() => openDegree(d)}>
                            <td>{d.degree_name}</td>
                            <td>{d.college_name}</td>
                            <td>{d.degree}</td>
                            <td>{d.major}</td>
                            <td>{d.department}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Tab.Pane>

              {/* Documents Tab */}
              <Tab.Pane eventKey="documents"
              >
                <h4 className="mb-4">Documents</h4>
                {Array.isArray(documents) && documents.length > 0 ? (
                  <Row>
                    {documents.map((doc, index) => (
                      <Col md={6} key={index} className="mb-3">
                        <Card>
                          <Card.Body className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                              <FaFilePdf className="text-danger me-3" size={24} />
                              <div>
                                <h6 className="mb-0">{doc.name}</h6>
                                <small className="text-muted">
                                  {doc.doc_type} • {doc.size}
                                </small>
                              </div>
                            </div>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleDownload(doc.file, doc.name)}
                            >
                              <FaDownload className="me-1" /> Download
                            </Button>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Alert variant="info">No additional documents provided.</Alert>
                )}
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </Card>
      </Tab.Container>
      {/* Courses Modal */}
      <Modal show={showCoursesModal} onHide={() => setShowCoursesModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Course Details - {selectedDegree?.degree_name} {selectedDegree?.degree ? `(${selectedDegree.degree})` : ''}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDegree ? (
            <>
              <div className="mb-3">
                <strong>College:</strong> {selectedDegree.college_name || 'N/A'}<br />
                <strong>Major:</strong> {selectedDegree.major || 'N/A'}<br />
                <strong>Department:</strong> {selectedDegree.department || 'N/A'}
              </div>
              {Array.isArray(selectedDegree.courses) && selectedDegree.courses.length > 0 ? (
                <div className="table-responsive">
                  <Table bordered hover>
                    <thead>
                      <tr>
                        <th>Course Code</th>
                        <th>Course Name</th>
                        <th>Credit Hours</th>
                        <th>Department</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDegree.courses.map((c, idx) => (
                        <tr key={idx}>
                          <td>{c.code}</td>
                          <td>{c.name}</td>
                          <td>{c.credits}</td>
                          <td>{c.department}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <Alert variant="info">No courses found for this degree.</Alert>
              )}
            </>
          ) : (
            <Alert variant="info">No degree selected.</Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCoursesModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default FacultyDetails;
