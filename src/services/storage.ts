import AsyncStorage from "@react-native-async-storage/async-storage"
import type { Todo } from "../types"
import { STORAGE_KEYS } from "../config/constants"

class StorageService {
  async getTodos(): Promise<Todo[]> {
    try {
      const todosJson = await AsyncStorage.getItem(STORAGE_KEYS.TODOS)
      return todosJson ? JSON.parse(todosJson) : []
    } catch (error) {
      console.error("Error getting todos from storage:", error)
      return []
    }
  }

  async saveTodos(todos: Todo[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos))
    } catch (error) {
      console.error("Error saving todos to storage:", error)
    }
  }

  async getPendingActions(): Promise<Todo[]> {
    try {
      const actionsJson = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_ACTIONS)
      return actionsJson ? JSON.parse(actionsJson) : []
    } catch (error) {
      console.error("Error getting pending actions from storage:", error)
      return []
    }
  }

  async savePendingActions(actions: Todo[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_ACTIONS, JSON.stringify(actions))
    } catch (error) {
      console.error("Error saving pending actions to storage:", error)
    }
  }

  async getLastSync(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC)
    } catch (error) {
      console.error("Error getting last sync time:", error)
      return null
    }
  }

  async setLastSync(timestamp: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp)
    } catch (error) {
      console.error("Error setting last sync time:", error)
    }
  }

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.TODOS, STORAGE_KEYS.PENDING_ACTIONS, STORAGE_KEYS.LAST_SYNC])
    } catch (error) {
      console.error("Error clearing storage:", error)
    }
  }
}

export const storageService = new StorageService()
