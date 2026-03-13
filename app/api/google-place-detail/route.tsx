import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const cache = new Map<string, string>();

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    if (!rawBody) {
      return NextResponse.json(
        { error: "Empty request body" },
        { status: 400 }
      );
    }

    const { placeName } = JSON.parse(rawBody);

    if (!placeName || typeof placeName !== "string") {
      return NextResponse.json(
        { error: "Invalid placeName" },
        { status: 400 }
      );
    }

    // Simple in memory cache to prevent duplicate calls
    if (cache.has(placeName)) {
      return NextResponse.json(cache.get(placeName));
    }

    const BASE_URL =
      "https://places.googleapis.com/v1/places:searchText";

    const config = {
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.GOOGLE_PLACE_API_KEY!,
        "X-Goog-FieldMask":
          "places.photos,places.displayName,places.id",
      },
    };

    const result = await axios.post(
      BASE_URL,
      { textQuery: placeName },
      config
    );

    const place = result?.data?.places?.[0];

    if (!place?.photos?.length) {
      return NextResponse.json(
        { error: "No photo found" },
        { status: 404 }
      );
    }

    const photoRef = place.photos[0].name;

    const photoUrl =
      `https://places.googleapis.com/v1/${photoRef}/media` +
      `?maxHeightPx=1000&maxWidthPx=1000&key=${process.env.GOOGLE_PLACE_API_KEY}`;

    cache.set(placeName, photoUrl);

    return NextResponse.json(photoUrl);
  } catch (error) {
    console.error("Google Place API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}