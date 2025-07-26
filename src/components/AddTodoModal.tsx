"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from "react-native"
import Icon from "react-native-vector-icons/Ionicons"
import type { Todo } from "../types"
import { COLORS } from "../config/constants"

interface AddTodoModalProps {
  visible: boolean
  onClose: () => void
  onSave: (todo: Omit<Todo, "id" | "_id" | "synced" | "pendingAction">) => void
  editingTodo?: Todo | null
  onUpdate?: (id: string, updates: Partial<Todo>) => void
}

export const AddTodoModal: React.FC<AddTodoModalProps> = ({ visible, onClose, onSave, editingTodo, onUpdate }) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title)
      setDescription(editingTodo.description || "")
    } else {
      setTitle("")
      setDescription("")
    }
  }, [editingTodo, visible])

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title for your todo")
      return
    }

    const now = new Date().toISOString()

    if (editingTodo && onUpdate) {
      onUpdate(editingTodo.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        updatedAt: now,
      })
    } else {
      onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        completed: false,
        createdAt: now,
        updatedAt: now,
      })
    }

    onClose()
  }

  const handleClose = () => {
    setTitle("")
    setDescription("")
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
            <Icon name="close" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{editingTodo ? "Edit Task" : "New Task"}</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.titleInput}
                value={title}
                onChangeText={setTitle}
                placeholder="What needs to be done?"
                placeholderTextColor={COLORS.textLight}
                autoFocus
                returnKeyType="next"
                multiline
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.descriptionInput}
                value={description}
                onChangeText={setDescription}
                placeholder="Add more details..."
                placeholderTextColor={COLORS.textLight}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    minHeight: 56,
    textAlignVertical: "top",
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    height: 120,
    textAlignVertical: "top",
  },
})
//8095031111