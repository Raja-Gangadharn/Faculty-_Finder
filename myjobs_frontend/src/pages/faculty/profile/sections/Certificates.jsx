import React, { useState } from 'react';
import { Card, Button, Row, Col, Form, ListGroup, Badge } from 'react-bootstrap';
import { FaPlus, FaTrash, FaFilePdf, FaFileImage, FaDownload } from 'react-icons/fa';

const Certificates = ({ isEditing }) => {
  const [certificates, setCertificates] = useState([
    {
      id: 1,
      name: 'AWS Certified Solutions Architect',
      number: 'AWS-123456',
      provider: 'Amazon Web Services',
      issueDate: '2022-01-15',
      expiryDate: '2024-01-15',
      file: 'aws-certificate.pdf'
    },
    {
      id: 2,
      name: 'Google Cloud Professional',
      number: 'GCP-789012',
      provider: 'Google Cloud',
      issueDate: '2021-11-10',
      expiryDate: '2023-11-10',
      file: 'gcp-certificate.pdf'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newCertificate, setNewCertificate] = useState({
    name: '',
    number: '',
    provider: '',
    issueDate: '',
    expiryDate: '',
    file: null
  });

  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = React.useRef(null);

  const handleAddCertificate = () => {
    setCertificates([...certificates, { ...newCertificate, id: Date.now() }]);
    setNewCertificate({
      name: '',
      number: '',
      provider: '',
      issueDate: '',
      expiryDate: '',
      file: null
    });
    setFilePreview(null);
    setShowAddForm(false);
  };

  const handleRemoveCertificate = (id) => {
    setCertificates(certificates.filter(cert => cert.id !== id));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCertificate({ ...newCertificate, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewCertificate({ ...newCertificate, file: file.name });
      
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
                      name="issueDate" 
                      value={newCertificate.issueDate}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label>Expiry Date</Form.Label>
                    <Form.Control 
                      type="date" 
                      name="expiryDate" 
                      value={newCertificate.expiryDate}
                      onChange={handleInputChange}
                      min={newCertificate.issueDate}
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
                        {newCertificate.file || 'No file chosen'}
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

        {certificates.length > 0 ? (
          <ListGroup variant="flush">
            {certificates.map((cert) => (
              <ListGroup.Item key={cert.id} className="py-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="d-flex">
                    <div className="me-3">
                      {getFileIcon(cert.file)}
                    </div>
                    <div>
                      <h6 className="mb-1">{cert.name}</h6>
                      <p className="mb-1 text-muted">
                        <strong>Provider:</strong> {cert.provider} • 
                        <strong>Cert #:</strong> {cert.number}
                      </p>
                      <p className="mb-0 text-muted small">
                        <strong>Issued:</strong> {formatDate(cert.issueDate)} • 
                        <strong>Expires:</strong> {cert.expiryDate ? formatDate(cert.expiryDate) : 'N/A'}
                        {cert.expiryDate && isExpired(cert.expiryDate) && (
                          <Badge bg="danger" className="ms-2">Expired</Badge>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="d-flex">
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="me-2"
                      href={`/certificates/${cert.file}`}
                      download
                    >
                      <FaDownload className="me-1" /> Download
                    </Button>
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
            ))}
          </ListGroup>
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
    </Card>
  );
};

export default Certificates;
