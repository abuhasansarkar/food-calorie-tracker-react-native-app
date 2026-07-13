import { apiService } from "./api";
import { storageService } from "./storage";

export interface FoodReference {
  id: string;
  name: string;
  serving: string;
  servingGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  icon: string;
  category: string;
}

const FALLBACK_FOODS: FoodReference[] = [
  { id: "1", name: "Chicken Breast", serving: "150g", servingGrams: 150, calories: 247, protein: 46, carbs: 0, fat: 5.3, icon: "🍗", category: "Lunch" },
  { id: "2", name: "Brown Rice", serving: "200g", servingGrams: 200, calories: 216, protein: 5, carbs: 45, fat: 1.8, icon: "🍚", category: "Lunch" },
  { id: "3", name: "Avocado", serving: "100g", servingGrams: 100, calories: 160, protein: 2, carbs: 8.5, fat: 14.7, icon: "🥑", category: "Breakfast" },
  { id: "4", name: "Greek Yogurt", serving: "200g", servingGrams: 200, calories: 146, protein: 20, carbs: 8, fat: 3.8, icon: "🥛", category: "Breakfast" },
  { id: "5", name: "Banana", serving: "120g", servingGrams: 120, calories: 107, protein: 1.3, carbs: 27, fat: 0.4, icon: "🍌", category: "Snacks" },
  { id: "6", name: "Oatmeal with Honey", serving: "100g", servingGrams: 100, calories: 340, protein: 11, carbs: 65, fat: 5, icon: "🥣", category: "Breakfast" },
  { id: "7", name: "Peanut Butter", serving: "32g", servingGrams: 32, calories: 188, protein: 8, carbs: 6, fat: 16, icon: "🥜", category: "Snacks" },
  { id: "8", name: "Salmon", serving: "150g", servingGrams: 150, calories: 280, protein: 25, carbs: 0, fat: 18, icon: "🐟", category: "Dinner" },
];

const FOOD_CACHE_KEY = "@aceky_food_database";
const FOOD_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry {
  data: FoodReference[];
  cachedAt: number;
}

class FoodService {
  private cached: FoodReference[] | null = null;
  private cachedAt: number = 0;

  async searchFoods(query: string, category?: string): Promise<FoodReference[]> {
    const all = await this.getAllFoods();
    let results = all;
    if (category) {
      results = results.filter((f) => f.category === category);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      results = results.filter((f) => f.name.toLowerCase().includes(q));
    }
    return results;
  }

  async getCategories(): Promise<string[]> {
    const all = await this.getAllFoods();
    const cats = new Set(all.map((f) => f.category));
    return ["All", ...cats];
  }

  async getAllFoods(): Promise<FoodReference[]> {
    if (this.cached && Date.now() - this.cachedAt < FOOD_CACHE_TTL_MS) {
      return this.cached;
    }

    const cached = await storageService.get<CacheEntry>(FOOD_CACHE_KEY);
    if (cached && Date.now() - cached.cachedAt < FOOD_CACHE_TTL_MS) {
      this.cached = cached.data;
      this.cachedAt = cached.cachedAt;
      return cached.data;
    }

    try {
      const response = await apiService.get<FoodReference[]>("/foods/database");
      if (response.success && response.data && response.data.length > 0) {
        this.cached = response.data;
        this.cachedAt = Date.now();
        await storageService.set(FOOD_CACHE_KEY, { data: response.data, cachedAt: Date.now() });
        return response.data;
      }
    } catch (error) {
      if (__DEV__) console.warn("[FoodService] Failed to fetch food database, using fallback:", error);
    }

    this.cached = FALLBACK_FOODS;
    this.cachedAt = Date.now();
    return FALLBACK_FOODS;
  }

  clearCache(): void {
    this.cached = null;
  }
}

export const foodService = new FoodService();
