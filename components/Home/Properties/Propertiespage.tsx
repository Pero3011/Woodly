'use client'

import Cards from "./sections/Cards";
import { Fence, LayoutPanelLeft, Images, Sofa } from "lucide-react";
import { motion } from "framer-motion";

export default function Propertiespage() {
  const cards = [
    { icon: Fence, title: "Wall Panels" },
    { icon: LayoutPanelLeft, title: "Scrollwork" },
    { icon: Images, title: "Geometric Relief" },
    { icon: Sofa, title: "Custom Fretwork" },
  ];

  return (
    /* 1. Wrapper to handle structural constraints */
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 2. Grid container with responsive column rules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration:0.5, delay:index*0.1}} viewport={{once: true, amount:0.25}} key={index}>
            <Cards icon={card.icon} title={card.title} />
          </motion.div> 
        ))}
      </div>
    </div>
  );
}