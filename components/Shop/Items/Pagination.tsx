"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  totalPages,
  currentPage,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null; // Hide pagination if only 1 page exists

  const goTo = (page: number) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  // Generate page numbers with ellipses for high page counts
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        );
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 my-10">
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E0D6C6] text-[#6B5F52] disabled:opacity-40 hover:bg-[#F5EFE4] transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      {getPageNumbers().map((item, idx) =>
        typeof item === "number" ? (
          <button
            key={item}
            onClick={() => goTo(item)}
            className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
              item === currentPage
                ? "bg-[#5C4530] text-[#F5EFE4]"
                : "border border-[#E0D6C6] text-[#6B5F52] hover:bg-[#F5EFE4]"
            }`}
          >
            {item}
          </button>
        ) : (
          <span
            key={`ellipsis-${idx}`}
            className="w-9 h-9 flex items-center justify-center text-[#6B5F52]"
          >
            {item}
          </span>
        ),
      )}

      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E0D6C6] text-[#6B5F52] disabled:opacity-40 hover:bg-[#F5EFE4] transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
