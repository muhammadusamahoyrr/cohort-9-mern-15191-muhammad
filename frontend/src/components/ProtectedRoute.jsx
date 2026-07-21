import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Spinner from './Spinner';

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  const location = useLocation();

  // Wait for the stored token to be validated, otherwise a refresh on
  // /notes/4 flashes the login screen before bouncing back.
  if (loading) {
    return <Spinner label="Checking your session…" />;
  }

  if (!token) {
    // `state.from` lets Login send the user back where they were headed.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
