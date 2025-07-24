import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { Heart } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import { Briefcase } from 'react-bootstrap-icons';


const JobCard = ({ job }) => {
  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body className="d-flex align-items-center">
        {/* Logo */}
        <div className="me-3 flex-shrink-0">
          <div className="rounded bg-light d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
          <span className="text-muted">
            <Briefcase size={24} />
          </span>
        </div>
        </div>

        {/* Details */}
        <div className="flex-grow-1">
          <h6 className="fw-semibold mb-1 d-flex align-items-center gap-2">
            <Link to={`/faculty/jobs/${job.id}`} className="text-decoration-none text-dark">
              {job.title}
            </Link>
            <Badge bg="secondary" pill>
              {job.type}
            </Badge>
          </h6>
          <div className="text-muted small mb-1">
            {job.location} • {job.salary}
          </div>
          <div className="text-muted small">Deadline: {job.deadline}</div>
        </div>

        {/* Actions */}
        <div className="text-end d-flex flex-column align-items-end gap-2">
          <Button variant="outline-primary" size="sm">
            Apply Now
          </Button>
          <Button variant="link" className="p-0 text-danger" size="sm">
            <Heart />
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default JobCard;
