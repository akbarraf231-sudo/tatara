"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLoginWidget() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError("Email atau password salah");
      setLoading(false);
    } else {
      router.push("/admin/dashboard");
      router.refresh();
    }
  }

  return (
    <>
      {/* Floating button bottom-right */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Login Admin"
        title="Login Admin"
        className="fixed bottom-4 right-4 z-40 grid h-12 w-12 place-items-center rounded-full bg-stone-900 text-white shadow-lg transition hover:bg-rose-700 hover:scale-105"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center px-4">
          <div
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <button
              onClick={() => setOpen(false)}
              aria-label="Tutup"
              className="absolute right-4 top-4 rounded-full p-1.5 text-stone-400 hover:bg-stone-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>

            <div className="text-center">
              <span className="inline-grid h-11 w-11 place-items-center rounded-full bg-rose-700 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <h2 className="mt-3 font-serif text-xl font-semibold text-stone-900">
                Login Admin
              </h2>
              <p className="mt-1 text-xs text-stone-500">
                Khusus untuk owner toko
              </p>
            </div>

            <form onSubmit={handleLogin} className="mt-6 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-700">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="email@anda.com"
                  className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:border-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-700/15"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-700">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:border-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-700/15"
                />
              </div>

              {error && (
                <p className="rounded-xl bg-rose-50 px-3 py-2 text-center text-sm text-rose-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-rose-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:opacity-60"
              >
                {loading ? "Masuk..." : "Masuk"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
