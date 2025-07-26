import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';

const BASE_SLOT_HEIGHT = 42;

const tasks = [
  {
    time: '09:30 AM',
    endTime: '10:30 AM',
    title: 'Website design with responsive',
    users: [require('../assets/Frame.png'), require('../assets/Frame.png'), require('../assets/Frame.png')],
    color: '#EDEBDE',
  },
  {
    time: '11:00 AM',
    endTime: '11:30 AM',
    title: 'Mobile Wireframing',
    users: [require('../assets/Frame.png'), require('../assets/Frame.png')],
    color: '#E0EBDD',
  },
  {
    time: '12:00 PM',
    endTime: '01:00 PM',
    title: 'Meeting with client',
    users: [require('../assets/Frame.png'), require('../assets/Frame.png'), require('../assets/Frame.png')],
    color: '#EBE2FD',
  },
  {
    time: '01:30 PM',
    endTime: '02:00 PM',
    title: 'Finance Dashboard',
    users: [require('../assets/Frame.png'), require('../assets/Frame.png'), require('../assets/Frame.png'), require('../assets/Frame.png')],
    color: '#DEECEC',
  },
];

const generateTimeSlots = (start: string, end: string) => {
  const slots = [];

  const toDate = (time: string) => {
    const [timeStr, modifier] = time.split(' ');
    let [hours, minutes] = timeStr.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    return date;
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hr = hours % 12 || 12;
    const min = minutes.toString().padStart(2, '0');
    return `${hr}:${min} ${ampm}`;
  };

  const startDate = toDate(start);
  const endDate = toDate(end);

  const current = new Date(startDate);
  while (current <= endDate) {
    slots.push(formatTime(new Date(current)));
    current.setMinutes(current.getMinutes() + 30);
  }

  return slots;
};

const getWeekDaysAroundToday = (centerDate: Date) => {
  const days = [];
  for (let i = -3; i <= 3; i++) {
    const date = new Date(centerDate);
    date.setDate(centerDate.getDate() + i);

    days.push({
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dateNum: date.getDate(),
      isToday: i === 0,
    });
  }
  return days;
};

const TodayTasksScreen = ({ navigation }) => {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const weekDays = getWeekDaysAroundToday(date);

  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Today's tasks</Text>
        <View style={styles.avatar}>
          <Image source={require('../assets/profile.png')} style={styles.avatarImage} />
        </View>
      </View>

      <View style={styles.dateSection}>
        <View style={{ gap: 10 }}>
          <Text style={styles.date}>
            {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </Text>
          <Text style={styles.taskCount}>10 tasks today</Text>
        </View>
        <View style={styles.calendarIcon}>
          <Pressable onPress={() => setShowDatePicker(true)}>
            <Image source={require('../assets/Frame1.png')} style={styles.avatar} />
          </Pressable>
          {showDatePicker && (
            <DateTimePicker value={date} mode="date" display="default" onChange={handleDateChange} />
          )}
        </View>
      </View>

      <View style={styles.dayScroll}>
        {weekDays.map((day, index) => (
          <Pressable key={index} style={[styles.day, day.isToday && styles.today]}onPress={()=>{
            console.log(`Clicked date: ${day.dateNum}`);
          }}>
            <Text style={[styles.dayNum, day.isToday && styles.todayText]}>
              {String(day.dateNum).padStart(2, '0')}
            </Text>
            <Text style={[styles.dayLabel, day.isToday && styles.todayText]}>
              {day.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Tasks */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {tasks.map((task, index) => {
          const slots = generateTimeSlots(task.time, task.endTime || task.time);
          const dynamicHeight = Math.max(BASE_SLOT_HEIGHT * slots.length, 107);
          return (
            <View key={index} style={styles.cardContainer}>
              <View style={{ flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center', height: dynamicHeight }}>
                {slots.map((slot, idx) => (
                  <Text key={idx} style={styles.taskTime}>{slot}</Text>
                ))}
              </View>
              <View style={[styles.taskCard, { backgroundColor: task.color, height: dynamicHeight }]}>
                <View style={styles.userRow}>
                  {task?.users?.map((u, i) => (
                    <Image key={i} source={u} style={styles.userImage} />
                  ))}
                </View>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Image source={require('../assets/Group4.png')} style={styles.linkIcon} />
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};


export default TodayTasksScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: 'FilsonPro-Medium',
    fontWeight: '500',
    fontStyle: 'normal',
    fontSize: 18,
    lineHeight: 21.6,
    letterSpacing: 0,
    color: '#4A4A4A',
  },
  avatar: {
    width: 58,
    height: 58,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  dateSection: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontFamily: 'FilsonPro-Medium',
    fontWeight: '500',
    fontStyle: 'normal',
    fontSize: 24,
    lineHeight: 28.8,
    letterSpacing: 0,
    color: '#303642',
  },
  taskCount: {
    fontFamily: 'FilsonPro-Regular',
    fontWeight: '400',
    fontStyle: 'normal',
    fontSize: 16,
    lineHeight: 19.2,
    letterSpacing: 0,
    color: '#AFAFAF',
  },
  calendarIcon: {},
  dayScroll: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  day: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
    gap: 10,
  },
  dayNum: {
    fontFamily: 'FilsonPro-Regular',
    fontWeight: '400',
    fontStyle: 'normal',
    fontSize: 14,
    lineHeight: 16.8,
    letterSpacing: -0.28,
    textAlign: 'center',
  },
  dayLabel: {
    fontFamily: 'FilsonPro-Regular',
    fontWeight: '400',
    fontStyle: 'normal',
    fontSize: 11,
    lineHeight: 13.2,
    letterSpacing: 0,
  },
  today: {
    backgroundColor: '#000',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  todayText: {
    color: '#fff',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskTime: {
    marginBottom: 4,
    color: '#777',
    fontSize: 13,
  },
  taskCard: {
    width: 261,
    padding: 12,
    borderRadius: 20,
    position: 'relative',
  },
  userRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  userImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  taskTitle: {
    fontFamily: 'FilsonPro-Medium',
    fontWeight: '500',
    fontStyle: 'normal',
    fontSize: 16,
    lineHeight: 19.2,
    letterSpacing: 0,
    color: '#363636',
    position: 'absolute',
    bottom: 10,
    width: '60%',
    left: 10,
  },
  linkIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
});
