import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container, Dropdown, Image } from 'react-bootstrap';
import { 
  FaBell, 
  FaEnvelope, 
  FaUser, 
  FaBars, 
  FaChevronDown,
  FaSignOutAlt
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import '../../assets/recruiter/TopNavbar.css';

const TopNavbar = ({ toggleSidebar, isSidebarOpen }) => {
  const { firstName, lastName, email, logout } = useAuth();
  const userInitials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();

  // Track viewport width so we only offset brand on larger screens
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

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
       

        {/* <div className="d-none d-lg-block flex-grow-1 mx-4">
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
        </div> */}

        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav className="align-items-center">
            <Nav.Link className="position-relative me-3">
              <FaBell size={20} className="text-muted" />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success">
                3
              </span>
            </Nav.Link>
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
                <Dropdown.Item as={Link} to="/recruiter/profile" className="py-2">
                  <FaUser className="me-2 text-muted" /> My Profile
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/recruiter/settings" className="py-2">
                  <i className="bi bi-gear me-2"></i> Settings
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item 
                  className="text-danger py-2"
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
