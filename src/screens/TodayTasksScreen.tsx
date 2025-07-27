import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Alert,
  RefreshControl,
  Modal,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Icon from "react-native-vector-icons/Feather"
import DateTimePicker from "@react-native-community/datetimepicker"
import { useTodayTasks } from "../hooks/useTodayTasks"
import AddTaskForm from "../components/AddTaskForm"

const BASE_SLOT_HEIGHT = 42
const DEFAULT_COLORS = ["#EDEBDE", "#E0EBDD", "#EBE2FD", "#DEECEC", "#FFE5E5", "#E5F3FF"]
const DEFAULT_USERS = [require("../assets/Frame.png"), require("../assets/Frame.png"), require("../assets/Frame.png")]

interface Task {
  id: string
  time: string
  endTime: string
  title: string
  users: any[]
  color: string
  date: string
  description?: string
  completed?: boolean
  createdAt: string
  updatedAt: string
  category?: string
  priority?: "low" | "medium" | "high"
  reminder?: boolean
  reminderTime?: string
  duration?: number // duration in minutes
  teamMembers?: string
}

const generateTimeSlots = (start: string, end: string) => {
  const slots = []
  const toDate = (time: string) => {
    const [timeStr, modifier] = time.split(" ")
    let [hours, minutes] = timeStr.split(":").map(Number)
    if (modifier === "PM" && hours < 12) hours += 12
    if (modifier === "AM" && hours === 12) hours = 0
    const date = new Date()
    date.setHours(hours)
    date.setMinutes(minutes)
    date.setSeconds(0)
    return date
  }

  const formatTime = (date: Date) => {
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? "PM" : "AM"
    const hr = hours % 12 || 12
    const min = minutes.toString().padStart(2, "0")
    return `${hr}:${min} ${ampm}`
  }

  const startDate = toDate(start)
  const endDate = toDate(end)
  const current = new Date(startDate)

  while (current <= endDate) {
    slots.push(formatTime(new Date(current)))
    current.setMinutes(current.getMinutes() + 30)
  }

  return slots
}

const getWeekDaysAroundToday = (centerDate: Date) => {
  const days = []
  for (let i = -3; i <= 3; i++) {
    const date = new Date(centerDate)
    date.setDate(centerDate.getDate() + i)
    days.push({
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      dateNum: date.getDate(),
      fullDate: new Date(date),
      isToday: i === 0,
    })
  }
  return days
}

const TodayTasksScreen = ({ navigation }) => {
  const [date, setDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)

  const {
    tasks,
    isLoading,
    error,
    loadTasksForDate,
    createTask,
    updateTask,
    deleteTask,
    isCreating,
    isUpdating,
    isDeleting,
  } = useTodayTasks()

  const weekDays = getWeekDaysAroundToday(date)

  // Load tasks when date changes
  useEffect(() => {
    loadTasksForDate(date)
  }, [date, loadTasksForDate])

  const handleDateChange = useCallback((_: any, selectedDate?: Date) => {
    setShowDatePicker(false)
    if (selectedDate) {
      setDate(selectedDate)
    }
  }, [])

  const handleDayPress = useCallback((selectedDate: Date) => {
    setDate(selectedDate)
  }, [])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await loadTasksForDate(date)
    } catch (error) {
      console.error("Refresh error:", error)
    } finally {
      setRefreshing(false)
    }
  }, [date, loadTasksForDate])

  const handleTaskPress = useCallback(
    (task: Task) => {
      Alert.alert(
        task.title,
        `Time: ${task.time} - ${task.endTime}
${task.description || "No description"}`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Mark Complete",
            onPress: () => updateTask(task.id, { completed: !task.completed }),
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => handleDeleteTask(task),
          },
        ],
      )
    },
    [updateTask, deleteTask],
  )

  const handleDeleteTask = useCallback(
    (task: Task) => {
      Alert.alert("Delete Task", `Are you sure you want to delete "${task.title}"?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteTask(task.id),
        },
      ])
    },
    [deleteTask],
  )

  const handleAddTaskSubmit = useCallback(
    async (data: {
      taskName: string
      description: string
      teamMembers: string
      date: Date
      startTime: Date
      endTime: Date
    }) => {
      try {
        const { taskName, description, teamMembers, date: taskDate, startTime, endTime } = data

        const formattedStartTime = startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        const formattedEndTime = endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

        const newTask = {
          time: formattedStartTime,
          endTime: formattedEndTime,
          title: taskName,
          users: DEFAULT_USERS,
          color: DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)],
          date: taskDate.toDateString(),
          description,
          completed: false,
          duration: Math.abs(endTime.getTime() - startTime.getTime()) / (1000 * 60), // duration in minutes
          teamMembers,
        }

        await createTask(newTask)
        setShowAddTaskModal(false)

        Alert.alert("Success", `Task "${taskName}" created successfully!`)
      } catch (error) {
        console.error("Add task error:", error)
        Alert.alert("Error", "Failed to create task. Please try again.")
      }
    },
    [createTask],
  )

  const handleAddTaskCancel = useCallback(() => {
    setShowAddTaskModal(false)
  }, [])

  const handleFabPress = useCallback(() => {
    setShowAddTaskModal(true)
  }, [])

  const getTaskCountText = useCallback(() => {
    const count = tasks.length
    const completedCount = tasks.filter((task) => task.completed).length
    return `${count} tasks today • ${completedCount} completed`
  }, [tasks])

  if (isLoading && tasks.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Today's tasks</Text>
        <View style={styles.avatar}>
          <Image source={require("../assets/profile.png")} style={styles.avatarImage} />
        </View>
      </View>

      <View style={styles.dateSection}>
        <View style={{ gap: 10 }}>
          <Text style={styles.date}>{date.toLocaleDateString("en-US", { month: "long", day: "numeric" })}</Text>
          <Text style={styles.taskCount}>{getTaskCountText()}</Text>
        </View>
        <View style={styles.calendarIcon}>
          <Pressable onPress={() => setShowDatePicker(true)}>
            <Image source={require("../assets/Frame1.png")} style={styles.avatar} />
          </Pressable>
          {showDatePicker && <DateTimePicker value={date} mode="date" display="default" onChange={handleDateChange} />}
        </View>
      </View>

      <View style={styles.dayScroll}>
        {weekDays.map((day, index) => (
          <Pressable
            key={index}
            style={[styles.day, day.isToday && styles.today]}
            onPress={() => handleDayPress(day.fullDate)}
          >
            <Text style={[styles.dayNum, day.isToday && styles.todayText]}>{String(day.dateNum).padStart(2, "0")}</Text>
            <Text style={[styles.dayLabel, day.isToday && styles.todayText]}>{day.label}</Text>
          </Pressable>
        ))}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading tasks: {error.message}</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isLoading}
            onRefresh={onRefresh}
            colors={["#000"]}
            tintColor="#000"
          />
        }
      >
        {tasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tasks for this date</Text>
            <TouchableOpacity style={styles.addTaskButton} onPress={handleFabPress}>
              <Text style={styles.addTaskText}>Add Task</Text>
            </TouchableOpacity>
          </View>
        ) : (
          tasks.map((task, index) => {
            const slots = generateTimeSlots(task.time, task.endTime || task.time)
            const dynamicHeight = Math.max(BASE_SLOT_HEIGHT * slots.length, 107)

            return (
              <TouchableOpacity
                key={task.id}
                style={styles.cardContainer}
                onPress={() => handleTaskPress(task)}
                disabled={isUpdating || isDeleting}
              >
                <View
                  style={{
                    flexDirection: "column",
                    justifyContent: "space-around",
                    alignItems: "center",
                    // height: dynamicHeight,
                    minWidth: 80,
                  }}
                >
                  {slots.map((slot, idx) => (
                    <View key={idx} style={styles.timeSlotContainer}>
                      <Text style={styles.taskTime}>{slot}</Text>
                      {idx < slots.length - 1 && <View style={styles.timeSlotDivider} />}
                    </View>
                  ))}
                </View>
                <View
                  style={[
                    styles.taskCard,
                    {
                      backgroundColor: task.color,
                      height: dynamicHeight,
                      opacity: task.completed ? 0.6 : 1,
                    },
                  ]}
                >
                  {task.completed && (
                    <View style={styles.completedBadge}>
                      <Icon name="check" size={16} color="#fff" />
                    </View>
                  )}

                  {task.duration && task.duration > 30 && (
                    <View style={styles.durationBadge}>
                      <Text style={styles.durationText}>{Math.round(task.duration)}m</Text>
                    </View>
                  )}

                  <View style={styles.userRow}>
                    {task?.users?.map((u, i) => (
                      <Image key={i} source={u} style={styles.userImage} />
                    ))}
                  </View>
                  <Text style={[styles.taskTitle, task.completed && styles.completedText]}>{task.title}</Text>
                  <Image source={require("../assets/Group4.png")} style={styles.linkIcon} />
                </View>
              </TouchableOpacity>
            )
          })
        )}
      </ScrollView>

      <Modal
        visible={showAddTaskModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleAddTaskCancel}
      >
        <AddTaskForm onSubmit={handleAddTaskSubmit} onCancel={handleAddTaskCancel} isLoading={isCreating} />
      </Modal>

      <TouchableOpacity style={styles.fab} onPress={handleFabPress}>
        <Icon name="plus" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  )
}

export default TodayTasksScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    marginTop: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontFamily: "FilsonPro-Medium",
    fontWeight: "500",
    fontStyle: "normal",
    fontSize: 18,
    lineHeight: 21.6,
    letterSpacing: 0,
    color: "#4A4A4A",
  },
  avatar: {
    width: 58,
    height: 58,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  dateSection: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: {
    fontFamily: "FilsonPro-Medium",
    fontWeight: "500",
    fontStyle: "normal",
    fontSize: 24,
    lineHeight: 28.8,
    letterSpacing: 0,
    color: "#303642",
  },
  taskCount: {
    fontFamily: "FilsonPro-Regular",
    fontWeight: "400",
    fontStyle: "normal",
    fontSize: 16,
    lineHeight: 19.2,
    letterSpacing: 0,
    color: "#AFAFAF",
  },
  calendarIcon: {},
  dayScroll: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  day: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 10,
    gap: 10,
  },
  dayNum: {
    fontFamily: "FilsonPro-Regular",
    fontWeight: "400",
    fontStyle: "normal",
    fontSize: 14,
    lineHeight: 16.8,
    letterSpacing: -0.28,
    textAlign: "center",
  },
  dayLabel: {
    fontFamily: "FilsonPro-Regular",
    fontWeight: "400",
    fontStyle: "normal",
    fontSize: 11,
    lineHeight: 13.2,
    letterSpacing: 0,
  },
  today: {
    backgroundColor: "#000",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  todayText: {
    color: "#fff",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  cardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  taskTime: {
    marginBottom: 4,
    color: "#777",
    fontSize: 13,
  },
  taskCard: {
    width: 261,
    padding: 12,
    borderRadius: 20,
    position: "relative",
  },
  userRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  userImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  taskTitle: {
    fontFamily: "FilsonPro-Medium",
    fontWeight: "500",
    fontStyle: "normal",
    fontSize: 16,
    lineHeight: 19.2,
    letterSpacing: 0,
    color: "#363636",
    position: "absolute",
    bottom: 10,
    width: "60%",
    left: 10,
  },
  linkIcon: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  loadingText: {
    fontSize: 16,
    color: "#888",
    fontStyle: "italic",
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  errorText: {
    fontSize: 14,
    color: "#c62828",
    textAlign: "center",
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: "#c62828",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    marginBottom: 20,
  },
  addTaskButton: {
    backgroundColor: "#000",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addTaskText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#000",
    borderRadius: 30,
    padding: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  completedBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 4,
  },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.7,
  },
  timeSlotContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },
  timeSlotDivider: {
    width: 1,
    height: 8,
    backgroundColor: "#ddd",
    marginVertical: 2,
  },
  durationBadge: {
    position: "absolute",
    top: 8,
    right: 40,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  durationText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "500",
  },
})
