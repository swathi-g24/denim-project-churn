import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getModelPerformance } from '../services/api';

const ModelPerformance = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModelPerformance();
  }, []);

  const loadModelPerformance = async () => {
    try {
      const data = await getModelPerformance();
      setMetrics(data);
    } catch (error) {
      console.error('Error loading model performance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading model performance...</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No model performance data available</p>
        <p className="text-sm text-gray-400 mt-2">Please train the model first</p>
      </div>
    );
  }

  // Convert metrics to chart format
  const chartData = Object.entries(metrics).map(([modelName, modelMetrics]) => ({
    model: modelName,
    accuracy: (modelMetrics.accuracy * 100).toFixed(2),
    precision: (modelMetrics.precision * 100).toFixed(2),
    recall: (modelMetrics.recall * 100).toFixed(2),
    f1_score: (modelMetrics.f1_score * 100).toFixed(2),
    roc_auc: (modelMetrics.roc_auc * 100).toFixed(2),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Model Performance</h1>
        <p className="text-gray-600 mt-1">Comparison of ML model evaluation metrics</p>
      </div>

      {/* Performance Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Comparison Chart</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="model" angle={-45} textAnchor="end" height={100} />
            <YAxis label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="accuracy" fill="#3b82f6" name="Accuracy" />
            <Bar dataKey="precision" fill="#10b981" name="Precision" />
            <Bar dataKey="recall" fill="#f59e0b" name="Recall" />
            <Bar dataKey="f1_score" fill="#8b5cf6" name="F1 Score" />
            <Bar dataKey="roc_auc" fill="#ef4444" name="ROC-AUC" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Metrics</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accuracy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precision
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recall
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  F1 Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ROC-AUC
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(metrics).map(([modelName, modelMetrics]) => (
                <tr key={modelName} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {modelName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(modelMetrics.accuracy * 100).toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(modelMetrics.precision * 100).toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(modelMetrics.recall * 100).toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(modelMetrics.f1_score * 100).toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(modelMetrics.roc_auc * 100).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Descriptions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Descriptions</h3>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Logistic Regression</h4>
            <p className="text-sm text-gray-600">
              Interpretable baseline model that provides clear coefficients for feature importance.
              Good for understanding linear relationships between features and churn risk.
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Decision Tree</h4>
            <p className="text-sm text-gray-600">
              Creates decision rules that are easy to interpret. Captures non-linear relationships
              and provides clear decision paths for predictions.
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Random Forest</h4>
            <p className="text-sm text-gray-600">
              Ensemble method that combines multiple decision trees for improved stability and
              accuracy. Reduces overfitting and provides robust predictions.
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">XGBoost</h4>
            <p className="text-sm text-gray-600">
              Gradient boosting algorithm optimized for performance and accuracy. Handles complex
              patterns and interactions between features effectively.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelPerformance;
