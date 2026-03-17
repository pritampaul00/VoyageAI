type Activity = {
  start_time?: string
}

type ActivityGroup = {
  morning: any[]
  afternoon: any[]
  evening: any[]
}

function parseHour(time?: string) {
  if (!time) return null

  const parts = time.split(" ")
  const clock = parts[0]
  const modifier = parts[1]

  const [hourStr] = clock.split(":")
  let hour = Number(hourStr)

  if (modifier === "PM" && hour !== 12) hour += 12
  if (modifier === "AM" && hour === 12) hour = 0

  return hour
}

export function groupActivitiesByTime(activities: Activity[]): ActivityGroup {
  const groups: ActivityGroup = {
    morning: [],
    afternoon: [],
    evening: []
  }

  activities.forEach((activity: any) => {
    const hour = parseHour(activity.start_time)

    if (hour === null) {
      groups.afternoon.push(activity)
      return
    }

    if (hour < 12) {
      groups.morning.push(activity)
    } else if (hour < 17) {
      groups.afternoon.push(activity)
    } else {
      groups.evening.push(activity)
    }
  })

  return groups
}

