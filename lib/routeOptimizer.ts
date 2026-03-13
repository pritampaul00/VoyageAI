// lib/routeOptimizer.ts

export function distance(a: any, b: any) {

  if (!a || !b) return Infinity

  if (
    a.latitude === undefined ||
    a.longitude === undefined ||
    b.latitude === undefined ||
    b.longitude === undefined
  ) {
    return Infinity
  }

  const R = 6371

  const dLat = (b.latitude - a.latitude) * Math.PI / 180
  const dLng = (b.longitude - a.longitude) * Math.PI / 180

  const lat1 = a.latitude * Math.PI / 180
  const lat2 = b.latitude * Math.PI / 180

  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) *
    Math.cos(lat1) *
    Math.cos(lat2)

  const y = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))

  return R * y
}

export function optimizeRoute(activities: any[]) {

  if (!activities || activities.length <= 2) return activities

  const validActivities = activities.filter(
    a => a?.geo_coordinates?.latitude && a?.geo_coordinates?.longitude
  )

  if (validActivities.length <= 2) return activities

  const remaining = [...validActivities]
  const route: any[] = []

  let current = remaining.shift()

  if (!current) return activities

  route.push(current)

  while (remaining.length) {

    let nearestIndex = 0
    let nearestDistance = Infinity

    remaining.forEach((candidate, i) => {

      const d = distance(
        current.geo_coordinates,
        candidate.geo_coordinates
      )

      if (d < nearestDistance) {
        nearestDistance = d
        nearestIndex = i
      }

    })

    current = remaining.splice(nearestIndex, 1)[0]
    route.push(current)

  }

  return route
}

export function estimateTravelMinutes(a: any, b: any) {

  if (!a || !b) return 0

  if (
    a.latitude === undefined ||
    a.longitude === undefined ||
    b.latitude === undefined ||
    b.longitude === undefined
  ) {
    return 0
  }

  const km = distance(a, b)

  const avgSpeed = 25

  const hours = km / avgSpeed

  return Math.round(hours * 60)
}





// export function distance(a: any, b: any) {
//   // guard against missing coordinates
//   if (
//     !a ||
//     !b ||
//     a.latitude === undefined ||
//     a.longitude === undefined ||
//     b.latitude === undefined ||
//     b.longitude === undefined
//   ) {
//     return Infinity
//   }

//   const R = 6371

//   const dLat = ((b.latitude - a.latitude) * Math.PI) / 180
//   const dLng = ((b.longitude - a.longitude) * Math.PI) / 180

//   const lat1 = (a.latitude * Math.PI) / 180
//   const lat2 = (b.latitude * Math.PI) / 180

//   const x =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.sin(dLng / 2) *
//       Math.sin(dLng / 2) *
//       Math.cos(lat1) *
//       Math.cos(lat2)

//   const y = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))

//   return R * y
// }

// export function optimizeRoute(activities: any[]) {
//   if (!activities || activities.length <= 2) return activities

//   // remove activities without coordinates
//   const validActivities = activities.filter(
//     (a) =>
//       a?.geo_coordinates?.latitude !== undefined &&
//       a?.geo_coordinates?.longitude !== undefined
//   )

//   if (validActivities.length <= 2) return validActivities

//   const remaining = [...validActivities]
//   const route: any[] = []

//   let current = remaining.shift()
//   route.push(current)

//   while (remaining.length) {
//     let nearestIndex = 0
//     let nearestDistance = Infinity

//     remaining.forEach((candidate, i) => {
//       const d = distance(
//         current.geo_coordinates,
//         candidate.geo_coordinates
//       )

//       if (d < nearestDistance) {
//         nearestDistance = d
//         nearestIndex = i
//       }
//     })

//     current = remaining.splice(nearestIndex, 1)[0]
//     route.push(current)
//   }

//   return route
// }

// /* estimate travel time between two places */
// export function estimateTravelMinutes(a: any, b: any) {
//   if (!a || !b) return 0

//   const km = distance(a, b)

//   if (!isFinite(km)) return 0

//   const avgSpeed = 25
//   const hours = km / avgSpeed

//   return Math.round(hours * 60)
// }