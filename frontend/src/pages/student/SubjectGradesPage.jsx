// Subject Grades Page - View assessment-level breakdown per subject
// API: GET /student/subjects/:subject_id/grades, GET /student/profile

import { useState, useEffect } from 'react';
import {
  BookOpen, RefreshCw, AlertCircle, ChevronDown, ChevronUp, Award
} from 'lucide-react';
import { getProfile, getSubjectGrades, getRank } from '../../services/studentService';
import api from '../../services/api';

const SubjectGradesPage = () => {
  const [profile, setProfile] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('5');
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [subjectDetails, setSubjectDetails] = useState({});
  const [rankData, setRankData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(null);
  const [error, setError] = useState(null);

  const semesters = [
    { id: '5', name: 'First Semester (2017 E.C)' },
    { id: '6', name: 'Second Semester (2017 E.C)' },
  ];

  useEffect(() => {
    fetchData();
  }, [selectedSemester]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get profile and rank
      const [profileRes, rankRes] = await Promise.all([
        getProfile().catch(() => null),
        getRank({ semester_id: parseInt(selectedSemester), academic_year_id: 3, type: 'semester' }).catch(() => null),
      ]);

      if (profileRes?.success) setProfile(profileRes.data);
      if (rankRes?.success) setRankData(rankRes.data);

      // Get subject scores directly from marks (no published report required)
      try {
        const subjectsRes = await api.get('/student/subjects/scores', {
          params: { semester_id: parseInt(selectedSemester) }
        });
        if (subjectsRes.data?.success) {
          setSubjects(subjectsRes.data.data.items || []);
        }
      } catch {
        setSubjects([]);
      }
    } catch (err) {
      setError('Failed to load subject data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch detailed subject breakdown when expanded
  const handleExpandSubject = async (subjectName, subjectId) => {
    if (expandedSubject === subjectName) {
      setExpandedSubject(null);
      return;
    }

    setExpandedSubject(subjectName);

    // If we already loaded details, don't re-fetch
    if (subjectDetails[subjectName]) return;

    setDetailLoading(subjectName);
    try {
      const res = await getSubjectGrades(subjectId, { semester_id: parseInt(selectedSemester) });
      if (res.success) {
        setSubjectDetails(prev => ({ ...prev, [subjectName]: res.data }));
      }
    } catch (err) {
      console.error('Error loading subject details:', err);
    } finally {
      setDetailLoading(null);
    }
  };

  // Subject IDs come from the semester report endpoint (subject.id field)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subject Marks Overview</h1>
        <p className="text-gray-500 mt-1">View your assessment breakdown for each subject.</p>
      </div>

      {/* Semester Summary + Selector */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <select
                value={selectedSemester}
                onChange={(e) => {
                  setSelectedSemester(e.target.value);
                  setSubjectDetails({});
                  setExpandedSubject(null);
                }}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {semesters.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Summary card */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 min-w-[220px]">
          <p className="text-sm text-indigo-600 font-medium">Semester Summary</p>
          <p className="text-3xl font-bold text-indigo-700 mt-1">
            {rankData?.scores?.average ? rankData.scores.average.toFixed(1) : '—'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            <Award className="w-3 h-3 inline mr-1" />
            {rankData?.rank?.position
              ? `${rankData.rank.position}${rankData.rank.position === 1 ? 'st' : rankData.rank.position === 2 ? 'nd' : rankData.rank.position === 3 ? 'rd' : 'th'} out of ${rankData.rank.total_students} students`
              : 'Rank not available'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Subject List */}
      {subjects.length > 0 ? (
        <div className="space-y-3">
          {subjects.map((subject) => (
            <div key={subject.name} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Subject header */}
              <button
                onClick={() => handleExpandSubject(subject.name, subject.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{subject.name}</h3>
                    <p className="text-sm text-gray-500">Score: {subject.score?.toFixed(1) || 0}/100</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Score bar */}
                  <div className="hidden sm:block w-32">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${subject.score >= 50 ? 'bg-indigo-500' : 'bg-red-400'}`}
                        style={{ width: `${Math.min(subject.score || 0, 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className={`text-lg font-bold ${subject.score >= 50 ? 'text-indigo-600' : 'text-red-600'}`}>
                    {subject.score?.toFixed(1) || 0}
                  </span>
                  {expandedSubject === subject.name
                    ? <ChevronUp className="w-5 h-5 text-gray-400" />
                    : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>
              </button>

              {/* Expanded detail */}
              {expandedSubject === subject.name && (
                <div className="border-t border-gray-100 p-4 bg-gray-50">
                  {detailLoading === subject.name ? (
                    <div className="flex items-center justify-center py-4">
                      <RefreshCw className="w-5 h-5 text-indigo-500 animate-spin mr-2" />
                      <span className="text-sm text-gray-500">Loading breakdown...</span>
                    </div>
                  ) : subjectDetails[subject.name] ? (
                    <div>
                      {subjectDetails[subject.name].teacher && (
                        <p className="text-sm text-gray-500 mb-3">
                          Teacher: {subjectDetails[subject.name].teacher.name}
                        </p>
                      )}
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs text-gray-500 uppercase">
                            <th className="text-left py-2 px-3">Assessment</th>
                            <th className="text-center py-2 px-3">Weight</th>
                            <th className="text-center py-2 px-3">Score</th>
                            <th className="text-center py-2 px-3">Max</th>
                            <th className="text-center py-2 px-3">Weighted</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {subjectDetails[subject.name].assessments?.map((a, idx) => (
                            <tr key={idx} className="hover:bg-white">
                              <td className="py-2 px-3 font-medium text-gray-900">{a.type}</td>
                              <td className="py-2 px-3 text-center text-gray-600">{a.weight_percent}%</td>
                              <td className="py-2 px-3 text-center font-medium text-gray-900">{parseFloat(a.score).toFixed(1)}</td>
                              <td className="py-2 px-3 text-center text-gray-500">{parseFloat(a.max_score).toFixed(1)}</td>
                              <td className="py-2 px-3 text-center font-medium text-indigo-600">{a.weighted_score?.toFixed(1)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-gray-300 font-semibold">
                            <td className="py-2 px-3" colSpan={4}>Subject Total</td>
                            <td className="py-2 px-3 text-center text-indigo-700">
                              {subjectDetails[subject.name].summary?.subject_average?.toFixed(1) || 0}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-4">
                      No detailed breakdown available. Click to expand again.
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3" />
          <p className="text-lg font-medium text-gray-900">No Subject Data</p>
          <p className="text-sm mt-1">Subject grades will appear once your marks are published.</p>
        </div>
      )}
    </div>
  );
};

export default SubjectGradesPage;
