type Coordinates = {
  latitude: number
  longitude: number
}

type RouteResult = {
  geometry: GeoJSON.LineString
  durationMinutes: number
  distanceKm: number
  mode: string
} | null

const routeCache = new Map<string, RouteResult>()

function buildKey(
  start: Coordinates,
  end: Coordinates,
  mode: string
) {
  return [
    start.latitude,
    start.longitude,
    end.latitude,
    end.longitude,
    mode
  ].join(",")
}

export async function getRoute(
  start: Coordinates,
  end: Coordinates,
  mode: "driving" | "walking" | "cycling" = "driving"
): Promise<RouteResult> {

  if (!start || !end) return null

  const key = buildKey(start, end, mode)

  if (routeCache.has(key)) {
    return routeCache.get(key)!
  }

  const token = process.env.NEXT_PUBLIC_MAPBOX_API_KEY

  const url =
    `https://api.mapbox.com/directions/v5/mapbox/${mode}/` +
    `${start.longitude},${start.latitude};${end.longitude},${end.latitude}` +
    `?geometries=geojson&overview=full&access_token=${token}`

  const res = await fetch(url)

  if (!res.ok) {
    return null
  }

  const data = await res.json()

  if (!data.routes?.length) {
    routeCache.set(key, null)
    return null
  }

  const route = data.routes[0]

  const result: RouteResult = {
    geometry: route.geometry,
    durationMinutes: Math.round(route.duration / 60),
    distanceKm: Number((route.distance / 1000).toFixed(1)),
    mode
  }

  routeCache.set(key, result)

  return result
}



