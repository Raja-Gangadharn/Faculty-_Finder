import React, { useEffect, useState, useCallback } from 'react';
import { Navbar, Nav, Container, Dropdown, Image, ListGroup, Button } from 'react-bootstrap';
import { 
  FaBell, 
  FaEnvelope, 
  FaUser, 
  FaBars, 
  FaChevronDown,
  FaSignOutAlt,
  FaCheck,
  FaBellSlash,
  FaCheckCircle,
  FaRegBell,
  FaEllipsisH
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import '../../assets/recruiter/TopNavbar.css';

const TopNavbar = ({ toggleSidebar, isSidebarOpen }) => {
  const { firstName, lastName, email, logout } = useAuth();
  const userInitials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();

  // Track viewport width so we only offset brand on larger screens
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    // Notification state
  const [notifications, setNotifications] = useState(() => 
    Array.from({ length: 20 }).map((_, i) => ({
      id: i + 1,
      text: `New faculty profile matches your criteria #${i + 1}`,
      time: `${i + 1}m ago`,
      read: i >= 5, // First 5 are unread
      type: i % 3 === 0 ? 'match' : (i % 3 === 1 ? 'message' : 'alert')
    }))
  );
  const [showNotifications, setShowNotifications] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sidebar is fixed at 250px (open) or 60px (collapsed)
  const brandOffset = windowWidth >= 992 ? (isSidebarOpen ? 250 : 60) : 0;

  return (
    <Navbar bg="white" expand="lg" className="recruiter-navbar shadow-sm fixed-top">
      <Container fluid>
        <div className="d-flex align-items-center">
          <button 
            className="btn btn-link p-0 me-3 d-lg-none"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <FaBars size={24} className="text-success" />
          </button>
          <Navbar.Brand as={Link} to="/recruiter/dashboard" className="es_mg_lft text-success fw-bold text-decoration-none" style={{ marginLeft: brandOffset }}>
            FacultyFinder
          </Navbar.Brand>
        </div>
       

        {/* {<div className="d-none d-lg-block flex-grow-1 mx-4">
          <div className="search-bar">
            <div className="input-group">
              <input 
                type="text" 
                className="form-control border-end-0" 
                placeholder="Search faculty, skills, or departments..."
              />
              <button className="btn btn-outline-success border-start-0" type="button">
                <i className="bi bi-search"></i>
              </button>
            </div>
          </div>
        </div> } */}

        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav className="align-items-center">
            <Dropdown as="div" className="position-relative d-inline-block" align="end" autoClose="outside">
              <Dropdown.Toggle 
                as={Nav.Link} 
                className="position-relative p-0 me-3"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <FaBell size={20} className={unreadCount > 0 ? 'text-success' : 'text-muted'} />
                {unreadCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem', padding: '0.25rem 0.35rem' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Dropdown.Toggle>

              <Dropdown.Menu 
                show={showNotifications}
                className="dropdown-menu-end notification-dropdown shadow-lg border-0"
                style={{ width: '350px', maxHeight: '500px', overflow: 'hidden' }}
              >
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                  <h6 className="mb-0 fw-bold">Notifications</h6>
                  <div>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="text-muted p-0 me-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Mark all as read
                        setNotifications(prev => 
                          prev.map(n => (n.read ? n : { ...n, read: true }))
                        );  
                      }}
                    >
                      <FaCheckCircle className="me-1" /> Mark all as read
                    </Button>
                  </div>
                </div>

                <div className="notification-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {notifications.length > 0 ? (
                    <ListGroup variant="flush">
                      {notifications.slice(0, 10).map((notification) => (
                        <ListGroup.Item 
                          key={notification.id}
                          className={`border-0 py-3 px-3 ${!notification.read ? 'bg-light' : ''}`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            // Mark as read when clicked
                            if (!notification.read) {
                              setNotifications(prev => 
                                prev.map(n => 
                                  n.id === notification.id ? { ...n, read: true } : n
                                )
                              );
                            }
                            // Handle notification click (e.g., navigate to relevant page)
                          }}
                        >
                          <div className="d-flex">
                            <div className="flex-shrink-0 me-3">
                              <div className={`avatar-sm ${notification.type === 'match' ? 'bg-success' : notification.type === 'message' ? 'bg-primary' : 'bg-warning'} text-white rounded-circle d-flex align-items-center justify-content-center`}>
                                {notification.type === 'match' ? (
                                  <FaUser size={12} />
                                ) : notification.type === 'message' ? (
                                  <FaEnvelope size={12} />
                                ) : (
                                  <FaBell size={12} />
                                )}
                              </div>
                            </div>
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between">
                                <p className="mb-1 text-dark">{notification.text}</p>
                                {!notification.read && (
                                  <span className="d-inline-block rounded-circle bg-success" style={{ width: '8px', height: '8px' }} />
                                )}
                              </div>
                              <small className="text-muted">{notification.time}</small>
                            </div>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <div className="text-center p-4">
                      <FaBellSlash size={32} className="text-muted mb-2" />
                      <p className="text-muted mb-0">No new notifications</p>
                    </div>
                  )}
                </div>

                {notifications.length > 10 && (
                  <div className="text-center p-2 border-top">
                    <Button variant="link" size="sm" className="text-success">
                      View All Notifications
                    </Button>
                  </div>
                )}
              </Dropdown.Menu>
            </Dropdown>
            <Nav.Link className="position-relative me-3">
              <FaEnvelope size={20} className="text-muted" />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success">
                5
              </span>
            </Nav.Link>
            
            <Dropdown align="end" className="ms-2">
              <Dropdown.Toggle 
                as={Nav.Link} 
                className="p-0 d-flex align-items-center text-decoration-none"
                id="user-dropdown"
              >
                <div className="avatar me-2 bg-success text-white d-flex align-items-center justify-content-center rounded-circle" 
                  style={{ width: '36px', height: '36px' }}>
                  {userInitials || <FaUser size={16} />}
                </div>
                <div className="d-none d-md-flex flex-column align-items-start">
                  <span className="fw-semibold text-dark">{`${firstName || ''} ${lastName || ''}`.trim() || 'User'}</span>
                  <small className="text-muted" style={{ fontSize: '0.8rem' }}>
                    {email || ''}
                    <FaChevronDown className="ms-1" size={10} />
                  </small>
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu className="dropdown-menu-end border-0 shadow-sm" style={{ minWidth: '220px' }}>
                <div className="px-3 py-2 border-bottom">
                  <h6 className="mb-0">{`${firstName || ''} ${lastName || ''}`.trim() || 'User'}</h6>
                  <small className="text-muted">{email || ''}</small>
                </div>
                <Dropdown.Divider />
                <Dropdown.Item 
                  className="text-danger py-2 text-decoration-none"
                  onClick={logout}
                >
                  <FaSignOutAlt className="me-2" /> Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default TopNavbar;
