import React, { useState, useMemo, useEffect } from 'react';
import { Modal, Button, Form, Badge, InputGroup, FormControl, Spinner } from 'react-bootstrap';
import { FiSearch, FiSend } from 'react-icons/fi';
import { jobService } from '../../services/jobService';

const JobSelectionModal = ({ show, onHide, onSelect, recruiterId }) => {
  const [selectedJob, setSelectedJob] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch jobs when modal opens
  useEffect(() => {
    if (show) {
      fetchJobs();
    }
  }, [show]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError('');
      const jobsData = await jobService.getMyJobs();
      setJobs(jobsData);
    } catch (error) {
      console.error('Error fetching jobs for selection:', error);
      setError('Failed to fetch jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter jobs based on search term
  const filteredJobs = useMemo(() => {
    if (!searchTerm) return jobs;
    const term = searchTerm.toLowerCase();
    return jobs.filter(job =>
      (job.title && job.title.toLowerCase().includes(term)) ||
      (job.location && job.location.toLowerCase().includes(term)) ||
      (job.status && job.status.toLowerCase().includes(term))
    );
  }, [jobs, searchTerm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedJob) return;

    const job = jobs.find(j => j.id.toString() === selectedJob);
    if (job) {
      onSelect(job);
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" className="job-selection-modal">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="h5 fw-bold">Select a Job</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="pt-1">
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading jobs...</span>
              </Spinner>
              <p className="mt-2 text-muted">Loading your jobs...</p>
            </div>
          ) : error ? (
            <div className="text-center py-4 text-danger">
              <p>{error}</p>
              <Button variant="outline-primary" onClick={fetchJobs}>
                Try Again
              </Button>
            </div>
          ) : (
            <div className="mb-4">
              <InputGroup className="mb-3">
                <InputGroup.Text className="bg-white">
                  <FiSearch className="text-muted" />
                </InputGroup.Text>
                <FormControl
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-start-0"
                />
              </InputGroup>

              <div className="job-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {filteredJobs.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    {jobs.length === 0 ? 'No jobs posted yet' : 'No jobs found matching your search'}
                  </div>
                ) : (
                  filteredJobs.map((job) => {
                    // Defensive checks
                    if (!job || !job.id) return null;

                    return (
                      <div
                        key={job.id}
                        className={`card mb-2 border-0 shadow-sm ${selectedJob === job.id ? 'border-primary border-2' : ''}`}
                        style={{
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          borderLeft: `4px solid ${job.status === 'open' ? '#198754' : job.status === 'paused' ? '#ffc107' : '#6c757d'}`
                        }}
                        onClick={() => setSelectedJob(job.id)}
                      >
                        <div className="card-body p-3">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 className="mb-1 fw-bold">{job.title || 'Untitled Job'}</h6>
                              <div className="d-flex align-items-center text-muted small mb-2">
                                <i className="bi bi-geo-alt me-1"></i>
                                <span>{job.location || 'Not specified'}</span>
                              </div>
                            </div>
                            <Badge
                              bg={job.status === 'open' ? 'success' : job.status === 'paused' ? 'warning' : 'secondary'}
                              className="text-uppercase"
                            >
                              {job.status || 'Unknown'}
                            </Badge>
                          </div>
                          <div className="d-flex justify-content-between align-items-center mt-2">
                            <div className="text-primary fw-medium">
                              {job.experience_years ? `${job.experience_years} years exp.` : 'Experience not specified'}
                            </div>
                            <div className="text-muted small">
                              <i className="bi bi-calendar3 me-1"></i>
                              {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'No deadline'}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button
            variant="outline-secondary"
            onClick={onHide}
            className="px-4"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={!selectedJob}
            className="px-4 d-flex align-items-center gap-2"
          >
            <FiSend />
            Send Invitation
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default JobSelectionModal;
