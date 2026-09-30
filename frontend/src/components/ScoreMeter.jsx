function tier(score) {
  if (score >= 80) return { bg: "bg-good/15", text: "text-good", border: "border-good/40" };
  if (score >= 50) return { bg: "bg-marigold/15", text: "text-marigold", border: "border-marigold/40" };
  return { bg: "bg-risk/15", text: "text-risk", border: "border-risk/40" };
}

export default function ScoreMeter({ score }) {
  const t = tier(score);
  return (
    <span className={`inline-flex items-center text-xs font-mono px-2.5 py-1 rounded-full border whitespace-nowrap ${t.bg} ${t.text} ${t.border}`}>
      {score}% Match
    </span>
  );
}