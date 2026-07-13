import { Config } from "@/constants/Config";
import { ScanResult, FoodItem } from "@/types/meal";

export interface AIRecognitionResult {
  foods: {
    name: string;
    servingSize: string;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    confidence: number;
  }[];
  totalCalories: number;
}

export class AIService {
  private baseUrl: string;
  private model: string;

  constructor() {
    this.baseUrl = Config.api.baseUrl;
    this.model = Config.ai.model;
  }

  async analyzeFoodImage(imageUri: string): Promise<ScanResult> {
    const formData = new FormData();
    formData.append("image", {
      uri: imageUri,
      type: "image/jpeg",
      name: "food.jpg",
    } as unknown as Blob);
    formData.append("model", this.model);

    try {
      const response = await fetch(`${this.baseUrl}/ai/analyze`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.ok) {
        throw new Error(`AI analysis failed: ${response.status}`);
      }

      const result: AIRecognitionResult = await response.json();

      return {
        foods: result.foods.map((food, index) => ({
          id: `ai-${Date.now()}-${index}`,
          name: food.name,
          servingSize: food.servingSize,
          calories: food.calories,
          proteinG: food.proteinG,
          carbsG: food.carbsG,
          fatG: food.fatG,
        })),
        totalCalories: result.totalCalories,
        confidence: result.foods.reduce(
          (avg, f) => avg + f.confidence / result.foods.length,
          0
        ),
      };
    } catch (error) {
      console.error("AI analysis error:", error);
      throw error;
    }
  }

  async searchFood(query: string): Promise<FoodItem[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/foods/search?q=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Food search failed: ${response.status}`);
      }

      const foods: FoodItem[] = await response.json();
      return foods;
    } catch (error) {
      console.error("Food search error:", error);
      throw error;
    }
  }

  async getNutritionInfo(foodName: string, servingSize?: string): Promise<FoodItem | null> {
    try {
      const params = new URLSearchParams({ food: foodName });
      if (servingSize) params.append("serving", servingSize);

      const response = await fetch(
        `${this.baseUrl}/ai/nutrition?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Nutrition lookup failed: ${response.status}`);
      }

      const food: FoodItem = await response.json();
      return food;
    } catch (error) {
      console.error("Nutrition lookup error:", error);
      return null;
    }
  }
}

export const aiService = new AIService();
