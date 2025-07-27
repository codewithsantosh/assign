import { useState, useCallback, useMemo } from "react"

interface Task {
  id: string
  _id?: string
  title?: string
  taskName?: string
  description?: string
  teamMembers?: string
  category?: string
  completed?: boolean
  startTime: string
  endTime: string
}

interface UseSearchAndFilterProps {
  tasks: Task[]
  categories: Array<{ id: string; title: string }>
}

export const useSearchAndFilter = ({ tasks, categories }: UseSearchAndFilterProps) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState<"title" | "date" | "category">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = [...tasks]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((task) => {
        const title = (task.title || task.taskName || "").toLowerCase()
        const description = (task.description || "").toLowerCase()
        const teamMembers = (task.teamMembers || "").toLowerCase()

        return title.includes(query) || description.includes(query) || teamMembers.includes(query)
      })
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((task) => task.category === selectedCategory)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "title":
          const titleA = (a.title || a.taskName || "").toLowerCase()
          const titleB = (b.title || b.taskName || "").toLowerCase()
          comparison = titleA.localeCompare(titleB)
          break
        case "date":
          const dateA = new Date(a.startTime).getTime()
          const dateB = new Date(b.startTime).getTime()
          comparison = dateA - dateB
          break
        case "category":
          const categoryA = a.category || "general"
          const categoryB = b.category || "general"
          comparison = categoryA.localeCompare(categoryB)
          break
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [tasks, searchQuery, selectedCategory, sortBy, sortOrder])

  const searchStats = useMemo(() => {
    const totalTasks = tasks.length
    const filteredCount = filteredAndSortedTasks.length
    const completedCount = filteredAndSortedTasks.filter((task) => task.completed).length
    const pendingCount = filteredCount - completedCount

    return {
      total: totalTasks,
      filtered: filteredCount,
      completed: completedCount,
      pending: pendingCount,
      completionRate: filteredCount > 0 ? (completedCount / filteredCount) * 100 : 0,
    }
  }, [tasks, filteredAndSortedTasks])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const handleCategoryFilter = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId)
  }, [])

  const handleSort = useCallback(
    (field: "title" | "date" | "category") => {
      if (sortBy === field) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
      } else {
        setSortBy(field)
        setSortOrder("asc")
      }
    },
    [sortBy, sortOrder],
  )

  const clearSearch = useCallback(() => {
    setSearchQuery("")
  }, [])

  const clearFilters = useCallback(() => {
    setSearchQuery("")
    setSelectedCategory("all")
    setSortBy("date")
    setSortOrder("asc")
  }, [])

  const getFilteredTasksByCategory = useCallback(() => {
    const categoryStats = categories.map((category) => {
      const categoryTasks = filteredAndSortedTasks.filter((task) => task.category === category.id)
      return {
        ...category,
        taskCount: categoryTasks.length,
        completedCount: categoryTasks.filter((task) => task.completed).length,
      }
    })

    return categoryStats
  }, [categories, filteredAndSortedTasks])

  return {
    // State
    searchQuery,
    selectedCategory,
    sortBy,
    sortOrder,

    // Computed data
    filteredTasks: filteredAndSortedTasks,
    searchStats,
    categoryStats: getFilteredTasksByCategory(),

    // Actions
    handleSearch,
    handleCategoryFilter,
    handleSort,
    clearSearch,
    clearFilters,
  }
}
