import React, { useState, useEffect, useMemo } from 'react';
import { Card, Badge, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Bookmark, BookmarkFill, Briefcase, GeoAlt, Building, CurrencyDollar, Calendar, Clock } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';


const JobCard = ({
  job,
  isSaved: propIsSaved = false,
  isApplied: propIsApplied = false,   // optional from parent
  onSaveToggle = () => { },
  onApply = () => { },                 // optional parent callback
}) => {
  const [isSaved, setIsSaved] = useState(propIsSaved);
  const [isHovered, setIsHovered] = useState(false);
  const [timeAgo, setTimeAgo] = useState('');
  const [isApplied, setIsApplied] = useState(propIsApplied);

  useEffect(() => setIsSaved(propIsSaved), [propIsSaved]);
  useEffect(() => setIsApplied(propIsApplied), [propIsApplied]);

  // Calculate time ago
  useEffect(() => {
    const postedDate = job.created_at ? new Date(job.created_at) : null;
    if (postedDate) {
      const now = new Date();
      const diffInDays = Math.floor((now - postedDate) / (1000 * 60 * 60 * 24));
      if (diffInDays === 0) setTimeAgo('Today');
      else if (diffInDays === 1) setTimeAgo('1 day ago');
      else if (diffInDays < 7) setTimeAgo(`${diffInDays} days ago`);
      else if (diffInDays < 30) setTimeAgo(`${Math.floor(diffInDays / 7)} weeks ago`);
      else setTimeAgo(postedDate.toLocaleDateString());
    }
  }, [job.created_at]);

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
                <Card.Title className="mb-3">
                  <Link to={`/faculty/jobs/${job.id}`} className="text-decoration-none text-dark">
                    {job.title}
                  </Link>
                </Card.Title>

                <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                  <Badge bg="light" text="dark" className="d-flex align-items-center">
                    <Building size={14} className="me-1" /> {job.department}
                  </Badge>
                  <Badge bg="light" text="dark" className="d-flex align-items-center">
                    <Briefcase size={14} className="me-1" /> {job.job_type}
                  </Badge>
                  <Badge bg="light" text="dark" className="d-flex align-items-center">
                    <GeoAlt size={14} className="me-1" /> {job.location}
                  </Badge>
                </div>

                <div className="d-flex flex-wrap align-items-center gap-3 text-muted small mb-3">
                  {job.salary && (
                    <span className="d-flex align-items-center">
                      <CurrencyDollar size={14} className="me-1" /> {job.salary}
                    </span>
                  )}
                  {job.deadline && (
                    <span className="d-flex align-items-center">
                      <Calendar size={14} className="me-1" />
                      Apply by {new Date(job.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  )}
                  {timeAgo && (
                    <span className="d-flex align-items-center">
                      <Clock size={14} className="me-1" /> {timeAgo}
                    </span>
                  )}
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

            {/* Tags and Course */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 pt-3 border-top">
              <div className="d-flex flex-wrap gap-2">
                {job.course && (
                  <Badge bg="primary" text="white" className="rounded-pill px-3 py-2">
                    {job.course}
                  </Badge>
                )}
                {job.department && (
                  <Badge bg="info" text="white" className="rounded-pill px-3 py-2">
                    {job.department}
                  </Badge>
                )}
              </div>
              {job.deadline && (
                <div className="text-muted small d-flex align-items-center mt-2 mt-sm-0">
                  <Calendar size={14} className="me-1 flex-shrink-0" />
                  <span>Apply by: {new Date(job.deadline).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default JobCard;
