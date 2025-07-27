export const API_BASE_URL = "https://mock-server-58ta.onrender.com"
export const USER_UUID = "123e4567-e89b-12d3-a456-426614174000"

export const STORAGE_KEYS = {
  TODOS: "@todos",
  PENDING_ACTIONS: "@pending_actions",
  LAST_SYNC: "@last_sync",
} as const

export const COLORS = {
  primary: "#6366F1", 
  primaryLight: "#A5B4FC",
  secondary: "#10B981", 
  accent: "#F59E0B", 
  background: "#FAFAFA",
  surface: "#FFFFFF",
  surfaceSecondary: "#F8FAFC",
  text: "#1F2937",
  textSecondary: "#6B7280",
  textLight: "#9CA3AF",
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  shadow: "rgba(0, 0, 0, 0.1)",
} as const

export const CATEGORIES = [
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


export const FALLBACK_TASKS = [
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


