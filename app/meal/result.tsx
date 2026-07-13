import { useMemo, useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Header } from "@/components/ui/Header";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useThemeContext } from "@/context/ThemeContext";
import { useNutritionContext } from "@/context/NutritionContext";
import { MealType, FoodItem } from "@/types/meal";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Loader } from "@/components/ui/Loader";
import { aiService } from "@/services/ai";

interface DetectedFood {
  name: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  icon: string;
}

const DEFAULT_FOODS: DetectedFood[] = [
  { name: "Grilled Chicken Breast", serving: "150g", calories: 247, protein: 46, carbs: 0, fat: 5.4, icon: "🍗" },
  { name: "Steamed Rice", serving: "200g", calories: 216, protein: 4.4, carbs: 45, fat: 0.4, icon: "🍚" },
  { name: "Mixed Vegetables", serving: "100g", calories: 65, protein: 2.5, carbs: 13, fat: 0.2, icon: "🥗" },
];

function getFoodIcon(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("chicken") || n.includes("poultry")) return "🍗";
  if (n.includes("rice") || n.includes("grain")) return "🍚";
  if (n.includes("salad") || n.includes("vegetable") || n.includes("green") || n.includes("broccoli") || n.includes("spinach")) return "🥗";
  if (n.includes("apple") || n.includes("fruit") || n.includes("strawberry") || n.includes("berry")) return "🍎";
  if (n.includes("banana")) return "🍌";
  if (n.includes("egg")) return "🍳";
  if (n.includes("fish") || n.includes("salmon") || n.includes("tuna")) return "🐟";
  if (n.includes("beef") || n.includes("steak") || n.includes("meat") || n.includes("pork")) return "🥩";
  if (n.includes("bread") || n.includes("toast") || n.includes("sandwich")) return "🍞";
  if (n.includes("milk") || n.includes("yogurt") || n.includes("cheese")) return "🥛";
  if (n.includes("avocado")) return "🥑";
  if (n.includes("pizza")) return "🍕";
  if (n.includes("burger")) return "🍔";
  if (n.includes("sweet") || n.includes("cake") || n.includes("chocolate") || n.includes("cookie")) return "🍰";
  return "🍽️";
}

export default function MealResultScreen() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const { isDark, colors } = useThemeContext();
  const { addMeal } = useNutritionContext();
  
  // Basic states
  const [selectedMealType, setSelectedMealType] = useState<MealType>(MealType.Breakfast);
  const [detectedFoods, setDetectedFoods] = useState<DetectedFood[]>(DEFAULT_FOODS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(95);

  // Edit / Add modal states
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editIndex, setEditIndex] = useState<number>(-1); // -1 = adding a new custom item
  const [editName, setEditName] = useState("");
  const [editServing, setEditServing] = useState("");
  const [editCalories, setEditCalories] = useState("");
  const [editProtein, setEditProtein] = useState("");
  const [editCarbs, setEditCarbs] = useState("");
  const [editFat, setEditFat] = useState("");

  // AI Search states
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    if (imageUri) {
      setLoading(true);
      setError(null);
      aiService.analyzeFoodImage(imageUri)
        .then((result) => {
          const mappedFoods: DetectedFood[] = result.foods.map((food) => ({
            name: food.name,
            serving: food.servingSize,
            calories: food.calories,
            protein: food.proteinG,
            carbs: food.carbsG,
            fat: food.fatG,
            icon: getFoodIcon(food.name),
          }));
          setDetectedFoods(mappedFoods);
          setConfidence(Math.round(result.confidence * 100));
        })
        .catch((err) => {
          console.error("Scanning failed, falling back to mock data", err);
          setError("Failed to scan image. Displaying sample result instead.");
          setDetectedFoods(DEFAULT_FOODS);
          setConfidence(95);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // Manual entry mode, empty by default or show samples
      setDetectedFoods([]);
      setConfidence(100);
    }
  }, [imageUri]);

  // Recalculate totals dynamically
  const totalCalories = useMemo(() => detectedFoods.reduce((sum, f) => sum + f.calories, 0), [detectedFoods]);
  const totalProtein = useMemo(() => detectedFoods.reduce((sum, f) => sum + f.protein, 0), [detectedFoods]);
  const totalCarbs = useMemo(() => detectedFoods.reduce((sum, f) => sum + f.carbs, 0), [detectedFoods]);
  const totalFat = useMemo(() => detectedFoods.reduce((sum, f) => sum + f.fat, 0), [detectedFoods]);

  const handleLogMeal = () => {
    if (detectedFoods.length === 0) {
      alert("Please add at least one food item before logging.");
      return;
    }

    const foodsToLog: FoodItem[] = detectedFoods.map((f, i) => ({
      id: `scanned_${Date.now()}_${i}`,
      name: f.name,
      servingSize: f.serving,
      calories: f.calories,
      proteinG: f.protein,
      carbsG: f.carbs,
      fatG: f.fat,
    }));

    addMeal(selectedMealType, foodsToLog);
    router.replace("/(tabs)/home");
  };

  // Actions
  const handleDeleteFood = (index: number) => {
    setDetectedFoods((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOpenEditModal = (index: number) => {
    const food = detectedFoods[index];
    setEditIndex(index);
    setEditName(food.name);
    setEditServing(food.serving);
    setEditCalories(food.calories.toString());
    setEditProtein(food.protein.toString());
    setEditCarbs(food.carbs.toString());
    setEditFat(food.fat.toString());
    setIsEditModalVisible(true);
  };

  const handleOpenAddCustomModal = () => {
    setEditIndex(-1);
    setEditName("");
    setEditServing("");
    setEditCalories("");
    setEditProtein("");
    setEditCarbs("");
    setEditFat("");
    setIsEditModalVisible(true);
  };

  const handleSaveFood = () => {
    if (!editName.trim()) {
      alert("Food Name is required");
      return;
    }
    const caloriesNum = Math.max(0, parseFloat(editCalories) || 0);
    const proteinNum = Math.max(0, parseFloat(editProtein) || 0);
    const carbsNum = Math.max(0, parseFloat(editCarbs) || 0);
    const fatNum = Math.max(0, parseFloat(editFat) || 0);

    const updatedFood: DetectedFood = {
      name: editName,
      serving: editServing || "1 serving",
      calories: caloriesNum,
      protein: proteinNum,
      carbs: carbsNum,
      fat: fatNum,
      icon: getFoodIcon(editName),
    };

    if (editIndex === -1) {
      setDetectedFoods((prev) => [...prev, updatedFood]);
    } else {
      setDetectedFoods((prev) => {
        const next = [...prev];
        next[editIndex] = updatedFood;
        return next;
      });
    }

    setIsEditModalVisible(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError(null);
    setSearchResults([]);

    try {
      const results = await aiService.searchFood(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error("[Search] Failed to search food with AI:", err);
      setSearchError("Failed to search. Please try a different term.");
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSearchResult = (item: FoodItem) => {
    setEditIndex(-1);
    setEditName(item.name);
    setEditServing(item.servingSize);
    setEditCalories(item.calories.toString());
    setEditProtein(item.proteinG.toString());
    setEditCarbs(item.carbsG.toString());
    setEditFat(item.fatG.toString());
    
    setIsSearchModalVisible(false);
    setIsEditModalVisible(true);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? colors.background.dark : colors.background.light }}
      className="flex-1"
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Header title="Scan Results" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} className="flex-1 px-4">
        {loading ? (
          <View style={{ flex: 1, paddingVertical: 80, justifyContent: 'center', alignItems: 'center' }}>
            <Loader size="large" color={colors.primary[500]} />
            <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500], marginTop: 16 }} className="font-semibold text-sm text-center">
              Analyzing food image with Opencode AI...
            </Text>
          </View>
        ) : (
          <>
            {error && (
              <Card variant="outlined" style={{ borderColor: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.05)', flexDirection: 'row', alignItems: 'center', gap: 8 }} className="mb-4 py-3 px-4">
                <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#EF4444" />
                <Text style={{ color: '#EF4444' }} className="text-xs font-semibold flex-1">{error}</Text>
              </Card>
            )}
            
            <Card variant="elevated" className="items-center mb-4 py-6">
              <Badge label={`${confidence}% AI Confidence`} variant="success" size="sm" />
              <View className="flex-row items-baseline mt-4">
                <Text style={{ color: colors.primary[500] }} className="text-6xl font-black tracking-tight">
                  {totalCalories}
                </Text>
                <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-lg font-bold ml-1">
                  kcal
                </Text>
              </View>
              <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-xs font-semibold mt-1">
                Total Meal Calories
              </Text>
            </Card>
            <View className="flex-row gap-3 mb-4">
              <Card variant="outlined" className="flex-1 items-center py-3">
                <Text style={{ color: "#3B82F6" }} className="text-base font-black">{totalProtein}g</Text>
                <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Protein</Text>
              </Card>
              <Card variant="outlined" className="flex-1 items-center py-3">
                <Text style={{ color: "#F59E0B" }} className="text-base font-black">{totalCarbs}g</Text>
                <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Carbs</Text>
              </Card>
              <Card variant="outlined" className="flex-1 items-center py-3">
                <Text style={{ color: "#10B981" }} className="text-base font-black">{totalFat.toFixed(1)}g</Text>
                <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Fat</Text>
              </Card>
            </View>
            <Card variant="outlined" className="mb-4">
              <Text style={{ color: isDark ? colors.text.dark : colors.text.light }} className="text-base font-bold mb-3">
                Detected Foods
              </Text>
              <View className="gap-2">
                {detectedFoods.length === 0 ? (
                  <View className="py-4 items-center">
                    <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-xs font-semibold">
                      No foods added yet. Search or enter one below!
                    </Text>
                  </View>
                ) : (
                  detectedFoods.map((food, index) => {
                    const isLast = index === detectedFoods.length - 1;
                    return (
                      <View
                        key={index}
                        style={{
                          borderBottomWidth: isLast ? 0 : 1,
                          borderBottomColor: isDark ? colors.border.dark : "rgba(0,0,0,0.05)",
                        }}
                        className="flex-row items-center justify-between py-3"
                      >
                        <TouchableOpacity
                          onPress={() => handleOpenEditModal(index)}
                          activeOpacity={0.7}
                          className="flex-row items-center flex-1 pr-3"
                        >
                          <View style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" }} className="w-10 h-10 rounded-full items-center justify-center mr-3">
                            <Text className="text-lg">{food.icon}</Text>
                          </View>
                          <View className="flex-1">
                            <Text style={{ color: isDark ? colors.text.dark : colors.text.light }} className="text-sm font-bold">{food.name}</Text>
                            <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-xs font-semibold mt-0.5">{food.serving} (Tap to edit)</Text>
                          </View>
                        </TouchableOpacity>
                        <View className="flex-row items-center gap-3">
                          <Text style={{ color: colors.primary[500] }} className="text-sm font-black mr-1">{food.calories} kcal</Text>
                          <TouchableOpacity
                            onPress={() => handleDeleteFood(index)}
                            activeOpacity={0.7}
                            className="p-1"
                            accessibilityLabel={`Delete ${food.name}`}
                          >
                            <MaterialCommunityIcons name="trash-can-outline" size={20} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>

              {/* Add Foods Action Buttons */}
              <View className="flex-row gap-3 mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <Button
                  title="AI Search"
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  icon={<MaterialCommunityIcons name="magnify" size={16} color={isDark ? colors.primary[400] : colors.primary[700]} />}
                  onPress={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    setSearchError(null);
                    setIsSearchModalVisible(true);
                  }}
                />
                <Button
                  title="Add Custom"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  icon={<MaterialCommunityIcons name="plus" size={16} color={colors.primary[500]} />}
                  onPress={handleOpenAddCustomModal}
                />
              </View>
            </Card>
            <Card variant="outlined" className="mb-4">
              <Text style={{ color: isDark ? colors.text.dark : colors.text.light }} className="text-base font-bold mb-3">
                Log as Meal
              </Text>
              <View className="flex-row gap-2 mb-4 justify-between">
                {Object.values(MealType).map((meal) => {
                  const isSelected = selectedMealType === meal;
                  return (
                    <TouchableOpacity
                      key={meal}
                      onPress={() => setSelectedMealType(meal)}
                      className="px-4 py-2 rounded-full border flex-1 items-center justify-center mr-1"
                      style={{
                        backgroundColor: isSelected ? colors.primary[500] : (isDark ? colors.surface.dark : colors.white),
                        borderColor: isSelected ? colors.primary[500] : (isDark ? colors.border.dark : colors.neutral[200]),
                      }}
                      activeOpacity={0.8}
                      accessibilityLabel={`Log as ${meal}`}
                    >
                      <Text style={{
                        color: isSelected ? colors.black : (isDark ? colors.text.secondary : colors.neutral[600]),
                        fontWeight: isSelected ? "700" : "500",
                      }} className="text-xs capitalize">{meal}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Button title="Log Meal" onPress={handleLogMeal} fullWidth />
            </Card>
          </>
        )}
      </ScrollView>

      {/* Edit / Custom Add Food Modal */}
      <Modal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        title={editIndex === -1 ? "Add Food Item" : "Edit Food Item"}
      >
        <ScrollView style={{ maxHeight: 400 }} contentContainerStyle={{ gap: 12, paddingBottom: 16 }}>
          <Input
            label="Food Name"
            value={editName}
            onChangeText={setEditName}
            placeholder="e.g. Chicken Breast"
          />
          <Input
            label="Serving Size"
            value={editServing}
            onChangeText={setEditServing}
            placeholder="e.g. 150g or 1 cup"
          />
          <View className="flex-row gap-3">
            <Input
              label="Calories (kcal)"
              value={editCalories}
              onChangeText={setEditCalories}
              placeholder="0"
              keyboardType="numeric"
              className="flex-1"
            />
            <Input
              label="Protein (g)"
              value={editProtein}
              onChangeText={setEditProtein}
              placeholder="0"
              keyboardType="numeric"
              className="flex-1"
            />
          </View>
          <View className="flex-row gap-3">
            <Input
              label="Carbs (g)"
              value={editCarbs}
              onChangeText={setEditCarbs}
              placeholder="0"
              keyboardType="numeric"
              className="flex-1"
            />
            <Input
              label="Fat (g)"
              value={editFat}
              onChangeText={setEditFat}
              placeholder="0"
              keyboardType="numeric"
              className="flex-1"
            />
          </View>
          <View className="flex-row gap-3 mt-6">
            <Button
              title="Cancel"
              variant="ghost"
              className="flex-1"
              onPress={() => setIsEditModalVisible(false)}
            />
            <Button
              title="Save"
              variant="primary"
              className="flex-1"
              onPress={handleSaveFood}
            />
          </View>
        </ScrollView>
      </Modal>

      {/* AI Food Search Modal */}
      <Modal
        visible={isSearchModalVisible}
        onClose={() => setIsSearchModalVisible(false)}
        title="AI Food Search"
      >
        <View style={{ gap: 12, paddingBottom: 16 }}>
          <Input
            label="Search nutrition database"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="e.g. 1 medium banana"
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            rightIcon={
              <TouchableOpacity onPress={handleSearch} disabled={searching} style={{ padding: 4 }}>
                <MaterialCommunityIcons name="magnify" size={24} color={colors.primary[500]} />
              </TouchableOpacity>
            }
          />
          
          {searching && (
            <View style={{ paddingVertical: 20, alignItems: "center" }}>
              <Loader size="small" color={colors.primary[500]} />
              <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500], marginTop: 8, fontSize: 12 }}>
                Querying AI models...
              </Text>
            </View>
          )}

          {searchError && (
            <Text style={{ color: colors.error[500], fontSize: 12, textAlign: "center", marginVertical: 8 }}>
              {searchError}
            </Text>
          )}

          <ScrollView style={{ maxHeight: 220, marginTop: 8 }} contentContainerStyle={{ gap: 8 }}>
            {searchResults.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleSelectSearchResult(item)}
                style={{
                  backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                  borderColor: isDark ? colors.border.dark : colors.neutral[200],
                  borderWidth: 1,
                  borderRadius: 12,
                  padding: 12,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={{ color: isDark ? colors.text.dark : colors.text.light, fontWeight: "bold", fontSize: 14 }}>
                    {item.name}
                  </Text>
                  <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500], fontSize: 12, marginTop: 2 }}>
                    Serving: {item.servingSize}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ color: colors.primary[500], fontWeight: "900", fontSize: 14 }}>
                    {item.calories} kcal
                  </Text>
                  <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500], fontSize: 10, marginTop: 2 }}>
                    P: {item.proteinG}g | C: {item.carbsG}g | F: {item.fatG}g
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            
            {!searching && searchResults.length === 0 && searchQuery.trim().length > 0 && !searchError && (
              <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500], textAlign: "center", fontSize: 12, marginVertical: 12 }}>
                No results found. Try another query.
              </Text>
            )}
          </ScrollView>

          <Button
            title="Cancel"
            variant="ghost"
            fullWidth
            onPress={() => setIsSearchModalVisible(false)}
            className="mt-4"
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}
