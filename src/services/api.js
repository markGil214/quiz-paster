import axios from "axios";

// Smart API URL detection
const getApiUrl = () => {
  // Check if we're in development mode
  const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
  
  // If we have an explicit environment variable, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // If in development, use localhost
  if (isDevelopment) {
    return "http://localhost:5000";
  }
  
  // Production fallback - your Render backend
  return "https://quiz-backend-yjv7.onrender.com";
};

const API_BASE_URL = getApiUrl();

console.log("🌐 API Base URL:", API_BASE_URL);
console.log("🔧 Environment Mode:", import.meta.env.MODE);
console.log("🔧 Is Development:", import.meta.env.DEV);
console.log("🔧 VITE_API_URL:", import.meta.env.VITE_API_URL);

const API = axios.create({ 
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor for debugging
API.interceptors.request.use(
  (config) => {
    console.log("📤 API Request:", config.method?.toUpperCase(), config.baseURL + config.url);
    if (config.data) {
      console.log("📤 Request Data:", config.data);
    }
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
    console.log("📥 API Response:", response.status, response.statusText);
    console.log("📥 Response Data:", response.data);
    return response;
  },
  (error) => {
    console.error("❌ API Error Details:");
    console.error("Status:", error.response?.status);
    console.error("Status Text:", error.response?.statusText);
    console.error("Data:", error.response?.data);
    console.error("URL:", error.config?.url);
    console.error("Base URL:", error.config?.baseURL);
    
    // Provide user-friendly error messages
    if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
      console.error("🌐 Network connection issue - check if backend is running");
    } else if (error.response?.status === 404) {
      console.error("🔍 Endpoint not found - check API URL");
    } else if (error.response?.status >= 500) {
      console.error("🛠️ Server error - backend issue");
    }
    
    return Promise.reject(error);
  }
);

export const createQuiz = (data) => API.post("/api/parse-quiz", data);
export const getQuizById = (id) => API.get(`/api/quiz/${id}`);
export const updateQuiz = (id, data) => API.put(`/api/quiz/${id}`, data);
export const getQuiz = (code) => API.get(`/quiz/${code}`);
export const submitQuiz = (code, answers) => API.post(`/quiz/${code}/submit`, answers);
