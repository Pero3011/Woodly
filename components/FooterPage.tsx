import Link from "next/link";
import { Share2, Globe, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-secondary border-t border-neutral/20 py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left Side: Brand & Copyright */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <span className="font-serif text-3xl font-semibold text-primary tracking-tight">
            Woodly
          </span>
          <span className="text-xs text-neutral mt-2 font-medium">
            © 2026 Woodly Artisans. Digital Craftsmanship.
          </span>
        </div>

        {/* Center: Navigation Links */}
        <nav className="flex items-center gap-6 md:gap-8 text-sm font-medium text-primary/80">
          <Link
            href="/about"
            className="hover:text-primary underline underline-offset-4 transition-colors"
          >
            About
          </Link>
          <Link
            href="/terms"
            className="hover:text-primary underline underline-offset-4 transition-colors"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="hover:text-primary underline underline-offset-4 transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="/wholesale"
            className="hover:text-primary underline underline-offset-4 transition-colors"
          >
            Wholesale
          </Link>
        </nav>

        {/* Right Side: Social / Action Circular Buttons */}
        <div className="flex items-center gap-4">
          <button
            aria-label="Share"
            className="w-12 h-12 flex items-center justify-center rounded-full border border-primary/10 bg-white shadow-sm text-primary/70 hover:text-primary hover:border-primary/30 transition-all hover:scale-105"
          >
            <Share2 className="w-5 h-5 stroke-[1.5]" />
          </button>

          <button
            aria-label="Language / Region"
            className="w-12 h-12 flex items-center justify-center rounded-full border border-primary/10 bg-white shadow-sm text-primary/70 hover:text-primary hover:border-primary/30 transition-all hover:scale-105"
          >
            <Globe className="w-5 h-5 stroke-[1.5]" />
          </button>

          <button
            aria-label="Contact via Email"
            className="w-12 h-12 flex items-center justify-center rounded-full border border-primary/10 bg-white shadow-sm text-primary/70 hover:text-primary hover:border-primary/30 transition-all hover:scale-105"
          >
            <Mail className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>
      </div>
    </footer>
  );
}
