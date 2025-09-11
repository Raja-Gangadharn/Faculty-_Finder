import React, { useState, useEffect, useMemo } from 'react';
import { Card, Badge, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Bookmark, BookmarkFill, Briefcase, GeoAlt, Building, CurrencyDollar, Calendar, Clock } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';


const JobCard = ({
  job,
  isSaved: propIsSaved = false,
  isApplied: propIsApplied = false,   // optional from parent
  onSaveToggle = () => {},
  onApply = () => {},                 // optional parent callback
}) => {
  const [isSaved, setIsSaved] = useState(propIsSaved);
  const [isHovered, setIsHovered] = useState(false);
  const [timeAgo, setTimeAgo] = useState('');
  const [isApplied, setIsApplied] = useState(propIsApplied);

  useEffect(() => setIsSaved(propIsSaved), [propIsSaved]);
  useEffect(() => setIsApplied(propIsApplied), [propIsApplied]);

  // Calculate time ago
  useEffect(() => {
    if (job.postedAt) {
      const postedDate = new Date(job.postedAt);
      const now = new Date();
      const diffInDays = Math.floor((now - postedDate) / (1000 * 60 * 60 * 24));
      if (diffInDays === 0) setTimeAgo('Today');
      else if (diffInDays === 1) setTimeAgo('1 day ago');
      else if (diffInDays < 7) setTimeAgo(`${diffInDays} days ago`);
      else if (diffInDays < 30) setTimeAgo(`${Math.floor(diffInDays / 7)} weeks ago`);
      else setTimeAgo(postedDate.toLocaleDateString());
    }
  }, [job.postedAt]);

  const handleSaveClick = (e) => {
    e.preventDefault(); e.stopPropagation();
    const newSaved = !isSaved;
    setIsSaved(newSaved);
    onSaveToggle(job, newSaved);
  };

  const handleApplyClick = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (isApplied) return;
    
    // Update local state
    setIsApplied(true);
    
    // Notify parent if needed
    onApply(job);
  };

  const SaveButton = () => {
    const tooltip = (
      <Tooltip id={`save-tooltip-${job.id}`}>
        {isSaved ? 'Remove from saved' : 'Save job'}
      </Tooltip>
    );
    return (
      <OverlayTrigger placement="top" overlay={tooltip}>
        <Button
          variant="link"
          className="p-0 text-warning"
          size="sm"
          onClick={handleSaveClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-label={isSaved ? 'Remove from saved' : 'Save job'}
        >
          {isSaved || isHovered ? <BookmarkFill size={20} /> : <Bookmark size={20} />}
        </Button>
      </OverlayTrigger>
    );
  };

  return (
    <Card className="job-card job-opportunity-card mb-3 border-0 shadow-sm hover-shadow transition-all">
      <Card.Body className="p-4">
        <div className="d-flex">
          {/* Logo */}
          <div className="flex-shrink-0 me-4">
            <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
              <Building size={24} className="text-primary" />
            </div>
          </div>

          {/* Job Details */}
          <div className="flex-grow-1">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h5 className="mb-1 fw-bold">
                  <Link to={`/faculty/jobs/${job.id}`} className="text-decoration-none text-dark">
                    {job.title}
                  </Link>
                </h5>
                <div className="text-muted mb-2 small d-flex align-items-center flex-wrap">
                  <Building size={14} className="me-1" />
                  {job.department}
                  <span className="mx-2">•</span>
                  <GeoAlt size={14} className="me-1" />
                  {job.location}
                </div>
              </div>
              <div className="d-flex align-items-center">
                <SaveButton />
                <Button
                  variant={isApplied ? 'success' : 'outline-primary'}
                  size="sm"
                  className="ms-2"
                  onClick={handleApplyClick}
                  disabled={isApplied}
                >
                  {isApplied ? 'Applied' : 'Apply Now'}
                </Button>
              </div>
            </div>

            {/* Job Meta */}
            <div className="job-meta d-flex flex-wrap gap-3 mb-3">
              <div className="d-flex align-items-center text-muted small">
                <Briefcase size={14} className="me-1 flex-shrink-0" />
                {job.type}
              </div>
              <div className="d-flex align-items-center text-muted small">
                <CurrencyDollar size={14} className="me-1 flex-shrink-0" />
                {job.salary}
              </div>
              <div className="d-flex align-items-center text-muted small">
                <Clock size={14} className="me-1 flex-shrink-0" />
                {timeAgo}
              </div>
            </div>

            {/* Tags and Deadline */}
            <div className="d-flex flex-wrap justify-content-between align-items-center">
              <div className="d-flex flex-wrap gap-2">
                <Badge bg="primary" text="white" className="rounded-pill px-3 py-2">
                  {job.course}
                </Badge>
                <Badge bg="info" text="white" className="rounded-pill px-3 py-2">
                  {job.department}
                </Badge>
              </div>
              <div className="text-muted small d-flex align-items-center mt-2 mt-sm-0">
                <Calendar size={14} className="me-1 flex-shrink-0" />
                Apply by: {job.deadline}
              </div>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default JobCard;
