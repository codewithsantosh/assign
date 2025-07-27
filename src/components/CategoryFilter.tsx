import type React from "react"
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native"
import Icon from "react-native-vector-icons/Feather"

interface Category {
  id: string
  title: string
  subtitle?: string
  backgroundColor?: string
}

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory: string
  onCategorySelect: (categoryId: string) => void
  onClose: () => void
  visible: boolean
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  onClose,
  visible,
}) => {
  if (!visible) return null

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Filter by Category</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="x" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.categoryList} showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.categoryItem, selectedCategory === "all" && styles.selectedCategory]}
            onPress={() => onCategorySelect("all")}
          >
            <View style={styles.categoryInfo}>
              <Text style={[styles.categoryTitle, selectedCategory === "all" && styles.selectedText]}>All Tasks</Text>
              <Text style={[styles.categorySubtitle, selectedCategory === "all" && styles.selectedSubtext]}>
                Show all tasks
              </Text>
            </View>
            {selectedCategory === "all" && <Icon name="check" size={20} color="#fff" />}
          </TouchableOpacity>

          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryItem, selectedCategory === category.id && styles.selectedCategory]}
              onPress={() => onCategorySelect(category.id)}
            >
              <View style={styles.categoryInfo}>
                <Text style={[styles.categoryTitle, selectedCategory === category.id && styles.selectedText]}>
                  {category.title}
                </Text>
                {category.subtitle && (
                  <Text style={[styles.categorySubtitle, selectedCategory === category.id && styles.selectedSubtext]}>
                    {category.subtitle}
                  </Text>
                )}
              </View>
              {selectedCategory === category.id && <Icon name="check" size={20} color="#fff" />}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.clearButton} onPress={() => onCategorySelect("all")}>
          <Text style={styles.clearButtonText}>Clear Filter</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    margin: 20,
    maxHeight: "80%",
    width: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  categoryList: {
    maxHeight: 300,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
  },
  selectedCategory: {
    backgroundColor: "#000",
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  categorySubtitle: {
    fontSize: 14,
    color: "#666",
  },
  selectedText: {
    color: "#fff",
  },
  selectedSubtext: {
    color: "#ccc",
  },
  clearButton: {
    margin: 20,
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
})

export default CategoryFilter
