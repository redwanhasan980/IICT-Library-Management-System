import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardHomePage from '../pages/DashboardHomePage';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from './ProtectedRoute';
import { Role } from '../types/user.types';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import ActiveOutsideBookLogPage from '../pages/admin/ActiveOutsideBookLogPage';
import SpineLabelGeneratorPage from '../pages/admin/SpineLabelGeneratorPage';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import MyOutsideBooksPage from '../pages/student/MyOutsideBooksPage';
import OutsideBookEntryForm from '../components/outside-book/OutsideBookEntryForm';

// Teacher Pages
import TeacherDashboard from '../pages/teacher/TeacherDashboard';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHomePage />} />

          {/* Admin Routes */}
          <Route
            path="admin"
            element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><AdminDashboard /></ProtectedRoute>}
          />
          <Route
            path="outside-book-log"
            element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><ActiveOutsideBookLogPage /></ProtectedRoute>}
          />
          <Route
            path="spine-label-generator"
            element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><SpineLabelGeneratorPage /></ProtectedRoute>}
          />

          {/* Student Routes */}
          <Route
            path="student"
            element={<ProtectedRoute allowedRoles={[Role.STUDENT]}><StudentDashboard /></ProtectedRoute>}
          />
           <Route
            path="my-outside-books"
            element={<ProtectedRoute allowedRoles={[Role.STUDENT]}><MyOutsideBooksPage /></ProtectedRoute>}
          />
           <Route
            path="add-outside-book"
            element={<ProtectedRoute allowedRoles={[Role.STUDENT]}><OutsideBookEntryForm /></ProtectedRoute>}
          />

          {/* Teacher Routes */}
          <Route
            path="teacher"
            element={<ProtectedRoute allowedRoles={[Role.TEACHER]}><TeacherDashboard /></ProtectedRoute>}
          />

        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
