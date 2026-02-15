// Compile & Publish Page - Class Head Portal
// Step 1: Compile grades (total, average, rank)
// Step 2: View student rankings
// Step 3: Publish semester or year results
// API: POST /class-head/compile-grades, GET /class-head/students/rankings,
//      POST /class-head/publish/semester, POST /class-head/publish/year

import { useState, useEffect } from 'react';
import {
  Send,
  RefreshCw,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ChevronDown,
  Play,
  Trophy,
  BookOpen,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import {
  compileGrades,
  getStudentRankings,
  publishSemesterResults,
  publishYearResults,
} from '../../services/classHeadService';

const CompilePublishPage = () => {
  // State: selections
  const [selectedSemesterId, setSelectedSemesterId] = useState('5');
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState('3');

  // State: data
  const [rankings, setRankings] = useState(null);
  const [compileResult, setCompileResult] = useState(null);

  // State: UI
  const [loading, setLoading] = useState(false);
  const [compiling, setCompiling] = useState(false);
  const [publishingSemester, setPublishingSemester] = useState(false);
  const [publishingYear, setPublishingYear] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch rankings
  const fetchRankings = async () => {
    try {
      setLoading(true);
      const response = await getStudentRankings({ semester_id: parseInt(selectedSemesterId) });
      if (response.success) {
        setRankings(response.data);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching rankings:', err);
      // Rankings might not exist yet if grades aren't compiled - that's ok
      setRankings(null);
    } finally {
      setLoading(false);
    }
  };

  // Load rankings on mount and selection change
  useEffect(() => {
    fetchRankings();
  }, [selectedSemesterId]);

  // Handle compile grades
  const handleCompile = async () => {
    if (!window.confirm('This will calculate total, average, and rank for all students. Continue?')) {
      return;
    }

    try {
      setCompiling(true);
      setError(null);
      setSuccessMessage('');

      const response = await compileGrades({
        semester_id: parseInt(selectedSemesterId),
        academic_year_id: parseInt(selectedAcademicYearId),
      });

      if (response.success) {
        setCompileResult(response.data);
        setSuccessMessage(
          `Grades compiled successfully! ${response.data.students_compiled} students processed. Class average: ${response.data.class_average}`
        );
        // Refresh rankings to show updated data
        await fetchRankings();
      }
    } catch (err) {
      console.error('Error compiling grades:', err);
      const errorData = err.response?.data?.error;
      setError(typeof errorData === 'object' ? errorData.message : errorData || 'Failed to compile grades');
    } finally {
      setCompiling(false);
    }
  };

  // Handle publish semester results
  const handlePublishSemester = async () => {
    if (!window.confirm('This will make semester results visible to students and parents. Continue?')) {
      return;
    }

    try {
      setPublishingSemester(true);
      setError(null);
      setSuccessMessage('');

      const response = await publishSemesterResults({
        semester_id: parseInt(selectedSemesterId),
        academic_year_id: parseInt(selectedAcademicYearId),
      });

      if (response.success) {
        setSuccessMessage(
          `Semester results published successfully! ${response.data.students_published} students' results are now visible.`
        );
      }
    } catch (err) {
      console.error('Error publishing semester results:', err);
      const errorData = err.response?.data?.error;
      setError(typeof errorData === 'object' ? errorData.message : errorData || 'Failed to publish results');
    } finally {
      setPublishingSemester(false);
    }
  };

  // Handle publish year results
  const handlePublishYear = async () => {
    if (!window.confirm('This will publish the full year results and can notify students, parents, and the store house. Continue?')) {
      return;
    }

    try {
      setPublishingYear(true);
      setError(null);
      setSuccessMessage('');

      const response = await publishYearResults({
        academic_year_id: parseInt(selectedAcademicYearId),
        notify_students: true,
        notify_parents: true,
        send_to_store_house: true,
      });

      if (response.success) {
        setSuccessMessage('Year results published successfully!');
      }
    } catch (err) {
      console.error('Error publishing year results:', err);
      const errorData = err.response?.data?.error;
      setError(typeof errorData === 'object' ? errorData.message : errorData || 'Failed to publish year results');
    } finally {
      setPublishingYear(false);
    }
  };

  // Get rank medal/badge
  const getRankBadge = (rank) => {
    if (rank === 1) return <span className="text-yellow-500">🥇</span>;
    if (rank === 2) return <span className="text-gray-400">🥈</span>;
    if (rank === 3) return <span className="text-orange-400">🥉</span>;
    return <span className="text-gray-500">{rank}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Compile & Publish</h1>
        <p className="text-gray-500 mt-1">
          Compile final grades (total, average, rank) and publish results to students and parents.
        </p>
      </div>

      {/* Semester & Academic Year Selectors */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <div className="relative">
              <select
                value={selectedSemesterId}
                onChange={(e) => setSelectedSemesterId(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value="5">First Semester (2017 E.C)</option>
                <option value="6">Second Semester (2017 E.C)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
            <div className="relative">
              <select
                value={selectedAcademicYearId}
                onChange={(e) => setSelectedAcademicYearId(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value="3">2024/2025 (2017 E.C)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      {/* Action Cards - 3-step workflow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1: Compile */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
              1
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Compile Grades</h3>
              <p className="text-xs text-gray-500">Calculate total, average, rank</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Processes all approved subject grades and calculates each student's total score, average, rank, and promotion status.
          </p>
          <button
            onClick={handleCompile}
            disabled={compiling}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {compiling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {compiling ? 'Compiling...' : 'Compile Now'}
          </button>
        </div>

        {/* Step 2: Publish Semester */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm">
              2
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Publish Semester</h3>
              <p className="text-xs text-gray-500">Make results visible</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Makes the compiled semester results visible to students and parents. Ensure grades are compiled first.
          </p>
          <button
            onClick={handlePublishSemester}
            disabled={publishingSemester}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {publishingSemester ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {publishingSemester ? 'Publishing...' : 'Publish Semester'}
          </button>
        </div>

        {/* Step 3: Publish Year */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
              3
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Publish Year</h3>
              <p className="text-xs text-gray-500">Final year results + store house</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Publishes full year results and sends data to the store house. Both semesters must be finalized first.
          </p>
          <button
            onClick={handlePublishYear}
            disabled={publishingYear}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {publishingYear ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
            {publishingYear ? 'Publishing...' : 'Publish Year Results'}
          </button>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-700">
          <p className="font-medium">Important Workflow</p>
          <p className="mt-1">
            Follow the steps in order: <strong>1.</strong> Compile grades first to calculate totals and ranks.{' '}
            <strong>2.</strong> Publish semester results. <strong>3.</strong> After both semesters are done, publish year results.
          </p>
        </div>
      </div>

      {/* Rankings Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mr-2" />
          <span className="text-gray-500">Loading rankings...</span>
        </div>
      ) : rankings?.items?.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Student Rankings
              </h2>
              <p className="text-sm text-gray-500">
                {rankings.class?.name} — {rankings.semester || 'Semester'} — Class Average: {rankings.class_average}
              </p>
            </div>
            <button
              onClick={fetchRankings}
              className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Name</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Subjects</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Average</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rankings.items.map((student) => (
                  <tr
                    key={student.student_id}
                    className={`hover:bg-gray-50 ${student.rank <= 3 ? 'bg-yellow-50/50' : ''}`}
                  >
                    <td className="px-4 py-3 text-center text-sm font-bold">
                      {getRankBadge(student.rank)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.student_name}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">{student.subjects_count}</td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-gray-900">{student.total}</td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-gray-900">{student.average}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        student.remark === 'Promoted'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {student.remark}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Rankings Available</h3>
          <p className="text-gray-500 mt-1">Compile grades first to see student rankings.</p>
        </div>
      )}
    </div>
  );
};

export default CompilePublishPage;
