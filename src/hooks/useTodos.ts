"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { apiService } from "../services/api"
import { storageService } from "../services/storage"
import type { Todo, ApiTodo } from "../types"
import { useNetworkStatus } from "./useNetworkStatus"
import { generateId } from "../utils/helpers"

export const useTodos = () => {
  const queryClient = useQueryClient()
  const isOnline = useNetworkStatus()
  const [pendingChanges, setPendingChanges] = useState(0)
  const [syncing, setSyncing] = useState(false)

  const {
    data: todos = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      const localTodos = await storageService.getTodos()

      if (isOnline) {
        try {
          const serverTodos = await apiService.getAllTodos()
          const mergedTodos = mergeTodos(localTodos, serverTodos)
          await storageService.saveTodos(mergedTodos)
          return mergedTodos
        } catch (error) {
          console.error("Failed to fetch from server, using local data:", error)
          return localTodos
        }
      }

      return localTodos
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      return isOnline && failureCount < 3
    },
  })

  const createTodoMutation = useMutation({
    mutationFn: async (newTodo:any) => {
      const todo: Todo = {
        ...newTodo,
        id: generateId(),
        synced: false,
        pendingAction: "create",
      }

      // Save locally first
      const currentTodos = await storageService.getTodos()
      const updatedTodos = [...currentTodos, todo]
      await storageService.saveTodos(updatedTodos)

      if (isOnline) {
        try {
          const serverTodo = await apiService.createTodo(newTodo)
          // Update local todo with server data
          const syncedTodo: Todo = {
            ...todo,
            _id: serverTodo._id,
            synced: true,
            pendingAction: undefined,
          }
          const finalTodos = updatedTodos.map((t) => (t.id === todo.id ? syncedTodo : t))
          await storageService.saveTodos(finalTodos)
          return syncedTodo
        } catch (error) {
          // Keep as pending if server request fails
          console.error("Failed to create todo on server:", error)
          return todo
        }
      }

      return todo
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] })
      updatePendingChangesCount()
    },
  })

  // Update todo mutation
  const updateTodoMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Todo> }) => {
      const currentTodos = await storageService.getTodos()
      const todoIndex = currentTodos.findIndex((t) => t.id === id)

      if (todoIndex === -1) throw new Error("Todo not found")

      const updatedTodo: Todo = {
        ...currentTodos[todoIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
        synced: false,
        pendingAction: "update",
      }

      const updatedTodos = [...currentTodos]
      updatedTodos[todoIndex] = updatedTodo
      await storageService.saveTodos(updatedTodos)

      if (isOnline && updatedTodo._id) {
        try {
          const serverTodo = await apiService.updateTodo(updatedTodo._id, updates)
          const syncedTodo: Todo = {
            ...updatedTodo,
            synced: true,
            pendingAction: undefined,
          }
          updatedTodos[todoIndex] = syncedTodo
          await storageService.saveTodos(updatedTodos)
          return syncedTodo
        } catch (error) {
          console.error("Failed to update todo on server:", error)
          return updatedTodo
        }
      }

      return updatedTodo
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] })
      updatePendingChangesCount()
    },
  })

  // Delete todo mutation
  const deleteTodoMutation = useMutation({
    mutationFn: async (id: string) => {
      const currentTodos = await storageService.getTodos()
      const todo = currentTodos.find((t) => t.id === id)

      if (!todo) throw new Error("Todo not found")

      // Remove from local storage
      const updatedTodos = currentTodos.filter((t) => t.id !== id)
      await storageService.saveTodos(updatedTodos)

      if (isOnline && todo._id) {
        try {
          await apiService.deleteTodo(todo._id)
        } catch (error) {
          console.error("Failed to delete todo on server:", error)
          // Mark as pending delete instead of removing
          const pendingDeleteTodo: Todo = {
            ...todo,
            synced: false,
            pendingAction: "delete",
          }
          const todosWithPending = [...updatedTodos, pendingDeleteTodo]
          await storageService.saveTodos(todosWithPending)
          throw error
        }
      } else if (!todo.synced) {
        // If todo was never synced, we can safely remove it
        return
      } else {
        // Mark as pending delete
        const pendingDeleteTodo: Todo = {
          ...todo,
          synced: false,
          pendingAction: "delete",
        }
        const todosWithPending = [...updatedTodos, pendingDeleteTodo]
        await storageService.saveTodos(todosWithPending)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] })
      updatePendingChangesCount()
    },
  })

  // // Sync pending changes
  // const syncMutation = useMutation({
  //   mutationFn: async () => {
  //     if (!isOnline) throw new Error("Cannot sync while offline")

  //     setSyncing(true)
  //     const currentTodos = await storageService.getTodos()
  //     const pendingTodos = currentTodos.filter((todo) => !todo.synced || todo.pendingAction)

  //     const syncedTodos = [...currentTodos]

  //     for (const todo of pendingTodos) {
  //       try {
  //         if (todo.pendingAction === "create") {
  //           const serverTodo = await apiService.createTodo({
  //             title: todo.title,
  //             description: todo.description,
  //             completed: todo.completed,
  //             createdAt: todo.createdAt,
  //             updatedAt: todo.updatedAt,
  //           })

  //           const index = syncedTodos.findIndex((t) => t.id === todo.id)
  //           if (index !== -1) {
  //             syncedTodos[index] = {
  //               ...todo,
  //               _id: serverTodo._id,
  //               synced: true,
  //               pendingAction: undefined,
  //             }
  //           }
  //         } else if (todo.pendingAction === "update" && todo._id) {
  //           await apiService.updateTodo(todo._id, {
  //             title: todo.title,
  //             description: todo.description,
  //             completed: todo.completed,
  //             updatedAt: todo.updatedAt,
  //           })

  //           const index = syncedTodos.findIndex((t) => t.id === todo.id)
  //           if (index !== -1) {
  //             syncedTodos[index] = {
  //               ...todo,
  //               synced: true,
  //               pendingAction: undefined,
  //             }
  //           }
  //         } else if (todo.pendingAction === "delete" && todo._id) {
  //           await apiService.deleteTodo(todo._id)
  //           const index = syncedTodos.findIndex((t) => t.id === todo.id)
  //           if (index !== -1) {
  //             syncedTodos.splice(index, 1)
  //           }
  //         }
  //       } catch (error) {
  //         console.error(`Failed to sync todo ${todo.id}:`, error)
  //       }
  //     }

  //     await storageService.saveTodos(syncedTodos)
  //     await storageService.setLastSync(new Date().toISOString())
  //     return syncedTodos
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["todos"] })
  //     updatePendingChangesCount()
  //     setSyncing(false)
  //   },
  //   onError: () => {
  //     setSyncing(false)
  //   },
  // })

  const updatePendingChangesCount = async () => {
    const currentTodos = await storageService.getTodos()
    const pending = currentTodos.filter((todo) => !todo.synced || todo.pendingAction).length
    setPendingChanges(pending)
  }

  useEffect(() => {
    updatePendingChangesCount()
  }, [todos])

  useEffect(() => {
    if (isOnline && pendingChanges > 0) {
      // syncMutation.mutate()
    }
  }, [isOnline])

  return {
    todos: todos?.filter((todo) => todo.pendingAction !== "delete") || [],
    isLoading,
    error,
    refetch,
    createTodo: createTodoMutation.mutate,
    updateTodo: updateTodoMutation.mutate,
    deleteTodo: deleteTodoMutation.mutate,
    // sync: syncMutation.mutate,
    isCreating: createTodoMutation.isPending,
    isUpdating: updateTodoMutation.isPending,
    isDeleting: deleteTodoMutation.isPending,
    isSyncing: syncing,
    pendingChanges,
    isOnline,
  }
}

// Helper function to merge local and server todos
const mergeTodos = (localTodos: Todo[], serverTodos: ApiTodo[]): Todo[] => {
  const merged = new Map<string, Todo>()

  // Add all local todos first
  localTodos.forEach((todo) => {
    merged.set(todo._id || todo.id, todo)
  })

  // Merge server todos
  serverTodos.forEach((serverTodo) => {
    const existingTodo = merged.get(serverTodo._id)
    if (existingTodo) {
      // Keep local changes if not synced
      if (existingTodo.synced) {
        merged.set(serverTodo._id, {
          ...existingTodo,
          ...serverTodo,
          id: existingTodo.id,
          synced: true,
          pendingAction: undefined,
        })
      }
    } else {
      // New todo from server
      merged.set(serverTodo._id, {
        ...serverTodo,
        id: serverTodo._id,
        synced: true,
      })
    }
  })

  return Array.from(merged.values())
}
