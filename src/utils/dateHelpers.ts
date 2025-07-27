export const formatDateString = (date: Date): string => {
    return date.toDateString()
  }
  
  export const formatTimeString = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
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
  
  export const getWeekDates = (centerDate: Date): Date[] => {
    const dates = []
    const startOfWeek = new Date(centerDate)
    startOfWeek.setDate(centerDate.getDate() - centerDate.getDay())
  
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      dates.push(date)
    }
  
    return dates
  }
  
  export const getMonthDates = (year: number, month: number): Date[] => {
    const dates = []
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
  
    for (let day = 1; day <= lastDay.getDate(); day++) {
      dates.push(new Date(year, month, day))
    }
  
    return dates
  }
  
  export const isToday = (date: Date): boolean => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }
  
  export const isSameDate = (date1: Date, date2: Date): boolean => {
    return date1.toDateString() === date2.toDateString()
  }
  
  export const addDays = (date: Date, days: number): Date => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }
  
  export const subtractDays = (date: Date, days: number): Date => {
    const result = new Date(date)
    result.setDate(result.getDate() - days)
    return result
  }
  
  export const getDateRange = (startDate: Date, endDate: Date): Date[] => {
    const dates = []
    const currentDate = new Date(startDate)
  
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
  
    return dates
  }
  