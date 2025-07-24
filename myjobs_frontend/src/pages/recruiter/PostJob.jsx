import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Table, Alert } from 'react-bootstrap';
import { FaPlusCircle } from 'react-icons/fa';

const PostJob = () => {
  // Form state
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

  const [jobs, setJobs] = useState([]); // list of posted jobs
  const [validated, setValidated] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  // Generic form change handler
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
    } else {
      // Add job to state list
      const newJob = {
        id: Date.now(),
        ...formData,
        postedAt: new Date(),
      };
      setJobs((prev) => [newJob, ...prev]);
      // Reset form
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
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
    setValidated(true);
  };

  const todayISO = new Date().toISOString().split('T')[0];

  // Determine job status
  const getStatus = (deadline) => {
    if (!deadline) return 'Live';
    return new Date(deadline) >= new Date() ? 'Live' : 'Expired';
  };

  return (
    <div>
      <h3 className="mb-4 text-success d-flex align-items-center">
        <FaPlusCircle className="me-2" /> Post a New Job
      </h3>

      {/* Success alert */}
      {showAlert && (
        <Alert variant="success">Job posted successfully!</Alert>
      )}

      {/* Job posting form */}
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

      {/* Posted jobs list */}
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
                        className={`badge bg-$
                        {getStatus(job.deadline) === 'Live' ? 'success' : 'secondary'}`}
                      >
                        {getStatus(job.deadline)}
                      </span>
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
