export type RecordCategory =
  | "Lab Results"
  | "Prescriptions"
  | "Imaging"
  | "Immunizations"
  | "Doctor Notes";

export type RecordStatus = "Active" | "Archived";

export interface HealthRecord {
  id: string;
  name: string;
  date: string;
  category: RecordCategory;
  provider: string;
  status: RecordStatus;
  notes?: string;
  blobUrl?: string;
  fileName?: string;
}

export interface ShareInvite {
  token: string;
  recipientLabel: string;
  recipientType: "doctor" | "relative" | "other";
  recordIds: string[];
  expiresAt: number;
  createdAt: number;
}

export interface ShareAuditEntry {
  id: string;
  token: string;
  action: "created" | "revoked" | "expired";
  timestamp: number;
  recipientLabel: string;
  recipientType: "doctor" | "relative" | "other";
  recordCount: number;
}

export const ALL_CATEGORIES: RecordCategory[] = [
  "Lab Results",
  "Prescriptions",
  "Imaging",
  "Immunizations",
  "Doctor Notes",
];

export const CATEGORY_ICONS: Record<RecordCategory, string> = {
  "Lab Results": "🧪",
  Prescriptions: "💊",
  Imaging: "🩻",
  Immunizations: "💉",
  "Doctor Notes": "📋",
};

export const CATEGORY_COLORS: Record<RecordCategory, string> = {
  "Lab Results": "text-blue-600 bg-blue-50",
  Prescriptions: "text-purple-600 bg-purple-50",
  Imaging: "text-orange-600 bg-orange-50",
  Immunizations: "text-green-600 bg-green-50",
  "Doctor Notes": "text-teal-600 bg-teal-50",
};
