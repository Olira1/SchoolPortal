// Student Dashboard - Academic overview with subject performance cards
// API: GET /student/profile, GET /student/rank, GET /student/subjects/:id/grades

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, Award, TrendingUp, BookOpen, RefreshCw,
  AlertCircle, BarChart3, ArrowRight
} from 'lucide-react';
import { getProfile, getRank, getSubjectGrades } from '../../services/studentService';
import api from '../../services/api';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [rankData, setRankData] = useState(null);
  const [subjectScores, setSubjectScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Current semester/year IDs
  const semesterId = 5;
  const academicYearId = 3;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch profile and rank in parallel
      const [profileRes, rankRes] = await Promise.all([
        getProfile().catch(() => null),
        getRank({ semester_id: semesterId, academic_year_id: academicYearId, type: 'semester' }).catch(() => null),
      ]);

      if (profileRes?.success) setProfile(profileRes.data);
      if (rankRes?.success) setRankData(rankRes.data);

      // Fetch subject scores (from marks, no published report required)
      try {
        const subjectsRes = await api.get('/student/subjects/scores', {
          params: { semester_id: semesterId }
        });
        if (subjectsRes.data?.success) {
          setSubjectScores(subjectsRes.data.data.items || []);
        }
      } catch {
        setSubjectScores([]);
      }
    } catch (err) {
      setError('Failed to load dashboard data.');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const average = rankData?.scores?.average || 0;
  const rank = rankData?.rank?.position || '—';
  const totalStudents = rankData?.rank?.total_students || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back, {profile?.name || 'Student'}! Here's your academic overview.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Academic Summary Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Academic Summary</h2>
        <p className="text-sm text-gray-500 mb-4">Performance for current semester</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-indigo-50 rounded-lg p-4 text-center">
            <GraduationCap className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Class</p>
            <p className="text-lg font-bold text-gray-900">{profile?.class_name || '—'}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <BarChart3 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Semester Average</p>
            <p className="text-lg font-bold text-blue-700">{average > 0 ? average.toFixed(1) : '—'}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <Award className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Class Rank</p>
            <p className="text-lg font-bold text-green-700">
              {rank !== '—' ? `${rank} / ${totalStudents}` : '—'}
            </p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 text-center">
            <TrendingUp className="w-6 h-6 text-amber-600 mx-auto mb-2" />
            <p className="text-xs text-gray-500">vs Class Avg</p>
            <p className={`text-lg font-bold ${rankData?.comparison?.above_average ? 'text-green-700' : 'text-red-600'}`}>
              {rankData?.comparison?.difference_from_average != null
                ? `${rankData.comparison.difference_from_average > 0 ? '+' : ''}${rankData.comparison.difference_from_average.toFixed(1)}`
                : '—'}
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => navigate('/student/semester-report')}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            View Semester Report <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/student/rank')}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            View Rank Details <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subject Performance */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Subject Performance</h2>

        {subjectScores.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectScores.map((subject) => (
              <div
                key={subject.name}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{subject.name}</h3>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-gray-500">Current Mark</p>
                  <p className={`text-2xl font-bold ${subject.score >= 50 ? 'text-indigo-600' : 'text-red-600'}`}>
                    {subject.score?.toFixed(1) || 0}
                    <span className="text-sm text-gray-400 font-normal">/100</span>
                  </p>
                </div>

                {/* Score bar */}
                <div className="mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${subject.score >= 50 ? 'bg-indigo-500' : 'bg-red-400'}`}
                      style={{ width: `${Math.min(subject.score || 0, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 text-right mt-1">{(subject.score || 0).toFixed(0)}% Achieved</p>
                </div>

                <button
                  onClick={() => navigate('/student/subjects')}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                  View Details <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3" />
            <p className="text-lg font-medium text-gray-900">No Subject Data Yet</p>
            <p className="text-sm mt-1">Subject scores will appear here once grades are published.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
