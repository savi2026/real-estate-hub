import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { api } from "./api";

const SaveContext = createContext(null);

export function SaveProvider({ children }) {
  const { session } = useAuth();
  const [ids, setIds] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!session) {
      setIds([]);
      setLoaded(true);
      return;
    }
    setLoaded(false);
    api.listSaved()
      .then(setIds)
      .catch(() => setIds([]))
      .finally(() => setLoaded(true));
  }, [session]);

  async function toggle(propertyId) {
    if (!session) return; // guarded by useRequireAuth before this is ever called
    const previous = ids;
    const isCurrentlySaved = ids.includes(propertyId);
    setIds(isCurrentlySaved ? ids.filter((id) => id !== propertyId) : [...ids, propertyId]);
    try {
      await api.toggleSaved(propertyId);
    } catch {
      setIds(previous); // roll back on failure
    }
  }

  return <SaveContext.Provider value={{ ids, toggle, loaded }}>{children}</SaveContext.Provider>;
}

export function useSaved() {
  return useContext(SaveContext);
}