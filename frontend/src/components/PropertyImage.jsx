import { useEffect, useState } from "react";
import { api } from "../lib/api";
import ArchIllustration from "./ArchIllustration";

export default function PropertyImage({ category, seed = "", illustrationVariant = "apartment", className = "" }) {
  const [image, setImage] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setImage(null);
    setFailed(false);
    api.getCategoryImage(category, seed)
      .then(setImage)
      .catch(() => setFailed(true));
  }, [category, seed]);

  // Only add "relative" if the caller hasn't already chosen a position,
  // otherwise the two classes fight and "relative" wins.
  const hasPosition = /\b(absolute|fixed|sticky|relative)\b/.test(className);
  const positionClass = hasPosition ? "" : "relative";

  if (failed || !image) {
    return (
      <div className={`${positionClass} bg-gradient-to-br from-indigo-500/20 to-purple-500/20 ${className}`}>
        <ArchIllustration variant={illustrationVariant} className="absolute inset-0 w-full h-full text-marigold opacity-60" />
      </div>
    );
  }

  return (
    <div className={`${positionClass} ${className}`}>
      <img src={image.url} alt={`Representative ${category}`} className="w-full h-full object-cover" />
      <span className="absolute bottom-1 right-2 text-[9px] text-white/70 bg-black/30 px-1.5 py-0.5 rounded">
        Representative image · Pexels
      </span>
    </div>
  );
}