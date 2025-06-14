"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import { useState } from "react";

interface CalendarProps {
  unavailableDates: string[];
  onDateSelect: (dates: Date[]) => void;
  minRentalDays: number;
  maxRentalDays: number;
}

export function Calendar({
  unavailableDates,
  onDateSelect,
  minRentalDays,
  maxRentalDays,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const unavailableDatesSet = new Set(
    unavailableDates.map((date) => new Date(date).toDateString())
  );

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const handleDateClick = (date: Date) => {
    let newSelectedDates: Date[] = [...selectedDates];
    const dateString = date.toDateString();

    // If date is unavailable, don't allow selection
    if (unavailableDatesSet.has(dateString)) return;

    // If we already have two dates selected, start over
    if (newSelectedDates.length === 2) {
      newSelectedDates = [date];
    }
    // If we have one date selected
    else if (newSelectedDates.length === 1) {
      // If the new date is before the first date, make it the start date
      if (date < newSelectedDates[0]) {
        newSelectedDates = [date, newSelectedDates[0]];
      } else {
        newSelectedDates = [newSelectedDates[0], date];
      }

      // Check if the range is valid
      const days = Math.ceil(
        (newSelectedDates[1].getTime() - newSelectedDates[0].getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (days < minRentalDays || days > maxRentalDays) {
        // If range is invalid, keep only the new date
        newSelectedDates = [date];
      }
    }
    // If we have no dates selected
    else {
      newSelectedDates = [date];
    }

    setSelectedDates(newSelectedDates);
    onDateSelect(newSelectedDates);
  };

  const isDateInRange = (date: Date) => {
    if (selectedDates.length !== 2) return false;
    return date >= selectedDates[0] && date <= selectedDates[1];
  };

  const isDateUnavailable = (date: Date) => {
    return unavailableDatesSet.has(date.toDateString());
  };

  const renderCalendarDays = () => {
    const days = [];
    const today = new Date();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      const isUnavailable = isDateUnavailable(date);
      const isSelected = selectedDates.some(
        (d) => d.toDateString() === date.toDateString()
      );
      const isInRange = isDateInRange(date);
      const isPast =
        date < new Date(today.getFullYear(), today.getMonth(), today.getDate());

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          disabled={isUnavailable || isPast}
          className={`
            h-10 w-10 rounded-full flex items-center justify-center text-sm
            ${
              isUnavailable || isPast
                ? "text-gray-300 cursor-not-allowed"
                : "hover:bg-gray-100"
            }
            ${
              isSelected ? "bg-primary-500 text-white hover:bg-primary-600" : ""
            }
            ${isInRange && !isSelected ? "bg-primary-100" : ""}
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() =>
            setCurrentMonth(
              new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
            )
          }
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <h3 className="text-lg font-semibold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={() =>
            setCurrentMonth(
              new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
            )
          }
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="h-10 flex items-center justify-center text-sm font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
        {/* Calendar days */}
        {renderCalendarDays()}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary-500" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary-100" />
          <span>In Range</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-gray-200" />
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  );
}
