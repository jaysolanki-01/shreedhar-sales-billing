"use client";

import { useState, useEffect } from "react";

// Module-level cache — survives page navigations within the same session
let cachedId: string | null = null;
let inflightPromise: Promise<string> | null = null;

function fetchOwnerId(): Promise<string> {
  if (cachedId) return Promise.resolve(cachedId);
  if (!inflightPromise) {
    inflightPromise = fetch("/api/me")
      .then((r) => r.json())
      .then((d: { userId: string }) => {
        cachedId = d.userId;
        inflightPromise = null;
        return d.userId;
      });
  }
  return inflightPromise;
}

export function useOwnerId(): string | null {
  const [userId, setUserId] = useState<string | null>(cachedId);
  useEffect(() => {
    if (!userId) fetchOwnerId().then(setUserId);
  }, []);
  return userId;
}
