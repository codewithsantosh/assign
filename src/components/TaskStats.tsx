import type React from "react"
import { View, Text, StyleSheet } from "react-native"
import { AnimatedCircularProgress } from "react-native-circular-progress"

interface TaskStatsProps {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  completionRate: number
  date: string
}

const TaskStats: React.FC<TaskStatsProps> = ({ totalTasks, completedTasks, pendingTasks, completionRate, date }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.date}>{new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric" })}</Text>
        <Text style={styles.subtitle}>
          {totalTasks} task{totalTasks !== 1 ? "s" : ""} • {completedTasks} completed
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.progressContainer}>
          <AnimatedCircularProgress
            size={80}
            width={8}
            fill={completionRate}
            tintColor="#4CAF50"
            backgroundColor="#e0e0e0"
            rotation={0}
          >
            {() => (
              <View style={styles.progressText}>
                <Text style={styles.progressPercentage}>{Math.round(completionRate)}%</Text>
                <Text style={styles.progressLabel}>Done</Text>
              </View>
            )}
          </AnimatedCircularProgress>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalTasks}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: "#4CAF50" }]}>{completedTasks}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: "#FF9800" }]}>{pendingTasks}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    margin: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    marginBottom: 20,
  },
  date: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressContainer: {
    alignItems: "center",
  },
  progressText: {
    alignItems: "center",
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  progressLabel: {
    fontSize: 12,
    color: "#666",
  },
  statsGrid: {
    flex: 1,
    marginLeft: 20,
  },
  statItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
})

export default TaskStats
