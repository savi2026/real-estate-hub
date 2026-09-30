import { useEffect, useState } from "react";
import { api } from "./api";

export function useCategoryImage(category, seed = "") {
  const [image, setImage] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.getCategoryImage(category, seed)
      .then((img) => { if (!cancelled) setImage(img); })
      .catch(() => { if (!cancelled) setImage(null); });
    return () => { cancelled = true; };
  }, [category, seed]);

  return image;
}