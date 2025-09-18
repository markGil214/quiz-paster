import axios from "axios";

// Use environment variable for API base URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const API = axios.create({ baseURL: API_BASE_URL });

export const createQuiz = (data) => API.post("/api/parse-quiz", data);
export const getQuizById = (id) => API.get(`/api/quiz/${id}`);
export const updateQuiz = (id, data) => API.put(`/api/quiz/${id}`, data);
export const getQuiz = (code) => API.get(`/quiz/${code}`);
export const submitQuiz = (code, answers) => API.post(`/quiz/${code}/submit`, answers);
