type Coordinates = {
  latitude: number
  longitude: number
} | null

export async function getPlaceCoordinates(placeName: string): Promise<Coordinates> {
  try {
    if (!placeName) return null

    const BASE_URL = "https://places.googleapis.com/v1/places:searchText"

    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.GOOGLE_PLACE_API_KEY!,
        "X-Goog-FieldMask": "places.location"
      },
      body: JSON.stringify({
        textQuery: placeName
      })
    })

    const data = await res.json()

    const location = data?.places?.[0]?.location

    if (!location) return null

    return {
      latitude: location.latitude,
      longitude: location.longitude
    }

  } catch {
    return null
  }
}

