'use client'

import Heading from "./sections/Heading";
import Milestone from "./sections/Milestone";
import { Upload, Banknote, BadgeCheck, Hammer, Truck } from "lucide-react";
import { motion } from "framer-motion";

export default function JourneyPage() {
  const Milestones = [
    {
      icon: Upload,
      title: "UPLOAD",
      description: "Share your design or select a template.",
    },
    {
      icon: Banknote,
      title: "GET A QUOTE",
      description: "Receive a detailed breakdown in 24h.",
    },
    {
      icon: BadgeCheck,
      title: "APPROVE",
      description: "Finalize details and wood choice.",
    },
    {
      icon: Hammer,
      title: "WE CARVE",
      description: "Artisans bring your vision to life.",
    },
    {
      icon: Truck,
      title: "DELIVERED",
      description: "Safe, premium shipping to your door.",
    },
  ];

  return (
    <div className="text-center bg-secondary border border-y-[#D5C3B9] py-20">
      <Heading />
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-y-16 gap-x-6">
          {Milestones.map((milestone, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, amount: 0.25 }}
            >
              <Milestone
                index={index}
                totalItems={Milestones.length}
                Icon={milestone.icon}
                title={milestone.title}
                description={milestone.description}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
