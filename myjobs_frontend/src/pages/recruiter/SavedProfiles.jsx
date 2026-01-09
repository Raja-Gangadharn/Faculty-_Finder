import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Form, Button, Row, Col, Modal,
  Badge, Container, InputGroup, Spinner
} from 'react-bootstrap';
import {
  FaSearch, FaUserGraduate, FaEnvelope,
  FaUniversity, FaLaptop, FaBuilding, FaSync, FaMedal,
  FaRegBookmark, FaTrashAlt, FaEye
} from 'react-icons/fa';

const PAGE_SIZE = 6;

const SavedProfiles = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  // Load saved profiles from localStorage on component mount
  useEffect(() => {
    const loadSavedProfiles = () => {
      try {
        const savedProfiles = JSON.parse(localStorage.getItem('savedProfiles') || '[]');
        setProfiles(savedProfiles);
      } catch (error) {
        console.error('Error loading saved profiles:', error);
        setProfiles([]);
      }
    };

    loadSavedProfiles();

    // Listen for storage changes (in case profiles are saved from another tab)
    const handleStorageChange = () => {
      loadSavedProfiles();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Filter profiles by name/email and active filter
  const filtered = useMemo(() => {
    let result = [...profiles];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.email.toLowerCase().includes(searchLower) ||
        p.department.toLowerCase().includes(searchLower)
      );
    }

    // Apply active filter
    if (activeFilter !== 'all') {
      result = result.filter(p => p.preference.toLowerCase() === activeFilter.toLowerCase());
    }

    return result;
  }, [search, profiles, activeFilter]);

  // Pagination
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalItems = filtered.length;

  const handleDelete = (id) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id));

    // Also remove from localStorage
    try {
      const savedProfiles = JSON.parse(localStorage.getItem('savedProfiles') || '[]');
      const updatedSaved = savedProfiles.filter(p => p.id !== id);
      localStorage.setItem('savedProfiles', JSON.stringify(updatedSaved));
    } catch (error) {
      console.error('Error removing profile from localStorage:', error);
    }

    setDeleteTarget(null);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => setCurrentPage(page);

  const getPreferenceBadge = (preference) => {
    const variants = {
      'Remote': 'success',
      'On-site': 'primary',
      'Hybrid': 'warning'
    };

    const icons = {
      'Remote': <FaLaptop className="me-1" />,
      'On-site': <FaBuilding className="me-1" />,
      'Hybrid': <FaSync className="me-1" />
    };

    return (
      <Badge bg={variants[preference] || 'secondary'} className="d-inline-flex align-items-center">
        {icons[preference] || null}
        {preference}
      </Badge>
    );
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div className="mb-3 mb-md-0">
          <h2 className="mb-1">Saved Faculty Profiles</h2>
          <p className="text-muted mb-0">
            {totalItems} {totalItems === 1 ? 'profile' : 'profiles'} found
          </p>
        </div>

        <div className="w-100 w-md-50">
          <InputGroup>
            <InputGroup.Text className="bg-white border-end-0">
              <FaSearch className="text-muted" />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search by name, email, or department..."
              value={search}
              onChange={handleSearchChange}
              className="border-start-0"
            />
          </InputGroup>
        </div>
      </div>

      {/* Filters */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        <Button
          variant={activeFilter === 'all' ? 'primary' : 'outline-secondary'}
          size="sm"
          onClick={() => setActiveFilter('all')}
          className="rounded-pill px-3"
        >
          All Profiles
        </Button>
        <Button
          variant={activeFilter === 'remote' ? 'primary' : 'outline-secondary'}
          size="sm"
          onClick={() => setActiveFilter('remote')}
          className="rounded-pill px-3 d-flex align-items-center gap-1"
        >
          <FaLaptop /> Remote
        </Button>
        <Button
          variant={activeFilter === 'on-site' ? 'primary' : 'outline-secondary'}
          size="sm"
          onClick={() => setActiveFilter('on-site')}
          className="rounded-pill px-3 d-flex align-items-center gap-1"
        >
          <FaBuilding /> On-site
        </Button>
        <Button
          variant={activeFilter === 'hybrid' ? 'primary' : 'outline-secondary'}
          size="sm"
          onClick={() => setActiveFilter('hybrid')}
          className="rounded-pill px-3 d-flex align-items-center gap-1"
        >
          <FaSync /> Hybrid
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading profiles...</p>
        </div>
      ) : paginated.length === 0 ? (
        <Card className="shadow-sm border-0 text-center py-5">
          <Card.Body>
            <div className="display-1 text-muted mb-3">
              <FaRegBookmark />
            </div>
            <h4>No profiles found</h4>
            <p className="text-muted">
              {search
                ? 'Try adjusting your search or filter criteria.'
                : 'Your saved profiles will appear here.'}
            </p>
            {search && (
              <Button
                variant="outline-primary"
                onClick={() => {
                  setSearch('');
                  setActiveFilter('all');
                }}
                className="mt-2"
              >
                Clear filters
              </Button>
            )}
          </Card.Body>
        </Card>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {paginated.map((profile) => (
            <Col key={profile.id}>
              <Card className="h-100 shadow-sm border-0 hover-shadow transition-all">
                <Card.Body className="d-flex flex-column h-100">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: '50px', height: '50px' }}>
                        <FaUserGraduate size={24} />
                      </div>
                      <div className="ms-3">
                        <h5 className="mb-0">{profile.name}</h5>
                        <small className="text-muted">{profile.department}</small>
                      </div>
                    </div>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <FaMedal size={44} color="#f59e0b" />
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: '#16a34a',
                        color: '#fff',
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 12,
                        boxShadow: '0 0 0 3px #ffffff'
                      }}>
                        {profile.courseCreditScore || 0}
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex align-items-center text-muted small mb-2">
                      <FaEnvelope className="me-2" />
                      <span className="text-truncate">{profile.email}</span>
                    </div>
                    <div className="d-flex align-items-center text-muted small mb-2">
                      <FaUniversity className="me-2" />
                      <span>{profile.department} Department</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="me-2 small text-muted">Work Preference:</span>
                      {getPreferenceBadge(profile.preference)}
                    </div>
                  </div>

                  {profile.expertise && profile.expertise.length > 0 && (
                    <div className="mb-3">
                      <h6 className="small text-uppercase text-muted mb-2">Skills</h6>
                      <div className="d-flex flex-wrap gap-1">
                        {profile.expertise.slice(0, 3).map((skill, idx) => (
                          <Badge key={idx} bg="light" text="dark" className="fw-normal">
                            {skill}
                          </Badge>
                        ))}
                        {profile.expertise.length > 3 && (
                          <Badge bg="light" text="dark" className="fw-normal">
                            +{profile.expertise.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-auto pt-2 d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      Updated {profile.lastUpdated}
                    </small>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/recruiter/faculty/${profile.id}`)}
                        className="d-flex align-items-center gap-1"
                      >
                        <FaEye size={12} /> View
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => setDeleteTarget(profile)}
                        className="d-flex align-items-center gap-1"
                      >
                        <FaTrashAlt size={12} />
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <nav aria-label="Profile pagination">
            <ul className="pagination mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
              </li>

              {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
                // Show first page, last page, current page, and pages around current page
                let pageNum;
                if (pageCount <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= pageCount - 2) {
                  pageNum = pageCount - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(pageNum)}>
                      {pageNum}
                    </button>
                  </li>
                );
              })}

              <li className={`page-item ${currentPage === pageCount ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pageCount}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Delete confirm modal */}
      <Modal show={!!deleteTarget} onHide={() => setDeleteTarget(null)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title>Remove from Saved</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          <div className="text-center">
            <div className="bg-danger bg-opacity-10 d-inline-flex p-3 rounded-circle mb-3">
              <FaTrashAlt size={24} className="text-danger" />
            </div>
            <h5>Remove {deleteTarget?.name}?</h5>
            <p className="text-muted">
              This will remove the profile from your saved list. You can save it again later if needed.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" onClick={() => setDeleteTarget(null)} className="px-4">
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              handleDelete(deleteTarget?.id);
              setDeleteTarget(null);
            }}
            className="px-4"
          >
            Remove
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SavedProfiles;
