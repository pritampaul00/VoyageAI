import { useEffect, useMemo, useState } from "react"
import { optimizeRoute } from "@/lib/routeOptimizer"
import { getRoute } from "@/lib/mapboxDirections"

type TravelInfo = Record<
  string,
  {
    minutes: number
    distance: number
    mode: string
  }
>

export function useTripProcessing(
  tripData: any,
  selectedDay: number | null
) {

  const [travelInfo, setTravelInfo] = useState<TravelInfo>({})

  useEffect(() => {

    if (!tripData?.itinerary) return

    const calculateTravel = async () => {

      const info: TravelInfo = {}

      const days =
        selectedDay === null
          ? tripData.itinerary
          : tripData.itinerary?.[selectedDay]
          ? [tripData.itinerary[selectedDay]]
          : []

      for (const day of days ?? []) {

        const activities = optimizeRoute(day.activities ?? [])

        for (let i = 1; i < activities.length; i++) {

          const prev = activities[i - 1]
          const curr = activities[i]

          if (!prev.geo_coordinates || !curr.geo_coordinates) continue

          const key =
            `${prev.place_name}-${curr.place_name}`

          const route = await getRoute(
            prev.geo_coordinates,
            curr.geo_coordinates,
            "walking"
          )

          if (route) {
            info[key] = {
              minutes: route.durationMinutes,
              distance: route.distanceKm,
              mode: route.mode
            }
          }
        }
      }

      setTravelInfo(info)

    }

    calculateTravel()

  }, [tripData, selectedDay])

  const optimizedDays = useMemo(() => {

    if (!tripData?.itinerary) return []

    return tripData.itinerary.map((day: any) => {

      const optimizedActivities =
        optimizeRoute(day.activities ?? [])

      return {
        ...day,
        activities: optimizedActivities
      }

    })

  }, [tripData])

  return {
    optimizedDays,
    travelInfo
  }
}

