import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface AddTaskFormProps {
  onSubmit: (data: {
    taskName: string;
    description: string;
    teamMembers: string;
    date: Date;
    startTime: Date;
    endTime: Date;
  }) => void;
  onCancel?: () => void;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({ onSubmit, onCancel }) => {
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [teamMembers, setTeamMembers] = useState('');
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handleStartTimeChange = (_: any, selectedDate?: Date) => {
    setShowStartTimePicker(false);
    if (selectedDate) setStartTime(selectedDate);
  };

  const handleEndTimeChange = (_: any, selectedDate?: Date) => {
    setShowEndTimePicker(false);
    if (selectedDate) setEndTime(selectedDate);
  };
  console.log("date",date,startTime,endTime)

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Add New Task</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Task Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter task name"
          value={taskName}
          onChangeText={setTaskName}
          placeholderTextColor="#aaa"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter description"
          multiline
          value={description}
          onChangeText={setDescription}
          placeholderTextColor="#aaa"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Team Members</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. John, Emma"
          value={teamMembers}
          onChangeText={setTeamMembers}
          placeholderTextColor="#aaa"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.picker}>
          <Text style={styles.pickerText}>{date.toDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker value={date} mode="date" display="default" onChange={handleDateChange} />
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Start Time</Text>
        <TouchableOpacity onPress={() => setShowStartTimePicker(true)} style={styles.picker}>
          <Text style={styles.pickerText}>
            {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>
        {showStartTimePicker && (
          <DateTimePicker value={startTime} mode="time" display="default" onChange={handleStartTimeChange} />
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>End Time</Text>
        <TouchableOpacity onPress={() => setShowEndTimePicker(true)} style={styles.picker}>
          <Text style={styles.pickerText}>
            {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>
        {showEndTimePicker && (
          <DateTimePicker value={endTime} mode="time" display="default" onChange={handleEndTimeChange} />
        )}
      </View>

      <View style={styles.buttonRow}>
        {onCancel && (
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={() =>
            onSubmit({ taskName, description, teamMembers, date, startTime, endTime })
          }
        >
          <Text style={styles.submitText}>Add Task</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddTaskForm;

const styles = StyleSheet.create({
  card: {
    margin: 20,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111',
    marginBottom: 12,
    textAlign: 'center',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#444',
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  picker: {
    padding: 12,
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  pickerText: {
    fontSize: 14,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#111',
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  cancelButton: {
    backgroundColor: '#f1f1f1',
  },
  cancelText: {
    color: '#555',
    fontWeight: '500',
  },
});
