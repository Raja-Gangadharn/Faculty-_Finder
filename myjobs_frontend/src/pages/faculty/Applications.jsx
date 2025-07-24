import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col, Badge, Button, Form } from 'react-bootstrap';
import { FaSearch, FaFilter, FaFileAlt, FaClock, FaCheckCircle, FaTimesCircle, FaExclamationCircle, FaExternalLinkAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { Briefcase } from 'react-bootstrap-icons';


// Mock data for applications
const mockApplications = [
  {
    id: 1,
    jobTitle: 'Assistant Professor - Computer Science',
    institution: 'Tech University',
    department: 'Computer Science',
    appliedDate: '2025-07-15',
    status: 'submitted',
    lastUpdated: '2025-07-15',
    referenceNumber: 'APP-2025-001'
  },
  {
    id: 2,
    jobTitle: 'Associate Professor - Data Science',
    institution: 'Data Science Institute',
    department: 'Data Science',
    appliedDate: '2025-07-10',
    status: 'under_review',
    lastUpdated: '2025-07-12',
    referenceNumber: 'APP-2025-002'
  },
  {
    id: 3,
    jobTitle: 'Professor - Artificial Intelligence',
    institution: 'AI Research Center',
    department: 'Computer Science',
    appliedDate: '2025-07-05',
    status: 'shortlisted',
    lastUpdated: '2025-07-18',
    referenceNumber: 'APP-2025-003'
  },
  {
    id: 4,
    jobTitle: 'Visiting Faculty - Cybersecurity',
    institution: 'Cyber Security College',
    department: 'Information Technology',
    appliedDate: '2025-06-28',
    status: 'rejected',
    lastUpdated: '2025-07-08',
    referenceNumber: 'APP-2025-004'
  },
];

const statusIcons = {
  submitted: <FaFileAlt className="text-primary me-1" />,
  under_review: <FaClock className="text-warning me-1" />,
  shortlisted: <FaCheckCircle className="text-success me-1" />,
  rejected: <FaTimesCircle className="text-danger me-1" />,
  other: <FaExclamationCircle className="text-info me-1" />
};

const statusLabels = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  shortlisted: 'Shortlisted',
  rejected: 'Not Selected',
  other: 'Other'
};

const statusBadgeVariants = {
  submitted: 'primary',
  under_review: 'warning',
  shortlisted: 'success',
  rejected: 'danger',
  other: 'info'
};

// Custom badge styles
const badgeStyles = {
  padding: '0.5rem 0.75rem',
  fontWeight: '500',
  fontSize: '0.825rem',
  borderRadius: '0.5rem',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  transition: 'all 0.2s ease-in-out',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const Applications = () => {
  const [applications, setApplications] = useState(mockApplications);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

    useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  

  return (
    <Container className="py-4">
      <h2 className="mb-4">My Applications</h2>
      
      {/* Search and Filter Bar */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={8}>
              <div className="position-relative">
                <Form.Control
                  type="text"
                  placeholder="Search by job title, institution, or reference number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="ps-5"
                />
                <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
              </div>
            </Col>
            <Col md={4} className="d-flex justify-content-end">
              <Button 
                variant="outline-secondary" 
                className="me-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter className="me-1" />
                {showFilters ? 'Hide Filters' : 'Filters'}
              </Button>
            </Col>
            
            {showFilters && (
              <Col xs={12}>
                <div className="border-top pt-3">
                  <h6 className="mb-3">Filter by Status</h6>
                  <div className="d-flex flex-wrap gap-2">
                    <Button 
                      variant={statusFilter === 'all' ? 'primary' : 'outline-secondary'} 
                      size="sm"
                      onClick={() => setStatusFilter('all')}
                    >
                      All Applications
                    </Button>
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <Button 
                        key={key}
                        variant={statusFilter === key ? statusBadgeVariants[key] : `outline-${statusBadgeVariants[key]}`}
                        size="sm"
                        onClick={() => setStatusFilter(key)}
                        className="d-flex align-items-center"
                      >
                        {statusIcons[key]}
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              </Col>
            )}
          </Row>
        </Card.Body>
      </Card>

      {/* Applications List */}
      {filteredApplications.length > 0 ? (
        <div className="applications-list">
          {filteredApplications.map((app) => (
            <Card key={app.id} className="mb-3 shadow-sm">
              <Card.Body>
                <Row className="align-items-center">
                  <Col md={8}>
                    <h6 className="mb-1 fw-semibold">
                      <Link to={`/faculty/jobs/${app.id}`} className="text-decoration-none text-dark">
                        {app.jobTitle} <FaExternalLinkAlt className="ms-1" size={12} />
                      </Link>
                    </h6>
                    <p className="mb-1 text-muted">
                      {app.institution} • {app.department}
                    </p>
                    <div className="d-flex align-items-center text-muted small">
                      <span className="me-3">
                        Applied: {formatDate(app.appliedDate)}
                      </span>
                      <span>
                        Ref: {app.referenceNumber}
                      </span>
                    </div>
                  </Col>
                  <Col md={4} className="text-md-end mt-3 mt-md-0">
                    <div className="d-flex flex-column align-items-md-end">
                      <Badge 
                        bg={statusBadgeVariants[app.status] || 'secondary'} 
                        className="mb-2 d-inline-flex align-items-center"
                        style={badgeStyles}
                      >
                        {statusIcons[app.status]}
                        <span className="ms-1">
                          {statusLabels[app.status] || app.status}
                        </span>
                      </Badge>
                      <div className="text-muted small">
                        Last updated: {formatDate(app.lastUpdated)}
                      </div>
                    </div>
                  </Col>
                </Row>
                
                <div className="mt-3 pt-3 border-top">
                  <div className="d-flex gap-2">
                  <Button
                   as={Link}
                   to={`/faculty/jobs/${app.id}`}
                   variant="outline-primary"
                   size="sm"
                 >
                   View Details
                 </Button>

                    {app.status === 'rejected' && (
                      <Button variant="outline-danger" size="sm" className="ms-auto">
                        Request Feedback
                      </Button>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-5">
          <Card.Body>
            <div className="py-4">
              <FaFileAlt className="text-muted mb-3" size={48} />
              <h5>No applications found</h5>
              <p className="text-muted">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'You have not applied to any jobs yet.'}
              </p>
              {(!searchTerm && statusFilter === 'all') && (
                <Button variant="primary" className="mt-2">
                  Browse Job Opportunities
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default Applications;
