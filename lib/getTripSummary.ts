type TripSummary = {
  totalDays: number
  totalActivities: number
  totalDistanceKm: number
  totalTravelMinutes: number
}

export function getTripSummary(
  itinerary: any[],
  travelInfo: Record<string, any>
): TripSummary {

  let totalActivities = 0
  let totalDistanceKm = 0
  let totalTravelMinutes = 0

  itinerary.forEach(day => {

    const activities = day.activities ?? []

    totalActivities += activities.length

    for (let i = 1; i < activities.length; i++) {

      const prev = activities[i - 1]
      const curr = activities[i]

      const key =
        `${prev.place_name}-${curr.place_name}`

      const travel = travelInfo[key]

      if (travel) {
        totalDistanceKm += travel.distance
        totalTravelMinutes += travel.minutes
      }

    }

  })

  return {
    totalDays: itinerary.length,
    totalActivities,
    totalDistanceKm: Number(totalDistanceKm.toFixed(1)),
    totalTravelMinutes
  }

}

