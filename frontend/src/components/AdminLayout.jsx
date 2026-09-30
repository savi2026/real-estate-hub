import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

const ITEMS = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/add", label: "Add Property" },
  { to: "/admin/users", label: "User Details" },
  { to: "/admin/team", label: "Team" },
];

export default function AdminLayout({ children }) {
  const location = useLocation();
  const { signOut, profile } = useAuth();

  return (
    <div className="h-screen flex bg-ink overflow-hidden">
      <aside className="w-56 border-r border-hairline p-6 flex flex-col shrink-0 h-screen">
        <p className="font-brand text-xl mb-1">Real Estate Hub</p>
        <p className="text-xs text-muted font-mono mb-10">Admin Panel</p>

        <nav className="space-y-1 flex-1">
          {ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`block px-3 py-2 rounded-md text-sm ${
                location.pathname === item.to ? "bg-marigold/10 text-marigold" : "text-muted hover:text-paper"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-hairline pt-4 mt-4">
          <p className="text-xs text-muted mb-2 truncate">{profile?.email}</p>
          <button onClick={signOut} className="text-sm text-muted hover:text-paper">Sign out</button>
        </div>
      </aside>

      <main className="flex-1 h-screen overflow-y-auto">{children}</main>
    </div>
  );
}