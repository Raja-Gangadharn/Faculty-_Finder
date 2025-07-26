import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { FaStar } from 'react-icons/fa';

const Feedback = ({ show, onHide }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle feedback submission (e.g., API call)
    console.log('Feedback submitted:', { rating, feedback });
    onHide();
    // Reset form
    setRating(0);
    setFeedback('');
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Share Your Feedback</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-4 text-center">
            <Form.Label className="d-block mb-3">
              How would you rate your experience?
            </Form.Label>
            <div className="star-rating">
              {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                  <label key={index} className="star-label">
                    <input
                      type="radio"
                      name="rating"
                      value={ratingValue}
                      onClick={() => setRating(ratingValue)}
                      className="d-none"
                    />
                    <FaStar
                      className="star"
                      color={ratingValue <= (hover || rating) ? '#ffc107' : '#e4e5e9'}
                      size={32}
                      onMouseEnter={() => setHover(ratingValue)}
                      onMouseLeave={() => setHover(0)}
                      style={{ cursor: 'pointer', margin: '0 2px' }}
                    />
                  </label>
                );
              })}
            </div>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Your Feedback</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your thoughts with us..."
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Close
          </Button>
          <Button variant="primary" type="submit" disabled={rating === 0}>
            Submit Feedback
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default Feedback;
