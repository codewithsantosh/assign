import { useState, useEffect, useCallback } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

const TODOS_STORAGE_KEY = "@todos"

interface Todo {
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
}

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Load todos from AsyncStorage
  const loadTodos = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const storedTodos = await AsyncStorage.getItem(TODOS_STORAGE_KEY)
      if (storedTodos) {
        const parsedTodos = JSON.parse(storedTodos)
        setTodos(parsedTodos)
        console.log("Loaded todos from storage:", parsedTodos.length)
      } else {
        setTodos([])
      }
    } catch (err) {
      console.error("Error loading todos:", err)
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save todos to AsyncStorage
  const saveTodos = useCallback(async (todosToSave: Todo[]) => {
    try {
      await AsyncStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todosToSave))
      console.log("Todos saved to storage:", todosToSave.length)
    } catch (err) {
      console.error("Error saving todos:", err)
      throw err
    }
  }, [])

  // Create a new todo
  const createTodo = useCallback(
    async (newTodo: Todo) => {
      setIsCreating(true)
      setError(null)
      try {
        const updatedTodos = [...todos, newTodo]
        await saveTodos(updatedTodos)
        setTodos(updatedTodos)
        console.log("Todo created successfully:", newTodo.id)
      } catch (err) {
        console.error("Error creating todo:", err)
        setError(err as Error)
        throw err
      } finally {
        setIsCreating(false)
      }
    },
    [todos, saveTodos],
  )

  // Update an existing todo
  const updateTodo = useCallback(
    async (todoId: string, updates: Partial<Todo>) => {
      setIsUpdating(true)
      setError(null)
      try {
        const updatedTodos = todos.map((todo) =>
          todo.id === todoId || todo._id === todoId
            ? { ...todo, ...updates, updatedAt: new Date().toISOString() }
            : todo,
        )
        await saveTodos(updatedTodos)
        setTodos(updatedTodos)
        console.log("Todo updated successfully:", todoId)
      } catch (err) {
        console.error("Error updating todo:", err)
        setError(err as Error)
        throw err
      } finally {
        setIsUpdating(false)
      }
    },
    [todos, saveTodos],
  )

  // Delete a todo
  const deleteTodo = useCallback(
    async (todoId: string) => {
      setIsDeleting(true)
      setError(null)
      try {
        const updatedTodos = todos.filter((todo) => todo.id !== todoId && todo._id !== todoId)
        await saveTodos(updatedTodos)
        setTodos(updatedTodos)
        console.log("Todo deleted successfully:", todoId)
      } catch (err) {
        console.error("Error deleting todo:", err)
        setError(err as Error)
        throw err
      } finally {
        setIsDeleting(false)
      }
    },
    [todos, saveTodos],
  )

  // Toggle todo completion status
  const toggleTodo = useCallback(
    async (todoId: string) => {
      const todo = todos.find((t) => t.id === todoId || t._id === todoId)
      if (todo) {
        await updateTodo(todoId, { completed: !todo.completed })
      }
    },
    [todos, updateTodo],
  )

  // Clear all todos
  const clearAllTodos = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      await AsyncStorage.removeItem(TODOS_STORAGE_KEY)
      setTodos([])
      console.log("All todos cleared")
    } catch (err) {
      console.error("Error clearing todos:", err)
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get todos by filter
  const getTodosByFilter = useCallback(
    (filter: "all" | "completed" | "pending") => {
      switch (filter) {
        case "completed":
          return todos.filter((todo) => todo.completed)
        case "pending":
          return todos.filter((todo) => !todo.completed)
        default:
          return todos
      }
    },
    [todos],
  )

  // Load todos on hook initialization
  useEffect(() => {
    loadTodos()
  }, [loadTodos])

  return {
    todos,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    loadTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    clearAllTodos,
    getTodosByFilter,
  }
}
