import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Card, Button, Row, Col, Form, Spinner, Alert, Badge, Accordion, Modal, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash, FaFileUpload, FaEdit, FaBook, FaExclamationTriangle } from 'react-icons/fa';
import facultyService from '../../../../services/facultyService';

const Transcript = forwardRef(({ isEditing }, ref) => {
  const [transcripts, setTranscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showCoursesModal, setShowCoursesModal] = useState(false);
  const [selectedTranscript, setSelectedTranscript] = useState(null);
  const [coursesSelection, setCoursesSelection] = useState({});
  const [savingCourses, setSavingCourses] = useState(false);

  const initialCourseState = {
    code: '',
    name: '',
    credit_hours: '',
    department: ''
  };

  const initialFormState = {
    degree_level: '',
    degree: '',
    institution: '',
    major: '',
    department: '',
    year_completed: new Date().getFullYear().toString(),
    file: null,
    file_name: '',
    courses: [JSON.parse(JSON.stringify(initialCourseState))]
  };

  const [formData, setFormData] = useState(JSON.parse(JSON.stringify(initialFormState)));
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoadingDepartments(true);
        const response = await facultyService.getDepartments();
        setDepartments(response.data);
      } catch (error) {
        console.error('Error fetching departments:', error);
        toast.error('Failed to load departments');
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

  // Define valid degree options
  const degreeOptions = [
    { value: "Master's", label: "Master's" },
    { value: 'Doctorate', label: 'Doctorate' }
  ];


  // Handle course input changes
  const handleCourseChange = (index, field, value) => {
    const updatedCourses = [...formData.courses];
    updatedCourses[index] = {
      ...updatedCourses[index],
      [field]: value
    };
    setFormData({
      ...formData,
      courses: updatedCourses
    });
  };

  // Add new course row
  const addCourse = () => {
    setFormData({
      ...formData,
      courses: [...formData.courses, JSON.parse(JSON.stringify(initialCourseState))]
    });
  };

  // Remove course row
  const removeCourse = (index) => {
    if (formData.courses.length > 1) {
      const updatedCourses = [...formData.courses];
      updatedCourses.splice(index, 1);
      setFormData({
        ...formData,
        courses: updatedCourses
      });
    } else {
      toast.warning('At least one course is required');
    }
  };

  // Function to handle file download with better error handling
  const handleDownload = (filePath, fileName = 'transcript.pdf') => {
    try {
      if (!filePath) {
        setError('File not found or not available for download.');
        return;
      }

      // Get the base URL from environment variables or use the current origin
      const baseUrl = process.env.REACT_APP_API_URL || window.location.origin;

      // Construct the full URL
      // Remove any leading slashes from the file path to prevent double slashes
      const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
      const fullUrl = `${baseUrl}/${cleanPath}`;


      // Create a temporary link element
      const link = document.createElement('a');
      link.href = fullUrl;
      link.download = fileName;
      link.target = '_blank'; // Open in new tab for better error visibility
      link.rel = 'noopener noreferrer';

      // Add error event listener
      link.onerror = () => {
        setError('Failed to download file. The file may have been moved or deleted.');
        window.open(fullUrl, '_blank');
      };

      // Add click event to handle success
      link.onclick = (e) => {
        e.preventDefault();
        return true;
      };

      // Add the link to the document and trigger the download
      document.body.appendChild(link);
      link.click();

      // Clean up after a short delay
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);

    } catch (error) {
      setError('An error occurred while trying to download the file.');
    }
  };

  // Expose save function to parent
  useImperativeHandle(ref, () => ({
    save: async () => {
      try {
        // If there's a form being edited, save it
        if (showAddForm && formData) {
          const form = document.getElementById('transcript-form');
          if (form) {
            setUploading(true);
            const formDataToSend = new FormData();

            // Map required fields
            if (formData.degree) formDataToSend.append('degree', formData.degree);
            if (formData.degree_level) formDataToSend.append('degree_level', formData.degree_level);
            if (formData.institution) formDataToSend.append('college', formData.institution);
            if (formData.year_completed) formDataToSend.append('year_completed', formData.year_completed);

            // Optional fields with normalization
            if (formData.department && /^\d+$/.test(String(formData.department))) {
              formDataToSend.append('department', String(formData.department));
            }
            if (formData.major) {
              formDataToSend.append('major', formData.major);
            }
            if (Array.isArray(formData.courses)) {
              const normalizedCourses = formData.courses
                .map(c => ({
                  code: (c.code || '').trim(),
                  name: (c.name || '').trim(),
                  credit_hours: c.credit_hours !== '' && c.credit_hours !== null ? c.credit_hours : undefined,
                  grade: (c.grade || '').trim(),
                  department: (c.department && /^\d+$/.test(String(c.department))) ? String(c.department) : undefined,
                }))
                .filter(c => c.name);

              if (normalizedCourses.length > 0) {
                formDataToSend.append('courses', JSON.stringify(normalizedCourses));
              }
            }

            // Add file if it exists
            if (file) {
              formDataToSend.append('file', file);
            }

            // Log form data for debugging
            console.log('Saving transcript with data:');
            for (let [key, value] of formDataToSend.entries()) {
              console.log(key, value);
            }

            const response = editingId
              ? await facultyService.updateTranscript(editingId, formDataToSend)
              : await facultyService.createTranscript(formDataToSend);

            if (response && response.data) {
              // Refresh the list
              await fetchTranscripts();

              // Reset the form
              setFormData(initialFormState);
              setFile(null);
              setEditingId(null);
              setShowAddForm(false);

              return {
                ok: true,
                message: editingId ? 'Transcript updated successfully' : 'Transcript added successfully'
              };
            }
            return {
              ok: false,
              error: 'Failed to save transcript: No data returned from server'
            };
          }
        }
        return { ok: true };
      } catch (error) {
        console.error('Error saving transcript:', error);
        const errorMessage = error.response?.data?.message || 'Failed to save transcript';
        setError(errorMessage);
        return {
          ok: false,
          error: errorMessage,
          details: error.response?.data
        };
      } finally {
        setUploading(false);
      }
    }
  }));
  // Fetch transcripts with better error handling and response parsing
  const fetchTranscripts = async () => {
    try {
      setLoading(true);
      setError('');

      // Check if user is authenticated
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('No authentication token found. Please log in.');
        setError('Please log in to view transcripts.');
        return [];
      }

      console.log('Fetching transcripts...');
      const response = await facultyService.getTranscripts();
      console.log('Raw API response:', response);

      // Handle both array and paginated responses
      let data = response;
      if (response && response.results) {
        console.log('Response has results array with pagination');
        data = response.results;
      } else if (Array.isArray(response)) {
        console.log('Response is already an array');
      } else {
        console.log('Unexpected response format, defaulting to empty array');
        data = [];
      }

      // Process the data
      const processedData = data.map(item => ({
        id: item.id,
        degree: item.degree,
        degree_level: item.degree_level || null,
        institution: item.college || item.institution || 'N/A',
        major: item.major || 'N/A',
        department: item.department ?? null,
        department_name: item.department_name || null,
        year_completed: item.year_completed || 'N/A',
        file: item.file || null,
        courses: Array.isArray(item.courses)
          ? item.courses.map(c => ({
            id: c.id,
            code: c.code || '',
            name: c.name || '',
            credit_hours: (c.credits !== undefined && c.credits !== null) ? c.credits : (c.credit_hours || ''),
            grade: c.grade || '',
            department: (typeof c.department === 'object' && c.department) ? c.department.id : (c.department ?? ''),
            department_name: c.department_name || null,
            created_at: c.created_at || null,
          }))
          : [],
        created_at: item.created_at || new Date().toISOString()
      }));

      console.log('Processed transcripts data:', processedData);
      setTranscripts(processedData);
      return processedData;
    } catch (err) {
      console.error('Failed to fetch transcripts', err);
      const errorMsg = err.response?.data?.message || 'Failed to load transcripts. Please try again.';
      setError(errorMsg);
      setTranscripts([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and fetch when form is closed
  useEffect(() => {
    fetchTranscripts();
  }, [showAddForm]); // Add showAddForm as a dependency

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle department selection from the main form
    if (name === 'department') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Reset any previous errors
      setError('');

      // Check file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (selectedFile.size > maxSize) {
        setError('File size must be less than 5MB');
        e.target.value = ''; // Reset file input
        return;
      }

      // Check file type
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/octet-stream', // For some .doc files
        'application/vnd.ms-word', // For older .doc files
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
      const isValidType = validTypes.includes(selectedFile.type) ||
        ['.pdf', '.doc', '.docx'].includes('.' + fileExtension);

      if (!isValidType) {
        setError('Invalid file type. Please upload a PDF, DOC, or DOCX file.');
        e.target.value = ''; // Reset file input
        return;
      }

      // Update the file state
      setFile(selectedFile);

      // Also update formData with file name for display purposes
      setFormData(prev => ({
        ...prev,
        file_name: selectedFile.name
      }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate degree type
    const validDegrees = ["Master's", 'Doctorate'];
    if (!validDegrees.includes(formData.degree_level)) {
      setError('Only Master\'s and Doctoral degrees are accepted for transcripts');
      return;
    }

    // Basic form validation
    if (!formData.degree_level || !formData.degree?.trim() || !formData.institution?.trim() || !formData.year_completed) {
      setError('Please fill in all required fields');
      return;
    }
    if (!file && !editingId) {
      setError('Please select a transcript file');
      return;
    }

    // Validate year format (should be a number between 1900 and current year + 5)
    const currentYear = new Date().getFullYear();
    const year = parseInt(formData.year_completed, 10);
    if (isNaN(year) || year < 1900 || year > currentYear + 5) {
      setError(`Please enter a valid year between 1900 and ${currentYear + 5}`);
      return;
    }

    try {
      setUploading(true);

      // Create FormData object for file upload
      const formDataToSend = new FormData();

      // Add all form fields to FormData
      formDataToSend.append('degree', formData.degree.trim());
      formDataToSend.append('degree_level', formData.degree_level);
      formDataToSend.append('college', formData.institution.trim()); // Map to 'college' in backend

      // Optional fields
      if (formData.department && /^\d+$/.test(String(formData.department))) {
        formDataToSend.append('department', String(formData.department));
      }
      if (formData.major) {
        formDataToSend.append('major', formData.major.trim());
      }
      if (Array.isArray(formData.courses)) {
        const normalizedCourses = formData.courses
          .map(c => ({
            code: (c.code || '').trim(),
            name: (c.name || '').trim(),
            credit_hours: c.credit_hours !== '' && c.credit_hours !== null ? c.credit_hours : undefined,
            grade: (c.grade || '').trim(),
            department: (c.department && /^\d+$/.test(String(c.department))) ? String(c.department) : undefined,
          }))
          // keep only rows that have a course name (backend requires name)
          .filter(c => c.name);

        if (normalizedCourses.length > 0) {
          formDataToSend.append('courses', JSON.stringify(normalizedCourses));
        }
      }
      if (formData.year_completed) {
        formDataToSend.append('year_completed', formData.year_completed);
      }

      // Add file if it exists
      if (file) {
        formDataToSend.append('file', file);
      }

      console.log('Submitting form data:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }

      let response;
      if (editingId) {
        console.log(`Updating transcript ${editingId}`);
        response = await facultyService.updateTranscript(editingId, formDataToSend);
      } else {
        console.log('Creating new transcript');
        response = await facultyService.createTranscript(formDataToSend);
      }

      console.log('API Response:', response);

      const successMessage = editingId ? 'Transcript updated successfully!' : 'Transcript added successfully!';
      toast.success(successMessage, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });

      // Reset form and fetch updated list
      setFormData(JSON.parse(JSON.stringify(initialFormState)));
      setFile(null);
      setEditingId(null);
      await fetchTranscripts();
      setShowAddForm(false);

      return { ok: true };
    } catch (err) {
      console.error('Error saving transcript:', err);

      // More detailed error handling
      let errorMsg = 'Failed to save transcript. Please try again.';

      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
        console.error('Response headers:', err.response.headers);

        if (err.response.data) {
          if (typeof err.response.data === 'string') {
            const s = err.response.data;
            // Avoid dumping HTML error pages into the UI
            if (/<\!DOCTYPE|<html[\s>]/i.test(s)) {
              errorMsg = 'Server error occurred while saving transcript. Please try again.';
            } else {
              errorMsg = s;
            }
          } else if (err.response.data.message) {
            errorMsg = err.response.data.message;
          } else if (err.response.data.error) {
            errorMsg = err.response.data.error;
          } else if (err.response.data.errors) {
            // Handle validation errors
            const errors = Object.values(err.response.data.errors).flat();
            errorMsg = errors.join('\n');
          } else if (typeof err.response.data === 'object') {
            // DRF typically returns { field: [messages] }
            const parts = [];
            Object.entries(err.response.data).forEach(([field, msgs]) => {
              if (Array.isArray(msgs)) {
                msgs.forEach(m => parts.push(`${field}: ${m}`));
              } else if (msgs && typeof msgs === 'object') {
                // nested errors (e.g., courses.0.name)
                parts.push(`${field}: ${JSON.stringify(msgs)}`);
              } else if (msgs !== undefined && msgs !== null) {
                parts.push(`${field}: ${String(msgs)}`);
              }
            });
            if (parts.length) errorMsg = parts.join('\n');
          }
        }
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response received:', err.request);
        errorMsg = 'No response from server. Please check your connection.';
      } else {
        // Something happened in setting up the request
        console.error('Request error:', err.message);
        errorMsg = err.message || 'Error setting up the request.';
      }

      setError(errorMsg);
      return { ok: false, error: errorMsg };
    } finally {
      setUploading(false);
    }
  };
  const confirmDelete = (id) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      setLoading(true);
      setError('');

      console.log('Deleting transcript with ID:', deletingId);
      await facultyService.deleteTranscript(deletingId);

      // Update the transcripts list by removing the deleted one
      setTranscripts(prevTranscripts => {
        const updated = prevTranscripts.filter(transcript => transcript.id !== deletingId);
        console.log('Updated transcripts after deletion:', updated);
        return updated;
      });

      toast.success('Transcript deleted successfully', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });

      // Close the modal
      setShowDeleteModal(false);
      setDeletingId(null);
    } catch (err) {
      console.error('Error deleting transcript:', err);
      const errorMsg = err.response?.data?.message ||
        err.message ||
        'Failed to delete transcript. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setDeletingId(null);
  };

  const handleEdit = (transcript) => {
    // Reset form data with transcript values
    setFormData({
      degree_level: transcript.degree_level || '',
      degree: transcript.degree || '',
      institution: transcript.institution || transcript.college || '', // Handle both institution and college fields
      major: transcript.major || '',
      department: transcript.department || '',
      year_completed: transcript.year_completed || new Date().getFullYear().toString(),
      file_name: transcript.file ? transcript.file.split('/').pop() : '', // Extract filename from file URL if it exists
      courses: transcript.courses?.length > 0 ? transcript.courses.map(course => ({
        code: course.code || '',
        name: course.name || '',
        credit_hours: course.credit_hours || course.credits || '',
        grade: course.grade || '',
        department: course.department || ''
      })) : [JSON.parse(JSON.stringify(initialCourseState))],
      file_url: transcript.file || ''
    });

    // Clear any previously selected file from the file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';

    // Reset file state
    setFile(null);

    // Set editing mode
    setEditingId(transcript.id);
    setShowAddForm(true);
    setError(''); // Clear any previous errors

    // Scroll to the form
    setTimeout(() => {
      const formElement = document.getElementById('transcript-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const openCoursesModal = (transcript) => {
    const map = {};
    (transcript.courses || []).forEach((c) => {
      if (c && (c.id !== undefined && c.id !== null)) map[c.id] = true;
    });
    setSelectedTranscript(transcript);
    setCoursesSelection(map);
    setShowCoursesModal(true);
  };

  const toggleCourseSelection = (courseId) => {
    setCoursesSelection((prev) => ({ ...prev, [courseId]: !prev[courseId] }));
  };

  const handleCoursesUpdate = async () => {
    if (!selectedTranscript) return;
    try {
      setSavingCourses(true);
      const selected = (selectedTranscript.courses || []).filter((c) => coursesSelection[c.id]);
      const payloadCourses = selected
        .map((c) => ({
          code: (c.code || '').trim(),
          name: (c.name || '').trim(),
          credit_hours: (c.credit_hours !== '' && c.credit_hours !== null && c.credit_hours !== undefined) ? c.credit_hours : undefined,
          grade: (c.grade || '').trim(),
          department: (c.department && /^\d+$/.test(String(c.department))) ? String(c.department) : (typeof c.department === 'number' ? String(c.department) : undefined),
        }))
        // Filter out any empty-name rows to satisfy backend validation
        .filter((c) => !!c.name);
      // Use PATCH for partial update so required transcript fields are not re-validated
      await facultyService.patchTranscript(selectedTranscript.id, { courses: payloadCourses });
      toast.success('Courses updated successfully');
      setShowCoursesModal(false);
      setSelectedTranscript(null);
      await fetchTranscripts();
    } catch (err) {
      console.error('Failed to update courses', err);
      toast.error('Failed to update courses');
    } finally {
      setSavingCourses(false);
    }
  };

  if (loading && !showAddForm) {
    return (
      <Card className="mb-4">
        <Card.Body className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2 mb-0">Loading transcripts...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="section-title mb-0">Transcripts</h5>
          {isEditing && !showAddForm && (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => setShowAddForm(true)}
              disabled={loading}
            >
              <FaPlus className="me-1" /> Add Transcript
            </Button>
          )}
        </div>

        {error && (
          <Alert
            variant="danger"
            dismissible
            onClose={() => setError('')}
            className="fade show"
          >
            {error}
          </Alert>
        )}

        {showAddForm && isEditing && (
          <Card className="mb-4 border-primary">
            <Card.Body>
              <h6 className="mb-3">{editingId ? 'Edit' : 'Add New'} Transcript</h6>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={4} className="mb-3">
                    <Form.Group>
                      <Form.Label>Choose Degree <span className="text-danger">*</span></Form.Label>
                      <Form.Select
                        name="degree_level"
                        value={formData.degree_level}
                        onChange={handleInputChange}
                        required
                        disabled={uploading}
                      >
                        <option value="">Select degree level</option>
                        {degreeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Text className="text-muted">
                        Only Master's and Doctorate are accepted for transcripts
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Group>
                      <Form.Label>Department <span className="text-danger">*</span></Form.Label>
                      <Form.Select
                        name="department"
                        value={formData.department || ''}
                        onChange={handleInputChange}
                        required
                        disabled={uploading || loadingDepartments}
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </Form.Select>
                      {loadingDepartments && <div className="mt-1 text-muted small">Loading departments...</div>}
                    </Form.Group>
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Group>
                      <Form.Label>Institution <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="institution"
                        value={formData.institution}
                        onChange={handleInputChange}
                        required
                        disabled={uploading}
                        placeholder="e.g., Stanford University"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Group>
                      <Form.Label>Degree <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="degree"
                        value={formData.degree}
                        onChange={handleInputChange}
                        required
                        disabled={uploading}
                        placeholder="e.g., Doctorate in Business Administration – Specialization in Accounting"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Group>
                      <Form.Label>Major/Field of Study</Form.Label>
                      <Form.Control
                        type="text"
                        name="major"
                        value={formData.major}
                        onChange={handleInputChange}
                        disabled={uploading}
                        placeholder="e.g., Computer Science"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Group>
                      <Form.Label>Year Completed <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="number"
                        name="year_completed"
                        value={formData.year_completed}
                        onChange={handleInputChange}
                        min="1900"
                        max={new Date().getFullYear() + 5}
                        required
                        disabled={uploading}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Course List Section */}
                <div className="mt-4 mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6>Course Details</h6>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={addCourse}
                      className="d-flex align-items-center"
                      disabled={uploading}
                    >
                      <FaPlus className="me-1" /> Add Course
                    </Button>
                  </div>

                  {formData.courses?.map((course, index) => (
                    <div key={index} className="border p-3 mb-3 rounded">
                      <Row className="g-2">
                        <Col md={3}>
                          <Form.Group>
                            <Form.Label>Course Code</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="e.g. CS101"
                              value={course.code || ''}
                              onChange={(e) => handleCourseChange(index, 'code', e.target.value)}
                              disabled={uploading}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label>Course Name <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="e.g. Introduction to Computer Science"
                              value={course.name || ''}
                              onChange={(e) => handleCourseChange(index, 'name', e.target.value)}
                              required
                              disabled={uploading}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={2}>
                          <Form.Group>
                            <Form.Label>Credit Hours</Form.Label>
                            <Form.Control
                              type="number"
                              min="0"
                              step="0.5"
                              placeholder="e.g. 3"
                              value={course.credit_hours || ''}
                              onChange={(e) => handleCourseChange(index, 'credit_hours', e.target.value)}
                              disabled={uploading}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group>
                            <Form.Label>Department</Form.Label>
                            <Form.Select
                              value={course.department || ''}
                              onChange={(e) => handleCourseChange(index, 'department', e.target.value)}
                              disabled={uploading || loadingDepartments}
                            >
                              <option value="">Select Department</option>
                              {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                  {dept.name}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={1} className="d-flex align-items-end">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeCourse(index)}
                            disabled={uploading || (formData.courses && formData.courses.length <= 1)}
                            title="Remove Course"
                            className="ms-auto"
                          >
                            <FaTrash />
                          </Button>
                        </Col>
                      </Row>
                    </div>
                  ))}
                </div> {/* Close course list container */}

                <Row>
                  <Col xs={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>Transcript File {!editingId && <span className="text-danger">*</span>}</Form.Label>
                      <Form.Control
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleFileChange}
                        disabled={uploading}
                        required={!editingId}
                        key={editingId ? `editing-${editingId}` : 'new'}
                        className={error && error.includes('file') ? 'is-invalid' : ''}
                      />
                      <Form.Text className="text-muted">
                        Accepted formats: PDF, DOC, DOCX (Max size: 5MB)
                      </Form.Text>
                      {error && error.includes('file') && (
                        <div className="invalid-feedback d-block">
                          {error}
                        </div>
                      )}
                    </Form.Group>
                  </Col>

                  {/* Form Buttons */}
                  <Col xs={12} className="mt-3">
                    <div className="d-flex justify-content-end">
                      <Button
                        variant="outline-secondary"
                        className="me-2"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
                            setShowAddForm(false);
                            setEditingId(null);
                            setFormData(initialFormState);
                            setFile(null);
                            setError('');

                            // Reset file input
                            const fileInput = document.querySelector('input[type="file"]');
                            if (fileInput) fileInput.value = '';
                          }
                        }}
                        disabled={uploading}
                        type="button"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={uploading}
                      >
                        {uploading ? (
                          <>
                            <Spinner as="span" size="sm" animation="border" role="status" aria-hidden="true" className="me-2" />
                            {editingId ? 'Updating...' : 'Uploading...'}
                          </>
                        ) : editingId ? (
                          'Update'
                        ) : (
                          'Upload'
                        )}
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : error ? (
          <div className="text-center py-5">
            <FaExclamationTriangle size={48} className="text-danger mb-3" />
            <h5 className="text-danger">Error</h5>
            <p className="text-muted mb-4">{error}</p>
          </div>
        ) : !Array.isArray(transcripts) || transcripts.length === 0 ? (
          <div className="text-center py-5">
            <FaFileUpload size={48} className="text-muted mb-3" />
            <h5>No Transcripts Uploaded</h5>
            <p className="text-muted mb-4">Upload your academic transcripts to showcase your educational background.</p>
            {isEditing && (
              <Button
                variant="primary"
                onClick={() => setShowAddForm(true)}
              >
                <FaPlus className="me-1" /> Upload Transcript
              </Button>
            )}
          </div>
        ) : (
          <div className="transcript-list">
            {transcripts.map((transcript) => (
              // Don't show the transcript card if it's being edited
              editingId !== transcript.id && (
                <Card key={transcript.id} className="mb-3">
                  <Card.Body>
                    <div className="d-flex justify-content-between">
                      <div>
                        <h6 className="mb-1">{transcript.degree || 'N/A'}</h6>
                        <p className="mb-1 text-muted">
                          {transcript.institution || 'N/A'} • {transcript.major || 'N/A'} • {transcript.year_completed || 'N/A'}
                        </p>
                        {transcript.file && (
                          <p className="mb-0">
                            <a
                              href={transcript.file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FaFileUpload className="me-1" /> View Transcript
                            </a>
                          </p>
                        )}
                      </div>
                      <div className="d-flex">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="me-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCoursesModal(transcript);
                          }}
                          disabled={loading}
                        >
                          <FaBook className="me-1" /> Course(s)
                        </Button>
                        {isEditing && (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="ms-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(transcript);
                            }}
                            disabled={loading}
                          >
                            <FaEdit /> Edit
                          </Button>
                        )}
                        {isEditing && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="ms-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete(transcript.id);
                            }}
                            disabled={loading}
                          >
                            <FaTrash />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              )
            ))}
          </div>
        )}
      </Card.Body>

      <Modal show={showCoursesModal} onHide={() => setShowCoursesModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Course(s) - {selectedTranscript?.degree} {selectedTranscript?.degree_level ? `(${selectedTranscript.degree_level})` : ''}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTranscript && Array.isArray(selectedTranscript.courses) && selectedTranscript.courses.length > 0 ? (
            <div className="table-responsive">
              <Table bordered hover>
                <thead>
                  <tr>
                    <th>Select</th>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Credit Hours</th>
                    <th>Department</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTranscript.courses.map((c) => (
                    <tr key={c.id || `${c.code}-${c.name}`}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={!!coursesSelection[c.id]}
                          onChange={() => toggleCourseSelection(c.id)}
                        />
                      </td>
                      <td>{c.code}</td>
                      <td>{c.name}</td>
                      <td>{c.credit_hours || ''}</td>
                      <td>{c.department_name || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <Alert variant="info">No courses found for this transcript.</Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCoursesModal(false)} disabled={savingCourses}>Cancel</Button>
          <Button variant="primary" onClick={handleCoursesUpdate} disabled={savingCourses}>
            {savingCourses ? (
              <>
                <Spinner as="span" size="sm" animation="border" role="status" aria-hidden="true" className="me-2" />
                Updating...
              </>
            ) : (
              'Update'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this transcript? This action cannot be undone.</p>
          {error && <Alert variant="danger" className="mb-0">{error}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            {loading ? (
              <>
                <Spinner as="span" size="sm" animation="border" role="status" aria-hidden="true" />
                {' '}Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
});

export default Transcript;
