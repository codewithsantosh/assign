import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import Icon from "react-native-vector-icons/Feather"

interface SearchResultsProps {
  query: string
  resultCount: number
  totalCount: number
  onClear: () => void
}

const SearchResults: React.FC<SearchResultsProps> = ({ query, resultCount, totalCount, onClear }) => {
  if (!query) return null

  return (
    <View style={styles.container}>
      <View style={styles.resultInfo}>
        <Text style={styles.resultText}>
          {resultCount} of {totalCount} tasks found for "{query}"
        </Text>
        {resultCount === 0 && <Text style={styles.noResultsText}>Try adjusting your search terms or filters</Text>}
      </View>
      <TouchableOpacity onPress={onClear} style={styles.clearButton}>
        <Icon name="x" size={16} color="#666" />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 29,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginHorizontal: 20,
  },
  resultInfo: {
    flex: 1,
  },
  resultText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  noResultsText: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  clearButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: "#fff",
  },
})

export default SearchResults
