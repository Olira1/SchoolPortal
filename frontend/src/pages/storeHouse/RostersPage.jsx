// Rosters Page - View class rosters received from class heads
// Shows list of rosters and expandable detail with full student roster table
// API: GET /store-house/rosters, GET /store-house/rosters/:id

import { useState, useEffect } from 'react';
import {
  Archive, RefreshCw, AlertCircle, ChevronDown, ChevronUp,
  Users, Eye, ArrowLeft, BarChart3
} from 'lucide-react';
import { listRosters, getRoster } from '../../services/storeHouseService';

const RostersPage = () => {
  const [rosters, setRosters] = useState([]);
  const [selectedRoster, setSelectedRoster] = useState(null); // detail view
  const [rosterDetail, setRosterDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [filterYear, setFilterYear] = useState('');
  const [filterGrade, setFilterGrade] = useState('');

  useEffect(() => {
    fetchRosters();
  }, []);

  const fetchRosters = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filterYear) params.academic_year_id = filterYear;
      if (filterGrade) params.grade_id = filterGrade;

      const res = await listRosters(params);
      if (res.success) {
        setRosters(res.data.items || []);
      }
    } catch (err) {
      setError('Failed to load rosters.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRoster = async (rosterId) => {
    setSelectedRoster(rosterId);
    setDetailLoading(true);
    try {
      const res = await getRoster(rosterId);
      if (res.success) {
        setRosterDetail(res.data);
      }
    } catch (err) {
      console.error('Error loading roster detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedRoster(null);
    setRosterDetail(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  // =============================================
  // DETAIL VIEW - Full roster table
  // =============================================
  if (selectedRoster && rosterDetail) {
    const students = rosterDetail.students || [];
    const stats = rosterDetail.class_statistics || {};

    // Extract all subject names from the first student's subject_scores
    const subjectNames = students.length > 0 && students[0]?.subject_scores
      ? Object.keys(students[0].subject_scores)
      : [];

    return (
      <div className="space-y-6">
        {/* Back button + Header */}
        <div>
          <button
            onClick={handleBack}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Rosters
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Student Roster | {rosterDetail.class?.grade_name} {rosterDetail.class?.name} | {rosterDetail.semester}
          </h1>
          <p className="text-gray-500 mt-1">
            Academic Year: {rosterDetail.academic_year} | Class Head: {rosterDetail.class_head?.name || '—'}
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <Users className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Total Students</p>
            <p className="text-xl font-bold text-gray-900">{stats.total_students || students.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <BarChart3 className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Class Average</p>
            <p className="text-xl font-bold text-blue-700">{stats.class_average?.toFixed(1) || '—'}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Promoted</p>
            <p className="text-xl font-bold text-green-600">{stats.promoted || 0}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Retained</p>
            <p className="text-xl font-bold text-red-600">{stats.retained || 0}</p>
          </div>
        </div>

        {/* Roster Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">#</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Name</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Sex</th>
                  {subjectNames.map(name => (
                    <th key={name} className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">
                      {name.length > 10 ? name.substring(0, 8) + '..' : name}
                    </th>
                  ))}
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Total</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Avg</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Rank</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student, idx) => (
                  <tr key={student.student_id || idx} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-500">{idx + 1}</td>
                    <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap">
                      {student.name}
                    </td>
                    <td className="px-3 py-2 text-center text-gray-600">{student.sex || '—'}</td>
                    {subjectNames.map(name => (
                      <td key={name} className="px-3 py-2 text-center text-gray-700">
                        {student.subject_scores?.[name] != null
                          ? parseFloat(student.subject_scores[name]).toFixed(0)
                          : '—'}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-center font-semibold text-gray-900">
                      {student.total != null ? parseFloat(student.total).toFixed(1) : '—'}
                    </td>
                    <td className="px-3 py-2 text-center font-semibold text-indigo-600">
                      {student.average != null ? parseFloat(student.average).toFixed(1) : '—'}
                    </td>
                    <td className="px-3 py-2 text-center text-gray-700">
                      {student.rank || '—'}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        student.remark === 'Promoted'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {student.remark || '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {students.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              <p className="text-sm">No student data in this roster.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Detail loading state
  if (selectedRoster && detailLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  // =============================================
  // LIST VIEW - All rosters
  // =============================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Class Rosters</h1>
        <p className="text-gray-500 mt-1">
          Organize and manage finalized semester reports by class, year, and semester.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Overview stat */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Archive className="w-5 h-5 text-indigo-500" />
          <div>
            <p className="text-xs text-gray-500">Total Rosters</p>
            <p className="text-lg font-bold text-gray-900">{rosters.length}</p>
          </div>
        </div>
      </div>

      {/* Roster List */}
      {rosters.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Class</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Academic Year</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Semester</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Students</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Class Head</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Received</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rosters.map((roster) => (
                  <tr key={roster.roster_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{roster.class?.name}</p>
                        <p className="text-xs text-gray-500">{roster.class?.grade_name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{roster.academic_year}</td>
                    <td className="px-4 py-3 text-gray-600">{roster.semester || '—'}</td>
                    <td className="px-4 py-3 text-center font-medium text-gray-900">{roster.student_count}</td>
                    <td className="px-4 py-3 text-gray-600">{roster.class_head || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {roster.received_at ? new Date(roster.received_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        {roster.status || 'Complete'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleViewRoster(roster.roster_id)}
                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1 mx-auto"
                      >
                        <Eye className="w-4 h-4" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
          <Archive className="w-12 h-12 mx-auto mb-3" />
          <p className="text-lg font-medium text-gray-900">No Rosters Received</p>
          <p className="text-sm mt-1">Rosters will appear here when class heads send them.</p>
        </div>
      )}
    </div>
  );
};

export default RostersPage;
