// src/services/authService.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_APP_API_BASE_URL is not defined");
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// -------- User State Helpers --------
export const getUserRole = () => {
  const accessToken = localStorage.getItem("access_token");
  const refreshToken = localStorage.getItem("refresh_token");
  const userId = localStorage.getItem("user_id");
  const email = localStorage.getItem("email");
  const firstName = localStorage.getItem("first_name");
  const lastName = localStorage.getItem("last_name");
  const isFaculty = localStorage.getItem("is_faculty") === "true";
  const isRecruiter = localStorage.getItem("is_recruiter") === "true";
  const isVerified = localStorage.getItem("is_verified") === "true";

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

export const setUserRole = (userData) => {
  localStorage.setItem("is_faculty", userData.isFaculty);
  localStorage.setItem("is_recruiter", userData.isRecruiter);
  localStorage.setItem("is_verified", userData.isVerified);
  localStorage.setItem("user_id", userData.userId);
  localStorage.setItem("email", userData.email);
  localStorage.setItem("first_name", userData.firstName);
  localStorage.setItem("last_name", userData.lastName);
};

export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user_id");
  localStorage.removeItem("email");
  localStorage.removeItem("first_name");
  localStorage.removeItem("last_name");
  localStorage.removeItem("is_faculty");
  localStorage.removeItem("is_recruiter");
  localStorage.removeItem("is_verified");
};

export const getToken = () => {
  return localStorage.getItem("access_token");
};

// -------- Axios Interceptors --------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const response = await api.post("token/refresh/", {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem("access_token", access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (err) {
        logout();
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

// -------- Auth Endpoints --------
export const loginUser = async (email, password) => {
  try {
    const response = await api.post("login/", { email, password });

    const { token, user } = response.data;
    if (!token || !user) throw new Error("Invalid response from server");

    localStorage.setItem("access_token", token.access);
    localStorage.setItem("refresh_token", token.refresh);
    localStorage.setItem("user_id", user.id);
    localStorage.setItem("email", user.email);
    localStorage.setItem("first_name", user.first_name || "");
    localStorage.setItem("last_name", user.last_name || "");
    localStorage.setItem("is_faculty", user.is_faculty || false);
    localStorage.setItem("is_recruiter", user.is_recruiter || false);
    localStorage.setItem("is_verified", user.is_verified || false);

    return user;
  } catch (error) {
    throw error.response?.data || { detail: "Login failed" };
  }
};

export const registerFaculty = async (formData) => {
  try {
    const data = new FormData();
    data.append("first_name", formData.firstName);
    data.append("last_name", formData.lastName);
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("work_preference",JSON.stringify([formData.workPreference.replace("-", "_")]));
    if (formData.resume) data.append("resume", formData.resume);
    if (formData.transcripts) data.append("transcripts", formData.transcripts);
    data.append("is_faculty", true);

    const response = await api.post("faculty/register/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: "Faculty registration failed" };
  }
};

export const registerRecruiter = async (formData) => {
  try {
    const response = await api.post("recruiter/register/", {
      first_name: formData.first_name || formData.firstName,
      last_name: formData.last_name || formData.lastName,
      email: formData.email,
      password: formData.password,
      college: formData.college,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: "Recruiter registration failed" };
  }
};

export default api;
