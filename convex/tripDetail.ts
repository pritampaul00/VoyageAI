// convex/tripDetail.ts

import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const createTripDetail = mutation({
  args: {
    tripId: v.string(),
    tripDetail: v.any(),
    uid: v.id("UserTable"),
    createdAt: v.string()
  },

  handler: async (ctx, args) => {

    const user = await ctx.db.get(args.uid)

    if (!user) {
      throw new Error(`User with ID ${args.uid} does not exist in UserTable`)
    }

    const id = await ctx.db.insert("TripDetailTable", {
      tripId: args.tripId,
      tripDetail: args.tripDetail,
      uid: args.uid,
      createdAt: args.createdAt
      //createdAt: new Date().toISOString(),
    })

    return await ctx.db.get(id)
  },
})

export const GetTripById = query({
  args: {
    tripId: v.string(),
  },

  handler: async (ctx, args) => {

    const trip = await ctx.db
      .query("TripDetailTable")
      .withIndex("by_tripId", q =>
        q.eq("tripId", args.tripId)
      )
      .first()

    return trip ?? null
  },
})

export const GetUserTrips = query({
  args: {
    uid: v.id("UserTable"),
  },

  handler: async (ctx, args) => {

    return await ctx.db
      .query("TripDetailTable")
      .withIndex("by_user", q =>
        q.eq("uid", args.uid)
      )
      .collect()

  },
})

