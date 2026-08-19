import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dashboard APIs
export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

export const getRiskDistribution = async () => {
  const response = await api.get('/dashboard/risk-distribution');
  return response.data;
};

export const getAttendanceVsChurn = async () => {
  const response = await api.get('/dashboard/attendance-vs-churn');
  return response.data;
};

export const getGpaVsChurn = async () => {
  const response = await api.get('/dashboard/gpa-vs-churn');
  return response.data;
};

export const getEngagementVsChurn = async () => {
  const response = await api.get('/dashboard/engagement-vs-churn');
  return response.data;
};

// Student APIs
export const getStudents = async (params = {}) => {
  const response = await api.get('/students/', { params });
  return response.data;
};

export const getStudent = async (studentId) => {
  const response = await api.get(`/students/${studentId}`);
  return response.data;
};

// Prediction APIs
export const makePrediction = async (data) => {
  const response = await api.post('/predict/', data);
  return response.data;
};

export const getPredictions = async (params = {}) => {
  const response = await api.get('/predictions/', { params });
  return response.data;
};

export const getStudentPredictions = async (studentId) => {
  const response = await api.get(`/predictions/student/${studentId}`);
  return response.data;
};

// Training APIs
export const trainModel = async () => {
  const response = await api.post('/train/');
  return response.data;
};

export const uploadDataset = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/train/upload-dataset', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Model Performance APIs
export const getModelPerformance = async () => {
  const response = await api.get('/model/performance');
  return response.data;
};

// Health Check
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
