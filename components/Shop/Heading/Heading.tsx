import LayoutSlider from "./LayoutSlider";

export default function Heading() {
  return (
    <div className="flex justify-between item-center px-20 py-10">
      {/* LHS */}
      <div>
        <h1 className="font-bold text-primary text-3xl">Curated Collection</h1>
        <span className="text-sm text-primary font-medium">Showing 12 exquisite wood pieces</span>
      </div>

      {/* RHS */}
      <div>
        <LayoutSlider />
      </div>
    </div>
  );
}
