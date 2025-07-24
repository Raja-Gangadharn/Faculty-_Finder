import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Table, Badge, Button, ProgressBar } from "react-bootstrap";
import { 
  FaSearch, 
  FaBookmark, 
  FaUsers, 
  FaEnvelope, 
  FaCalendarAlt, 
  FaBell, 
  FaChartLine,
  FaPlus,
  FaArrowRight,
  FaCheckCircle
} from "react-icons/fa";
import { getUserRole } from "../../services/authService";
import "./recruiter.css";
import { useAuth } from "../../context/AuthContext";

// Recruiter dashboard statistics
const statsData = [
  { id: 1, title: "Active Job Postings", value: "24", icon: <FaSearch className="text-primary" />, trend: "+3.5%" },
  { id: 2, title: "Total Applications", value: "189", icon: <FaBookmark className="text-warning" />, trend: "+15.2%" },
  { id: 3, title: "Candidates in Pipeline", value: "42", icon: <FaUsers className="text-success" />, trend: "+8.1%" },
  { id: 4, title: "Unread Messages", value: "7", icon: <FaEnvelope className="text-info" />, trend: "-2.3%" }
];

const upcomingInterviews = [
  { 
    id: 1, 
    candidate: "John Smith", 
    position: "Senior Software Engineer",
    date: "2025-07-17",
    time: "10:00 AM - 11:00 AM",
    type: "Technical Interview",
    status: "Confirmed",
    statusVariant: "success"
  },
  { 
    id: 2, 
    candidate: "Emily Chen", 
    position: "Data Scientist",
    date: "2025-07-17",
    time: "02:30 PM - 03:15 PM",
    type: "HR Interview",
    status: "Pending Confirmation",
    statusVariant: "warning"
  },
  { 
    id: 3, 
    candidate: "Michael Johnson", 
    position: "Product Manager",
    date: "2025-07-18",
    time: "11:00 AM - 12:00 PM",
    type: "Panel Interview",
    status: "Scheduled",
    statusVariant: "info"
  },
  { 
    id: 4, 
    candidate: "Sarah Williams", 
    position: "UX Designer",
    date: "2025-07-19",
    time: "09:30 AM - 10:30 AM",
    type: "Portfolio Review",
    status: "Confirmed",
    statusVariant: "success"
  }
];

const recentActivities = [
  { id: 1, title: "New Application", description: "Alex Johnson applied for Senior Developer position", time: "10 min ago", type: "application" },
  { id: 2, title: "Interview Scheduled", description: "Technical interview with Sarah Williams at 2:30 PM", time: "1 hour ago", type: "interview" },
  { id: 3, title: "New Message", description: "You have a new message from hiring manager", time: "2 hours ago", type: "message" },
  { id: 4, title: "Job Posted", description: "Your job posting for Frontend Developer is now live", time: "5 hours ago", type: "job" },
  { id: 5, title: "Candidate Update", description: "Michael Brown accepted your offer", time: "1 day ago", type: "update" }
];

const topCandidates = [
  { id: 1, name: "David Kim", title: "Full Stack Developer", location: "Remote", skills: ["React", "Node.js", "AWS"], match: 96 },
  { id: 2, name: "Priya Patel", title: "Data Engineer", location: "Bangalore, IN", skills: ["Python", "Spark", "Big Data"], match: 94 },
  { id: 3, name: "James Wilson", title: "DevOps Engineer", location: "London, UK", skills: ["Docker", "Kubernetes", "CI/CD"], match: 91 },
  { id: 4, name: "Maria Garcia", title: "Mobile Developer", location: "Barcelona, ES", skills: ["React Native", "iOS", "Android"], match: 89 }
];



const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const { firstName, lastName, isVerified } = useAuth();
  const recruiterName = (firstName || lastName) ? `${firstName} ${lastName}` : "Recruiter";
  const [profileComplete] = useState(70);

  useEffect(() => {
    const { isAuthenticated, isRecruiter } = getUserRole();
    if (!isAuthenticated || !isRecruiter) {
      navigate("/recruiter/login");
    }
  }, [navigate]);

  const getActivityIcon = (type) => {
    switch (type) {
      case "application":
        return <FaUsers className="text-success" />;
      case "view":
        return <FaSearch className="text-primary" />;
      case "message":
        return <FaEnvelope className="text-info" />;
      case "job":
        return <FaBookmark className="text-warning" />;
      default:
        return <FaBell className="text-secondary" />;
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Welcome to faculty finder</h2>
          <p className="text-muted mb-0">Welcome back! Here's what's happening with your recruitment.</p>
        </div>
        <div>
          <Link to="/recruiter/post-job" variant="success" className="me-2 btn btn-success text-decoration-none">
            <FaPlus className="me-2" /> Post New Job
          </Link>
          <Link to="#" variant="outline-secondary" className="btn btn-outline-secondary text-decoration-none">
            <FaChartLine className="me-2" /> View Reports
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        {statsData.map((stat) => (
          <Col key={stat.id} xs={12} sm={6} xl={3} className="mb-4 mb-xl-0">
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-uppercase text-muted mb-2">{stat.title}</h6>
                    <h2 className="mb-0">{stat.value}</h2>
                    <small className={`d-flex align-items-center ${stat.trend.startsWith('+') ? 'text-success' : 'text-danger'}`}>
                      {stat.trend} <FaArrowRight className="ms-1" size={10} />
                    </small>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded">
                    {stat.icon}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Profile Completion & Recruiter Info */}
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
                  ? 'Great! Your company profile is fully set up.'
                  : `Complete your profile to attract more candidates. ${100 - profileComplete}% remaining.`}
              </p>
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
                    {recruiterName.split(' ').map(n => n[0]).join('')}
                  </div>
                  {isVerified && (
                    <div className="position-absolute bottom-0 end-0 bg-success rounded-circle p-1 border border-2 border-white">
                      <FaCheckCircle className="text-white" />
                    </div>
                  )}
                </div>
              </div>
              <div className="text-center">
                <h5 className="mb-1">{recruiterName}</h5>
                <p className="text-muted mb-2">Recruiter</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Recent Activities */}
        <Col lg={8} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-white border-bottom-0 pb-0">
              <h5 className="mb-0">Recent Activities</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="list-group list-group-flush">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="list-group-item border-0 py-3 px-4">
                    <div className="d-flex">
                      <div className="me-3">
                        <div className="icon-md bg-light rounded-circle d-flex align-items-center justify-content-center">
                          {getActivityIcon(activity.type)}
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center">
                          <h6 className="mb-0">{activity.title}</h6>
                          <small className="text-muted">{activity.time}</small>
                        </div>
                        <p className="mb-0 text-muted small">{activity.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
            <Card.Footer className="bg-white border-top-0 pt-0">
              <Button variant="link" className="text-decoration-none p-0">
                View All Activities <FaArrowRight className="ms-1" size={12} />
              </Button>
            </Card.Footer>
          </Card>
        </Col>

        {/* Top Candidates */}
        <Col lg={4}>
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-white border-bottom-0 pb-0">
              <h5 className="mb-0">Top Candidates</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="list-group list-group-flush">
                {topCandidates.map((candidate) => (
                  <div key={candidate.id} className="list-group-item border-0 py-3 px-4">
                    <div className="d-flex align-items-center">
                      <div className="avatar-md bg-light rounded-circle d-flex align-items-center justify-content-center me-3">
                        {candidate.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center">
                          <h6 className="mb-0">{candidate.name}</h6>
                          <Badge bg="success" className="rounded-pill">{candidate.match}% Match</Badge>
                        </div>
                        <p className="mb-1 small text-muted">{candidate.title}</p>
                        <div className="d-flex flex-wrap gap-1">
                          {candidate.skills.map((skill, i) => (
                            <Badge key={i} bg="light" text="dark" className="fw-normal">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
            <Card.Footer className="bg-white border-top-0 pt-0">
              <Button variant="link" className="text-decoration-none p-0">
                View All Candidates <FaArrowRight className="ms-1" size={12} />
              </Button>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      {/* Upcoming Interviews */}
      <Row className="mt-4">
        <Col xs={12}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white border-bottom-0 pb-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Upcoming Interviews</h5>
                <div className="d-flex align-items-center">
                  <Badge bg="light" text="dark" className="rounded-pill me-2">
                    <FaCalendarAlt className="me-1" /> This Week
                  </Badge>
                  <Button variant="outline-primary" size="sm">
                    <FaPlus className="me-1" /> Schedule New
                  </Button>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table hover className="align-middle">
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Position</th>
                      <th>Date & Time</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingInterviews.map((interview) => (
                      <tr key={interview.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar-sm me-2">
                              <div className="avatar-title rounded bg-soft-primary text-primary">
                                {interview.candidate.split(' ').map(n => n[0]).join('')}
                              </div>
                            </div>
                            <div>
                              <h6 className="mb-0">{interview.candidate}</h6>
                              <small className="text-muted">{interview.position}</small>
                            </div>
                          </div>
                        </td>
                        <td>{interview.position}</td>
                        <td>
                          <div>{interview.date}</div>
                          <small className="text-muted">{interview.time}</small>
                        </td>
                        <td><Badge bg="light" text="dark">{interview.type}</Badge></td>
                        <td><Badge bg={interview.statusVariant}>{interview.status}</Badge></td>
                        <td>
                          <Button variant="link" size="sm" className="p-0" title="View Details">
                            <FaArrowRight className="text-muted" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
export default RecruiterDashboard;
