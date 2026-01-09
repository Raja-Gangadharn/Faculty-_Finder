import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { Card, Form, Button, Row, Col, Table, Alert, Badge, Dropdown, Spinner } from 'react-bootstrap';
import { FaPlusCircle, FaTrash, FaBriefcase, FaMapMarkerAlt, FaMoneyBillWave, FaCalendarAlt, FaEllipsisV, FaBuilding } from 'react-icons/fa';
import { BsCardChecklist } from 'react-icons/bs';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { jobService } from '../../services/jobService';
import './recruiter.css';


const PostJob = () => {
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    description: '',
    location: '',
    job_type: 'onsite',
    experience: '',
    course: '',
    eligibility: '',
    skills: '',
    deadline: '',
    pdf: null,
  });

  const [dropdownOpen, setDropdownOpen] = useState({});

  const toggleDropdown = (jobId, isOpen) => {
    setDropdownOpen(prev => ({
      ...prev,
      [jobId]: isOpen
    }));
  };

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingJobs, setFetchingJobs] = useState(true);
  const [validated, setValidated] = useState(false);
  const [showAlert, setShowAlert] = useState({ show: false, message: '', variant: 'success' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);

  const { user } = useAuth();

  // Fetch jobs on component mount
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setFetchingJobs(true);
      const jobsData = await jobService.getMyJobs();
      console.log('Fetched jobs data:', jobsData); // Debug log
      setJobs(jobsData);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setShowAlert({
        show: true,
        message: 'Failed to fetch jobs. Please try again.',
        variant: 'danger'
      });
    } finally {
      setFetchingJobs(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      await jobService.updateJobStatus(jobId, newStatus);

      // Update local state
      setJobs(jobs.map(job =>
        job.id === jobId ? { ...job, status: newStatus } : job
      ));

      // Close the dropdown after selection
      toggleDropdown(jobId, false);

      setShowAlert({
        show: true,
        message: `Job status updated to ${newStatus}`,
        variant: 'success'
      });
      setTimeout(() => setShowAlert({ ...showAlert, show: false }), 3000);
    } catch (error) {
      console.error('Error updating job status:', error);
      setShowAlert({
        show: true,
        message: 'Failed to update job status. Please try again.',
        variant: 'danger'
      });
    }
  };

  const getStatusBadgeVariant = (status) => {
    if (!status) return 'light';
    switch (status) {
      case 'open':
        return 'success';
      case 'paused':
        return 'warning';
      case 'closed':
        return 'secondary';
      default:
        return 'light';
    }
  };

  const getStatusDisplayText = (status) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      setLoading(true);

      // Prepare job data for API
      const jobData = {
        title: formData.title,
        department: formData.department,
        description: formData.description,
        location: formData.location,
        job_type: formData.job_type,
        experience_years: parseInt(formData.experience) || 0,
        course: formData.course,
        eligibility: formData.eligibility,
        skills_required: formData.skills,
        deadline: formData.deadline,
        pdf_document: formData.pdf,
      };

      const newJob = await jobService.createJob(jobData);

      // Add new job to the beginning of the list
      setJobs((prev) => [newJob, ...prev]);

      // Reset form
      setFormData({
        title: '',
        department: '',
        description: '',
        location: '',
        job_type: 'onsite',
        experience: '',
        course: '',
        eligibility: '',
        skills: '',
        deadline: '',
        pdf: null,
      });

      setValidated(false);
      setShowAlert({
        show: true,
        message: 'Job posted successfully!',
        variant: 'success'
      });
      setTimeout(() => setShowAlert({ ...showAlert, show: false }), 3000);
    } catch (error) {
      console.error('Error creating job:', error);
      setShowAlert({
        show: true,
        message: error.message || 'Failed to post job. Please try again.',
        variant: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const todayISO = new Date().toISOString().split('T')[0];

  const getStatus = (deadline) => {
    if (!deadline) return 'Live';
    return new Date(deadline) >= new Date() ? 'Live' : 'Expired';
  };

  const handleDeleteClick = (jobId) => {
    setJobToDelete(jobId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await jobService.deleteJob(jobToDelete);
      setJobs(jobs.filter(job => job.id !== jobToDelete));
      setShowDeleteConfirm(false);
      setShowAlert({
        show: true,
        message: 'Job deleted successfully!',
        variant: 'success'
      });
      setTimeout(() => setShowAlert({ ...showAlert, show: false }), 3000);
    } catch (error) {
      console.error('Error deleting job:', error);
      setShowAlert({
        show: true,
        message: 'Failed to delete job. Please try again.',
        variant: 'danger'
      });
    }
  };

  const cancelDelete = () => {
    setJobToDelete(null);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="post-job-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0 text-success d-flex align-items-center">
          <FaPlusCircle className="me-2" /> Post a New Job
        </h3>
        {jobs.length > 0 && (
          <Badge bg="light" text="dark" className="fs-6 p-2">
            {jobs.length} {jobs.length === 1 ? 'Job Posted' : 'Jobs Posted'}
          </Badge>
        )}
      </div>

      {showAlert.show && (
        <Alert variant={showAlert.variant} onClose={() => setShowAlert({ ...showAlert, show: false })} dismissible>
          {showAlert.message}
        </Alert>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteConfirm} onHide={cancelDelete} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this job posting? This action cannot be undone.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelDelete}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete Job
          </Button>
        </Modal.Footer>
      </Modal>

      <Card className="mb-4 shadow-sm border-0">
        <Card.Body className="p-4">
          <h5 className="mb-4 text-muted">Job Details</h5>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row className="mb-3 g-3">
              <Form.Group as={Col} md="6" controlId="jobTitle">
                <Form.Label className="fw-medium">
                  <FaBriefcase className="me-2 text-muted" />
                  Job Title *
                </Form.Label>
                <div className="form-icon-wrapper">
                  <Form.Control
                    required
                    type="text"
                    placeholder="e.g., Professor in Computer Science"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="py-2 ps-4"
                  />
                  <Form.Control.Feedback type="invalid">
                    Job title is required.
                  </Form.Control.Feedback>
                </div>
              </Form.Group>
              <Form.Group as={Col} md="6" controlId="department">
                <Form.Label className="fw-medium">
                  <FaBuilding className="me-2 text-muted" />
                  Department *
                </Form.Label>
                <div className="form-icon-wrapper">
                  <Form.Control
                    required
                    type="text"
                    placeholder="e.g., Computer Science"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="py-2 ps-4"
                  />
                  <Form.Control.Feedback type="invalid">
                    Department is required.
                  </Form.Control.Feedback>
                </div>
              </Form.Group>
            </Row>

            <Row className="mb-3 g-3">
              <Form.Group as={Col} md="6" controlId="location">
                <Form.Label className="fw-medium">
                  <FaMapMarkerAlt className="me-2 text-muted" />
                  Location *
                </Form.Label>
                <div className="form-icon-wrapper">
                  <Form.Control
                    required
                    type="text"
                    placeholder="e.g., Bangalore, Karnataka / Remote"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="py-2 ps-4"
                  />
                  <Form.Control.Feedback type="invalid">
                    Location is required.
                  </Form.Control.Feedback>
                </div>
              </Form.Group>

              <Form.Group as={Col} md="6" controlId="jobType">
                <Form.Label className="fw-medium">
                  <FaBriefcase className="me-2 text-muted" />
                  Job Type *
                </Form.Label>
                <div className="form-icon-wrapper">
                  <Form.Select
                    required
                    name="job_type"
                    value={formData.job_type}
                    onChange={handleChange}
                    className="py-2 ps-4"
                  >
                    <option value="onsite">Onsite</option>
                    <option value="remote">Remote</option>
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Job type is required.
                  </Form.Control.Feedback>
                </div>
              </Form.Group>
            </Row>

            <Form.Group className="mb-3" controlId="description">
              <Form.Label className="fw-medium">
                <BsCardChecklist className="me-2 text-muted" />
                Job Description *
              </Form.Label>
              <Form.Control
                required
                as="textarea"
                rows={4}
                placeholder="Brief description of the role..."
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
              <Form.Control.Feedback type="invalid">
                Description is required.
              </Form.Control.Feedback>
            </Form.Group>

            <Row className="mb-3 g-3">
              <Form.Group as={Col} md="6" controlId="deadline">
                <Form.Label className="fw-medium">
                  <FaCalendarAlt className="me-2 text-muted" />
                  Application Deadline *
                </Form.Label>
                <div className="form-icon-wrapper">
                  <Form.Control
                    required
                    type="date"
                    name="deadline"
                    min={todayISO}
                    value={formData.deadline}
                    onChange={handleChange}
                    className="py-2 ps-4"
                  />
                  <Form.Control.Feedback type="invalid">
                    Application deadline is required.
                  </Form.Control.Feedback>
                </div>
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} md="6" controlId="experience">
                <Form.Label>Experience (Years) *</Form.Label>
                <Form.Control
                  required
                  type="number"
                  min="0"
                  placeholder="e.g., 3"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                />
                <Form.Control.Feedback type="invalid">
                  Experience is required.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" controlId="course">
                <Form.Label>Relevant Course *</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Course name"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                />
                <Form.Control.Feedback type="invalid">
                  Course is required.
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} md="6" controlId="eligibility">
                <Form.Label>Eligibility Criteria *</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Eligibility criteria"
                  name="eligibility"
                  value={formData.eligibility}
                  onChange={handleChange}
                />
                <Form.Control.Feedback type="invalid">
                  Eligibility criteria required.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" controlId="skills">
                <Form.Label>Required Skills *</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Comma separated skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                />
                <Form.Control.Feedback type="invalid">
                  Skills are required.
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Form.Group className="mb-4" controlId="pdf">
              <Form.Label>Upload PDF (optional)</Form.Label>
              <Form.Control
                type="file"
                name="pdf"
                accept="application/pdf"
                onChange={handleChange}
              />
            </Form.Group>

            <motion.div
              className="d-flex justify-content-end mt-4"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="success"
                type="submit"
                className="px-4 py-2 fw-medium"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Posting...
                  </>
                ) : (
                  <>
                    <FaPlusCircle className="me-2" />
                    Post Job
                  </>
                )}
              </Button>
            </motion.div>
          </Form>
        </Card.Body>
      </Card>

      <h4 className="mb-3">Your Posted Jobs</h4>
      {fetchingJobs ? (
        <div className="text-center py-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading jobs...</span>
          </Spinner>
          <p className="mt-2 text-muted">Loading your posted jobs...</p>
        </div>
      ) : jobs.length === 0 ? (
        <p className="text-muted">No jobs posted yet.</p>
      ) : (
        <Card className="shadow-sm border-0 mt-4">
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0 text-muted">Posted Jobs</h5>
              <Badge bg="light" text="dark" className="fs-6 p-2">
                Showing {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
              </Badge>
            </div>
            <div className="table-responsive" style={{ overflow: 'visible' }}>
              <Table hover className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Job Title</th>
                    <th>Location</th>
                    <th>Deadline</th>
                    <th>Status</th>
                    <th className="text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => {
                    // Defensive checks to prevent undefined errors
                    if (!job || !job.id) return null;

                    return (
                      <motion.tr
                        key={job.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="position-relative"
                      >
                        <td>
                          <div className="d-flex flex-column">
                            <span className="fw-medium">{job.title || 'Untitled Job'}</span>
                            <small className="text-muted">Posted on {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Unknown date'}</small>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaMapMarkerAlt className="text-primary me-2" />
                            <span>{job.location || 'Not specified'}</span>
                          </div>
                        </td>
                        <td className="text-nowrap">
                          <div className="d-flex align-items-center">
                            <FaCalendarAlt className="text-muted me-2" />
                            {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'No deadline'}
                          </div>
                        </td>
                        <td>
                          <Dropdown
                            show={dropdownOpen[job.id]}
                            onToggle={(isOpen) => toggleDropdown(job.id, isOpen)}
                            drop="down"
                          >
                            <Dropdown.Toggle
                              variant={getStatusBadgeVariant(job.status)}
                              id={`status-dropdown-${job.id}`}
                              className="d-flex align-items-center"
                              style={{
                                minWidth: '100px',
                                justifyContent: 'space-between',
                                padding: '0.25rem 0.75rem',
                                position: 'relative',
                                zIndex: 1
                              }}
                            >
                              {getStatusDisplayText(job.status)}
                            </Dropdown.Toggle>
                            <Dropdown.Menu
                              style={{
                                position: 'absolute',
                                zIndex: 1050,
                                minWidth: '120px'
                              }}
                            >
                              <Dropdown.Item
                                active={job.status === 'open'}
                                onClick={() => handleStatusChange(job.id, 'open')}
                                className="d-flex align-items-center text-decoration-none"
                              >
                                <span className="badge bg-success me-2"></span>
                                Open
                              </Dropdown.Item>
                              <Dropdown.Item
                                active={job.status === 'paused'}
                                onClick={() => handleStatusChange(job.id, 'paused')}
                                className="d-flex align-items-center text-decoration-none"
                              >
                                <span className="badge bg-warning me-2"></span>
                                Paused
                              </Dropdown.Item>
                              <Dropdown.Item
                                active={job.status === 'closed'}
                                onClick={() => handleStatusChange(job.id, 'closed')}
                                className="d-flex align-items-center text-decoration-none"
                              >
                                <span className="badge bg-secondary me-2"></span>
                                Closed
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-2">
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => {
                                setJobToDelete(job.id);
                                setShowDeleteConfirm(true);
                              }}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default PostJob;
