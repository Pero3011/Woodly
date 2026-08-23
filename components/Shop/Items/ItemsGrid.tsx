
import ItemsCards from "./ItemsCards";
import Pagination from "./Pagination";
import {motion} from "framer-motion"

const items = [
  {
    image: "/Test1.png",
    category: "Fretwork",
    price: "$450",
    title: "Floral Fretwork Panel",
    description:
      "Intricate scroll saw design hand-carved from premium birch plywood.",
  },
  {
    image: "/Test1.png",
    category: "Rosewood",
    price: "$295",
    title: "Geometric Rosewood Medallion",
    description:
      "Symmetrical geometric patterns precision-cut for a modern artisanal look.",
  },
  {
    image: "/Test1.png",
    category: "Maple",
    price: "$320",
    title: "Lattice Wall Sculpture",
    description:
      "Delicate maple lattice work that creates beautiful shadow play on any wall.",
  },
];

interface Display {
  DisplaySetting: "grid-cols-3" | "grid-rows-3";
}

export default function ItemsGrid({ DisplaySetting }: Display) {
  const isList = DisplaySetting === "grid-rows-3";
  const gridClass = isList ? "md:grid-cols-1" : "md:grid-cols-3";

  return (
    <div>
      <div className={`grid grid-cols-1 ${gridClass} gap-6`}>
        {items.map((item, i) => (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: i * 0.1 }}
            key={i}
          >
            <ItemsCards {...item} layout={isList ? "list" : "grid"} />
          </motion.div>
        ))}
      </div>
      <Pagination totalPages={3} />
    </div>
  );
}
