import { ChevronDown } from "lucide-react";

interface FilterSidebarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

interface Filters {
  categories: string[];
  woodType: string | null;
  maxPrice: number;
  sortBy: "newest" | "price-asc" | "price-desc";
}

const CATEGORIES = ["Wall Art", "Living Room", "Decor", "Desk Accessories"];
const WOOD_TYPES = ["Walnut", "Oak", "Maple"];

export default function FilterSidebar({
  filters,
  onFiltersChange,
}: FilterSidebarProps) {
  const toggleCategory = (cat: string) => {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    onFiltersChange({ ...filters, categories: next });
  };

  return (
    <aside className="w-64 min-h-screen bg-secondary p-6 text-[#2A1E17] border-r border-neutral-300">
      <h1 className="text-2xl font-bold mb-6 text-[#5A2D0C]">Filters</h1>

      {/* CATEGORY */}
      <div className="mb-6">
        <h2 className="uppercase font-sans text-xs font-semibold tracking-wider text-[#6D5A4D] mb-3">
          Category
        </h2>
        <div className="space-y-2.5">
          {CATEGORIES.map((cat) => (
            <label
              key={cat}
              className="flex items-center gap-3 cursor-pointer text-sm font-medium"
            >
              <input
                type="checkbox"
                checked={filters.categories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                className="w-4 h-4 rounded border-gray-300 accent-[#5A2D0C] focus:ring-0 cursor-pointer"
              />
              <span>{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* PRICE RANGE */}
      <div className="mb-6">
        <h2 className="uppercase font-sans text-xs font-semibold tracking-wider text-[#6D5A4D] mb-3">
          Price Range
        </h2>
        <div className="relative flex items-center mb-2">
          <input
            type="range"
            min="100"
            max="1000"
            value={filters.maxPrice}
            onChange={(e) =>
              onFiltersChange({ ...filters, maxPrice: Number(e.target.value) })
            }
            className="w-full h-1.5 bg-[#E6D7C3] rounded-lg appearance-none cursor-pointer accent-[#5A2D0C]"
          />
        </div>
        <div className="flex justify-between text-xs text-[#5A2D0C] font-medium">
          <span>$100</span>
          <span>
            ${filters.maxPrice.toLocaleString()}
            {filters.maxPrice >= 1000 ? "+" : ""}
          </span>
        </div>
      </div>

      {/* WOOD TYPE */}
      <div className="mb-6">
        <h2 className="uppercase font-sans text-xs font-semibold tracking-wider text-[#6D5A4D] mb-3">
          Wood Type
        </h2>
        <div className="space-y-2.5">
          {WOOD_TYPES.map((wood) => (
            <label
              key={wood}
              className="flex items-center gap-3 cursor-pointer text-sm font-medium"
            >
              <input
                type="radio"
                name="wood-type"
                checked={filters.woodType === wood}
                onChange={() => onFiltersChange({ ...filters, woodType: wood })}
                className="w-4 h-4 border-gray-300 text-[#5A2D0C] focus:ring-0 cursor-pointer accent-[#5A2D0C]"
              />
              <span>{wood}</span>
            </label>
          ))}
        </div>
      </div>

      {/* SORT BY */}
      <div>
        <h2 className="uppercase font-sans text-xs font-semibold tracking-wider text-[#6D5A4D] mb-3">
          Sort By
        </h2>
        <div className="relative">
          <select
            value={filters.sortBy}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                sortBy: e.target.value as Filters["sortBy"],
              })
            }
            className="w-full bg-white border border-[#E2D5C3] rounded-lg px-3 py-2 text-sm appearance-none focus:outline-none focus:border-[#5A2D0C] cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 pointer-events-none" />
        </div>
      </div>
    </aside>
  );
}
