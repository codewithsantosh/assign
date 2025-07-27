import type React from "react"
import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native"
import { Swipeable, GestureHandlerRootView } from "react-native-gesture-handler"
import Icon from "react-native-vector-icons/Ionicons"
import type { Todo } from "../types"
import { COLORS } from "../config/constants"
import { formatDate } from "../utils/helpers"

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (todo: Todo) => void
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete, onEdit }) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const renderRightActions = (progress: Animated.AnimatedAddition, dragX: Animated.AnimatedAddition) => {
    const trans = dragX.interpolate({
      inputRange: [-100, -50, 0],
      outputRange: [0, 50, 100],
      extrapolate: "clamp",
    })

    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    })

    return (
      <View style={styles.rightActions}>
        <Animated.View style={[styles.actionButton, { transform: [{ translateX: trans }, { scale }] }]}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              setIsDeleting(true)
              onDelete(todo.id)
            }}
          >
            <Icon name="trash-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    )
  }

  return (
    <GestureHandlerRootView>
      <Swipeable renderRightActions={renderRightActions}>
        <TouchableOpacity
          style={[styles.container, todo.completed && styles.completedContainer]}
          onPress={() => onEdit(todo)}
          activeOpacity={0.7}
        >
          <TouchableOpacity style={styles.checkbox} onPress={() => onToggle(todo.id)}>
            <View style={[styles.checkboxInner, todo.completed && styles.checkboxCompleted]}>
              {todo.completed && <Icon name="checkmark" size={16} color="#FFFFFF" />}
            </View>
          </TouchableOpacity>

          <View style={styles.content}>
            <Text style={[styles.title, todo.completed && styles.completedText]} numberOfLines={2}>
              {todo.title}
            </Text>
            {todo.description && (
              <Text style={[styles.description, todo.completed && styles.completedText]} numberOfLines={2}>
                {todo.description}
              </Text>
            )}
            <View style={styles.footer}>
              <Text style={styles.date}>{formatDate(todo.updatedAt)}</Text>
              {!todo.synced && (
                <View style={styles.syncStatus}>
                  <View style={styles.syncDot} />
                  <Text style={styles.syncText}>Pending</Text>
                </View>
              )}
            </View>
          </View>

          {isDeleting && (
            <View style={styles.loadingOverlay}>
              <Icon name="hourglass-outline" size={16} color={COLORS.textSecondary} />
            </View>
          )}
        </TouchableOpacity>
      </Swipeable>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.surface,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  completedContainer: {
    opacity: 0.6,
    backgroundColor: COLORS.surfaceSecondary,
  },
  checkbox: {
    marginRight: 16,
    marginTop: 2,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
  },
  checkboxCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
    lineHeight: 22,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: COLORS.textLight,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: "500",
  },
  syncStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.warning,
    marginRight: 6,
  },
  syncText: {
    fontSize: 11,
    color: COLORS.warning,
    fontWeight: "500",
  },
  rightActions: {
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    marginVertical: 6,
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: "100%",
  },
  deleteButton: {
    backgroundColor: COLORS.error,
    borderRadius: 12,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingOverlay: {
    position: "absolute",
    right: 20,
    top: 20,
  },
})
