import { useState, useEffect } from "react";
import { getLocalArray, setLocalArray } from "../utils/localStorage";

/**
 * Hook for managing array-based localStorage state
 */
export function useLocalStorage(key, initialValue = []) {
  const [value, setValue] = useState(() => getLocalArray(key) || initialValue);

  useEffect(() => {
    setLocalArray(key, value);
  }, [key, value]);

  // Sync across tabs
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === key && e.newValue) {
        try {
          const newValue = JSON.parse(e.newValue);
          if (Array.isArray(newValue)) {
            setValue(newValue);
          }
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  return [value, setValue];
}