import React, { useState, useMemo, useEffect } from "react";
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
  Modal,
} from "react-bootstrap";
import { AiOutlineSearch } from "react-icons/ai";
import { BsFilter, BsArrowClockwise, BsBookmarkCheckFill, BsBookmarkPlus } from "react-icons/bs";
import { FaMedal } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import JobSelectionModal from "../../components/recruiter/JobSelectionModal";
import recruiterService from "../../services/recruiterService";



// -------------------------------------------------------------
// Main Component
// -------------------------------------------------------------
const SearchFaculty = () => {
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [course, setCourse] = useState("All Courses");
  const [degree, setDegree] = useState("Any");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter options (derived from loaded data)
  const departmentOptions = useMemo(() => {
    const set = new Set();
    faculty.forEach(f => (f.departments || []).forEach(d => set.add(d)));
    return ["All Departments", ...Array.from(set)];
  }, [faculty]);
  const courseOptions = useMemo(() => {
    const set = new Set();
    faculty.forEach(f => (f.courses || []).forEach(c => set.add(c.name)));
    return ["All Courses", ...Array.from(set)];
  }, [faculty]);
  const degreeOptions = useMemo(() => {
    const set = new Set();
    faculty.forEach(f => (f.degrees || []).forEach(d => d.degree && set.add(d.degree)));
    return ["Any", ...Array.from(set)];
  }, [faculty]);

  // Reset all filters
  const resetFilters = () => {
    setDepartment("All Departments");
    setCourse("All Courses");
    setDegree("Any");
    setCurrentPage(1);
  };

  // Filter faculty based on selected filters
  const filteredFaculty = useMemo(() => {
    let list = [...faculty];
    if (department !== "All Departments") {
      list = list.filter((f) => (f.departments || []).includes(department));
    }
    if (course !== "All Courses") {
      list = list.filter((f) => (f.courses || []).some((c) => c.name === course));
    }
    if (degree !== "Any") {
      list = list.filter((f) => (f.degrees || []).some((d) => d.degree === degree || d.label === degree));
    }
    return list;
  }, [faculty, department, course, degree]);

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

    // Save/remove from localStorage
    const facultyToSave = faculty.find(f => f.id === id);
    if (facultyToSave) {
      const savedProfiles = JSON.parse(localStorage.getItem('savedProfiles') || '[]');

      if (facultyToSave.saved) {
        // Remove from saved profiles
        const updatedSaved = savedProfiles.filter(p => p.id !== id);
        localStorage.setItem('savedProfiles', JSON.stringify(updatedSaved));
      } else {
        // Add to saved profiles
        const profileData = {
          id: facultyToSave.id,
          name: facultyToSave.full_name || facultyToSave.name,
          email: facultyToSave.email,
          department: (facultyToSave.departments || [])[0] || 'Not specified',
          preference: facultyToSave.work_preference || 'Not specified',
          expertise: (facultyToSave.courses || []).slice(0, 3).map(c => c.name),
          lastUpdated: 'Just now',
          courseCreditScore: Number(facultyToSave.course_credit_total || 0)
        };
        const updatedSaved = [...savedProfiles, profileData];
        localStorage.setItem('savedProfiles', JSON.stringify(updatedSaved));
      }
    }
  };

  // Invite state and handlers
  const [showJobSelectModal, setShowJobSelectModal] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  // Courses modal state
  const [showCoursesModal, setShowCoursesModal] = useState(false);
  const [coursesForModal, setCoursesForModal] = useState([]);
  const [selectedFacultyName, setSelectedFacultyName] = useState("");

  // Load current user data
  useEffect(() => {
    // In a real app, you would fetch the current user from your auth context or API
    const mockCurrentUser = {
      id: 'recruiter-123', // This would come from your auth system
      name: 'Recruiter Name',
      email: 'recruiter@example.com',
      role: 'recruiter'
    };
    setCurrentUser(mockCurrentUser);
  }, []);

  // Load faculty search results
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const data = await recruiterService.getFacultySearchResults();
        if (!active) return;

        // Get saved profiles from localStorage to mark already saved ones
        const savedProfiles = JSON.parse(localStorage.getItem('savedProfiles') || '[]');
        const savedProfileIds = new Set(savedProfiles.map(p => p.id));

        const enriched = (Array.isArray(data) ? data : []).map((r) => ({
          ...r,
          saved: savedProfileIds.has(r.id) || !!r.saved,
          invited: !!r.invited
        }));
        setFaculty(enriched);
      } catch (e) {
        if (!active) return;
        setError("Failed to load faculty.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleInviteClick = (facultyId) => {
    const selected = faculty.find(f => f.id === facultyId);
    setSelectedFaculty(selected);
    setShowJobSelectModal(true);
  };

  const openCoursesModal = (f) => {
    setSelectedFacultyName(f.full_name || f.name || f.email);
    setCoursesForModal(f.courses || []);
    setShowCoursesModal(true);
  };

  const handleJobSelect = async (selectedJob) => {
    try {
      // Here you would typically send the invite to the backend
      console.log('Sending invite with job:', selectedJob, 'to faculty:', selectedFaculty);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update the UI to show the invite was sent
      setFaculty(prevFaculty =>
        prevFaculty.map(f =>
          f.id === selectedFaculty.id ? { ...f, invited: true } : f
        )
      );

      setShowJobSelectModal(false);
    } catch (error) {
      console.error('Error sending invite:', error);
    }
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
                <th style={{ width: '28%' }}>Profile</th>
                <th style={{ width: '10%' }}>Course Credits Total</th>
                <th style={{ width: '15%' }}>Departments</th>
                <th style={{ width: '13%' }}>Applicable Course(s)</th>
                <th style={{ width: '20%' }}>Degree</th>
                <th style={{ width: '12%' }}>Degree Credits</th>
                <th style={{ width: '10%', minWidth: '180px' }} className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No faculty found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginated.map((f) => (
                  <tr key={f.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar-sm me-3">
                          {f.profile_photo_url ? (
                            <img
                              src={f.profile_photo_url}
                              alt={f.full_name || f.name || 'Faculty'}
                              className="rounded-circle"
                              style={{ width: 40, height: 40, objectFit: 'cover' }}
                            />
                          ) : (
                            <span className="avatar-title rounded-circle bg-soft-primary text-primary">
                              {f.initials}
                            </span>
                          )}
                        </div>
                        <div>
                          <h6 className="mb-0">
                            <Link to={`/recruiter/faculty/${f.id}`} className="text-decoration-none">
                              {f.full_name || f.name || 'Faculty'}
                            </Link>
                          </h6>
                          <small className="text-muted">{f.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ position: 'relative', width: 44, height: 44 }} className="d-inline-flex align-items-center justify-content-center">
                        <FaMedal size={44} color="#f59e0b" />
                        <div style={{ position: 'absolute', top: '52%', left: '50%', transform: 'translate(-50%, -58%)', backgroundColor: '#16a34a', color: '#fff', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, boxShadow: '0 0 0 3px #ffffff' }}>
                          {Number(f.course_credit_total || 0)}
                        </div>
                      </div>
                    </td>
                    <td>{(f.departments || []).join(', ')}</td>
                    <td>
                      <Button variant="outline-secondary" size="sm" onClick={() => openCoursesModal(f)}>
                        COURSE(S)
                      </Button>
                    </td>
                    <td>
                      <div className="d-flex flex-column gap-1">
                        {(f.degrees || []).map((d, idx) => (
                          <span key={`${d.degree}-${idx}`} className="small">
                            {d.label}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {(f.degree_credits || []).map((dc, idx) => (
                          <Badge key={`${dc.degree}-${idx}`} bg="light" text="dark" className="border">
                            {dc.degree}: {dc.credits}
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
                          title={f.saved ? "Remove from saved" : "Save for later"}
                        >
                          {f.saved ? <BsBookmarkCheckFill /> : <BsBookmarkPlus />}
                        </Button>
                        <Button
                          variant={f.invited ? "success" : "primary"}
                          size="sm"
                          onClick={() => handleInviteClick(f.id)}
                          disabled={f.invited}
                        >
                          {f.invited ? 'Invited' : 'Invite'}
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

      {/* Job Selection Modal */}
      <JobSelectionModal
        show={showJobSelectModal}
        onHide={() => setShowJobSelectModal(false)}
        onSelect={handleJobSelect}
        recruiterId={currentUser?.id}
      />

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

      {/* Courses Modal */}
      <Modal show={showCoursesModal} onHide={() => setShowCoursesModal(false)} size="lg" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Courses for {selectedFacultyName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {(coursesForModal || []).length === 0 ? (
            <div className="text-muted">No courses found in transcript.</div>
          ) : (
            <div className="row">
              {(coursesForModal || []).map((c, idx) => (
                <div className="col-md-6 mb-2" key={`${c.name}-${idx}`}>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" checked readOnly />
                    <label className="form-check-label">
                      {c.name} ({Number(c.credits || 0)})
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCoursesModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SearchFaculty;
