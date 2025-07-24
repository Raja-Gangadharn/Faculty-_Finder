import React, { useEffect } from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaUserEdit,
  FaGraduationCap,
  FaBriefcase,
  FaSignOutAlt,
  FaTimes,
  FaFileAlt
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import '../../assets/faculty/Sidebar.css';
import '../../assets/faculty/sidebar-footer.css';
import SidebarFooter from './SidebarFooter';

const Sidebar = ({ onLinkClick, isOpen, onClose }) => {
  // Close sidebar when clicking outside or pressing Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (isOpen && !e.target.closest('.faculty-sidebar')) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  const { logout } = useAuth();
  const location = useLocation();
  const activeMenu = location.pathname.split('/')[2] || 'dashboard';

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth < 992) {
      onClose();
    }
  }, [location, isOpen, onClose]);

  const handleLinkClick = () => {
    onLinkClick();
    if (window.innerWidth < 992) {
      onClose();
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaHome className="me-2" />, path: '/faculty/dashboard' },
    { id: 'profile', label: 'My Profile', icon: <FaUserEdit className="me-2" />, path: '/faculty/profile' },
    { id: 'jobs', label: 'Job Opportunities', icon: <FaBriefcase className="me-2" />, path: '/faculty/jobs' },
    { id: 'applications', label: 'My Applications', icon: <FaFileAlt className="me-2" />, path: '/faculty/applications' },
  ];

  return (
    <>
      <div className={`faculty-portal sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={onClose} role="button" aria-label="Close sidebar" tabIndex={isOpen ? 0 : -1} />
      <div 
        className={`faculty-portal faculty-sidebar d-flex flex-column ${isOpen ? 'show' : ''}`}
        aria-hidden={!isOpen}
        aria-label="Sidebar navigation"
      >
        <div className="flex-grow-1 d-flex flex-column">
          <div>
            <div className="sidebar-header d-flex justify-content-between align-items-center">
              <h3 className="m-0">Faculty Portal</h3>
              <button 
                className="btn btn-link text-white d-lg-none p-0"
                onClick={onClose}
                aria-label="Close sidebar"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="sidebar-menu">
              <Nav className="flex-column w-100">
                {menuItems.map((item) => (
                  <Nav.Link
                    key={item.id}
                    as={Link}
                    to={item.path}
                    className={`nav-link ${activeMenu === item.id ? 'active' : ''}`}
                    onClick={handleLinkClick}
                  >
                    {item.icon}
                    {item.label}
                  </Nav.Link>
                ))}
              </Nav>
            </div>
          </div>
          
          {/* Sidebar Footer with Contact and Feedback */}
          <div className="mt-auto">
            <SidebarFooter />
            <div className="sidebar-logout">
              <button
                onClick={() => {
                  logout();
                  onLinkClick();
                }}
                className="w-100 text-start"
              >
                <FaSignOutAlt className="me-2" /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
