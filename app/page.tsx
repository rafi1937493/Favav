"use client";

import { useState, useEffect } from "react";
import {
  LogOut,
  Search,
  KeyRound,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
  UserCheck,
  Clock,
  RefreshCw,
  Lock,
} from "lucide-react";
import { useAutoLogout } from "@/hooks/useAutoLogout";

interface FacebookProfile {
  id: string;
  name?: string;
  username?: string;
  link?: string;
}

export default function Home() {
  const [password, setPassword] = useState("");
  const [rememberPassword, setRememberPassword] = useState(true);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [profile, setProfile] = useState<FacebookProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-logout hook: 2-minute inactivity timeout, 30-second warning
  const { secondsRemaining, showWarning, isLoggedOut, resetTimer, performLogout } =
    useAutoLogout({
      timeoutSeconds: 120, // 2 minutes
      warningSeconds: 30,
      onLogout: () => {
        setPassword("");
        setProfile(null);
        setError("Your session was closed due to inactivity for security.");
      },
    });

  // Load saved password on initial mount
  useEffect(() => {
    const saved = localStorage.getItem("fb_utility_admin_password");
    if (saved) {
      setPassword(saved);
    }
  }, []);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) return;

    if (rememberPassword && password) {
      localStorage.setItem("fb_utility_admin_password", password);
    }

    setLoading(true);
    setError(null);
    setProfile(null);

    try {
      const res = await fetch("/api/lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-utility-password": password.trim(),
        },
        body: JSON.stringify({ userId: userId.trim() }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Lookup failed.");
      } else if (data.profile) {
        setProfile(data.profile);
      }
    } catch {
      setError("Network connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Format seconds into mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <main className="w-full max-w-lg mx-auto px-4 py-6 sm:py-10 flex flex-col gap-5">
      {/* Security Status Header */}
      <div className="flex items-center justify-between bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs text-xs">
        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          Auto-Logout:
          <span className="font-mono font-bold text-slate-900">
            {isLoggedOut ? "Logged out" : formatTime(secondsRemaining)}
          </span>
        </div>

        {!isLoggedOut ? (
          <button
            onClick={() => performLogout()}
            className="text-red-600 hover:text-red-700 font-medium text-xs flex items-center gap-1"
          >
            <LogOut className="w-3 h-3" />
            Lock Now
          </button>
        ) : (
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-700 font-medium text-xs flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Reconnect
          </button>
        )}
      </div>

      {/* Inactivity Warning Banner */}
      {showWarning && !isLoggedOut && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Auto-logging out in <strong>{secondsRemaining}s</strong> due to inactivity.
            </span>
          </div>
          <button
            onClick={resetTimer}
            className="bg-amber-600 text-white px-2.5 py-1 rounded-lg text-xs font-semibold hover:bg-amber-700 transition"
          >
            Stay Active
          </button>
        </div>
      )}

      {/* Logged Out Overlay / Notice */}
      {isLoggedOut ? (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs text-center space-y-4">
          <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">Session Locked</h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Your session was automatically wiped for security using the HTTP Clear-Site-Data standard.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-colors shadow-2xs"
          >
            Unlock / Start New Session
          </button>
        </div>
      ) : (
        <>
          {/* Header */}
          <header className="text-center space-y-1.5">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-2xl shadow-2xs mb-1">
              <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Facebook Utility
            </h1>
            <p className="text-xs text-slate-600">
              Official logout shortcut and Meta Graph API ID lookup.
            </p>
          </header>

          {/* Feature 1: Official Facebook Logout */}
          <section className="bg-white rounded-2xl p-5 shadow-2xs border border-slate-200">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <LogOut className="w-4 h-4 text-red-500" />
              Official Facebook Logout
            </h2>
            <p className="text-xs text-slate-500 mt-1 mb-3">
              Direct official shortcut to terminate your Facebook browser session.
            </p>
            <a
              href="https://m.facebook.com/logout.php"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2.5 px-4 rounded-xl border border-red-200 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              Open Facebook Logout Page
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </section>

          {/* Feature 2: Meta Graph API User ID Lookup */}
          <section className="bg-white rounded-2xl p-5 shadow-2xs border border-slate-200 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-600" />
                Numeric User ID Lookup
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Query profile details via Meta Graph API using your utility password.
              </p>
            </div>

            <form onSubmit={handleLookup} className="space-y-3">
              <div>
                <label
                  htmlFor="pass"
                  className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1"
                >
                  <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                  Utility Password
                </label>
                <input
                  id="pass"
                  type="password"
                  placeholder="Enter ADMIN_PASSWORD"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="uid"
                  className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1"
                >
                  <Search className="w-3.5 h-3.5 text-slate-500" />
                  Numeric Facebook User ID
                </label>
                <input
                  id="uid"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="e.g. 4"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50 focus:bg-white"
                  required
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberPassword}
                  onChange={(e) => setRememberPassword(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <label htmlFor="remember">Remember password on this device</label>
              </div>

              <button
                type="submit"
                disabled={loading || !userId.trim()}
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2.5 px-4 rounded-xl transition-colors text-sm shadow-2xs"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Querying Meta API...
                  </span>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Query Profile
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Notice</p>
                  <p className="mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {profile && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
                      Profile Found
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(profile.id)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-emerald-300 rounded text-emerald-800 text-xs font-medium hover:bg-emerald-100"
                  >
                    {copiedId ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy ID
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-white/80 rounded-lg p-2.5 space-y-1.5 text-xs border border-emerald-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">ID:</span>
                    <span className="font-mono font-bold text-slate-900">{profile.id}</span>
                  </div>
                  {profile.name && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Name:</span>
                      <span className="font-semibold text-slate-800">{profile.name}</span>
                    </div>
                  )}
                  {profile.username && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Username:</span>
                      <span className="text-slate-800">{profile.username}</span>
                    </div>
                  )}
                  {profile.link && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Link:</span>
                      <a
                        href={profile.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        View Profile <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Security & Disclaimer */}
          <section className="bg-slate-100 rounded-2xl p-3.5 border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Safety & Inactivity Protection
            </div>
            <p>
              Equipped with automatic idle session termination and official Meta Graph API query protection.
            </p>
          </section>
        </>
      )}

      <footer className="text-center text-xs text-slate-400 py-1">
        Facebook is a registered trademark of Meta Platforms, Inc.
      </footer>
    </main>
  );
}
