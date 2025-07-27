import type React from "react"
import { useState, useCallback } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import DateTimePicker from "@react-native-community/datetimepicker"
import Icon from "react-native-vector-icons/Feather"

interface AddTaskFormProps {
  onSubmit: (data: {
    taskName: string
    description: string
    teamMembers: string
    date: Date
    startTime: Date
    endTime: Date
  }) => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({ onSubmit, onCancel, isLoading }) => {
  const [taskName, setTaskName] = useState("")
  const [description, setDescription] = useState("")
  const [teamMembers, setTeamMembers] = useState("")
  const [date, setDate] = useState(new Date())
  const [startTime, setStartTime] = useState(new Date())
  const [endTime, setEndTime] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showStartTimePicker, setShowStartTimePicker] = useState(false)
  const [showEndTimePicker, setShowEndTimePicker] = useState(false)

  const handleSubmit = useCallback(async () => {
    if (!taskName.trim()) {
      Alert.alert("Validation Error", "Please enter a task name")
      return
    }

    if (!description.trim()) {
      Alert.alert("Validation Error", "Please enter a description")
      return
    }

    if (startTime >= endTime) {
      Alert.alert("Validation Error", "End time must be after start time")
      return
    }

    try {
      await onSubmit({
        taskName,
        description,
        teamMembers,
        date,
        startTime,
        endTime,
      })
    } catch (error) {
      console.error("Form submission error:", error)
    }
  }, [taskName, description, teamMembers, date, startTime, endTime, onSubmit])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString()
  }

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios")
    if (selectedDate) {
      setDate(selectedDate)
    }
  }

  const onStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(Platform.OS === "ios")
    if (selectedTime) {
      setStartTime(selectedTime)
    }
  }

  const onEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(Platform.OS === "ios")
    if (selectedTime) {
      setEndTime(selectedTime)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Icon name="x" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Task</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Task Name</Text>
          <TextInput
            style={styles.input}
            value={taskName}
            onChangeText={setTaskName}
            placeholder="Enter task name"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter task description"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Team Members</Text>
          <TextInput
            style={styles.input}
            value={teamMembers}
            onChangeText={setTeamMembers}
            placeholder="Enter team member names"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateTimeText}>{formatDate(date)}</Text>
            <Icon name="calendar" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.timeRow}>
          <View style={[styles.inputGroup, styles.timeInput]}>
            <Text style={styles.label}>Start Time</Text>
            <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowStartTimePicker(true)}>
              <Text style={styles.dateTimeText}>{formatTime(startTime)}</Text>
              <Icon name="clock" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={[styles.inputGroup, styles.timeInput]}>
            <Text style={styles.label}>End Time</Text>
            <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowEndTimePicker(true)}>
              <Text style={styles.dateTimeText}>{formatTime(endTime)}</Text>
              <Icon name="clock" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {showDatePicker && <DateTimePicker value={date} mode="date" display="default" onChange={onDateChange} />}

        {showStartTimePicker && (
          <DateTimePicker value={startTime} mode="time" display="default" onChange={onStartTimeChange} />
        )}

        {showEndTimePicker && (
          <DateTimePicker value={endTime} mode="time" display="default" onChange={onEndTimeChange} />
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.submitButton, { opacity: isLoading ? 0.6 : 1 }]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.submitButtonText}>{isLoading ? "Creating..." : "Create Task"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  cancelButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  placeholder: {
    width: 40,
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#000",
    backgroundColor: "#f9f9f9",
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  dateTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f9f9f9",
  },
  dateTimeText: {
    fontSize: 16,
    color: "#000",
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  timeInput: {
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  submitButton: {
    backgroundColor: "#000",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default AddTaskForm
