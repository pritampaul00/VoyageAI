import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { aj } from "../../../lib/arcjet"
import { auth } from "@clerk/nextjs/server"
import { getPlaceCoordinates } from "@/lib/getPlaceCoordinates"

const PROMPT = `
You are an AI Trip Planner Agent.

You must collect trip details in this strict order.

1. origin
2. destination
3. group_size
4. budget
5. duration

Rules.

Ask only one question at a time.
Do not skip order.
If a field is already provided move to the next.
If user provides "X to Y" extract origin and destination correctly.
Return JSON only.

Always respond in this exact structure.

{
  "resp": "question or confirmation",
  "ui": "text | groupSize | budget | TripDuration | final",
  "collected": {
    "origin": "",
    "destination": "",
    "group_size": "",
    "budget": "",
    "duration": ""
  }
}

When all fields are collected.

Set ui to "final".
Do not generate itinerary yet.
`

const FINAL_PROMPT = `
You are a professional travel planner AI.

Generate a realistic travel itinerary.

Rules.

Group nearby attractions on the same day.
Do not place far attractions on the same day.
Each day must include morning afternoon evening activities.
Each day must include at least one food experience.
Avoid repeating attractions.
Prefer famous highly rated attractions.
Activities must follow logical time order.
Include estimated visit duration.

Day structure.

Morning major attraction.
Afternoon museum cultural or shopping.
Evening relaxed activity market waterfront or nightlife.

Minimum 3 activities per day.
Maximum 6 activities per day.

Return JSON only.

Structure.

{
  "trip_plan": {
    "origin": "string",
    "destination": "string",
    "duration": "string",
    "budget": "string",
    "group_size": "string",

    "travel_overview": {
      "flight_duration": "string",
      "typical_flight_cost_per_person": "string",
      "recommended_airlines": ["string"]
    },

    "visa_info": {
      "visa_type": "string",
      "visa_fee": "string",
      "processing_time": "string",
      "documents_required": ["string"]
    },

    "budget_estimate": {
      "flights": "string",
      "hotel": "string",
      "food": "string",
      "transport": "string",
      "sightseeing": "string",
      "total_estimate": "string"
    },

    "tips": ["string"],

    "hotels": [
      {
        "hotel_name": "string",
        "hotel_address": "string",
        "price_per_night": "string",
        "rating": "string",
        "description": "string"
      }
    ],

    "itinerary": [
      {
        "day": 1,
        "theme": "short description of the day's focus",
        "best_time_to_visit_day": "string",

        "activities": [
          {
            "place_name": "string",
            "activity_type": "attraction | museum | park | landmark | food | shopping | cultural | nightlife",
            "description": "short description",
            "location": "area or neighborhood",
            "estimated_visit_minutes": 60,
            "start_time": "09:00 AM",
            "end_time": "10:00 AM",
            "travel_time": "string",
            "place_image_url": "string"
          }
        ]
      }
    ]
  }
}
`



const imageCache = new Map<string, string>()

async function fetchPlaceImage(placeName: string) {
  try {
    if (!placeName) return null

    if (imageCache.has(placeName)) {
      return imageCache.get(placeName)!
    }

    const BASE_URL = "https://places.googleapis.com/v1/places:searchText"

    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.GOOGLE_PLACE_API_KEY!,
        "X-Goog-FieldMask": "places.photos"
      },
      body: JSON.stringify({
        textQuery: placeName
      })
    })

    const data = await response.json()

    const photoRef = data?.places?.[0]?.photos?.[0]?.name

    if (!photoRef) return null

    const imageUrl =
      "https://places.googleapis.com/v1/" +
      photoRef +
      "/media?maxHeightPx=800&key=" +
      process.env.GOOGLE_PLACE_API_KEY

    imageCache.set(placeName, imageUrl)

    return imageUrl
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {

  const { messages, isFinal, collected } = await req.json()

  const { userId, has } = await auth()
  const hasPremiumAccess = has?.({ plan: "monthly" })

  const decision = await aj.protect(req, {
    userId: userId ?? "",
    requested: isFinal ? 5 : 0
  })

  // @ts-ignore
  if (decision?.reason?.remaining === 0 && !hasPremiumAccess) {
    return NextResponse.json({
      resp: "Your Daily Limit Reached",
      ui: "limit"
    })
  }

  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
      "HTTP-Referer":
        process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      "X-Title": "Roamify AI"
    }
  })

  try {

    const completion = await openai.chat.completions.create({
      model: "meta-llama/llama-3.1-70b-instruct",
      temperature: 0.0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: isFinal
            ? FINAL_PROMPT
            : PROMPT +
            `
Collected fields so far.

origin: ${collected?.origin || ""}
destination: ${collected?.destination || ""}
group_size: ${collected?.group_size || ""}
budget: ${collected?.budget || ""}
duration: ${collected?.duration || ""}
`
        },
        ...messages
      ]
    })

    const message = completion.choices?.[0]?.message

    if (!message?.content) {
      return NextResponse.json(
        { resp: "No response from AI model.", ui: "text" },
        { status: 500 }
      )
    }

    const parsed = JSON.parse(message.content)

    if (isFinal) {

      if (!parsed.trip_plan) {
        return NextResponse.json(
          { resp: "Failed to generate trip plan.", ui: "text" },
          { status: 500 }
        )
      }

      const plan = parsed.trip_plan

      if (plan.hotels?.length) {
        await Promise.all(
          plan.hotels.map(async (hotel: any) => {

            const image = await fetchPlaceImage(hotel.hotel_name)

            if (image) {
              hotel.hotel_image_url = image
            }

          })
        )
      }

      if (plan.itinerary?.length) {
        await Promise.all(
          plan.itinerary.map(async (day: any) => {

            if (!day.activities?.length) return

            await Promise.all(
              day.activities.map(async (activity: any) => {

                const placeQuery =
                  activity.place_name + " " + plan.destination

                const image = await fetchPlaceImage(placeQuery)

                if (image) {
                  activity.place_image_url = image
                }

                const coords =
                  await getPlaceCoordinates(placeQuery)

                if (coords) {
                  activity.geo_coordinates = coords
                }

              })
            )
          })
        )
      }

      return NextResponse.json({
        trip_plan: plan,
        ui: "final",
        resp: "Trip created successfully."
      })
    }

    if (!parsed.resp) {
      parsed.resp = "Please continue with the trip details."
    }

    if (!parsed.ui) {
      parsed.ui = "text"
    }

    if (!parsed.collected) {
      parsed.collected = {
        origin: "",
        destination: "",
        group_size: "",
        budget: "",
        duration: ""
      }
    }

    return NextResponse.json(parsed)

  } catch (e: any) {

    if (e?.status === 402) {
      return NextResponse.json(
        {
          resp: "AI usage limit reached. Please try again later.",
          ui: "text"
        },
        { status: 402 }
      )
    }

    return NextResponse.json(
      {
        resp: "An unexpected error occurred while communicating with the AI.",
        ui: "text"
      },
      { status: 500 }
    )
  }
}



