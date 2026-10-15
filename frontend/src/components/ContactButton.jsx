import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { useRequireAuth } from "../lib/useRequireAuth";
import { api } from "../lib/api";

export default function ContactButton({ propertyId }) {
  const { session } = useAuth();
  const requireAuth = useRequireAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [hasOpen, setHasOpen] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!session) return;
    api.myEnquiryStatus(propertyId).then((res) => setHasOpen(res.has_open_enquiry)).catch(() => {});
  }, [session, propertyId]);

  async function handleSend(e) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      await api.createEnquiry(propertyId, message);
      setHasOpen(true);
      setOpen(false);
      setStatus("idle");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  if (hasOpen) {
    return (
      <button disabled className="px-5 rounded-md border border-good/40 text-good font-medium flex items-center gap-2 opacity-80">
        <MessageCircle size={16} /> Enquiry sent
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => requireAuth(() => setOpen(true))}
        className="px-5 rounded-md border border-hairline text-paper font-medium flex items-center gap-2 hover:border-marigold transition-colors h-full"
      >
        <MessageCircle size={16} /> Contact about this property
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 left-0 w-80 border border-hairline rounded-xl p-4 bg-surface shadow-lg z-10">
          <p className="text-sm text-paper mb-2">Send an enquiry</p>
          <form onSubmit={handleSend} className="space-y-3">
            <textarea
              className="w-full bg-surfaceRaised border border-hairline rounded-md px-3 py-2 text-sm text-paper min-h-[80px] resize-none focus:outline-none focus:border-marigold"
              placeholder="I'm interested in this property..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            {error && <p className="text-risk text-xs">{error}</p>}
            <div className="flex gap-2">
              <button type="submit" disabled={status === "loading"}
                className="flex-1 bg-marigold text-white text-sm font-medium py-2 rounded-md hover:bg-marigoldDim disabled:opacity-50">
                {status === "loading" ? "Sending..." : "Send"}
              </button>
              <button type="button" onClick={() => setOpen(false)} className="text-sm text-muted hover:text-paper px-3">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}