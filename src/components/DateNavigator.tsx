import type React from "react"
import { useState, useCallback, useMemo } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native"
import Icon from "react-native-vector-icons/Feather"

interface DateNavigatorProps {
  currentDate: Date
  onDateChange: (date: Date) => void
  datesWithTasks?: string[]
  getDateStats?: (date: Date) => Promise<{ totalTasks: number; completedTasks: number }>
}

const DateNavigator: React.FC<DateNavigatorProps> = ({ currentDate, onDateChange, datesWithTasks = [] }) => {
  const [selectedWeek, setSelectedWeek] = useState(0)

  const weekDates = useMemo(() => {
    const dates = []
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + selectedWeek * 7)

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      dates.push(date)
    }

    return dates
  }, [currentDate, selectedWeek])

  const handleDatePress = useCallback(
    (date: Date) => {
      onDateChange(date)
    },
    [onDateChange],
  )

  const goToPreviousWeek = useCallback(() => {
    setSelectedWeek((prev) => prev - 1)
  }, [])

  const goToNextWeek = useCallback(() => {
    setSelectedWeek((prev) => prev + 1)
  }, [])

  const goToToday = useCallback(() => {
    setSelectedWeek(0)
    onDateChange(new Date())
  }, [onDateChange])

  const isToday = useCallback((date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }, [])

  const isSelected = useCallback(
    (date: Date) => {
      return date.toDateString() === currentDate.toDateString()
    },
    [currentDate],
  )

  const hasTasksForDate = useCallback(
    (date: Date) => {
      return datesWithTasks.includes(date.toDateString())
    },
    [datesWithTasks],
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousWeek} style={styles.navButton}>
          <Icon name="chevron-left" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
          <Text style={styles.todayButtonText}>Today</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goToNextWeek} style={styles.navButton}>
          <Icon name="chevron-right" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.datesContainer}>
        {weekDates.map((date, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dateItem,
              isSelected(date) && styles.selectedDate,
              isToday(date) && styles.todayDate,
              hasTasksForDate(date) && styles.dateWithTasks,
            ]}
            onPress={() => handleDatePress(date)}
          >
            <Text style={[styles.dayName, isSelected(date) && styles.selectedText]}>
              {date.toLocaleDateString("en-US", { weekday: "short" })}
            </Text>
            <Text style={[styles.dayNumber, isSelected(date) && styles.selectedText]}>
              {date.getDate().toString().padStart(2, "0")}
            </Text>
            {hasTasksForDate(date) && <View style={styles.taskIndicator} />}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingVertical: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  todayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#000",
  },
  todayButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  datesContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  dateItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    minWidth: 60,
    position: "relative",
  },
  selectedDate: {
    backgroundColor: "#000",
  },
  todayDate: {
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  dateWithTasks: {
    backgroundColor: "#f0f8ff",
  },
  dayName: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  selectedText: {
    color: "#fff",
  },
  taskIndicator: {
    position: "absolute",
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#007AFF",
  },
})

export default DateNavigator
