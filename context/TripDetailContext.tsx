import { TripInfo } from "@/app/create-new-trip/_components/Chatbox";
import { createContext } from "react";

export type TripContextType = {
  tripDetailInfo: TripInfo | null
  setTripDetailInfo: (trip: TripInfo | null) => void

  viewMode: "map" | "itinerary"
  setViewMode: (mode: "map" | "itinerary") => void

  selectedPlace: {
    latitude: number
    longitude: number
  } | null
  
  setSelectedPlace: (coords: {
    latitude: number
    longitude: number
  } | null) => void

  selectedDay: number | null
  setSelectedDay: (day: number | null) => void

  tripId: string | null
  setTripId: (id: string | null) => void
  
}


export const TripDetailContext =
createContext<TripContextType | undefined>(undefined);








