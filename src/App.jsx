import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import ProfileEditPage from './pages/ProfileEditPage';
import HomePage from './pages/HomePage';
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import MyBidsPage from './pages/MyBidsPage';
import FavouritesPage from './pages/FavouritesPage';
import AddProductPage from './pages/AddProductPage';
import HowItWorksPage from './pages/HowItWorksPage';
import ContactPage from './pages/ContactPage';
import ContestListPage from './pages/ContestListPage';
import ContestDetailPage from './pages/ContestDetailPage';
import CreateContestPage from './pages/CreateContestPage';
import WinnerDrawPage from './pages/WinnerDrawPage';
import TransparencyPage from './pages/TransparencyPage';
import AdminPage from './pages/AdminPage';
import { useAuthStore } from './store/authStore';
import { useFavoritesStore } from './store/favoritesStore';

function AppContent() {
  const { userId } = useAuthStore();
  const { hydrate, clearFavorites } = useFavoritesStore();

  useEffect(() => {
    if (userId) {
      hydrate(userId);
    } else {
      clearFavorites();
    }
  }, [userId, hydrate, clearFavorites]);

  return null;
}

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

      <AppContent />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public */}
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Transparency — fully public */}
            <Route path="/transparency" element={<TransparencyPage />} />
            <Route path="/transparency/:id" element={<TransparencyPage />} />

            {/* Contests — public browse, protected entry */}
            <Route path="/contests" element={<ContestListPage />} />
            <Route
              path="/contests/create"
              element={
                <ProtectedRoute>
                  <CreateContestPage />
                </ProtectedRoute>
              }
            />
            <Route path="/contests/:id" element={<ContestDetailPage />} />
            <Route path="/contests/:id/draw" element={<WinnerDrawPage />} />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />

            {/* Protected user pages */}
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
            <Route
              path="/favourites"
              element={
                <ProtectedRoute>
                  <FavouritesPage />
                </ProtectedRoute>
              }
            />

            {/* Product pages */}
            <Route path="/products/add" element={<AddProductPage />} />

            {/* Home */}
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<Navigate to="/" replace />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
