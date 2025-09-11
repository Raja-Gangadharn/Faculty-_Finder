import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { BookmarkFill, Clock, Briefcase, GeoAlt, Building, CurrencyDollar, Calendar, CheckCircle } from 'react-bootstrap-icons';
import { FaBolt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const SavedJobCard = ({
  job,
  isApplied = false,
  applyMethod = null,
  appliedAt = null,
  onSaveToggle = () => {},
  onApply = () => {}
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [timeAgo, setTimeAgo] = useState('');
  const [applied, setApplied] = useState(isApplied);
  const [applyType, setApplyType] = useState(applyMethod);

  const handleCardClick = (e) => {
    // Don't navigate if clicking on save/apply buttons
    if (e.target.closest('.btn, .btn *') || e.target.closest('.bookmark-btn')) {
      return;
    }
    navigate(`/faculty/jobs/${job.id}`);
  };

  useEffect(() => {
    if (job.postedAt) {
      const postedDate = new Date(job.postedAt);
      const now = new Date();
      const diffInDays = Math.floor((now - postedDate) / (1000 * 60 * 60 * 24));

      if (diffInDays === 0) {
        setTimeAgo('Today');
      } else if (diffInDays === 1) {
        setTimeAgo('1 day ago');
      } else if (diffInDays < 7) {
        setTimeAgo(`${diffInDays} days ago`);
      } else if (diffInDays < 30) {
        const weeks = Math.floor(diffInDays / 7);
        setTimeAgo(weeks === 1 ? '1 week ago' : `${weeks} weeks ago`);
      } else {
        setTimeAgo(postedDate.toLocaleDateString());
      }
    }
  }, [job.postedAt]);

  const handleSaveClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onSaveToggle(job.id);
  };

  const handleApplyClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!applied) {
      setApplied(true);
      onApply(job.id);
    }
  };

  useEffect(() => {
    setApplied(isApplied);
    if (isApplied && applyMethod) {
      setApplyType(applyMethod);
    } else if (!isApplied) {
      setApplyType(null);
    }
  }, [isApplied, applyMethod]);

  return (
    <Card
      className="h-100 d-flex flex-column saved-job-card"
      style={{ cursor: 'pointer' }}
      onClick={handleCardClick}
    >
      <Card.Body className="text-dark">
        <div className="d-flex">
          <div className="me-3">
            <div className="rounded bg-light d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
              <Building size={24} className="text-primary" />
            </div>
          </div>

          <div className="flex-grow-1">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h5 className="mb-1">
                  {job.title}
                </h5>
                <div className="text-muted mb-2 small d-flex align-items-center">
                  <Building size={14} className="me-1" />
                  {job.department}
                </div>
              </div>
              <Button
                variant="link"
                className="p-0 text-warning bookmark-btn"
                onClick={handleSaveClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                aria-label="Remove from saved"
              >
                <BookmarkFill size={20} className="text-warning" />
              </Button>
            </div>

            <div className="job-meta d-flex flex-wrap gap-3 mb-2">
              <div className="d-flex align-items-center text-muted small">
                <GeoAlt size={14} className="me-1" />
                {job.location}
              </div>
              <div className="d-flex align-items-center text-muted small">
                <Briefcase size={14} className="me-1" />
                {job.type}
              </div>
              <div className="d-flex align-items-center text-muted small">
                <CurrencyDollar size={14} className="me-1" />
                {job.salary}
              </div>
              {timeAgo && (
                <div className="d-flex align-items-center text-muted small">
                  <Clock size={14} className="me-1" />
                  {timeAgo}
                </div>
              )}
            </div>

            <div className="d-flex flex-wrap justify-content-between align-items-center mt-2">
              <div className="d-flex flex-wrap gap-2">
                <Badge bg="light" text="dark" className="me-2">
                  {job.course}
                </Badge>
                <Badge bg="light" text="dark">
                  {job.department}
                </Badge>
              </div>
              <div className="text-muted small d-flex align-items-center mt-2 mt-sm-0">
                <Calendar size={14} className="me-1" />
                <span>Apply by: {job.deadline || 'N/A'}</span>
              </div>
            </div>

            <div className="d-flex justify-content-end mt-3">
              {applied ? (
                <div className="d-flex align-items-center">
                  <Badge
                    bg={applyType === 'easy' ? 'success' : 'primary'}
                    className="d-flex align-items-center py-2 px-3"
                  >
                    {applyType === 'easy' ? (
                      <>
                        <FaBolt className="me-1" size={12} />
                        <span>Easy Applied</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="me-1" size={12} />
                        <span>Applied</span>
                      </>
                    )}
                  </Badge>
                  {appliedAt && (
                    <small className="text-muted ms-2">
                      {new Date(appliedAt).toLocaleDateString()}
                    </small>
                  )}
                </div>
              ) : (
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="me-2"
                  onClick={handleApplyClick}
                >
                  Apply Now
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default SavedJobCard;
