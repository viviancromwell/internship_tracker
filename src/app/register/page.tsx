"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { UserPlus, Palette, Scale } from "lucide-react";
import strideIcon from "@/assets/icons/stride-icon.png";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [field, setField] = useState<"design" | "polisci" | "">("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!field) {
      setError("Please select your field of study");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, field }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created but sign-in failed. Please go to login.");
        setLoading(false);
      } else {
        window.location.href = "/internships";
      }
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4">
            <Image src={strideIcon} alt="Stride" width={56} height={56} />
          </div>
          <h1 className="text-3xl font-bold text-charcoal">Join Stride</h1>
          <p className="text-muted mt-2">
            Find your next step
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-neutral-50 rounded-2xl shadow-lg border border-tan p-8 space-y-5"
        >
          {error && (
            <div className="bg-destructive-50 border border-destructive-200 text-destructive-700 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={4}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="At least 4 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-3">
              Field of Study
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setField("design")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  field === "design"
                    ? "border-primary bg-primary/10"
                    : "border-neutral-200 hover:border-accent"
                }`}
              >
                <Palette
                  className={`w-6 h-6 mb-2 ${field === "design" ? "text-primary" : "text-neutral-400"}`}
                />
                <div className="font-semibold text-sm text-neutral-900">
                  Design & Arts
                </div>
                <div className="text-xs text-muted mt-1">
                  Creative, UX, Animation
                </div>
              </button>
              <button
                type="button"
                onClick={() => setField("polisci")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  field === "polisci"
                    ? "border-primary bg-primary/10"
                    : "border-neutral-200 hover:border-accent"
                }`}
              >
                <Scale
                  className={`w-6 h-6 mb-2 ${field === "polisci" ? "text-primary" : "text-neutral-400"}`}
                />
                <div className="font-semibold text-sm text-neutral-900">
                  Political Science
                </div>
                <div className="text-xs text-muted mt-1">
                  Gov, Law, Policy
                </div>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !field}
            className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              "Creating account..."
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Create Account
              </>
            )}
          </button>

          <p className="text-center text-sm text-muted">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
