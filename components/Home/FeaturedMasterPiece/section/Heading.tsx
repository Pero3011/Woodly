'use client'
import { ChevronRight, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function Heading() {
    const ChevronStyles =
      "border border-[#C9BFB2] rounded-full p-2 shadow-[inset_2px_2px_4px_rgba(46,29,18,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.5)] hover:bg-primary hover:text-secondary transition duaration-2";
    return (
      <div className="flex justify-between items-center pb-10">
        {/* LHS */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-[32px] font-headline text-primary">
            Featured Master Piece
          </h1>
          <h4 className="text-sm text-primary italic">
            Our most requested custom designs this season.
          </h4>
        </motion.div>

        {/* RHS */}
        <motion.div
          className="flex items-center gap-5"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 1 }}
        >
          <div className={ChevronStyles}>
            <ChevronLeft />
          </div>
          <div className={ChevronStyles}>
            <ChevronRight />
          </div>
        </motion.div>
      </div>
    );
}