import { getToken } from './authService';

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// Marked Profiles Service
export const markedProfilesService = {
  // Get all marked profiles for the current recruiter
  async getMarkedProfiles() {
    const response = await fetch(`${API_BASE_URL}/recruiter/marked-profiles/`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch marked profiles');
    }

    return response.json();
  },

  // Mark a faculty profile
  async markProfile(facultyId, notes = '') {
    const response = await fetch(`${API_BASE_URL}/recruiter/marked-profiles/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        faculty: facultyId,
        notes: notes,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to mark profile');
    }

    return response.json();
  },

  // Unmark a faculty profile
  async unmarkProfile(facultyId) {
    const response = await fetch(`${API_BASE_URL}/recruiter/marked-profiles/${facultyId}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to unmark profile');
    }

    return response.json();
  },

  // Check if a profile is marked
  async isProfileMarked(facultyId) {
    const response = await fetch(`${API_BASE_URL}/recruiter/faculty/${facultyId}/is-marked/`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to check if profile is marked');
    }

    return response.json();
  },
};
