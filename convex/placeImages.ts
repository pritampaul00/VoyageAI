import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

export const getPlaceImage = query({
  args: {
    placeName: v.string()
  },
  handler: async (ctx, args) => {

    const record = await ctx.db
      .query("placeImages")
      .filter(q => q.eq(q.field("placeName"), args.placeName))
      .first()

    if (!record) return null

    return record.imageUrl
  }
})

export const savePlaceImage = mutation({
  args: {
    placeName: v.string(),
    imageUrl: v.string()
  },
  handler: async (ctx, args) => {

    await ctx.db.insert("placeImages", {
      placeName: args.placeName,
      imageUrl: args.imageUrl,
      createdAt: Date.now()
    })

  }
})