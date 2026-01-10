import { useState, useCallback, useRef } from "react";

/**
 * Hook for managing toast notifications
 */
export function useToast() {
  const [toastMsg, setToastMsg] = useState("");
  const toastTimerRef = useRef(null);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => setToastMsg(""), 1400);
  }, []);

  return [toastMsg, showToast];
}