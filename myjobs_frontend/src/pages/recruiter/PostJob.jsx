import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Card, Form, Button, Row, Col, Table, Alert, Badge } from 'react-bootstrap';
import { FaPlusCircle, FaTrash ,FaBriefcase, FaMapMarkerAlt, FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa';
import { BsCardChecklist } from 'react-icons/bs';
import { motion } from 'framer-motion';
import './recruiter.css';


const PostJob = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    salary: '',
    location: '',
    experience: '',
    course: '',
    eligibility: '',
    skills: '',
    deadline: '',
    pdf: null,
  });

  const [jobs, setJobs] = useState([]);
  const [validated, setValidated] = useState(false);
  const [showAlert, setShowAlert] = useState({ show: false, message: '', variant: 'success' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    const newJob = {
      id: crypto.randomUUID(),
      ...formData,
      postedAt: new Date(),
    };

    setJobs((prev) => [newJob, ...prev]);

    setFormData({
      title: '',
      description: '',
      salary: '',
      location: '',
      experience: '',
      course: '',
      eligibility: '',
      skills: '',
      deadline: '',
      pdf: null,
    });

    setValidated(false); // reset validation state
    setShowAlert({
      show: true,
      message: 'Job posted successfully!',
      variant: 'success'
    });
    setTimeout(() => setShowAlert({ ...showAlert, show: false }), 3000);
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

  const confirmDelete = () => {
    setJobs(jobs.filter(job => job.id !== jobToDelete));
    setShowDeleteConfirm(false);
    setShowAlert({
      show: true,
      message: 'Job deleted successfully!',
      variant: 'danger'
    });
    setTimeout(() => setShowAlert({ ...showAlert, show: false }), 3000);
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

              <Form.Group as={Col} md="6" controlId="salaryRange">
                <Form.Label className="fw-medium">
                  <FaMoneyBillWave className="me-2 text-muted" />
                  Salary Range *
                </Form.Label>
                <div className="form-icon-wrapper">
                  <Form.Control
                    required
                    type="text"
                    placeholder="e.g., ₹8,00,000 - ₹12,00,000"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    className="py-2 ps-4"
                  />
                  <Form.Control.Feedback type="invalid">
                    Salary range is required.
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
                    Deadline is required.
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
              >
                <FaPlusCircle className="me-2" />
                Post Job
              </Button>
            </motion.div>
          </Form>
        </Card.Body>
      </Card>

      <h4 className="mb-3">Your Posted Jobs</h4>
      {jobs.length === 0 ? (
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
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>JOB TITLE</th>
                    <th>LOCATION</th>
                    <th>SALARY</th>
                    <th>DEADLINE</th>
                    <th>STATUS</th>
                    <th className="text-end">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <motion.tr
                      key={job.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="position-relative"
                    >
                      <td className="fw-medium">{job.title}</td>
                      <td>
                        <div className="d-flex align-items-center text-muted">
                          <FaMapMarkerAlt className="me-1" size={12} />
                          {job.location}
                        </div>
                      </td>
                      <td className="text-nowrap">{job.salary}</td>
                      <td className="text-nowrap">
                        <div className="d-flex align-items-center">
                          <FaCalendarAlt className="me-1 text-muted" size={12} />
                          {new Date(job.deadline).toLocaleDateString('en-IN')}
                        </div>
                      </td>
                      <td>
                        <Badge
                          bg={getStatus(job.deadline) === 'Live' ? 'success' : 'danger'}
                          className="d-inline-flex align-items-center"
                        >
                          {getStatus(job.deadline) === 'Live' ? (
                            <span className="dot bg-white me-1"></span>
                          ) : null}
                          {getStatus(job.deadline)}
                        </Badge>
                      </td>
                      <td className="text-end">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteClick(job.id)}
                          className="p-1"
                          title="Delete Job"
                        >
                          <FaTrash size={14} />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
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
