import { X } from "lucide-react";

interface FilterProps {
  FilterType: string;
  FilteredBy: string;
}

export default function FilterCard({ FilterType, FilteredBy }: FilterProps) {
  return (
    <div className="flex items-center bg-primary text-neutral-200 font-semibold w-fit p-2 rounded-lg">
      <span>{FilterType}:</span>
      <span>{FilteredBy}</span>
      <X />
    </div>
  );
}
