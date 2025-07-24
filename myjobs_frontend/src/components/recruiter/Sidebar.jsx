import React, { useState, useEffect } from 'react';
import { Nav, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaHome, FaTimes,
  FaUserTie,
  FaBriefcase,
  FaEnvelope, 
  FaChartLine, 
  FaBuilding,
  FaPlusSquare,
  FaCog,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaPhone,
  FaPaperPlane
} 
from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import '../../assets/recruiter/Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const activeMenu = location.pathname.split('/')[2] || 'dashboard';

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check if we're on mobile
  const isMobile = windowWidth < 992;

  // Tooltip renderer
  const renderTooltip = (text) => {
    if (isOpen || isMobile) return null;
    return (
      <Tooltip id={`tooltip-${text}`}>
        {text}
      </Tooltip>
    );
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaHome />, path: '/recruiter/dashboard' },
    { id: 'search-faculty', label: 'Search Faculty', icon: <FaSearch/>, path: '/recruiter/search-faculty' },
    { id: 'saved-profiles', label: 'Saved Profiles', icon: <FaUserTie />, path: '/recruiter/saved-profiles' },
    { id: 'marked-profiles', label: 'Marked Profiles', icon: <FaBriefcase />, path: '/recruiter/marked-profiles' },
    { id: 'post-job', label: 'Post a Job', icon: <FaEnvelope />, path: '/recruiter/post-job' },
    { id: 'Contact us', label: 'Contact us', icon: <FaPaperPlane />, path: '/recruiter/contact-us' },
    { id: 'FAQ', label: 'FAQ', icon: <FaBuilding />, path: '/recruiter/feedback' },
    // { id: 'Tutorial', label: 'Tutorial', icon: <FaPlusSquare />, path: '/recruiter/Tutorial' },
    
  ];

  const bottomMenuItems = [
    { id: 'settings', label: 'Settings', icon: <FaCog />, path: '/recruiter/settings' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/recruiter/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <>
      <div className={`recruiter-sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-content">
          <div className="sidebar-header p-3 border-bottom border-light">
            <div className="d-flex align-items-center justify-content-between">
              {isOpen && (
                <h5 className="mb-0 d-flex align-items-center">
                  <FaBuilding className="me-2" /> Recruiter
                </h5>
              )}
              <button 
                onClick={toggleSidebar} 
                className="btn btn-link text-white p-0 ms-auto"
                aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
              </button>
            </div>
            {isOpen && user && (
              <div className="mt-2 text-white-50 small text-truncate">
                {user.email}
              </div>
            )}
          </div>
          
          <div className="recruiter-sidebar-menu">
            <Nav className="flex-column px-2 py-3">
              {menuItems.map((item) => (
                <Nav.Item key={item.id} className="mb-1">
                  <Nav.Link 
                    as={Link} 
                    to={item.path} 
                    className={`d-flex align-items-center py-2 px-3 rounded ${activeMenu === item.id ? 'active' : 'text-white-50'}`}
                  >
                    <div className="d-flex align-items-center">
                      <span className="me-3">{item.icon}</span>
                      {isOpen && <span className="font-weight-medium">{item.label}</span>}
                    </div>
                    {activeMenu === item.id && isOpen && (
                      <div className="active-indicator"></div>
                    )}
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>

            <div className="sidebar-footer mt-auto px-2 py-3 border-top border-light">
              {bottomMenuItems.map((item) => (
                <Nav.Item key={item.id} className="mb-1">
                  <Nav.Link 
                    as={Link} 
                    to={item.path} 
                    className={`d-flex align-items-center py-2 px-3 rounded ${activeMenu === item.id ? 'active' : 'text-white-50'}`}
                  >
                    <div className="d-flex align-items-center">
                      <span className="me-3">{item.icon}</span>
                      {isOpen && <span className="font-weight-medium">{item.label}</span>}
                    </div>
                    {activeMenu === item.id && isOpen && (
                      <div className="active-indicator"></div>
                    )}
                  </Nav.Link>
                </Nav.Item>
              ))}
              <Nav.Item>
                <Nav.Link 
                  onClick={handleLogout} 
                  className="d-flex align-items-center py-2 px-3 rounded text-white-50"
                >
                  <FaSignOutAlt className="me-3" />
                  {isOpen && <span className="font-weight-medium">Logout</span>}
                </Nav.Link>
              </Nav.Item>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="sidebar-backdrop d-lg-none"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Sidebar;
