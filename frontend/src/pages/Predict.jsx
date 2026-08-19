import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle, TrendingUp, Lightbulb } from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import { makePrediction } from '../services/api';

const Predict = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    student_id: '',
    age: 20,
    gender: 'Male',
    gpa: 7.5,
    attendance: 75.0,
    assignment_completion: 70.0,
    exam_performance: 70.0,
    engagement_score: 3.0,
    participation_score: 3.0,
    behavioral_score: 3.0,
    previous_academic_performance: 7.0,
    course_satisfaction: 3.0,
    failed_subjects: 0,
    assignments_missed: 0,
    lms_activity: 3.0
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const prediction = await makePrediction(formData);
      setResult(prediction);
    } catch (err) {
      setError(err.response?.data?.detail || 'Prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'High Risk':
        return <AlertTriangle className="h-8 w-8 text-red-500" />;
      case 'Medium Risk':
        return <TrendingUp className="h-8 w-8 text-yellow-500" />;
      case 'Low Risk':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Prediction</h1>
        <p className="text-gray-600 mt-1">Enter student data to predict churn risk with AI explanations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prediction Form */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student ID *
              </label>
              <input
                type="text"
                name="student_id"
                required
                className="input-field"
                value={formData.student_id}
                onChange={handleChange}
                placeholder="e.g., STU0001"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  min="17"
                  max="30"
                  className="input-field"
                  value={formData.age}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  className="input-field"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GPA (0-10)
              </label>
              <input
                type="number"
                name="gpa"
                min="0"
                max="10"
                step="0.1"
                className="input-field"
                value={formData.gpa}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attendance Percentage (%)
              </label>
              <input
                type="number"
                name="attendance"
                min="0"
                max="100"
                step="0.1"
                className="input-field"
                value={formData.attendance}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assignment Completion Rate (%)
              </label>
              <input
                type="number"
                name="assignment_completion"
                min="0"
                max="100"
                step="0.1"
                className="input-field"
                value={formData.assignment_completion}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exam Performance (%)
              </label>
              <input
                type="number"
                name="exam_performance"
                min="0"
                max="100"
                step="0.1"
                className="input-field"
                value={formData.exam_performance}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Engagement Score (1-5)
                </label>
                <input
                  type="number"
                  name="engagement_score"
                  min="1"
                  max="5"
                  step="0.1"
                  className="input-field"
                  value={formData.engagement_score}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Participation Score (1-5)
                </label>
                <input
                  type="number"
                  name="participation_score"
                  min="1"
                  max="5"
                  step="0.1"
                  className="input-field"
                  value={formData.participation_score}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Behavioral Score (1-5)
                </label>
                <input
                  type="number"
                  name="behavioral_score"
                  min="1"
                  max="5"
                  step="0.1"
                  className="input-field"
                  value={formData.behavioral_score}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Satisfaction (1-5)
                </label>
                <input
                  type="number"
                  name="course_satisfaction"
                  min="1"
                  max="5"
                  step="0.1"
                  className="input-field"
                  value={formData.course_satisfaction}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Previous Academic Performance (0-10)
              </label>
              <input
                type="number"
                name="previous_academic_performance"
                min="0"
                max="10"
                step="0.1"
                className="input-field"
                value={formData.previous_academic_performance}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Failed Subjects
                </label>
                <input
                  type="number"
                  name="failed_subjects"
                  min="0"
                  className="input-field"
                  value={formData.failed_subjects}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assignments Missed
                </label>
                <input
                  type="number"
                  name="assignments_missed"
                  min="0"
                  className="input-field"
                  value={formData.assignments_missed}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LMS Activity Score (1-5)
              </label>
              <input
                type="number"
                name="lms_activity"
                min="1"
                max="5"
                step="0.1"
                className="input-field"
                value={formData.lms_activity}
                onChange={handleChange}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Analyzing...' : 'Predict Churn Risk'}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {result ? (
            <>
              {/* Prediction Result */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Prediction Result</h3>
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-4">
                    {getRiskIcon(result.risk_level)}
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Risk Level</p>
                  <RiskBadge riskLevel={result.risk_level} />
                  <p className="text-4xl font-bold text-gray-900 mt-4">
                    {(result.churn_probability * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-500">Churn Probability</p>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Low Risk</span>
                    <span>High Risk</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all duration-500 ${
                        result.risk_level === 'High Risk'
                          ? 'bg-red-500'
                          : result.risk_level === 'Medium Risk'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${result.churn_probability * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-500">
                  <p>Model: {result.model_used}</p>
                  <p>Date: {new Date(result.prediction_date).toLocaleString()}</p>
                </div>
              </div>

              {/* SHAP Explanation */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                  Why is this student at risk?
                </h3>
                <div className="space-y-3">
                  {result.top_factors && result.top_factors.length > 0 ? (
                    result.top_factors.map((factor, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{factor.feature}</p>
                          <p className="text-sm text-gray-500">{factor.value}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            Impact: {factor.impact}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No significant risk factors identified
                    </p>
                  )}
                </div>
              </div>

              {/* Intervention Recommendations */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recommended Interventions
                </h3>
                <div className="space-y-3">
                  {result.intervention_recommendations &&
                  result.intervention_recommendations.length > 0 ? (
                    result.intervention_recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="flex items-start p-3 bg-blue-50 rounded-lg"
                      >
                        <div className="flex-shrink-0 mr-3">
                          <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700">{rec}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No specific recommendations at this time
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="card flex items-center justify-center h-96">
              <div className="text-center text-gray-500">
                <p className="text-lg">Enter student data and click Predict</p>
                <p className="text-sm mt-2">AI-powered analysis with SHAP explanations</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Predict;
