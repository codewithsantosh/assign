import AsyncStorage from "@react-native-async-storage/async-storage"

const TASKS_STORAGE_KEY = "@today_tasks"
const TASK_TEMPLATES_KEY = "@task_templates"
const TASK_CATEGORIES_KEY = "@task_categories"

export interface Task {
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
}

export interface TaskTemplate {
  id: string
  title: string
  description: string
  duration: number // in minutes
  color: string
  category: string
}

export interface TaskCategory {
  id: string
  name: string
  color: string
  icon: string
}

class TaskStorage {
  async getAllTasks(): Promise<Task[]> {
    try {
      const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY)
      return storedTasks ? JSON.parse(storedTasks) : []
    } catch (error) {
      console.error("Error getting all tasks:", error)
      return []
    }
  }

  async getTasksByDate(date: Date): Promise<Task[]> {
    try {
      const allTasks = await this.getAllTasks()
      const dateString = date.toDateString()
      return allTasks.filter((task) => task.date === dateString)
    } catch (error) {
      console.error("Error getting tasks by date:", error)
      return []
    }
  }

  async getTasksByDateRange(startDate: Date, endDate: Date): Promise<Task[]> {
    try {
      const allTasks = await this.getAllTasks()
      return allTasks.filter((task) => {
        const taskDate = new Date(task.date)
        return taskDate >= startDate && taskDate <= endDate
      })
    } catch (error) {
      console.error("Error getting tasks by date range:", error)
      return []
    }
  }

  async saveTask(task: Task): Promise<void> {
    try {
      const allTasks = await this.getAllTasks()
      const existingIndex = allTasks.findIndex((t) => t.id === task.id)

      if (existingIndex >= 0) {
        allTasks[existingIndex] = { ...task, updatedAt: new Date().toISOString() }
      } else {
        allTasks.push(task)
      }

      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(allTasks))
    } catch (error) {
      console.error("Error saving task:", error)
      throw error
    }
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    try {
      const allTasks = await this.getAllTasks()
      const taskIndex = allTasks.findIndex((t) => t.id === taskId)

      if (taskIndex >= 0) {
        allTasks[taskIndex] = {
          ...allTasks[taskIndex],
          ...updates,
          updatedAt: new Date().toISOString(),
        }
        await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(allTasks))
      } else {
        throw new Error("Task not found")
      }
    } catch (error) {
      console.error("Error updating task:", error)
      throw error
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    try {
      const allTasks = await this.getAllTasks()
      const filteredTasks = allTasks.filter((t) => t.id !== taskId)
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(filteredTasks))
    } catch (error) {
      console.error("Error deleting task:", error)
      throw error
    }
  }

  async getTaskById(taskId: string): Promise<Task | null> {
    try {
      const allTasks = await this.getAllTasks()
      return allTasks.find((t) => t.id === taskId) || null
    } catch (error) {
      console.error("Error getting task by id:", error)
      return null
    }
  }

  async getCompletedTasks(): Promise<Task[]> {
    try {
      const allTasks = await this.getAllTasks()
      return allTasks.filter((task) => task.completed)
    } catch (error) {
      console.error("Error getting completed tasks:", error)
      return []
    }
  }

  async getPendingTasks(): Promise<Task[]> {
    try {
      const allTasks = await this.getAllTasks()
      return allTasks.filter((task) => !task.completed)
    } catch (error) {
      console.error("Error getting pending tasks:", error)
      return []
    }
  }

  async getTasksByCategory(category: string): Promise<Task[]> {
    try {
      const allTasks = await this.getAllTasks()
      return allTasks.filter((task) => task.category === category)
    } catch (error) {
      console.error("Error getting tasks by category:", error)
      return []
    }
  }

  async getTasksByPriority(priority: "low" | "medium" | "high"): Promise<Task[]> {
    try {
      const allTasks = await this.getAllTasks()
      return allTasks.filter((task) => task.priority === priority)
    } catch (error) {
      console.error("Error getting tasks by priority:", error)
      return []
    }
  }

  async searchTasks(query: string): Promise<Task[]> {
    try {
      const allTasks = await this.getAllTasks()
      const lowercaseQuery = query.toLowerCase()
      return allTasks.filter(
        (task) =>
          task.title.toLowerCase().includes(lowercaseQuery) || task.description?.toLowerCase().includes(lowercaseQuery),
      )
    } catch (error) {
      console.error("Error searching tasks:", error)
      return []
    }
  }

  async getTaskTemplates(): Promise<TaskTemplate[]> {
    try {
      const storedTemplates = await AsyncStorage.getItem(TASK_TEMPLATES_KEY)
      return storedTemplates ? JSON.parse(storedTemplates) : []
    } catch (error) {
      console.error("Error getting task templates:", error)
      return []
    }
  }

  async saveTaskTemplate(template: TaskTemplate): Promise<void> {
    try {
      const templates = await this.getTaskTemplates()
      const existingIndex = templates.findIndex((t) => t.id === template.id)

      if (existingIndex >= 0) {
        templates[existingIndex] = template
      } else {
        templates.push(template)
      }

      await AsyncStorage.setItem(TASK_TEMPLATES_KEY, JSON.stringify(templates))
    } catch (error) {
      console.error("Error saving task template:", error)
      throw error
    }
  }

  async deleteTaskTemplate(templateId: string): Promise<void> {
    try {
      const templates = await this.getTaskTemplates()
      const filteredTemplates = templates.filter((t) => t.id !== templateId)
      await AsyncStorage.setItem(TASK_TEMPLATES_KEY, JSON.stringify(filteredTemplates))
    } catch (error) {
      console.error("Error deleting task template:", error)
      throw error
    }
  }

  async getTaskCategories(): Promise<TaskCategory[]> {
    try {
      const storedCategories = await AsyncStorage.getItem(TASK_CATEGORIES_KEY)
      return storedCategories ? JSON.parse(storedCategories) : []
    } catch (error) {
      console.error("Error getting task categories:", error)
      return []
    }
  }

  async saveTaskCategory(category: TaskCategory): Promise<void> {
    try {
      const categories = await this.getTaskCategories()
      const existingIndex = categories.findIndex((c) => c.id === category.id)

      if (existingIndex >= 0) {
        categories[existingIndex] = category
      } else {
        categories.push(category)
      }

      await AsyncStorage.setItem(TASK_CATEGORIES_KEY, JSON.stringify(categories))
    } catch (error) {
      console.error("Error saving task category:", error)
      throw error
    }
  }

  async deleteTaskCategory(categoryId: string): Promise<void> {
    try {
      const categories = await this.getTaskCategories()
      const filteredCategories = categories.filter((c) => c.id !== categoryId)
      await AsyncStorage.setItem(TASK_CATEGORIES_KEY, JSON.stringify(filteredCategories))
    } catch (error) {
      console.error("Error deleting task category:", error)
      throw error
    }
  }

  async clearAllTasks(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TASKS_STORAGE_KEY)
    } catch (error) {
      console.error("Error clearing all tasks:", error)
      throw error
    }
  }

  async exportTasks(): Promise<string> {
    try {
      const tasks = await this.getAllTasks()
      const templates = await this.getTaskTemplates()
      const categories = await this.getTaskCategories()

      return JSON.stringify({
        tasks,
        templates,
        categories,
        exportDate: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error exporting tasks:", error)
      throw error
    }
  }

  async importTasks(data: string): Promise<void> {
    try {
      const parsedData = JSON.parse(data)

      if (parsedData.tasks) {
        await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(parsedData.tasks))
      }

      if (parsedData.templates) {
        await AsyncStorage.setItem(TASK_TEMPLATES_KEY, JSON.stringify(parsedData.templates))
      }

      if (parsedData.categories) {
        await AsyncStorage.setItem(TASK_CATEGORIES_KEY, JSON.stringify(parsedData.categories))
      }
    } catch (error) {
      console.error("Error importing tasks:", error)
      throw error
    }
  }

  async getTaskStats(date?: Date): Promise<{
    total: number
    completed: number
    pending: number
    completionRate: number
  }> {
    try {
      let tasks: Task[]

      if (date) {
        tasks = await this.getTasksByDate(date)
      } else {
        tasks = await this.getAllTasks()
      }

      const total = tasks.length
      const completed = tasks.filter((task) => task.completed).length
      const pending = total - completed
      const completionRate = total > 0 ? (completed / total) * 100 : 0

      return { total, completed, pending, completionRate }
    } catch (error) {
      console.error("Error getting task stats:", error)
      return { total: 0, completed: 0, pending: 0, completionRate: 0 }
    }
  }
}

export const taskStorage = new TaskStorage()
