import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { Button, Container, Row, Col } from 'react-bootstrap';
import { FaBars } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/faculty/Sidebar';
import TopNavbar from '../components/faculty/TopNavbar';
import Breadcrumbs from '../components/faculty/Breadcrumbs';
import Footer from '../components/faculty/Footer';
import '../assets/faculty/faculty-scoped.css';
import Tutorial from '../components/faculty/Tutorial';
import '../assets/faculty/faculty-global.css';

const FacultyLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, isFaculty, isLoading } = useAuth();
  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  useEffect(() => {
    closeSidebar();
  }, [location]);

  // Apply dark mode class on component mount
  useEffect(() => {
    const facultyTheme = localStorage.getItem('facultyTheme');
    const facultyPortal = document.querySelector('.faculty-portal');
    if (facultyPortal) {
      if (facultyTheme === 'dark') {
        facultyPortal.classList.add('dark-mode');
      } else {
        facultyPortal.classList.remove('dark-mode');
      }
    }
  }, []);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !isFaculty) {
    return <Navigate to="/faculty/login" replace />;
  }

  return (
    <div className="faculty-portal d-flex flex-column min-vh-100">
      {/* Mobile Header */}
      <div className="d-lg-none bg-white p-3 d-flex align-items-center border-bottom">
        <Button 
          variant="link" 
          className="text-dark p-0 me-3" 
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <FaBars size={24} />
        </Button>
        <h5 className="mb-0">Faculty Dashboard</h5>
      </div>

      <div className="d-flex flex-grow-1">
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          onLinkClick={closeSidebar} 
        />
        
        <div className="main-content flex-grow-1 d-flex flex-column">
          <TopNavbar onToggleSidebar={toggleSidebar} />
          <Breadcrumbs />
          <Container fluid className="flex-grow-1 py-4">
            <Row>
              <Col>
                <Outlet />
              </Col>
            </Row>
          </Container>
          <Tutorial/>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default FacultyLayout;
