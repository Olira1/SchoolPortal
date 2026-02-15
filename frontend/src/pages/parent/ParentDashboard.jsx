// Parent Dashboard - Child Overview with summary stats and subject performance cards
// API: GET /parent/children, GET /parent/children/:id/subjects/scores, GET /parent/children/:id/rank

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw, AlertCircle, GraduationCap, Trophy, BookOpen,
  ChevronRight, Users, ArrowRight
} from 'lucide-react';
import api from '../../services/api';
import { listChildren, getChildRank } from '../../services/parentService';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [subjectScores, setSubjectScores] = useState([]);
  const [rankData, setRankData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch children on mount
  useEffect(() => {
    fetchChildren();
  }, []);

  // Fetch data when child is selected
  useEffect(() => {
    if (selectedChild) {
      fetchChildData(selectedChild);
    }
  }, [selectedChild]);

  const fetchChildren = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listChildren();
      if (res.success && res.data.items?.length > 0) {
        setChildren(res.data.items);
        // Auto-select first child
        setSelectedChild(res.data.items[0]);
      }
    } catch (err) {
      setError('Failed to load children data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChildData = async (child) => {
    try {
      // Fetch current semester's subject scores
      const [semRes] = await Promise.all([
        api.get('/semesters/current').catch(() => null),
      ]);

      const currentSemester = semRes?.data?.data;
      if (!currentSemester) return;

      const [scoresRes, rankRes] = await Promise.all([
        api.get(`/parent/children/${child.student_id}/subjects/scores`, {
          params: { semester_id: currentSemester.id }
        }).catch(() => null),
        getChildRank(child.student_id, {
          semester_id: currentSemester.id,
          academic_year_id: currentSemester.academic_year_id,
          type: 'semester'
        }).catch(() => null),
      ]);

      if (scoresRes?.data?.success) {
        setSubjectScores(scoresRes.data.data.items || []);
      }
      if (rankRes?.success) {
        setRankData(rankRes.data);
      }
    } catch (err) {
      console.error('Error fetching child data:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <Users className="w-12 h-12 mb-3" />
        <p className="text-lg font-medium text-gray-900">No Children Linked</p>
        <p className="text-sm mt-1">Contact the school to link your children to your account.</p>
      </div>
    );
  }

  const totalScore = subjectScores.reduce((sum, s) => sum + s.score, 0);
  const avgScore = subjectScores.length > 0 ? totalScore / subjectScores.length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Child Overview Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Summary for {selectedChild?.name} — {selectedChild?.class_name}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Child Selector (if multiple children) */}
      {children.length > 1 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Select Child</p>
          <div className="flex gap-3 flex-wrap">
            {children.map(child => (
              <button
                key={child.student_id}
                onClick={() => setSelectedChild(child)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  selectedChild?.student_id === child.student_id
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                }`}
              >
                {child.name} — {child.class_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="w-5 h-5 text-blue-500" />
            <span className="text-xs text-gray-500 uppercase font-semibold">Semester Average</span>
          </div>
          <p className="text-3xl font-bold text-blue-600">{avgScore.toFixed(1)}%</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="text-xs text-gray-500 uppercase font-semibold">Class Rank</span>
          </div>
          <p className="text-3xl font-bold text-amber-600">
            {rankData?.rank?.position || '—'}
            <span className="text-sm font-normal text-gray-500">
              {rankData?.rank?.total_students ? ` out of ${rankData.rank.total_students}` : ''}
            </span>
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-green-500" />
            <span className="text-xs text-gray-500 uppercase font-semibold">Subjects</span>
          </div>
          <p className="text-3xl font-bold text-green-600">{subjectScores.length}</p>
          <p className="text-xs text-gray-500">subjects this semester</p>
        </div>
      </div>

      {/* Subject Performance Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Recent Subject Performance</h2>
          <button
            onClick={() => navigate('/parent/subjects')}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            View Details <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        {subjectScores.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectScores.map(subject => (
              <div
                key={subject.id}
                onClick={() => navigate('/parent/subjects')}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{subject.name}</h3>
                </div>
                <p className="text-2xl font-bold text-indigo-600 mb-2">
                  {subject.score.toFixed(1)} <span className="text-sm font-normal text-gray-400">/ 100</span>
                </p>
                {/* Progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      subject.score >= 75 ? 'bg-green-500'
                        : subject.score >= 50 ? 'bg-blue-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(subject.score, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  View assessment breakdown <ChevronRight className="w-3 h-3" />
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400">
            <BookOpen className="w-10 h-10 mx-auto mb-2" />
            <p className="text-sm">No subject scores available yet for this semester.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
