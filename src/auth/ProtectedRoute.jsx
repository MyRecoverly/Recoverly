import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null; // or spinner
  return user ? children : <Navigate to="/login" replace />;
}
