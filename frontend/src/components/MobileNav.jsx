import { Link, useLocation } from "react-router-dom";

const ITEMS = [
  { to: "/", label: "Home" },
  { to: "/browse", label: "Browse" },
  { to: "/requirements", label: "Match" },
  { to: "/saved", label: "Saved" },
];

export default function MobileNav() {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-hairline flex md:hidden z-30">
      {ITEMS.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`flex-1 text-center py-3 text-xs ${
            location.pathname === item.to ? "text-marigold" : "text-muted"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}