import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { FaEnvelope, FaCommentDots, FaCheck, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import '../../assets/faculty/sidebar-footer.css';

const SidebarFooter = () => {
  const [showContact, setShowContact] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ success: null, message: '' });
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    feedback: ''
  });

  useEffect(() => {
    // Clear status messages after 5 seconds
    if (submitStatus.message) {
      const timer = setTimeout(() => {
        setSubmitStatus({ success: null, message: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [submitStatus]);

  const validateForm = (type) => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (type === 'contact' && !formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    if (type === 'feedback' && !formData.feedback.trim()) {
      newErrors.feedback = 'Feedback is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    
    if (!validateForm(type)) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus({ success: null, message: '' });
    
    try {
      // Replace with your actual API endpoint
      const endpoint = type === 'contact' ? '/api/contact' : '/api/feedback';
      const payload = type === 'contact' 
        ? { name: formData.name, email: formData.email, message: formData.message }
        : { name: formData.name, email: formData.email, feedback: formData.feedback };
      
      // Simulate API call - replace with actual axios call
      // const response = await axios.post(endpoint, payload);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      
      setSubmitStatus({
        success: true,
        message: type === 'contact' 
          ? 'Your message has been sent successfully! We\'ll get back to you soon.'
          : 'Thank you for your feedback! We appreciate your input.'
      });
      
      // Reset form and close modal after successful submission
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          message: '',
          feedback: ''
        });
        
        if (type === 'contact') {
          setShowContact(false);
        } else {
          setShowFeedback(false);
        }
        
        setIsSubmitting(false);
      }, 2000);
      
    } catch (error) {
      console.error(`Error submitting ${type}:`, error);
      setSubmitStatus({
        success: false,
        message: 'An error occurred while submitting. Please try again later.'
      });
      setIsSubmitting(false);
    }
  };
  
  const handleModalClose = (type) => {
    setErrors({});
    setSubmitStatus({ success: null, message: '' });
    if (type === 'contact') {
      setShowContact(false);
    } else {
      setShowFeedback(false);
    }
  };

  return (
    <div className="sidebar-footer">
      <button 
        className="sidebar-footer-btn d-flex align-items-center" 
        onClick={() => setShowContact(true)}
        aria-label="Contact Us"
        onKeyDown={(e) => e.key === 'Enter' && setShowContact(true)}
      >
        <FaEnvelope className="me-2" /> 
        <span>Contact Us</span>
      </button>
      
      <button 
        className="sidebar-footer-btn d-flex align-items-center mt-2" 
        onClick={() => setShowFeedback(true)}
        aria-label="Give Feedback"
        onKeyDown={(e) => e.key === 'Enter' && setShowFeedback(true)}
      >
        <FaCommentDots className="me-2" /> 
        <span>Feedback</span>
      </button>

      {/* Contact Us Modal */}
      <Modal 
        show={showContact} 
        onHide={() => handleModalClose('contact')}
        className="modal-custom"
        centered
        backdrop={isSubmitting ? 'static' : true}
        keyboard={!isSubmitting}
      >
        <Modal.Header closeButton={!isSubmitting}>
          <Modal.Title>
            <FaEnvelope className="me-2" />
            Contact Us
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={(e) => handleSubmit(e, 'contact')} noValidate>
          <Modal.Body>
            {submitStatus.message && (
              <Alert variant={submitStatus.success ? 'success' : 'danger'} className="mb-4">
                {submitStatus.success ? <FaCheck className="me-2" /> : <FaTimes className="me-2" />}
                {submitStatus.message}
              </Alert>
            )}
            
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                isInvalid={!!errors.name}
                disabled={isSubmitting}
                placeholder="Your name"
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                isInvalid={!!errors.email}
                disabled={isSubmitting}
                placeholder="your.email@example.com"
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Message</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={4}
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                isInvalid={!!errors.message}
                disabled={isSubmitting}
                placeholder="How can we help you?"
                style={{ resize: 'vertical' }}
              />
              <Form.Control.Feedback type="invalid">
                {errors.message}
              </Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          
          <Modal.Footer className="border-0 pt-0 px-4 pb-3">
            <Button 
              variant="outline-secondary" 
              onClick={() => handleModalClose('contact')}
              disabled={isSubmitting}
              className="px-4"
              style={{
                transition: 'all 0.2s ease',
                minWidth: '100px'
              }}
            >
              Close
            </Button>
            <Button 
              type="submit" 
              className="btn-submit px-4"
              disabled={isSubmitting}
              style={{
                transition: 'all 0.2s ease',
                minWidth: '140px',
                fontWeight: 500
              }}
            >
              {isSubmitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Sending...
                </>
              ) : (
                'Send Message'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Feedback Modal */}
      <Modal 
        show={showFeedback} 
        onHide={() => handleModalClose('feedback')}
        className="modal-custom"
        centered
        backdrop={isSubmitting ? 'static' : true}
        keyboard={!isSubmitting}
      >
        <Modal.Header closeButton={!isSubmitting}>
          <Modal.Title>
            <FaCommentDots className="me-2" />
            Share Your Feedback
          </Modal.Title>
        </Modal.Header>
        
        <Form onSubmit={(e) => handleSubmit(e, 'feedback')} noValidate>
          <Modal.Body>
            {submitStatus.message && (
              <Alert variant={submitStatus.success ? 'success' : 'danger'} className="mb-4">
                {submitStatus.success ? <FaCheck className="me-2" /> : <FaTimes className="me-2" />}
                {submitStatus.message}
              </Alert>
            )}
            
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                isInvalid={!!errors.name}
                disabled={isSubmitting}
                placeholder="Your name (optional)"
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                isInvalid={!!errors.email}
                disabled={isSubmitting}
                placeholder="your.email@example.com (optional)"
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group>
              <Form.Label>We'd love to hear your thoughts!</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="feedback"
                value={formData.feedback}
                onChange={handleInputChange}
                isInvalid={!!errors.feedback}
                disabled={isSubmitting}
                placeholder="What do you think about our service?"
                style={{ resize: 'vertical' }}
              />
              <Form.Control.Feedback type="invalid">
                {errors.feedback}
              </Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          
          <Modal.Footer className="border-0 pt-0 px-4 pb-3">
            <Button 
              variant="outline-secondary" 
              onClick={() => handleModalClose('feedback')}
              disabled={isSubmitting}
              className="px-4"
              style={{
                transition: 'all 0.2s ease',
                minWidth: '100px'
              }}
            >
              Close
            </Button>
            <Button 
              type="submit" 
              className="btn-submit px-4"
              disabled={isSubmitting}
              style={{
                transition: 'all 0.2s ease',
                minWidth: '140px',
                fontWeight: 500
              }}
            >
              {isSubmitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Submitting...
                </>
              ) : (
                'Submit Feedback'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default SidebarFooter;
