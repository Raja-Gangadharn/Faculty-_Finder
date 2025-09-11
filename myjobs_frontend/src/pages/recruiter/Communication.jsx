import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Card, Button, Badge, ListGroup, Row, Col, Container, ButtonGroup, Modal } from 'react-bootstrap';
import { FaEnvelope, FaCheck, FaTimes, FaComment, FaPaperPlane, FaFilter, FaExternalLinkAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import StatusUpdateModal from '../../components/recruiter/StatusUpdateModal';
import communicationService from '../../services/communicationService';
import './styles/Communication.css';

const Communication = () => {
  const [activeTab, setActiveTab] = useState('invites');
  const [communicationData, setCommunicationData] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [activeThread, setActiveThread] = useState(null);
  const [inviteFilter, setInviteFilter] = useState('all');
  const [sentFilter, setSentFilter] = useState('all');
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [pendingReject, setPendingReject] = useState(null);

  // Load communication data
  useEffect(() => {
    loadCommunicationData();
  }, []);

  const loadCommunicationData = () => {
    const data = communicationService.getCommunicationData();
    setCommunicationData(data);
    setPendingCount(communicationService.getPendingInvitesCount());
  };

  // Handle tab change
  const handleTabSelect = (tab) => {
    setActiveTab(tab);
    setActiveThread(null); // Clear active thread when changing tabs
  };

  // Handle invite action (accept/reject)
  const handleInviteAction = (inviteId, action) => {
    if (action === 'rejected') {
      setPendingReject(inviteId);
      setShowRejectConfirm(true);
    } else {
      communicationService.updateInviteStatus(inviteId, action);
      loadCommunicationData(); // Refresh data
    }
  };

  // Confirm reject action
  const confirmReject = () => {
    if (pendingReject) {
      communicationService.updateInviteStatus(pendingReject, 'rejected');
      loadCommunicationData();
      setShowRejectConfirm(false);
      setPendingReject(null);
    }
  };

  const navigate = useNavigate();

  // Handle status update with auto-message
  const handleStatusUpdate = async (updateData) => {
    if (!selectedInvite) return;
    
    try {
      // First update the status
      await communicationService.addStatusUpdate(selectedInvite.id, updateData);
      
      // Generate appropriate auto-message based on status
      let messageContent = '';
      const jobType = selectedInvite.jobTitle.includes('Part Time') ? 'Part Time' : 'Full Time';
      
      switch(updateData.status) {
        case 'accepted':
          messageContent = 'Recruiter has accepted your application.';
          break;
        case 'rejected':
          messageContent = 'Recruiter has rejected your application.';
          // Reset active thread to force re-render with new status
          const currentThread = activeThread;
          setActiveThread(null);
          setTimeout(() => setActiveThread(currentThread), 0);
          break;
        case 'interview':
          messageContent = `Recruiter scheduled an interview on ${new Date(updateData.interviewDate).toLocaleString()} (${Intl.DateTimeFormat().resolvedOptions().timeZone}).`;
          break;
        case 'hired':
          messageContent = `Recruiter marked you as hired for ${jobType}.`;
          break;
        case 'follow_up':
          messageContent = `Recruiter added a follow-up note: ${updateData.remarks || 'No additional notes'}.`;
          break;
        default:
          messageContent = `Status updated to: ${updateData.status}`;
      }
      
      // Add the auto-message to the thread
      await communicationService.addMessage(selectedInvite.id, {
        sender: 'recruiter',
        content: messageContent,
        isSystem: true
      });
      
      // Refresh the data and force UI update
      await loadCommunicationData();
      
      // Close the status modal
      setShowStatusModal(false);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: 'warning',
      accepted: 'success',
      rejected: 'danger',
      follow_up: 'info',
      interview: 'primary',
      hired: 'success'
    };

    const statusText = {
      pending: 'Pending',
      accepted: 'Accepted',
      rejected: 'Rejected',
      follow_up: 'Follow Up',
      interview: 'Interview',
      hired: 'Hired'
    };

    return (
      <Badge bg={statusMap[status] || 'secondary'} className="ms-2">
        {statusText[status] || status}
      </Badge>
    );
  };

  // Render message thread
  const renderMessageThread = () => {
    if (!activeThread) return null;

    const thread = [...(communicationData?.invites || []), ...(communicationData?.sent || [])]
      .find(item => item.id === activeThread);

    if (!thread) return null;
    
    const isReadOnly = thread.status === 'rejected' || thread.status === 'pending';

    return (
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">{thread.facultyName}</h5>
            <small className="text-muted">{thread.jobTitle}</small>
          </div>
          <div>
            <Button 
              variant="outline-primary" 
              size="sm" 
              className="me-2"
              disabled={isReadOnly || thread.status === 'pending'}
              title={thread.status === 'pending' ? 'Status cannot be changed while invite is pending' : isReadOnly ? 'Status cannot be changed for rejected invites' : 'Update status'}
              onClick={() => {
                if (isReadOnly) return;
                setSelectedInvite(thread);
                setShowStatusModal(true);
              }}
            >
              Update Status
            </Button>
            {getStatusBadge(thread.status)}
          </div>
        </Card.Header>
        <Card.Body className="message-thread">
          {thread.status === 'rejected' && (
            <div className="alert alert-info mb-3" role="alert">
              <i className="bi bi-info-circle me-2"></i>
              This conversation is read-only because the application has been rejected.
            </div>
          )}
          {thread.status === 'pending' && (
            <div className="alert alert-warning mb-3" role="alert">
              <i className="bi bi-hourglass-split me-2"></i>
               You'll be able to message and update status once accept.
            </div>
          )}
          {thread.messages?.map((message) => (
            <div 
              key={message.id} 
              className={`message-bubble ${message.sender === 'recruiter' ? 'sent' : 'received'}`}
            >
              <div className="message-content">
                <div className="message-sender">
                  {message.sender === 'recruiter' ? 'You' : thread.facultyName.split(' ')[0]}
                </div>
                <div className="message-text">{message.content}</div>
                <div className="message-time">
                  {new Date(message.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
          
          {/* Message input */}
          <div className="message-input mt-3">
            <div className="input-group">
              <input 
                type="text" 
                className={`form-control ${isReadOnly || thread.status === 'pending' ? 'bg-light' : ''}`} 
                placeholder={isReadOnly ? 'This conversation is read-only' : thread.status === 'pending' ? 'Messages can only be sent after invite is accepted' : 'Type your message...'}
                disabled={isReadOnly || thread.status === 'pending'}
                onKeyPress={async (e) => {
                  if (isReadOnly || thread.status === 'pending') return;
                  
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    await communicationService.addMessage(activeThread, {
                      sender: 'recruiter',
                      content: e.target.value.trim()
                    });
                    e.target.value = '';
                    await loadCommunicationData();
                    // Scroll to bottom of messages after sending
                    const messageThread = document.querySelector('.message-thread');
                    if (messageThread) {
                      messageThread.scrollTop = messageThread.scrollHeight;
                    }
                  }
                }}
              />
              <Button 
                variant="primary"
                disabled={thread.status !== 'accepted'}
                title={thread.status === 'pending' ? 'Messages can only be sent after invite is accepted' : thread.status !== 'accepted' ? 'Messages can only be sent for accepted invites' : 'Send message'}
                onClick={async (e) => {
                  const input = e.target.closest('.input-group').querySelector('input');
                  if (input && input.value.trim()) {
                    await communicationService.addMessage(activeThread, {
                      sender: 'recruiter',
                      content: input.value.trim()
                    });
                    input.value = '';
                    await loadCommunicationData();
                    // Scroll to bottom of messages after sending
                    const messageThread = document.querySelector('.message-thread');
                    if (messageThread) {
                      messageThread.scrollTop = messageThread.scrollHeight;
                    }
                  }
                }}
              >
                <FaPaperPlane />
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  };

  // Filter items based on active tab and filter
  const getFilteredItems = () => {
    if (!communicationData) return [];
    
    const items = activeTab === 'invites' 
      ? [...communicationData.invites]
      : [...communicationData.sent];
      
    const currentFilter = activeTab === 'invites' ? inviteFilter : sentFilter;
    
    if (currentFilter === 'all') return items;
    
    return items.filter(item => 
      item.status === currentFilter || 
      (item.lastUpdate && item.lastUpdate.status === currentFilter)
    );
  };

  // Filter component
  const FilterBar = ({ activeFilter, onFilterChange }) => {
    const filters = [
      { id: 'all', label: 'All' },
      { id: 'pending', label: 'Pending' },
      { id: 'accepted', label: 'Accepted' },
      { id: 'rejected', label: 'Rejected' },
      { id: 'interview', label: 'Interview' },
      { id: 'hired', label: 'Hired' }
    ];
    
    return (
      <div className="d-flex align-items-center ms-auto">
        <span className="small text-muted me-2">
          <FaFilter className="me-1" />
          Status:
        </span>
        <ButtonGroup size="sm">
          {filters.map(filter => (
            <Button
              key={filter.id}
              variant={activeFilter === filter.id ? 'primary' : 'outline-secondary'}
              onClick={() => onFilterChange(filter.id)}
              className="px-2"
              style={{
                paddingTop: '0.25rem',
                paddingBottom: '0.25rem',
                fontSize: '0.75rem'
              }}
            >
              {filter.label}
            </Button>
          ))}
        </ButtonGroup>
      </div>
    );
  };

  // Render invites list
  const renderInvitesList = () => {
    if (!communicationData) return <div>Loading...</div>;
    
    const items = getFilteredItems();
    const hasItems = items.length > 0;
    
    return (
      <>
        {!hasItems ? (
          <div className="text-center py-5">
            <FaEnvelope size={48} className="text-muted mb-3" />
            <p>No {activeTab} found</p>
          </div>
        ) : (
          <ListGroup variant="flush">
        {items.map((item) => (
          <ListGroup.Item 
            key={item.id}
            className="p-0"
          >
            <div 
              className="d-flex justify-content-between align-items-center p-3"
              style={{ cursor: 'pointer' }}
              onClick={() => setActiveThread(item.id)}
            >
            <div className="d-flex align-items-center">
              <div className="avatar me-3">
                <div className="avatar-circle">
                  {item.facultyName.charAt(0)}
                </div>
              </div>
              <div>
                <div className="d-flex align-items-center">
                  <span className="fw-bold me-2">{item.facultyName}</span>
                  <Button 
                    variant="link" 
                    className="p-0" 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/recruiter/faculty/${item.facultyId}`);
                    }}
                    title="View faculty details"
                  >
                    <FaExternalLinkAlt size={12} className="text-muted" />
                  </Button>
                </div>
                <div className="text-muted small">{item.jobTitle}</div>
                <div className="text-muted small">
                  {formatDate(item.date)}
                </div>
              </div>
            </div>
            
            <div className="d-flex align-items-center">
              {item.status === 'pending' && activeTab === 'invites' && (
                <div className="btn-group btn-group-sm me-2">
                  <Button 
                    variant="outline-success" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInviteAction(item.id, 'accepted');
                    }}
                  >
                    <FaCheck />
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInviteAction(item.id, 'rejected');
                    }}
                  >
                    <FaTimes />
                  </Button>
                </div>
              )}
              
              {item.lastUpdate && (
                <div className="text-end">
                  <div className="small text-muted">
                    {item.lastUpdate.status.charAt(0).toUpperCase() + item.lastUpdate.status.slice(1)}
                  </div>
                  <div className="small text-muted">
                    {formatDate(item.lastUpdate.date)}
                  </div>
                </div>
              )}
              
              <Button 
                variant="link" 
                className={`ms-2 ${item.status !== 'accepted' ? 'text-muted' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (item.status === 'accepted') {
                    setSelectedInvite(item);
                    setShowStatusModal(true);
                  }
                }}
                disabled={item.status !== 'accepted'}
                title={item.status !== 'accepted' ? 'Comments only available for accepted invites' : 'Add comment'}
              >
                <FaComment />
              </Button>
            </div>
          </div>
        </ListGroup.Item>
        ))}
          </ListGroup>
        )}
      </>
    );
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <FaEnvelope className="me-2" />
          Communication
        </h2>
        <FilterBar 
          activeFilter={activeTab === 'invites' ? inviteFilter : sentFilter}
          onFilterChange={(filter) => {
            if (activeTab === 'invites') {
              setInviteFilter(filter);
            } else {
              setSentFilter(filter);
            }
          }}
        />
      </div>
      
      <Tabs
        activeKey={activeTab}
        onSelect={handleTabSelect}
        className="mb-3"
      >
        <Tab 
          eventKey="invites" 
          title={
            <>
              Invites
              {pendingCount > 0 && (
                <Badge bg="danger" className="ms-2">
                  {pendingCount}
                </Badge>
              )}
            </>
          }
        >
          {activeThread ? (
            <>
              <Button 
                variant="link" 
                className="mb-3"
                onClick={() => setActiveThread(null)}
              >
                ← Back to list
              </Button>
              {renderMessageThread()}
            </>
          ) : (
            renderInvitesList()
          )}
        </Tab>
        
        <Tab eventKey="sent" title="Sent">
          {activeThread ? (
            <>
              <Button 
                variant="link" 
                className="mb-3"
                onClick={() => setActiveThread(null)}
              >
                ← Back to list
              </Button>
              {renderMessageThread()}
            </>
          ) : (
            renderInvitesList()
          )}
        </Tab>
      </Tabs>
      
      <StatusUpdateModal
        show={showStatusModal}
        onHide={() => setShowStatusModal(false)}
        invite={selectedInvite}
        onUpdate={handleStatusUpdate}
      />
      
      {/* Reject Confirmation Modal */}
      <Modal show={showRejectConfirm} onHide={() => setShowRejectConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Rejection</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to reject this application? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmReject}>
            Reject Application
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Communication;
