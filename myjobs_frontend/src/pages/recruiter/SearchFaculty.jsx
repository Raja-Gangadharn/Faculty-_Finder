import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Badge,
  Pagination,
  ButtonGroup,
} from "react-bootstrap";
import { AiOutlineSearch } from "react-icons/ai";
import { BsFilter, BsArrowClockwise, BsBookmarkCheckFill, BsBookmarkPlus, BsEnvelopePlus } from "react-icons/bs";
import { FaEnvelope } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// Mock data
const mockFaculty = [
  {
    id: 1,
    initials: "JD",
    name: "Dr. John Doe",
    email: "john.doe@example.com",
    department: "Computer Science",
    joined: "2 days ago",
    experience: 8,
    courses: ["Data Structures", "Algorithms", "Machine Learning"],
    degrees: [
      { label: "Ph.D", type: "primary" },
      { label: "M.Tech", type: "info" },
    ],
    degreeCredits: 120,
    saved: false,
  },
  {
    id: 2,
    initials: "SJ",
    name: "Dr. Sarah Johnson",
    email: "sarah.j@example.com",
    department: "Electrical Engineering",
    joined: "1 week ago",
    experience: 12,
    courses: ["Circuit Theory", "Power Systems"],
    degrees: [
      { label: "Ph.D", type: "primary" },
      { label: "M.E", type: "info" },
    ],
    degreeCredits: 10,
    saved: true,
  },
  {
    id: 3,
    initials: "JD",
    name: "Dr. Gangadharan",
    email: "john.doe@example.com",
    department: "Computer Science",
    joined: "2 days ago",
    experience: 8,
    courses: ["Data Structures", "Algorithms", "Machine Learning"],
    degrees: [
      { label: "Ph.D", type: "primary" },
      { label: "M.Tech", type: "info" },
    ],
    degreeCredits: 120,
    saved: false,
  },

  {
    id: 4,
    initials: "SJ",
    name: "Dr. Yogesh",
    email: "sarah.j@example.com",
    department: "Electrical Engineering",
    joined: "1 week ago",
    experience: 12,
    courses: ["Circuit Theory", "Power Systems"],
    degrees: [
      { label: "Ph.D", type: "primary" },
      { label: "M.E", type: "info" },
    ],

    degreeCredits: 150,
    saved: true,
  },

  {
    id: 5,
    initials: "JD",
    name: "Dr. Gangadharan",
    email: "john.doe@example.com",
    department: "Computer Science",
    joined: "2 days ago",
    experience: 8,
    courses: ["Data Structures", "Algorithms", "Machine Learning"],
    degrees: [
      { label: "Ph.D", type: "primary" },
      { label: "M.Tech", type: "info" },
    ],
    degreeCredits: 120,
    saved: false,
  },

  {
    id: 6,
    initials: "SJ",
    name: "Dr. Yogesh",
    email: "sarah.j@example.com",
    department: "Electrical Engineering",
    joined: "1 week ago",
    experience: 12,
    courses: ["Circuit Theory", "Power Systems"],
    degrees: [
      { label: "Ph.D", type: "primary" },
      { label: "M.E", type: "info" },
    ],
    degreeCredits: 150,
    saved: true,
  },
];

const PAGE_SIZE = 5;

const departmentOptions = [
  "All Departments",
  "Computer Science",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
];

const courseOptions = ["All Courses", "Data Structures", "Algorithms", "Machine Learning"];

const experienceOptions = ["Any Experience", "0-5 yrs", "5-10 yrs", "10 yrs(+)" ];

// -------------------------------------------------------------
// Main Component
// -------------------------------------------------------------
const SearchFaculty = () => {
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState(mockFaculty);
  const [department, setDepartment] = useState("All Departments");
  const [course, setCourse] = useState("All Courses");
  const [experience, setExperience] = useState("Any");
  const [degree, setDegree] = useState("Any");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter options
  const departmentOptions = ["All Departments", "Computer Science", "Electrical Engineering"];
  const courseOptions = ["All Courses", "Data Structures", "Algorithms", "Machine Learning", "Circuit Theory", "Power Systems"];
  const experienceOptions = ["Any", "1-5 years", "5-10 years", "10+ years"];
  const degreeOptions = ["Any", "Ph.D", "M.Tech", "M.S."];

  // Reset all filters
  const resetFilters = () => {
    setDepartment("All Departments");
    setCourse("All Courses");
    setExperience("Any");
    setDegree("Any");
    setCurrentPage(1);
  };

  // Filter faculty based on selected filters
  const filteredFaculty = useMemo(() => {
    let list = [...faculty];
    if (department !== "All Departments") {
      list = list.filter((f) => f.department === department);
    }
    if (course !== "All Courses") {
      list = list.filter((f) => f.courses.includes(course));
    }
    if (experience !== "Any") {
      const [minExp] = experience.split("-").map(Number);
      list = list.filter((f) => f.experience >= minExp);
    }
    if (degree !== "Any") {
      list = list.filter((f) => f.degrees.some((d) => d.label === degree));
    }
    return list;
  }, [faculty, department, course, experience, degree]);

  // Pagination logic
  const pageCount = Math.ceil(filteredFaculty.length / itemsPerPage);
  const paginated = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredFaculty.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredFaculty, currentPage, itemsPerPage]);

  const handlePageChange = (page) => setCurrentPage(page);

  // Toggle save status
  const toggleSave = (id) => {
    setFaculty((prevFaculty) =>
      prevFaculty.map((faculty) =>
        faculty.id === id ? { ...faculty, saved: !faculty.saved } : faculty
      )
    );
  };

  // Invite state and handlers
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [inviteData, setInviteData] = useState({
    jobTitle: '',
    jobType: '',
    salary: '',
    salaryPeriod: 'year',
    location: '',
    description: '',
    message: ''
  });

  const handleInvite = (facultyId) => {
    const faculty = mockFaculty.find(f => f.id === facultyId);
    setSelectedFaculty(faculty);
    setShowInviteModal(true);
  };

  const handleInviteSubmit = () => {
    // Validate required fields
    if (!inviteData.jobTitle || !inviteData.jobType || !inviteData.location || !inviteData.description) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Here you would typically make an API call to send the invite
    console.log('Sending invitation with data:', {
      facultyId: selectedFaculty?.id,
      facultyName: selectedFaculty?.name,
      facultyEmail: selectedFaculty?.email,
      ...inviteData
    });
    
    // Update the UI to show the invite was sent
    setFaculty(prevFaculty => 
      prevFaculty.map(f => 
        f.id === selectedFaculty.id ? { ...f, invited: true } : f
      )
    );
    
    setShowInviteModal(false);
    setInviteData({
      jobTitle: '',
      jobType: '',
      salary: '',
      salaryPeriod: 'year',
      location: '',
      description: '',
      message: ''
    });
  };
  
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setInviteData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  return (
    <div className="py-3">
      {/* -------------------- Search Filters -------------------- */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h5 className="mb-3 fw-semibold">Search Faculty</h5>
          <Row className="g-3 align-items-end">
            <Col md={3} sm={6}>
              <Form.Label>Department</Form.Label>
              <Form.Select value={department} onChange={(e) => setDepartment(e.target.value)}>
                {departmentOptions.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3} sm={6}>
              <Form.Label>Course</Form.Label>
              <Form.Select value={course} onChange={(e) => setCourse(e.target.value)}>
                {courseOptions.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2} sm={4}>
              <Form.Label>Experience</Form.Label>
              <Form.Select value={experience} onChange={(e) => setExperience(e.target.value)}>
                {experienceOptions.map((exp) => (
                  <option key={exp}>{exp}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2} sm={4}>
              <Form.Label>Highest Degree</Form.Label>
              <Form.Select value={degree} onChange={(e) => setDegree(e.target.value)}>
                {degreeOptions.map((deg) => (
                  <option key={deg}>{deg}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2} sm={4}>
              <div className="d-flex align-items-end flex-wrap gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-grow-1 d-flex align-items-center justify-content-center"
                >
                  <AiOutlineSearch className="me-1" /> Search
                </Button>
                <Button variant="outline-info" size="sm" title="More Filters">
                  <BsFilter />
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={resetFilters}
                  title="Reset"
                >
                  <BsArrowClockwise />
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* --------------------------- Results Table --------------------------- */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-semibold">Search Results</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ width: '25%' }}>Faculty Name</th>
                <th style={{ width: '15%' }}>Department</th>
                <th style={{ width: '10%' }}>Experience</th>
                <th style={{ width: '25%' }}>Courses</th>
                <th style={{ width: '15%' }}>Degrees</th>
                <th style={{ width: '10%', minWidth: '180px' }} className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No faculty found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginated.map((f) => (
                  <tr key={f.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar-sm me-3">
                          <span className="avatar-title rounded-circle bg-soft-primary text-primary">
                            {f.initials}
                          </span>
                        </div>
                        <div>
                          <h6 className="mb-0">
                            <Link to={`/recruiter/faculty/${f.id}`} className="text-decoration-none">
                              {f.name}
                            </Link>
                          </h6>
                          <small className="text-muted">{f.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>{f.department}</td>
                    <td>{f.experience} years</td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {f.courses.slice(0, 2).map((course) => (
                          <Badge key={course} bg="light" text="dark" className="border">
                            {course}
                          </Badge>
                        ))}
                        {f.courses.length > 2 && (
                          <Badge bg="light" text="dark" className="border">
                            +{f.courses.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        {f.degrees.map((degree) => (
                          <Badge key={degree.label} bg={degree.type}>
                            {degree.label}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <Button
                          variant={f.saved ? "outline-success" : "outline-secondary"}
                          size="sm"
                          onClick={() => toggleSave(f.id)}
                          className="d-flex align-items-center justify-content-center"
                          style={{
                            width: '36px',
                            height: '36px',
                            padding: '0',
                            borderRadius: '50%'
                          }}
                          title={f.saved ? 'Remove from saved' : 'Save for later'}
                        >
                          {f.saved ? <BsBookmarkCheckFill size={16} /> : <BsBookmarkPlus size={16} />}
                        </Button>
                        <Button
                          variant={f.invited ? "outline-success" : "primary"}
                          size="sm"
                          onClick={() => handleInvite(f.id)}
                          className="d-flex align-items-center gap-1"
                          disabled={f.invited}
                        >
                          {f.invited ? (
                            <><FaEnvelope className="me-1" /> Invited</>
                          ) : (
                            <><BsEnvelopePlus className="me-1" /> Invite</>
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Invite Confirmation Modal */}
      {showInviteModal && selectedFaculty && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Send Job Invitation</h5>
                <button type="button" className="btn-close" onClick={() => setShowInviteModal(false)}></button>
              </div>
              <div className="modal-body">
                <p className="mb-4">You're inviting <strong>{selectedFaculty?.name}</strong> to apply for a position. Please fill in the job details below.</p>
                
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="jobTitle" className="form-label">Job Title <span className="text-danger">*</span></label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="jobTitle" 
                      value={inviteData.jobTitle}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label htmlFor="jobType" className="form-label">Job Type <span className="text-danger">*</span></label>
                    <select 
                      className="form-select" 
                      id="jobType" 
                      value={inviteData.jobType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select job type</option>
                      <option value="full_time">Full Time</option>
                      <option value="part_time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="visiting">Visiting</option>
                    </select>
                  </div>
                  
                  <div className="col-md-6">
                    <label htmlFor="salary" className="form-label">Salary Range</label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="salary" 
                        value={inviteData.salary}
                        onChange={handleInputChange}
                        placeholder="e.g. 80,000 - 100,000" 
                      />
                      <select 
                        className="form-select" 
                        style={{maxWidth: '100px'}}
                        value={inviteData.salaryPeriod}
                        onChange={(e) => setInviteData(prev => ({...prev, salaryPeriod: e.target.value}))}
                      >
                        <option value="year">/year</option>
                        <option value="month">/month</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <label htmlFor="location" className="form-label">Location <span className="text-danger">*</span></label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="location" 
                      value={inviteData.location}
                      onChange={handleInputChange}
                      placeholder="e.g. New York, NY" 
                      required 
                    />
                  </div>
                  
                  <div className="col-12">
                    <label htmlFor="description" className="form-label">Job Description <span className="text-danger">*</span></label>
                    <textarea 
                      className="form-control" 
                      id="description" 
                      rows="4" 
                      value={inviteData.description}
                      onChange={handleInputChange}
                      placeholder="Enter detailed job description..." 
                      required
                    ></textarea>
                  </div>
                  
                  <div className="col-12">
                    <label htmlFor="message" className="form-label">Personal Message (Optional)</label>
                    <textarea 
                      className="form-control" 
                      id="message" 
                      rows="3" 
                      value={inviteData.message}
                      onChange={handleInputChange}
                      placeholder="Add a personal note to the faculty member..."
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowInviteModal(false)}>Cancel</button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleInviteSubmit}
                >
                  <BsEnvelopePlus className="me-1" /> Send Job Invitation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------- Pagination ----------------------------- */}
      <Pagination className="mt-3 justify-content-center">
        <Pagination.Prev
          disabled={currentPage === 1}
          onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
        />
        {[...Array(pageCount)].map((_, idx) => {
          const page = idx + 1;
          return (
            <Pagination.Item
              key={page}
              active={page === currentPage}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Pagination.Item>
          );
        })}
        <Pagination.Next
          disabled={currentPage === pageCount}
          onClick={() =>
            currentPage < pageCount && handlePageChange(currentPage + 1)
          }
        />
      </Pagination>
    </div>
  );
};

export default SearchFaculty;
