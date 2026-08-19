import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentDetail from './pages/StudentDetail';
import Predict from './pages/Predict';
import ModelPerformance from './pages/ModelPerformance';
import Dataset from './pages/Dataset';
import PredictionHistory from './pages/PredictionHistory';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('authenticated') === 'true';
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="students/:studentId" element={<StudentDetail />} />
          <Route path="predict" element={<Predict />} />
          <Route path="model-performance" element={<ModelPerformance />} />
          <Route path="dataset" element={<Dataset />} />
          <Route path="predictions" element={<PredictionHistory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
