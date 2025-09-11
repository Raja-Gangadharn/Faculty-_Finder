import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import TopNavbar from '../components/recruiter/TopNavbar';
import Sidebar from '../components/recruiter/Sidebar';
import Footer from '../components/recruiter/Footer';
import '../assets/recruiter/recruiter-scoped.css';
import FloatingActionButton from '../components/recruiter/FloatingActionButton';

const RecruiterLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const [showFab, setShowFab] = useState(true);

  useEffect(() => {
    // Hide FAB on login page
    const hideFabRoutes = ['/recruiter/login'];
    setShowFab(!hideFabRoutes.includes(location.pathname));
  }, [location.pathname]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="recruiter-portal d-flex flex-column min-vh-100">
      <TopNavbar toggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
      
      <div className="d-flex flex-grow-1" style={{ marginTop: '56px' }}>
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        
        <main className={`main-content flex-grow-1 p-3 ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <Container fluid className="py-3 h-100">
            <div className="content-wrapper">
              <Outlet />
            </div>
            <Footer className="mt-auto " />
          </Container>
          {showFab && <FloatingActionButton />}
        </main>
      </div>
    </div>
  );
};

export default RecruiterLayout;