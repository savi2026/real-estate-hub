import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function useRequireAuth() {
  const { session } = useAuth();
  const navigate = useNavigate();

  function requireAuth(action) {
    if (!session) {
      navigate("/register");
      return;
    }
    action();
  }

  return requireAuth;
}