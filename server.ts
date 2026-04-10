import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health-check", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Health Calculation Endpoint
  app.post("/api/calculate-metrics", (req, res) => {
    const { age, gender, weight, height, activityLevel } = req.body;

    if (!age || !gender || !weight || !height || !activityLevel) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // BMI
    const bmi = weight / Math.pow(height / 100, 2);
    let bmiCategory = "";
    if (bmi < 18.5) bmiCategory = "Underweight";
    else if (bmi < 25) bmiCategory = "Normal weight";
    else if (bmi < 30) bmiCategory = "Overweight";
    else bmiCategory = "Obese";

    // BMR (Mifflin-St Jeor)
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    if (gender === "male") bmr += 5;
    else bmr -= 161;

    // TDEE
    const activityFactors: Record<string, number> = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extra_active: 1.9,
    };
    const tdee = bmr * (activityFactors[activityLevel] || 1.2);

    res.json({
      bmi: parseFloat(bmi.toFixed(1)),
      bmiCategory,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      macros: {
        protein: Math.round((tdee * 0.25) / 4), // 25% protein
        carbs: Math.round((tdee * 0.45) / 4),   // 45% carbs
        fats: Math.round((tdee * 0.3) / 9),     // 30% fats
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
