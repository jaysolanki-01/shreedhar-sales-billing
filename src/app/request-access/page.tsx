"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type State = "form" | "submitting" | "done" | "error";

export default function RequestAccessPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<State>("form");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("submitting");
    const supabase = createClient();
    const { error } = await supabase
      .from("access_requests")
      .insert({ name: name.trim(), email: email.trim().toLowerCase(), message: message.trim() });
    if (error) {
      setErrorMsg(error.message.includes("duplicate") ? "A request for this email already exists." : "Something went wrong. Please try again.");
      setState("error");
    } else {
      setState("done");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F6FB] px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl overflow-hidden mb-3">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xl font-bold text-[#1A1740]">Request Access</h1>
          <p className="text-sm text-[#6B7280] mt-0.5 text-center">Submit your details — the admin will approve your account</p>
        </div>

        {state === "done" ? (
          <div className="bg-white rounded-2xl border border-[#E5E9F5] shadow-sm p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-[#1A1740]">Request Sent!</p>
            <p className="text-xs text-[#6B7280]">The admin will review your request and contact you with your login credentials.</p>
            <Link href="/login" className="block text-xs text-[#4F46E5] hover:underline mt-2">Back to Sign In</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E5E9F5] shadow-sm p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">Your Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Pallav Patel"
                className="w-full h-10 rounded-lg border border-[#E5E9F5] bg-[#F9FAFB] px-3 text-sm text-[#1A1740] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#4F46E5]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-10 rounded-lg border border-[#E5E9F5] bg-[#F9FAFB] px-3 text-sm text-[#1A1740] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#4F46E5]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">Reason <span className="font-normal text-[#9CA3AF]">(optional)</span></label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="I work at Shreedhar Sales..."
                rows={2}
                className="w-full rounded-lg border border-[#E5E9F5] bg-[#F9FAFB] px-3 py-2 text-sm text-[#1A1740] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#4F46E5] resize-none"
              />
            </div>

            {state === "error" && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={state === "submitting"}
              className="w-full h-10 rounded-lg bg-[#4F46E5] text-white text-sm font-semibold hover:bg-[#4338CA] transition-colors disabled:opacity-60"
            >
              {state === "submitting" ? "Sending…" : "Request Access"}
            </button>

            <p className="text-center text-xs text-[#9CA3AF]">
              Already have credentials?{" "}
              <Link href="/login" className="text-[#4F46E5] hover:underline">Sign In</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
