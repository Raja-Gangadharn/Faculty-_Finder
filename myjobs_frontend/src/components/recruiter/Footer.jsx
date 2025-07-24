import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaLinkedin, FaTwitter, FaGithub } from 'react-icons/fa';
import '../../assets/recruiter/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="recruiter-footer py-4 bg-white border-top">
      <Container>
        <Row className="g-4">
          <Col lg={4} className="mb-4 mb-lg-0">
            <h5 className="text-success mb-3">Faculty Finder</h5>
            <p className="text-muted mb-3">
              Connecting top academic talent with leading institutions worldwide.
              Streamlining the recruitment process for both recruiters and faculty members.
            </p>
            <div className="social-links">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted me-3">
                <FaLinkedin size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted me-3">
                <FaTwitter size={20} />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted">
                <FaGithub size={20} />
              </a>
            </div>
          </Col>
          
          <Col md={4} lg={2} className="mb-4 mb-md-0">
            <h6 className="text-uppercase fw-bold mb-3">For Recruiters</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="/recruiter/search" className="text-muted text-decoration-none">Search Faculty</a>
              </li>
              <li className="mb-2">
                <a href="/recruiter/saved" className="text-muted text-decoration-none">Saved Profiles</a>
              </li>
              <li className="mb-2">
                <a href="/recruiter/analytics" className="text-muted text-decoration-none">Analytics</a>
              </li>
              <li>
                <a href="/recruiter/company" className="text-muted text-decoration-none">Company Profile</a>
              </li>
            </ul>
          </Col>
          
          <Col md={4} lg={2} className="mb-4 mb-md-0">
            <h6 className="text-uppercase fw-bold mb-3">Resources</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="/blog" className="text-muted text-decoration-none">Blog</a>
              </li>
              <li className="mb-2">
                <a href="/help" className="text-muted text-decoration-none">Help Center</a>
              </li>
              <li className="mb-2">
                <a href="/webinars" className="text-muted text-decoration-none">Webinars</a>
              </li>
              <li>
                <a href="/api" className="text-muted text-decoration-none">API</a>
              </li>
            </ul>
          </Col>
          
          <Col md={4} lg={2}>
            <h6 className="text-uppercase fw-bold mb-3">Company</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="/about" className="text-muted text-decoration-none">About Us</a>
              </li>
              <li className="mb-2">
                <a href="/careers" className="text-muted text-decoration-none">Careers</a>
              </li>
              <li className="mb-2">
                <a href="/contact" className="text-muted text-decoration-none">Contact</a>
              </li>
              <li>
                <a href="/press" className="text-muted text-decoration-none">Press</a>
              </li>
            </ul>
          </Col>
        </Row>
        
        <hr className="my-4" />
        
        <Row className="align-items-center">
          <Col md={6} className="text-center text-md-start mb-3 mb-md-0">
            <p className="mb-0 text-muted">
              &copy; {currentYear} Faculty Finder. All rights reserved.
            </p>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <ul className="list-inline mb-0">
              <li className="list-inline-item">
                <a href="/privacy" className="text-muted text-decoration-none">Privacy Policy</a>
              </li>
              <li className="list-inline-item">
                <span className="mx-2 text-muted">•</span>
              </li>
              <li className="list-inline-item">
                <a href="/terms" className="text-muted text-decoration-none">Terms of Service</a>
              </li>
              <li className="list-inline-item">
                <span className="mx-2 text-muted">•</span>
              </li>
              <li className="list-inline-item">
                <a href="/cookies" className="text-muted text-decoration-none">Cookie Policy</a>
              </li>
            </ul>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
