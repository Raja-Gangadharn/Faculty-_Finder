import React, { useState, useMemo, useEffect } from 'react';
import { Container, Row, Col, Pagination, Form } from 'react-bootstrap';
import { FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import JobFilters from '../../components/faculty/JobFilters';
import JobCard from '../../components/faculty/JobCard';

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
  
  // ...additional jobs
];

const JobOpportunities = () => {
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState('newest');
  const pageSize = 6;

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // reset page when filters change
  useEffect(() => setCurrentPage(1), [filters]);

  /* --------------------------------------------------
     FILTER LOGIC
  -------------------------------------------------- */
  const filteredJobs = useMemo(() => {
    const filtered = mockJobs.filter((job) => {
      if (filters['Job by Department']?.length && !filters['Job by Department'].includes(job.department)) {
        return false;
      }
      if (filters['Job by City']?.length && !filters['Job by City'].includes(job.city)) {
        return false;
      }
      if (filters['Job by Experience']?.length && !filters['Job by Experience'].includes(job.type)) {
        return false;
      }
      if (filters['Job by Course']?.length && !filters['Job by Course'].includes(job.course)) {
        return false;
      }
      return true;
    });

    // Apply sorting
    return [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.postedAt) - new Date(a.postedAt);
        case 'oldest':
          return new Date(a.postedAt) - new Date(b.postedAt);
        case 'salary_high':
          return parseFloat(b.salary.replace(/[^0-9.]/g, '')) - parseFloat(a.salary.replace(/[^0-9.]/g, ''));
        case 'salary_low':
          return parseFloat(a.salary.replace(/[^0-9.]/g, '')) - parseFloat(b.salary.replace(/[^0-9.]/g, ''));
        default:
          return 0;
      }
    });
  }, [filters, sortOption]);

  /* -------------------- Pagination ------------------ */
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(filteredJobs.length / pageSize);

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  /* --------------------------------------------------
     RENDER
  -------------------------------------------------- */
  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <h2 className="mb-0 me-3">Job Opportunities</h2>
        <div className="d-flex align-items-center">
          <span className="me-2 text-muted">
            {sortOption.includes('salary') ? (
              <FaSortAmountDown className="me-1" />
            ) : sortOption === 'newest' ? (
              <FaSortAmountDown className="me-1" />
            ) : (
              <FaSortAmountUp className="me-1" />
            )}
            Sort by:
          </span>
          <Form.Select 
            size="sm"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            aria-label="Sort jobs"
            className="border-primary"
            style={{ width: '180px' }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="salary_high">Salary: High to Low</option>
            <option value="salary_low">Salary: Low to High</option>
          </Form.Select>
        </div>
      </div>
      <Row>
        {/* Sidebar */}
        <Col lg={3} className="mb-4 mb-lg-0">
          <div className="job-filters-sidebar">
            <JobFilters selected={filters} onChange={setFilters} />
          </div>
        </Col>

        {/* Job listings */}
        <Col lg={9}>
          {filteredJobs.length === 0 && <p className="text-muted">No jobs match the selected filters.</p>}
          {paginatedJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="justify-content-center mt-3">
              <Pagination.First onClick={() => changePage(1)} disabled={currentPage === 1} />
              <Pagination.Prev onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1} />
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((num) => (
                <Pagination.Item key={num} active={num === currentPage} onClick={() => changePage(num)}>
                  {num}
                </Pagination.Item>
              ))}
              <Pagination.Next onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages} />
              <Pagination.Last onClick={() => changePage(totalPages)} disabled={currentPage === totalPages} />
            </Pagination>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default JobOpportunities;
