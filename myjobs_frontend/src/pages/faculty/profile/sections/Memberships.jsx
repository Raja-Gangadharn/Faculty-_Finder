import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Form, ListGroup, Spinner, Alert, Modal } from 'react-bootstrap';
import { FaPlus, FaTrash, FaCalendarAlt, FaEdit } from 'react-icons/fa';
import facultyService from '../../../../services/facultyService';
import { toast } from 'react-toastify';

const Memberships = ({ isEditing }) => {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [membershipToDelete, setMembershipToDelete] = useState(null);

  const [newMembership, setNewMembership] = useState({
    organization: '',
    membershipId: '',
    startDate: '',
    endDate: '',
    isCurrent: false
  });

  // Fetch memberships on component mount and when isEditing changes
  useEffect(() => {
    console.log('Fetching memberships...');
    fetchMemberships();
  }, [isEditing]);

  const fetchMemberships = async () => {
    try {
      console.log('Starting to fetch memberships...');
      setLoading(true);
      setError('');
      const response = await facultyService.getMemberships();
      console.log('Raw API response:', response);

      // Handle different response formats
      let membershipsData = [];
      if (Array.isArray(response)) {
        membershipsData = response;
      } else if (response && Array.isArray(response.data)) {
        membershipsData = response.data;
      } else if (response && response.results && Array.isArray(response.results)) {
        membershipsData = response.results;
      } else if (response && response.memberships && Array.isArray(response.memberships)) {
        membershipsData = response.memberships;
      } else if (response && typeof response === 'object' && Object.keys(response).length > 0) {
        // If response is an object with membership data, convert to array
        membershipsData = [response];
      }

      console.log('Processed memberships data:', membershipsData);
      setMemberships(membershipsData);

      if (membershipsData.length === 0) {
        console.log('No memberships found in the response');
      }
    } catch (err) {
      console.error('Error in fetchMemberships:', err);
      const errorMsg = err.response?.data?.message ||
        err.message ||
        'Failed to load memberships. Please try again.';
      setError(errorMsg);
      setMemberships([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateForBackend = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const handleAddMembership = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Format dates for backend
      const membershipData = {
        organization: newMembership.organization,
        membership_id: newMembership.membershipId,
        start_date: formatDateForBackend(newMembership.startDate),
        end_date: newMembership.isCurrent ? null : formatDateForBackend(newMembership.endDate),
        is_current: newMembership.isCurrent
      };

      console.log('Submitting membership data:', membershipData);

      let response;
      if (editingId) {
        console.log('Updating membership with ID:', editingId);
        response = await facultyService.updateMembership(editingId, membershipData);
        console.log('Update response:', response);

        // Update the local state with the updated membership
        setMemberships(prev => {
          const updated = prev.map(m =>
            m.id === editingId ? { ...m, ...(response.data || response) } : m
          );
          console.log('Updated memberships state:', updated);
          return updated;
        });
        setSuccess('Membership updated successfully');
      } else {
        console.log('Creating new membership');
        response = await facultyService.createMembership(membershipData);
        console.log('Create response:', response);

        // Extract the new membership from the response
        const newMembershipData = response.data || response;

        // Add the new membership to the local state
        setMemberships(prev => {
          const updated = [...prev, newMembershipData];
          console.log('Updated memberships state with new item:', updated);
          return updated;
        });
        setSuccess('Membership added successfully');
      }

      // Reset form
      setNewMembership({
        organization: '',
        membershipId: '',
        startDate: '',
        endDate: '',
        isCurrent: false
      });
      setShowAddForm(false);
      setEditingId(null);

      // Show success toast
      toast.success(editingId ? 'Membership updated successfully' : 'Membership added successfully', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    } catch (err) {
      console.error('Error in handleAddMembership:', err);
      const errorMsg = err.response?.data?.message ||
        err.message ||
        'Failed to save membership. Please check your connection and try again.';
      setError(errorMsg);

      // Show error toast
      toast.error(errorMsg, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (membership) => {
    console.log('Editing membership:', membership);
    setNewMembership({
      organization: membership.organization || '',
      membershipId: membership.membership_id || '',
      startDate: membership.start_date ? membership.start_date.split('T')[0] : '',
      endDate: membership.end_date ? membership.end_date.split('T')[0] : '',
      isCurrent: membership.is_current || false
    });
    setEditingId(membership.id);
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    setMembershipToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!membershipToDelete) return;

    try {
      setLoading(true);
      await facultyService.deleteMembership(membershipToDelete);

      // Update the local state by removing the deleted membership
      setMemberships(prev => prev.filter(m => m.id !== membershipToDelete));

      toast.success('Membership deleted successfully');
    } catch (err) {
      console.error('Error deleting membership:', err);
      const errorMsg = err.response?.data?.message || 'Failed to delete membership. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setMembershipToDelete(null);
    }
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'Present';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Present' : date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Present';
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Professional Memberships</h5>
        {isEditing && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddForm(true)}
            disabled={loading}
          >
            <FaPlus className="me-1" /> Add Membership
          </Button>
        )}
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {loading && !memberships.length ? (
          <div className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : showAddForm ? (
          <Form onSubmit={handleAddMembership}>
            <Row>
              <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Label>Organization</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Organization name"
                    value={newMembership.organization}
                    onChange={(e) =>
                      setNewMembership({ ...newMembership, organization: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Membership ID</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Membership ID"
                    value={newMembership.membershipId}
                    onChange={(e) =>
                      setNewMembership({ ...newMembership, membershipId: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={3} className="mb-3">
                <Form.Group>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={newMembership.startDate}
                    onChange={(e) =>
                      setNewMembership({ ...newMembership, startDate: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3} className="mb-3">
                <Form.Group>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={newMembership.endDate}
                    onChange={(e) =>
                      setNewMembership({ ...newMembership, endDate: e.target.value })
                    }
                    disabled={newMembership.isCurrent}
                    required={!newMembership.isCurrent}
                  />
                </Form.Group>
                <Form.Check
                  type="checkbox"
                  id="isCurrent"
                  label="Current Membership"
                  checked={newMembership.isCurrent}
                  onChange={(e) =>
                    setNewMembership({ ...newMembership, isCurrent: e.target.checked })
                  }
                  className="mt-2"
                />
              </Col>
              <Col xs={12} className="mt-3">
                <Button variant="primary" type="submit" className="me-2" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner as="span" size="sm" animation="border" role="status" className="me-1" />
                      {editingId ? 'Updating...' : 'Adding...'}
                    </>
                  ) : editingId ? (
                    'Update Membership'
                  ) : (
                    'Add Membership'
                  )}
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingId(null);
                    setNewMembership({
                      organization: '',
                      membershipId: '',
                      startDate: '',
                      endDate: '',
                      isCurrent: false
                    });
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </Col>
            </Row>
          </Form>
        ) : memberships.length > 0 ? (
          <ListGroup variant="flush">
            {memberships.map((membership) => (
              <ListGroup.Item key={membership.id} className="py-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="mb-1">{membership.organization}</h6>
                    {membership.membership_id && (
                      <small className="text-muted d-block">ID: {membership.membership_id}</small>
                    )}
                    <small className="text-muted">
                      {formatDisplayDate(membership.start_date)} - {formatDisplayDate(membership.end_date)}
                      {membership.is_current && ' (Current)'}
                    </small>
                  </div>
                  {isEditing && (
                    <div className="d-flex">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(membership)}
                        disabled={loading}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(membership.id)}
                        disabled={loading}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  )}
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <p className="text-muted mb-0">No memberships added yet.</p>
        )}
      </Card.Body>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this membership? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default Memberships;
