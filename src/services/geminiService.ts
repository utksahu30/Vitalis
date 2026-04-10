import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const healthAssistant = {
  async generateMealPlan(profile: any) {
    const prompt = `
      You are a Senior Nutritionist and Health Coach. Generate a structured 7-day meal plan for a user with the following profile:
      - Age: ${profile.age}
      - Gender: ${profile.gender}
      - Weight: ${profile.weight}kg
      - Height: ${profile.height}cm
      - Activity Level: ${profile.activityLevel}
      - Goal: ${profile.goal}
      - Allergens/Restrictions: ${profile.allergens || "None"}
      - TDEE: ${profile.tdee} kcal

      SAFETY GUIDELINES:
      - If the user's goal or input suggests harmful eating patterns (Eating Disorders), refuse to provide weight-loss advice and provide links to professional resources (e.g., NEDA).
      - If the user asks for medical diagnosis or treatment, provide a hard-coded refusal: "I am an AI assistant and cannot provide medical diagnoses or treatments. Please consult a doctor."
      - Ensure advice is concise, actionable, and empathetic.

      Return the response in JSON format with the following structure:
      {
        "days": [
          {
            "day": 1,
            "meals": [
              { "type": "Breakfast", "name": "...", "calories": 0, "macros": { "p": 0, "c": 0, "f": 0 } },
              ...
            ]
          }
        ],
        "tips": ["..."]
      }
      Ensure the total daily calories match the TDEE and goal (e.g., deficit for weight loss).
      Strictly avoid allergens.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text);
  },

  async analyzeMeal(mealDescription: string) {
    const prompt = `
      Analyze the following meal description and provide estimated macronutrients and calories:
      "${mealDescription}"

      Return JSON:
      {
        "calories": 0,
        "protein": 0,
        "carbs": 0,
        "fats": 0,
        "insight": "..."
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text);
  },

  async getPantrySuggestions(ingredients: string[]) {
    const prompt = `
      Suggest 3 healthy recipes using some or all of these ingredients: ${ingredients.join(", ")}.
      Prioritize ingredients that might expire soon.

      Return JSON:
      {
        "recipes": [
          { "name": "...", "usedIngredients": ["..."], "instructions": "...", "calories": 0 }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text);
  },

  async getMicroChallenges() {
    const prompt = `
      Generate 3 "Micro-Challenges" for today to build healthy habits. 
      Tone: Empathetic, judgment-free, scientifically grounded.
      Example: "Drink a glass of water before your first coffee", "Take a 5-minute stretch break".

      Return JSON:
      {
        "challenges": [
          { "title": "...", "description": "...", "benefit": "..." }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text);
  }
};
