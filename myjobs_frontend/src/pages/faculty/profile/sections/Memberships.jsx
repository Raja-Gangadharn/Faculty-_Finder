import React, { useState } from 'react';
import { Card, Button, Row, Col, Form, ListGroup, Badge } from 'react-bootstrap';
import { FaPlus, FaTrash, FaUniversity, FaCalendarAlt } from 'react-icons/fa';

const Memberships = ({ isEditing }) => {
  const [memberships, setMemberships] = useState([
    {
      id: 1,
      organization: 'Association for Computing Machinery (ACM)',
      membershipId: 'ACM-12345',
      startDate: '2020-01-15',
      endDate: '2024-01-15',
      isCurrent: true
    },
    {
      id: 2,
      organization: 'Institute of Electrical and Electronics Engineers (IEEE)',
      membershipId: 'IEEE-67890',
      startDate: '2019-05-10',
      endDate: '2023-05-10',
      isCurrent: false
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newMembership, setNewMembership] = useState({
    organization: '',
    membershipId: '',
    startDate: '',
    endDate: '',
    isCurrent: false
  });

  const handleAddMembership = () => {
    setMemberships([...memberships, { ...newMembership, id: Date.now() }]);
    setNewMembership({
      organization: '',
      membershipId: '',
      startDate: '',
      endDate: '',
      isCurrent: false
    });
    setShowAddForm(false);
  };

  const handleRemoveMembership = (id) => {
    setMemberships(memberships.filter(membership => membership.id !== id));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewMembership({
      ...newMembership,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const isExpired = (endDate) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  const organizationOptions = [
    'Association for Computing Machinery (ACM)',
    'Institute of Electrical and Electronics Engineers (IEEE)',
    'Association for Information Systems (AIS)',
    'Computer Science Teachers Association (CSTA)',
    'National Science Teaching Association (NSTA)',
    'Other'
  ];

  return (
    <Card className="mb-4">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="section-title mb-0">Professional Memberships</h5>
          {isEditing && (
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <FaPlus className="me-1" /> Add Membership
            </Button>
          )}
        </div>

        {showAddForm && isEditing && (
          <Card className="mb-4 border-primary">
            <Card.Body>
              <h6 className="mb-3">Add New Membership</h6>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Organization</Form.Label>
                    <Form.Select 
                      name="organization" 
                      value={newMembership.organization}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Organization</option>
                      {organizationOptions.map(org => (
                        <option key={org} value={org}>{org}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Membership ID</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="membershipId" 
                      value={newMembership.membershipId}
                      onChange={handleInputChange}
                      placeholder="e.g., ACM-12345"
                    />
                  </Form.Group>
                </Col>
                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label>Start Date</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text "><FaCalendarAlt className="my-2" /></span>
                      <Form.Control 
                        type="date" 
                        name="startDate" 
                        value={newMembership.startDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </Form.Group>
                </Col>
                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label>End Date</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text"><FaCalendarAlt className="my-2" /></span>
                      <Form.Control 
                        type="date" 
                        name="endDate" 
                        value={newMembership.endDate}
                        onChange={handleInputChange}
                        min={newMembership.startDate}
                        disabled={newMembership.isCurrent}
                      />
                    </div>
                  </Form.Group>
                </Col>
                <Col md={4} className="mb-3 d-flex align-items-end">
                  <Form.Check
                    type="checkbox"
                    id="isCurrent"
                    label="Current Membership"
                    name="isCurrent"
                    checked={newMembership.isCurrent}
                    onChange={(e) => {
                      handleInputChange(e);
                      if (e.target.checked) {
                        setNewMembership(prev => ({
                          ...prev,
                          endDate: ''
                        }));
                      }
                    }}
                    className="mt-3"
                  />
                </Col>
                <Col md={12} className="text-end">
                  <Button 
                    variant="outline-secondary" 
                    className="me-2"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary"
                    onClick={handleAddMembership}
                    disabled={!newMembership.organization || !newMembership.startDate || (!newMembership.isCurrent && !newMembership.endDate)}
                  >
                    Add Membership
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        {memberships.length > 0 ? (
          <ListGroup variant="flush">
            {memberships.map((membership) => (
              <ListGroup.Item key={membership.id} className="py-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="d-flex">
                    <div className="me-3 text-primary">
                      <FaUniversity size={20} />
                    </div>
                    <div>
                      <h6 className="mb-1">{membership.organization}</h6>
                      <p className="mb-1 text-muted">
                        <strong>Membership ID:</strong> {membership.membershipId || 'N/A'}
                      </p>
                      <p className="mb-0 text-muted small">
                        <FaCalendarAlt className="me-1" />
                        {formatDate(membership.startDate)} - {membership.isCurrent ? 'Present' : formatDate(membership.endDate)}
                        {!membership.isCurrent && isExpired(membership.endDate) && (
                          <Badge bg="danger" className="ms-2">Expired</Badge>
                        )}
                        {membership.isCurrent && (
                          <Badge bg="success" className="ms-2">Active</Badge>
                        )}
                      </p>
                    </div>
                  </div>
                  {isEditing && (
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleRemoveMembership(membership.id)}
                    >
                      <FaTrash />
                    </Button>
                  )}
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <div className="text-center py-4">
            <FaUniversity size={32} className="text-muted mb-2" />
            <p className="text-muted">No memberships added yet.</p>
            {isEditing && (
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => setShowAddForm(true)}
              >
                <FaPlus className="me-1" /> Add Membership
              </Button>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default Memberships;
