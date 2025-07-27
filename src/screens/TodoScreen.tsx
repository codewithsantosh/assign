import { useState, useCallback, useMemo } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  RefreshControl,
  Animated,
  Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { AnimatedCircularProgress } from "react-native-circular-progress"
import Icon from "react-native-vector-icons/Feather"
import { Swipeable, GestureHandlerRootView } from "react-native-gesture-handler"
import AddTaskForm from "../components/AddTaskForm"
import { useTodos } from "../hooks/useTodos"
import uuid from "react-native-uuid"
import { CATEGORIES, FALLBACK_TASKS } from "../config/constants"

const TodoScreen = ({ navigation }) => {
  const [isAddTask, setIsAddTask] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showCategoryFilter, setShowCategoryFilter] = useState(false)

  const { todos, isLoading, error, loadTodos, createTodo, updateTodo, deleteTodo, isCreating, isUpdating, isDeleting } =
    useTodos()

  console.log("Todo hook state:", {
    todosCount: todos?.length,
    isLoading,
    error,
    isCreating,
    isDeleting,
  })

  const formatTimeRange = useCallback((start: any, end: any) => {
    const format = (dateStr: string | number | Date) => {
      const d = new Date(dateStr)
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
    return `${format(start)} - ${format(end)}`
  }, [])

  const taskDatas = useMemo(() => {
    if (!todos?.length) return []

    let filteredTasks = todos.filter((task) => task.taskName === "santosh123")

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filteredTasks = filteredTasks.filter(
        (task) =>
          (task.title || task.taskName || "").toLowerCase().includes(query) ||
          (task.description || "").toLowerCase().includes(query) ||
          (task.teamMembers || "").toLowerCase().includes(query),
      )
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filteredTasks = filteredTasks.filter((task) => task.category === selectedCategory)
    }

    return filteredTasks.map((item, index) => ({
      id: item._id ?? item.id ?? `${index}`,
      originalId: item._id ?? item.id,
      title: item.title ?? item.taskName ?? "Untitled Task",
      subtitle: item.teamMembers ? `Team: ${item.teamMembers}` : "No team assigned",
      progress: 46,
      badge: "6d",
      time: formatTimeRange(item.startTime, item.endTime),
      backgroundColor: "#ECDFE9",
      category: item.category || "general",
    }))
  }, [todos, formatTimeRange, searchQuery, selectedCategory])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await loadTodos()
    } catch (error) {
      console.error("Refresh error:", error)
    } finally {
      setRefreshing(false)
    }
  }, [loadTodos])

  const handleDeleteTask = useCallback(
    async (taskId: string, taskTitle: any) => {
      Alert.alert("Delete Task", `Are you sure you want to delete "${taskTitle}"?`, [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("Deleting task with ID:", taskId)
              const taskToDelete = taskDatas.find((task) => task.id === taskId)
              const originalId = taskToDelete?.originalId || taskId
              console.log("Original ID for deletion:", originalId)

              if (deleteTodo && originalId) {
                await deleteTodo(originalId)
                console.log("Task deleted successfully")
              }
            } catch (error) {
              console.error("Delete error:", error)
              Alert.alert("Delete Failed", "Failed to delete the task. Please try again.", [{ text: "OK" }])
            }
          },
        },
      ])
    },
    [deleteTodo, taskDatas],
  )

  const renderDeleteAction = useCallback(
    (taskId: any, taskTitle: any) => {
      return (
        <Animated.View style={styles.deleteAction}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteTask(taskId, taskTitle)}
            disabled={isDeleting}
          >
            <Icon name="trash-2" size={24} color="#fff" />
            <Text style={styles.deleteText}>{isDeleting ? "Deleting..." : "Delete"}</Text>
          </TouchableOpacity>
        </Animated.View>
      )
    },
    [handleDeleteTask, isDeleting],
  )

  const handleAddTask = useCallback(() => {
    setIsAddTask(true)
  }, [])

  const handleSubmit = useCallback(
    async (data: {
      taskName: any
      description: any
      teamMembers: any
      date: any
      startTime: any
      endTime: any
    }) => {
      try {
        const { taskName, description, teamMembers, date, startTime, endTime } = data
        const newTaskId = uuid.v4()

        const newTask = {
          id: newTaskId,
          _id: newTaskId,
          taskName: "santosh123",
          title: taskName,
          description,
          teamMembers,
          completed: false,
          createdAt: new Date(date).toISOString(),
          updatedAt: new Date().toISOString(),
          date: date.toISOString(),
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        }

        console.log("Creating new task:", newTask)
        await createTodo(newTask)
        setIsAddTask(false)
      } catch (error) {
        console.error("Submit error:", error)
        Alert.alert("Create Failed", "Failed to create the task. Please try again.", [{ text: "OK" }])
      }
    },
    [createTodo],
  )

  const renderCategory = useCallback(
    ({ item }: any) => (
      <TouchableOpacity style={[styles.categoryCard, { backgroundColor: item.backgroundColor }]}>
        <Text style={styles.categoryTitle}>{item.title}</Text>
        <Text style={styles.categorySubtitle}>{item.subtitle}</Text>
        <View style={styles.categoryIllustration}>
          <Image source={item.image} style={styles.illustrationImage} />
        </View>
      </TouchableOpacity>
    ),
    [],
  )

  const renderTask = useCallback(
    ({ item, index }: any) => (
      <Swipeable key={item.id} renderRightActions={() => renderDeleteAction(item.id, item.title)} rightThreshold={40}>
        <View
          style={[
            styles.taskCard,
            {
              backgroundColor: index % 2 === 0 ? "#ECDFE9" : "#EDEBDE",
              opacity: isDeleting ? 0.6 : 1,
            },
          ]}
        >
          <View style={styles.taskHeader}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            {item.badge && (
              <View style={styles.taskBadge}>
                <Text style={styles.taskBadgeText}>{item.badge}</Text>
              </View>
            )}
          </View>
          <Text style={styles.taskSubtitle}>{item.subtitle}</Text>
          <View style={styles.teamAvatars}>
            <Image source={require("../assets/Frame.png")} style={styles.teamAvatar} />
            <Image source={require("../assets/Frame.png")} style={[styles.teamAvatar, styles.teamAvatarOverlap]} />
            <Image source={require("../assets/Frame.png")} style={[styles.teamAvatar, styles.teamAvatarOverlap]} />
          </View>
          {item.progress !== undefined && (
            <View style={styles.taskFooter}>
              <View style={styles.circularProgressWrapper}>
                <AnimatedCircularProgress
                  size={56}
                  width={4}
                  fill={item.progress}
                  tintColor="#222222"
                  backgroundColor="#ddd"
                  rotation={0}
                >
                  {() => <Text style={styles.circularProgressText}>{item.progress}%</Text>}
                </AnimatedCircularProgress>
              </View>
              <View style={styles.timeContainer}>
                <Image source={require("../assets/clock-01.png")} style={styles.timeIndicator} />
                <Text style={styles.timeText}>{item.time}</Text>
              </View>
            </View>
          )}
        </View>
      </Swipeable>
    ),
    [renderDeleteAction, isDeleting],
  )

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text)
  }, [])

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId)
    setShowCategoryFilter(false)
  }, [])

  const clearSearch = useCallback(() => {
    setSearchQuery("")
  }, [])

  const toggleCategoryFilter = useCallback(() => {
    setShowCategoryFilter(!showCategoryFilter)
  }, [showCategoryFilter])

  const taskCountText = useMemo(() => {
    const count = taskDatas.length
    const totalCount = todos?.filter((task) => task.taskName === "santosh123")?.length || 0

    if (searchQuery || selectedCategory !== "all") {
      return `${count} of ${totalCount} tasks shown`
    }

    return count > 0 ? `${count} task${count !== 1 ? "s" : ""} pending` : "No tasks pending"
  }, [taskDatas.length, todos, searchQuery, selectedCategory])

  const navigateToDetails = useCallback(() => {
    navigation.navigate("TodoDetails")
  }, [navigation])

  const closeModal = useCallback(() => {
    setIsAddTask(false)
  }, [])

  if (isLoading && !taskDatas.length) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaView style={styles.container}>
          <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
            <Text style={styles.loadingText}>Loading tasks...</Text>
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    )
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Hi Saad Shaikh</Text>
            <Text style={styles.subtitle}>{taskCountText}</Text>
          </View>
          <View style={styles.avatar}>
            <Image source={require("../assets/profile.png")} style={styles.avatarImage} />
          </View>
        </View>

        <ScrollView
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
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Image source={require("../assets/search-01.png")} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor="#D7D7D7"
                value={searchQuery}
                onChangeText={handleSearchChange}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                  <Icon name="x" size={16} color="#888" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity onPress={toggleCategoryFilter}>
              <Image source={require("../assets/Frame4.png")} style={styles.filterIcon} />
            </TouchableOpacity>
          </View>

          {showCategoryFilter && (
            <View style={styles.categoryFilterContainer}>
              <TouchableOpacity
                style={[styles.categoryFilterItem, selectedCategory === "all" && styles.selectedCategoryFilter]}
                onPress={() => handleCategorySelect("all")}
              >
                <Text
                  style={[styles.categoryFilterText, selectedCategory === "all" && styles.selectedCategoryFilterText]}
                >
                  All Tasks
                </Text>
              </TouchableOpacity>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryFilterItem, selectedCategory === category.id && styles.selectedCategoryFilter]}
                  onPress={() => handleCategorySelect(category.id)}
                >
                  <Text
                    style={[
                      styles.categoryFilterText,
                      selectedCategory === category.id && styles.selectedCategoryFilterText,
                    ]}
                  >
                    {category.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {searchQuery.length > 0 && (
            <View style={styles.searchResultsContainer}>
              <Text style={styles.searchResultsText}>
                {taskDatas.length} result{taskDatas.length !== 1 ? "s" : ""} for "{searchQuery}"
              </Text>
            </View>
          )}

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <FlatList
              data={CATEGORIES}
              renderItem={renderCategory}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10 }}
            />
          </View>

          <View style={styles.sectionContainer1}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ongoing tasks</Text>
              <TouchableOpacity onPress={navigateToDetails}>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Error loading tasks: {error.message}</Text>
                <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            <FlatList
              data={taskDatas.length > 0 ? taskDatas : FALLBACK_TASKS}
              keyExtractor={(item) => item.id}
              renderItem={renderTask}
              scrollEnabled={false}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              windowSize={10}
            />
          </View>
        </ScrollView>

        <Modal visible={isAddTask} animationType="slide" onRequestClose={closeModal}>
          <View style={styles.modalOverlay}>
            <AddTaskForm onSubmit={handleSubmit} onCancel={closeModal} isLoading={isCreating} />
          </View>
        </Modal>

        <TouchableOpacity
          style={[styles.fab, { opacity: isCreating ? 0.6 : 1 }]}
          onPress={handleAddTask}
          disabled={isCreating}
        >
          <Icon name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 29,
    paddingVertical: 16,
  },
  headerLeft: {
    flex: 1,
    gap:8,
  },
  greeting: {
    fontFamily: 'Filson Pro',
    fontWeight: '500',
    fontStyle: 'normal',
    fontSize: 24,
    lineHeight: 28.8,
    letterSpacing: 0,
    color:'#303642'
  },
  subtitle: {
    fontFamily: 'Filson Pro',
    fontWeight: '400',
    fontStyle: 'normal',
    fontSize: 12,
    lineHeight: 14.4,
    letterSpacing: 0,
    color:'#AFAFAF'
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 20,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#EBEBEB",
    borderRadius: 50,
    paddingHorizontal: 20,
    height: 58,
    alignItems: "center",
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: "#D7D7D7",
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "400",
    color: "#000",
  },
  filterIcon: {
    width: 58,
    height: 58,
  },
  sectionContainer: {
    marginLeft: 29,
    marginBottom: 24,
  },
  sectionContainer1: {
    paddingHorizontal: 29,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: "FilsonPro-Medium",
    fontSize: 20,
    fontWeight: "500",
    lineHeight: 24,
    letterSpacing: 0.8,
    color: "#303642",
    paddingBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  seeAllText: {
    fontFamily: "FilsonPro-Medium",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 15.6,
    letterSpacing: 0,
    color: "#727272",
  },
  loadingContainer: {
    padding: 16,
    alignItems: "center",
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
  categoryCard: {
    borderRadius: 20,
    padding: 16,
    height: 180,
    width: 157,
    marginRight: 10,
  },
  categoryTitle: {
    fontFamily: 'Filson Pro',
    fontWeight: '500',
    fontStyle: 'normal',
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 0.8,
    color: "#4A4A4A",
  },
  categorySubtitle: {
    fontFamily: 'Filson Pro',
    fontWeight: '400',
    fontStyle: 'normal',
    fontSize: 15,
    lineHeight: 18,
    letterSpacing: -0.3,
    color: "#727272",
  },
  categoryIllustration: {
    position: "absolute",
    bottom: 8,
    right: 8,
  },
  illustrationImage: {
    width: 76,
    height: 100,
  },
  taskCard: {
    width: "100%",
    height: 167,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  taskTitle: {
    fontFamily: "FilsonPro-Medium",
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 21.6,
    letterSpacing: -0.36,
    color: "#363636",
  },
  taskBadge: {
    backgroundColor: "#1f2937",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  taskBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
  },
  taskSubtitle: {
    fontFamily: "FilsonPro-Regular",
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 15.6,
    letterSpacing: 0,
    color: "#9B9B9B",
    paddingBottom: 16,
  },
  teamAvatars: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  teamAvatar: {
    width: 25,
    height: 25,
    borderRadius: 15,
  },
  teamAvatarOverlap: {
    marginLeft: -8,
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  circularProgressWrapper: {
    position: "absolute",
    bottom: 10,
    right: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  circularProgressText: {
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 14.4,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 16,
  },
  timeIndicator: {
    width: 20,
    height: 20,
  },
  timeText: {
    fontWeight: "400",
    fontSize: 13,
    lineHeight: 15.6,
    color: "#9B9B9B",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#000",
    borderRadius: 30,
    padding: 16,
    elevation: 5,
  },
  deleteAction: {
    backgroundColor: "#ff4444",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 10,
    marginBottom: 16,
    borderRadius: 24,
  },
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
  },
  deleteText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  categoryFilterContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryFilterItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedCategoryFilter: {
    backgroundColor: "#000",
  },
  categoryFilterText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "400",
  },
  selectedCategoryFilterText: {
    color: "#fff",
    fontWeight: "500",
  },
  searchResultsContainer: {
    paddingHorizontal: 29,
    marginBottom: 16,
  },
  searchResultsText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
})

export default TodoScreen
