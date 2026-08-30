import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle, TrendingUp, Lightbulb, Search } from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import { makePrediction, getStudent } from '../services/api';

const Predict = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    student_id: '',
    age: '',
    gender: '',
    gpa: '',
    attendance: '',
    assignment_completion: '',
    exam_performance: '',
    engagement_score: '',
    participation_score: '',
    behavioral_score: '',
    previous_academic_performance: '',
    course_satisfaction: '',
    failed_subjects: '',
    assignments_missed: '',
    lms_activity: ''
  });
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
    }));
  };

  const handleBlur = (e) => {
    const { name, value, type } = e.target;
    if (type === 'number' && value === '') {
      setFormData(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleClearForm = () => {
    setFormData({
      student_id: '',
      age: '',
      gender: '',
      gpa: '',
      attendance: '',
      assignment_completion: '',
      exam_performance: '',
      engagement_score: '',
      participation_score: '',
      behavioral_score: '',
      previous_academic_performance: '',
      course_satisfaction: '',
      failed_subjects: '',
      assignments_missed: '',
      lms_activity: ''
    });
    setError('');
    setResult(null);
  };

  const handleSearchStudent = async () => {
    if (!formData.student_id) {
      setError('Please enter a Student ID first');
      return;
    }

    setSearching(true);
    setError('');

    try {
      const student = await getStudent(formData.student_id);
      setFormData({
        student_id: student.student_id,
        age: student.age,
        gender: student.gender,
        gpa: student.gpa,
        attendance: student.attendance,
        assignment_completion: student.assignment_completion,
        exam_performance: student.exam_performance,
        engagement_score: student.engagement_score,
        participation_score: student.participation_score,
        behavioral_score: student.behavioral_score,
        previous_academic_performance: student.previous_academic_performance,
        course_satisfaction: student.course_satisfaction,
        failed_subjects: student.failed_subjects,
        assignments_missed: student.assignments_missed,
        lms_activity: student.lms_activity
      });
      setError('');
    } catch (err) {
      setError('Student not found in database. Please check the Student ID or upload the dataset first.');
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['age', 'gender', 'gpa', 'attendance', 'assignment_completion', 
                           'exam_performance', 'engagement_score', 'participation_score', 
                           'behavioral_score', 'previous_academic_performance', 'course_satisfaction',
                           'failed_subjects', 'assignments_missed', 'lms_activity'];
    
    const emptyFields = requiredFields.filter(field => {
      const value = formData[field];
      return value === '' || value === null || value === undefined;
    });
    
    if (emptyFields.length > 0) {
      setError('Please fill in all fields or use Auto-fill to load student data.');
      return;
    }
    
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
              <div className="flex gap-2">
                <input
                  type="text"
                  name="student_id"
                  required
                  className="input-field flex-1"
                  value={formData.student_id}
                  onChange={handleChange}
                  placeholder="e.g., STU0001"
                />
                <button
                  type="button"
                  onClick={handleSearchStudent}
                  disabled={searching || !formData.student_id}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  {searching ? 'Loading...' : 'Auto-fill'}
                </button>
                <button
                  type="button"
                  onClick={handleClearForm}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
                >
                  Clear
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter Student ID and click Auto-fill to load data from your uploaded dataset
              </p>
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
                  step="1"
                  className="input-field"
                  value={formData.age === '' ? '' : formData.age}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Age"
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
                  <option value="">Select Gender</option>
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
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  name="gpa"
                  min="0"
                  max="10"
                  step="0.1"
                  className="input-field flex-1"
                  value={formData.gpa}
                  onChange={handleChange}
                  placeholder="GPA"
                />
                <input
                  type="range"
                  name="gpa"
                  min="0"
                  max="10"
                  step="0.1"
                  className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  value={formData.gpa || 0}
                  onChange={handleChange}
                  disabled={!formData.gpa}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attendance Percentage (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  name="attendance"
                  min="0"
                  max="100"
                  step="0.1"
                  className="input-field flex-1"
                  value={formData.attendance}
                  onChange={handleChange}
                  placeholder="Attendance %"
                />
                <input
                  type="range"
                  name="attendance"
                  min="0"
                  max="100"
                  step="1"
                  className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  value={formData.attendance || 0}
                  onChange={handleChange}
                  disabled={!formData.attendance}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assignment Completion Rate (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  name="assignment_completion"
                  min="0"
                  max="100"
                  step="0.1"
                  className="input-field flex-1"
                  value={formData.assignment_completion}
                  onChange={handleChange}
                  placeholder="Assignment Completion %"
                />
                <input
                  type="range"
                  name="assignment_completion"
                  min="0"
                  max="100"
                  step="1"
                  className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  value={formData.assignment_completion || 0}
                  onChange={handleChange}
                  disabled={!formData.assignment_completion}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exam Performance (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  name="exam_performance"
                  min="0"
                  max="100"
                  step="0.1"
                  className="input-field flex-1"
                  value={formData.exam_performance}
                  onChange={handleChange}
                  placeholder="Exam Performance %"
                />
                <input
                  type="range"
                  name="exam_performance"
                  min="0"
                  max="100"
                  step="1"
                  className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  value={formData.exam_performance || 0}
                  onChange={handleChange}
                  disabled={!formData.exam_performance}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Engagement Score (1-5)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    name="engagement_score"
                    min="1"
                    max="5"
                    step="0.1"
                    className="input-field flex-1"
                    value={formData.engagement_score}
                    onChange={handleChange}
                    placeholder="Engagement Score"
                  />
                  <input
                    type="range"
                    name="engagement_score"
                    min="1"
                    max="5"
                    step="0.1"
                    className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    value={formData.engagement_score || 1}
                    onChange={handleChange}
                    disabled={!formData.engagement_score}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Participation Score (1-5)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    name="participation_score"
                    min="1"
                    max="5"
                    step="0.1"
                    className="input-field flex-1"
                    value={formData.participation_score}
                    onChange={handleChange}
                    placeholder="Participation Score"
                  />
                  <input
                    type="range"
                    name="participation_score"
                    min="1"
                    max="5"
                    step="0.1"
                    className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    value={formData.participation_score || 1}
                    onChange={handleChange}
                    disabled={!formData.participation_score}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Behavioral Score (1-5)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    name="behavioral_score"
                    min="1"
                    max="5"
                    step="0.1"
                    className="input-field flex-1"
                    value={formData.behavioral_score}
                    onChange={handleChange}
                    placeholder="Behavioral Score"
                  />
                  <input
                    type="range"
                    name="behavioral_score"
                    min="1"
                    max="5"
                    step="0.1"
                    className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    value={formData.behavioral_score || 1}
                    onChange={handleChange}
                    disabled={!formData.behavioral_score}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Satisfaction (1-5)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    name="course_satisfaction"
                    min="1"
                    max="5"
                    step="0.1"
                    className="input-field flex-1"
                    value={formData.course_satisfaction}
                    onChange={handleChange}
                    placeholder="Course Satisfaction"
                  />
                  <input
                    type="range"
                    name="course_satisfaction"
                    min="1"
                    max="5"
                    step="0.1"
                    className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    value={formData.course_satisfaction || 1}
                    onChange={handleChange}
                    disabled={!formData.course_satisfaction}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Previous Academic Performance (0-10)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  name="previous_academic_performance"
                  min="0"
                  max="10"
                  step="0.1"
                  className="input-field flex-1"
                  value={formData.previous_academic_performance}
                  onChange={handleChange}
                  placeholder="Previous Academic Performance"
                />
                <input
                  type="range"
                  name="previous_academic_performance"
                  min="0"
                  max="10"
                  step="0.1"
                  className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  value={formData.previous_academic_performance || 0}
                  onChange={handleChange}
                  disabled={!formData.previous_academic_performance}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Failed Subjects
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    name="failed_subjects"
                    min="0"
                    className="input-field flex-1"
                    value={formData.failed_subjects}
                    onChange={handleChange}
                    placeholder="Failed Subjects"
                  />
                  <input
                    type="range"
                    name="failed_subjects"
                    min="0"
                    max="10"
                    step="1"
                    className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    value={formData.failed_subjects || 0}
                    onChange={handleChange}
                    disabled={!formData.failed_subjects}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assignments Missed
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    name="assignments_missed"
                    min="0"
                    className="input-field flex-1"
                    value={formData.assignments_missed}
                    onChange={handleChange}
                    placeholder="Assignments Missed"
                  />
                  <input
                    type="range"
                    name="assignments_missed"
                    min="0"
                    max="20"
                    step="1"
                    className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    value={formData.assignments_missed || 0}
                    onChange={handleChange}
                    disabled={!formData.assignments_missed}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LMS Activity Score (1-5)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  name="lms_activity"
                  min="1"
                  max="5"
                  step="0.1"
                  className="input-field flex-1"
                  value={formData.lms_activity}
                  onChange={handleChange}
                  placeholder="LMS Activity"
                />
                <input
                  type="range"
                  name="lms_activity"
                  min="1"
                  max="5"
                  step="0.1"
                  className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  value={formData.lms_activity || 1}
                  onChange={handleChange}
                  disabled={!formData.lms_activity}
                />
              </div>
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
                        className={`p-4 rounded-lg border-l-4 ${
                          factor.direction === 'increases'
                            ? 'border-red-500 bg-red-50'
                            : 'border-green-500 bg-green-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-sm">
                              {index + 1}. {factor.feature}
                            </p>
                            <p className="text-sm text-gray-700 mt-1">
                              {factor.value}
                            </p>
                          </div>
                          <div className="ml-4 text-right">
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                factor.direction === 'increases'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-green-100 text-green-700'
                              }`}
                            >
                              {factor.direction === 'increases' ? '↑ Risk' : '↓ Risk'}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              Impact: {factor.impact}
                            </p>
                          </div>
                        </div>
                        {factor.actual_value && factor.actual_value !== 'N/A' && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="text-xs text-gray-500">
                              Current Value: <span className="font-medium text-gray-700">{factor.actual_value}</span>
                            </p>
                          </div>
                        )}
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
