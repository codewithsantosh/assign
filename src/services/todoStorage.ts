import AsyncStorage from "@react-native-async-storage/async-storage"

const TODOS_STORAGE_KEY = "@todos"
const CATEGORIES_STORAGE_KEY = "@categories"
const USER_PREFERENCES_KEY = "@user_preferences"

export interface Todo {
  id: string
  _id: string
  taskName: string
  title: string
  description: string
  teamMembers: string
  completed: boolean
  createdAt: string
  updatedAt: string
  date: string
  startTime: string
  endTime: string
  priority?: "low" | "medium" | "high"
  category?: string
}

export interface Category {
  id: string
  title: string
  subtitle: string
  backgroundColor: string
  image: any
}

export interface UserPreferences {
  theme: "light" | "dark"
  notifications: boolean
  defaultCategory: string
}

class TodoStorage {
  // Todo operations
  async getAllTodos(): Promise<Todo[]> {
    try {
      const storedTodos = await AsyncStorage.getItem(TODOS_STORAGE_KEY)
      return storedTodos ? JSON.parse(storedTodos) : []
    } catch (error) {
      console.error("Error getting todos:", error)
      return []
    }
  }

  async saveTodo(todo: Todo): Promise<void> {
    try {
      const todos = await this.getAllTodos()
      const existingIndex = todos.findIndex((t) => t.id === todo.id || t._id === todo._id)

      if (existingIndex >= 0) {
        todos[existingIndex] = { ...todo, updatedAt: new Date().toISOString() }
      } else {
        todos.push(todo)
      }

      await AsyncStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos))
    } catch (error) {
      console.error("Error saving todo:", error)
      throw error
    }
  }

  async updateTodo(todoId: string, updates: Partial<Todo>): Promise<void> {
    try {
      const todos = await this.getAllTodos()
      const todoIndex = todos.findIndex((t) => t.id === todoId || t._id === todoId)

      if (todoIndex >= 0) {
        todos[todoIndex] = {
          ...todos[todoIndex],
          ...updates,
          updatedAt: new Date().toISOString(),
        }
        await AsyncStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos))
      } else {
        throw new Error("Todo not found")
      }
    } catch (error) {
      console.error("Error updating todo:", error)
      throw error
    }
  }

  async deleteTodo(todoId: string): Promise<void> {
    try {
      const todos = await this.getAllTodos()
      const filteredTodos = todos.filter((t) => t.id !== todoId && t._id !== todoId)
      await AsyncStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(filteredTodos))
    } catch (error) {
      console.error("Error deleting todo:", error)
      throw error
    }
  }

  async getTodoById(todoId: string): Promise<Todo | null> {
    try {
      const todos = await this.getAllTodos()
      return todos.find((t) => t.id === todoId || t._id === todoId) || null
    } catch (error) {
      console.error("Error getting todo by id:", error)
      return null
    }
  }

  async getTodosByCategory(category: string): Promise<Todo[]> {
    try {
      const todos = await this.getAllTodos()
      return todos.filter((t) => t.category === category)
    } catch (error) {
      console.error("Error getting todos by category:", error)
      return []
    }
  }

  async getTodosByStatus(completed: boolean): Promise<Todo[]> {
    try {
      const todos = await this.getAllTodos()
      return todos.filter((t) => t.completed === completed)
    } catch (error) {
      console.error("Error getting todos by status:", error)
      return []
    }
  }

  async searchTodos(query: string): Promise<Todo[]> {
    try {
      const todos = await this.getAllTodos()
      const lowercaseQuery = query.toLowerCase()
      return todos.filter(
        (t) =>
          t.title.toLowerCase().includes(lowercaseQuery) ||
          t.description.toLowerCase().includes(lowercaseQuery) ||
          t.teamMembers.toLowerCase().includes(lowercaseQuery),
      )
    } catch (error) {
      console.error("Error searching todos:", error)
      return []
    }
  }

  // Category operations
  async getAllCategories(): Promise<Category[]> {
    try {
      const storedCategories = await AsyncStorage.getItem(CATEGORIES_STORAGE_KEY)
      return storedCategories ? JSON.parse(storedCategories) : []
    } catch (error) {
      console.error("Error getting categories:", error)
      return []
    }
  }

  async saveCategory(category: Category): Promise<void> {
    try {
      const categories = await this.getAllCategories()
      const existingIndex = categories.findIndex((c) => c.id === category.id)

      if (existingIndex >= 0) {
        categories[existingIndex] = category
      } else {
        categories.push(category)
      }

      await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories))
    } catch (error) {
      console.error("Error saving category:", error)
      throw error
    }
  }

  async deleteCategory(categoryId: string): Promise<void> {
    try {
      const categories = await this.getAllCategories()
      const filteredCategories = categories.filter((c) => c.id !== categoryId)
      await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(filteredCategories))
    } catch (error) {
      console.error("Error deleting category:", error)
      throw error
    }
  }

  // User preferences
  async getUserPreferences(): Promise<UserPreferences> {
    try {
      const storedPreferences = await AsyncStorage.getItem(USER_PREFERENCES_KEY)
      return storedPreferences
        ? JSON.parse(storedPreferences)
        : {
            theme: "light",
            notifications: true,
            defaultCategory: "general",
          }
    } catch (error) {
      console.error("Error getting user preferences:", error)
      return {
        theme: "light",
        notifications: true,
        defaultCategory: "general",
      }
    }
  }

  async saveUserPreferences(preferences: UserPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(preferences))
    } catch (error) {
      console.error("Error saving user preferences:", error)
      throw error
    }
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([TODOS_STORAGE_KEY, CATEGORIES_STORAGE_KEY, USER_PREFERENCES_KEY])
    } catch (error) {
      console.error("Error clearing all data:", error)
      throw error
    }
  }

  async exportData(): Promise<string> {
    try {
      const todos = await this.getAllTodos()
      const categories = await this.getAllCategories()
      const preferences = await this.getUserPreferences()

      return JSON.stringify({
        todos,
        categories,
        preferences,
        exportDate: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error exporting data:", error)
      throw error
    }
  }

  async importData(data: string): Promise<void> {
    try {
      const parsedData = JSON.parse(data)

      if (parsedData.todos) {
        await AsyncStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(parsedData.todos))
      }

      if (parsedData.categories) {
        await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(parsedData.categories))
      }

      if (parsedData.preferences) {
        await AsyncStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(parsedData.preferences))
      }
    } catch (error) {
      console.error("Error importing data:", error)
      throw error
    }
  }
}

export const todoStorage = new TodoStorage()
