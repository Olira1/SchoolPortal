// Navigation Configuration
// Role-based sidebar navigation items
// Only includes features that have API endpoints

import {
  LayoutDashboard,
  Building2,
  GraduationCap,
  Users,
  BookOpen,
  ClipboardList,
  FileText,
  UserCheck,
  BarChart3,
  Settings,
  School,
  Award,
  Calendar,
  CheckSquare,
  Send,
  Eye,
  Archive,
  FileSpreadsheet,
} from 'lucide-react';

/**
 * Navigation items for each role
 * Based strictly on available API endpoints
 */
export const navigationConfig = {
  // Admin Navigation
  admin: [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: LayoutDashboard,
    },
    {
      name: 'Schools',
      path: '/admin/schools',
      icon: Building2,
    },
    {
      name: 'Promotion Criteria',
      path: '/admin/promotion-criteria',
      icon: Award,
    },
    {
      name: 'Statistics',
      path: '/admin/statistics',
      icon: BarChart3,
    },
  ],

  // School Head Navigation
  school_head: [
    {
      name: 'Dashboard',
      path: '/school',
      icon: LayoutDashboard,
    },
    {
      name: 'Grades',
      path: '/school/grades',
      icon: GraduationCap,
    },
    {
      name: 'Classes',
      path: '/school/classes',
      icon: School,
    },
    {
      name: 'Subjects',
      path: '/school/subjects',
      icon: BookOpen,
    },
    {
      name: 'Assessment Types',
      path: '/school/assessment-types',
      icon: ClipboardList,
    },
    {
      name: 'Teachers',
      path: '/school/teachers',
      icon: Users,
    },
    {
      name: 'Assignments',
      path: '/school/assignments',
      icon: UserCheck,
    },
  ],

  // Teacher Navigation
  teacher: [
    {
      name: 'Dashboard',
      path: '/teacher',
      icon: LayoutDashboard,
    },
    {
      name: 'My Classes',
      path: '/teacher/classes',
      icon: School,
    },
    {
      name: 'Grade Entry',
      path: '/teacher/grades',
      icon: FileText,
    },
    {
      name: 'Assessment Weights',
      path: '/teacher/weights',
      icon: Settings,
    },
    {
      name: 'Submissions',
      path: '/teacher/submissions',
      icon: Send,
    },
  ],

  // Class Head Navigation (same as teacher + class head features)
  class_head: [
    {
      name: 'Dashboard',
      path: '/class-head',
      icon: LayoutDashboard,
    },
    {
      name: 'My Class',
      path: '/class-head/class',
      icon: School,
    },
    {
      name: 'Students',
      path: '/class-head/students',
      icon: Users,
    },
    {
      name: 'Grade Entry',
      path: '/class-head/grades',
      icon: FileText,
    },
    {
      name: 'Review Submissions',
      path: '/class-head/submissions',
      icon: CheckSquare,
    },
    {
      name: 'Compile & Publish',
      path: '/class-head/compile',
      icon: Send,
    },
    {
      name: 'Class Snapshot',
      path: '/class-head/snapshot',
      icon: BarChart3,
    },
    {
      name: 'Send Roster',
      path: '/class-head/roster',
      icon: Archive,
    },
  ],

  // Student Navigation
  student: [
    {
      name: 'Dashboard',
      path: '/student',
      icon: LayoutDashboard,
    },
    {
      name: 'My Profile',
      path: '/student/profile',
      icon: Users,
    },
    {
      name: 'Semester Report',
      path: '/student/semester-report',
      icon: FileText,
    },
    {
      name: 'Year Report',
      path: '/student/year-report',
      icon: FileSpreadsheet,
    },
    {
      name: 'Subject Grades',
      path: '/student/subjects',
      icon: BookOpen,
    },
    {
      name: 'My Rank',
      path: '/student/rank',
      icon: Award,
    },
  ],

  // Parent Navigation
  parent: [
    {
      name: 'Dashboard',
      path: '/parent',
      icon: LayoutDashboard,
    },
    {
      name: 'My Children',
      path: '/parent/children',
      icon: Users,
    },
    {
      name: 'Reports',
      path: '/parent/reports',
      icon: FileText,
    },
  ],

  // Store House Navigation
  store_house: [
    {
      name: 'Dashboard',
      path: '/store-house',
      icon: LayoutDashboard,
    },
    {
      name: 'Rosters',
      path: '/store-house/rosters',
      icon: Archive,
    },
    {
      name: 'Student Search',
      path: '/store-house/students',
      icon: Users,
    },
    {
      name: 'Cumulative Records',
      path: '/store-house/records',
      icon: FileSpreadsheet,
    },
    {
      name: 'Transcripts',
      path: '/store-house/transcripts',
      icon: FileText,
    },
  ],
};

/**
 * Get navigation items for a specific role
 * @param {string} role - User role
 * @returns {Array} Navigation items
 */
export const getNavigationForRole = (role) => {
  return navigationConfig[role] || [];
};

/**
 * Role display names
 */
export const roleDisplayNames = {
  admin: 'Administrator',
  school_head: 'School Head',
  teacher: 'Teacher',
  class_head: 'Class Head',
  student: 'Student',
  parent: 'Parent',
  store_house: 'Store House',
};

export default navigationConfig;

