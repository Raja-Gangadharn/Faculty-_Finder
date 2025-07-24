import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaLinkedinIn, FaTwitter, FaUniversity, FaGraduationCap, FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../../assets/faculty/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="faculty-footer">
      <Container>
        <Row className="footer-bottom">
          <Col md={6} className="text-center text-md-start">
            <p className="mb-0">&copy; {currentYear} Faculty Finder. All rights reserved.</p>
            <div className="legal-links">
              <Link to="/privacy-policy">Privacy Policy</Link>
              <span className="divider">|</span>
              <Link to="/terms">Terms of Service</Link>
              <span className="divider">|</span>
              <Link to="/cookies">Cookie Policy</Link>
            </div>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <div className="social-links mx-5">
              <a href="https://linkedin.com/company/faculty-finder" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <FaLinkedinIn />
              </a>
              <a href="https://twitter.com/facultyfinder" target="_blank" rel="noreferrer" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="https://facebook.com/facultyfinder" target="_blank" rel="noreferrer" aria-label="Facebook">
                <FaUniversity />
              </a>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
