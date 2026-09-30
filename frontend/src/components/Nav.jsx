import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

export default function Nav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, profile, signOut } = useAuth();

  const linkClass = (path) =>
    `hover:text-paper transition-colors ${location.pathname === path ? "text-marigold font-medium" : "text-muted"}`;

  return (
    <header className="border-b border-hairline sticky top-0 z-50 bg-ink">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-brand text-xl tracking-tight text-paper">
          Real Estate Hub
        </Link>
        <nav className="hidden md:flex gap-6 text-sm items-center">
          <Link to="/browse" className={linkClass("/browse")}>Browse</Link>
          <Link to="/analytics" className={linkClass("/analytics")}>Market Insights</Link>
          <Link to="/saved" className={linkClass("/saved")}>Saved</Link>
          <button onClick={() => navigate("/requirements")} className={linkClass("/requirements")}>
            Find a Match
          </button>
          {session && (
            <button onClick={signOut} className="text-muted hover:text-paper transition-colors">Sign out</button>
          )}
        </nav>
      </div>
    </header>
  );
}