import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import { motion } from "framer-motion";

interface PropsType {
  onClose: () => void;
}

export default function NavbarSidebar({ onClose }: PropsType) {
  return (
    <div>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-40 bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.aside
        initial={{ width: "80px" }}
        animate={{ width: "250px" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 bottom-0 top-0 text-center w-50 h-screen bg-secondary z-50"
      >
        <div className="flex justify-between items-center px-2">
          <div className="relative w-18.75 h-18.75">
            <Image
              src="/logo.png"
              alt="logo"
              fill
              sizes="75px"
              priority
              className="object-contain"
            />
          </div>
          <button onClick={onClose}>
            <X />
          </button>
        </div>
        <ul className="font-semibold">
          <li className="cursor-pointer hover:font-bold transition-opacity mb-5">
            <Link href="/">Home</Link>
          </li>
          <li className="cursor-pointer hover:font-bold transition-opacity mb-5">
            <Link href="/pages/shop">Shop</Link>
          </li>
          <li className="cursor-pointer hover:font-bold transition-opacity mb-5">
            <Link href="/pages/customized">Customize</Link>
          </li>
        </ul>
      </motion.aside>
    </div>
  );
}
