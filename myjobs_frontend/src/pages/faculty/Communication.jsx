import React, { useEffect, useState } from 'react';
import { Container, Tabs, Tab, ListGroup, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { FaEnvelope, FaFilter } from 'react-icons/fa';
import { FacultyCommunicationProvider, useFacultyCommunication } from '../../context/FacultyCommunicationContext';
import CommunicationCard from '../../components/faculty/CommunicationCard';
import '../../pages/faculty/styles/Communication.css';

const StatusModal = ({ show, onHide, item, onSubmit, readOnly = false }) => {
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    if (show) {
      if (item?.lastUpdate) {
        setStatus(item.lastUpdate.status || '');
        setMessage(item.lastUpdate.notes || item.lastUpdate.message || '');
        setDate(item.lastUpdate.date ? new Date(item.lastUpdate.date).toISOString().slice(0,10) : '');
        setTime(item.lastUpdate.interviewTime || '');
      } else {
        setStatus('');
        setMessage('');
        setDate('');
        setTime('');
      }
    }
    // cleanup: clear when modal closes/unmounts
    return () => {
      setStatus('');
      setMessage('');
      setDate('');
      setTime('');
    };
  }, [item, show]);

  const handleSend = (e) => {
    e.preventDefault();
    if (readOnly) {
      setStatus(''); setMessage(''); setDate(''); setTime('');
      onHide();
      return;
    }
    
    // Default messages based on status if message is empty
    let finalMessage = message;
    if (!message.trim()) {
      switch(status) {
        case 'accepted':
          finalMessage = 'Thank you for the opportunity. I accept this invitation.';
          break;
        case 'rejected':
          finalMessage = 'Thank you for considering my application. I regret to inform you that I must decline this opportunity at this time.';
          break;
        case 'follow_up':
          finalMessage = 'I am following up regarding my application. Please let me know if you need any additional information.';
          break;
        default:
          finalMessage = 'Status updated.';
      }
    }

    const payload = {
      status,
      message: finalMessage,
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      time
    };
    
    onSubmit(payload);
    setStatus(''); 
    setMessage(''); 
    setDate(''); 
    setTime('');
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{readOnly ? 'Status (Read-only)' : 'Update Status / Send Message'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSend}>
        <Modal.Body>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="status">
              <Form.Label>Status</Form.Label>
              <Form.Select value={status} onChange={(e) => setStatus(e.target.value)} required disabled={readOnly}>
                <option value="">Select status</option>
                <option value="accepted">Accept</option>
                <option value="rejected">Reject</option>
                <option value="follow_up">Follow Up</option>
              </Form.Select>
            </Form.Group>
            <Form.Group as={Col} controlId="date">
              <Form.Label>Date</Form.Label>
              <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={readOnly}/>
            </Form.Group>
          </Row>

          <Form.Group controlId="message" className="mb-3">
            <Form.Label>Message</Form.Label>
            <Form.Control as="textarea" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Add a message or note (optional)" disabled={readOnly}/>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setStatus(''); setMessage(''); setDate(''); setTime(''); onHide(); }}>Close</Button>
          {!readOnly && <Button variant="primary" type="submit">Send</Button>}
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

const ThreadView = ({ item, onOpenModal }) => {
  if (!item) return null;
  const isReadOnly = item.status === 'rejected' || item.status === 'pending';

  return (
    <div className="card mb-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-0">{item.collegeName}</h5>
          <small className="text-muted">{item.jobTitle}</small>
        </div>
        <div>
          <Button variant="outline-primary" size="sm" className="me-2" disabled={isReadOnly} onClick={() => onOpenModal(item)}>Update Status</Button>
          <span className={`badge ${item.displayStatus === 'accepted' ? 'bg-success' : item.displayStatus === 'pending' ? 'bg-warning' : item.displayStatus === 'rejected' ? 'bg-danger' : item.displayStatus === 'interview' ? 'bg-primary' : 'bg-secondary'}`}>{item.displayStatus}</span>
        </div>
      </div>
      <div className="card-body message-thread">
        {item.status === 'rejected' && <div className="alert alert-info">This conversation is read-only because the application has been rejected.</div>}
        {item.status === 'pending' && <div className="alert alert-warning">You'll be able to message and update status once accepted.</div>}
        {item.messages?.map(m => (
          <div key={m.id} className={`message-bubble ${m.sender === 'faculty' ? 'sent' : 'received'}`}>
            <div className="message-content">
              <div className="message-sender">{m.sender === 'faculty' ? 'You' : item.collegeName?.split(' ')[0] || 'College'}</div>
              <div className="message-text">{m.content}</div>
              <div className="message-time">{new Date(m.timestamp).toLocaleString()}</div>
            </div>
          </div>
        ))}
        <div className="mt-3 text-muted">Conversation is read-only here — use the Update Status button to send messages or change status.</div>
      </div>
    </div>
  );
};

const CommunicationInner = () => {
  const { data, refresh, getPendingInvitesCount, acceptInvite, rejectInvite, addStatusUpdate, isMainStatus } = useFacultyCommunication();
  const [activeTab, setActiveTab] = useState('invites');
  const [activeThread, setActiveThread] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [modalItem, setModalItem] = useState(null);
  const [modalReadOnly, setModalReadOnly] = useState(false);

  const [pendingRejectId, setPendingRejectId] = useState(null);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line
  }, []);

  const rawItems = activeTab === 'invites' ? (data?.invites || []) : (data?.sent || []);

// ... then later, build items with displayStatus:
const itemsWithDisplay = rawItems.map(i => {
  // Prefer a MAIN lastUpdate.status (e.g. 'interview') if present.
  // But ignore lastUpdate.status when it's a non-main status like 'follow_up'.
  const lastStatus = i.lastUpdate && i.lastUpdate.status;
  const displayStatus = (lastStatus && isMainStatus(lastStatus)) ? lastStatus : i.status;
  return { ...i, displayStatus };
});


  // Filtering uses displayStatus now
  const filtered = filter === 'all'
    ? itemsWithDisplay
    : itemsWithDisplay.filter(i => i.displayStatus === filter);

  const openModalForItem = (item, readOnly = false) => {
    setModalItem(item);
    setModalReadOnly(readOnly);
    setShowStatusModal(true);
  };

  const handleAccept = (id) => {
    const item = rawItems.find(i => i.id === id);
    if (!item) return;
    acceptInvite(id, { message: 'Faculty has accepted the invite.', notes: 'Faculty has accepted the invite.' });
    refresh();
  };

  const handleReject = (id) => {
    setPendingRejectId(id);
    setShowRejectConfirm(true);
  };

  const confirmReject = () => {
    if (!pendingRejectId) { setShowRejectConfirm(false); return; }
    rejectInvite(pendingRejectId, { message: 'Faculty has rejected the invite.' });
    refresh();

    const rejected = rawItems.find(i => i.id === pendingRejectId) || ([...data.invites, ...data.sent].find(i => i.id === pendingRejectId));
    setModalItem(rejected);
    setModalReadOnly(true);
    setShowStatusModal(true);

    setPendingRejectId(null);
    setShowRejectConfirm(false);
  };

  const handleModalSubmit = (payload) => {
    if (!modalItem) return;
    if (activeTab === 'invites' && modalItem) {
      if (payload.status === 'accepted') {
        acceptInvite(modalItem.id, { message: payload.message, notes: payload.message });
      } else if (payload.status === 'rejected') {
        rejectInvite(modalItem.id, { message: payload.message, notes: payload.message });
      } else {
        addStatusUpdate(modalItem.id, { status: payload.status, date: payload.date, notes: payload.message, message: payload.message });
      }
    } else {
      addStatusUpdate(modalItem.id, { status: payload.status, date: payload.date, notes: payload.message, message: payload.message });
    }

    // clear modal state to avoid repopulating from same item
    setModalItem(null);
    setModalReadOnly(false);
    refresh();
  };

  const openThread = (id) => setActiveThread(id);

  const viewFaculty = (facultyId) => console.log('open faculty', facultyId);

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0"><FaEnvelope className="me-2" />Communication</h2>
        <div className="d-flex align-items-center ms-auto">
          <span className="small text-muted me-2"><FaFilter className="me-1" />Status:</span>
          <div className="btn-group" role="group" aria-label="filters">
            {['all','pending','accepted','rejected','interview','hired'].map(f => (
              <Button key={f} size="sm" variant={filter === f ? 'primary' : 'outline-secondary'} onClick={() => setFilter(f)} className="me-1 text-capitalize">
                {f}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Tabs activeKey={activeTab} onSelect={(k) => { setActiveTab(k); setActiveThread(null); }}>
        <Tab eventKey="invites" title={<><span>Invites</span> {getPendingInvitesCount() > 0 && <span className="badge bg-danger ms-2">{getPendingInvitesCount()}</span>}</>}>
          {activeThread ? (
            <>
              <Button variant="link" onClick={() => setActiveThread(null)} className="mb-3">← Back to list</Button>
              <ThreadView item={[...data.invites, ...data.sent].find(i => i.id === activeThread)} onOpenModal={(it) => openModalForItem(it, false)} />
            </>
          ) : (
            <ListGroup variant="flush">
              {filtered.length === 0 ? (
                <div className="text-center py-5">No items found</div>
              ) : filtered.map(i => (
                <ListGroup.Item key={i.id} className="p-0">
                  <CommunicationCard
                    item={i}
                    activeTab={activeTab}
                    onViewFaculty={viewFaculty}
                    onAccept={(id) => handleAccept(id)}
                    onReject={(id) => handleReject(id)}
                    onOpenThread={(id) => openThread(id)}
                    onOpenModal={(it) => openModalForItem(it, false)}
                  />
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Tab>

        <Tab eventKey="sent" title="Sent">
          {activeThread ? (
            <>
              <Button variant="link" onClick={() => setActiveThread(null)} className="mb-3">← Back to list</Button>
              <ThreadView item={[...data.invites, ...data.sent].find(i => i.id === activeThread)} onOpenModal={(it) => openModalForItem(it, false)} />
            </>
          ) : (
            <ListGroup variant="flush">
              {filtered.length === 0 ? (
                <div className="text-center py-5">No items found</div>
              ) : filtered.map(i => (
                <ListGroup.Item key={i.id} className="p-0">
                  <CommunicationCard
                    item={i}
                    activeTab={activeTab}
                    onViewFaculty={viewFaculty}
                    onAccept={(id) => openModalForItem(i, false)}
                    onReject={(id) => openModalForItem(i, false)}
                    onOpenThread={(id) => openThread(id)}
                    onOpenModal={(it) => openModalForItem(it, false)}
                  />
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Tab>
      </Tabs>

      <StatusModal
        show={showStatusModal}
        onHide={() => { setShowStatusModal(false); setModalReadOnly(false); setModalItem(null); }}
        item={modalItem}
        onSubmit={handleModalSubmit}
        readOnly={modalReadOnly}
      />

      <Modal show={showRejectConfirm} onHide={() => setShowRejectConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Rejection</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to reject this invitation? This action will mark the application as rejected and you will not be able to message further.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectConfirm(false)}>Cancel</Button>
          <Button variant="danger" onClick={confirmReject}>Reject Application</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

const FacultyCommunication = () => (
  <FacultyCommunicationProvider>
    <CommunicationInner />
  </FacultyCommunicationProvider>
);

export default FacultyCommunication;
