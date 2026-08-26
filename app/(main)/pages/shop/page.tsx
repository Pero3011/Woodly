"use client";
import { useEffect, useMemo, useState } from "react";
import FilterSidebar from "@/components/Shop/Items/FilterSidebar";
import ItemsGrid from "@/components/Shop/Items/ItemsGrid";
import Navbar from "@/components/Navbar";
import Heading from "@/components/Shop/Heading/Heading";
import Filters from "@/components/Shop/Items/Filters";

export interface Filters {
  categories: string[];
  woodType: string | null;
  maxPrice: number;
  sortBy: "newest" | "price-asc" | "price-desc";
}
export default function page() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displaySetting, setDisplaySetting] = useState<
    "grid-cols-3" | "grid-rows-3"
  >("grid-cols-3");

  const [filters, setFilters] = useState<Filters>({
    categories: [],
    woodType: null,
    maxPrice: 1000,
    sortBy: "newest",
  });

  useEffect(() => {
    fetch("/api/shop")
      .then((res) => res.json())
      .then((data) => setProducts(data.products ?? []))
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (filters.categories.length > 0) {
      result = result.filter((p) =>
        filters.categories.includes(p.prod_category),
      );
    }

    if (filters.woodType) {
      // Fallback substring match — replace with p.prod_wood_type === filters.woodType
      // once a WOOD_TYPE column exists on PRODUCTS.
      result = result.filter((p) =>
        `${p.prod_name} ${p.prod_description}`
          .toLowerCase()
          .includes(filters.woodType!.toLowerCase()),
      );
    }

    result = result.filter((p) => Number(p.prod_price) <= filters.maxPrice);

    if (filters.sortBy === "price-asc") {
      result.sort((a, b) => Number(a.prod_price) - Number(b.prod_price));
    } else if (filters.sortBy === "price-desc") {
      result.sort((a, b) => Number(b.prod_price) - Number(a.prod_price));
    }
    // "newest" — assumes /api/shop already returns newest-first; add an
    // ORDER BY / created_at column if you need true newest-first sorting.

    return result;
  }, [products, filters]);
  return (
    <div>
      <Navbar/>
      <div className="flex">
        <FilterSidebar filters={filters} onFiltersChange={setFilters} />
        <div className="flex-1">
          {isLoading ? (
            <p className="text-center text-neutral-500 py-10">
              Loading products...
            </p>
          ) : (
            <div className="px-20">
              <Heading layout={displaySetting} setLayout={setDisplaySetting} />
              <Filters />
              <ItemsGrid
                DisplaySetting={displaySetting}
                products={filteredProducts}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
