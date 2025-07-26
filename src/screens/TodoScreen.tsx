import React, { useEffect, useState, useCallback } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import Icon from 'react-native-vector-icons/Feather';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import AddTaskForm from '../components/AddTaskForm';
import { useTodos } from '../hooks/useTodos';
import uuid from 'react-native-uuid';

const TodoScreen = ({ navigation }) => {
  const [isAddTask, stIsAddTask] = useState(false);
  const [taskDatas, setTaskDatas] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { todos, isLoading, error, createTodo, deleteTodo, isCreating } = useTodos();

  console.log("todo data", todos, error, isLoading);

  useEffect(() => {
    fetchApi();
  }, []);

  const formatTimeRange = (start, end) => {
    const format = (dateStr) => {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    return `${format(start)} - ${format(end)}`;
  };

  const fetchApi = async () => {
    try {
      const res = await fetch("https://mock-server-58ta.onrender.com/123e4567-e89b-12d3-a456-426614174000");
      const data = await res.json();
      const filteredTasks = data.filter((task) => task.taskName === "santosh123");
      const transformed = filteredTasks.map((item, index) => ({
        id: item._id ?? `${index}`,
        title: item.title ?? item.taskName ?? "Untitled Task",
        subtitle: item.teamMembers ? `Team: ${item.teamMembers}` : "No team assigned",
        progress: 46,
        badge: '6d',
        time: formatTimeRange(item.startTime, item.endTime),
        backgroundColor: '#ECDFE9',
      }));
      console.log("Fetched tasks:", filteredTasks);
      setTaskDatas(transformed);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchApi();
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleDeleteTask = (taskId, taskTitle) => {
    Alert.alert(
      "Delete Task",
      `Are you sure you want to delete "${taskTitle}"?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setTaskDatas(prev => prev.filter(task => task.id !== taskId));
              
              if (deleteTodo) {
                await deleteTodo(taskId);
              }
              
              await fetchApi();
            } catch (error) {
              console.error("Delete error:", error);
              await fetchApi();
            }
          }
        }
      ]
    );
  };

  const renderDeleteAction = (taskId: any, taskTitle: any) => {
    return (
      <Animated.View style={styles.deleteAction}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteTask(taskId, taskTitle)}
        >
          <Icon name="trash-2" size={24} color="#fff" />
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

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
    stIsAddTask(true);
  };

  const handleSubmit = (data) => {
    try {
      const { taskName, description, teamMembers, date, startTime, endTime } = data;
      console.log("data", data);
      const id = uuid.v4();
      
      createTodo({
        id: id,
        taskName: 'santosh123',
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
      // Refresh data after adding
      setTimeout(() => fetchApi(), 1000);
    } catch (error) {
      console.error("error", error);
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
    <Swipeable
      renderRightActions={() => renderDeleteAction(item.id, item.title)}
      rightThreshold={40}
    >
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
    </Swipeable>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Hi Saad Shaikh</Text>
            <Text style={styles.subtitle}>
              {taskDatas.length > 0 ? `${taskDatas.length} task${taskDatas.length !== 1 ? 's' : ''} pending` : '06 task pending'}
            </Text>
          </View>
          <View style={styles.avatar}>
            <Image source={require('../assets/profile.png')} style={styles.avatarImage} />
          </View>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#000']} // Android
              tintColor="#000" // iOS
            />
          }
        >
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
            
            {/* {refreshing && (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Refreshing tasks...</Text>
              </View>
            )} */}
            
            <FlatList
              data={taskDatas.length > 0 ? taskDatas : taskData}
              keyExtractor={(item) => item.id}
              renderItem={renderTask}
              scrollEnabled={false}
              extraData={taskDatas} // Ensure re-render when data changes
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
                handleSubmit(data);
              }}
              onCancel={() => stIsAddTask(false)}
            />
          </View>
        </Modal>

        <TouchableOpacity style={styles.fab} onPress={() => handleAddTask()}>
          <Icon name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>
    </GestureHandlerRootView>
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
  filterIcon: {
    width: 58,
    height: 58,
  },
  sectionContainer: {
    paddingHorizontal: 29,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'FilsonPro-Medium',
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.8,
    color: '##303642',
    paddingBottom:16
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontFamily: 'FilsonPro-Medium',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 15.6,
    letterSpacing: 0,
    color: '#727272'
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
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
    fontFamily: 'FilsonPro-Medium',
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 21.6,
    letterSpacing: -0.36,
    color: '#363636',
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
    fontFamily: 'FilsonPro-Regular',
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 15.6,
    letterSpacing: 0,
    color: '#9B9B9B',
    paddingBottom:16
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
  deleteAction: {
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 10,
    marginBottom: 16,
    borderRadius: 24,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  deleteText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});

export default TodoScreen;