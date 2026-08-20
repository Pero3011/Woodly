import { LucideIcon } from "lucide-react";

interface MilestoneProps {
  Icon: LucideIcon;
  title: string;
  description: string;
  index: number;
  totalItems: number;
}

export default function Milestone({
  Icon,
  title,
  description,
  index,
  totalItems,
}: MilestoneProps) {
  const isLast = index === totalItems - 1;

  return (
    <div className="flex flex-col items-center text-center relative group">
      {/* Icon Container with responsive connector pseudo-elements */}
      <div
        className={`
          relative p-4 bg-amber-950 text-white rounded-full z-20 
          
          /* Mobile/Tablet: Vertical line pointing down */
          ${!isLast ? "after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:w-0.5 after:h-16 after:bg-neutral-300 after:z-[-1]" : ""}
          
          /* Desktop (5 cols): Horizontal line pointing right */
          lg:after:top-1/2 lg:after:left-full lg:after:translate-x-0 lg:after:-translate-y-1/2 lg:after:h-0.5
          
          /* Calculate exact width to gap the next item on desktop */
          lg:after:w-[calc(100vw/5-50px)] xl:after:w-45
          
          /* Hide the desktop horizontal line on the last element */
          ${isLast ? "lg:after:hidden" : ""}
          
          /* Responsive visibility fixes for grid wrap states */
          ${index === 1 || index === 3 ? "sm:max-lg:after:hidden" : ""} 
        `}
      >
        <Icon size={24} />
      </div>

      <h4 className="mt-4 font-medium text-primary">{title}</h4>
      <p className="text-sm text-gray-600 max-w-xs">{description}</p>
    </div>
  );
}
