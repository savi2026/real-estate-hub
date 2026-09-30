import { useNavigate } from "react-router-dom";
import { useCompare } from "../lib/CompareContext";

export default function CompareBar() {
  const { ids, clear } = useCompare();
  const navigate = useNavigate();

  if (ids.length === 0) return null;

  return (
    <div className="fixed bottom-16 md:bottom-6 left-1/2 -translate-x-1/2 bg-surfaceRaised border border-marigold/40 rounded-full px-5 py-2.5 flex items-center gap-4 shadow-lg z-40">
      <span className="text-sm font-mono">{ids.length} selected</span>
      <button onClick={() => navigate("/compare")} className="text-sm text-marigold font-medium">
        Compare
      </button>
      <button onClick={clear} className="text-xs text-muted hover:text-paper">
        Clear
      </button>
    </div>
  );
}