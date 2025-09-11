import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Pagination, Alert, Form, Button } from 'react-bootstrap';
import { FaSearch, FaSort } from 'react-icons/fa';
import JobCard from '../../components/faculty/JobCard';
import './styles/JobOpportunities.css';

/*
  JobOpportunities.jsx
  ---------------------
  Page that lists faculty job openings with a filter sidebar.
  Uses mock data now, replace fetchJobs() with API later.
*/

const mockJobs = [
  {
    id: 1,
    title: 'Assistant Professor – Computer Science',
    department: 'Computer Science',
    city: 'New York',
    type: 'Full Time',
    course: 'B.Tech',
    location: 'New York, USA',
    salary: '$80k – $100k',
    deadline: '01 Jan, 2045',
    postedAt: '2025-06-25',
  },
  {
    id: 2,
    title: 'Lecturer – Electronics',
    department: 'Electronics',
    city: 'Los Angeles',
    type: 'Contract',
    course: 'M.Tech',
    location: 'Los Angeles, USA',
    salary: '$60k – $80k',
    deadline: '15 Feb, 2045',
    postedAt: '2025-06-28',
  },
  {
    id: 3,
    title: 'Assistant Professor – Electronics',
    department: 'Electronics',
    city: 'Los Angeles',
    type: 'Full Time',
    course: 'M.Tech',
    location: 'canada',
    salary: '$60k – $80k',
    deadline: '15 Feb, 2045',
    postedAt: '2025-07-28',
  },
  {
    id: 4,
    title: 'Assistant Professor – Civil',
    department: 'Civil',
    city: 'Los Angeles',
    type: 'Full Time',
    course: 'M.Tech',
    location: 'Berlin',
    salary: '$60k – $80k',
    deadline: '15 Feb, 2045',
    postedAt: '2025-08-02',
  }
  
  // ...additional jobs
];

const JobOpportunities = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState('newest');
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);   
  const [showSaveAlert, setShowSaveAlert] = useState(false);
  const [lastSavedJob, setLastSavedJob] = useState(null);
  const pageSize = 6;
  
  // Load saved jobs from localStorage on component mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    setSavedJobs(saved);
  }, []);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Reset page when sort option changes
  useEffect(() => setCurrentPage(1), [sortOption]);
  
  // Save job to localStorage
  const handleSaveJob = (job, isSaved) => {
    let updatedSavedJobs;
    
    if (isSaved) {
      updatedSavedJobs = [...savedJobs, job];
      setLastSavedJob(job);
      setShowSaveAlert(true);
      // Auto-hide the alert after 3 seconds
      setTimeout(() => setShowSaveAlert(false), 3000);
    } else {
      updatedSavedJobs = savedJobs.filter(savedJob => savedJob.id !== job.id);
    }
    
    setSavedJobs(updatedSavedJobs);
    localStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobs));
  };
  
  // Check if a job is saved
  const isJobSaved = (jobId) => {
    return savedJobs.some(job => job.id === jobId);
  };
  
  // Handle job application
  const handleApply = (jobId) => {
    if (!appliedJobs.includes(jobId)) {
      setAppliedJobs([...appliedJobs, jobId]);
      // In a real app, you would make an API call here
      console.log('Applied to job:', jobId);
    }
  };

  // Sort and filter jobs
  const filteredJobs = useMemo(() => {
    let jobs = [...mockJobs];
    
    // Apply sorting
    jobs.sort((a, b) => {
      switch(sortOption) {
        case 'newest':
          return new Date(b.postedAt) - new Date(a.postedAt);
        case 'oldest':
          return new Date(a.postedAt) - new Date(b.postedAt);
        case 'salary-high':
          return parseFloat(b.salary.replace(/[^0-9.]/g, '')) - parseFloat(a.salary.replace(/[^0-9.]/g, ''));
        case 'salary-low':
          return parseFloat(a.salary.replace(/[^0-9.]/g, '')) - parseFloat(b.salary.replace(/[^0-9.]/g, ''));
        case 'deadline':
          return new Date(a.deadline) - new Date(b.deadline);
        default:
          return new Date(b.postedAt) - new Date(a.postedAt);
      }
    });
    
    return jobs;
  }, [sortOption]);

  /* -------------------- Pagination ------------------ */
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(filteredJobs.length / pageSize);

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <Container className="job-opportunities py-4">
      {/* Page Header */}
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold mb-3">Find Your Opportunity Here!</h1>
        <p className="lead text-muted">Browse and apply to faculty positions from top institutions</p>
        
        {/* Search and Sort Bar */}
        <div className="search-container mx-auto mt-4" style={{ maxWidth: '800px' }}>
          <div className="d-flex flex-column flex-md-row gap-3">
            <div className="input-group flex-grow-1">
              <span className="input-group-text bg-white border-end-0">
                <FaSearch className="text-muted my-2" />
              </span>
              <Form.Control 
                type="text" 
                placeholder="Search by job title, department, or location" 
                className="border-start-0"
              />
              <Button variant="primary" className="px-4">
                Search
              </Button>
            </div>
            
            <div className="d-flex align-items-center">
              <div className="input-group" style={{ minWidth: '200px' }}>
                <Form.Select 
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="form-select border-start-0"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="salary-high">Salary: High to Low</option>
                  <option value="salary-low">Salary: Low to High</option>
                  <option value="deadline">Deadline</option>
                </Form.Select>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Job Listings */}
      <div>
        {/* Save Confirmation Alert */}
        {showSaveAlert && lastSavedJob && (
          <Alert 
            variant="success" 
            className="d-flex align-items-center mb-4"
            onClose={() => setShowSaveAlert(false)}
            dismissible
          >
            <div className="d-flex align-items-center">
              <i className="bi bi-bookmark-check-fill me-2"></i>
              <span>Job saved: <strong>{lastSavedJob.title}</strong></span>
            </div>
            <Button 
              variant="outline-success" 
              size="sm" 
              className="ms-5"
              onClick={() => {
                navigate('/faculty/saved-jobs');
                setShowSaveAlert(false);
              }}
            >
              View Saved
            </Button>
          </Alert>
        )}
        
        {filteredJobs.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-search text-muted" style={{ fontSize: '3rem', opacity: 0.5 }}></i>
            <h4 className="mt-3">No jobs found</h4>
            <p className="text-muted">Try adjusting your search criteria</p>
          </div>
        ) : (
          <Row className="g-4">
            {paginatedJobs.map((job) => (
              <Col key={job.id} xs={12}>
                <JobCard 
                  job={job} 
                  isSaved={isJobSaved(job.id)}
                  isApplied={appliedJobs.includes(job.id)}
                  onSaveToggle={handleSaveJob}
                  onApply={handleApply}
                />
              </Col>
            ))}
          </Row>
        )}
        
        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-5">
            <Pagination>
              <Pagination.Prev 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              />
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Pagination.Item
                    key={pageNum}
                    active={pageNum === currentPage}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Pagination.Item>
                );
              })}
              <Pagination.Next 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </div>
        )}
      </div>
    </Container>
  );
};

export default JobOpportunities;
