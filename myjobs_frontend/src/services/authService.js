import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:8000/api/';

// Set up axios defaults
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get user role and authentication status
 * @returns {Object} User authentication state
 */
export const getUserRole = () => {
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  const userId = localStorage.getItem('user_id');
  const email = localStorage.getItem('email');
  const firstName = localStorage.getItem('first_name');
  const lastName = localStorage.getItem('last_name');
  const isFaculty = localStorage.getItem('is_faculty') === 'true';
  const isRecruiter = localStorage.getItem('is_recruiter') === 'true';
  const isVerified = localStorage.getItem('is_verified') === 'true';

  return {
    isAuthenticated: !!accessToken,
    isFaculty,
    isRecruiter,
    isVerified,
    userId,
    email,
    firstName,
    lastName,
  };
};

/**
 * Logout the user
 */
export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_id');
  localStorage.removeItem('email');
  localStorage.removeItem('first_name');
  localStorage.removeItem('last_name');
  localStorage.removeItem('is_faculty');
  localStorage.removeItem('is_recruiter');
  localStorage.removeItem('is_verified');
};

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error status is 401 and we haven't tried to refresh yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await api.post('token/refresh/', {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);
        
        // Update the authorization header
        originalRequest.headers.Authorization = `Bearer ${access}`;
        
        // Retry the original request
        return api(originalRequest);
      } catch (error) {
        // If refresh token is invalid, log the user out
        logout();
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * Logs in a user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} User data
 */
export const loginUser = async (email, password) => {
  try {
    const response = await api.post('login/', {
      email,
      password
    });

    const { user, token } = response.data;

    // Store tokens and user data in localStorage
    localStorage.setItem('access_token', token.access);
    localStorage.setItem('refresh_token', token.refresh);
    localStorage.setItem('user_id', user.id);
    localStorage.setItem('email', user.email);
    localStorage.setItem('first_name', user.first_name || '');
    localStorage.setItem('last_name', user.last_name || '');
    localStorage.setItem('is_faculty', user.is_faculty || false);
    localStorage.setItem('is_recruiter', user.is_recruiter || false);
    localStorage.setItem('is_verified', user.is_verified || false);

    return user;
  } catch (error) {
    throw error.response?.data || { detail: 'Login failed' };
  }
};

/**
 * Registers a new faculty member
 * @param {Object} formData - Faculty registration data
 * @returns {Promise<Object>} Response data
 */
export const registerFaculty = async (formData) => {
  try {
    const data = new FormData();
    data.append('first_name', formData.firstName);
    data.append('last_name', formData.lastName);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('work_preference', formData.workPreference);
    data.append('resume', formData.resume);
    data.append('transcripts', formData.transcripts);
    data.append('is_faculty', true);

    const response = await api.post('faculty/register/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Faculty registration failed' };
  }
};

/**
 * Registers a new recruiter
 * @param {Object} formData - Recruiter registration data
 * @returns {Promise<Object>} Response data
 */
export const registerRecruiter = async (formData) => {
  try {
    const response = await api.post('recruiter/register/', {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      password: formData.password,
      college: formData.college
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Recruiter registration failed' };
  }
};