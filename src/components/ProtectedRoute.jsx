import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute({ children }) {
  const { userId } = useAuthStore();
  if (!userId) return <Navigate to="/login" replace />;
  return children;
}
