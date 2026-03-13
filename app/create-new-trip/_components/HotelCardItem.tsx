"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import axios from "axios"
import { Star, Wallet, MapPin, ExternalLink } from "lucide-react"
import { Hotel } from "@/app/types/hotel"

type Props = {
  hotel: Hotel & {
    hotel_image_url?: string
  }
}

function HotelCardItem({ hotel }: Props) {
  const [photoUrl, setPhotoUrl] = useState<string>(
    hotel.hotel_image_url || "/logo.png"
  )

  const [isLoading, setIsLoading] = useState<boolean>(
    !hotel.hotel_image_url
  )

  useEffect(() => {
    if (hotel.hotel_image_url) return
    if (!hotel?.hotel_name) return

    const controller = new AbortController()

    const fetchPlaceImage = async () => {
      try {
        setIsLoading(true)

        const { data } = await axios.post(
          "/api/google-place-detail",
          { placeName: hotel.hotel_name },
          { signal: controller.signal }
        )

        if (data && !data.error) {
          setPhotoUrl(data)
        }
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("Failed to fetch place image", error)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlaceImage()

    return () => controller.abort()
  }, [hotel.hotel_name, hotel.hotel_image_url])

  return (
    <div className="flex flex-col bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all duration-150">

      <div className="relative w-full aspect-[16/10] overflow-hidden bg-gray-100">
        <Image
          src={photoUrl}
          alt={hotel?.hotel_name ?? "Hotel"}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className={`object-cover transition duration-300 ${
            isLoading
              ? "opacity-60 scale-105 blur-sm"
              : "opacity-100 scale-100"
          }`}
        />

        <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-semibold text-gray-800">
            {hotel.rating}
          </span>
        </div>
      </div>

      <div className="p-3 flex flex-col gap-1 flex-1">

        <h3 className="font-semibold text-sm text-gray-900 leading-tight line-clamp-1">
          {hotel?.hotel_name}
        </h3>

        <div className="flex items-start gap-1 text-gray-400">
          <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <p className="text-xs line-clamp-1">
            {hotel?.hotel_address}
          </p>
        </div>

        <div className="flex items-center gap-1 text-green-600 mt-0.5">
          <Wallet className="h-3 w-3" />
          <p className="text-xs font-medium">
            {hotel.price_per_night}
          </p>
        </div>

        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
          {hotel?.description}
        </p>

        <Link
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            hotel.hotel_name
          )}`}
          target="_blank"
          className="mt-auto pt-2"
        >
          <button className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:border-orange-400 hover:text-orange-500 transition-all duration-150">
            <ExternalLink className="h-3 w-3" />
            View on Maps
          </button>
        </Link>

      </div>
    </div>
  )
}

export default HotelCardItem


