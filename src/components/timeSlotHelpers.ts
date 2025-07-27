export const generateTimeSlots = (startTime: string | Date, endTime: string | Date): string[] => {
    const slots: string[] = []
  
    const start = typeof startTime === "string" ? parseTimeString(startTime) : new Date(startTime)
    const end = typeof endTime === "string" ? parseTimeString(endTime) : new Date(endTime)
  
    const current = new Date(start)
  
    while (current <= end) {
      const hours = current.getHours()
      const minutes = current.getMinutes()
      const ampm = hours >= 12 ? "PM" : "AM"
      const hr = hours % 12 || 12
      const min = minutes.toString().padStart(2, "0")
      slots.push(`${hr}:${min} ${ampm}`)
      current.setMinutes(current.getMinutes() + 30)
    }
  
    return slots
  }
  
  export const parseTimeString = (timeString: string): Date => {
    const [time, modifier] = timeString.split(" ")
    let [hours, minutes] = time.split(":").map(Number)
  
    if (modifier === "PM" && hours < 12) hours += 12
    if (modifier === "AM" && hours === 12) hours = 0
  
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)
    return date
  }
  
  export const calculateDuration = (startTime: string | Date, endTime: string | Date): number => {
    const start = typeof startTime === "string" ? parseTimeString(startTime) : new Date(startTime)
    const end = typeof endTime === "string" ? parseTimeString(endTime) : new Date(endTime)
  
    return Math.abs(end.getTime() - start.getTime()) / (1000 * 60) // duration in minutes
  }
  
  export const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`
    } else {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }
  }
  
  export const getOptimalSlotHeight = (slotCount: number, baseHeight = 42): number => {
    return Math.max(baseHeight * slotCount, 107)
  }
  
  export const validateTimeRange = (startTime: Date, endTime: Date): { isValid: boolean; error?: string } => {
    if (startTime >= endTime) {
      return { isValid: false, error: "End time must be after start time" }
    }
  
    const duration = calculateDuration(startTime, endTime)
    if (duration < 15) {
      return { isValid: false, error: "Task duration must be at least 15 minutes" }
    }
  
    if (duration > 480) {
      return { isValid: false, error: "Task duration cannot exceed 8 hours" }
    }
  
    return { isValid: true }
  }
  