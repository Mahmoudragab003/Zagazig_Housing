
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CompareProvider } from './context/CompareContext';
import { NotificationProvider } from './context/NotificationContext';

// استيراد الصفحات
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/AdminDashboard';
import VendorDashboard from './pages/VendorDashboard';
import ListingDetail from './pages/ListingDetail';
import SearchPage from './pages/SearchPage';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import Messages from './pages/Messages';
import About from './pages/About';
import CompareBar from './components/CompareBar';

/**
 * مكون حماية المسارات
 * يتحقق من صلاحية المستخدم قبل عرض الصفحة
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

/**
 * مسارات التطبيق
 */
function AppRoutes() {
  return (
    <>
      <Routes>
        {/* الصفحات العامة */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/about" element={<About />} />

        {/* لوحة تحكم المدير */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* لوحة تحكم المالك */}
        <Route
          path="/vendor"
          element={
            <ProtectedRoute allowedRoles={['vendor', 'admin']}>
              <VendorDashboard />
            </ProtectedRoute>
          }
        />

        {/* الملف الشخصي */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['student', 'vendor', 'admin']}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* المفضلة */}
        <Route
          path="/favorites"
          element={
            <ProtectedRoute allowedRoles={['student', 'vendor', 'admin']}>
              <Favorites />
            </ProtectedRoute>
          }
        />

        {/* الرسائل */}
        <Route
          path="/messages"
          element={
            <ProtectedRoute allowedRoles={['student', 'vendor', 'admin']}>
              <Messages />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* شريط المقارنة العائم */}
      <CompareBar />
    </>
  );
}

/**
 * المكون الرئيسي للتطبيق
 */
function App() {
  return (
    <Router>
      <ThemeProvider>
        <CompareProvider>
          <AuthProvider>
            <NotificationProvider>
              <AppRoutes />
            </NotificationProvider>
          </AuthProvider>
        </CompareProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
