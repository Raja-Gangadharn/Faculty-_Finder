import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaHeart } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import '../../assets/recruiter/FloatingActionButton.css';
import { FaQuestionCircle } from 'react-icons/fa';

const FloatingActionButton = () => {
  const location = useLocation();
  const isRecruiterRoute = location.pathname.startsWith('/recruiter');
  
  // Don't render anything if not on recruiter route
  if (!isRecruiterRoute) {
    return null;
  }
  const [show, setShow] = useState(false);

  const handleOpen = () => setShow(true);
  const handleClose = () => setShow(false);

  // Blur background when modal open
  useEffect(() => {
    const body = document.body;
    if (show) {
      body.classList.add('fab-modal-open');
    } else {
      body.classList.remove('fab-modal-open');
    }
  }, [show]);

  return (
    <>
      <button
        className="fab-btn btn rounded-circle d-flex align-items-center justify-content-center"
        onClick={handleOpen}
        aria-label="Donate"
      >
        <FaQuestionCircle size={24} color="white" />
      </button>

      <Modal
        show={show}
        onHide={handleClose}
        centered
        backdropClassName="fab-backdrop"
        dialogClassName="fab-modal-dialog">
        <Modal.Header closeButton>
          <Modal.Title>Your Support Matters</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Embedded YouTube video */}
          <div className="ratio ratio-16x9">
            {/* Replace the videoId with your actual YouTube video ID */}
            <iframe
              src={`https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0`}
              title="Faculty Finder Donation Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default FloatingActionButton;
