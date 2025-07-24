import React, { useState, useMemo } from 'react';
import { Card, Table, Form, Button, Row, Col, Modal, Pagination } from 'react-bootstrap';

// Mock data – replace with API data later:

const mockMarkedProfiles = [
  { id: 1, name: 'Dr. Alan Turing', email: 'alan@sample.edu', department: 'Computer Science', preference: 'Remote' },
  { id: 2, name: 'Prof. Barbara Liskov', email: 'barbara@sample.edu', department: 'Electrical Engineering', preference: 'On-campus' },
  { id: 3, name: 'Dr. Claude Shannon', email: 'claude@sample.edu', department: 'Mathematics', preference: 'Hybrid' },
  { id: 4, name: 'Prof. Donald Knuth', email: 'donald@sample.edu', department: 'Computer Science', preference: 'Remote' },
  { id: 5, name: 'Dr. Edsger Dijkstra', email: 'edsger@sample.edu', department: 'Computer Science', preference: 'On-campus' },
  // add more for pagination demo
  { id: 6, name: 'Prof. Frances Allen', email: 'frances@sample.edu', department: 'Computer Science', preference: 'Hybrid' },
  { id: 7, name: 'Dr. Grace Hopper', email: 'grace@sample.edu', department: 'Computer Science', preference: 'Remote' },
  { id: 8, name: 'Prof. Hedy Lamarr', email: 'hedy@sample.edu', department: 'Physics', preference: 'On-campus' },
  { id: 9, name: 'Dr. Ivan Sutherland', email: 'ivan@sample.edu', department: 'Computer Science', preference: 'Hybrid' },
  { id: 10, name: 'Prof. John McCarthy', email: 'john@sample.edu', department: 'Computer Science', preference: 'Remote' },
];

const PAGE_SIZE = 5;

const MarkedProfiles = () => {
  const [profiles, setProfiles] = useState(mockMarkedProfiles);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Filter profiles by name/email
  const filtered = useMemo(() => {
    return profiles.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, profiles]);

  // Pagination
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleDelete = (id) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    setDeleteTarget(null);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => setCurrentPage(page);

  return (
    <div>
      <Row className="align-items-center mb-3">
        <Col><h3 className="mb-0">Marked Faculty Profiles</h3></Col>
        <Col md="4">
          <Form.Control
            placeholder="Search by name or email..."
            value={search}
            onChange={handleSearchChange}
          />
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Faculty Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Work Preference</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    No profiles found.
                  </td>
                </tr>
              ) : (
                paginated.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.email}</td>
                    <td>{p.department}</td>
                    <td>{p.preference}</td>
                    <td className="text-end">
                      <Button variant="primary" size="sm" className="me-2">
                        View
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setDeleteTarget(p)}>
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Pagination */}
      {pageCount > 1 && (
        <Pagination className="mt-3">
          {[...Array(pageCount)].map((_, idx) => {
            const page = idx + 1;
            return (
              <Pagination.Item
                key={page}
                active={page === currentPage}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Pagination.Item>
            );
          })}
        </Pagination>
      )}

      {/* Delete confirm modal */}
      <Modal show={!!deleteTarget} onHide={() => setDeleteTarget(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Removal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to remove <strong>{deleteTarget?.name}</strong> from marked profiles?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => handleDelete(deleteTarget.id)}>
            Remove
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );

};

export default MarkedProfiles;
