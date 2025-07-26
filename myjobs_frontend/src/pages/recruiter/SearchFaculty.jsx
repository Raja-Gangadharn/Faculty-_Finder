import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Badge,
  Pagination,
  Dropdown,
  ButtonGroup,
} from "react-bootstrap";
import { AiOutlineSearch, AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { BsFilter, BsArrowClockwise, BsBookmarkCheckFill, BsBookmarkPlus } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";


// -------------------------------------------------------------
// Temporary mock data – Replace with real API data in the future
// -------------------------------------------------------------
// 
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

const degreeOptions = ["Any Degree", "Ph.D", "M.Tech", "M.E", "B.Tech"];

// -------------------------------------------------------------
// Main Component
// -------------------------------------------------------------
const SearchFaculty = () => {
  /* --------------------------- Component State --------------------------- */
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState(mockFaculty);
  const [department, setDepartment] = useState("All Departments");
  const [course, setCourse] = useState("All Courses");
  const [experience, setExperience] = useState("Any Experience");
  const [degree, setDegree] = useState("Any Degree");
  const [currentPage, setCurrentPage] = useState(1);

  /* ----------------------------- Handlers ------------------------------- */
  const resetFilters = () => {
    setDepartment("All Departments");
    setCourse("All Courses");
    setExperience("Any Experience");
    setDegree("Any Degree");
  };

  const filteredFaculty = useMemo(() => {
    let list = [...faculty];
    if (department !== "All Departments") {
      list = list.filter((f) => f.department === department);
    }
    if (course !== "All Courses") {
      list = list.filter((f) => f.courses.includes(course));
    }
    if (experience !== "Any Experience") {
      const min = experience.includes("-") ? Number(experience.split("-")[0]) : 10;
      list = list.filter((f) => f.experience >= min);
    }
    if (degree !== "Any Degree") {
      list = list.filter((f) => f.degrees.some((d) => d.label === degree));
    }
    return list;
  },

  [faculty, department, course, experience, degree]);

  const pageCount = Math.ceil(filteredFaculty.length / PAGE_SIZE) || 1;
  const paginated = filteredFaculty.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handlePageChange = (page) => setCurrentPage(page);

  const toggleSave = (id) => {
    setFaculty(prevFaculty => 
      prevFaculty.map(faculty => 
        faculty.id === id 
          ? { ...faculty, saved: !faculty.saved } 
          : faculty
      )
    );
  };

  /* ------------------------------ Render ------------------------------ */
  return (
    <div className="py-3">
      { 
      /* -------------------- Search Filters -------------------- */
      }
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
      <Card className="shadow-sm">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-semibold">Search Results</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Faculty Name</th>
                <th>Department</th>
                <th>Experience</th>
                <th>Courses</th>
                <th>Degrees</th>
                <th>Degree Credits</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    No faculty found.
                  </td>
                </tr>
              ) : (
                paginated.map((f) => (
                  <tr key={f.id}>
                    
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded-circle bg-primary text-white fw-bold d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                          {f.initials}
                        </div>
                        <div>
                          <div 
                            className="fw-semibold text-primary" 
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate(`/recruiter/faculty/${f.facultyId}`)}
                          >
                            {f.name}
                          </div>
                          <small className="text-muted">{f.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      {f.department}
                      <br />
                      <small className="text-muted">{f.joined}</small>
                    </td>
                    <td>{f.experience} yrs</td>
                    <td>
                      {f.courses.map((c) => (
                        <Badge key={c} bg="secondary" className="me-1">
                          {c}
                        </Badge>
                      ))}
                    </td>
                    <td>
                      {f.degrees.map((d) => (
                        <Badge key={d.label} bg={d.type} className="me-1">
                          {d.label}
                        </Badge>
                      ))}
                    </td>
                    <td>{f.degreeCredits}</td>
                    <td className="text-end">
                      <div className="d-inline-flex align-items-center justify-content-end gap-2">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            variant={f.saved ? "outline-success" : "outline-secondary"}
                            size="sm"
                            onClick={() => toggleSave(f.id)}
                            title={f.saved ? "Unsave" : "Save"}
                            className="d-flex align-items-center justify-content-center p-0"
                            style={{
                              width: '32px',
                              height: '32px',
                              border: 'none',
                              backgroundColor: 'transparent',
                              color: f.saved ? '#198754' : '#6c757d'
                            }}
                          >
                            <AnimatePresence mode="wait">
                              <motion.span
                                key={f.saved ? 'saved' : 'unsaved'}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 1.5, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                {f.saved ? (
                                  <BsBookmarkCheckFill size={18} />
                                ) : (
                                  <BsBookmarkPlus size={18} />
                                )}
                              </motion.span>
                            </AnimatePresence>
                          </Button>
                        </motion.div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => navigate(`/recruiter/faculty/${f.facultyId || f.id}`)}
                          title="View Profile"
                        >
                          View
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
          onClick={() => currentPage < pageCount && handlePageChange(currentPage + 1)}
        />
      </Pagination>
    </div>
  );
};

export default SearchFaculty
