import React, { useState } from 'react';
import { Modal, Button, Container, Row, Col } from 'react-bootstrap';
import { FaQuestionCircle } from 'react-icons/fa';
import '../../assets/faculty/Tutorial.css'

const TUTORIAL_CONTENT = {
  default: {
    title: 'Welcome to Faculty Portal',
    text: 'Get started with our tutorial videos to learn how to use the faculty portal effectively.',
    videoId: 'dQw4w9WgXcQ' // Replace with actual tutorial video ID
  }
  // Add more page-specific content here
};

const Tutorial = () => {
  const [show, setShow] = useState(false);
  const [currentContent, setCurrentContent] = useState(TUTORIAL_CONTENT.default);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      {/* Floating Tutorial Button */}
      <Button 
        variant="outline-light"
        className="tutorial-btn"
        onClick={handleShow}
      >
        <FaQuestionCircle size={24} color="white" />
      </Button>

      {/* Tutorial Modal */}
      <Modal 
        show={show}
        onHide={handleClose}
        centered
        backdrop="static"
        keyboard={true}
        size="lg"
        className="tutorial-modal"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="text-center w-100">
            {currentContent.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <Container fluid className="p-4">
            <Row className="mb-4">
              <Col md="12">
                <p className="text-muted mb-4">{currentContent.text}</p>
                <div className="ratio ratio-16x9 mb-4">
                  <iframe 
                    src={`https://www.youtube.com/embed/${currentContent.videoId}?autoplay=1&mute=1`}
                    title="Tutorial Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-3 shadow-sm"
                  />
                </div>
              </Col>
            </Row>
          </Container>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Tutorial;
