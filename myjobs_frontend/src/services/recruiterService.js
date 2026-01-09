// src/services/recruiterService.js
import api from "./authService";

// Fetch recruiter-visible faculty search results aggregated from transcript data
const getFacultySearchResults = async (params = {}) => {
  const resp = await api.get("recruiter/faculty-search/", { params });
  return resp.data;
};

// Fetch full faculty details for a specific user id (recruiter-only)
const getFacultyDetails = async (userId) => {
  const resp = await api.get(`recruiter/faculty/${userId}/details/`);
  return resp.data;
};

export default {
  getFacultySearchResults,
  getFacultyDetails,
};

