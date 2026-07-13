import { FoodItem, ScanResult } from "@/types/meal";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

export interface AIRecognitionResult {
  mealName: string;
  foods: {
    name: string;
    servingSize: string;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG?: number;
    sugarG?: number;
    confidence: number;
    suggestions: {
      name: string;
      reason: string;
      calories: number;
      proteinG: number;
      carbsG: number;
      fatG: number;
    }[];
  }[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

// Strip leading/trailing quotes if they are present in the env file
const OPENCODE_API_KEY = (
  process.env.EXPO_PUBLIC_OPENCODE_API_KEY || ""
).replace(/^["']|["']$/g, "");
const OPENCODE_BASE_URL = "https://opencode.ai/zen/v1/chat/completions";

const TEXT_MODELS = [
  "big-pickle",
  "deepseek-v4-flash-free",
  "north-mini-code-free",
  "nemotron-3-ultra-free",
];
const IMAGE_MODEL = "mimo-v2.5-free";

function parseJSONOutput<T>(content: string): T {
  let cleaned = content.trim();
  
  // Strip markdown code blocks if present (e.g. ```json ... ```)
  if (cleaned.includes("```")) {
    const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
    const match = cleaned.match(jsonBlockRegex);
    if (match && match[1]) {
      cleaned = match[1].trim();
    }
  }

  // Extract the JSON object boundaries to ignore conversational garbage
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    let braceCount = 0;
    let endBrace = -1;
    for (let i = firstBrace; i < cleaned.length; i++) {
      if (cleaned[i] === '{') braceCount++;
      else if (cleaned[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          endBrace = i;
          break;
        }
      }
    }
    if (endBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, endBrace + 1);
    }
  } else if (firstBracket !== -1) {
    let bracketCount = 0;
    let endBracket = -1;
    for (let i = firstBracket; i < cleaned.length; i++) {
      if (cleaned[i] === '[') bracketCount++;
      else if (cleaned[i] === ']') {
        bracketCount--;
        if (bracketCount === 0) {
          endBracket = i;
          break;
        }
      }
    }
    if (endBracket !== -1) {
      cleaned = cleaned.substring(firstBracket, endBracket + 1);
    }
  }

  return JSON.parse(cleaned);
}

export class AIService {
  private async convertImageToBase64(uri: string): Promise<string> {
    try {
      const decodedUri = decodeURIComponent(uri);
      if (__DEV__) {
        console.log("[AIService] Resizing image for upload:", decodedUri);
      }
      
      const manipulatedResult = await manipulateAsync(
        decodedUri,
        [{ resize: { width: 600 } }],
        { compress: 0.5, format: SaveFormat.JPEG }
      );
      
      if (__DEV__) {
        console.log("[AIService] Reading image with fetch:", manipulatedResult.uri);
      }
      const response = await fetch(manipulatedResult.uri);
      const blob = await response.blob();
      
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          const b64 = dataUrl.split(',')[1];
          resolve(b64);
        };
        reader.onerror = (e) => {
          console.error("[AIService] FileReader error:", e);
          reject(new Error("FileReader failed"));
        };
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error(
        "[AIService] Failed to read and resize image with fetch.",
        e,
      );
      throw new Error("Unable to read local image.");
    }
  }

  async analyzeFoodImage(imageUri: string): Promise<ScanResult> {
    let base64 = "";
    try {
      base64 = await this.convertImageToBase64(imageUri);
    } catch (e) {
      console.error("[AIService] Image reading failed:", e);
      throw e;
    }

    const models = [IMAGE_MODEL, "hy3-free", ...TEXT_MODELS];
    const combinations = [];

    for (const model of models) {
      combinations.push(
        {
          modelName: model,
          formatName: "OpenAI image_url",
          payload: {
            model: model,
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `You are a professional nutritionist AI. Analyze this food image and return ONLY valid JSON with accurate nutritional data based on standard USDA and FDA nutritional databases. Include healthier alternatives for each food item.

Rules:
- Use standard serving sizes (e.g., "100g", "1 cup (240ml)", "1 medium (120g)")
- Provide accurate calorie and macro estimates based on visual portion size
- Confidence: 0-100 based on how clearly visible the food is
- For each food, suggest 1-2 healthier alternatives with nutritional comparison
- Name the overall meal (e.g., "Grilled Chicken Bowl")

Return ONLY this exact JSON structure with no markdown, no extra text:
{"mealName": "string", "foods": [{"name": "string", "servingSize": "string", "calories": 0, "proteinG": 0, "carbsG": 0, "fatG": 0, "fiberG": 0, "sugarG": 0, "confidence": 0, "suggestions": [{"name": "string", "reason": "string", "calories": 0, "proteinG": 0, "carbsG": 0, "fatG": 0}]}], "totalCalories": 0, "totalProtein": 0, "totalCarbs": 0, "totalFat": 0}`,
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:image/jpeg;base64,${base64}`,
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          modelName: model,
          formatName: "Anthropic image source",
          payload: {
            model: model,
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `You are a professional nutritionist AI. Analyze this food image and return ONLY valid JSON with accurate nutritional data based on standard USDA and FDA nutritional databases. Include healthier alternatives for each food item.

Rules:
- Use standard serving sizes (e.g., "100g", "1 cup (240ml)", "1 medium (120g)")
- Provide accurate calorie and macro estimates based on visual portion size
- Confidence: 0-100 based on how clearly visible the food is
- For each food, suggest 1-2 healthier alternatives with nutritional comparison
- Name the overall meal (e.g., "Grilled Chicken Bowl")

Return ONLY this exact JSON structure with no markdown, no extra text:
{"mealName": "string", "foods": [{"name": "string", "servingSize": "string", "calories": 0, "proteinG": 0, "carbsG": 0, "fatG": 0, "fiberG": 0, "sugarG": 0, "confidence": 0, "suggestions": [{"name": "string", "reason": "string", "calories": 0, "proteinG": 0, "carbsG": 0, "fatG": 0}]}], "totalCalories": 0, "totalProtein": 0, "totalCarbs": 0, "totalFat": 0}`,
                  },
                  {
                    type: "image",
                    source: {
                      type: "base64",
                      media_type: "image/jpeg",
                      data: base64,
                    },
                  },
                ],
              },
            ],
          },
        }
      );
    }

    let lastError: any = null;

    for (const combo of combinations) {
      let attempts = 3;
      let delay = 1000;
      while (attempts > 0) {
        try {
          if (__DEV__) {
            console.log(
              `[AIService] Requesting scan via model: ${combo.modelName} (${combo.formatName} format)...`,
            );
          }

          const response = await fetch(OPENCODE_BASE_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${OPENCODE_API_KEY}`,
            },
            body: JSON.stringify(combo.payload),
          });

          if (__DEV__) {
            console.log(`[AIService] ${combo.modelName} response status:`, response.status);
          }

          if (!response.ok) {
            const errText = await response.text();
            if (response.status >= 500) {
              if (__DEV__) {
                console.log(`[AIService] Server error (${response.status}) for ${combo.modelName}, retrying...`);
              }
              throw new Error(`Server error: ${response.status}`);
            }
            console.error(`[AIService] API Error response for ${combo.modelName}:`, errText);
            throw new Error(`AI analysis failed: ${response.status} ${errText}`);
          }

          const data = await response.json();
          const content = data.choices[0].message.content;

          const result: AIRecognitionResult =
            parseJSONOutput<AIRecognitionResult>(content);

          return {
            foods: result.foods.map((food, index) => ({
              id: `ai-${Date.now()}-${index}`,
              name: food.name,
              servingSize: food.servingSize,
              calories: food.calories,
              proteinG: food.proteinG,
              carbsG: food.carbsG,
              fatG: food.fatG,
              fiberG: food.fiberG ?? 0,
              sugarG: food.sugarG ?? 0,
            })),
            totalCalories: result.totalCalories,
            confidence: result.foods.reduce(
              (avg, f) => avg + (f.confidence || 0) / (result.foods.length || 1),
              0,
            ),
          };
        } catch (error) {
          console.error(`[AIService] Error in analyzeFoodImage with model ${combo.modelName} (${combo.formatName}):`, error);
          lastError = error;
          attempts--;
          if (attempts > 0) {
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= 2;
          }
        }
      }
    }

    throw lastError || new Error("Failed to analyze image after trying all models and formats");
  }

  async searchFood(query: string): Promise<FoodItem[]> {
    const modelsToTry = [...TEXT_MODELS];
    let lastError: any = null;

    while (modelsToTry.length > 0) {
      // Pick a random model and remove it from the list
      const modelIndex = Math.floor(Math.random() * modelsToTry.length);
      const model = modelsToTry.splice(modelIndex, 1)[0];

      try {
        if (__DEV__) {
          console.log(
            `[AIService] searchFood query: "${query}" trying model: ${model}`,
          );
        }

        const payload = {
          model,
          messages: [
            {
              role: "user",
              content:
                'You are a nutrition database API. Return ONLY a valid JSON object with an \'items\' array of food objects matching the query. Each item must have exactly this structure: {"id": "string", "name": "string", "servingSize": "string", "calories": 0, "proteinG": 0, "carbsG": 0, "fatG": 0}. Return at least 5 relevant items if possible. Do not wrap in markdown blocks, just raw JSON.\n\nSearch query: ' +
                query,
            },
          ],
        };

        const response = await fetch(OPENCODE_BASE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENCODE_API_KEY}`,
          },
          body: JSON.stringify(payload),
        });

        if (__DEV__) {
          console.log(
            `[AIService] Response Status for ${model}:`,
            response.status,
          );
        }

        if (!response.ok) {
          const errText = await response.text();
          console.error(
            `[AIService] API Error response for ${model}:`,
            errText,
          );
          throw new Error(`Food search failed: ${response.status} ${errText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        if (__DEV__) {
          console.log("[AIService] Raw Content:", content);
        }

        const parsed = parseJSONOutput<{ items: FoodItem[] }>(content);
        return parsed.items || [];
      } catch (error) {
        console.error(`[AIService] Error in searchFood with ${model}:`, error);
        lastError = error;
        // Proceed to the next model in the loop
      }
    }
    throw lastError || new Error("All text models failed for food search");
  }

  async getNutritionInfo(
    foodName: string,
    servingSize?: string,
  ): Promise<FoodItem | null> {
    const modelsToTry = [...TEXT_MODELS];
    let lastError: any = null;

    while (modelsToTry.length > 0) {
      const modelIndex = Math.floor(Math.random() * modelsToTry.length);
      const model = modelsToTry.splice(modelIndex, 1)[0];

      try {
        if (__DEV__) {
          console.log(
            `[AIService] getNutritionInfo: "${foodName}" (${servingSize || "standard"}) trying model: ${model}`,
          );
        }

        const payload = {
          model,
          messages: [
            {
              role: "user",
              content:
                'You are a nutrition database. Return ONLY a valid JSON object representing the nutritional information for the requested food. Structure exactly: {"id": "string", "name": "string", "servingSize": "string", "calories": 0, "proteinG": 0, "carbsG": 0, "fatG": 0}. Do not wrap in markdown blocks.\n\nFood: ' +
                foodName +
                (servingSize ? `, Serving size: ${servingSize}` : ""),
            },
          ],
        };

        const response = await fetch(OPENCODE_BASE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENCODE_API_KEY}`,
          },
          body: JSON.stringify(payload),
        });

        if (__DEV__) {
          console.log(
            `[AIService] Response Status for ${model}:`,
            response.status,
          );
        }

        if (!response.ok) {
          const errText = await response.text();
          console.error(
            `[AIService] API Error response for ${model}:`,
            errText,
          );
          throw new Error(
            `Nutrition lookup failed: ${response.status} ${errText}`,
          );
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        if (__DEV__) {
          console.log("[AIService] Raw Content:", content);
        }

        const parsed: FoodItem = parseJSONOutput<FoodItem>(content);
        return parsed;
      } catch (error) {
        console.error(
          `[AIService] Error in getNutritionInfo with ${model}:`,
          error,
        );
        lastError = error;
      }
    }
    return null;
  }
}

export const aiService = new AIService();
