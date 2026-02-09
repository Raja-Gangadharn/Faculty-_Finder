import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Card, Button, Badge, Dropdown, Modal, Spinner, Alert
} from 'react-bootstrap';
import {
  FaUserGraduate, FaEnvelope,
  FaUniversity, FaTrashAlt, FaEye,
  FaSortAmountDown, FaExclamationCircle
} from 'react-icons/fa';
import { markedProfilesService } from '../../services/markedProfilesService';

const PAGE_SIZE = 6;

const MarkedProfiles = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMarkedProfiles = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const markedProfilesData = await markedProfilesService.getMarkedProfiles();
        setProfiles(markedProfilesData);
      } catch (err) {
        setError(err.message || 'Failed to load marked profiles. Please try again.');
        console.error('Error fetching marked profiles:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarkedProfiles();
  }, []);

  // Status and priority functionality removed as per request

  // Sort profiles
  const sortedProfiles = useMemo(() => {
    const result = [...profiles];

    result.sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'name') {
        const nameA = `${a.faculty_details.first_name} ${a.faculty_details.last_name}`;
        const nameB = `${b.faculty_details.first_name} ${b.faculty_details.last_name}`;
        comparison = nameA.localeCompare(nameB);
      } else if (sortBy === 'department') {
        const deptA = a.faculty_details.departments.join(', ') || '';
        const deptB = b.faculty_details.departments.join(', ') || '';
        comparison = deptA.localeCompare(deptB);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [profiles, sortBy, sortOrder]);

  // Pagination
  const pageCount = Math.ceil(sortedProfiles.length / PAGE_SIZE) || 1;
  const paginated = sortedProfiles.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalItems = sortedProfiles.length;

  const handleDelete = async (markedProfileId, facultyId) => {
    try {
      await markedProfilesService.unmarkProfile(facultyId);
      setProfiles((prev) => prev.filter((p) => p.id !== markedProfileId));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error removing marked profile:', err);
      alert(err.message || 'Failed to remove marked profile. Please try again.');
    }
  };



  const handlePageChange = (page) => setCurrentPage(page);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const SortIndicator = ({ field }) => (
    <span
      role="button"
      className="ms-1"
      onClick={() => handleSort(field)}
    >
      <FaSortAmountDown
        className={`transition-opacity ${sortBy === field ? 'opacity-100' : 'opacity-0'}`}
        style={{ transform: sortOrder === 'asc' ? 'rotate(180deg)' : 'none' }}
      />
    </span>
  );

  return (
    <Container fluid className="py-4 marked-profiles-container">
      <div className="mb-4">
        <h2 className="mb-1">Marked Faculty Profiles</h2>
        <p className="text-muted mb-0">
          {totalItems} {totalItems === 1 ? 'candidate' : 'candidates'} marked for review
        </p>
      </div>

      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading marked profiles...</span>
          </Spinner>
        </div>
      ) : error ? (
        <Alert variant="danger">
          <div className="d-flex align-items-center">
            <FaExclamationCircle className="me-2" />
            {error}
          </div>
        </Alert>
      ) : (
        <>
          {/* Sort and Pagination Info */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" size="sm" className="d-flex align-items-center gap-1">
                <FaSortAmountDown size={12} /> Sort
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item
                  active={sortBy === 'name'}
                  onClick={() => handleSort('name')}
                >
                  Name {sortBy === 'name' && (sortOrder === 'desc' ? '↓' : '↑')}
                </Dropdown.Item>
                <Dropdown.Item
                  active={sortBy === 'department'}
                  onClick={() => handleSort('department')}
                >
                  Department {sortBy === 'department' && (sortOrder === 'desc' ? '↓' : '↑')}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <div className="text-muted small">
              {totalItems} {totalItems === 1 ? 'profile' : 'profiles'} found
            </div>
          </div>

          {paginated.length === 0 ? (
            <Card className="shadow-sm border-0 text-center py-5">
              <Card.Body>
                <h4>No profiles found</h4>
                <p className="text-muted">
                  No faculty profiles have been marked yet.
                </p>
              </Card.Body>
            </Card>
          ) : (
            <div className="profile-list">
              {paginated.map((profile) => (
                <Card key={profile.id} className="mb-3 border-0 shadow-sm hover-shadow transition-all">
                  <Card.Body>
                    <div className="d-flex flex-column flex-md-row">
                      {/* Left Column - Profile Info */}
                      <div className="flex-grow-1 pe-md-3">
                        <div className="d-flex align-items-start">
                          <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                            style={{ width: '48px', height: '48px' }}>
                            <FaUserGraduate size={20} />
                          </div>

                          <div className="flex-grow-1">
                            <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                              <h5 className="mb-0 me-2">
                                <span
                                  role="button"
                                  className="text-primary"
                                  onClick={() => navigate(`/recruiter/faculty/${profile.faculty_details.id}`)}
                                >
                                  {profile.faculty_details.first_name} {profile.faculty_details.last_name}
                                </span>
                              </h5>

                            </div>

                            <div className="d-flex flex-wrap align-items-center gap-3 text-muted small mb-2">
                              <span className="d-flex align-items-center">
                                <FaEnvelope className="me-1" /> {profile.faculty_details.email}
                              </span>
                              <span className="d-flex align-items-center">
                                <FaUniversity className="me-1" /> {profile.faculty_details.departments.join(', ') || 'No department'}
                              </span>
                            </div>

                            <div className="d-flex align-items-center mt-2">
                              <Badge bg="light" text="dark" className="border fw-normal">
                                {profile.faculty_details.work_preference.join(', ') || 'No preference'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="d-flex gap-2 mt-3">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="d-flex align-items-center gap-1"
                          onClick={() => navigate(`/recruiter/faculty/${profile.faculty_details.id}`)}
                        >
                          <FaEye size={12} /> View
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="d-flex align-items-center gap-1"
                          onClick={() => setDeleteTarget(profile)}
                        >
                          <FaTrashAlt size={12} /> Remove
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
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
        </>
      )}

      {/* Delete confirm modal */}
      <Modal show={!!deleteTarget} onHide={() => setDeleteTarget(null)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title>Remove from Marked</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          <div className="text-center">
            <div className="bg-danger bg-opacity-10 d-inline-flex p-3 rounded-circle mb-3">
              <FaTrashAlt size={24} className="text-danger" />
            </div>
            <h5>Remove {deleteTarget?.faculty_details?.first_name} {deleteTarget?.faculty_details?.last_name}?</h5>
            <p className="text-muted">
              This will remove the candidate from your marked list. You can mark them again later if needed.
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
              handleDelete(deleteTarget?.id, deleteTarget?.faculty_details?.id);
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

// Add some custom styles
const styles = `
  .marked-profiles-container {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .profile-list .card {
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .profile-list .card:hover {
    transform: translateY(-2px);
  }
  
  .hover-shadow {
    transition: box-shadow 0.2s;
  }
  
  .hover-shadow:hover {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1) !important;
  }
  
  .transition-all {
    transition: all 0.2s;
  }
  
  .opacity-0 {
    opacity: 0;
  }
  
  .opacity-100 {
    opacity: 1;
  }
  
  .cursor-pointer {
    cursor: pointer;
  }
`;

// Add styles to the document head
const styleElement = document.createElement('style');
styleElement.textContent = styles;
document.head.appendChild(styleElement);

export default MarkedProfiles;
