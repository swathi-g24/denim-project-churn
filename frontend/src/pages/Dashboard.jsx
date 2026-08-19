import React, { useState, useEffect } from 'react';
import {
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  Clock
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter
} from 'recharts';
import {
  getDashboardStats,
  getRiskDistribution,
  getAttendanceVsChurn,
  getGpaVsChurn,
  getEngagementVsChurn
} from '../services/api';

const COLORS = {
  'Low Risk': '#10b981',
  'Medium Risk': '#f59e0b',
  'High Risk': '#ef4444',
  'Unknown': '#6b7280'
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [riskDistribution, setRiskDistribution] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [gpaData, setGpaData] = useState(null);
  const [engagementData, setEngagementData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, riskData, attendance, gpa, engagement] = await Promise.all([
        getDashboardStats(),
        getRiskDistribution(),
        getAttendanceVsChurn(),
        getGpaVsChurn(),
        getEngagementVsChurn()
      ]);

      setStats(statsData);
      setRiskDistribution(riskData);
      setAttendanceData(attendance);
      setGpaData(gpa);
      setEngagementData(engagement);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Students',
      value: stats?.total_students || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Low Risk',
      value: stats?.low_risk_students || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      title: 'Medium Risk',
      value: stats?.medium_risk_students || 0,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      title: 'High Risk',
      value: stats?.high_risk_students || 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
    {
      title: 'Predicted Dropout',
      value: `${stats?.predicted_dropout_percentage || 0}%`,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      title: 'Avg Attendance',
      value: `${stats?.average_attendance?.toFixed(1) || 0}%`,
      icon: BookOpen,
      color: 'bg-indigo-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of student churn prediction metrics</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Level Distribution</h3>
          {riskDistribution && (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskDistribution.labels.map((label, index) => ({
                    name: label,
                    value: riskDistribution.data[index]
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskDistribution.labels.map((label, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[label] || COLORS['Unknown']} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Attendance vs Churn */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance vs Churn Probability</h3>
          {attendanceData && (
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid />
                <XAxis dataKey="attendance" name="Attendance %" />
                <YAxis dataKey="churn_probability" name="Churn Prob" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter data={attendanceData.attendance.map((att, i) => ({
                  attendance: att,
                  churn_probability: attendanceData.churn_probability[i]
                }))} fill="#3b82f6" />
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* GPA vs Churn */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">GPA vs Churn Probability</h3>
          {gpaData && (
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid />
                <XAxis dataKey="gpa" name="GPA" />
                <YAxis dataKey="churn_probability" name="Churn Prob" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter data={gpaData.gpa.map((gpa, i) => ({
                  gpa: gpa,
                  churn_probability: gpaData.churn_probability[i]
                }))} fill="#10b981" />
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Engagement vs Churn */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement vs Churn Probability</h3>
          {engagementData && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={engagementData.engagement.map((eng, i) => ({
                engagement: eng,
                churn_probability: engagementData.churn_probability[i]
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="engagement" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="churn_probability" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent High-Risk Students */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent High-Risk Students</h3>
        {stats?.recent_high_risk_students?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GPA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Churn Probability
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Level
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recent_high_risk_students.map((student) => (
                  <tr key={student.student_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.student_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.gpa?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.attendance?.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(student.churn_probability * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        {student.risk_level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No high-risk students found</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
