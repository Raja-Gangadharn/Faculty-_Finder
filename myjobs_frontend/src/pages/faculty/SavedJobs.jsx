import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Pagination, Form, Button, Modal, Alert, Spinner } from 'react-bootstrap';
import { FaBookmark, FaRegSadTear, FaBolt, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import SavedJobCard from '../../components/faculty/SavedJobCard';
import { jobService } from '../../services/jobService';
import './styles/SavedJobs.css';

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState({}); // { jobId: { applied: boolean, method: 'manual'|'easy', appliedAt } }
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState('newest');
  const [showEasyApplyModal, setShowEasyApplyModal] = useState(false);
  const [showApplySuccess, setShowApplySuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const pageSize = 6;

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const savedJobsData = await jobService.getSavedJobs();
        setSavedJobs(savedJobsData);
      } catch (err) {
        setError(err.message || 'Failed to load saved jobs. Please try again.');
        console.error('Error fetching saved jobs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedJobs();
  }, []);

  const processedJobs = useMemo(() => {
    let filteredJobs = [...savedJobs];

    const now = new Date();
    if (sortOption === '7days') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filteredJobs = filteredJobs.filter(job => new Date(job.saved_at) >= weekAgo);
    } else if (sortOption === '15days') {
      const twoWeeksAgo = new Date(now);
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 15);
      filteredJobs = filteredJobs.filter(job => new Date(job.saved_at) >= twoWeeksAgo);
    }

    return filteredJobs.sort((a, b) => {
      if (sortOption === 'newest') {
        return new Date(b.saved_at) - new Date(a.saved_at);
      } else {
        return new Date(a.saved_at) - new Date(b.saved_at);
      }
    });
  }, [savedJobs, sortOption]);

  const totalPages = Math.ceil(processedJobs.length / pageSize);
  const currentJobs = processedJobs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleApply = (jobId, method = 'manual') => {
    if (!appliedJobs[jobId] || !appliedJobs[jobId].applied) {
      const updatedAppliedJobs = {
        ...appliedJobs,
        [jobId]: {
          applied: true,
          method,
          appliedAt: new Date().toISOString()
        }
      };
      setAppliedJobs(updatedAppliedJobs);
      localStorage.setItem('appliedJobs', JSON.stringify(updatedAppliedJobs));
      setShowApplySuccess(true);
      setTimeout(() => setShowApplySuccess(false), 3000);
    }
  };

  const handleEasyApply = () => {
    setShowEasyApplyModal(true);
  };

  const confirmEasyApply = () => {
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    const recentJobs = savedJobs.filter(job => new Date(job.saved_at) >= fifteenDaysAgo);

    const updatedAppliedJobs = { ...appliedJobs };
    const now = new Date().toISOString();

    recentJobs.forEach(job => {
      if (!updatedAppliedJobs[job.job_details.id] || !updatedAppliedJobs[job.job_details.id].applied) {
        updatedAppliedJobs[job.job_details.id] = {
          applied: true,
          method: 'easy',
          appliedAt: now
        };
      }
    });

    setAppliedJobs(updatedAppliedJobs);

    setShowEasyApplyModal(false);
    setShowApplySuccess(true);
    setTimeout(() => setShowApplySuccess(false), 3000);
  };

  const removeSavedJob = async (savedJobId, jobDetailsId) => {
    try {
      await jobService.unsaveJob(jobDetailsId);
      setSavedJobs(prev => prev.filter(job => job.id !== savedJobId));
      // optionally also remove from appliedJobs
      const updatedApplied = { ...appliedJobs };
      if (updatedApplied[jobDetailsId]) {
        delete updatedApplied[jobDetailsId];
        setAppliedJobs(updatedApplied);
      }
    } catch (err) {
      console.error('Error removing saved job:', err);
      alert(err.message || 'Failed to remove saved job. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading saved jobs...</span>
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
    <Container className="saved-jobs-container">
      <div className="saved-jobs-header">
        <div>
          <h2 className="mb-1">Saved Jobs</h2>
          <p className="text-muted mb-0">Your saved job opportunities</p>
        </div>
        {savedJobs.length > 0 && (
          <div className="saved-jobs-sort">
            <div className="d-flex align-items-center">
              <span className="me-2 text-muted">Sort by:</span>
              <Form.Select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="form-select-sm me-2"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="7days">Last 7 Days</option>
                <option value="15days">Last 15 Days</option>
              </Form.Select>
              <Button
                variant="outline-primary"
                onClick={handleEasyApply}
                className="easy-apply-btn"
              >
                <FaBolt className="me-1" />
                Easy Apply
              </Button>
            </div>
          </div>
        )}
      </div>

      {savedJobs.length === 0 ? (
        <div className="empty-state">
          <FaBookmark className="empty-state-icon" />
          <h4>No saved jobs yet</h4>
          <p className="text-muted">Save jobs from the Job Opportunities page to see them here</p>
          <Button
            variant="outline-primary"
            href="/faculty/jobs"
            className="mt-3 text-decoration-none"
          >
            Browse Job Opportunities
          </Button>
        </div>
      ) : (
        <>
          {processedJobs.length === 0 ? (
            <Alert variant="info" className="d-flex align-items-center">
              <FaRegSadTear className="me-2" size={20} />
              <div>
                No jobs match your current filter. Try adjusting your date range.
              </div>
            </Alert>
          ) : (
            <Row className="g-4 mb-4">
              {currentJobs.map((savedJob) => (
                <Col key={savedJob.id} xs={12} md={6} lg={4} className="mb-3">
                  <SavedJobCard
                    job={savedJob.job_details}
                    isApplied={appliedJobs[savedJob.job_details.id]?.applied || false}
                    applyMethod={appliedJobs[savedJob.job_details.id]?.method}
                    appliedAt={appliedJobs[savedJob.job_details.id]?.appliedAt}
                    onSaveToggle={(jobId) => removeSavedJob(savedJob.id, jobId)}
                    onApply={() => handleApply(savedJob.job_details.id)}
                  />
                </Col>
              ))}
            </Row>
          )}

          {totalPages > 1 && (
            <div className="d-flex justify-content-center">
              <Pagination>
                <Pagination.Prev
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
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
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Pagination.Item>
                  );
                })}
                <Pagination.Next
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                />
              </Pagination>
            </div>
          )}
        </>
      )}
      <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1100, marginTop: '70px' }}>
        <Alert
          variant="success"
          show={showApplySuccess}
          onClose={() => setShowApplySuccess(false)}
          dismissible
          className="shadow-lg"
          style={{
            minWidth: '300px',
            transition: 'all 0.3s ease-in-out',
            opacity: showApplySuccess ? 1 : 0,
            transform: showApplySuccess ? 'translateY(0)' : 'translateY(-20px)',
            pointerEvents: showApplySuccess ? 'auto' : 'none'
          }}
        >
          <div className="d-flex align-items-center">
            <FaCheckCircle className="me-2" size={20} />
            <div>
              <h6 className="mb-0 fw-bold">Success!</h6>
              <p className="mb-0">Your application was submitted successfully.</p>
            </div>
          </div>
        </Alert>
      </div>

      <Modal show={showEasyApplyModal} onHide={() => setShowEasyApplyModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="h5">Easy Apply Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          <div className="text-center mb-4">
            <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
              <FaBolt size={24} className="text-primary" />
            </div>
            <h5>Apply to Multiple Jobs</h5>
            <p className="text-muted mb-0">
              You're about to apply to all jobs saved within the last 15 days.
              This action will submit your application to {savedJobs.filter(job => {
                const fifteenDaysAgo = new Date();
                fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
                return new Date(job.saved_at) >= fifteenDaysAgo;
              }).length} position(s).
            </p>
          </div>

          <div className="alert alert-warning small">
            <strong>Note:</strong> Once submitted, these applications cannot be withdrawn.
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button
            variant="outline-secondary"
            onClick={() => setShowEasyApplyModal(false)}
            className="px-4"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={confirmEasyApply}
            className="px-4"
          >
            Confirm & Apply
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SavedJobs;
