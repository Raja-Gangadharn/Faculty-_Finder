import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Form, ListGroup, Badge, Spinner, Alert, Modal } from 'react-bootstrap';
import { FaPlus, FaTrash, FaFileUpload, FaFile, FaCheck, FaCalendarAlt, FaEdit, FaExternalLinkAlt, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import facultyService from '../../../../services/facultyService';

const Documents = ({ isEditing }) => {
  // State for loading and errors
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Skills state
  const [skills, setSkills] = useState([]);

  // Presentations state 
  const [presentations, setPresentations] = useState([]);

  // Documents state
  const [documents, setDocuments] = useState([]);

  // Function to fetch documents
  const fetchDocuments = async () => {
    try {
      console.log('Starting to fetch documents...');
      setLoading(true);
      setError('');

      const docsData = await facultyService.getDocuments();
      console.log('Raw documents data from API:', docsData);

      // Ensure we have an array and process each document
      const processedDocs = Array.isArray(docsData)
        ? docsData.map(doc => {
          // Log the raw document data for debugging
          console.log('Processing document:', doc);

          // Handle different response formats
          let fileUrl = null;
          if (doc.file) {
            fileUrl = typeof doc.file === 'string' ? doc.file : doc.file.url;
          }

          return {
            id: doc.id || doc._id,
            name: doc.name || (doc.file && (doc.file.name || doc.file?.url?.split('/').pop())) || 'Untitled Document',
            doc_type: doc.doc_type || doc.type || 'document',
            file: {
              ...(doc.file || {}),
              url: fileUrl || doc.url,
              name: doc.name || (doc.file && doc.file.name) || 'Document',
              size: doc.size || (doc.file ? doc.file.size : 0)
            },
            uploaded_at: doc.uploaded_at || doc.created_at || doc.date_uploaded || new Date().toISOString(),
            size: doc.size || (doc.file ? doc.file.size : 0)
          };
        })
        : [];

      console.log('Processed documents:', processedDocs);
      setDocuments(processedDocs);
      return processedDocs;
    } catch (err) {
      console.error('Error in fetchDocuments:', err);
      setError('Failed to load documents. Please try again.');
      toast.error('Failed to load documents');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch documents
        await fetchDocuments();

        // Fetch skills
        const skillsData = await facultyService.getSkills();
        setSkills(Array.isArray(skillsData) ? skillsData : []);

        // Fetch presentations
        const presData = await facultyService.getPresentations();
        setPresentations(Array.isArray(presData) ? presData : []);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemType, setItemType] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Form States
  const [showSkillsForm, setShowSkillsForm] = useState(false);
  const [showPresentationsForm, setShowPresentationsForm] = useState(false);
  const [showDocumentsForm, setShowDocumentsForm] = useState(false);
  const [activeTab, setActiveTab] = useState('skills');

  // Multiple entries state
  const [skillEntries, setSkillEntries] = useState([{ skill: '', proficiency: 'Beginner' }]);
  const [presentationEntries, setPresentationEntries] = useState([{ title: '', date: '', venue: '' }]);
  const [documentEntries, setDocumentEntries] = useState([{ name: '', type: 'Research Paper', file: null }]);

  // Handle multiple skill entries
  const addSkillEntry = () => {
    setSkillEntries([...skillEntries, { skill: '', proficiency: 'Beginner' }]);
  };

  const removeSkillEntry = (index) => {
    const updated = [...skillEntries];
    updated.splice(index, 1);
    setSkillEntries(updated);
  };

  const handleSkillEntryChange = (index, field, value) => {
    const updated = [...skillEntries];
    updated[index] = { ...updated[index], [field]: value };
    setSkillEntries(updated);
  };

  // Handle multiple presentation entries
  const addPresentationEntry = () => {
    setPresentationEntries([...presentationEntries, { title: '', date: '', venue: '' }]);
  };

  const removePresentationEntry = (index) => {
    const updated = [...presentationEntries];
    updated.splice(index, 1);
    setPresentationEntries(updated);
  };

  const handlePresentationEntryChange = (index, field, value) => {
    const updated = [...presentationEntries];
    updated[index] = { ...updated[index], [field]: value };
    setPresentationEntries(updated);
  };

  // Handle multiple document entries
  const addDocumentEntry = () => {
    setDocumentEntries([...documentEntries, { name: '', type: 'Research Paper', file: null }]);
  };

  const removeDocumentEntry = (index) => {
    const updated = [...documentEntries];
    updated.splice(index, 1);
    setDocumentEntries(updated);
  };

  const handleDocumentEntryChange = (index, field, value, isFile = false) => {
    const updated = [...documentEntries];
    if (isFile) {
      const file = value.target.files[0];
      updated[index] = {
        ...updated[index],
        file,
        name: file ? file.name : updated[index].name,
        size: file ? (file.size / 1024 / 1024).toFixed(1) + 'MB' : ''
      };
    } else if (field === 'type') {
      const docType = value.toLowerCase().replace(/ /g, '_');
      updated[index] = { ...updated[index], [field]: docType };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setDocumentEntries(updated);
  };

  // Toggle form sections
  const toggleSkillsForm = () => {
    setShowSkillsForm(!showSkillsForm);
    setShowPresentationsForm(false);
    setShowDocumentsForm(false);
    setActiveTab('skills');
  };

  const togglePresentationsForm = () => {
    setShowPresentationsForm(!showPresentationsForm);
    setShowSkillsForm(false);
    setShowDocumentsForm(false);
    setActiveTab('presentations');
  };

  const toggleDocumentsForm = () => {
    setShowDocumentsForm(!showDocumentsForm);
    setShowSkillsForm(false);
    setShowPresentationsForm(false);
    setActiveTab('documents');
  };

  // Add Multiple Items
  const addSkills = async () => {
    try {
      setLoading(true);
      const validSkills = skillEntries.filter(entry => entry.skill.trim() !== '');

      if (validSkills.length === 0) {
        toast.error('Please add at least one skill');
        return;
      }

      const responses = [];
      for (const skill of validSkills) {
        try {
          const response = await facultyService.createSkill(skill);
          responses.push(response);
        } catch (err) {
          console.error('Error adding skill:', err);
          toast.error(`Failed to add skill: ${skill.skill}`);
        }
      }

      if (responses.length > 0) {
        setSkills([...responses, ...skills]);
        setSkillEntries([{ skill: '', proficiency: 'Beginner' }]);
        setShowSkillsForm(false);
        toast.success(`Successfully added ${responses.length} skill(s)`);
      }
    } catch (err) {
      console.error('Error in addSkills:', err);
      toast.error('Failed to add skills');
    } finally {
      setLoading(false);
    }
  };

  const addPresentations = async () => {
    try {
      setLoading(true);
      const validPresentations = presentationEntries.filter(
        entry => entry.title.trim() !== '' && entry.date.trim() !== ''
      );

      if (validPresentations.length === 0) {
        toast.error('Please add at least one presentation with title and date');
        return;
      }

      const responses = [];
      for (const presentation of validPresentations) {
        try {
          const response = await facultyService.createPresentation(presentation);
          responses.push(response);
        } catch (err) {
          console.error('Error adding presentation:', err);
          toast.error(`Failed to add presentation: ${presentation.title}`);
        }
      }

      if (responses.length > 0) {
        setPresentations([...responses, ...presentations]);
        setPresentationEntries([{ title: '', date: '', venue: '' }]);
        setShowPresentationsForm(false);
        toast.success(`Successfully added ${responses.length} presentation(s)`);
      }
    } catch (err) {
      console.error('Error in addPresentations:', err);
      toast.error('Failed to add presentations');
    } finally {
      setLoading(false);
    }
  };

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  // Add Items
  const addDocuments = async () => {
    try {
      setLoading(true);

      // Filter out invalid entries
      const validDocuments = documentEntries.filter(entry =>
        entry.file && entry.file.size > 0 && entry.file.size <= MAX_FILE_SIZE &&
        ALLOWED_FILE_TYPES.includes(entry.file.type)
      );

      if (validDocuments.length === 0) {
        toast.error('Please add at least one valid document (PDF, DOC, or DOCX, max 10MB)');
        return;
      }

      const responses = [];
      for (const doc of validDocuments) {
        try {
          const formData = new FormData();
          formData.append('file', doc.file);
          formData.append('name', doc.name || doc.file.name);
          formData.append('doc_type', doc.type.toLowerCase().replace(/ /g, '_') || 'research_paper');

          const response = await facultyService.createDocument(formData);
          responses.push(response);
        } catch (err) {
          console.error('Error uploading document:', err);
          toast.error(`Failed to upload document: ${doc.name || doc.file?.name}`);
        }
      }

      if (responses.length > 0) {
        setDocuments([...responses, ...documents]);
        setDocumentEntries([{ name: '', type: 'Research Paper', file: null }]);
        setShowDocumentsForm(false);
        toast.success(`Successfully uploaded ${responses.length} document(s)`);
      }
    } catch (err) {
      console.error('Error in addDocuments:', err);
      toast.error('Failed to upload documents');
    } finally {
      setLoading(false);
    }
  };
  // Remove Items
  const removeItem = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) {
      return;
    }

    try {
      setLoading(true);

      switch (type) {
        case 'skill':
          await facultyService.deleteSkill(id);
          setSkills(skills.filter(skill => skill.id !== id));
          break;

        case 'presentation':
          await facultyService.deletePresentation(id);
          setPresentations(presentations.filter(p => p.id !== id));
          break;

        case 'document':
          await facultyService.deleteDocument(id);
          // Refresh the documents list to ensure UI is in sync
          await fetchDocuments();
          break;

        default:
          break;
      }

      toast.success('Item deleted successfully');
    } catch (err) {
      console.error(`Error deleting ${type}:`, err);
      toast.error(`Failed to delete ${type}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete confirmation
  const handleDelete = async () => {
    if (!itemToDelete || !itemType) return;

    setIsDeleting(true);
    try {
      setLoading(true);
      switch (itemType) {
        case 'skill':
          await facultyService.deleteSkill(itemToDelete);
          setSkills(prevSkills => prevSkills.filter(skill => skill.id !== itemToDelete));
          break;
        case 'presentation':
          await facultyService.deletePresentation(itemToDelete);
          setPresentations(prevPresentations => prevPresentations.filter(pres => pres.id !== itemToDelete));
          break;
        case 'document':
          await facultyService.deleteDocument(itemToDelete);
          setDocuments(prevDocuments => prevDocuments.filter(doc => doc.id !== itemToDelete));
          break;
        default:
          break;
      }
      toast.success(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting ${itemType}:`, error);
      toast.error(`Failed to delete ${itemType}`);
    } finally {
      setLoading(false);
      setIsDeleting(false);
      closeDeleteModal();
    }
  };

  // Show delete confirmation modal
  const confirmDelete = (id, type) => {
    setItemToDelete(id);
    setItemType(type);
    setShowDeleteModal(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
    setItemType('');
  };

  // Skill Proficiency Options
  const proficiencyOptions = [
    'Beginner', 'Intermediate', 'Advanced', 'Expert'
  ];

  // Document Types
  const documentTypes = [
    'Research Paper', 'Teaching Materials', 'Course Material', 'Thesis', 'Other'
  ];

  // Format document type for display
  const formatDocumentType = (type) => {
    if (!type) return 'Document';
    // Convert snake_case to Title Case
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    try {
      // Try to parse the date string
      const date = new Date(dateString);

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        // If not a valid date, try to parse as ISO string
        const isoDate = new Date(dateString + 'T00:00:00');
        if (!isNaN(isoDate.getTime())) {
          return isoDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        }
        return 'N/A';
      }

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    if (typeof bytes === 'string' && bytes.endsWith('MB')) return bytes; // Already formatted

    const numBytes = typeof bytes === 'string' ? parseFloat(bytes) : bytes;
    if (isNaN(numBytes)) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(numBytes) / Math.log(k));
    return parseFloat((numBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading && documents.length === 0 && skills.length === 0 && presentations.length === 0) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading documents and skills...</p>
      </div>
    );
  }

  return (
    <>
      <Card className="mb-4">
        <Card.Body>
          <h5 className="section-title mb-4">Skills & Documents</h5>

          {error && (
            <Alert variant="danger" onClose={() => setError('')} dismissible>
              {error}
            </Alert>
          )}

          {/* Skills Section */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Skills</h6>
              {isEditing && !showSkillsForm && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={toggleSkillsForm}
                  disabled={loading}
                >
                  <FaPlus className="me-1" /> Add Skills
                </Button>
              )}
            </div>

            {showSkillsForm && isEditing && (
              <Card className="mb-3 border-primary">
                <Card.Body>
                  {skillEntries.map((entry, index) => (
                    <div key={index} className="border-bottom pb-3 mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        {skillEntries.length > 1 && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeSkillEntry(index)}
                            className="rounded-circle p-1"
                          >
                            <FaTrash size={12} />
                          </Button>
                        )}
                      </div>
                      <Row>
                        <Col md={8} className="mb-3">
                          <Form.Group>
                            <Form.Label>Skill Name</Form.Label>
                            <Form.Control
                              type="text"
                              value={entry.skill}
                              onChange={(e) => handleSkillEntryChange(index, 'skill', e.target.value)}
                              placeholder="e.g., JavaScript, Python"
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label>Proficiency</Form.Label>
                            <Form.Select
                              value={entry.proficiency}
                              onChange={(e) => handleSkillEntryChange(index, 'proficiency', e.target.value)}
                              required
                            >
                              {proficiencyOptions.map((level, i) => (
                                <option key={i} value={level}>
                                  {level}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>
                  ))}

                  <div className="d-flex justify-content-between mt-3">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={addSkillEntry}
                      disabled={loading}
                    >
                      <FaPlus className="me-1" /> Add Another Skill
                    </Button>
                    <div>
                      <Button
                        variant="outline-secondary"
                        className="me-2"
                        onClick={toggleSkillsForm}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        onClick={addSkills}
                        disabled={loading || skillEntries.some(entry => !entry.skill.trim())}
                      >
                        {loading ? 'Saving...' : `Save ${skillEntries.length} Skill(s)`}
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            )}


            {skills.length > 0 ? (
              <ListGroup variant="flush">
                {skills.map((skill) => (
                  <ListGroup.Item key={skill.id} className="py-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-0">{skill.skill}</h6>
                        <Badge bg={getProficiencyColor(skill.proficiency)}>
                          {skill.proficiency}
                        </Badge>
                      </div>
                      {isEditing && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete(skill.id, 'skill');
                          }}
                        >
                          <FaTrash />
                        </Button>
                      )}
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <div className="text-center py-4">
                <FaFile size={32} className="text-muted mb-2" />
                <p className="text-muted">No skills added yet.</p>
                {isEditing && (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setShowSkillsForm(true)}
                  >
                    <FaPlus className="me-1" /> Add Skill
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Presentations Section */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Presentations</h6>
              {isEditing && !showPresentationsForm && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={togglePresentationsForm}
                  disabled={loading}
                >
                  <FaPlus className="me-1" /> Add Presentations
                </Button>
              )}
            </div>

            {showPresentationsForm && isEditing && (
              <Card className="mb-3 border-primary">
                <Card.Body>
                  {presentationEntries.map((entry, index) => (
                    <div key={index} className="border-bottom pb-3 mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="mb-0">Presentation #{index + 1}</h6>
                        {presentationEntries.length > 1 && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removePresentationEntry(index)}
                            className="rounded-circle p-1"
                          >
                            <FaTrash size={12} />
                          </Button>
                        )}
                      </div>
                      <Row>
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                              type="text"
                              value={entry.title}
                              onChange={(e) => handlePresentationEntryChange(index, 'title', e.target.value)}
                              placeholder="e.g., AI in Education"
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label>Date</Form.Label>
                            <Form.Control
                              type="date"
                              value={entry.date}
                              onChange={(e) => handlePresentationEntryChange(index, 'date', e.target.value)}
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={12} className="mb-3">
                          <Form.Group>
                            <Form.Label>Venue</Form.Label>
                            <Form.Control
                              type="text"
                              value={entry.venue}
                              onChange={(e) => handlePresentationEntryChange(index, 'venue', e.target.value)}
                              placeholder="e.g., International Conference on AI"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>
                  ))}

                  <div className="d-flex justify-content-between mt-3">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={addPresentationEntry}
                      disabled={loading}
                    >
                      <FaPlus className="me-1" /> Add Another Presentation
                    </Button>
                    <div>
                      <Button
                        variant="outline-secondary"
                        className="me-2"
                        onClick={togglePresentationsForm}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        onClick={addPresentations}
                        disabled={loading || presentationEntries.some(entry => !entry.title.trim() || !entry.date)}
                      >
                        {loading ? 'Saving...' : `Save ${presentationEntries.length} Presentation(s)`}
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            )}

            {presentations.length > 0 ? (
              <ListGroup variant="flush">
                {presentations.map((pres) => (
                  <ListGroup.Item key={pres.id} className="py-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="mb-1">{pres.title}</h6>
                        <p className="mb-1 text-muted">
                          <FaFile className="me-2" />
                          {pres.venue}
                        </p>
                        <p className="mb-0 text-muted small">
                          <FaCalendarAlt className="me-1" />
                          {new Date(pres.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      {isEditing && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete(pres.id, 'presentation');
                          }}
                        >
                          <FaTrash />
                        </Button>
                      )}
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <div className="text-center py-4">
                <FaFile size={32} className="text-muted mb-2" />
                <p className="text-muted">No presentations added yet.</p>
                {isEditing && (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setShowPresentationsForm(true)}
                  >
                    <FaPlus className="me-1" /> Add Presentation
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Documents Section */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Documents</h6>
              {isEditing && !showDocumentsForm && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={toggleDocumentsForm}
                  disabled={loading}
                >
                  <FaPlus className="me-1" /> Add Documents
                </Button>
              )}
            </div>

            {showDocumentsForm && isEditing && (
              <Card className="mb-3 border-primary">
                <Card.Body>
                  {documentEntries.map((entry, index) => (
                    <div key={index} className="border-bottom pb-3 mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="mb-0">Document #{index + 1}</h6>
                        {documentEntries.length > 1 && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeDocumentEntry(index)}
                            className="rounded-circle p-1"
                          >
                            <FaTrash size={12} />
                          </Button>
                        )}
                      </div>
                      <Row>
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label>Document Type</Form.Label>
                            <Form.Select
                              value={entry.type}
                              onChange={(e) => handleDocumentEntryChange(index, 'type', e.target.value)}
                              required
                            >
                              {documentTypes.map(type => (
                                <option key={type} value={type.toLowerCase().replace(/ /g, '_')}>
                                  {type}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label>Document Name (Optional)</Form.Label>
                            <Form.Control
                              type="text"
                              value={entry.name}
                              onChange={(e) => handleDocumentEntryChange(index, 'name', e.target.value)}
                              placeholder="e.g., Research Paper on AI"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={12}>
                          <Form.Group>
                            <Form.Label>Upload File</Form.Label>
                            <Form.Control
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => handleDocumentEntryChange(index, 'file', e, true)}
                              required
                            />
                            {entry.file && (
                              <small className="text-muted d-block mt-1">
                                Selected: {entry.file.name} ({entry.size})
                              </small>
                            )}
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>
                  ))}

                  <div className="d-flex justify-content-between mt-3">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={addDocumentEntry}
                      disabled={loading}
                    >
                      <FaPlus className="me-1" /> Add Another Document
                    </Button>
                    <div>
                      <Button
                        variant="outline-secondary"
                        className="me-2"
                        onClick={toggleDocumentsForm}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        onClick={addDocuments}
                        disabled={loading || documentEntries.some(entry => !entry.file)}
                      >
                        {loading ? 'Uploading...' : `Upload ${documentEntries.length} Document(s)`}
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            )}

            {documents.length > 0 ? (
              <ListGroup variant="flush">
                {documents.map((doc) => (
                  <ListGroup.Item key={doc.id} className="py-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="d-flex flex-column w-100">
                        <div className="d-flex align-items-center mb-1">
                          <FaFile className="me-2 text-muted flex-shrink-0" />
                          <h6 className="mb-0 text-truncate" style={{ maxWidth: '250px' }} title={doc.name || 'Untitled Document'}>
                            {doc.name || 'Untitled Document'}
                          </h6>
                        </div>

                        <div className="d-flex align-items-center mb-1">
                          <FaFileUpload className="me-2 text-muted flex-shrink-0" />
                          <span className="text-muted">
                            {formatDocumentType(doc.doc_type || doc.type || 'document')}
                          </span>
                        </div>

                        <div className="d-flex align-items-center">
                          <FaCalendarAlt className="me-2 text-muted flex-shrink-0" />
                          <span className="text-muted small">
                            {formatDate(doc.uploaded_at || doc.created_at || doc.date)}
                            {' • '}
                            {doc.file ?
                              formatFileSize(doc.file.size) :
                              doc.size ?
                                formatFileSize(doc.size) :
                                'N/A'}
                            {doc.file && (doc.file.url || doc.url) && (
                              <a
                                href={doc.file?.url || doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ms-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <FaExternalLinkAlt className="ms-1" size={12} />
                              </a>
                            )}
                          </span>
                        </div>
                      </div>
                      {isEditing && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete(doc.id, 'document');
                          }}
                        >
                          <FaTrash />
                        </Button>
                      )}
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <div className="text-center py-4">
                <FaFileUpload size={32} className="text-muted mb-2" />
                <p className="text-muted">No documents uploaded yet.</p>
                {isEditing && (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setShowDocumentsForm(true)}
                  >
                    <FaPlus className="me-1" /> Upload Document
                  </Button>
                )}
              </div>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="d-flex align-items-center">
            <FaExclamationTriangle className="text-warning me-2" />
            Confirm Deletion
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this {itemType}? This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteModal} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Spinner as="span" size="sm" animation="border" role="status" aria-hidden="true" className="me-1" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

// Helper function to get proficiency color
const getProficiencyColor = (level) => {
  switch (level) {
    case 'Beginner':
      return 'secondary';
    case 'Intermediate':
      return 'info';
    case 'Advanced':
      return 'warning';
    case 'Expert':
      return 'success';
    default:
      return 'primary';
  }
};

export default Documents;
