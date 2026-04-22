import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import ProfileEditPage from './pages/ProfileEditPage';
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import MyBidsPage from './pages/MyBidsPage';
import HowItWorksPage from './pages/HowItWorksPage';
import ContactPage from './pages/ContactPage';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '12px',
            background: '#1e1e2e',
            color: '#fff',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />

      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public */}
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected */}
            <Route
              path="/profile/setup"
              element={
                <ProtectedRoute>
                  <ProfileSetupPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/edit"
              element={
                <ProtectedRoute>
                  <ProfileEditPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-bids"
              element={
                <ProtectedRoute>
                  <MyBidsPage />
                </ProtectedRoute>
              }
            />

            {/* Public info pages */}
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Product pages — public (bidding requires auth) */}
            <Route path="/" element={<ProductListingPage />} />
            <Route path="/products" element={<Navigate to="/" replace />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />

            {/* 404 fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
