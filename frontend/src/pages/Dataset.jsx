import React, { useState, useEffect } from 'react';
import { Upload, Database, FileText, AlertCircle, Play } from 'lucide-react';
import { uploadDataset, trainModel, batchPredict } from '../services/api';

const Dataset = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [training, setTraining] = useState(false);
  const [batchPredicting, setBatchPredicting] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [trainResult, setTrainResult] = useState(null);
  const [batchResult, setBatchResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file => file.type === 'text/csv');
    
    if (validFiles.length > 0) {
      setFiles(validFiles);
      setError('');
    } else {
      setError('Please select valid CSV files');
      setFiles([]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setError('Please select at least one file first');
      return;
    }

    setUploading(true);
    setError('');
    setUploadResult(null);

    try {
      const result = await uploadDataset(files);
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

  const handleBatchPredict = async () => {
    setBatchPredicting(true);
    setError('');
    setBatchResult(null);

    try {
      const result = await batchPredict();
      setBatchResult(result);
    } catch (err) {
      setError(err.response?.data?.detail || 'Batch prediction failed');
    } finally {
      setBatchPredicting(false);
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
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">
              {files.length > 0 
                ? `${files.length} file(s) selected` 
                : 'Click to upload or drag and drop'}
            </p>
            <p className="text-sm text-gray-400">CSV files only (multiple files supported)</p>
          </label>
        </div>

        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({(file.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
              </div>
            ))}
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="btn-primary w-full"
            >
              {uploading ? 'Uploading...' : `Upload ${files.length} File(s)`}
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
            {uploadResult.message && (
              <p className="text-sm text-green-700 mb-3">{uploadResult.message}</p>
            )}
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
            <p className="text-xs text-green-600 mt-3">
              ✓ Old data cleared. Your uploaded data is now active. Check the Students page to verify.
            </p>
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

      {/* Batch Prediction Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Play className="h-5 w-5 mr-2" />
          Batch Prediction
        </h3>

        <div className="space-y-4">
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Predict for All Students</h4>
            <p className="text-sm text-purple-700">
              Make predictions for all students in the database at once. This will update
              the risk level and churn probability for every student based on the trained model.
            </p>
          </div>

          <button
            onClick={handleBatchPredict}
            disabled={batchPredicting}
            className="btn-primary w-full"
          >
            {batchPredicting ? 'Predicting...' : 'Run Batch Prediction'}
          </button>

          {batchResult && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Batch Prediction Complete</h4>
              <p className="text-sm text-green-700">
                Total Predictions: <span className="font-semibold">{batchResult.total_predictions}</span>
              </p>
              <p className="text-sm text-green-600 mt-2">
                Check the Dashboard and Students page to see updated results.
              </p>
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
