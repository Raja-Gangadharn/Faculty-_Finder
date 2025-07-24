import React from 'react';
import { Outlet } from 'react-router-dom';
import '../assets/faculty/faculty-global.css';

const PublicLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <div className="flex-grow-1">
        <Outlet />
      </div>
      <footer className="bg-light py-3">
        <div className="container">
          <p className="text-center mb-0">&copy; {new Date().getFullYear()} Faculty Finder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
