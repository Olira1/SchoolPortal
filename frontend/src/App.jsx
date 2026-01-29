// App.jsx - Main application component with routing
// Sets up AuthProvider, React Router, and DashboardLayout

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { DashboardLayout } from './components/layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles="admin">
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="schools" element={<Dashboard />} />
            <Route path="schools/:id" element={<Dashboard />} />
            <Route path="promotion-criteria" element={<Dashboard />} />
            <Route path="statistics" element={<Dashboard />} />
            <Route path="profile" element={<Dashboard />} />
          </Route>

          {/* School Head Routes */}
          <Route
            path="/school"
            element={
              <ProtectedRoute allowedRoles="school_head">
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="grades" element={<Dashboard />} />
            <Route path="classes" element={<Dashboard />} />
            <Route path="subjects" element={<Dashboard />} />
            <Route path="assessment-types" element={<Dashboard />} />
            <Route path="teachers" element={<Dashboard />} />
            <Route path="assignments" element={<Dashboard />} />
            <Route path="profile" element={<Dashboard />} />
          </Route>

          {/* Teacher Routes */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles="teacher">
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="classes" element={<Dashboard />} />
            <Route path="grades" element={<Dashboard />} />
            <Route path="weights" element={<Dashboard />} />
            <Route path="submissions" element={<Dashboard />} />
            <Route path="profile" element={<Dashboard />} />
          </Route>

          {/* Class Head Routes */}
          <Route
            path="/class-head"
            element={
              <ProtectedRoute allowedRoles="class_head">
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="class" element={<Dashboard />} />
            <Route path="students" element={<Dashboard />} />
            <Route path="grades" element={<Dashboard />} />
            <Route path="submissions" element={<Dashboard />} />
            <Route path="compile" element={<Dashboard />} />
            <Route path="snapshot" element={<Dashboard />} />
            <Route path="roster" element={<Dashboard />} />
            <Route path="profile" element={<Dashboard />} />
          </Route>

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles="student">
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Dashboard />} />
            <Route path="semester-report" element={<Dashboard />} />
            <Route path="year-report" element={<Dashboard />} />
            <Route path="subjects" element={<Dashboard />} />
            <Route path="rank" element={<Dashboard />} />
          </Route>

          {/* Parent Routes */}
          <Route
            path="/parent"
            element={
              <ProtectedRoute allowedRoles="parent">
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="children" element={<Dashboard />} />
            <Route path="children/:id" element={<Dashboard />} />
            <Route path="reports" element={<Dashboard />} />
            <Route path="profile" element={<Dashboard />} />
          </Route>

          {/* Store House Routes */}
          <Route
            path="/store-house"
            element={
              <ProtectedRoute allowedRoles="store_house">
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="rosters" element={<Dashboard />} />
            <Route path="students" element={<Dashboard />} />
            <Route path="records" element={<Dashboard />} />
            <Route path="transcripts" element={<Dashboard />} />
            <Route path="profile" element={<Dashboard />} />
          </Route>

          {/* Legacy dashboard route - redirect based on role */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <RoleRedirect />
              </ProtectedRoute>
            }
          />

          {/* Default Route - Redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 404 - Redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Helper component to redirect to role-specific dashboard
function RoleRedirect() {
  // This is handled by ProtectedRoute already
  return <Navigate to="/login" replace />;
}

export default App;
