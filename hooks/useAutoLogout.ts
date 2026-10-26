"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface AutoLogoutOptions {
  timeoutSeconds?: number;
  warningSeconds?: number;
  onLogout?: () => void;
  enabled?: boolean;
}

export function useAutoLogout({
  timeoutSeconds = 120, // 2 minutes default (easy to test)
  warningSeconds = 30,  // Show warning 30 seconds before logout
  onLogout,
  enabled = true,
}: AutoLogoutOptions = {}) {
  const [secondsRemaining, setSecondsRemaining] = useState(timeoutSeconds);
  const [showWarning, setShowWarning] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  const lastActivityRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger server-side and client-side logout
  const performLogout = useCallback(async () => {
    setIsLoggedOut(true);
    setShowWarning(false);

    try {
      // 1. Tell Next.js API to respond with Clear-Site-Data header
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Logout request failed:", err);
    }

    // 2. Clear client-side application storage
    try {
      localStorage.removeItem("fb_utility_admin_password");
      sessionStorage.clear();
    } catch {
      // Ignore storage access errors
    }

    if (onLogout) {
      onLogout();
    }
  }, [onLogout]);

  // Reset the inactivity timer whenever user interacts
  const resetTimer = useCallback(() => {
    if (isLoggedOut || !enabled) return;
    lastActivityRef.current = Date.now();
    setSecondsRemaining(timeoutSeconds);
    setShowWarning(false);
  }, [isLoggedOut, enabled, timeoutSeconds]);

  // Track user input events
  useEffect(() => {
    if (!enabled || isLoggedOut) return;

    const events = ["mousedown", "mousemove", "keydown", "touchstart", "scroll", "click"];

    let throttleTimer: NodeJS.Timeout | null = null;
    const handleActivity = () => {
      if (!throttleTimer) {
        throttleTimer = setTimeout(() => {
          resetTimer();
          throttleTimer = null;
        }, 1000); // Throttle to run at most once per second for mobile performance
      }
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [enabled, isLoggedOut, resetTimer]);

  // Inactivity countdown interval
  useEffect(() => {
    if (!enabled || isLoggedOut) return;

    timerIntervalRef.current = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      const remaining = Math.max(0, timeoutSeconds - elapsedSeconds);

      setSecondsRemaining(remaining);

      if (remaining <= warningSeconds && remaining > 0) {
        setShowWarning(true);
      } else if (remaining === 0) {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        performLogout();
      }
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [enabled, isLoggedOut, timeoutSeconds, warningSeconds, performLogout]);

  return {
    secondsRemaining,
    showWarning,
    isLoggedOut,
    resetTimer,
    performLogout,
  };
}
