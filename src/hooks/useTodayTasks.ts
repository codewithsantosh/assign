import { useState, useCallback } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import uuid from "react-native-uuid"

const TASKS_STORAGE_KEY = "@today_tasks"

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
}

const DEFAULT_COLORS = ["#EDEBDE", "#E0EBDD", "#EBE2FD", "#DEECEC", "#FFE5E5", "#E5F3FF"]

const DEFAULT_USERS = [require("../assets/Frame.png"), require("../assets/Frame.png"), require("../assets/Frame.png")]

export const useTodayTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadAllTasks = useCallback(async (): Promise<Task[]> => {
    try {
      const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY)
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks)
        console.log("Loaded tasks from storage:", parsedTasks.length)
        return parsedTasks
      }

      const sampleTasks = await initializeSampleTasks()
      return sampleTasks
    } catch (err) {
      console.error("Error loading tasks:", err)
      return []
    }
  }, [])

  const initializeSampleTasks = useCallback(async (): Promise<Task[]> => {
    const today = new Date()
    const sampleTasks: Task[] = [
      {
        id: uuid.v4() as string,
        time: "09:30 AM",
        endTime: "10:30 AM",
        title: "Website design with responsive",
        users: DEFAULT_USERS,
        color: "#EDEBDE",
        date: today.toDateString(),
        description: "Work on responsive design for the new website",
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuid.v4() as string,
        time: "11:00 AM",
        endTime: "11:30 AM",
        title: "Mobile Wireframing",
        users: DEFAULT_USERS.slice(0, 2),
        color: "#E0EBDD",
        date: today.toDateString(),
        description: "Create wireframes for mobile app",
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuid.v4() as string,
        time: "12:00 PM",
        endTime: "01:00 PM",
        title: "Meeting with client",
        users: DEFAULT_USERS,
        color: "#EBE2FD",
        date: today.toDateString(),
        description: "Discuss project requirements and timeline",
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuid.v4() as string,
        time: "01:30 PM",
        endTime: "02:00 PM",
        title: "Finance Dashboard",
        users: [...DEFAULT_USERS, DEFAULT_USERS[0]],
        color: "#DEECEC",
        date: today.toDateString(),
        description: "Review and update finance dashboard",
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(sampleTasks))
    console.log("Sample tasks initialized")
    return sampleTasks
  }, [])

  const saveTasks = useCallback(async (tasksToSave: Task[]) => {
    try {
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasksToSave))
      console.log("Tasks saved to storage:", tasksToSave.length)
    } catch (err) {
      console.error("Error saving tasks:", err)
      throw err
    }
  }, [])

  const loadTasksForDate = useCallback(
    async (date: Date) => {
      setIsLoading(true)
      setError(null)
      try {
        const allTasks = await loadAllTasks()
        const dateString = date.toDateString()
        const filteredTasks = allTasks.filter((task) => task.date === dateString)

        const sortedTasks = filteredTasks.sort((a, b) => {
          const timeA = new Date(`1970/01/01 ${a.time}`)
          const timeB = new Date(`1970/01/01 ${b.time}`)
          return timeA.getTime() - timeB.getTime()
        })

        setTasks(sortedTasks)
        console.log(`Loaded ${sortedTasks.length} tasks for ${dateString}`)
      } catch (err) {
        console.error("Error loading tasks for date:", err)
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    },
    [loadAllTasks],
  )

  const createTask = useCallback(
    async (newTaskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
      setIsCreating(true)
      setError(null)
      try {
        const allTasks = await loadAllTasks()
        const newTask: Task = {
          ...newTaskData,
          id: uuid.v4() as string,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          users: newTaskData.users || DEFAULT_USERS,
          color: newTaskData.color || DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)],
          completed: false,
        }

        const updatedTasks = [...allTasks, newTask]
        await saveTasks(updatedTasks)

        const currentDate = new Date(newTask.date)
        const tasksForCurrentDate = updatedTasks.filter((task) => task.date === currentDate.toDateString())
        setTasks(
          tasksForCurrentDate.sort((a, b) => {
            const timeA = new Date(`1970/01/01 ${a.time}`)
            const timeB = new Date(`1970/01/01 ${b.time}`)
            return timeA.getTime() - timeB.getTime()
          }),
        )

        console.log("Task created successfully:", newTask.id)
      } catch (err) {
        console.error("Error creating task:", err)
        setError(err as Error)
        throw err
      } finally {
        setIsCreating(false)
      }
    },
    [loadAllTasks, saveTasks],
  )

  const updateTask = useCallback(
    async (taskId: string, updates: Partial<Task>) => {
      setIsUpdating(true)
      setError(null)
      try {
        const allTasks = await loadAllTasks()
        const taskIndex = allTasks.findIndex((task) => task.id === taskId)

        if (taskIndex >= 0) {
          allTasks[taskIndex] = {
            ...allTasks[taskIndex],
            ...updates,
            updatedAt: new Date().toISOString(),
          }

          await saveTasks(allTasks)

          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              task.id === taskId ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task,
            ),
          )

          console.log("Task updated successfully:", taskId)
        } else {
          throw new Error("Task not found")
        }
      } catch (err) {
        console.error("Error updating task:", err)
        setError(err as Error)
        throw err
      } finally {
        setIsUpdating(false)
      }
    },
    [loadAllTasks, saveTasks],
  )

  const deleteTask = useCallback(
    async (taskId: string) => {
      setIsDeleting(true)
      setError(null)
      try {
        const allTasks = await loadAllTasks()
        const filteredTasks = allTasks.filter((task) => task.id !== taskId)

        await saveTasks(filteredTasks)

        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))

        console.log("Task deleted successfully:", taskId)
      } catch (err) {
        console.error("Error deleting task:", err)
        setError(err as Error)
        throw err
      } finally {
        setIsDeleting(false)
      }
    },
    [loadAllTasks, saveTasks],
  )

  const getTasksByDateRange = useCallback(
    async (startDate: Date, endDate: Date): Promise<Task[]> => {
      try {
        const allTasks = await loadAllTasks()
        return allTasks.filter((task) => {
          const taskDate = new Date(task.date)
          return taskDate >= startDate && taskDate <= endDate
        })
      } catch (err) {
        console.error("Error getting tasks by date range:", err)
        return []
      }
    },
    [loadAllTasks],
  )

  const clearAllTasks = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      await AsyncStorage.removeItem(TASKS_STORAGE_KEY)
      setTasks([])
      console.log("All tasks cleared")
    } catch (err) {
      console.error("Error clearing tasks:", err)
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    tasks,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    loadTasksForDate,
    createTask,
    updateTask,
    deleteTask,
    getTasksByDateRange,
    clearAllTasks,
  }
}
