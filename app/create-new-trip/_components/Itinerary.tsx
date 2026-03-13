"use client"

import React, { useEffect, useState, useMemo } from "react"
import { Timeline } from "@/components/ui/timeline"
import HotelCardItem from "./HotelCardItem"
import PlaceCardItem from "./PlaceCardItem"
import { useTripDetail } from "@/app/provider"
import { TripInfo } from "./Chatbox"
import { MapPin, Calendar, Users, Wallet, Share2 } from "lucide-react"
import { groupActivitiesByTime } from "@/lib/groupActivitiesByTime"
import { useTripProcessing } from "@/hooks/useTripProcessing"
import { getTripSummary } from "@/lib/getTripSummary"
import axios from "axios"

type Hotel = NonNullable<TripInfo["hotels"]>[number]
type DayData = NonNullable<TripInfo["itinerary"]>[number]
type Activity = NonNullable<DayData["activities"]>[number]

type ExtendedTripInfo = TripInfo & {
  travel_overview?: {
    flight_duration?: string
    typical_flight_cost_per_person?: string
    recommended_airlines?: string[]
  }

  visa_info?: {
    visa_type?: string
    visa_fee?: string
    processing_time?: string
    documents_required?: string[]
  }

  budget_estimate?: {
    flights?: string
    hotel?: string
    food?: string
    transport?: string
    sightseeing?: string
    total_estimate?: string
  }

  tips?: string[]
}

function Itinerary() {

  const { tripDetailInfo, selectedDay, tripId } = useTripDetail()

  const [tripData, setTripData] = useState<ExtendedTripInfo | null>(null)

  const { optimizedDays, travelInfo } =
    useTripProcessing(tripData, selectedDay)

  const summary = optimizedDays.length
    ? getTripSummary(optimizedDays, travelInfo)
    : null

  useEffect(() => {
    if (tripDetailInfo) {
      setTripData(tripDetailInfo as ExtendedTripInfo)
    }
  }, [tripDetailInfo])

  async function regenerateDay(dayIndex: number) {

    if (!tripData) return

    const day = tripData.itinerary?.[dayIndex]
    if (!day) return

    const existingPlaces =
      day.activities?.map(a => a.place_name) ?? []

    try {

      const res = await axios.post("/api/regenerate-day", {
        destination: tripData.destination,
        day: day.day,
        existingPlaces
      })

      const newDay = res.data

      const updated = { ...tripData }

      if (updated.itinerary) {
        updated.itinerary[dayIndex] = newDay
      }

      setTripData(updated)

    } catch (err) {
      console.error(err)
    }
  }

  function handleShareTrip() {

    if (!tripId) return

    const url = `${window.location.origin}/trip/${tripId}`

    navigator.clipboard.writeText(url)

    alert("Trip link copied to clipboard")
  }

  const timelineData = useMemo(() => {

    if (!tripData) return []

    const data: any[] = []

    if (tripData.travel_overview) {
      data.push({
        title: "Travel Overview",
        content: (
          <div className="space-y-2 text-xs text-gray-600">
            <p>Flight Duration: {tripData.travel_overview.flight_duration}</p>
            <p>
              Typical Flight Cost:
              {tripData.travel_overview.typical_flight_cost_per_person}
            </p>
            <p>
              Airlines:
              {(tripData.travel_overview.recommended_airlines || []).join(", ")}
            </p>
          </div>
        )
      })
    }

    if (tripData.visa_info) {
      data.push({
        title: "Visa Information",
        content: (
          <div className="space-y-2 text-xs text-gray-600">
            <p>Visa Type: {tripData.visa_info.visa_type}</p>
            <p>Visa Fee: {tripData.visa_info.visa_fee}</p>
            <p>Processing Time: {tripData.visa_info.processing_time}</p>

            <ul className="list-disc ml-6">
              {(tripData.visa_info.documents_required || []).map(
                (doc: string, i: number) => (
                  <li key={i}>{doc}</li>
                )
              )}
            </ul>
          </div>
        )
      })
    }

    if (tripData.budget_estimate) {
      data.push({
        title: "Budget Estimate",
        content: (
          <div className="space-y-1 text-xs text-gray-600">
            <p>Flights: {tripData.budget_estimate.flights}</p>
            <p>Hotel: {tripData.budget_estimate.hotel}</p>
            <p>Food: {tripData.budget_estimate.food}</p>
            <p>Transport: {tripData.budget_estimate.transport}</p>
            <p>Sightseeing: {tripData.budget_estimate.sightseeing}</p>
            <p className="font-medium">
              Total: {tripData.budget_estimate.total_estimate}
            </p>
          </div>
        )
      })
    }

    if (tripData.tips) {
      data.push({
        title: "Travel Tips",
        content: (
          <ul className="list-disc ml-6 space-y-1 text-xs text-gray-600">
            {(tripData.tips || []).map((tip: string, i: number) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        )
      })
    }

    if (tripData.hotels) {
      data.push({
        title: "Hotels",
        content: (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(tripData.hotels ?? []).map((hotel: Hotel, index: number) => (
              <HotelCardItem key={index} hotel={hotel} />
            ))}
          </div>
        )
      })
    }

    optimizedDays
      .filter((_: DayData, index: number) =>
        selectedDay === null || selectedDay === index
      )
      .forEach((dayData: DayData) => {

        const sortedActivities =
          [...(dayData.activities ?? [])].sort((a, b) => {
            if (!a.start_time || !b.start_time) return 0
            return a.start_time.localeCompare(b.start_time)
          })

        const grouped = groupActivitiesByTime(sortedActivities)

        data.push({
          title: `Day ${dayData.day}`,
          content: (
            <div>

              <div className="flex items-center justify-between mb-3">

                {/* <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-orange-400" />
                  <p className="text-xs text-gray-500">
                    Best time: {dayData.best_time_to_visit_day}
                  </p>
                </div> */}

                <button
                  onClick={() => regenerateDay(dayData.day - 1)}
                  className="text-xs px-2 py-1 border rounded-md hover:bg-gray-100"
                >
                  Regenerate Day
                </button>

              </div>

              {grouped.morning.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    Morning
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {grouped.morning.map((activity: Activity, index: number) => (
                      <PlaceCardItem key={index} activity={activity} />
                    ))}
                  </div>
                </div>
              )}

              {grouped.afternoon.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    Afternoon
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {grouped.afternoon.map((activity: Activity, index: number) => (
                      <PlaceCardItem key={index} activity={activity} />
                    ))}
                  </div>
                </div>
              )}

              {grouped.evening.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    Evening
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {grouped.evening.map((activity: Activity, index: number) => (
                      <PlaceCardItem key={index} activity={activity} />
                    ))}
                  </div>
                </div>
              )}

            </div>
          )
        })

      })

    return data

  }, [tripData, selectedDay, optimizedDays])

  if (!tripData) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center">
        <MapPin className="h-6 w-6 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">
          Complete the chat to generate your trip
        </p>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">

      <div className="px-5 py-3 border-b border-gray-100 bg-white flex flex-wrap items-center gap-4 justify-between">

        <div className="flex flex-wrap items-center gap-4">

          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <MapPin className="h-3.5 w-3.5 text-orange-400" />
            <span className="font-medium">{tripData.origin}</span>
            <span className="text-gray-400">→</span>
            <span className="font-medium">{tripData.destination}</span>
          </div>

          {tripData.duration && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              {tripData.duration}
            </div>
          )}

          {tripData.group_size && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Users className="h-3.5 w-3.5 text-gray-400" />
              {tripData.group_size}
            </div>
          )}

          {tripData.budget && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Wallet className="h-3.5 w-3.5 text-gray-400" />
              {tripData.budget}
            </div>
          )}

        </div>

        {tripId && (
          <button
            onClick={handleShareTrip}
            className="flex items-center gap-1 text-xs px-3 py-1 border rounded-md hover:bg-gray-100"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share Trip
          </button>
        )}

      </div>

      {summary && (
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">

            <div className="flex flex-col">
              <span className="text-gray-400">Days</span>
              <span className="font-semibold text-gray-900">
                {summary.totalDays}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-gray-400">Activities</span>
              <span className="font-semibold text-gray-900">
                {summary.totalActivities}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-gray-400">Travel Distance</span>
              <span className="font-semibold text-gray-900">
                {summary.totalDistanceKm} km
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-gray-400">Travel Time</span>
              <span className="font-semibold text-gray-900">
                {summary.totalTravelMinutes} min
              </span>
            </div>

          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <Timeline data={timelineData} tripData={tripData} />
      </div>

    </div>
  )
}

export default Itinerary



