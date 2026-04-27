import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardHomePage from '../pages/DashboardHomePage';
import NotFoundPage from '../pages/NotFoundPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import ProtectedRoute from './ProtectedRoute';
import { Role } from '../types/user.types';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import ActiveOutsideBookLogPage from '../pages/admin/ActiveOutsideBookLogPage';
import SpineLabelGeneratorPage from '../pages/admin/SpineLabelGeneratorPage';
import AdminReservationsPage from '../pages/admin/AdminReservationsPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';
import AdminCirculationPage from '../pages/admin/AdminCirculationPage';
import AdminBulkToolsPage from '../pages/admin/AdminBulkToolsPage';
import AdminAnalyticsPage from '../pages/admin/AdminAnalyticsPage';
import AdminInventoryAuditPage from '../pages/admin/AdminInventoryAuditPage';
import AdminFineManagementPage from '../pages/admin/AdminFineManagementPage';
import AdminCatalogPage from '../pages/admin/catalog/AdminCatalogPage';
import AdminBookFormPage from '../pages/admin/catalog/AdminBookFormPage';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import MyOutsideBooksPage from '../pages/student/MyOutsideBooksPage';
import OutsideBookEntryForm from '../components/outside-book/OutsideBookEntryForm';
import BookCatalogPage from '../pages/books/BookCatalogPage';
import BookDetailsPage from '../pages/books/BookDetailsPage';
import MyReservationsPage from '../pages/shared/MyReservationsPage';
import MyFinesPage from '../pages/shared/MyFinesPage';

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
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
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
            path="admin/catalog"
            element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><AdminCatalogPage /></ProtectedRoute>}
          />
          <Route
            path="admin/catalog/new"
            element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><AdminBookFormPage /></ProtectedRoute>}
          />
          <Route
            path="admin/catalog/:id/edit"
            element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><AdminBookFormPage /></ProtectedRoute>}
          />
          <Route
            path="outside-book-log"
            element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><ActiveOutsideBookLogPage /></ProtectedRoute>}
          />
          <Route
            path="spine-label-generator"
            element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><SpineLabelGeneratorPage /></ProtectedRoute>}
          />
          <Route
            path="admin/reservations"
            element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><AdminReservationsPage /></ProtectedRoute>}
          />
          <Route
            path="admin/settings"
            element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><AdminSettingsPage /></ProtectedRoute>}
          />
          <Route
            path="admin/circulation"
            element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><AdminCirculationPage /></ProtectedRoute>}
          />
          <Route
            path="admin/bulk-tools"
            element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><AdminBulkToolsPage /></ProtectedRoute>}
          />
          <Route
            path="admin/analytics"
            element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><AdminAnalyticsPage /></ProtectedRoute>}
          />
          <Route
            path="admin/inventory-audit"
            element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><AdminInventoryAuditPage /></ProtectedRoute>}
          />
          <Route
            path="admin/fines"
            element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><AdminFineManagementPage /></ProtectedRoute>}
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
          <Route
            path="student/reservations"
            element={<ProtectedRoute allowedRoles={[Role.STUDENT]}><MyReservationsPage /></ProtectedRoute>}
          />
          <Route
            path="student/fines"
            element={<ProtectedRoute allowedRoles={[Role.STUDENT]}><MyFinesPage /></ProtectedRoute>}
          />
          <Route
            path="books"
            element={<ProtectedRoute allowedRoles={[Role.STUDENT, Role.TEACHER, Role.ADMIN]}><BookCatalogPage /></ProtectedRoute>}
          />
          <Route
            path="books/:id"
            element={<ProtectedRoute allowedRoles={[Role.STUDENT, Role.TEACHER, Role.ADMIN]}><BookDetailsPage /></ProtectedRoute>}
          />

          {/* Teacher Routes */}
          <Route
            path="teacher"
            element={<ProtectedRoute allowedRoles={[Role.TEACHER]}><TeacherDashboard /></ProtectedRoute>}
          />
          <Route
            path="teacher/reservations"
            element={<ProtectedRoute allowedRoles={[Role.TEACHER]}><MyReservationsPage /></ProtectedRoute>}
          />
          <Route
            path="teacher/fines"
            element={<ProtectedRoute allowedRoles={[Role.TEACHER]}><MyFinesPage /></ProtectedRoute>}
          />

        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
