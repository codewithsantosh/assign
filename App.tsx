import type React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import Navigation from "./src/Navigation/Navigation"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
    mutations: {
      retry: 2,
    },
  },
})

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <Navigation/>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}

export default App
