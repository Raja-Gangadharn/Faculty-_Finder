import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelopeOpenText } from 'react-icons/fa';
import "./recruiter.css";

const initialState = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

const ContactUs = () => {
  const [form, setForm] = useState(initialState);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: send to backend
    alert('Message sent!');
    setForm(initialState);
  };

  return (
    <>
      {/* Hero */}
      <section className="contact-hero text-white d-flex align-items-center justify-content-center">
        <h2 className="fw-bold">Contact Us</h2>
      </section>

      <Container className="py-5">
        {/* Google Map */}
        <Card className="mb-5 shadow-sm border-0">
          <Card.Body className="p-0">
            <iframe
              title="map"
              src="https://maps.google.com/maps?q=California&t=&z=10&ie=UTF8&iwloc=&output=embed"
              style={{ border: 0, width: '100%', height: '300px' }}
              allowFullScreen=""
              loading="lazy"
            />
          </Card.Body>
        </Card>

        <Row>
          {/* Form */}
          <Col lg={7} className="mb-4">
            <h5 className="mb-3 fw-semibold">Get in Touch</h5>
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3 g-3">
                <Col md={6}>
                  <Form.Control
                    placeholder="Your Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </Col>
                <Col md={6}>
                  <Form.Control
                    type="email"
                    placeholder="Your Email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </Col>
                <Col md={12}>
                  <Form.Control
                    placeholder="Subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                  />
                </Col>
                <Col md={12}>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    placeholder="Message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
                </Col>
              </Row>
              <Button variant="success" type="submit">
                Send Message
              </Button>
            </Form>
          </Col>

          {/* Contact Info */}
          <Col lg={5}>
            <h5 className="mb-3 fw-semibold">Contact Details</h5>
            <ul className="list-unstyled">
              <li className="d-flex mb-3">
                <FaMapMarkerAlt className="me-2 mt-1 text-success" />
                <span>Businesspark, California<br />Irvine, CA (U.S)</span>
              </li>
              <li className="d-flex mb-3">
                <FaPhoneAlt className="me-2 mt-1 text-success" />
                <span>+1 289 654 2365<br />Mon to Fri 9am–5pm</span>
              </li>
              <li className="d-flex">
                <FaEnvelopeOpenText className="me-2 mt-1 text-success" />
                <span>support@myjobs.com<br />We reply within 24 hrs</span>
              </li>
            </ul>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ContactUs
