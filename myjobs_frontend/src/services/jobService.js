import { getToken } from './authService';

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

const getFormDataHeaders = () => {
  const token = getToken();
  return {
    'Authorization': `Bearer ${token}`,
  };
};

// Job API service
export const jobService = {
  // Create a new job
  async createJob(jobData) {
    const formData = new FormData();
    
    // Append all job fields to FormData
    Object.keys(jobData).forEach(key => {
      if (key === 'pdf' && jobData[key] instanceof File) {
        formData.append('pdf_document', jobData[key]);
      } else if (jobData[key] !== null && jobData[key] !== undefined) {
        formData.append(key, jobData[key]);
      }
    });

    const response = await fetch(`${API_BASE_URL}/jobs/`, {
      method: 'POST',
      headers: getFormDataHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create job');
    }

    return response.json();
  },

  // Get all jobs for the current recruiter
  async getMyJobs(statusFilter = null) {
    let url = `${API_BASE_URL}/jobs/my/`;
    if (statusFilter) {
      url += `?status=${statusFilter}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
    }

    return response.json();
  },

  // Get job statistics
  async getJobStatistics() {
    const response = await fetch(`${API_BASE_URL}/jobs/statistics/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch job statistics');
    }

    return response.json();
  },

  // Update job status
  async updateJobStatus(jobId, status, notes = '') {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/status/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, notes }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update job status');
    }

    return response.json();
  },

  // Update job details
  async updateJob(jobId, jobData) {
    const formData = new FormData();
    
    // Append all job fields to FormData
    Object.keys(jobData).forEach(key => {
      if (key === 'pdf_document' && jobData[key] instanceof File) {
        formData.append('pdf_document', jobData[key]);
      } else if (jobData[key] !== null && jobData[key] !== undefined) {
        formData.append(key, jobData[key]);
      }
    });

    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/`, {
      method: 'PATCH',
      headers: getFormDataHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update job');
    }

    return response.json();
  },

  // Delete a job
  async deleteJob(jobId) {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete job');
    }

    return true;
  },

  // Get all jobs (for faculty - filtered by department)
  async getAllJobs() {
    const response = await fetch(`${API_BASE_URL}/jobs/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
    }

    return response.json();
  },

  // Get single job details
  async getJob(jobId) {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch job details');
    }

    return response.json();
  },

  // Save a job
  async saveJob(jobId) {
    const response = await fetch(`${API_BASE_URL}/jobs/saved/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ job: jobId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save job');
    }

    return response.json();
  },

  // Unsave a job
  async unsaveJob(jobId) {
    const response = await fetch(`${API_BASE_URL}/jobs/saved/${jobId}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to unsave job');
    }

    return response.json();
  },

  // Get all saved jobs
  async getSavedJobs() {
    const response = await fetch(`${API_BASE_URL}/jobs/saved/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch saved jobs');
    }

    return response.json();
  },

  // Check if a job is saved
  async isJobSaved(jobId) {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/is-saved/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to check if job is saved');
    }

    return response.json();
  },
};

export default jobService;