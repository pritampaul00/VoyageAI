export type TripPlan = {
  origin: string
  destination: string
  duration: string
  group_size: string
  budget: string
  hotels: {
    hotel_name: string
    hotel_address: string
    price_per_night: string
    rating: string
    description: string
    hotel_image_url?: string
  }[]
  itinerary: {
    day: number
    title: string
    summary: string
    hotel_suggestion?: string[]
    timeline: {
      period: "morning" | "afternoon" | "evening" | "night" | "travel"
      time: string
      activity_type:
        | "flight"
        | "transfer"
        | "hotel"
        | "food"
        | "attraction"
        | "shopping"
        | "beach"
        | "nightlife"
        | "ferry"
      title: string
      description?: string
      location?: string
      food_notes?: string[]
      travel_notes?: string
      geo_coordinates?: {
        latitude: number
        longitude: number
      }
      place_image_url?: string
    }[]
  }[]
}