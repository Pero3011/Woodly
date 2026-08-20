import { LucideIcon } from "lucide-react";

// 1. Define the interface for your props
interface CardsProps {
  icon: LucideIcon; // Expects a Lucide component reference, not a string
  title: string;
}

// 2. Destructure the props object and rename 'icon' to 'Icon' (capitalized)
export default function Cards({ icon: Icon, title }: CardsProps) {
  return (
    <div className="card flex flex-col items-center justify-center gap-5 rounded-2xl bg-[#FAECDC] border border-[#C9BFB2] min-h-50 shadow-[inset_2px_2px_4px_rgba(46,29,18,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.5)]">
      {/* 3. Render it like a standard React component */}
      <div className="bg-[#FFDBC7] text-black p-5 rounded-full">
        <Icon size={24} className="card-icon" />
      </div>
      <h3 className="font-medium">{title}</h3>
    </div>
  );
}
