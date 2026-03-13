"use client"

import { useTripDetail } from "@/app/provider"
import { TripInfo } from "./Chatbox"

type Props = {
  trip: TripInfo
}

function getRouteColor(index: number, total: number) {
  const hue = (index * 360) / total
  return `hsl(${hue},70%,50%)`
}

export default function DaySelector({ trip }: Props) {

  const { selectedDay, setSelectedDay } = useTripDetail()

  const days = trip.itinerary ?? []

  return (
    <div className="w-full bg-white rounded-xl border shadow-sm flex overflow-hidden text-sm">

      <div
        onClick={() => setSelectedDay(null)}
        className={`flex-1 flex items-center justify-center py-2 cursor-pointer transition
        ${selectedDay === null ? "bg-gray-100 font-semibold" : "hover:bg-gray-50"}
        `}
      >
        All
      </div>

      {days.map((day, i) => (
        <div
          key={i}
          onClick={() => setSelectedDay(i)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 border-l cursor-pointer transition
          ${selectedDay === i ? "bg-gray-100 font-semibold" : "hover:bg-gray-50"}
          `}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: getRouteColor(i, days.length)
            }}
          />

          <span>Day {i + 1}</span>
        </div>
      ))}
    </div>
  )
}