import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Container } from 'react-bootstrap';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Don't show breadcrumbs on the dashboard
  if (pathnames.length <= 1) return null;

  // Map route segments to display names
  const getBreadcrumbName = (path) => {
    const nameMap = {
      'faculty': 'Home',
      'dashboard': 'Dashboard',
      'profile': 'My Profile',
      'job-opportunities': 'Job Opportunities',
      'basic-info': 'Basic Info',
      'educational-info': 'Educational Info',
      'experience': 'Experience',
      'certificates': 'Certificates',
      'memberships': 'Memberships',
      'transcript': 'Transcript',
      'documents': 'Documents'
    };
    return nameMap[path] || path.replace(/-/g, ' ');
  };

  // Don't show breadcrumbs for login/registration
  if (pathnames.includes('login') || pathnames.includes('register')) {
    return null;
  }

  return (
    <Container fluid className="bg-light py-2 border-bottom mt-0">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item">
            <Link to="/faculty/dashboard" className="text-decoration-none">
              <i className="bi bi-house-door-fill me-1"></i>
              Home
            </Link>
          </li>
          {pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;
            
            // Skip the first segment (faculty)
            if (index === 0) return null;

            return isLast ? (
              <li key={name} className="breadcrumb-item active" aria-current="page">
                {getBreadcrumbName(name)}
              </li>
            ) : (
              <li key={name} className="breadcrumb-item">
                <Link to={routeTo} className="text-decoration-none">
                  {getBreadcrumbName(name)}
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>
    </Container>
  );
};

export default Breadcrumbs;
