import type React from "react"
import { View, TextInput, TouchableOpacity, Image, StyleSheet } from "react-native"
import Icon from "react-native-vector-icons/Feather"

interface SearchBarProps {
  value: string
  onChangeText: (text: string) => void
  onClear: () => void
  placeholder?: string
  onFilterPress?: () => void
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onClear,
  placeholder = "Search tasks...",
  onFilterPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Image source={require("../assets/search-01.png")} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor="#888"
          value={value}
          onChangeText={onChangeText}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={onClear} style={styles.clearButton}>
            <Icon name="x" size={16} color="#888" />
          </TouchableOpacity>
        )}
      </View>
      {onFilterPress && (
        <TouchableOpacity onPress={onFilterPress} style={styles.filterButton}>
          <Image source={require("../assets/Frame4.png")} style={styles.filterIcon} />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#EBEBEB",
    borderRadius: 50,
    paddingHorizontal: 20,
    height: 58,
    alignItems: "center",
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: "#888",
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "400",
    color: "#000",
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  filterButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  filterIcon: {
    width: 58,
    height: 58,
  },
})

export default SearchBar
