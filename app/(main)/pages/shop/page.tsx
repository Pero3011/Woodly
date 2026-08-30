"use client";

import { useEffect, useState } from "react";
import FilterSidebar from "@/components/Shop/Items/FilterSidebar";
import ItemsGrid from "@/components/Shop/Items/ItemsGrid";
import Navbar from "@/components/Navbar";
import Heading from "@/components/Shop/Heading/Heading";
import Pagination from "@/components/Shop/Items/Pagination";

export interface Filters {
  categories: string[];
  woodType: string | null;
  maxPrice: number;
  sortBy: "newest" | "price-asc" | "price-desc";
}

export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export default function Page() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displaySetting, setDisplaySetting] = useState<
    "grid-cols-3" | "grid-rows-3"
  >("grid-cols-3");

  // Pagination State (Set default pageSize to 3)
  const [page, setPage] = useState<number>(1);
  const [meta, setMeta] = useState<PaginationMeta>({
    currentPage: 1,
    pageSize: 3,
    totalItems: 0,
    totalPages: 1,
  });

  const [filters, setFilters] = useState<Filters>({
    categories: [],
    woodType: null,
    maxPrice: 1000,
    sortBy: "newest",
  });

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setPage(1); // Reset to page 1 on filter change
  };

  useEffect(() => {
    setIsLoading(true);

    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", "3");

    if (filters.categories.length > 0) {
      params.append("category", filters.categories.join(","));
    }
    if (filters.woodType) {
      params.append("woodType", filters.woodType);
    }
    if (filters.maxPrice) {
      params.append("price", filters.maxPrice.toString());
    }
    if (filters.sortBy) {
      params.append("sortBy", filters.sortBy);
    }

    fetch(`/api/shop?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products ?? []);
        if (data.meta) {
          setMeta(data.meta);
        }
      })
      .catch(() => {
        setProducts([]);
        setMeta({ currentPage: 1, pageSize: 3, totalItems: 0, totalPages: 1 });
      })
      .finally(() => setIsLoading(false));
  }, [filters, page]);

  return (
    <div>
      <Navbar />
      <div className="flex">
        <FilterSidebar
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
        <div className="flex-1">
          {isLoading ? (
            <p className="text-center text-neutral-500 py-10">
              Loading products...
            </p>
          ) : (
            <div className="px-20 py-6">
              <Heading layout={displaySetting} setLayout={setDisplaySetting} />
              <ItemsGrid DisplaySetting={displaySetting} products={products} />

              {/* FIXED: Render when totalPages >= 1 and products exist */}
              {products.length > 0 && meta.totalPages > 0 && (
                <Pagination
                  currentPage={page}
                  totalPages={meta.totalPages}
                  onPageChange={(newPage) => setPage(newPage)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
