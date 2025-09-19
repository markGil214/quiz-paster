import axios from "axios";

// Use environment variable for API base URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

console.log("🌐 API Base URL:", API_BASE_URL);
console.log("🔧 Environment variables:", import.meta.env);

const API = axios.create({ baseURL: API_BASE_URL });

// Add request interceptor for debugging
API.interceptors.request.use(
  (config) => {
    console.log("📤 API Request:", config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
API.interceptors.response.use(
  (response) => {
    console.log("📥 API Response:", response.status, response.data);
    return response;
  },
  (error) => {
    console.error("❌ API Error:", error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const createQuiz = (data) => API.post("/api/parse-quiz", data);
export const getQuizById = (id) => API.get(`/api/quiz/${id}`);
export const updateQuiz = (id, data) => API.put(`/api/quiz/${id}`, data);
export const getQuiz = (code) => API.get(`/quiz/${code}`);
export const submitQuiz = (code, answers) => API.post(`/quiz/${code}/submit`, answers);
