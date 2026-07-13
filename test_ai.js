const fs = require('fs');
const path = require('path');

// Load environment variables from .env manually
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('.env file not found');
    return;
  }
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const match = line.match(/^\s*EXPO_PUBLIC_([A-Z_]+)\s*=\s*["']?(.*?)["']?\s*$/);
    if (match) {
      const key = `EXPO_PUBLIC_${match[1]}`;
      const val = match[2];
      process.env[key] = val;
    }
  }
}

loadEnv();

const OPENCODE_API_KEY = (process.env.EXPO_PUBLIC_OPENCODE_API_KEY || "").replace(/^["']|["']$/g, "");
const OPENCODE_BASE_URL = "https://opencode.ai/zen/v1/chat/completions";

console.log("API Key loaded (length):", OPENCODE_API_KEY.length);

const TEXT_MODELS = [
  "big-pickle",
  "deepseek-v4-flash-free",
  "north-mini-code-free",
  "nemotron-3-ultra-free",
];
const IMAGE_MODEL = "mimo-v2.5-free";

// Simple test for text-based food search
async function testSearchFood(query) {
  console.log(`\n--- Testing Food Search: "${query}" ---`);
  for (const model of TEXT_MODELS) {
    try {
      console.log(`Trying model: ${model}...`);
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

      console.log(`Status for ${model}:`, response.status);
      if (!response.ok) {
        console.error(`Error details:`, await response.text());
        continue;
      }
      const data = await response.json();
      console.log(`Result:`, JSON.stringify(data, null, 2));
      return; // Stop at the first working model
    } catch (err) {
      console.error(`Model ${model} failed:`, err);
    }
  }
}

// Simple test for image analysis
async function testImageAnalysis() {
  console.log(`\n--- Testing Image Analysis with model: ${IMAGE_MODEL} ---`);
  // Use a small 1x1 black pixel GIF base64 representation
  const dummyBase64 = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

  // Structure 1: The current structure in ai.ts (Anthropic source/data format)
  console.log("\nAttempting Structure 1 (Anthropic source/data structure):");
  try {
    const payload = {
      model: IMAGE_MODEL,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: 'Analyze this food image and provide the nutritional information. Return ONLY a valid JSON object with exactly this structure: {"foods": [{"name": "string", "servingSize": "string", "calories": 0, "proteinG": 0, "carbsG": 0, "fatG": 0, "confidence": 0}], "totalCalories": 0}.',
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: dummyBase64,
              },
            },
          ],
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

    console.log("Status:", response.status);
    const text = await response.text();
    console.log("Response text:", text);
  } catch (err) {
    console.error("Structure 1 failed:", err);
  }

  // Structure 2: OpenAI structure (image_url)
  console.log("\nAttempting Structure 2 (OpenAI image_url structure):");
  try {
    const payload = {
      model: IMAGE_MODEL,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: 'Analyze this food image and provide the nutritional information. Return ONLY a valid JSON object with exactly this structure: {"foods": [{"name": "string", "servingSize": "string", "calories": 0, "proteinG": 0, "carbsG": 0, "fatG": 0, "confidence": 0}], "totalCalories": 0}.',
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${dummyBase64}`
              }
            },
          ],
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

    console.log("Status:", response.status);
    const text = await response.text();
    console.log("Response text:", text);
  } catch (err) {
    console.error("Structure 2 failed:", err);
  }
}

async function run() {
  await testSearchFood("apple");
  await testImageAnalysis();
}

run();
