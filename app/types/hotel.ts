export type Hotel = {
  hotel_name: string
  hotel_address: string
  price_per_night: string
  rating: number
  description: string
  image_url?: string

  geo_coordinates?: {
    latitude: number
    longitude: number
  }
}