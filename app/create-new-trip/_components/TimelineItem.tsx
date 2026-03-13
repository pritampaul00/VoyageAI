// not included 
"use client"

import { Clock, MapPin } from "lucide-react"
import { TripInfo } from "./Chatbox"

type DayData = NonNullable<TripInfo["itinerary"]>[number]
type Activity = NonNullable<DayData["activities"]>[number]

type TimelineItemProps = {
  activity: Activity
  travelText?: string
}

export default function TimelineItem({
  activity,
  travelText
}: TimelineItemProps) {

  return (
    <div className="space-y-2">

      {travelText && (
        <div className="text-xs text-gray-400 flex items-center gap-2">
          🚶 {travelText}
        </div>
      )}

      <div className="flex gap-3">

        <div className="w-16 text-xs text-gray-500 pt-1">
          {activity.start_time}
        </div>

        <div className="flex-1 border border-gray-200 rounded-lg p-3 bg-white">

          <p className="text-sm font-semibold text-gray-900">
            {activity.place_name}
          </p>

          {activity.location && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <MapPin className="h-3 w-3" />
              {activity.location}
            </div>
          )}

          {activity.description && (
            <p className="text-xs text-gray-600 mt-1">
              {activity.description}
            </p>
          )}

          {activity.end_time && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
              <Clock className="h-3 w-3" />
              until {activity.end_time}
            </div>
          )}

        </div>

      </div>

    </div>
  )
}