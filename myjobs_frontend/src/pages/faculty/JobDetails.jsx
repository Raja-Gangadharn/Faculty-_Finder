import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import './styles/JobDetails.css';
import {
  ArrowLeft, Calendar, Clock, GeoAlt,
  CurrencyDollar, Briefcase, Book, FileText, ClockHistory
} from 'react-bootstrap-icons';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);

  // Fetch job details based on ID
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/jobs/${id}`);
        // const data = await response.json();

        // Mock data - replace with actual API call
        setTimeout(() => {
          const mockJob = {
            id: id,
            title: 'Assistant Professor – Computer Science',
            department: 'Computer Science',
            institution: 'Prestige University',
            job_type: 'Full Time',
            course: 'B.Tech, M.Tech, Ph.D',
            location: 'New York, USA',
            salary: '$80,000 - $100,000 per year',
            deadline: 'January 31, 2025',
            postedAt: '2024-12-01',
            description: 'We are seeking a highly motivated and enthusiastic individual to join our Computer Science department as an Assistant Professor. The successful candidate will be responsible for teaching undergraduate and graduate courses, conducting research, and contributing to departmental service.',
            responsibilities: [
              'Teach undergraduate and graduate courses in computer science',
              'Develop and maintain an active research program',
              'Advise and mentor students',
              'Participate in departmental and university service',
              'Publish research in peer-reviewed journals'
            ],
            requirements: [
              'Ph.D. in Computer Science or related field',
              'Strong record of research and publications',
              'Experience in teaching at the university level',
              'Excellent communication and interpersonal skills',
              'Ability to work collaboratively with faculty and students'
            ],
            benefits: [
              'Competitive salary and benefits package',
              'Health, dental, and vision insurance',
              'Retirement plan with employer matching',
              'Professional development opportunities',
              'Relocation assistance available'
            ]
          };
          setJob(mockJob);
          setLoading(false);
        }, 500);
      } catch (err) {
        setError('Failed to load job details. Please try again later.');
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  const handleApply = () => {
    // TODO: Implement apply functionality
    console.log('Applying for job:', id);
    setApplied(true);
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving job:', id);
    setSaved(!saved);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading job details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!job) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">
          <Alert.Heading>Job Not Found</Alert.Heading>
          <p>The job you are looking for does not exist or has been removed.</p>
          <Button as={Link} to="/faculty/jobs" variant="outline-warning">
            Back to Jobs
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Button
        variant="link"
        className="mb-3 px-0 d-flex align-items-center"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="me-2" /> Back to Jobs
      </Button>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h2 className="h4 mb-1">{job.title}</h2>
              <p className="text-muted mb-2">{job.institution} • {job.location}</p>
              <div className="d-flex flex-wrap gap-2 mb-3">
                <Badge bg="primary" className="d-flex align-items-center">
                  <Briefcase className="me-1" size={14} /> {job.job_type}
                </Badge>
                <Badge bg="secondary" className="d-flex align-items-center">
                  <Book className="me-1" size={14} /> {job.department}
                </Badge>
                <Badge bg="info" className="d-flex align-items-center">
                  <CurrencyDollar className="me-1" size={14} /> {job.salary}
                </Badge>
              </div>
            </div>
            <div className="d-flex gap-2">
              <Button
                variant={applied ? 'success' : 'primary'}
                onClick={handleApply}
                disabled={applied}
                className="d-flex align-items-center"
              >
                {applied ? 'Applied' : 'Apply Now'}
              </Button>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-4 text-muted mb-4">
            <div className="d-flex align-items-center">
              <Calendar className="me-2" />
              <span>Posted: {new Date(job.postedAt).toLocaleDateString()}</span>
            </div>
            <div className="d-flex align-items-center">
              <Clock className="me-2" />
              <span>Deadline: {job.deadline}</span>
            </div>
          </div>

          <div className="border-top pt-4 mt-3">
            <h5 className="mb-3">Job Description</h5>
            <p className="mb-4">{job.description}</p>

            <h5 className="mb-3">Key Responsibilities</h5>
            <ul className="mb-4">
              {job.responsibilities.map((item, index) => (
                <li key={index} className="mb-2">{item}</li>
              ))}
            </ul>

            <h5 className="mb-3">Requirements</h5>
            <ul className="mb-4">
              {job.requirements.map((item, index) => (
                <li key={index} className="mb-2">{item}</li>
              ))}
            </ul>

            <h5 className="mb-3">Benefits</h5>
            <ul className="mb-4">
              {job.benefits.map((item, index) => (
                <li key={index} className="mb-2">{item}</li>
              ))}
            </ul>

            <div className="d-flex flex-wrap gap-2 mt-4 pt-3 border-top">
              <Button variant="primary" onClick={handleApply} disabled={applied}>
                {applied ? 'Application Submitted' : 'Apply for this Position'}
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default JobDetails;
