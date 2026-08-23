import LayoutSlider from "./LayoutSlider";

interface HeadingProps {
  layout: "grid-cols-3" | "grid-rows-3";
  setLayout: (layout: "grid-cols-3" | "grid-rows-3") => void;
}

export default function Heading({ layout, setLayout }: HeadingProps) {
  return (
    <div className="flex justify-between items-center py-10">
      {/* LHS */}
      <div>
        <h1 className="font-bold text-primary text-3xl">Curated Collection</h1>
        <span className="text-sm text-primary font-medium">
          Showing 12 exquisite wood pieces
        </span>
      </div>

      {/* RHS */}
      <div>
        <LayoutSlider layout={layout} setLayout={setLayout} />
      </div>
    </div>
  );
}
