"use client";
import ItemsCards from "./ItemsCards";
import { motion } from "framer-motion";

interface Display {
  DisplaySetting: "grid-cols-3" | "grid-rows-3";
  products: any[];
}

export default function ItemsGrid({ DisplaySetting, products }: Display) {
  const isList = DisplaySetting === "grid-rows-3";
  const gridClass = isList ? "md:grid-cols-1" : "md:grid-cols-3";

  if (products.length === 0) {
    return (
      <p className="text-center text-neutral-500 py-10">
        No products match these filters.
      </p>
    );
  }
  return (
    <div>
      <div className={`grid grid-cols-1 ${gridClass} gap-6`}>
        {products.map((item: any, i: number) => (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: i * 0.1 }}
            key={item.prod_id ?? i}
          >
            <ItemsCards
              image={item.prod_img}
              category={item.prod_category}
              price={item.prod_price}
              title={item.prod_name}
              description={item.prod_description}
              layout={isList ? "list" : "grid"}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
