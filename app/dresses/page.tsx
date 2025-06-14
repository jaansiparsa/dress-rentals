"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { getDresses } from "@/lib/database";

const dressTypes = ["Casual", "Semi-Formal", "Work", "Party", "Formal"];
const sizes = ["XS", "S", "M", "L", "XL"];
const colors = [
  "Black",
  "Blue",
  "Red",
  "Pink",
  "White",
  "Green",
  "Yellow",
  "Purple",
];

type FilterState = {
  types: string[];
  sizes: string[];
  colors: string[];
  maxPrice: number;
};

export default function DressesPage() {
  const [filters, setFilters] = useState<FilterState>({
    types: [],
    sizes: [],
    colors: [],
    maxPrice: 200,
  });
  const [dresses, setDresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dresses from Supabase
  useEffect(() => {
    setLoading(true);
    setError(null);
    getDresses({
      types: filters.types.length ? filters.types : undefined,
      sizes: filters.sizes.length ? filters.sizes : undefined,
      colors: filters.colors.length ? filters.colors : undefined,
      maxPrice: filters.maxPrice,
    })
      .then((data) => setDresses(data || []))
      .catch((err) => setError(err.message || "Failed to load dresses"))
      .finally(() => setLoading(false));
  }, [filters]);

  const toggleFilter = (
    category: keyof Omit<FilterState, "maxPrice">,
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((item) => item !== value)
        : [...prev[category], value],
    }));
  };

  // Remove this local filtering, since getDresses already applies filters on the server
  // const filteredDresses = dresses.filter((dress) => {
  //   const typeMatch =
  //     filters.types.length === 0 || filters.types.includes(dress.type);
  //   const sizeMatch =
  //     filters.sizes.length === 0 || filters.sizes.includes(dress.size);
  //   const colorMatch =
  //     filters.colors.length === 0 || filters.colors.includes(dress.color);
  //   const priceMatch = dress.price <= filters.maxPrice;
  //   return typeMatch && sizeMatch && colorMatch && priceMatch;
  // });

  // Use dresses directly, since they're already filtered from Supabase
  const filteredDresses = dresses;

  return (
    <div className="flex gap-8">
      {/* Sidebar Filters */}
      <div className="w-64 flex-shrink-0">
        <div className="bg-white p-6 rounded-lg shadow-sm space-y-6 sticky top-8">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>

          {/* Dress Type Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Dress Type
            </h3>
            <div className="space-y-2">
              {dressTypes.map((type) => (
                <label key={type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.types.includes(type)}
                    onChange={() => toggleFilter("types", type)}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-600">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Size</h3>
            <div className="space-y-2">
              {sizes.map((size) => (
                <label key={size} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.sizes.includes(size)}
                    onChange={() => toggleFilter("sizes", size)}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-600">{size}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Color</h3>
            <div className="space-y-2">
              {colors.map((color) => (
                <label key={color} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.colors.includes(color)}
                    onChange={() => toggleFilter("colors", color)}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-600">{color}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Max Price: ${filters.maxPrice}
            </h3>
            <input
              type="range"
              min="0"
              max="200"
              value={filters.maxPrice}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  maxPrice: Number(e.target.value),
                }))
              }
              className="w-full"
            />
          </div>

          {/* Clear Filters Button */}
          <button
            onClick={() =>
              setFilters({ types: [], sizes: [], colors: [], maxPrice: 200 })
            }
            className="w-full btn-secondary text-sm"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Browse Dresses</h1>
          <button className="btn-primary">List a Dress</button>
        </div>

        {/* Results Count */}
        <p className="text-gray-600 mb-6">
          Showing {filteredDresses.length}{" "}
          {filteredDresses.length === 1 ? "dress" : "dresses"}
        </p>

        {/* Dress Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDresses.map((dress) => (
            <Link
              key={dress.id}
              href={`/dresses/${dress.id}`}
              className="group"
            >
              <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform duration-200 group-hover:shadow-md">
                <div className="relative h-64">
                  <Image
                    src={dress.image_url}
                    alt={dress.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary-600 transition-colors">
                    {dress.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {Array.isArray(dress.types) &&
                      dress.types.map((type: string) => (
                        <span
                          key={type}
                          className="px-2 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                        >
                          {type}
                        </span>
                      ))}
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
                      Size {dress.size}
                    </span>
                    {Array.isArray(dress.colors) &&
                      dress.colors.map((color: string) => (
                        <span
                          key={color}
                          className="px-2 py-1 bg-primary-50 text-primary-600 text-sm rounded-full"
                        >
                          {color}
                        </span>
                      ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold">${dress.price}/day</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* No Results Message */}
        {filteredDresses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">
              No dresses match your filters. Try adjusting your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
