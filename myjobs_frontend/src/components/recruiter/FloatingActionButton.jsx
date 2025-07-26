import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaPlayCircle,FaCommentDots, FaPlus, FaTimes, FaMobile, FaPhone } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import '../../assets/recruiter/FloatingActionButton.css';
import ContactUs from './ContactUs';
import Feedback from './Feedback';
import { FaStar } from 'react-icons/fa';

const FloatingActionButton = () => {
  const location = useLocation();
  const isRecruiterRoute = location.pathname.startsWith('/recruiter');
  const [expanded, setExpanded] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showContactUs, setShowContactUs] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  if (!isRecruiterRoute) return null;

  const toggleMenu = () => setExpanded(!expanded);

  const openTutorial = () => {
    setShowTutorial(true);
    setExpanded(false);
  };

  const closeTutorial = () => setShowTutorial(false);

  return (
    <>
      {/* Sub Buttons */}
      <div className={`fab-sub-buttons ${expanded ? 'show' : ''}`}>
        <button 
          className="fab-sub-btn" 
          title="Contact Us" 
          onClick={() => {
            setShowContactUs(true);
            setExpanded(false);
          }}
        >
          <FaPhone />
        </button>
        <button 
          className="fab-sub-btn" 
          title="Feedback" 
          onClick={() => {
            setShowFeedback(true);
            setExpanded(false);
          }}
        >
          <FaCommentDots />
        </button>
        <button className="fab-sub-btn" title="Tutorial" onClick={openTutorial}>
          <FaPlayCircle />
        </button>
      </div>

      {/* Main FAB */}
      <button
        className="fab-btn btn rounded-circle d-flex align-items-center justify-content-center"
        onClick={toggleMenu}
        aria-label="Menu"
      >
        {expanded ? <FaTimes /> : <FaPlus />}
      </button>

      {/* Contact Us Modal */}
      <ContactUs 
        show={showContactUs} 
        onHide={() => setShowContactUs(false)} 
      />

      {/* Feedback Modal */}
      <Feedback 
        show={showFeedback} 
        onHide={() => setShowFeedback(false)} 
      />

      {/* Tutorial Modal */}
      <Modal
        show={showTutorial}
        onHide={closeTutorial}
        centered
        backdropClassName="fab-backdrop"
        dialogClassName="fab-modal-dialog"
      >
        <Modal.Header closeButton>
          <Modal.Title>Tutorial</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="ratio ratio-16x9">
            <iframe
              src={`https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0`}
              title="Tutorial Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeTutorial}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default FloatingActionButton;