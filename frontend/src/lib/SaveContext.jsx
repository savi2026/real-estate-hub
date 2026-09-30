import { createContext, useContext, useState, useEffect } from "react";

const SaveContext = createContext(null);
const STORAGE_KEY = "saved_property_ids";

export function SaveProvider({ children }) {
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
    setIds((prev) => (prev.includes(propertyId) ? prev.filter((id) => id !== propertyId) : [...prev, propertyId]));
  }

  return <SaveContext.Provider value={{ ids, toggle }}>{children}</SaveContext.Provider>;
}

export function useSaved() {
  return useContext(SaveContext);
}