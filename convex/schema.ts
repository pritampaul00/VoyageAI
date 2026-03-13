// convex/schema.ts

import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({

  UserTable: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.string(),
    subscription: v.optional(v.string()),
  })
  .index("by_clerkId", ["clerkId"]),

  TripDetailTable: defineTable({
    tripId: v.string(),
    tripDetail: v.any(),
    uid: v.id("UserTable"),
    createdAt: v.string(),
  })
  .index("by_tripId", ["tripId"])
  .index("by_user", ["uid"]),

  placeImages: defineTable({
    placeName: v.string(),
    imageUrl: v.string(),
    createdAt: v.number(),
  })
  .index("by_placeName", ["placeName"]),

})

// 10-03-2026
// import { defineSchema, defineTable } from "convex/server";
// import { v } from "convex/values";

// export default defineSchema({
//   UserTable: defineTable({
//     clerkId: v.string(),           // Clerk user.id
//     name: v.string(),
//     email: v.string(),
//     imageUrl: v.string(),
//     subscription: v.optional(v.string()),
//   }),

//   TripDetailTable: defineTable({
//     tripId: v.string(),
//     tripDetail: v.any(),
//     uid: v.id("UserTable"),        // Convex UserTable._id ONLY
//     createdAt: v.string(),         // ISO string
//   }),
// });

