// src/services/facultyService.js
import api from "./authService"; // reuse same axios instance

// -------- Helpers --------
const normalizeWorkPreference = (wp) => {
  if (!wp) return [];
  if (Array.isArray(wp)) return wp;
  if (typeof wp === "string") {
    try {
      const parsed = JSON.parse(wp);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {}
    return wp.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
};

const mapFacultyPayloadToBackend = (payload = {}) => {
  const body = {};
  if ("title" in payload) body.title = payload.title;
  if ("firstName" in payload) body.first_name = payload.firstName;
  if ("lastName" in payload) body.last_name = payload.lastName;
  if ("phone" in payload) body.phone = payload.phone;
  if ("dob" in payload) body.dob = payload.dob;
  if ("gender" in payload) body.gender = payload.gender;
  if ("state" in payload) body.state = payload.state;
  if ("city" in payload) body.city = payload.city;
  if ("linkedin" in payload) body.linkedin = payload.linkedin;
  if ("workPreference" in payload)
    body.work_preference = normalizeWorkPreference(payload.workPreference);
  return body;
};

// Generic file upload builder
const buildFormData = (fields = {}, fileFields = {}) => {
  const fd = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) fd.append(key, value);
  });
  Object.entries(fileFields).forEach(([key, file]) => {
    if (file instanceof File) fd.append(key, file);
  });
  return fd;
};

// -------- Profile --------
const getFacultyProfile = async () => (await api.get("faculty/profile/")).data;

const updateFacultyProfile = async (payload = {}) => {
  // Check for files using both field name variations for backward compatibility
  const profilePhotoFile = payload.profile_photo || payload.profilePhoto;
  const hasFile = 
    (profilePhotoFile && profilePhotoFile instanceof File) ||
    (payload.resume && payload.resume instanceof File) ||
    (payload.transcripts && payload.transcripts instanceof File);

  if (hasFile) {
    const mapped = mapFacultyPayloadToBackend(payload);
    const fd = buildFormData(mapped, {
      profile_photo: profilePhotoFile,
      resume: payload.resume,
      transcripts: payload.transcripts,
    });
    
    // Set proper content type for file upload
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    
    return (await api.put("faculty/profile/", fd, config)).data;
  } else {
    const body = mapFacultyPayloadToBackend(payload);
    return (await api.put("faculty/profile/", body)).data;
  }
};

// -------- Educations --------
const getEducations = async () => (await api.get("educations/")).data;
const createEducation = async (edu) => (await api.post("educations/", edu)).data;
const updateEducation = async (id, edu) =>
  (await api.put(`educations/${id}/`, edu)).data;
const deleteEducation = async (id) =>
  (await api.delete(`educations/${id}/`)).data;

// -------- Transcripts --------
const getTranscripts = async () => {
  const response = await api.get("transcripts/");
  return response.data;
};

const createTranscript = async (formData) => {
  
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    withCredentials: true
  };
  
  try {
    const response = await api.post("transcripts/", formData, config);
    return response;
  } catch (error) {
    throw error;
  }
};

const updateTranscript = async (id, formData) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    withCredentials: true
  };
  
  try {
    const response = await api.put(`transcripts/${id}/`, formData, config);
    return response;
  } catch (error) {
    throw error;
  }
};

// Partial update for transcripts (e.g., updating only courses). Accepts plain JSON.
const patchTranscript = async (id, body) => {
  try {
    const response = await api.patch(`transcripts/${id}/`, body);
    return response;
  } catch (error) {
    throw error;
  }
};

const deleteTranscript = async (id) => {
  const response = await api.delete(`transcripts/${id}/`);
  return response.data;
};

// -------- Certificates --------
const getCertificates = async () => (await api.get("certificates/")).data;

const createCertificate = async (formData) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };
  return (await api.post("certificates/", formData, config)).data;
};

const updateCertificate = async (id, formData) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };
  return (await api.put(`certificates/${id}/`, formData, config)).data;
};

const deleteCertificate = async (id) => (await api.delete(`certificates/${id}/`)).data;

// -------- Memberships --------
const getMemberships = async () => {
  try {
    const response = await api.get("memberships/");
    console.log('Memberships API Response:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('Error fetching memberships:', error);
    throw error;
  }
};

const createMembership = async (data) => {
  try {
    console.log('Creating membership with data:', data); // Debug log
    const response = await api.post("memberships/", data);
    console.log('Create membership response:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('Error creating membership:', error);
    throw error;
  }
};

const updateMembership = async (id, data) => {
  try {
    console.log(`Updating membership ${id} with data:`, data); // Debug log
    const response = await api.put(`memberships/${id}/`, data);
    console.log('Update membership response:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('Error updating membership:', error);
    throw error;
  }
};

const deleteMembership = async (id) => {
  try {
    console.log(`Deleting membership ${id}`); // Debug log
    const response = await api.delete(`memberships/${id}/`);
    console.log('Delete membership response:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('Error deleting membership:', error);
    throw error;
  }
};

// -------- Experiences --------
const getExperiences = async () => (await api.get("experiences/")).data;
const createExperience = async (data) => (await api.post("experiences/", data)).data;
const updateExperience = async (id, data) =>
  (await api.put(`experiences/${id}/`, data)).data;
const deleteExperience = async (id) =>
  (await api.delete(`experiences/${id}/`)).data;

// -------- Skills --------
// -------- Skills --------
const getSkills = async () => {
  try {
    const response = await api.get("skills/");
    if (response?.data) {
      if (Array.isArray(response.data)) return response.data;
      if (response.data.results && Array.isArray(response.data.results)) return response.data.results;
      return [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching skills:", error);
    throw error;
  }
};

const createSkill = async (data) => {
  try {
    // backend expects { skill, proficiency } (or camelCase will be handled)
    const response = await api.post("skills/", data);
    // some backends return the created object directly, some return {results: [...]}
    return response.data;
  } catch (error) {
    console.error("Error creating skill:", error);
    if (error.response) console.error("createSkill response:", error.response.data);
    throw error;
  }
};

const updateSkill = async (id, data) => {
  try {
    const response = await api.put(`skills/${id}/`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating skill ${id}:`, error);
    if (error.response) console.error("updateSkill response:", error.response.data);
    throw error;
  }
};

const deleteSkill = async (id) => {
  try {
    const response = await api.delete(`skills/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting skill ${id}:`, error);
    if (error.response) console.error("deleteSkill response:", error.response.data);
    throw error;
  }
};

// -------- Presentations --------
// -------- Presentations --------
const getPresentations = async () => {
  try {
    const response = await api.get("presentations/");
    if (response?.data) {
      if (Array.isArray(response.data)) return response.data;
      if (response.data.results && Array.isArray(response.data.results)) return response.data.results;
      return [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching presentations:", error);
    throw error;
  }
};

const createPresentation = async (data) => {
  try {
    // If caller already built a FormData (component), send it directly
    if (data instanceof FormData) {
      const cfg = { headers: { "Content-Type": "multipart/form-data" } };
      const resp = await api.post("presentations/", data, cfg);
      return resp.data;
    }

    // Otherwise build FormData (supports file + fields)
    const fd = buildFormData(
      { title: data.title, date: data.date, venue: data.venue },
      { file: data.file }
    );

    const resp = await api.post("presentations/", fd, { headers: { "Content-Type": "multipart/form-data" } });
    return resp.data;
  } catch (error) {
    console.error("Error creating presentation:", error);
    if (error.response) console.error("createPresentation response:", error.response.data);
    throw error;
  }
};

const updatePresentation = async (id, data) => {
  try {
    // Accept either FormData or plain data
    let payload;
    let cfg = {};
    if (data instanceof FormData) {
      payload = data;
      cfg = { headers: { "Content-Type": "multipart/form-data" } };
    } else {
      payload = buildFormData(
        { title: data.title, date: data.date, venue: data.venue },
        { file: data.file }
      );
      cfg = { headers: { "Content-Type": "multipart/form-data" } };
    }

    const resp = await api.put(`presentations/${id}/`, payload, cfg);
    return resp.data;
  } catch (error) {
    console.error(`Error updating presentation ${id}:`, error);
    if (error.response) console.error("updatePresentation response:", error.response.data);
    throw error;
  }
};

const deletePresentation = async (id) => {
  try {
    const resp = await api.delete(`presentations/${id}/`);
    return resp.data;
  } catch (error) {
    console.error(`Error deleting presentation ${id}:`, error);
    if (error.response) console.error("deletePresentation response:", error.response.data);
    throw error;
  }
};


// -------- Documents --------
const getDocuments = async () => {
  try {
    const response = await api.get("faculty/profile/documents/");
    if (response?.data) {
      if (Array.isArray(response.data)) return response.data;
      if (response.data.results && Array.isArray(response.data.results)) return response.data.results;
      return response.data;
    }
    return [];
  } catch (error) {
    console.error('Error in getDocuments:', error);
    throw error;
  }
};

const createDocument = async (data) => {
  // Accept either a FormData (from component) or a plain object
  try {
    if (data instanceof FormData) {
      // Already built by the caller
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' }
      };
      const response = await api.post("faculty/profile/documents/", data, config);
      return response.data;
    }

    // Otherwise build FormData from plain object
    const formData = new FormData();
    formData.append('name', data.name || 'Untitled Document');
    formData.append('doc_type', data.type || 'other');
    if (data.file) {
      formData.append('file', data.file);
    }

    const response = await api.post("faculty/profile/documents/", formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating document:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    throw error;
  }
};

const updateDocument = async (id, data) => {
  const formData = new FormData();
  
  // Add document fields that are being updated
  if (data.name) formData.append('name', data.name);
  if (data.type) formData.append('doc_type', data.type);
  if (data.file) formData.append('file', data.file);

  try {
    const response = await api.put(`faculty/profile/documents/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating document ${id}:`, error);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    throw error;
  }
};

const deleteDocument = async (id) => {
  try {
    const response = await api.delete(`faculty/profile/documents/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting document ${id}:`, error);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    throw error;
  }
};

// -------- Lookup Data --------
const getDegrees = () => api.get('degrees/');
const getColleges = () => api.get('colleges/');
const getDepartments = () => api.get('departments/');

// -------- Export --------
export default {
  // profile
  getFacultyProfile,
  updateFacultyProfile,

  // education
  getEducations,
  createEducation,
  updateEducation,
  deleteEducation,

  // transcripts
  getTranscripts,
  createTranscript,
  updateTranscript,
  patchTranscript,
  deleteTranscript,

  // certificates
  getCertificates,
  createCertificate,
  updateCertificate,
  deleteCertificate,

  // memberships
  getMemberships,
  createMembership,
  updateMembership,
  deleteMembership,

  // experiences
  getExperiences,
  createExperience,
  updateExperience,
  deleteExperience,

  // skills
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,

  // presentations
  getPresentations,
  createPresentation,
  updatePresentation,
  deletePresentation,

  // documents
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,

  // lookups
  getDegrees,
  getColleges,
  getDepartments,
};
