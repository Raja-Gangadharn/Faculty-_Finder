import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Pagination, Alert, Form, Button, Spinner } from 'react-bootstrap';
import { FaSearch, FaExclamationCircle } from 'react-icons/fa';
import JobCard from '../../components/faculty/JobCard';
import { jobService } from '../../services/jobService';
import './styles/JobOpportunities.css';

const normalize = (str = '') => str.toString().toLowerCase().trim();

const JobOpportunities = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState('newest');
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [showSaveAlert, setShowSaveAlert] = useState(false);
  const [lastSavedJob, setLastSavedJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const pageSize = 6;

  /* Debounce search input to avoid filtering on every keystroke */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // When sort or debounced query changes reset to page 1
  useEffect(() => {
    setCurrentPage(1);
  }, [sortOption, debouncedQuery]);

  // Load saved jobs from localStorage on mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    setSavedJobs(saved);
  }, []);

  // Fetch jobs from API on component mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const jobsData = await jobService.getAllJobs();
        setJobs(jobsData);
      } catch (err) {
        setError(err.message || 'Failed to load jobs. Please try again.');
        console.error('Error fetching jobs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Check which jobs are saved
  useEffect(() => {
    const checkSavedJobs = async () => {
      try {
        const savedJobsData = await jobService.getSavedJobs();
        const savedJobIds = savedJobsData.map(savedJob => savedJob.job_details.id);
        setSavedJobs(savedJobIds);
      } catch (err) {
        console.error('Error fetching saved jobs:', err);
      }
    };

    if (jobs.length > 0) {
      checkSavedJobs();
    }
  }, [jobs]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSaveJob = async (job, shouldSave) => {
    try {
      if (shouldSave) {
        await jobService.saveJob(job.id);
        setSavedJobs(prev => [...prev, job.id]);
        setLastSavedJob(job);
        setShowSaveAlert(true);
        setTimeout(() => setShowSaveAlert(false), 3000);
      } else {
        await jobService.unsaveJob(job.id);
        setSavedJobs(prev => prev.filter(jobId => jobId !== job.id));
      }
    } catch (err) {
      console.error('Error saving/unsaving job:', err);
      // Show error message to user
      alert(err.message || 'Failed to save job. Please try again.');
    }
  };

  const isJobSaved = (jobId) => savedJobs.includes(jobId);

  const handleApply = (jobId) => {
    if (!appliedJobs.includes(jobId)) {
      setAppliedJobs(prev => [...prev, jobId]);
      alert('Application submitted successfully!');
    } else {
      alert('You have already applied to this position.');
    }
  };

  /* Search and sort logic:
     - Tokenizes the query ("can acad" => ["can","acad"])
     - Checks that every token exists in at least one searchable field (AND behavior)
     - Fields normalized to lowercase for case-insensitive match
  */
  const filteredJobs = useMemo(() => {
    let filtered = [...jobs];

    const q = normalize(debouncedQuery);
    const tokens = q ? q.split(/\s+/).filter(Boolean) : [];

    if (tokens.length) {
      filtered = filtered.filter(job => {
        if (!job) return false;

        // Include all searchable fields
        const searchableFields = [
          job.title || '',
          job.department || '',
          job.location || '',
          job.course || '',
          job.job_type || '',
          job.description || '',
          job.eligibility || '',
          job.skills_required || ''
        ].map(normalize);

        // For each token, require it to match at least one field (AND across tokens)
        return tokens.every(token =>
          searchableFields.some(field => field.includes(token))
        );
      });
    }

    // Sorting
    const sorted = [...filtered].sort((a, b) => {
      if (!a || !b) return 0;

      switch (sortOption) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'deadline':
          return new Date(a.deadline) - new Date(b.deadline);
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    return sorted;
  }, [sortOption, debouncedQuery, jobs]);

  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredJobs.slice(startIndex, startIndex + pageSize);
  }, [filteredJobs, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredJobs.length / pageSize);

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading jobs...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <div className="d-flex align-items-center">
            <FaExclamationCircle className="me-2" />
            {error}
          </div>
        </Alert>
        <div className="text-center mt-3">
          <Button variant="primary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="job-opportunities py-4">
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold mb-3">Find Your Opportunity Here!</h1>
        <p className="lead text-muted">Browse and apply to faculty positions from top institutions</p>

        <div className="search-container mx-auto mt-4" style={{ maxWidth: '800px' }}>
          <Form onSubmit={(e) => { e.preventDefault(); }}>
            <div className="d-flex flex-column flex-md-row gap-3">
              <div className="input-group flex-grow-1">
                <span className="input-group-text bg-white border-end-0">
                  <FaSearch className="text-muted my-2" />
                </span>
                <Form.Control
                  type="text"
                  placeholder="Search by job title, department, or location"
                  className="border-start-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button variant="primary" className="px-4" type="submit">Search</Button>
              </div>

              <div className="d-flex align-items-center">
                <div className="input-group" style={{ minWidth: '200px' }}>
                  <Form.Select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="form-select border-start-0"
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="deadline">Deadline</option>
                  </Form.Select>
                </div>
              </div>
            </div>
          </Form>
        </div>
      </div>

      <div>
        {showSaveAlert && lastSavedJob && (
          <Alert
            variant="success"
            className="d-flex align-items-center mb-4"
            onClose={() => setShowSaveAlert(false)}
            dismissible
          >
            <div className="d-flex align-items-center">
              <i className="bi bi-bookmark-check-fill me-2"></i>
              <span>Job saved: <strong>{lastSavedJob.title}</strong></span>
            </div>
            <Button
              variant="outline-success"
              size="sm"
              className="ms-5"
              onClick={() => {
                navigate('/faculty/saved-jobs');
                setShowSaveAlert(false);
              }}
            >
              View Saved
            </Button>
          </Alert>
        )}

        {filteredJobs.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-search text-muted" style={{ fontSize: '3rem', opacity: 0.5 }}></i>
            <h4 className="mt-3">No jobs found</h4>
            <p className="text-muted">Try adjusting your search criteria</p>
          </div>
        ) : (
          <Row className="g-4">
            {paginatedJobs.map((job) => (
              <Col key={job.id} xs={12}>
                <JobCard
                  job={job}
                  isSaved={isJobSaved(job.id)}
                  isApplied={appliedJobs.includes(job.id)}
                  onSaveToggle={handleSaveJob}
                  onApply={handleApply}
                />
              </Col>
            ))}
          </Row>
        )}

        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-5">
            <Pagination>
              <Pagination.Prev
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              />
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Pagination.Item
                    key={pageNum}
                    active={pageNum === currentPage}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Pagination.Item>
                );
              })}
              <Pagination.Next
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </div>
        )}
      </div>
    </Container>
  );
};

export default JobOpportunities;
