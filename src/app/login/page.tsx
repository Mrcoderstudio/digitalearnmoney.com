"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/common/Logo";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        identifier: identifier.trim(),  // ✅ MATCH with auth.ts
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/auth/session");
      const sessionData = await res.json();

      if (sessionData?.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err) {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col justify-center py-12 px-4">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <Logo size="lg" />
          <h2 className="mt-4 text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-sm text-slate-400">Sign in to your account</p>
        </div>

        <div className="bg-[#0f213d] p-8 rounded-2xl border border-[#1e3a66]">
          {error && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-sm text-red-300 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Email or Username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#0a1628] border border-[#1e3a66] text-white placeholder-slate-500 focus:border-[#00D4FF] focus:outline-none"
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#0a1628] border border-[#1e3a66] text-white placeholder-slate-500 focus:border-[#00D4FF] focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00D4FF] to-cyan-400 text-[#0a1628] font-bold hover:brightness-110 transition disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <Link href="/register" className="text-[#00D4FF] hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}