import React, { useState, useEffect } from 'react';
import { Upload, Database, FileText, AlertCircle } from 'lucide-react';
import { uploadDataset, trainModel } from '../services/api';

const Dataset = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [training, setTraining] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [trainResult, setTrainResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a valid CSV file');
      setFile(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError('');
    setUploadResult(null);

    try {
      const result = await uploadDataset(file);
      setUploadResult(result);
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleTrain = async () => {
    setTraining(true);
    setError('');
    setTrainResult(null);

    try {
      const result = await trainModel();
      setTrainResult(result);
    } catch (err) {
      setError(err.response?.data?.detail || 'Training failed');
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dataset Management</h1>
        <p className="text-gray-600 mt-1">Upload datasets and train ML models</p>
      </div>

      {/* Upload Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Upload className="h-5 w-5 mr-2" />
          Upload Dataset
        </h3>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
          <input
            type="file"
            id="file-upload"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">
              {file ? file.name : 'Click to upload or drag and drop'}
            </p>
            <p className="text-sm text-gray-400">CSV files only</p>
          </label>
        </div>

        {file && (
          <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-700">{file.name}</span>
              <span className="text-sm text-gray-500 ml-2">
                ({(file.size / 1024).toFixed(2)} KB)
              </span>
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="btn-primary"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {uploadResult && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Upload Successful</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-green-700">Records: {uploadResult.record_count}</p>
                <p className="text-green-700">Features: {uploadResult.feature_count}</p>
              </div>
              <div>
                <p className="text-green-700">Missing Values: {uploadResult.missing_values}</p>
                <p className="text-green-700">
                  Type: {uploadResult.is_synthetic ? 'Synthetic' : 'Uploaded'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Training Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Train ML Models
        </h3>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Synthetic Dataset Training</h4>
            <p className="text-sm text-blue-700">
              Generate a synthetic dataset with 1000 records and train all ML models.
              This is useful for demonstration purposes when no real dataset is available.
            </p>
          </div>

          <button
            onClick={handleTrain}
            disabled={training}
            className="btn-primary w-full"
          >
            {training ? 'Training Models...' : 'Train Models with Synthetic Data'}
          </button>

          {trainResult && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Training Complete</h4>
              <p className="text-sm text-green-700 mb-3">
                Best Model: <span className="font-semibold">{trainResult.best_model}</span>
              </p>
              
              <div className="mt-3">
                <h5 className="font-medium text-green-900 mb-2">Model Metrics:</h5>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-green-200">
                        <th className="py-2 text-left">Model</th>
                        <th className="py-2 text-left">Accuracy</th>
                        <th className="py-2 text-left">Precision</th>
                        <th className="py-2 text-left">Recall</th>
                        <th className="py-2 text-left">F1</th>
                        <th className="py-2 text-left">ROC-AUC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(trainResult.metrics).map(([name, metrics]) => (
                        <tr key={name} className="border-b border-green-100">
                          <td className="py-2">{name}</td>
                          <td className="py-2">{(metrics.accuracy * 100).toFixed(2)}%</td>
                          <td className="py-2">{(metrics.precision * 100).toFixed(2)}%</td>
                          <td className="py-2">{(metrics.recall * 100).toFixed(2)}%</td>
                          <td className="py-2">{(metrics.f1_score * 100).toFixed(2)}%</td>
                          <td className="py-2">{(metrics.roc_auc * 100).toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Required Columns */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Required CSV Columns</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {[
            'Student_ID',
            'Age',
            'Gender',
            'GPA',
            'Attendance',
            'Assignment_Completion',
            'Exam_Performance',
            'Engagement_Score',
            'Participation_Score',
            'Behavioral_Score',
            'Previous_Academic_Performance',
            'Course_Satisfaction',
            'Failed_Subjects',
            'Assignments_Missed',
            'LMS_Activity',
            'Churn'
          ].map((col) => (
            <div key={col} className="flex items-center p-2 bg-gray-50 rounded">
              <div className="w-2 h-2 bg-primary-500 rounded-full mr-2"></div>
              {col}
            </div>
          ))}
        </div>
      </div>

      {/* Dataset Info */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dataset Information</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            <strong>Synthetic Dataset:</strong> The system can generate a synthetic dataset
            for demonstration purposes. This dataset is clearly labeled and contains realistic
            student data patterns for testing the prediction system.
          </p>
          <p>
            <strong>Real Dataset:</strong> Upload your own student dataset in CSV format with
            the required columns. The system will validate the data and use it for training
            the ML models.
          </p>
          <p>
            <strong>Target Variable:</strong> The 'Churn' column should be binary (0 or 1),
            where 1 indicates the student dropped out and 0 indicates they continued.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dataset;
