import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, ProgressBar, Badge, Button, Container, Alert } from 'react-bootstrap';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLinkedin,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaBriefcase,
  FaEdit,
  FaDownload,
  FaCheckCircle,
  FaFileAlt,
  FaCalendarAlt,
  FaClock
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import facultyService from '../../services/facultyService';
import { formatDistanceToNow } from 'date-fns';

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const { firstName: authFirstName, lastName: authLastName, email: authEmail } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const [profileComplete, setProfileComplete] = useState(0);

  // Live data from API
  const [profile, setProfile] = useState(null);
  const [educations, setEducations] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [transcripts, setTranscripts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helpers
  const computeCompletion = (p, edus, exps, docs) => {
    const sections = 4;
    let done = 0;
    const basic = p && p.first_name && p.last_name;
    if (basic) done += 1;
    if (Array.isArray(edus) && edus.length > 0) done += 1;
    if (Array.isArray(exps) && exps.length > 0) done += 1;
    if ((Array.isArray(docs) && docs.length > 0) || p?.resume || p?.transcripts) done += 1;
    return Math.round((done / sections) * 100);
  };

  const fullName = useMemo(() => {
    if (profile) {
      const nm = [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim();
      if (nm) return nm;
    }
    const fallback = [authFirstName, authLastName].filter(Boolean).join(' ').trim();
    return fallback || 'Faculty Member';
  }, [profile, authFirstName, authLastName]);

  const initials = useMemo(() => fullName.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase(), [fullName]);

  const departmentName = useMemo(() => {
    if (Array.isArray(transcripts)) {
      const withDept = transcripts.find(t => t && (t.department_name || t.departmentName));
      if (withDept) return withDept.department_name || withDept.departmentName;
    }
    if (Array.isArray(educations) && educations.length) {
      const e = educations.find(e => e?.specialization) || educations.find(e => e?.program) || educations[0];
      return e?.specialization || e?.program || e?.degree || null;
    }
    return null;
  }, [transcripts, educations]);

  const lastLoginRelative = useMemo(() => {
    const ll = profile?.user?.last_login;
    if (!ll) return null;
    const dt = new Date(ll);
    if (isNaN(dt)) return null;
    return formatDistanceToNow(dt, { addSuffix: true });
  }, [profile]);

  // Fetch dashboard data
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const [p, edus, exps, docs, trans] = await Promise.all([
          facultyService.getFacultyProfile(),
          facultyService.getEducations(),
          facultyService.getExperiences(),
          facultyService.getDocuments(),
          facultyService.getTranscripts(),
        ]);

        if (!isMounted) return;

        // Normalize arrays from different response shapes
        const normEdus = Array.isArray(edus)
          ? edus
          : (Array.isArray(edus?.data) ? edus.data : (edus?.results || []));
        const normExps = Array.isArray(exps)
          ? exps
          : (Array.isArray(exps?.data) ? exps.data : (exps?.results || []));
        const normDocs = Array.isArray(docs)
          ? docs
          : (Array.isArray(docs?.data) ? docs.data : (docs?.results || []));
        const normTrans = Array.isArray(trans)
          ? trans
          : (Array.isArray(trans?.data) ? trans.data : (trans?.results || []));

        setProfile(p || null);
        setEducations(normEdus);
        setExperiences(normExps);
        setDocuments(normDocs);
        setTranscripts(normTrans);
        setProfileComplete(computeCompletion(p, normEdus, normExps, normDocs));
      } catch (e) {
        // keep defaults if any request fails
        setProfileComplete(0);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  // Recent activities
  const recentActivities = [
    { id: 1, title: 'Profile Updated', description: 'Updated contact information', time: '2 hours ago', icon: <FaUser className="text-primary" /> },
    { id: 2, title: 'New Job Alert', description: 'AI Research Position at Tech University', time: '1 day ago', icon: <FaBriefcase className="text-success" /> },
    { id: 3, title: 'Qualification Added', description: 'Added new certification in Machine Learning', time: '3 days ago', icon: <FaGraduationCap className="text-info" /> },
  ];

  // Quick stats
  // TODO: Replace mocked metrics with recruiter-dependent analytics in future phases
  const quickStats = [
    { title: 'Profile Views', value: '245', change: '+12%', trend: 'up' },
    { title: 'Applications', value: '18', change: '+3', trend: 'up' },
    { title: 'Interviews', value: '5', change: '+2', trend: 'up' },
    { title: 'Offers', value: '2', change: '0', trend: 'neutral' },
  ];

  const handleEditProfile = () => {
    navigate("/faculty/profile/edit");
  };

  const handleDownloadCV = () => {
    if (profile?.resume) {
      window.open(profile.resume, '_blank');
    } else {
      alert('No CV uploaded');
    }
  };

  const handleVerifyProfile = () => {
    setIsVerified(true);
    // In a real app, this would trigger verification process
  };

  return (
    <Container fluid className="p-4">
      {/* Welcome Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Welcome back, {fullName || 'Faculty'}!</h2>
          <p className="text-muted mb-0">
            <FaClock className="me-2" /> Last login: {lastLoginRelative || '—'}
          </p>
        </div>
        <div>
          <Button variant="outline-primary" className="me-2" onClick={handleEditProfile}>
            <FaEdit className="me-2" /> Edit Profile
          </Button>
          <Button variant="primary" onClick={handleDownloadCV}>
            <FaDownload className="me-2" /> Download CV
          </Button>
        </div>
      </div>

      {/* Profile Completion */}
      <Row className="mb-4">
        <Col md={8}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Profile Completion</h5>
                <Badge bg={profileComplete === 100 ? 'success' : 'warning'}>
                  {profileComplete}% Complete
                </Badge>
              </div>
              <ProgressBar now={profileComplete} className="mb-3" style={{ height: '10px' }} />
              <p className="text-muted small mb-0">
                {profileComplete === 100
                  ? 'Great job! Your profile is complete.'
                  : `Complete your profile to increase your visibility to recruiters. ${100 - profileComplete}% remaining.`
                }
              </p>
              {profileComplete < 100 && (
                <Button variant="link" size="sm" className="mt-2 p-0" onClick={handleEditProfile}>
                  Complete your profile
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="d-flex flex-column justify-content-center">
              <div className="text-center mb-3">
                <div className="position-relative d-inline-block">
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                    style={{ width: '80px', height: '80px', fontSize: '2rem' }}
                  >
                    {initials}
                  </div>
                  {isVerified && (
                    <div className="position-absolute bottom-0 end-0 bg-success rounded-circle p-1 border border-2 border-white">
                      <FaCheckCircle className="text-white" />
                    </div>
                  )}
                </div>
              </div>
              <div className="text-center">
                <h5 className="mb-1">{fullName}</h5>
                <p className="text-muted mb-2">{departmentName || ''}</p>
                {!isVerified && (
                  <Button
                    variant="outline-success"
                    size="sm"
                    className="mb-2"
                    onClick={handleVerifyProfile}
                  >
                    Verify Profile
                  </Button>
                )}
                <div className="d-flex justify-content-center gap-2">
                  <Button variant="outline-secondary" size="sm">
                    <FaEnvelope />
                  </Button>
                  <Button variant="outline-primary" size="sm">
                    <FaLinkedin />
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Stats */}
      <Row className="mb-4">
        {quickStats.map((stat, index) => (
          <Col key={index} md={3} className="mb-3 mb-md-0">
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">{stat.title}</h6>
                    <h3 className="mb-0">{stat.value}</h3>
                  </div>
                  <div className={`trend-indicator ${stat.trend || 'neutral'}`}>
                    {stat.trend === 'up' ? '↑' : stat.trend === 'down' ? '↓' : '→'}
                  </div>
                </div>
                <div className={`mt-2 trend-text ${stat.trend || 'neutral'}`}>
                  {stat.change} {stat.trend === 'up' ? 'from last month' : stat.trend === 'down' ? 'from last month' : 'no change'}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>


      <Row className="mb-4">
        <Col>
          <h2 className="mb-0">Dashboard</h2>
          <p className="text-muted">Welcome back, {fullName}!</p>
        </Col>
        <Col className="text-end">
          <Button variant="primary" onClick={handleEditProfile}>
            <FaEdit className="me-2" /> Edit Profile
          </Button>
        </Col>
      </Row>

      {/* Profile Completion Alert */}
      {profileComplete < 100 && (
        <Alert variant="warning" className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Alert.Heading>Complete your profile!</Alert.Heading>
              <p className="mb-0">Your profile is {profileComplete}% complete. Complete your profile to increase your visibility to recruiters.</p>
            </div>
            <Button variant="outline-warning" size="sm" onClick={handleEditProfile}>
              Complete Now
            </Button>
          </div>
          <div className="progress mt-2" style={{ height: '6px' }}>
            <div
              className="progress-bar bg-warning"
              role="progressbar"
              style={{ width: `${profileComplete}%` }}
              aria-valuenow={profileComplete}
              aria-valuemin="0"
              aria-valuemax="100">
            </div>
          </div>
        </Alert>
      )}

      <Row className="g-4">
        {/* Main Profile Card */}
        <Col lg={8}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <div className="d-flex align-items-center mb-2">
                    <h4 className="mb-0 me-2">{fullName}</h4>
                    {isVerified && (
                      <Badge bg="success" className="ms-2">
                        <FaCheckCircle className="me-1" /> Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted mb-2">{departmentName ? `${departmentName} Department` : ''}</p>
                  <div className="d-flex flex-wrap gap-2">
                    {(educations.find(e => e?.specialization) ? (
                      <Badge bg="light" text="dark" className="border">
                        {educations.find(e => e?.specialization)?.specialization}
                      </Badge>
                    ) : null)
                    }
                    {(experiences && experiences.length > 0) ? (
                      <Badge bg="light" text="dark" className="border">
                        {`${experiences.length} ${experiences.length === 1 ? 'Role' : 'Roles'}`}
                      </Badge>
                    ) : null
                    }
                  </div>
                </div>
                <div className="text-end">
                  <Button variant="outline-secondary" size="sm" onClick={handleDownloadCV}>
                    <FaDownload className="me-1" /> Download CV
                  </Button>
                </div>
              </div>

              <div className="border-top pt-3 mt-2">
                <h5 className="mb-3">Contact Information</h5>
                <Row className="g-3">
                  <Col md={6}>
                    <div className="d-flex align-items-center mb-2">
                      <FaEnvelope className="text-muted me-2" />
                      <span>{profile?.user?.email || authEmail}</span>
                    </div>
                  </Col>
                  {profile?.phone && (
                    <Col md={6}>
                      <div className="d-flex align-items-center mb-2">
                        <FaPhone className="text-muted me-2" />
                        <span>{profile.phone}</span>
                      </div>
                    </Col>
                  )}
                  {profile?.linkedin && (
                    <Col md={6}>
                      <div className="d-flex align-items-center mb-2">
                        <FaLinkedin className="text-muted me-2" />
                        <a href={`https://${profile.linkedin}`} target="_blank" rel="noopener noreferrer">
                          {profile.linkedin}
                        </a>
                      </div>
                    </Col>
                  )}
                  {(profile?.city || profile?.state) && (
                    <Col md={6}>
                      <div className="d-flex align-items-center mb-2">
                        <FaMapMarkerAlt className="text-muted me-2" />
                        <span>
                          {[profile?.city, profile?.state].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    </Col>
                  )}
                  {Array.isArray(profile?.work_preference) && profile.work_preference.length > 0 && (
                    <Col md={12}>
                      <div className="d-flex align-items-center">
                        <FaUser className="text-muted me-2" />
                        <span>Work Preference: {profile.work_preference.join(', ')}</span>
                      </div>
                    </Col>
                  )}
                </Row>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Quick Stats */}
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Body>
              <h5 className="card-title">Profile Status</h5>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Profile Strength</span>
                <strong>{profileComplete}%</strong>
              </div>
              <div className="progress mb-4" style={{ height: '8px' }}>
                <div
                  className="progress-bar bg-success"
                  role="progressbar"
                  style={{ width: `${profileComplete}%` }}
                  aria-valuenow={profileComplete}
                  aria-valuemin="0"
                  aria-valuemax="100">
                </div>
              </div>

              <div className="d-grid gap-2">
                <Button variant="outline-primary" onClick={() => navigate('/faculty/profile/edit')}>
                  Edit Profile
                </Button>
                <Button variant="outline-secondary" onClick={() => navigate('/faculty/profile/edit?tab=education')}>
                  Update Qualifications
                </Button>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h5 className="card-title">Quick Actions</h5>
              <div className="list-group list-group-flush">
                <button
                  className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                  onClick={() => navigate('/faculty/jobs')}
                >
                  Browse Jobs
                  <span className="badge bg-primary rounded-pill">12</span>
                </button>
                <button
                  className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                  onClick={() => navigate('/faculty/applications')}
                >
                  My Applications
                  <span className="badge bg-primary rounded-pill">3</span>
                </button>
                <button
                  className="list-group-item list-group-item-action"
                >
                  Account Settings
                </button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity Section */}
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Recent Activity</h5>
                <Button variant="link" size="sm" className="p-0">View All</Button>
              </div>
              <div className="list-group list-group-flush">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="list-group-item border-0 px-0 py-3">
                    <div className="d-flex">
                      <div className="me-3">
                        <div className="bg-light rounded-circle p-2">
                          {activity.icon}
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center">
                          <h6 className="mb-1">{activity.title}</h6>
                          <small className="text-muted">{activity.time}</small>
                        </div>
                        <p className="mb-0 text-muted small">{activity.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FacultyDashboard;
