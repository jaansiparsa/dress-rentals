"use client";

import {
  ClockIcon,
  MapPinIcon,
  StarIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

import { Calendar } from "@/components/Calendar";
import Image from "next/image";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { useState } from "react";

// Mock data - in a real app, this would come from an API
const mockDress = {
  id: 1,
  title: "Elegant Black Evening Gown",
  types: ["Formal", "Party"], // Now supports multiple types
  size: "M",
  color: "Black",
  price: 50,
  images: [
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop&q=60",
  ],
  description:
    "A stunning black evening gown perfect for formal events. Features a flattering A-line silhouette, sweetheart neckline, and elegant ruching details. Made from high-quality satin with a comfortable lining. Dry cleaned after each rental.",
  brand: "Designer Collection",
  condition: "Like New",
  length: "Floor Length",
  material: "Satin",
  pickupLocation: "Moffitt Library", // Added pickup location
  owner: {
    name: "Sarah Johnson",
    rating: 4.8,
    reviews: 24,
    location: "University Campus",
    memberSince: "2023",
    responseTime: "Within 2 hours",
  },
  availability: {
    unavailableDates: [
      "2024-03-15",
      "2024-03-16",
      "2024-03-17",
      "2024-03-20",
      "2024-03-21",
    ],
    minRentalDays: 1,
    maxRentalDays: 7,
  },
  reviews: [
    {
      id: 1,
      user: "Emily R.",
      rating: 5,
      date: "2024-02-15",
      comment:
        "Beautiful dress, perfect fit! The owner was very responsive and the dress was in excellent condition.",
    },
    {
      id: 2,
      user: "Jessica M.",
      rating: 4,
      date: "2024-01-30",
      comment:
        "Great dress for my formal event. The only reason for 4 stars is that it arrived a bit later than expected.",
    },
  ],
};

export default function DressDetailPage() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const handleDateSelect = (dates: Date[]) => {
    setSelectedDates(dates);
  };

  const calculateTotal = () => {
    if (selectedDates.length < 2) return mockDress.price;
    const days = Math.ceil(
      (selectedDates[1].getTime() - selectedDates[0].getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return mockDress.price * days;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Images and Details */}
        <div className="space-y-6">
          {/* Main Image */}
          <div className="relative h-[500px] rounded-lg overflow-hidden">
            <Image
              src={mockDress.images[selectedImage]}
              alt={mockDress.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Thumbnail Images */}
          <div className="flex gap-4">
            {mockDress.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative h-20 w-20 rounded-lg overflow-hidden ${
                  selectedImage === index ? "ring-2 ring-primary-500" : ""
                }`}
              >
                <Image
                  src={image}
                  alt={`${mockDress.title} - View ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>

          {/* Dress Details */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-4">{mockDress.title}</h2>
            <div className="space-y-4">
              {/* Dress Types */}
              <div>
                <span className="text-gray-600 block mb-2">Dress Types</span>
                <div className="flex flex-wrap gap-2">
                  {mockDress.types.map((type) => (
                    <span
                      key={type}
                      className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              {/* Size and Color */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600 block mb-1">Size</span>
                  <p className="font-medium">{mockDress.size}</p>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">Color</span>
                  <p className="font-medium">{mockDress.color}</p>
                </div>
              </div>

              {/* Pickup Location */}
              <div>
                <span className="text-gray-600 block mb-2">
                  Pickup/Dropoff Location
                </span>
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4 text-gray-400" />
                  <p className="font-medium">{mockDress.pickupLocation}</p>
                </div>
              </div>

              {/* Price */}
              <div>
                <span className="text-gray-600 block mb-1">
                  Daily Rental Price
                </span>
                <p className="text-2xl font-bold text-primary-600">
                  ${mockDress.price}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Description</h2>
            <div className="space-y-4">
              <p
                className={`text-gray-600 ${
                  !showFullDescription && "line-clamp-3"
                }`}
              >
                {mockDress.description}
              </p>
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                {showFullDescription ? "Show Less" : "Read More"}
              </button>
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Reviews</h2>
              <div className="flex items-center gap-2">
                <StarIconSolid className="h-5 w-5 text-yellow-400" />
                <span className="font-medium">4.8</span>
                <span className="text-gray-600">
                  ({mockDress.reviews.length} reviews)
                </span>
              </div>
            </div>
            <div className="space-y-6">
              {mockDress.reviews.map((review) => (
                <div
                  key={review.id}
                  className="border-b border-gray-200 pb-6 last:border-0"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{review.user}</p>
                      <p className="text-sm text-gray-600">{review.date}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIconSolid
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Booking */}
        <div className="space-y-6">
          {/* Owner Info */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600">
                {mockDress.owner.name[0]}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {mockDress.owner.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPinIcon className="h-4 w-4" />
                      <span>{mockDress.owner.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <StarIconSolid className="h-5 w-5 text-yellow-400" />
                    <span className="font-medium">
                      {mockDress.owner.rating}
                    </span>
                    <span className="text-gray-600">
                      ({mockDress.owner.reviews} reviews)
                    </span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4 text-gray-400" />
                    <span>Member since {mockDress.owner.memberSince}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4 text-gray-400" />
                    <span>Responds {mockDress.owner.responseTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Calendar */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Select Dates</h2>
            <Calendar
              unavailableDates={mockDress.availability.unavailableDates}
              onDateSelect={handleDateSelect}
              minRentalDays={mockDress.availability.minRentalDays}
              maxRentalDays={mockDress.availability.maxRentalDays}
            />
          </div>

          {/* Booking Summary */}
          <div className="bg-white p-6 rounded-lg shadow-sm sticky bottom-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-2xl font-bold">${mockDress.price}</p>
                <p className="text-gray-600">per day</p>
              </div>
              {selectedDates.length === 2 && (
                <div className="text-right">
                  <p className="text-gray-600">
                    Total for{" "}
                    {Math.ceil(
                      (selectedDates[1].getTime() -
                        selectedDates[0].getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    days
                  </p>
                  <p className="text-2xl font-bold">${calculateTotal()}</p>
                </div>
              )}
            </div>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPinIcon className="h-4 w-4" />
                <span>Pickup/Dropoff at {mockDress.pickupLocation}</span>
              </div>
            </div>
            <button
              className={`w-full btn-primary ${
                selectedDates.length !== 2
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={selectedDates.length !== 2}
            >
              {selectedDates.length === 2
                ? "Request to Rent"
                : "Select Dates to Rent"}
            </button>
            <p className="text-sm text-gray-600 mt-2 text-center">
              You won't be charged yet
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
