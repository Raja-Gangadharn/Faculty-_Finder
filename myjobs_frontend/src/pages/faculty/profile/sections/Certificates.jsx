import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Form, ListGroup, Badge, Alert, Spinner } from 'react-bootstrap';
import { FaPlus, FaTrash, FaFilePdf, FaFileImage, FaDownload, FaExclamationTriangle } from 'react-icons/fa';
import { Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import facultyService from '../../../../services/facultyService';

const Certificates = ({ isEditing }) => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newCertificate, setNewCertificate] = useState({
    name: '',
    number: '',
    provider: '',
    issue_date: '',
    expiry_date: '',
    file: null
  });

  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = React.useRef(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [certificateToDelete, setCertificateToDelete] = useState(null);

  // Fetch certificates on component mount
  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Please log in to view certificates.');
        return [];
      }
      
      const response = await facultyService.getCertificates();
      
      // Handle different response formats
      let certificatesData = [];
      
      if (Array.isArray(response)) {
        // If response is already an array
        certificatesData = response;
      } else if (response && typeof response === 'object') {
        // If response is an object with a results array (common in paginated APIs)
        if (Array.isArray(response.results)) {
          certificatesData = response.results;
        } else if (Array.isArray(response.data)) {
          // If response has a data array
          certificatesData = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // If response has a data object with certificates
          certificatesData = Object.values(response.data);
        }
      }
      setCertificates(certificatesData);
      return certificatesData;
    } catch (err) {
      console.error('Failed to fetch certificates:', err);
      const errorMsg = err.response?.data?.message || 'Failed to load certificates. Please try again.';
      setError(errorMsg);
      setCertificates([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleAddCertificate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      // Create form data with all fields
      const { file, ...certData } = newCertificate;
      const formData = new FormData();
      
      // Append all non-file fields
      Object.entries(certData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      
      // Append the file if it exists
      if (file) {
        formData.append('file', file);
      }
      
      if (editingId) {
        await facultyService.updateCertificate(editingId, formData);
        toast.success('Certificate updated successfully', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
      } else {
        await facultyService.createCertificate(formData);
        toast.success('Certificate added successfully', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
      }
      
      // Reset form
      setNewCertificate({
        name: '',
        number: '',
        provider: '',
        issue_date: '',
        expiry_date: '',
        file: null
      });
      setFilePreview(null);
      setShowAddForm(false);
      setEditingId(null);
      
      // Force a refresh of the certificates list with a small delay
      setTimeout(() => {
        fetchCertificates().catch(err => {
          // Error handled in the UI via setError
          setError('Failed to refresh certificates. Please reload the page.');
        });
      }, 500);
      
    } catch (err) {
      console.error('Error saving certificate:', err);
      const errorMsg = err.response?.data?.message || 'Failed to save certificate. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
    setShowAddForm(false);
  };

  const handleRemoveCertificate = (id) => {
    setCertificateToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!certificateToDelete) return;
    
    try {
      setLoading(true);
      await facultyService.deleteCertificate(certificateToDelete);
      
      // Update the UI by removing the deleted certificate
      setCertificates(certificates.filter(cert => cert.id !== certificateToDelete));
      
      // Show success toast
      toast.success('Certificate deleted successfully', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete certificate. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setCertificateToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setCertificateToDelete(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCertificate({ ...newCertificate, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewCertificate({ ...newCertificate, file });
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return null;
    const extension = fileName.split('.').pop().toLowerCase();
    return extension === 'pdf' ? <FaFilePdf className="text-danger me-2" /> : <FaFileImage className="text-primary me-2" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="section-title mb-0">Certificates</h5>
          {isEditing && (
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <FaPlus className="me-1" /> Add Certificate
            </Button>
          )}
        </div>

        {showAddForm && isEditing && (
          <Card className="mb-4 border-primary">
            <Card.Body>
              <h6 className="mb-3">Add New Certificate</h6>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Certificate Name</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="name" 
                      value={newCertificate.name}
                      onChange={handleInputChange}
                      placeholder="e.g., AWS Certified Solutions Architect"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Certificate Number</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="number" 
                      value={newCertificate.number}
                      onChange={handleInputChange}
                      placeholder="e.g., AWS-123456"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Provider</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="provider" 
                      value={newCertificate.provider}
                      onChange={handleInputChange}
                      placeholder="e.g., Amazon Web Services"
                    />
                  </Form.Group>
                </Col>
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label>Issue Date</Form.Label>
                    <Form.Control 
                      type="date" 
                      name="issue_date" 
                      value={newCertificate.issue_date}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label>Expiry Date</Form.Label>
                    <Form.Control 
                      type="date" 
                      name="expiry_date" 
                      value={newCertificate.expiry_date}
                      onChange={handleInputChange}
                      min={newCertificate.issue_date}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={12} className="mb-3">
                  <Form.Group>
                    <Form.Label>Certificate File (PDF/Image)</Form.Label>
                    <div className="d-flex align-items-center">
                      <Button 
                        variant="outline-secondary" 
                        onClick={triggerFileInput}
                        className="me-3"
                      >
                        Choose File
                      </Button>
                      <span className="text-muted">
                        {newCertificate.file?.name || 'No file chosen'}
                      </span>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="d-none"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </div>
                    {filePreview && (
                      <div className="mt-2">
                        <img 
                          src={filePreview} 
                          alt="Preview" 
                          style={{ maxWidth: '200px', maxHeight: '200px' }} 
                          className="img-thumbnail"
                        />
                      </div>
                    )}
                    <Form.Text className="text-muted">
                      Upload a scanned copy of your certificate (PDF, JPG, or PNG)
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={12} className="text-end">
                  <Button 
                    variant="outline-secondary" 
                    className="me-2"
                    onClick={() => {
                      setShowAddForm(false);
                      setFilePreview(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary"
                    onClick={handleAddCertificate}
                    disabled={!newCertificate.name || !newCertificate.provider || !newCertificate.file}
                  >
                    Add Certificate
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        {certificates && certificates.length > 0 ? (
          <>
            <div className="mb-3">
              <span className="badge bg-info text-dark">
                Showing {certificates.length} certificate{certificates.length !== 1 ? 's' : ''}
              </span>
            </div>
            <ListGroup variant="flush">
              {certificates.map((cert) => {
                
                return (
                  <ListGroup.Item key={cert.id || index} className="py-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="d-flex">
                        <div className="me-3">
                          {getFileIcon(cert.file || cert.file_name || '')}
                        </div>
                        <div>
                          <h6 className="mb-1">{cert.name || cert.certificate_name || 'Unnamed Certificate'}</h6>
                          <p className="mb-1 text-muted">
                            <strong>Provider:</strong> {cert.provider || 'N/A'} • 
                            <strong>Cert #:</strong> {cert.number || cert.certificate_number || 'N/A'}
                          </p>
                          <p className="mb-0 text-muted small">
                            <strong>Issued:</strong> {formatDate(cert.issue_date || cert.issued_date)} • 
                            <strong>Expires:</strong> {cert.expiry_date ? formatDate(cert.expiry_date) : 'N/A'}
                            {cert.expiry_date && isExpired(cert.expiry_date) && (
                              <Badge bg="danger" className="ms-2">Expired</Badge>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="d-flex">
                        {cert.file && (
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-2"
                            href={`/certificates/${cert.file}`}
                            download
                          >
                            <FaDownload className="me-1" /> Download
                          </Button>
                        )}
                        {isEditing && (
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleRemoveCertificate(cert.id)}
                          >
                            <FaTrash />
                          </Button>
                        )}
                      </div>
                    </div>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          </>
        ) : (
          <div className="text-center py-4">
            <FaFilePdf size={32} className="text-muted mb-2" />
            <p className="text-muted">No certificates added yet.</p>
            {isEditing && (
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => setShowAddForm(true)}
              >
                <FaPlus className="me-1" /> Add Certificate
              </Button>
            )}
          </div>
        )}
      </Card.Body>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this certificate? This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default Certificates;
