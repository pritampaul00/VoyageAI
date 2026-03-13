"use client"

import { useQuery } from "convex/react"
import { useParams } from "next/navigation"
import { useEffect } from "react"

import { api } from "@/convex/_generated/api"
import { useTripDetail } from "@/app/provider"

import Itinerary from "@/app/create-new-trip/_components/Itinerary"

export default function TripPage() {

  const params = useParams()
  const tripId = params.tripId as string

  const { setTripDetailInfo } = useTripDetail()

  const trip = useQuery(
    api.tripDetail.GetTripById,
    { tripId }
  )

  useEffect(() => {
    if (trip?.tripDetail) {
      setTripDetailInfo(trip.tripDetail)
    }
  }, [trip, setTripDetailInfo])

  if (trip === undefined) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading trip...
      </div>
    )
  }

  if (trip === null) {
    return (
      <div className="p-10 text-center text-gray-500">
        Trip not found
      </div>
    )
  }

  return (
    <div className="h-screen bg-white">
      <Itinerary />
    </div>
  )

}