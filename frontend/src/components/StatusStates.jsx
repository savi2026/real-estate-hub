export function LoadingState({ label = "Searching real listings…" }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-muted">
      <div className="w-8 h-8 border-2 border-hairline border-t-marigold rounded-full animate-spin mb-4" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="border border-risk/40 bg-risk/10 rounded-md p-6 text-center">
      <p className="text-paper mb-1">Something went wrong</p>
      <p className="text-sm text-muted mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm px-4 py-2 border border-hairline rounded hover:border-marigold transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, message }) {
  return (
    <div className="border border-hairline rounded-md p-10 text-center">
      <p className="font-serif text-xl mb-2">{title}</p>
      <p className="text-sm text-muted max-w-sm mx-auto">{message}</p>
    </div>
  );
}