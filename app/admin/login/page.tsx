"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Email atau password salah");
      setLoading(false);
    } else {
      router.push("/admin/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <span className="inline-grid h-12 w-12 place-items-center rounded-full bg-rose-700 font-serif text-xl text-white">
            S
          </span>
          <h1 className="mt-4 font-serif text-2xl font-semibold text-stone-900">
            Sinar Jaya — Panel Owner
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Masuk untuk mengelola toko.
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="mt-8 space-y-4 rounded-2xl bg-white p-6 ring-1 ring-stone-100"
        >
          <div>
            <label className="mb-1.5 block text-xs font-medium text-stone-600">
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
            <label className="mb-1.5 block text-xs font-medium text-stone-600">
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

        <p className="mt-6 text-center text-xs text-stone-400">
          ← Kembali ke{" "}
          <a href="/" className="text-stone-600 hover:underline">
            beranda
          </a>
        </p>
      </div>
    </div>
  );
}
