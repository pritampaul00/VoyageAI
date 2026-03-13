// app/create-new-trip/_components/DayTimeline.tsx 

"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TripInfo } from "./Chatbox";
import { useTripDetail } from "@/app/provider";

type DayData = NonNullable<TripInfo["itinerary"]>[number];
type Activity = NonNullable<DayData["activities"]>[number];

type Props = {
  dayTitle: string;
  activities?: Activity[];
};

export default function DayTimeline({ dayTitle, activities = [] }: Props) {
  const { setSelectedPlace } = useTripDetail();

  return (
    <div className="space-y-10 max-w-[700px]">
      <h2 className="text-xl font-semibold">{dayTitle}</h2>

      <div className="relative border-l border-gray-300 ml-4">
        {activities.map((activity, index) => {
          const image =
            activity.place_image_url ||
            activity.image ||
            "/travel.jpg";

          const hasTime = activity.start_time && activity.end_time;

          return (
            <div key={index} className="ml-6 mb-10 relative">

              <span className="absolute -left-[17px] top-4 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />

              {hasTime && (
                <p className="text-sm font-semibold text-gray-700">
                  {activity.start_time} - {activity.end_time}
                </p>
              )}

              {activity.travel_time && (
                <p className="text-xs text-gray-400 mb-3">
                  Travel Time: {activity.travel_time}
                </p>
              )}

              <div
                className="flex gap-4 bg-white border rounded-xl p-4 shadow-sm hover:shadow-lg cursor-pointer transition-all duration-200"
                onClick={() => {
                  if (!activity.geo_coordinates) return;

                  setSelectedPlace({
                    latitude: activity.geo_coordinates.latitude,
                    longitude: activity.geo_coordinates.longitude,
                  });
                }}
              >
                <div className="relative w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={image}
                    alt={activity.place_name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-col flex-1">
                  <h3 className="font-semibold">
                    {activity.place_name}
                  </h3>

                  {activity.description && (
                    <p className="text-sm text-gray-600">
                      {activity.description}
                    </p>
                  )}

                  {activity.location && (
                    <p className="text-xs text-gray-400 mt-1">
                      {activity.location}
                    </p>
                  )}

                  <div className="mt-3">
                    <Link
                      href={
                        "https://www.google.com/maps/search/?api=1&query=" +
                        encodeURIComponent(activity.place_name)
                      }
                      target="_blank"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button size="sm" variant="outline">
                        <ExternalLink size={14} />
                        View Place
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}


// last version
// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import { ExternalLink } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { TripInfo } from "./Chatbox";
// import { useTripDetail } from "@/app/provider";

// type DayData = NonNullable<TripInfo["itinerary"]>[number];
// type Activity = NonNullable<DayData["activities"]>[number];

// type Props = {
//     dayTitle: string;
//     activities?: Activity[];
// };

// export default function DayTimeline({ dayTitle, activities = [] }: Props) {
//     const { setSelectedPlace, setHoverPlace } = useTripDetail();
//     return (
//         <div className="space-y-10 max-w-[700px]">
//             <h2 className="text-xl font-semibold">{dayTitle}</h2>
//             <div className="relative border-l border-gray-300 ml-4">
//                 {activities.map((activity, index) => {
//                     const image =
//                         activity.place_image_url ||
//                         activity.image ||
//                         "/travel.jpg";
//                     return (
//                         <div key={index} className="ml-6 mb-10 relative">
//                             <span className="absolute -left-[17px] top-4 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
//                             <p className="text-sm font-semibold text-gray-700">
//                                 {activity.start_time} - {activity.end_time}
//                             </p>
//                             {activity.travel_time && (
//                                 <p className="text-xs text-gray-400 mb-3">
//                                     Travel Time: {activity.travel_time}
//                                 </p>
//                             )}
//                             <div
//                                 className="flex gap-4 bg-white border rounded-xl p-4 shadow-sm hover:shadow-md cursor-pointer transition"
//                                 onClick={() => {
//                                     if (activity.geo_coordinates) {
//                                         setSelectedPlace({
//                                             latitude: activity.geo_coordinates.latitude,
//                                             longitude: activity.geo_coordinates.longitude
//                                         });
//                                     }
//                                 }}
//                             >
//                                 <div className="relative w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
//                                     <Image
//                                         src={image}
//                                         alt={activity.place_name}
//                                         fill
//                                         className="object-cover"
//                                     />
//                                 </div>
//                                 <div className="flex flex-col flex-1">
//                                     <h3 className="font-semibold">
//                                         {activity.place_name}
//                                     </h3>
//                                     {activity.description && (
//                                         <p className="text-sm text-gray-600">
//                                             {activity.description}
//                                         </p>
//                                     )}
//                                     {activity.location && (
//                                         <p className="text-xs text-gray-400 mt-1">
//                                             {activity.location}
//                                         </p>
//                                     )}
//                                     <div className="mt-3">
//                                         <Link
//                                             href={
//                                                 "https://www.google.com/maps/search/?api=1&query=" +
//                                                 encodeURIComponent(activity.place_name)
//                                             }
//                                             target="_blank"
//                                             onClick={(e) => e.stopPropagation()}
//                                         >
//                                             <Button size="sm" variant="outline">
//                                                 <ExternalLink size={14} />
//                                                 View Place
//                                             </Button>
//                                         </Link>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>
//         </div>
//     );
// }
