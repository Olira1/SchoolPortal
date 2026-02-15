// Send Roster Page - Class Head Portal
// Allows the class head to send the final class roster data to the store house
// The roster includes all students with their subject scores, totals, averages, ranks
// API: POST /api/v1/class-head/store-house/send-roster

import { useState } from 'react';
import {
  Archive,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ChevronDown,
  Send,
  AlertTriangle,
  FileText,
  Users,
  BarChart3,
  Database,
} from 'lucide-react';
import { sendRosterToStoreHouse } from '../../services/classHeadService';

const SendRosterPage = () => {
  // State: selections
  const [selectedSemesterId, setSelectedSemesterId] = useState('5');
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState('3');

  // State: UI
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Handle send roster
  const handleSendRoster = async () => {
    if (!window.confirm(
      'Are you sure you want to send the roster to the store house? ' +
      'This will transfer all student data including scores, totals, averages, and ranks.'
    )) {
      return;
    }

    try {
      setSending(true);
      setError(null);
      setResult(null);

      const response = await sendRosterToStoreHouse({
        semester_id: parseInt(selectedSemesterId),
        academic_year_id: parseInt(selectedAcademicYearId),
      });

      if (response.success) {
        setResult(response.data);
      }
    } catch (err) {
      console.error('Error sending roster:', err);
      const errorData = err.response?.data?.error;
      setError(typeof errorData === 'object' ? errorData.message : errorData || 'Failed to send roster');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Send Roster to Store House</h1>
        <p className="text-gray-500 mt-1">
          Transfer the final class roster with all academic records to the store house for permanent archiving.
        </p>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <Database className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">What gets sent?</h2>
            <p className="text-sm text-gray-500 mt-1">
              The roster includes the following data for each student in your class:
            </p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4 text-indigo-500" />
                Student name, ID, sex, and age
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BarChart3 className="w-4 h-4 text-indigo-500" />
                All subject scores (combined/weighted)
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="w-4 h-4 text-indigo-500" />
                Total, average, and rank
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                Conduct, absent days, and promotion remark
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Semester & Year Selectors */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Select Period</h3>
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

      {/* Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-700">
          <p className="font-medium">Before sending the roster</p>
          <ul className="mt-1 list-disc list-inside space-y-1">
            <li>Ensure all grades have been compiled (total, average, rank calculated)</li>
            <li>Verify that semester results have been published</li>
            <li>Double-check student data for accuracy</li>
            <li>The store house will receive this data for permanent record keeping</li>
          </ul>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Success Result */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
            <div>
              <h3 className="text-lg font-semibold text-green-800">Roster Sent Successfully!</h3>
              <p className="text-sm text-green-600">The store house has received the class roster data.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-500">Class</p>
              <p className="text-sm font-medium text-gray-900">{result.class_name || '—'}</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-500">Students Transferred</p>
              <p className="text-sm font-medium text-gray-900">{result.students_count || 0}</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-500">Sent At</p>
              <p className="text-sm font-medium text-gray-900">
                {result.sent_at ? new Date(result.sent_at).toLocaleString() : '—'}
              </p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-500">Status</p>
              <p className="text-sm font-medium text-green-600">Complete</p>
            </div>
          </div>
        </div>
      )}

      {/* Send Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSendRoster}
          disabled={sending}
          className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-50 text-lg font-medium shadow-lg shadow-indigo-200"
        >
          {sending ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Send className="w-6 h-6" />
          )}
          {sending ? 'Sending Roster...' : 'Send Roster to Store House'}
        </button>
      </div>
    </div>
  );
};

export default SendRosterPage;
