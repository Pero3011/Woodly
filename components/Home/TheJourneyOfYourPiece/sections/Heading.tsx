import {motion} from "framer-motion"
export default function Heading() {
    return (
      <motion.div
        initial={{ opacity: 0}}
        whileInView={{ opacity: 1}}
        transition={{ duration: 1}}
        viewport={{ once: true, amount: 0.25 }}
      >
        <h1 className="text-primary text-[32px] font-headline font-medium pb-1">
          The Journey of Your Piece
        </h1>
        <h4 className="text-primary italic text-sm">
          From raw vision to tangible heritage
        </h4>
      </motion.div>
    );
}