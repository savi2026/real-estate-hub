import { createContext, useContext, useState, useEffect } from "react";

const CompareContext = createContext(null);
const STORAGE_KEY = "compare_property_ids";
const MAX_COMPARE = 3;

export function CompareProvider({ children }) {
  const [ids, setIds] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [ids]);

  function toggle(propertyId) {
    setIds((prev) => {
      if (prev.includes(propertyId)) return prev.filter((id) => id !== propertyId);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, propertyId];
    });
  }

  function clear() {
    setIds([]);
  }

  return (
    <CompareContext.Provider value={{ ids, toggle, clear, maxCompare: MAX_COMPARE }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  return useContext(CompareContext);
}