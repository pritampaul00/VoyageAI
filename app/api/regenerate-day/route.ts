import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const DAY_REGEN_PROMPT = `
You are a professional travel planner.

Regenerate ONE day of an itinerary.

Rules.

Keep the same destination.
Keep realistic travel flow.
Do not repeat existing places.
Group nearby attractions.
Include at least 3 activities.
Include one food experience.

Return JSON only.

Structure:

{
  "day": number,
  "theme": "string",
  "best_time_to_visit_day": "string",
  "activities": [
    {
      "place_name": "string",
      "activity_type": "string",
      "description": "string",
      "location": "string",
      "estimated_visit_minutes": 60,
      "start_time": "09:00 AM",
      "end_time": "10:00 AM",
      "travel_time": "string"
    }
  ]
}
`

export async function POST(req: NextRequest) {

  const { destination, day, existingPlaces } = await req.json()

  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY
  })

  const completion = await openai.chat.completions.create({
    model: "meta-llama/llama-3.1-70b-instruct",
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: DAY_REGEN_PROMPT
      },
      {
        role: "user",
        content: `
Destination: ${destination}

Regenerate itinerary for Day ${day}.

Do not include these places:
${existingPlaces.join(", ")}
`
      }
    ]
  })

  const content = completion.choices?.[0]?.message?.content

  if (!content) {
    return NextResponse.json(
      { error: "AI failed" },
      { status: 500 }
    )
  }

  const parsed = JSON.parse(content)

  return NextResponse.json(parsed)
}

