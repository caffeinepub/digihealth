import type { RecordStatus } from "../types/records";

interface StatusBadgeProps {
  status: RecordStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  if (status === "Active") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[oklch(0.94_0.06_160)] text-[oklch(0.35_0.1_160)]">
        <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.6_0.15_160)] inline-block" />
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[oklch(0.93_0.008_220)] text-[oklch(0.45_0.012_260)]">
      <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.6_0.008_260)] inline-block" />
      Archived
    </span>
  );
}
