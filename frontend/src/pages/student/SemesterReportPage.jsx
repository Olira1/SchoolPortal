// Semester Report Page - Full report card view
// API: GET /student/reports/semester, GET /student/remarks

import { useState, useEffect } from 'react';
import {
  FileText, RefreshCw, AlertCircle, User, School, Calendar,
  Award, TrendingUp, TrendingDown, MessageSquare
} from 'lucide-react';
import { getSemesterReport, getRemarks } from '../../services/studentService';

const SemesterReportPage = () => {
  const [report, setReport] = useState(null);
  const [remarks, setRemarks] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState('5');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const semesters = [
    { id: '5', name: 'First Semester (2017 E.C)' },
    { id: '6', name: 'Second Semester (2017 E.C)' },
  ];

  useEffect(() => {
    fetchReport();
  }, [selectedSemester]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const [reportRes, remarksRes] = await Promise.all([
        getSemesterReport({ semester_id: parseInt(selectedSemester), academic_year_id: 3 }).catch(() => null),
        getRemarks({ semester_id: parseInt(selectedSemester), academic_year_id: 3 }).catch(() => null),
      ]);

      if (reportRes?.success) {
        setReport(reportRes.data);
      } else {
        setReport(null);
        setError(reportRes?.error?.message || 'Semester report not yet published.');
      }

      if (remarksRes?.success) {
        setRemarks(remarksRes.data);
      }
    } catch (err) {
      setError('Failed to load semester report.');
      console.error(err);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Semester Report</h1>
          <p className="text-gray-500 mt-1">Your complete semester grade report card.</p>
        </div>
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          {semesters.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 text-amber-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {report ? (
        <>
          {/* Student Info */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">{report.student?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <School className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Class</p>
                  <p className="font-medium text-gray-900">{report.student?.grade_name} - {report.student?.class_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Semester</p>
                  <p className="font-medium text-gray-900">{report.semester} ({report.academic_year})</p>
                </div>
              </div>
            </div>
          </div>

          {/* Grade Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Subject Scores</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Subject</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Score</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {report.subjects?.map((subject, idx) => (
                    <tr key={subject.name} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{subject.name}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm font-bold ${subject.score >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                          {subject.score?.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          subject.score >= 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {subject.score >= 50 ? 'Pass' : 'Fail'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-semibold">
                  <tr className="border-t-2 border-gray-300">
                    <td className="px-4 py-3 text-sm" colSpan={2}>Total</td>
                    <td className="px-4 py-3 text-center text-sm text-indigo-700">{report.summary?.total?.toFixed(1)}</td>
                    <td />
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm" colSpan={2}>Average</td>
                    <td className="px-4 py-3 text-center text-sm text-indigo-700">{report.summary?.average?.toFixed(1)}</td>
                    <td />
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm" colSpan={2}>Rank</td>
                    <td className="px-4 py-3 text-center text-sm text-indigo-700">
                      {report.summary?.rank_in_class || '—'} / {report.summary?.total_students}
                    </td>
                    <td />
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm" colSpan={2}>Remark</td>
                    <td className="px-4 py-3 text-center" colSpan={2}>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        report.summary?.remark === 'Promoted'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {report.summary?.remark === 'Promoted'
                          ? <TrendingUp className="w-3 h-3" />
                          : <TrendingDown className="w-3 h-3" />}
                        {report.summary?.remark || 'Pending'}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Teacher Remarks */}
          {remarks && (remarks.class_head_remark || remarks.subject_remarks?.length > 0) && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-gray-400" />
                Teacher's Remarks
              </h2>

              {remarks.class_head_remark && (
                <div className="bg-indigo-50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-indigo-700 mb-1">
                    Class Head: {remarks.class_head_remark.teacher_name}
                  </p>
                  <p className="text-sm text-gray-700">{remarks.class_head_remark.remark}</p>
                </div>
              )}

              {remarks.subject_remarks?.map((r, idx) => (
                <div key={idx} className="border-b border-gray-100 last:border-0 py-3">
                  <p className="text-sm font-medium text-gray-900">{r.subject_name}</p>
                  <p className="text-xs text-gray-500">{r.teacher_name}</p>
                  <p className="text-sm text-gray-700 mt-1">{r.remark}</p>
                </div>
              ))}
            </div>
          )}
        </>
      ) : !error ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3" />
          <p className="text-lg font-medium text-gray-900">No Report Available</p>
          <p className="text-sm mt-1">Your semester report will appear here once results are published.</p>
        </div>
      ) : null}
    </div>
  );
};

export default SemesterReportPage;
