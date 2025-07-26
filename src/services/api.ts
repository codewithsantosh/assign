import type { ApiTodo, Todo } from "../types"
import { API_BASE_URL, USER_UUID } from "../config/constants"

class ApiService {
  private baseUrl = `${API_BASE_URL}/${USER_UUID}`

  async getAllTodos() {
    const response = await fetch("https://mock-server-58ta.onrender.com/123e4567-e89b-12d3-a456-426614174000")
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  }

  async createTodo(todo: any) {
    const response = await fetch("https://mock-server-58ta.onrender.com/123e4567-e89b-12d3-a456-426614174000", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(todo),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  }

  async getTodo(id: string): Promise<ApiTodo> {
    const response = await fetch(`${this.baseUrl}/${id}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  }

  async updateTodo(id: string, updates: Partial<Todo>): Promise<ApiTodo> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  }

  async deleteTodo(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
  }
}

export const apiService = new ApiService()
