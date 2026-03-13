"use client";

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTripDetail } from "@/app/provider";
import { TripInfo } from "./Chatbox";
import { optimizeRoute } from "@/lib/routeOptimizer";
import { getRoute } from "@/lib/mapboxDirections";

type DayData = NonNullable<TripInfo["itinerary"]>[number];
type Activity = NonNullable<DayData["activities"]>[number];

function getRouteColor(index: number, total: number) {
  const hue = (index * 360) / total;
  return `hsl(${hue},70%,50%)`;
}

function animateRouteLine(
  map: mapboxgl.Map,
  sourceId: string,
  coordinates: number[][]
) {
  let i = 1;
  const partial: number[][] = [coordinates[0]];

  const animate = () => {
    if (!map) return;

    const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource | undefined;
    if (!source) return;

    if (i >= coordinates.length) return;

    partial.push(coordinates[i]);

    source.setData({
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: partial,
      },
    });

    i++;
    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
}

function GlobalMap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const loadedRef = useRef(false);

  const { tripDetailInfo, selectedPlace, selectedDay, setSelectedDay } =
    useTripDetail();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY || "";

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [0, 20],
      zoom: 2,
      projection: "globe",
    });

    map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    mapRef.current = map;

    map.on("load", () => {
      loadedRef.current = true;
    });

    return () => map.remove();
  }, []);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !loadedRef.current || !tripDetailInfo) return;
    if (!map.isStyleLoaded()) return;

    let cancelled = false;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const bounds = new mapboxgl.LngLatBounds();

    const days: DayData[] = tripDetailInfo.itinerary ?? [];
    const hotels = tripDetailInfo.hotels ?? [];

    const style = map.getStyle();

    if (style?.sources) {
      Object.keys(style.sources).forEach((sourceId) => {
        if (sourceId.startsWith("route-day-")) {
          const layerId = sourceId.replace("route-day", "route-line-day");

          if (map.getLayer(layerId)) map.removeLayer(layerId);
          if (map.getSource(sourceId)) map.removeSource(sourceId);
        }
      });
    }

    const drawRoutes = async () => {
      for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
        if (cancelled) return;

        const day = days[dayIndex];

        if (selectedDay !== null && selectedDay !== dayIndex) continue;

        const optimizedActivities = optimizeRoute(day.activities ?? []);

        let placeIndex = 1;

        for (let i = 0; i < optimizedActivities.length; i++) {
          if (cancelled) return;

          const activity = optimizedActivities[i];
          const coords = activity.geo_coordinates;

          if (!coords) continue;

          const lat = Number(coords.latitude);
          const lng = Number(coords.longitude);

          if (!lat || !lng) continue;

          const el = document.createElement("div");

          el.style.cssText = `
            width:28px;
            height:28px;
            border-radius:50%;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:12px;
            font-weight:bold;
            color:white;
            border:3px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,0.25);
            cursor:pointer;
          `;

          const dayColor = getRouteColor(dayIndex, days.length);
          el.style.background = dayColor;
          el.innerText = String(placeIndex);

          if (
            selectedPlace &&
            selectedPlace.latitude === lat &&
            selectedPlace.longitude === lng
          ) {
            el.style.background = "#4f46e5";
          }

          const marker = new mapboxgl.Marker({ element: el })
            .setLngLat([lng, lat])
            .setPopup(
              new mapboxgl.Popup({ offset: 20 }).setHTML(`
                <div style="padding:8px">
                  <p style="font-weight:600;margin:0">${activity.place_name}</p>
                  <p style="font-size:11px;margin:2px 0">Day ${dayIndex + 1}</p>
                </div>
              `)
            );

          marker.addTo(map);

          markersRef.current.push(marker);
          bounds.extend([lng, lat]);

          placeIndex++;

          if (i < optimizedActivities.length - 1) {
            const next = optimizedActivities[i + 1];

            const route = await getRoute(
              activity.geo_coordinates,
              next.geo_coordinates
            );

            if (!route || cancelled) continue;

            const sourceId = `route-day-${dayIndex}-${i}`;
            const layerId = `route-line-day-${dayIndex}-${i}`;
            const routeCoords = route.geometry.coordinates as number[][];

            if (!map.getSource(sourceId)) {
              map.addSource(sourceId, {
                type: "geojson",
                data: {
                  type: "Feature",
                  geometry: {
                    type: "LineString",
                    coordinates: [routeCoords[0]],
                  },
                  properties: {},
                },
              });
            }

            if (!map.getLayer(layerId)) {
              map.addLayer({
                id: layerId,
                type: "line",
                source: sourceId,
                paint: {
                  "line-color": getRouteColor(dayIndex, days.length),
                  "line-width": 5,
                  "line-opacity": 0.9,
                },
              });
            }

            animateRouteLine(map, sourceId, routeCoords);
          }
        }
      }

      hotels.forEach((hotel) => {
        const coords = hotel.geo_coordinates;
        if (!coords) return;

        const lat = Number(coords.latitude);
        const lng = Number(coords.longitude);

        const el = document.createElement("div");
        el.innerHTML = "🏨";
        el.style.fontSize = "22px";

        const marker = new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .setPopup(new mapboxgl.Popup().setText(hotel.hotel_name));

        marker.addTo(map);
        markersRef.current.push(marker);
        bounds.extend([lng, lat]);
      });

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, {
          padding: 80,
          duration: 1200,
        });
      }
    };

    drawRoutes();

    return () => {
      cancelled = true;
    };
  }, [tripDetailInfo, selectedDay, selectedPlace]);

  useEffect(() => {
    if (!mapRef.current || !selectedPlace) return;

    mapRef.current.flyTo({
      center: [selectedPlace.longitude, selectedPlace.latitude],
      zoom: 14,
      speed: 0.8,
    });
  }, [selectedPlace]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />

      {tripDetailInfo?.itinerary && (
        <div className="absolute top-4 left-4 right-4 bg-white/90 backdrop-blur rounded-xl shadow flex text-xs overflow-hidden z-20">
          <div
            onClick={() => setSelectedDay(null)}
            className={`flex-1 flex items-center justify-center py-2 cursor-pointer border-r ${
              selectedDay === null ? "bg-gray-100 font-semibold" : "hover:bg-gray-50"
            }`}
          >
            All
          </div>

          {(tripDetailInfo.itinerary ?? []).map((_, index) => (
            <div
              key={index}
              onClick={() => setSelectedDay(index)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 cursor-pointer border-r last:border-r-0 ${
                selectedDay === index ? "bg-gray-100 font-semibold" : "hover:bg-gray-50"
              }`}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: getRouteColor(
                    index,
                    (tripDetailInfo.itinerary ?? []).length
                  ),
                }}
              />
              <span>Day {index + 1}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GlobalMap;