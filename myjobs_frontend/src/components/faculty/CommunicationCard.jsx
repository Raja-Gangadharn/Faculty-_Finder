import React from 'react';
import { Button, Badge } from 'react-bootstrap';
import { FaExternalLinkAlt, FaComment, FaCheck, FaTimes } from 'react-icons/fa';

/**
 * Props:
 * - item: invite/sent item
 * - activeTab: 'invites' | 'sent'
 * - onViewFaculty: callback
 * - onAccept: (id) => void
 * - onReject: (id) => void
 * - onOpenThread: (id) => void
 * - onOpenModal: (item) => void  // open status/modal for comment or update
 */
const CommunicationCard = ({ item, activeTab, onViewFaculty, onAccept, onReject, onOpenThread, onOpenModal }) => {
  const last = item.lastUpdate;
  const showActionButtons = activeTab === 'invites' && item.status === 'pending';
  const commentEnabled = item.status === 'accepted'; // comments only for accepted items

  const statusBadge = (status) => {
    const map = {
      pending: 'warning',
      accepted: 'success',
      rejected: 'danger',
      interview: 'primary',
      hired: 'success',
      follow_up: 'info'
    };
    return <Badge bg={map[status] || 'secondary'} className="ms-2">{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  return (
    <div className="communication-card d-flex justify-content-between align-items-center p-3" onClick={() => onOpenThread(item.id)} style={{ cursor: 'pointer' }}>
      <div className="d-flex align-items-center">
        <div className="avatar me-3">
          <div className="avatar-circle">{item.facultyName?.charAt(0)}</div>
        </div>
        <div>
          <div className="d-flex align-items-center">
            <strong className="me-2">{item.facultyName}</strong>
            <Button variant="link" className="p-0" onClick={(e) => { e.stopPropagation(); onViewFaculty(item.facultyId); }} title="Open faculty">
              <FaExternalLinkAlt size={12} className="text-muted" />
            </Button>
          </div>
          <div className="text-muted small">{item.jobTitle}</div>
          <div className="text-muted small">{new Date(item.date).toLocaleString()}</div>
        </div>
      </div>

      <div className="d-flex align-items-center">
        {showActionButtons && (
          <div className="btn-group btn-group-sm me-2" onClick={(e) => e.stopPropagation()}>
            <Button variant="outline-success" size="sm" onClick={() => onAccept(item.id)} title="Accept">
              <FaCheck />
            </Button>
            <Button variant="outline-danger" size="sm" onClick={() => onReject(item.id)} title="Reject">
              <FaTimes />
            </Button>
          </div>
        )}

        {last && (
          <div className="text-end me-3">
            <div className="small text-muted">{(last.status || '').charAt(0).toUpperCase() + (last.status || '').slice(1)}</div>
            <div className="small text-muted">{last.date ? new Date(last.date).toLocaleString() : ''}</div>
          </div>
        )}

        {commentEnabled ? (
          <Button variant="link" className="ms-2" onClick={(e) => { e.stopPropagation(); onOpenModal(item); }} title="Open comments / update">
            <FaComment />
          </Button>
        ) : (
          <Button variant="link" className={`ms-2 text-muted`} onClick={(e) => { e.stopPropagation(); /* do nothing */ }} title={item.status !== 'accepted' ? 'Comments available after accept' : 'Comments'}>
            <FaComment />
          </Button>
        )}

        {/* status badge */}
        {statusBadge(item.status)}
      </div>
    </div>
  );
};

export default CommunicationCard;
