"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Clock, ExternalLink, Ticket, MapPin } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { TripInfo } from "./Chatbox";
import { useTripDetail } from "@/app/provider";

type DayData = NonNullable<TripInfo["itinerary"]>[number];

type Activity = NonNullable<DayData["activities"]>[number] & {
  place_image_url?: string;
  ticket_pricing?: string;
  // best_time_to_visit?: string;
  activity_type?: string;
  estimated_visit_minutes?: number;
  start_time?: string;
  end_time?: string;
};

type Props = {
  activity: Activity;
};

function getActivityIcon(type?: string) {
  const icons: Record<string, string> = {
    attraction: "📍",
    museum: "🏛",
    park: "🌳",
    food: "🍽",
    shopping: "🛍",
    nightlife: "🌙",
    beach: "🏖",
    landmark: "📸",
  };

  return icons[type ?? ""] ?? "📍";
}

function PlaceCardItem({ activity }: Props) {

  const [photoUrl, setPhotoUrl] = useState<string>(
    activity.place_image_url || "/logo.png"
  );

  const [isLoading, setIsLoading] = useState<boolean>(
    !activity.place_image_url
  );

  const { setSelectedPlace, selectedPlace } = useTripDetail();

  const isSelected =
    selectedPlace &&
    activity.geo_coordinates &&
    selectedPlace.latitude === activity.geo_coordinates.latitude &&
    selectedPlace.longitude === activity.geo_coordinates.longitude;

  useEffect(() => {
    if (activity.place_image_url) return;
    if (!activity.place_name) return;

    const controller = new AbortController();

    const fetchPlaceImage = async () => {
      try {

        setIsLoading(true);

        const result = await axios.post(
          "/api/google-place-detail",
          {
            placeName:
              activity.place_name +
              (activity.location ? " " + activity.location : ""),
          },
          { signal: controller.signal }
        );

        if (result?.data && !result?.data?.error) {
          setPhotoUrl(result.data);
        }

      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("Place image fetch failed", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaceImage();

    return () => controller.abort();
  }, [activity.place_name, activity.location, activity.place_image_url]);

  return (
    <div
      onClick={() => {
        if (!activity.geo_coordinates) return;

        setSelectedPlace({
          latitude: activity.geo_coordinates.latitude,
          longitude: activity.geo_coordinates.longitude,
        });
      }}
      className={`flex flex-col bg-white border border-gray-100 rounded-xl overflow-hidden cursor-pointer transition-all duration-150
      ${
        isSelected
          ? "ring-2 ring-indigo-500 shadow-lg"
          : "hover:border-gray-300 hover:shadow-sm"
      }`}
    >

      <div className="relative w-full aspect-[16/10] overflow-hidden bg-gray-100">
        <Image
          src={photoUrl}
          alt={activity?.place_name ?? "Place"}
          fill
          sizes="(max-width:768px) 100vw, 33vw"
          className={`object-cover transition duration-300 ${
            isLoading
              ? "opacity-60 scale-105 blur-sm"
              : "opacity-100 scale-100"
          }`}
        />
      </div>

      <div className="p-3 flex flex-col gap-2 flex-1">

        <div className="flex items-start justify-between gap-2">

          <div className="flex items-center gap-2">
            <span className="text-base">
              {getActivityIcon(activity.activity_type)}
            </span>

            <h3 className="font-semibold text-sm text-gray-900 leading-tight line-clamp-1">
              {activity.place_name}
            </h3>
          </div>

          {activity.start_time && (
            <span className="text-xs text-gray-500">
              {activity.start_time}
            </span>
          )}

        </div>

        {activity.location && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3" />
            {activity.location}
          </div>
        )}

        {activity.description && (
          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
            {activity.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">

          {activity.estimated_visit_minutes && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {activity.estimated_visit_minutes} min
            </div>
          )}

          {activity.end_time && (
            <span>
              until {activity.end_time}
            </span>
          )}

        </div>

        {activity.ticket_pricing && (
          <div className="flex items-center gap-1 text-blue-500">
            <Ticket className="h-3 w-3 flex-shrink-0" />
            <p className="text-xs line-clamp-1">
              {activity.ticket_pricing}
            </p>
          </div>
        )}

        {/* {activity.best_time_to_visit && (
          <div className="flex items-center gap-1 text-orange-400">
            <Clock className="h-3 w-3 flex-shrink-0" />
            <p className="text-xs line-clamp-1">
              Best time: {activity.best_time_to_visit}
            </p>
          </div>
        )} */}

        <Link
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            activity.place_name
          )}`}
          target="_blank"
          className="mt-auto pt-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:border-orange-400 hover:text-orange-500 transition-all duration-150">
            <ExternalLink className="h-3 w-3" />
            View on Maps
          </button>
        </Link>

      </div>

    </div>
  );
}

export default PlaceCardItem;