import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import Icon from 'react-native-vector-icons/Feather';
import AddTaskForm from '../components/AddTaskForm';
import { useTodos } from '../hooks/useTodos';
import uuid from 'react-native-uuid';
const TodoScreen = ({ navigation }) => {
  const [isAddTask, stIsAddTask] = useState(false);
  const [taskDatas, setTaskDatas] = useState([]);
  const { todos, isLoading, error } = useTodos();
  const { createTodo, isCreating } = useTodos()
  console.log("todo data", todos,error,isLoading)

  useEffect(()=>{
    fetchApi();
  },[])
  const fetchApi=async ()=>{
    try {
      const res=await fetch("https://mock-server-58ta.onrender.com/123e4567-e89b-12d3-a456-426614174000");
      console.log("res",res)
    } catch (error) {
      console.error("err",error)
    }
  }
  const categories = [
    {
      id: '1',
      title: 'Gardening',
      subtitle: '02 Tasks',
      image: require('../assets/Group.png'),
      backgroundColor: '#FDE8C9',
    },
    {
      id: '2',
      title: 'Mobile App',
      subtitle: '05 Tasks',
      image: require('../assets/Group1.png'),
      backgroundColor: '#E0EBDD',
    },
    {
      id: '3',
      title: 'Gardening',
      subtitle: '02 Tasks',
      image: require('../assets/Group.png'),
      backgroundColor: '#ECDFE9',
    },
  ];

  const taskData = [
    {
      id: '1',
      title: 'Design Review Meeting',
      subtitle: 'Team members',
      progress: 46,
      badge: '6d',
      time: '2:30 PM - 7:00PM',
      backgroundColor: '#ECDFE9',
    },
    {
      id: '2',
      title: 'Dashboard & Mobile App',
      subtitle: 'Team members',
      badge: '4d',
      progress: 46,
      time: '2:30 PM - 7:00PM',
      backgroundColor: '#EDEBDE',
    },
  ];

  const handleAddTask = () => {
    stIsAddTask(true)
  }
  const handleSubmit = (data) => {
    try {
      const { taskName, description, teamMembers, date, startTime, endTime } = data;
      const id = uuid.v4();;
      createTodo({
        id: id,
        title: taskName,
        description: description,
        teamMembers: teamMembers,
        completed: false,
        createdAt: new Date(date).toISOString(),
        updatedAt: new Date().toISOString(),
        date: date.toISOString(),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });
      

      stIsAddTask(false);
    } catch (error) {
      console.error("error", error)
    }

  };


  const renderCategory = ({ item }) => (
    <TouchableOpacity style={[styles.categoryCard, { backgroundColor: item.backgroundColor }]}>
      <Text style={styles.categoryTitle}>{item.title}</Text>
      <Text style={styles.categorySubtitle}>{item.subtitle}</Text>
      <View style={styles.categoryIllustration}>
        <Image source={item.image} style={styles.illustrationImage} />
      </View>
    </TouchableOpacity>
  );

  const renderTask = ({ item }) => (
    <View style={[styles.taskCard, { backgroundColor: item.backgroundColor }]}>
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
        <Image source={require('../assets/Frame.png')} style={styles.teamAvatar} />
        <Image source={require('../assets/Frame.png')} style={[styles.teamAvatar, styles.teamAvatarOverlap]} />
        <Image source={require('../assets/Frame.png')} style={[styles.teamAvatar, styles.teamAvatarOverlap]} />
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
            <Image source={require('../assets/clock-01.png')} style={styles.timeIndicator} />
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Hi Saad Shaikh</Text>
          <Text style={styles.subtitle}>06 task pending</Text>
        </View>
        <View style={styles.avatar}>
          <Image source={require('../assets/profile.png')} style={styles.avatarImage} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Image
              source={require('../assets/search-01.png')}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#888"
            />
          </View>
          <Image
            source={require('../assets/Frame4.png')}
            style={styles.filterIcon}
          />

        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10 }}
          />
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ongoing tasks</Text>
            <TouchableOpacity onPress={() => navigation.navigate('TodoDetails')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={taskData}
            keyExtractor={(item) => item.id}
            renderItem={renderTask}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
      <Modal
        visible={isAddTask}
        animationType="slide"
        onRequestClose={() => stIsAddTask(false)}
      >
        <View style={styles.modalOverlay}>
          <AddTaskForm
            onSubmit={(data) => {
              console.log('Task submitted:', data);
              handleSubmit(data)
              stIsAddTask(false);
            }}
            onCancel={() => stIsAddTask(false)}
          />
        </View>
      </Modal>

      <TouchableOpacity style={styles.fab} onPress={() => handleAddTask()}>
        <Icon name="plus" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 29,
    paddingVertical: 16,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '500',
    color: '#303642',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#AFAFAF',
    fontWeight: '400',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#EBEBEB',
    borderRadius: 50,
    paddingHorizontal: 20,
    height: 58,
    alignItems: 'center',
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: '#888',
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: '#000',
  },
  filterButton: {
    width: 58,
    height: 58,
    backgroundColor: '#111111',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    width: 58,
    height: 58,
  },
  sectionContainer: {
    paddingHorizontal: 29,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 15.6,
  },
  categoryCard: {
    borderRadius: 20,
    padding: 16,
    height: 180,
    width: 157,
    marginRight: 10,
  },
  categoryTitle: {
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 24,
    color: '#4A4A4A',
  },
  categorySubtitle: {
    fontWeight: '400',
    fontSize: 15,
    lineHeight: 18,
    color: '#727272',
  },
  categoryIllustration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  illustrationImage: {
    width: 76,
    height: 100,
  },
  taskCard: {
    width: '100%',
    paddingHorizontal: 32,
    height: 167,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  taskBadge: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  taskBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  taskSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  teamAvatars: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  circularProgressWrapper: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularProgressText: {
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 14.4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 16,
  },
  timeIndicator: {
    width: 20,
    height: 20,
  },
  timeText: {
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 15.6,
    color: '#9B9B9B',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#000',
    borderRadius: 30,
    padding: 16,
    elevation: 5,
  },

});

export default TodoScreen;
