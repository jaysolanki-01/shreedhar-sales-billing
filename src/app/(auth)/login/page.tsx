"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
      } else {
        router.push("/");
        router.refresh();
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        toast.error(error.message);
      } else if (data.session) {
        // Email confirmation is disabled — logged in immediately
        router.push("/");
        router.refresh();
      } else {
        // Email confirmation required
        toast.success("Check your email and click the confirmation link, then sign in.");
        setMode("login");
      }
    }
    setLoading(false);
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo / Brand */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-brand-dark flex items-center justify-center mx-auto mb-4 overflow-hidden">
          <img
            src="/logo.png"
            alt="Shreedhar Sales"
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.parentElement!.innerHTML = '<span class="text-brand-gold font-bold text-xl">SS</span>';
            }}
          />
        </div>
        <h1 className="text-2xl font-bold text-brand-dark">Shreedhar Sales</h1>
        <p className="text-sm text-brand-muted mt-1">Billing & Quotation Management</p>
      </div>

      <div className="bg-surface rounded-2xl border border-brand-border shadow-card p-8">
        <h2 className="text-base font-semibold text-brand-dark mb-6">
          {mode === "login" ? "Sign in to your account" : "Create your account"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
            {mode === "login" ? "Sign In" : "Create Account"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-sm text-brand-brown hover:text-brand-dark underline"
          >
            {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
