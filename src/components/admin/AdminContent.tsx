"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Smartphone, Monitor, Tablet, Globe, RefreshCw, Trash2, LogOut, ShieldOff, ShieldCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Session {
  id: string;
  created_at: string;
  updated_at: string;
  user_agent: string;
  ip: string;
}

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  banned_until: string | null;
  sessions: Session[];
}

function parseDevice(ua: string): { icon: typeof Smartphone; label: string; os: string } {
  const lower = ua.toLowerCase();
  let icon = Monitor as typeof Smartphone;
  let label = "Desktop";
  let os = "Unknown OS";

  if (lower.includes("iphone")) { icon = Smartphone; label = "iPhone"; }
  else if (lower.includes("ipad")) { icon = Tablet; label = "iPad"; }
  else if (lower.includes("android") && lower.includes("mobile")) { icon = Smartphone; label = "Android Phone"; }
  else if (lower.includes("android")) { icon = Tablet; label = "Android Tablet"; }
  else { icon = Monitor; label = "Computer"; }

  if (lower.includes("windows")) os = "Windows";
  else if (lower.includes("mac os")) os = "macOS";
  else if (lower.includes("iphone os") || lower.includes("ios")) os = "iOS";
  else if (lower.includes("android")) os = "Android";
  else if (lower.includes("linux")) os = "Linux";

  let browser = "";
  if (lower.includes("chrome") && !lower.includes("edg") && !lower.includes("opr")) browser = "Chrome";
  else if (lower.includes("safari") && !lower.includes("chrome")) browser = "Safari";
  else if (lower.includes("firefox")) browser = "Firefox";
  else if (lower.includes("edg")) browser = "Edge";

  return { icon, label, os: browser ? `${os} · ${browser}` : os };
}

function timeAgo(dt: string | null) {
  if (!dt) return "Never";
  try { return formatDistanceToNow(new Date(dt), { addSuffix: true }); } catch { return "—"; }
}

export function AdminContent({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function signOutUser(userId: string) {
    setBusy(userId + ":signout");
    try {
      await fetch("/api/admin/sign-out-user", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) });
      toast.success("User signed out from all devices. They cannot log in until restored.");
      await fetchUsers();
    } catch { toast.error("Failed"); }
    finally { setBusy(null); }
  }

  async function restoreUser(userId: string) {
    setBusy(userId + ":restore");
    try {
      await fetch("/api/admin/restore-user", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) });
      toast.success("Access restored. User can now log in.");
      await fetchUsers();
    } catch { toast.error("Failed"); }
    finally { setBusy(null); }
  }

  async function deleteUser(userId: string) {
    setBusy(userId + ":delete");
    try {
      await fetch("/api/admin/delete-user", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) });
      toast.success("User deleted permanently.");
      setUsers((u) => u.filter((x) => x.id !== userId));
    } catch { toast.error("Failed"); }
    finally { setBusy(null); setConfirmDelete(null); }
  }

  const isBanned = (u: User) => {
    if (!u.banned_until) return false;
    return new Date(u.banned_until) > new Date();
  };

  return (
    <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-brand-dark">Access Management</h2>
          <p className="text-sm text-brand-muted mt-0.5">Manage who can log into this app and from which devices</p>
        </div>
        <button onClick={fetchUsers} disabled={loading} className="p-2 rounded-lg hover:bg-brand-beige text-brand-muted transition-colors disabled:opacity-40">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-surface rounded-xl border border-brand-border h-28 animate-pulse" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <p className="text-sm text-brand-muted text-center py-12">No users found.</p>
      ) : (
        <div className="space-y-4">
          {users.map((user) => {
            const banned = isBanned(user);
            const isMe = user.id === currentUserId;

            return (
              <div key={user.id} className={`bg-surface rounded-xl border shadow-card overflow-hidden ${banned ? "border-orange-200" : "border-brand-border"}`}>
                {/* User header */}
                <div className="px-5 py-4 flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${isMe ? "bg-brand-beige text-brand-brown" : "bg-gray-100 text-gray-600"}`}>
                      {user.email?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-brand-dark">{user.email}</p>
                        {isMe && <span className="text-xs bg-brand-beige text-brand-brown px-2 py-0.5 rounded-full font-medium">You</span>}
                        {banned && <span className="text-xs bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><ShieldOff className="h-3 w-3" />Blocked</span>}
                      </div>
                      <p className="text-xs text-brand-muted mt-0.5">
                        Joined {timeAgo(user.created_at)} · Last seen {timeAgo(user.last_sign_in_at)}
                      </p>
                    </div>
                  </div>

                  {!isMe && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {banned ? (
                        <button
                          onClick={() => restoreUser(user.id)}
                          disabled={!!busy}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-300 text-green-700 text-xs font-medium hover:bg-green-50 transition-colors disabled:opacity-50"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {busy === user.id + ":restore" ? "Restoring…" : "Restore Access"}
                        </button>
                      ) : (
                        <button
                          onClick={() => signOutUser(user.id)}
                          disabled={!!busy}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orange-200 text-orange-700 text-xs font-medium hover:bg-orange-50 transition-colors disabled:opacity-50"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          {busy === user.id + ":signout" ? "Signing out…" : "Sign Out All Devices"}
                        </button>
                      )}

                      {confirmDelete === user.id ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-red-600 font-medium">Permanently delete?</span>
                          <button onClick={() => setConfirmDelete(null)} className="px-2.5 py-1.5 rounded-lg border border-brand-border text-xs text-brand-muted hover:bg-gray-50">Cancel</button>
                          <button
                            onClick={() => deleteUser(user.id)}
                            disabled={!!busy}
                            className="px-2.5 py-1.5 rounded-lg border border-red-300 text-red-600 text-xs font-medium hover:bg-red-50 disabled:opacity-50"
                          >
                            {busy === user.id + ":delete" ? "Deleting…" : "Yes, Delete"}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(user.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-500 text-xs font-medium hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Sessions / Devices */}
                {user.sessions.length > 0 ? (
                  <div className="border-t border-brand-border bg-brand-beige/40">
                    <p className="px-5 pt-3 pb-1 text-xs font-semibold text-brand-muted uppercase tracking-wide">
                      Active Sessions ({user.sessions.length})
                    </p>
                    <div className="divide-y divide-brand-border">
                      {user.sessions.map((s) => {
                        const { icon: DeviceIcon, label, os } = parseDevice(s.user_agent);
                        return (
                          <div key={s.id} className="px-5 py-2.5 flex items-center gap-3">
                            <DeviceIcon className="h-4 w-4 text-brand-muted flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-brand-dark">{label}</p>
                              <p className="text-xs text-brand-muted truncate">{os}{s.ip ? ` · ${s.ip}` : ""}</p>
                            </div>
                            <p className="text-xs text-brand-muted flex-shrink-0">Active {timeAgo(s.updated_at)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-brand-border px-5 py-2.5">
                    <p className="text-xs text-brand-muted flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5" />
                      No active sessions
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
