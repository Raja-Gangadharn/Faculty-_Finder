import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Table, Alert } from 'react-bootstrap';
import { FaPlusCircle } from 'react-icons/fa';
import { Modal } from 'react-bootstrap';

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
    <div>
      <h3 className="mb-4 text-success d-flex align-items-center">
        <FaPlusCircle className="me-2" /> Post a New Job
      </h3>

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

      <Card className="mb-5 shadow-sm">
        <Card.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Form.Group as={Col} md="6" controlId="jobTitle">
                <Form.Label>Job Title *</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Enter job title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                />
                <Form.Control.Feedback type="invalid">
                  Job title is required.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" controlId="salaryRange">
                <Form.Label>Salary Range *</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="e.g., $60,000 - $80,000"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                />
                <Form.Control.Feedback type="invalid">
                  Salary range is required.
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} md="6" controlId="location">
                <Form.Label>Location *</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="City, State / Remote"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                />
                <Form.Control.Feedback type="invalid">
                  Location is required.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" controlId="deadline">
                <Form.Label>Application Deadline *</Form.Label>
                <Form.Control
                  required
                  type="date"
                  name="deadline"
                  min={todayISO}
                  value={formData.deadline}
                  onChange={handleChange}
                />
                <Form.Control.Feedback type="invalid">
                  Deadline is required.
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Form.Group className="mb-3" controlId="description">
              <Form.Label>Job Description *</Form.Label>
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

            <Button variant="success" type="submit">
              Submit Job
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <h4 className="mb-3">Your Posted Jobs</h4>
      {jobs.length === 0 ? (
        <p className="text-muted">No jobs posted yet.</p>
      ) : (
        <Card className="shadow-sm">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Job Title</th>
                  <th>Posted On</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td>{job.title}</td>
                    <td>{new Date(job.postedAt).toLocaleDateString()}</td>
                    <td>{job.deadline || '-'}</td>
                    <td>
                      <span
                        className={`badge bg-${
                          getStatus(job.deadline) === 'Live' ? 'success' : 'secondary'
                        }`}
                      >
                        {getStatus(job.deadline)}
                      </span>
                    </td>
                    <td>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDeleteClick(job.id)}
                        title="Delete Job"
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default PostJob;
