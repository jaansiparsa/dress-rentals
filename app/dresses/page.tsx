"use client";

import Image from "next/image";
import Link from "next/link";
import { StarIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

interface Dress {
  id: number;
  title: string;
  type: string;
  size: string;
  color: string;
  price: number;
  image: string;
  available: boolean;
  rating: number;
  reviews: number;
}

// Update mock data to include rating and reviews
const dresses: Dress[] = [
  {
    id: 1,
    title: "Elegant Black Evening Gown",
    type: "Formal",
    size: "M",
    color: "Black",
    price: 50,
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop&q=60",
    available: true,
    rating: 4.8,
    reviews: 24,
  },
  {
    id: 2,
    title: "Floral Summer Dress",
    type: "Casual",
    size: "S",
    color: "Blue",
    price: 30,
    image:
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&auto=format&fit=crop&q=60",
    available: true,
    rating: 4.5,
    reviews: 18,
  },
  {
    id: 3,
    title: "Classic Red Cocktail Dress",
    type: "Semi-Formal",
    size: "L",
    color: "Red",
    price: 40,
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop&q=60",
    available: false,
    rating: 4.9,
    reviews: 32,
  },
  {
    id: 4,
    title: "Professional Navy Dress",
    type: "Work",
    size: "M",
    color: "Navy",
    price: 35,
    image:
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&auto=format&fit=crop&q=60",
    available: true,
    rating: 4.7,
    reviews: 15,
  },
  {
    id: 5,
    title: "Sparkly Party Dress",
    type: "Party",
    size: "S",
    color: "Silver",
    price: 45,
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop&q=60",
    available: true,
    rating: 4.6,
    reviews: 21,
  },
  {
    id: 6,
    title: "Designer Green Party Dress",
    type: "Party",
    size: "L",
    color: "Green",
    price: 55,
    image:
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&auto=format&fit=crop&q=60",
    available: true,
    rating: 4.9,
    reviews: 28,
  },
];

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

  const filteredDresses = dresses.filter((dress) => {
    const typeMatch =
      filters.types.length === 0 || filters.types.includes(dress.type);
    const sizeMatch =
      filters.sizes.length === 0 || filters.sizes.includes(dress.size);
    const colorMatch =
      filters.colors.length === 0 || filters.colors.includes(dress.color);
    const priceMatch = dress.price <= filters.maxPrice;
    return typeMatch && sizeMatch && colorMatch && priceMatch;
  });

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
                    src={dress.image}
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
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
                      {dress.type}
                    </span>
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
                      Size {dress.size}
                    </span>
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
                      {dress.color}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold">${dress.price}/day</p>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <StarIcon className="h-4 w-4 text-yellow-400" />
                      <span>{dress.rating}</span>
                      <span>({dress.reviews})</span>
                    </div>
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
