import type { RecordCategory } from "../types/records";
import { CATEGORY_ICONS } from "../types/records";

const COLOR_MAP: Record<RecordCategory, string> = {
  "Lab Results": "bg-blue-50 text-blue-700",
  Prescriptions: "bg-purple-50 text-purple-700",
  Imaging: "bg-orange-50 text-orange-700",
  Immunizations: "bg-green-50 text-green-700",
  "Doctor Notes": "bg-teal-50 text-teal-700",
};

export default function CategoryBadge({
  category,
}: { category: RecordCategory }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${COLOR_MAP[category]}`}
    >
      <span>{CATEGORY_ICONS[category]}</span>
      {category}
    </span>
  );
}
