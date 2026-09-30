const STYLES = {
  High: "bg-good/15 text-good border-good/40",
  Medium: "bg-marigold/15 text-marigold border-marigold/40",
  Low: "bg-risk/15 text-risk border-risk/40",
};

export default function PriorityBadge({ priority }) {
  if (!priority) return null;
  return (
    <span className={`text-xs font-mono px-2.5 py-1 rounded border ${STYLES[priority] || STYLES.Low}`}>
      {priority} priority
    </span>
  );
}