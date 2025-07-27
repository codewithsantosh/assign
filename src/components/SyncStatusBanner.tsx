import type React from "react"
import { useEffect, useRef } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"
import { COLORS } from "../config/constants"

interface SyncStatusBannerProps {
  isOnline: boolean
  pendingChanges: number
  isSyncing: boolean
  onSync: () => void
}

export const SyncStatusBanner: React.FC<SyncStatusBannerProps> = ({ isOnline, pendingChanges, isSyncing, onSync }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current
  const shouldShow = !isOnline || (pendingChanges > 0 && isOnline)

  useEffect(() => {
    if (shouldShow) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start()
    } else {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }, [shouldShow, slideAnim])

  if (!shouldShow) return null

  const getBannerConfig = () => {
    if (!isOnline) {
      return {
        backgroundColor: COLORS.warning,
        icon: "cloud-offline-outline",
        text: `Offline • ${pendingChanges} pending`,
        showButton: false,
      }
    } else if (isSyncing) {
      return {
        backgroundColor: COLORS.primary,
        icon: "sync-outline",
        text: "Syncing...",
        showButton: false,
      }
    } else {
      return {
        backgroundColor: COLORS.success,
        icon: "cloud-upload-outline",
        text: `${pendingChanges} changes to sync`,
        showButton: true,
      }
    }
  }

  const config = getBannerConfig()

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: config.backgroundColor },
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.content}>
        <Icon name={config.icon} size={18} color="#FFFFFF" />
        <Text style={styles.text}>{config.text}</Text>
      </View>

      {config.showButton && (
        <TouchableOpacity onPress={onSync} style={styles.syncButton}>
          <Text style={styles.syncButtonText}>Sync</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  syncButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  syncButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
})
