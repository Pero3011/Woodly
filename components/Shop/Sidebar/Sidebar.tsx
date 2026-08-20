import { ChevronDown } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-[#fdf0dd] p-6 text-[#2A1E17]">
      <h1 className=" text-2xl font-bold mb-6 text-[#5A2D0C]">
        Filters
      </h1>

      {/* CATEGORY */}
      <div className="mb-6">
        <h2 className="uppercase font-sans text-xs font-semibold tracking-wider text-[#6D5A4D] mb-3">
          Category
        </h2>
        <div className="space-y-2.5">
          {["Fretwork Panels", "Clock Faces", "Shadow Boxes", "Wall Decor"].map(
            (cat) => (
              <label
                key={cat}
                className="flex items-center gap-3 cursor-pointer text-sm font-medium"
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 accent-[#5A2D0C] focus:ring-0 cursor-pointer"
                />
                <span>{cat}</span>
              </label>
            ),
          )}
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
            max="5000"
            defaultValue="2500"
            className="w-full h-1.5 bg-[#E6D7C3] rounded-lg appearance-none cursor-pointer accent-[#5A2D0C]"
          />
        </div>
        <div className="flex justify-between text-xs text-[#5A2D0C] font-medium">
          <span>$100</span>
          <span>$5,000+</span>
        </div>
      </div>

      {/* WOOD TYPE */}
      <div className="mb-6">
        <h2 className="uppercase font-sans text-xs font-semibold tracking-wider text-[#6D5A4D] mb-3">
          Wood Type
        </h2>
        <div className="space-y-2.5">
          {["Walnut", "Oak", "Maple"].map((wood) => (
            <label
              key={wood}
              className="flex items-center gap-3 cursor-pointer text-sm font-medium"
            >
              <input
                type="radio"
                name="wood-type"
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
          <select className="w-full bg-white border border-[#E2D5C3] rounded-lg px-3 py-2 text-sm appearance-none focus:outline-none focus:border-[#5A2D0C] cursor-pointer">
            <option>Newest First</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 pointer-events-none" />
        </div>
      </div>
    </aside>
  );
}
