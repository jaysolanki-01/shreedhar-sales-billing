"use client";

import { useState, useEffect } from "react";

let cachedId: string | null = null;
let inflightPromise: Promise<string | null> | null = null;

function fetchOwnerId(): Promise<string | null> {
  if (cachedId) return Promise.resolve(cachedId);
  if (!inflightPromise) {
    inflightPromise = fetch("/api/me")
      .then((r) => {
        if (!r.ok) throw new Error(`/api/me returned ${r.status}`);
        return r.json();
      })
      .then((d: { userId: string }) => {
        cachedId = d.userId;
        inflightPromise = null;
        return d.userId;
      })
      .catch((err) => {
        // Reset so the next component mount can retry
        inflightPromise = null;
        console.error("useOwnerId: failed to fetch owner id", err);
        return null;
      });
  }
  return inflightPromise;
}

export function useOwnerId(): string | null {
  const [userId, setUserId] = useState<string | null>(cachedId);
  useEffect(() => {
    if (!userId) fetchOwnerId().then((id) => { if (id) setUserId(id); });
  }, []);
  return userId;
}
