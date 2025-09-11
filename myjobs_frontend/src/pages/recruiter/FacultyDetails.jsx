import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Tab, Nav, Spinner, Alert, Button } from 'react-bootstrap';
import "./recruiter.css";
import { 
  FaUser, FaGraduationCap, FaFileAlt, FaCertificate, 
  FaUserTie, FaFilePdf, FaDownload, FaArrowLeft, FaEnvelope 
} from 'react-icons/fa';
import { BsEnvelopePlus } from 'react-icons/bs';

// Default API configuration
const API_BASE_URL = (import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:8000/api').replace(/\/+$/, ''); // Remove trailing slashes

const FacultyDetails = () => {
  const { facultyId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [faculty, setFaculty] = useState(null);
  const [showInviteConfirm, setShowInviteConfirm] = useState(false);
  const [showMarkConfirm, setShowMarkConfirm] = useState(false);
  const [isInviteSent, setIsInviteSent] = useState(false);
  const [isProfileMarked, setIsProfileMarked] = useState(false);
  const [inviteData, setInviteData] = useState({
    jobTitle: '',
    jobType: '',
    salary: '',
    salaryPeriod: 'year',
    location: '',
    description: '',
    message: ''
  });

  const handleInviteSubmit = () => {
    // Validate required fields
    if (!inviteData.jobTitle || !inviteData.jobType || !inviteData.location || !inviteData.description) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Here you would typically make an API call to send the invite
    console.log('Sending invitation with data:', {
      facultyId: facultyId,
      facultyName: faculty?.name,
      facultyEmail: faculty?.email,
      ...inviteData
    });
    
    setIsInviteSent(true);
    setShowInviteConfirm(false);
  };
  
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setInviteData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  useEffect(() => {
    // Mock faculty data
    const mockFaculty = {
      id: facultyId,
      name: 'Dr. John Smith',
      email: 'john.smith@example.com',
      phone: '+1 (555) 123-4567',
      department: 'Computer Science',
      designation: 'Associate Professor',
      experience: [
        { 
          position: 'Associate Professor', 
          organization: 'Current University',
          startDate: '2018',
          endDate: 'Present',
          description: 'Teaching advanced courses in Machine Learning and Data Science.'
        },
        { 
          position: 'Assistant Professor', 
          organization: 'Previous University',
          startDate: '2015',
          endDate: '2018',
          description: 'Conducted research in AI and published several papers.'
        }
      ],
      researchInterests: ['Machine Learning', 'Data Science', 'Artificial Intelligence'],
      education: [
        { degree: 'Ph.D', field: 'Computer Science', university: 'Stanford University', year: 2015 },
        { degree: 'M.Tech', field: 'Computer Science', university: 'IIT Bombay', year: 2010 },
        { degree: 'B.Tech', field: 'Computer Science', university: 'University of Delhi', year: 2008 }
      ],
      publications: [
        { title: 'Advanced Machine Learning Techniques', year: 2022, journal: 'Journal of AI Research' },
        { title: 'Deep Learning for Beginners', year: 2020, journal: 'International Conference on ML' }
      ],
      skills: ['Python', 'Machine Learning', 'Data Analysis', 'Deep Learning', 'Research'],
      resumeUrl: '#',
      transcriptsUrl: '#'
    };

    // Simulate API call with timeout
    const timer = setTimeout(() => {
      setFaculty(mockFaculty);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [facultyId]);

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
          <button 
            className={`btn ${isInviteSent ? 'btn-success' : 'btn-primary'}`}
            onClick={() => isInviteSent ? null : setShowInviteConfirm(true)}
            disabled={isInviteSent}
          >
            {isInviteSent ? (
              <><FaEnvelope className="me-1" /> Invite Sent</>
            ) : (
              <><BsEnvelopePlus className="me-1" /> Invite</>
            )}
          </button>
          <button 
            className={`btn ${isProfileMarked ? 'btn-danger' : 'btn-outline-danger'}`}
            onClick={() => isProfileMarked ? null : setShowMarkConfirm(true)}
            disabled={isProfileMarked}
          >
            {isProfileMarked ? 'Profile Marked' : 'Mark Profile'}
          </button>
        </div>
      </div>

      {/* Invite Confirmation Modal */}
      {showInviteConfirm && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Send Invitation</h5>
                <button type="button" className="btn-close" onClick={() => setShowInviteConfirm(false)}></button>
              </div>
              <div className="modal-body">
                <p className="mb-4">You're inviting <strong>{faculty?.name || 'this faculty member'}</strong> to apply for a position. Please fill in the job details below.</p>
                
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="jobTitle" className="form-label">Job Title <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" id="jobTitle" required />
                  </div>
                  
                  <div className="col-md-6">
                    <label htmlFor="jobType" className="form-label">Job Type <span className="text-danger">*</span></label>
                    <select className="form-select" id="jobType" required>
                      <option value="">Select job type</option>
                      <option value="full_time">Full Time</option>
                      <option value="part_time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="visiting">Visiting</option>
                    </select>
                  </div>
                  
                  <div className="col-md-6">
                    <label htmlFor="salary" className="form-label">Salary Range</label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input type="text" className="form-control" id="salary" placeholder="e.g. 80,000 - 100,000" />
                      <select className="form-select" style={{maxWidth: '100px'}}>
                        <option value="year">/year</option>
                        <option value="month">/month</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <label htmlFor="location" className="form-label">Location <span className="text-danger">*</span></label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="location" 
                      placeholder="e.g. New York, NY" 
                      required 
                    />
                  </div>
                  
                  <div className="col-12">
                    <label htmlFor="jobDescription" className="form-label">Job Description <span className="text-danger">*</span></label>
                    <textarea 
                      className="form-control" 
                      id="jobDescription" 
                      rows="4" 
                      placeholder="Enter detailed job description..." 
                      required
                    ></textarea>
                  </div>
                  
                  <div className="col-12">
                    <label htmlFor="message" className="form-label">Personal Message (Optional)</label>
                    <textarea 
                      className="form-control" 
                      id="message" 
                      rows="3" 
                      placeholder="Add a personal note to the faculty member..."
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowInviteConfirm(false)}>Cancel</button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleInviteSubmit}
                >
<BsEnvelopePlus className="me-1" /> Send Job Invitation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" 
                 style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
              {faculty.name ? faculty.name.charAt(0).toUpperCase() : 'F'}
            </div>
            <div className="ms-4">
              <h2 className="mb-1">{faculty.name || 'Faculty Member'}</h2>
              <p className="text-muted mb-2">{faculty.designation || 'Professor'}</p>
              <div className="d-flex flex-wrap gap-2">
                {faculty.department && (
                  <span className="badge bg-primary">{faculty.department}</span>
                )}
                {faculty.specialization && (
                  <span className="badge bg-secondary">{faculty.specialization}</span>
                )}
              </div>
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
                <Nav.Link eventKey="certificates" className="text-dark">
                  <FaCertificate className="me-2" /> Certificates
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
                    <p>{faculty.name || 'Not provided'}</p>
                  </Col>
                  <Col md={6} className="mb-3">
                    <h6 className="text-muted">Email</h6>
                    <p>{faculty.email || 'Not provided'}</p>
                  </Col>
                  <Col md={6} className="mb-3">
                    <h6 className="text-muted">Phone</h6>
                    <p>{faculty.phone || 'Not provided'}</p>
                  </Col>
                  <Col md={6} className="mb-3">
                    <h6 className="text-muted">Department</h6>
                    <p>{faculty.department || 'Not specified'}</p>
                  </Col>
                  <Col md={6} className="mb-3">
                    <h6 className="text-muted">Designation</h6>
                    <p>{faculty.designation || 'Not specified'}</p>
                  </Col>
                  <Col md={6} className="mb-3">
                    <h6 className="text-muted">Specialization</h6>
                    <p>{faculty.specialization || 'Not specified'}</p>
                  </Col>
                </Row>
              </Tab.Pane>

              {/* Education Tab */}
              <Tab.Pane eventKey="education">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4>Education</h4>
                  {faculty.transcript && (
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleDownload(faculty.transcript, 'transcript.pdf')}
                    >
                      <FaDownload className="me-2" /> Download Transcript
                    </Button>
                  )}
                </div>
                
                {faculty.education?.length > 0 ? (
                  <div className="timeline">
                    {faculty.education.map((edu, index) => (
                      <div key={index} className="timeline-item">
                        <div className="timeline-badge bg-primary"></div>
                        <div className="timeline-content p-3 mb-3 border rounded">
                          <h5>{edu.degree}</h5>
                          <p className="mb-1">{edu.institution}</p>
                          <p className="text-muted small mb-1">
                            {edu.startYear} - {edu.endYear || 'Present'}
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
                {faculty.experience?.length > 0 ? (
                  <div className="timeline">
                    {faculty.experience.map((exp, index) => (
                      <div key={index} className="timeline-item">
                        <div className="timeline-badge bg-success"></div>
                        <div className="timeline-content p-3 mb-3 border rounded">
                          <div className="d-flex justify-content-between">
                            <h5 className="mb-1">{exp.position}</h5>
                            <span className="text-muted">
                              {exp.startDate} - {exp.endDate || 'Present'}
                            </span>
                          </div>
                          <p className="mb-1">{exp.organization}</p>
                          {exp.description && (
                            <div className="mt-2">
                              <h6>Responsibilities:</h6>
                              <p className="mb-0">{exp.description}</p>
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

              {/* Certificates Tab */}
              <Tab.Pane eventKey="certificates">
                <h4 className="mb-4">Certifications</h4>
                {faculty.certificates?.length > 0 ? (
                  <Row>
                    {faculty.certificates.map((cert, index) => (
                      <Col md={6} key={index} className="mb-3">
                        <Card>
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h5 className="mb-1">{cert.name}</h5>
                                <p className="text-muted mb-1">{cert.issuingOrganization}</p>
                                <small className="text-muted">
                                  Issued: {cert.issueDate}
                                  {cert.expirationDate && ` • Expires: ${cert.expirationDate}`}
                                </small>
                              </div>
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => handleDownload(cert.certificateUrl, `${cert.name.replace(/\s+/g, '_')}.pdf`)}
                              >
                                <FaDownload />
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Alert variant="info">No certificates provided.</Alert>
                )}
              </Tab.Pane>

              {/* Documents Tab */}
              <Tab.Pane eventKey="documents">
                <h4 className="mb-4">Documents</h4>
                {faculty.documents?.length > 0 ? (
                  <Row>
                    {faculty.documents.map((doc, index) => (
                      <Col md={6} key={index} className="mb-3">
                        <Card>
                          <Card.Body className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                              <FaFilePdf className="text-danger me-3" size={24} />
                              <div>
                                <h6 className="mb-0">{doc.name}</h6>
                                <small className="text-muted">
                                  {doc.type} • {doc.size}
                                </small>
                              </div>
                            </div>
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => handleDownload(doc.url, doc.name)}
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
    </Container>
  );
};

export default FacultyDetails;
