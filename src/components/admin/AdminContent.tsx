"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Smartphone, Monitor, Tablet, RefreshCw, Trash2, LogOut, ShieldOff, ShieldCheck, CheckCircle2, XCircle, Clock, Copy } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Session { id: string; created_at: string; updated_at: string; user_agent: string; ip: string; }
interface User { id: string; email: string; created_at: string; last_sign_in_at: string | null; banned_until: string | null; sessions: Session[]; }
interface AccessRequest { id: string; name: string | null; email: string; message: string | null; status: string; created_at: string; temp_password: string | null; }

function parseDevice(ua: string) {
  const lower = ua.toLowerCase();
  let Icon = Monitor as typeof Smartphone;
  let label = "Computer";
  let os = "Unknown";
  if (lower.includes("iphone")) { Icon = Smartphone; label = "iPhone"; }
  else if (lower.includes("ipad")) { Icon = Tablet; label = "iPad"; }
  else if (lower.includes("android") && lower.includes("mobile")) { Icon = Smartphone; label = "Android Phone"; }
  else if (lower.includes("android")) { Icon = Tablet; label = "Android Tablet"; }
  if (lower.includes("windows")) os = "Windows";
  else if (lower.includes("mac os")) os = "macOS";
  else if (lower.includes("ios") || lower.includes("iphone os")) os = "iOS";
  else if (lower.includes("android")) os = "Android";
  let browser = "";
  if (lower.includes("chrome") && !lower.includes("edg")) browser = "Chrome";
  else if (lower.includes("safari") && !lower.includes("chrome")) browser = "Safari";
  else if (lower.includes("firefox")) browser = "Firefox";
  else if (lower.includes("edg")) browser = "Edge";
  return { Icon, label, detail: browser ? `${os} · ${browser}` : os };
}

function timeAgo(dt: string | null) {
  if (!dt) return "Never";
  try { return formatDistanceToNow(new Date(dt), { addSuffix: true }); } catch { return "—"; }
}

export function AdminContent({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [approvedCreds, setApprovedCreds] = useState<{ email: string; password: string } | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, reqRes] = await Promise.all([
        fetch("/api/admin/users").then((r) => r.json()),
        fetch("/api/admin/requests").then((r) => r.json()),
      ]);
      setUsers(Array.isArray(usersRes) ? usersRes : []);
      setRequests(Array.isArray(reqRes) ? reqRes : []);
    } catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function approveRequest(req: AccessRequest) {
    setBusy(req.id + ":approve");
    try {
      const res = await fetch("/api/admin/approve-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: req.id, email: req.email, name: req.name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setApprovedCreds({ email: req.email, password: data.tempPassword });
      toast.success(`${req.name ?? req.email} approved!`);
      await fetchAll();
    } catch (e: any) { toast.error(e.message ?? "Failed"); }
    finally { setBusy(null); }
  }

  async function denyRequest(requestId: string) {
    setBusy(requestId + ":deny");
    try {
      await fetch("/api/admin/deny-request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestId }) });
      toast.success("Request denied.");
      setRequests((r) => r.map((x) => x.id === requestId ? { ...x, status: "denied" } : x));
    } catch { toast.error("Failed"); }
    finally { setBusy(null); }
  }

  async function signOutUser(userId: string) {
    setBusy(userId + ":signout");
    try {
      await fetch("/api/admin/sign-out-user", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) });
      toast.success("Signed out from all devices.");
      await fetchAll();
    } catch { toast.error("Failed"); }
    finally { setBusy(null); }
  }

  async function restoreUser(userId: string) {
    setBusy(userId + ":restore");
    try {
      await fetch("/api/admin/restore-user", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) });
      toast.success("Access restored.");
      await fetchAll();
    } catch { toast.error("Failed"); }
    finally { setBusy(null); }
  }

  async function deleteUser(userId: string) {
    setBusy(userId + ":delete");
    try {
      await fetch("/api/admin/delete-user", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) });
      toast.success("User deleted.");
      setUsers((u) => u.filter((x) => x.id !== userId));
    } catch { toast.error("Failed"); }
    finally { setBusy(null); setConfirmDelete(null); }
  }

  const isBanned = (u: User) => !!u.banned_until && new Date(u.banned_until) > new Date();
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const pastRequests = requests.filter((r) => r.status !== "pending");

  return (
    <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-brand-dark">Access Management</h2>
          <p className="text-sm text-brand-muted mt-0.5">Approve requests and manage who can use this app</p>
        </div>
        <button onClick={fetchAll} disabled={loading} className="p-2 rounded-lg hover:bg-brand-beige text-brand-muted transition-colors disabled:opacity-40">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Approved credentials modal */}
      {approvedCreds && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
            <p className="text-sm font-semibold text-green-800">Access Approved — Share these credentials</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CredRow label="Email" value={approvedCreds.email} />
            <CredRow label="Temporary Password" value={approvedCreds.password} />
          </div>
          <p className="text-xs text-green-700">Share these via WhatsApp or call. They can change the password after logging in.</p>
          <button onClick={() => setApprovedCreds(null)} className="text-xs text-green-700 underline">Dismiss</button>
        </div>
      )}

      {/* Pending Requests */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-bold text-brand-dark uppercase tracking-wide">Access Requests</h3>
          {pendingRequests.length > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingRequests.length}</span>
          )}
        </div>

        {loading ? (
          <div className="bg-surface rounded-xl border border-brand-border h-20 animate-pulse" />
        ) : pendingRequests.length === 0 ? (
          <div className="bg-surface rounded-xl border border-brand-border px-5 py-6 text-center">
            <p className="text-sm text-brand-muted">No pending requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div key={req.id} className="bg-surface rounded-xl border border-amber-200 shadow-card overflow-hidden">
                <div className="px-5 py-4 flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-sm font-bold text-amber-700 flex-shrink-0">
                      {(req.name ?? req.email)[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brand-dark">{req.name ?? "—"}</p>
                      <p className="text-xs text-brand-muted">{req.email}</p>
                      {req.message && <p className="text-xs text-brand-muted mt-0.5 italic">"{req.message}"</p>}
                      <p className="text-xs text-brand-muted mt-0.5">Requested {timeAgo(req.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => denyRequest(req.id)}
                      disabled={!!busy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      {busy === req.id + ":deny" ? "Denying…" : "Deny"}
                    </button>
                    <button
                      onClick={() => approveRequest(req)}
                      disabled={!!busy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4F46E5] text-white text-xs font-medium hover:bg-[#4338CA] transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {busy === req.id + ":approve" ? "Approving…" : "Approve"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Past requests (collapsed) */}
        {pastRequests.length > 0 && (
          <details className="mt-3">
            <summary className="text-xs text-brand-muted cursor-pointer hover:text-brand-dark select-none">
              Show past requests ({pastRequests.length})
            </summary>
            <div className="mt-2 space-y-2">
              {pastRequests.map((req) => (
                <div key={req.id} className="bg-surface rounded-xl border border-brand-border px-4 py-3 flex items-center gap-3">
                  {req.status === "approved"
                    ? <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    : <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-brand-dark">{req.name ?? req.email}</p>
                    <p className="text-xs text-brand-muted">{req.email} · {req.status} {timeAgo(req.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}
      </section>

      {/* Active Users */}
      <section>
        <h3 className="text-sm font-bold text-brand-dark uppercase tracking-wide mb-3">Active Users</h3>
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="bg-surface rounded-xl border border-brand-border h-24 animate-pulse" />)}
          </div>
        ) : users.length === 0 ? (
          <p className="text-sm text-brand-muted text-center py-8">No users found.</p>
        ) : (
          <div className="space-y-4">
            {users.map((user) => {
              const banned = isBanned(user);
              const isMe = user.id === currentUserId;
              return (
                <div key={user.id} className={`bg-surface rounded-xl border shadow-card overflow-hidden ${banned ? "border-orange-200" : "border-brand-border"}`}>
                  <div className="px-5 py-4 flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${isMe ? "bg-brand-beige text-brand-brown" : "bg-gray-100 text-gray-600"}`}>
                        {user.email?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-brand-dark">{user.email}</p>
                          {isMe && <span className="text-xs bg-brand-beige text-brand-brown px-2 py-0.5 rounded-full font-medium">You</span>}
                          {banned && <span className="text-xs bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><ShieldOff className="h-3 w-3" />Blocked</span>}
                        </div>
                        <p className="text-xs text-brand-muted mt-0.5">Joined {timeAgo(user.created_at)} · Last seen {timeAgo(user.last_sign_in_at)}</p>
                      </div>
                    </div>
                    {!isMe && (
                      <div className="flex items-center gap-2 flex-wrap">
                        {banned ? (
                          <button onClick={() => restoreUser(user.id)} disabled={!!busy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-300 text-green-700 text-xs font-medium hover:bg-green-50 transition-colors disabled:opacity-50">
                            <ShieldCheck className="h-3.5 w-3.5" />{busy === user.id + ":restore" ? "Restoring…" : "Restore Access"}
                          </button>
                        ) : (
                          <button onClick={() => signOutUser(user.id)} disabled={!!busy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orange-200 text-orange-700 text-xs font-medium hover:bg-orange-50 transition-colors disabled:opacity-50">
                            <LogOut className="h-3.5 w-3.5" />{busy === user.id + ":signout" ? "Signing out…" : "Sign Out All Devices"}
                          </button>
                        )}
                        {confirmDelete === user.id ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-red-600 font-medium">Delete permanently?</span>
                            <button onClick={() => setConfirmDelete(null)} className="px-2.5 py-1.5 rounded-lg border border-brand-border text-xs text-brand-muted hover:bg-gray-50">Cancel</button>
                            <button onClick={() => deleteUser(user.id)} disabled={!!busy} className="px-2.5 py-1.5 rounded-lg border border-red-300 text-red-600 text-xs font-medium hover:bg-red-50 disabled:opacity-50">
                              {busy === user.id + ":delete" ? "Deleting…" : "Yes, Delete"}
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDelete(user.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-500 text-xs font-medium hover:bg-red-50 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />Remove
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Sessions */}
                  {user.sessions.length > 0 ? (
                    <div className="border-t border-brand-border bg-brand-beige/40">
                      <p className="px-5 pt-3 pb-1 text-xs font-semibold text-brand-muted uppercase tracking-wide">Active Sessions ({user.sessions.length})</p>
                      <div className="divide-y divide-brand-border">
                        {user.sessions.map((s) => {
                          const { Icon, label, detail } = parseDevice(s.user_agent);
                          return (
                            <div key={s.id} className="px-5 py-2.5 flex items-center gap-3">
                              <Icon className="h-4 w-4 text-brand-muted flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-brand-dark">{label}</p>
                                <p className="text-xs text-brand-muted truncate">{detail}{s.ip ? ` · ${s.ip}` : ""}</p>
                              </div>
                              <p className="text-xs text-brand-muted flex-shrink-0 flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(s.updated_at)}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="border-t border-brand-border px-5 py-2">
                      <p className="text-xs text-brand-muted">No active sessions</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function CredRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div className="bg-white rounded-lg border border-green-200 px-3 py-2 flex items-center justify-between gap-2">
      <div>
        <p className="text-xs text-green-600 font-medium">{label}</p>
        <p className="text-sm font-bold text-green-900 font-mono">{value}</p>
      </div>
      <button onClick={copy} className="p-1.5 rounded hover:bg-green-100 text-green-600 transition-colors flex-shrink-0">
        {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}
