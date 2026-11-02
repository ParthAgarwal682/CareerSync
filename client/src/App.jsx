import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import GoogleCallback from './pages/GoogleCallback';
import GoogleSignupComplete from './pages/GoogleSignupComplete';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import BrowseJobs from './pages/student/BrowseJobs';
import JobDetail from './pages/student/JobDetail';
import MyApplications from './pages/student/MyApplications';
import Profile from './pages/student/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageCompanies from './pages/admin/ManageCompanies';
import ManageJobs from './pages/admin/ManageJobs';
import ManageApplications from './pages/admin/ManageApplications';
import ManageRounds from './pages/admin/ManageRounds';
import StudentDirectory from './pages/admin/StudentDirectory';
import Analytics from './pages/admin/Analytics';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
          <Route path="/auth/complete-signup" element={<GoogleSignupComplete />} />

          {/* Student Routes */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['Student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/student/jobs" element={
            <ProtectedRoute allowedRoles={['Student']}>
              <BrowseJobs />
            </ProtectedRoute>
          } />

          <Route path="/student/jobs/:id" element={
            <ProtectedRoute allowedRoles={['Student']}>
              <JobDetail />
            </ProtectedRoute>
          } />
          
          <Route path="/student/applications" element={
            <ProtectedRoute allowedRoles={['Student']}>
              <MyApplications />
            </ProtectedRoute>
          } />

          <Route path="/student/profile" element={
            <ProtectedRoute allowedRoles={['Student']}>
              <Profile />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/companies" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <ManageCompanies />
            </ProtectedRoute>
          } />

          <Route path="/admin/jobs" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <ManageJobs />
            </ProtectedRoute>
          } />

          <Route path="/admin/applications" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <ManageApplications />
            </ProtectedRoute>
          } />

          <Route path="/admin/rounds" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <ManageRounds />
            </ProtectedRoute>
          } />

          <Route path="/admin/students" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <StudentDirectory />
            </ProtectedRoute>
          } />

          <Route path="/admin/analytics" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <Analytics />
            </ProtectedRoute>
          } />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
