import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { format } from 'date-fns';

const StatusUpdateModal = ({ show, onHide, invite, onUpdate }) => {
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [timezone, setTimezone] = useState('EST');
  const [hiredType, setHiredType] = useState('full_time');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (invite?.lastUpdate) {
      setStatus(invite.lastUpdate.status || '');
      setNotes(invite.lastUpdate.notes || '');
      setDate(invite.lastUpdate.date ? format(new Date(invite.lastUpdate.date), 'yyyy-MM-dd') : '');
      setTime(invite.lastUpdate.interviewTime || '');
      setTimezone(invite.lastUpdate.timezone || 'EST');
      setHiredType(invite.lastUpdate.hiredType || 'full_time');
    } else {
      setStatus('');
      setNotes('');
      setDate('');
      setTime('');
      setTimezone('EST');
      setHiredType('full_time');
    }
  }, [invite, show]);

  const validate = () => {
    const newErrors = {};
    
    if (!status) newErrors.status = 'Status is required';
    if (!date) newErrors.date = 'Date is required';
    
    if (status === 'interview' && !time) {
      newErrors.time = 'Time is required for interviews';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    const updateData = {
      status,
      notes,
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      ...(status === 'interview' && {
        interviewTime: time,
        timezone
      }),
      ...(status === 'hired' && {
        hiredType
      })
    };
    
    onUpdate(updateData);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Update Status</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="mb-3">
            <Form.Group as={Col} md={6} controlId="status">
              <Form.Label>Status <span className="text-danger">*</span></Form.Label>
              <Form.Select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                isInvalid={!!errors.status}
              >
                <option value="">Select status</option>
                <option value="follow_up">Follow Up</option>
                <option value="interview">Interview</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.status}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group as={Col} md={6} controlId="date">
              <Form.Label>Date <span className="text-danger">*</span></Form.Label>
              <Form.Control 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                isInvalid={!!errors.date}
              />
              <Form.Control.Feedback type="invalid">
                {errors.date}
              </Form.Control.Feedback>
            </Form.Group>
          </Row>

          {status === 'interview' && (
            <Row className="mb-3">
              <Form.Group as={Col} md={6} controlId="time">
                <Form.Label>Time <span className="text-danger">*</span></Form.Label>
                <Form.Control 
                  type="time" 
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  isInvalid={!!errors.time}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.time}
                </Form.Control.Feedback>
              </Form.Group>
              
              <Form.Group as={Col} md={6} controlId="timezone">
                <Form.Label>Timezone</Form.Label>
                <Form.Select 
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  <option value="EST">Eastern Time (EST)</option>
                  <option value="CST">Central Time (CST)</option>
                  <option value="MST">Mountain Time (MST)</option>
                  <option value="PST">Pacific Time (PST)</option>
                </Form.Select>
              </Form.Group>
            </Row>
          )}

          {status === 'hired' && (
            <Form.Group className="mb-3" controlId="hiredType">
              <Form.Label>Hired Type</Form.Label>
              <Form.Select 
                value={hiredType}
                onChange={(e) => setHiredType(e.target.value)}
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
              </Form.Select>
            </Form.Group>
          )}

          <Form.Group className="mb-3" controlId="notes">
            <Form.Label>Remarks</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes or details..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Update Status
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default StatusUpdateModal;
