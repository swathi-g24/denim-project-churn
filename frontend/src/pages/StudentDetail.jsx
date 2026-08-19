import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import { getStudent, getStudentPredictions } from '../services/api';

const StudentDetail = () => {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentData();
  }, [studentId]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const [studentData, predictionsData] = await Promise.all([
        getStudent(studentId),
        getStudentPredictions(studentId)
      ]);
      setStudent(studentData);
      setPredictions(predictionsData);
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading student details...</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Student not found</p>
        <Link to="/students" className="btn-primary mt-4 inline-block">
          Back to Students
        </Link>
      </div>
    );
  }

  const getRiskIcon = (level) => {
    switch (level) {
      case 'High Risk':
        return <AlertTriangle className="h-6 w-6 text-red-500" />;
      case 'Medium Risk':
        return <TrendingUp className="h-6 w-6 text-yellow-500" />;
      case 'Low Risk':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/students" className="flex items-center text-gray-600 hover:text-gray-900 mb-2">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Students
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{student.name}</h1>
          <p className="text-gray-600 mt-1">Student ID: {student.student_id}</p>
        </div>
        <div className="flex items-center space-x-2">
          {getRiskIcon(student.risk_level)}
          <RiskBadge riskLevel={student.risk_level} />
        </div>
      </div>

      {/* Basic Information */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Age</p>
            <p className="text-lg font-medium text-gray-900">{student.age}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Gender</p>
            <p className="text-lg font-medium text-gray-900">{student.gender}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Prediction Status</p>
            <p className="text-lg font-medium text-gray-900 capitalize">
              {student.prediction_status}
            </p>
          </div>
        </div>
      </div>

      {/* Academic Performance */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">GPA</p>
            <p className="text-lg font-medium text-gray-900">{student.gpa?.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Attendance</p>
            <p className="text-lg font-medium text-gray-900">{student.attendance?.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Assignment Completion</p>
            <p className="text-lg font-medium text-gray-900">
              {student.assignment_completion?.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Exam Performance</p>
            <p className="text-lg font-medium text-gray-900">
              {student.exam_performance?.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Previous Academic Performance</p>
            <p className="text-lg font-medium text-gray-900">
              {student.previous_academic_performance?.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Failed Subjects</p>
            <p className="text-lg font-medium text-gray-900">{student.failed_subjects}</p>
          </div>
        </div>
      </div>

      {/* Engagement & Behavior */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement & Behavior</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Engagement Score</p>
            <p className="text-lg font-medium text-gray-900">{student.engagement_score?.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Participation Score</p>
            <p className="text-lg font-medium text-gray-900">
              {student.participation_score?.toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Behavioral Score</p>
            <p className="text-lg font-medium text-gray-900">
              {student.behavioral_score?.toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Course Satisfaction</p>
            <p className="text-lg font-medium text-gray-900">
              {student.course_satisfaction?.toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Assignments Missed</p>
            <p className="text-lg font-medium text-gray-900">{student.assignments_missed}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">LMS Activity</p>
            <p className="text-lg font-medium text-gray-900">{student.lms_activity?.toFixed(1)}</p>
          </div>
        </div>
      </div>

      {/* Churn Prediction */}
      {student.churn_probability && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Churn Prediction</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Churn Probability</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {(student.churn_probability * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Risk Level</p>
              <div className="mt-1">
                <RiskBadge riskLevel={student.risk_level} />
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Low Risk</span>
              <span>High Risk</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full ${
                  student.risk_level === 'High Risk'
                    ? 'bg-red-500'
                    : student.risk_level === 'Medium Risk'
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${student.churn_probability * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Prediction History */}
      {predictions.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Prediction History</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Churn Probability
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Model Used
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {predictions.map((prediction) => (
                  <tr key={prediction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(prediction.prediction_date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(prediction.churn_probability * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <RiskBadge riskLevel={prediction.risk_level} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {prediction.model_used}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDetail;
