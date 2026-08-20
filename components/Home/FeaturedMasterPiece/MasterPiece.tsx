'use client'
import Card from "./section/Card";
import Heading from "./section/Heading";
import { motion } from "framer-motion";

export default function MasterPiece() {
    const MasterPieces = [
      {
        URL: "/Test1.png",
        Title: "The Sylvan Panel",
        Description: "Custom Relief Wall Art",
        Price: 450,
      },
      {
        URL: "/Test1.png",
        Title: "The Sylvan Panel",
        Description: "Custom Relief Wall Art",
        Price: 450,
      },
      {
        URL: "/Test2.png",
        Title: "The Sylvan Panel",
        Description: "Custom Relief Wall Art",
        Price: 450,
      },
      {
        URL: "/Test2.png",
        Title: "The Sylvan Panel",
        Description: "Custom Relief Wall Art",
        Price: 450,
      },
    ];
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Heading />
        <div className="grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-5">
          {MasterPieces.map((Piece, index) => (
            <motion.div
              key={index}
              className="w-full"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, amount: 0.25 }}
            >
              <Card
                key={index}
                URL={Piece.URL}
                Title={Piece.Title}
                Description={Piece.Description}
                Price={Piece.Price}
              />
            </motion.div>
          ))}
        </div>
      </div>
    );
}