// src/pages/faculty/Communication.jsx
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
    if (item?.lastUpdate) {
      setStatus(item.lastUpdate.status || '');
      setMessage(item.lastUpdate.notes || '');
      if (item.lastUpdate.date) setDate(new Date(item.lastUpdate.date).toISOString().slice(0,10));
      else setDate('');
    } else {
      setStatus('');
      setMessage('');
      setDate('');
      setTime('');
    }
  }, [item, show]);

  const handleSend = (e) => {
    e.preventDefault();
    if (readOnly) {
      onHide();
      return;
    }
    const payload = {
      status,
      message,
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      time
    };
    onSubmit(payload);
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
          <Button variant="secondary" onClick={onHide}>Close</Button>
          {!readOnly && <Button variant="primary" type="submit">Send</Button>}
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

const FacultyCommunicationInner = () => {
  const { data, refresh, getPendingInvitesCount, acceptInvite, rejectInvite, addStatusUpdate } = useFacultyCommunication();
  const [activeTab, setActiveTab] = useState('invites');
  const [activeThread, setActiveThread] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [modalItem, setModalItem] = useState(null);
  const [modalReadOnly, setModalReadOnly] = useState(false);

  // Reject confirmation modal state
  const [pendingRejectId, setPendingRejectId] = useState(null);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line
  }, []);

  const items = activeTab === 'invites' ? (data?.invites || []) : (data?.sent || []);
  const filtered = filter === 'all' ? items : items.filter(i => i.status === filter || (i.lastUpdate && i.lastUpdate.status === filter));

  const openModalForItem = (item, readOnly = false) => {
    setModalItem(item);
    setModalReadOnly(readOnly);
    setShowStatusModal(true);
  };

  // ACCEPT: auto-accept without showing modal; send auto message from faculty
  const handleAccept = (id) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    // auto payload message
    const payloadMessage = 'Faculty has accepted the invite.';
    acceptInvite(id, { message: payloadMessage, notes: payloadMessage });
    // refresh UI
    refresh();
  };

  // REJECT: show confirmation modal first; on confirm, perform reject, then open status modal in read-only view
  const handleReject = (id) => {
    setPendingRejectId(id);
    setShowRejectConfirm(true);
  };

  const confirmReject = () => {
    if (!pendingRejectId) {
      setShowRejectConfirm(false);
      return;
    }
    // perform reject
    rejectInvite(pendingRejectId, { message: 'Faculty has rejected the invite.' });
    // refresh UI
    refresh();

    // open the status modal in read-only mode so user can view details / history
    const rejectedItem = items.find(i => i.id === pendingRejectId) || ([...data.invites, ...data.sent].find(i => i.id === pendingRejectId));
    setModalItem(rejectedItem);
    setModalReadOnly(true);
    setShowStatusModal(true);

    // clear pending state
    setPendingRejectId(null);
    setShowRejectConfirm(false);
  };

  // Submitted from editable StatusModal (for comment icon and Update Status button)
  const handleModalSubmit = (payload) => {
    if (!modalItem) return;
    if (activeTab === 'invites' && modalItem) {
      if (payload.status === 'accepted') {
        acceptInvite(modalItem.id, { message: payload.message, notes: payload.message });
      } else if (payload.status === 'rejected') {
        rejectInvite(modalItem.id, { message: payload.message, notes: payload.message });
      } else {
        addStatusUpdate(modalItem.id, { status: payload.status, date: payload.date, notes: payload.message });
      }
    } else {
      addStatusUpdate(modalItem.id, { status: payload.status, date: payload.date, notes: payload.message });
    }
    setModalItem(null);
    setModalReadOnly(false);
    refresh();
  };

  const openThread = (id) => {
    setActiveThread(id);
  };

  const viewFaculty = (facultyId) => {
    // replace with actual router navigate if needed
    console.log('Open faculty details for', facultyId);
  };

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
                    onAccept={(id) => handleAccept(id)}            // immediate accept (auto-message)
                    onReject={(id) => handleReject(id)}            // shows confirmation modal
                    onOpenThread={(id) => openThread(id)}
                    onOpenModal={(it) => openModalForItem(it, false)} // comment / update (editable)
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
                    onAccept={(id) => openModalForItem(i, false)}      // for sent tab we keep behavior: open modal to change status
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

      {/* Status Modal */}
      <StatusModal show={showStatusModal} onHide={() => { setShowStatusModal(false); setModalReadOnly(false); setModalItem(null); }} item={modalItem} onSubmit={handleModalSubmit} readOnly={modalReadOnly} />

      {/* Reject Confirmation Modal */}
      <Modal show={showRejectConfirm} onHide={() => setShowRejectConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Rejection</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to reject this invitation? This action will mark the application as rejected and you will not be able to message further.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectConfirm(false)}>Cancel</Button>
          <Button variant="danger" onClick={confirmReject}>Reject Application</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

// Thread view (read-only messages — no input)
const ThreadView = ({ item, onOpenModal }) => {
  if (!item) return null;
  const isReadOnly = item.status === 'rejected' || item.status === 'pending';

  return (
    <div className="thread-card card mb-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-0">{item.facultyName}</h5>
          <small className="text-muted">{item.jobTitle}</small>
        </div>
        <div>
          <Button variant="outline-primary" size="sm" className="me-2" disabled={isReadOnly} onClick={() => onOpenModal(item)}>Update Status</Button>
          <span className={`badge ${item.status === 'accepted' ? 'bg-success' : item.status === 'pending' ? 'bg-warning' : item.status === 'rejected' ? 'bg-danger' : 'bg-secondary'}`}>{item.status}</span>
        </div>
      </div>
      <div className="card-body message-thread">
        {item.status === 'rejected' && <div className="alert alert-info">This conversation is read-only because the application has been rejected.</div>}
        {item.status === 'pending' && <div className="alert alert-warning">You'll be able to message and update status once accepted.</div>}
        {item.messages?.map(m => (
          <div key={m.id} className={`message-bubble ${m.sender === 'faculty' ? 'sent' : 'received'}`}>
            <div className="message-content">
              <div className="message-sender">{m.sender === 'faculty' ? 'You' : item.facultyName.split(' ')[0]}</div>
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

const FacultyCommunication = () => {
  return (
    <FacultyCommunicationProvider>
      <FacultyCommunicationInner />
    </FacultyCommunicationProvider>
  );
};

export default FacultyCommunication;
