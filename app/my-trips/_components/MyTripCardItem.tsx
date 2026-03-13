import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowBigRight } from "lucide-react";
import { TripInfo } from "@/app/create-new-trip/_components/Chatbox";
import axios from "axios";
import Link from "next/link";

type Trip = {
  tripId: string;
  tripDetail: TripInfo;
};

type Props = {
  trip: Trip;
};

function MyTripCardItem({ trip }: Props) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (trip?.tripDetail?.destination) {
      GetGooglePlaceDetail();
    }
  }, [trip]);

  const GetGooglePlaceDetail = async () => {
    try {
      const result = await axios.post("/api/google-place-detail", {
        placeName: trip?.tripDetail?.destination,
      });

      if (result?.data?.e) {
        setPhotoUrl(null);
        return;
      }

      const url =
        typeof result?.data === "string" && result.data.trim().length > 0
          ? result.data
          : null;

      setPhotoUrl(url);
    } catch (error) {
      setPhotoUrl(null);
    }
  };

  const imageSrc =
    typeof photoUrl === "string" && photoUrl.trim().length > 0
      ? photoUrl
      : "/travel.jpg";

  return (
    <Link
      href={"/view-trips/" + trip?.tripId}
      className="p-3 shadow rounded-2xl"
    >
      <Image
        src={imageSrc}
        alt={trip?.tripId || "trip image"}
        width={400}
        height={400}
        className="rounded-2xl object-cover w-full h-[270px]"
      />

      <h2 className="flex gap-2 font-semibold text-xl mt-2">
        {trip?.tripDetail?.origin}
        <ArrowBigRight />
        {trip?.tripDetail?.destination}
      </h2>

      <h2 className="mt-2 text-gray-500">
        {trip?.tripDetail?.duration} Trip with{" "}
        {trip?.tripDetail?.budget} Budget
      </h2>
    </Link>
  );
}

export default MyTripCardItem;