import { useCallback, useState } from "react";
import type { ShareAuditEntry, ShareInvite } from "../types/records";

const STORAGE_KEY = "digihealth_shares";
const AUDIT_KEY = "digihealth_share_audit";

function loadShares(): ShareInvite[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ShareInvite[];
  } catch {
    return [];
  }
}

function saveShares(shares: ShareInvite[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shares));
}

function loadAudit(): ShareAuditEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ShareAuditEntry[];
  } catch {
    return [];
  }
}

function saveAudit(entries: ShareAuditEntry[]) {
  localStorage.setItem(AUDIT_KEY, JSON.stringify(entries));
}

function generateToken(): string {
  const arr = new Uint8Array(18);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function useShares() {
  const [shares, setShares] = useState<ShareInvite[]>(() => loadShares());
  const [auditLog, setAuditLog] = useState<ShareAuditEntry[]>(() =>
    loadAudit(),
  );

  const addAuditEntry = useCallback((entry: Omit<ShareAuditEntry, "id">) => {
    const newEntry: ShareAuditEntry = {
      ...entry,
      id: generateToken(),
    };
    setAuditLog((prev) => {
      const updated = [...prev, newEntry];
      saveAudit(updated);
      return updated;
    });
  }, []);

  const createShare = useCallback(
    (invite: Omit<ShareInvite, "token" | "createdAt">): ShareInvite => {
      const newInvite: ShareInvite = {
        ...invite,
        token: generateToken(),
        createdAt: Date.now(),
      };
      setShares((prev) => {
        const updated = [...prev, newInvite];
        saveShares(updated);
        return updated;
      });
      addAuditEntry({
        token: newInvite.token,
        action: "created",
        timestamp: newInvite.createdAt,
        recipientLabel: newInvite.recipientLabel,
        recipientType: newInvite.recipientType,
        recordCount: newInvite.recordIds.length,
      });
      return newInvite;
    },
    [addAuditEntry],
  );

  const revokeShare = useCallback(
    (token: string) => {
      setShares((prev) => {
        const target = prev.find((s) => s.token === token);
        if (target) {
          addAuditEntry({
            token: target.token,
            action: "revoked",
            timestamp: Date.now(),
            recipientLabel: target.recipientLabel,
            recipientType: target.recipientType,
            recordCount: target.recordIds.length,
          });
        }
        const updated = prev.filter((s) => s.token !== token);
        saveShares(updated);
        return updated;
      });
    },
    [addAuditEntry],
  );

  const getShare = useCallback((token: string): ShareInvite | undefined => {
    return loadShares().find((s) => s.token === token);
  }, []);

  const activeShares = shares.filter((s) => Date.now() <= s.expiresAt);
  const expiredShares = shares.filter((s) => Date.now() > s.expiresAt);

  return {
    shares,
    activeShares,
    expiredShares,
    auditLog,
    createShare,
    revokeShare,
    getShare,
  };
}
