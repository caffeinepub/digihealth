import { useCallback, useState } from "react";
import { SAMPLE_RECORDS } from "../data/sampleData";
import type { HealthRecord, RecordCategory } from "../types/records";

function detectCategory(title: string, notes: string): RecordCategory {
  const text = `${title} ${notes}`.toLowerCase();
  if (
    /lab|blood|test|results|cbc|glucose|cholesterol|urine|panel|hemoglobin/.test(
      text,
    )
  ) {
    return "Lab Results";
  }
  if (
    /prescription|medication|drug|rx|dose|refill|pharmacy|mg |capsule|tablet/.test(
      text,
    )
  ) {
    return "Prescriptions";
  }
  if (
    /xray|x-ray|mri|ct scan|ultrasound|imaging|radiology|scan|radiograph/.test(
      text,
    )
  ) {
    return "Imaging";
  }
  if (/vaccine|vaccination|immunization|shot|booster|immunise/.test(text)) {
    return "Immunizations";
  }
  if (
    /notes|consultation|visit|doctor|physician|diagnosis|treatment|follow.?up/.test(
      text,
    )
  ) {
    return "Doctor Notes";
  }
  return "Doctor Notes";
}

export function useRecords() {
  const [records, setRecords] = useState<HealthRecord[]>(SAMPLE_RECORDS);

  const addRecord = useCallback((record: Omit<HealthRecord, "id">) => {
    const newRecord: HealthRecord = {
      ...record,
      id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    };
    setRecords((prev) => [newRecord, ...prev]);
    return newRecord;
  }, []);

  const deleteRecord = useCallback((id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const archiveRecord = useCallback((id: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "Archived" as const } : r,
      ),
    );
  }, []);

  return { records, addRecord, deleteRecord, archiveRecord, detectCategory };
}
