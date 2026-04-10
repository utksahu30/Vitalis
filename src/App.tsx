import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Activity, 
  Apple, 
  ChevronRight, 
  ClipboardList, 
  Flame, 
  Heart, 
  Info, 
  LayoutDashboard, 
  Plus, 
  Scale, 
  Settings, 
  Utensils, 
  Zap,
  AlertTriangle,
  RefreshCw,
  CheckCircle2
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { healthAssistant } from "./services/geminiService";

// --- Types ---
interface UserProfile {
  age: number;
  gender: "male" | "female";
  weight: number;
  height: number;
  activityLevel: string;
  goal: string;
  allergens: string;
}

interface HealthMetrics {
  bmi: number;
  bmiCategory: string;
  bmr: number;
  tdee: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

// --- Components ---

const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string; [key: string]: any }) => (
  <div className={`backdrop-blur-xl bg-white/40 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl overflow-hidden ${className}`}>
    {children}
  </div>
);

const BrutalButton = ({ children, onClick, className = "", variant = "primary", disabled = false }: { children: React.ReactNode; onClick?: () => void; className?: string; variant?: "primary" | "secondary" | "accent"; disabled?: boolean }) => {
  const variants = {
    primary: "bg-orange-400 hover:bg-orange-500 text-black",
    secondary: "bg-green-400 hover:bg-green-500 text-black",
    accent: "bg-blue-400 hover:bg-blue-500 text-black",
  };
  
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-2 font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all rounded-lg disabled:opacity-50 disabled:shadow-none disabled:translate-x-[2px] disabled:translate-y-[2px] ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default function App() {
  const [profile, setProfile] = useState<UserProfile>({
    age: 28,
    gender: "male",
    weight: 75,
    height: 180,
    activityLevel: "moderately_active",
    goal: "Maintain weight",
    allergens: "",
  });

  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Calculate metrics on mount or profile change
  useEffect(() => {
    calculateMetrics();
    fetchChallenges();
  }, []);

  const calculateMetrics = async () => {
    try {
      const res = await fetch("/api/calculate-metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      console.error("Failed to calculate metrics", err);
    }
  };

  const fetchChallenges = async () => {
    try {
      const data = await healthAssistant.getMicroChallenges();
      setChallenges(data.challenges);
    } catch (err) {
      console.error("Failed to fetch challenges", err);
    }
  };

  const generateMealPlan = async () => {
    if (!metrics) return;
    setLoading(true);
    try {
      const data = await healthAssistant.generateMealPlan({ ...profile, tdee: metrics.tdee });
      setMealPlan(data);
      setActiveTab("meals");
    } catch (err) {
      console.error("Failed to generate meal plan", err);
    } finally {
      setLoading(false);
    }
  };

  const macroData = useMemo(() => {
    if (!metrics) return [];
    return [
      { name: "Protein", value: metrics.macros.protein * 4, color: "#fb923c" },
      { name: "Carbs", value: metrics.macros.carbs * 4, color: "#4ade80" },
      { name: "Fats", value: metrics.macros.fats * 9, color: "#60a5fa" },
    ];
  }, [metrics]);

  return (
    <div className="min-h-screen bg-[#fff7ed] text-black font-sans selection:bg-orange-200">
      {/* Background Accents */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-200/50 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-200/50 rounded-full blur-[120px] -z-10" />

      <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
        {/* Sidebar - Demographic Profiling */}
        <aside className="w-full lg:w-80 bg-white/60 backdrop-blur-md border-r-2 border-black p-6 overflow-y-auto z-20">
          <div className="flex items-center gap-2 mb-8">
            <div className="p-2 bg-orange-400 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Activity className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter">VITALIS AI</h1>
          </div>

          <div className="space-y-6">
            <section>
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">Your Profile</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase">Age</Label>
                    <Input 
                      type="number" 
                      value={profile.age} 
                      onChange={(e) => setProfile({...profile, age: parseInt(e.target.value)})}
                      className="border-2 border-black focus-visible:ring-0 focus-visible:border-orange-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase">Gender</Label>
                    <Select value={profile.gender} onValueChange={(v: any) => setProfile({...profile, gender: v})}>
                      <SelectTrigger className="border-2 border-black">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase">Weight (kg)</Label>
                    <Input 
                      type="number" 
                      value={profile.weight} 
                      onChange={(e) => setProfile({...profile, weight: parseInt(e.target.value)})}
                      className="border-2 border-black"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase">Height (cm)</Label>
                    <Input 
                      type="number" 
                      value={profile.height} 
                      onChange={(e) => setProfile({...profile, height: parseInt(e.target.value)})}
                      className="border-2 border-black"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase">Activity Level</Label>
                  <Select value={profile.activityLevel} onValueChange={(v) => setProfile({...profile, activityLevel: v})}>
                    <SelectTrigger className="border-2 border-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary</SelectItem>
                      <SelectItem value="lightly_active">Lightly Active</SelectItem>
                      <SelectItem value="moderately_active">Moderately Active</SelectItem>
                      <SelectItem value="very_active">Very Active</SelectItem>
                      <SelectItem value="extra_active">Extra Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase">Goal</Label>
                  <Input 
                    value={profile.goal} 
                    onChange={(e) => setProfile({...profile, goal: e.target.value})}
                    placeholder="e.g. Lose 5kg in 2 months"
                    className="border-2 border-black"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase">Allergens</Label>
                  <Input 
                    value={profile.allergens} 
                    onChange={(e) => setProfile({...profile, allergens: e.target.value})}
                    placeholder="e.g. Peanuts, Dairy"
                    className="border-2 border-black"
                  />
                </div>

                <BrutalButton onClick={calculateMetrics} className="w-full mt-4">
                  Update Metrics
                </BrutalButton>
              </div>
            </section>

            <Separator className="bg-black/10" />

            <section className="bg-orange-50 p-4 border-2 border-black rounded-xl border-dashed">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600 mt-1 flex-shrink-0" />
                <p className="text-[10px] font-medium leading-tight text-orange-800">
                  MEDICAL DISCLAIMER: This AI is for informational purposes only. Consult a healthcare professional before starting any new diet or exercise program.
                </p>
              </div>
            </section>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Top Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-4xl font-black tracking-tight">Hello, Vitalis User!</h2>
                <p className="text-gray-600 font-medium">Your personalized health journey starts here.</p>
              </div>
              <div className="flex gap-3">
                <BrutalButton variant="secondary" onClick={generateMealPlan} className="flex items-center gap-2" disabled={loading}>
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ClipboardList className="w-4 h-4" />}
                  Generate Meal Plan
                </BrutalButton>
              </div>
            </div>

            {/* Tabs Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-transparent h-auto p-0 gap-4 flex-wrap">
                <TabsTrigger 
                  value="dashboard" 
                  className="data-[state=active]:bg-black data-[state=active]:text-white border-2 border-black px-6 py-2 rounded-lg font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  Dashboard
                </TabsTrigger>
                <TabsTrigger 
                  value="meals" 
                  className="data-[state=active]:bg-black data-[state=active]:text-white border-2 border-black px-6 py-2 rounded-lg font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  Meal Plan
                </TabsTrigger>
                <TabsTrigger 
                  value="macros" 
                  className="data-[state=active]:bg-black data-[state=active]:text-white border-2 border-black px-6 py-2 rounded-lg font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  Macro Estimator
                </TabsTrigger>
                <TabsTrigger 
                  value="pantry" 
                  className="data-[state=active]:bg-black data-[state=active]:text-white border-2 border-black px-6 py-2 rounded-lg font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  Pantry Optimizer
                </TabsTrigger>
              </TabsList>

              <div className="mt-8">
                <TabsContent value="dashboard" className="space-y-8 outline-none">
                  {/* Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <GlassCard className="p-6 bg-orange-100/40">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-orange-400 border-2 border-black rounded-lg">
                          <Scale className="w-5 h-5" />
                        </div>
                        <Badge className="bg-black text-white border-none">{metrics?.bmiCategory}</Badge>
                      </div>
                      <p className="text-sm font-bold uppercase text-gray-500">Body Mass Index</p>
                      <h3 className="text-4xl font-black">{metrics?.bmi}</h3>
                      <p className="text-xs mt-2 text-gray-600">Healthy range: 18.5 - 24.9</p>
                    </GlassCard>

                    <GlassCard className="p-6 bg-green-100/40">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-green-400 border-2 border-black rounded-lg">
                          <Zap className="w-5 h-5" />
                        </div>
                      </div>
                      <p className="text-sm font-bold uppercase text-gray-500">BMR (Basal Rate)</p>
                      <h3 className="text-4xl font-black">{metrics?.bmr} <span className="text-lg">kcal</span></h3>
                      <p className="text-xs mt-2 text-gray-600">Calories burned at rest</p>
                    </GlassCard>

                    <GlassCard className="p-6 bg-blue-100/40">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-400 border-2 border-black rounded-lg">
                          <Flame className="w-5 h-5" />
                        </div>
                      </div>
                      <p className="text-sm font-bold uppercase text-gray-500">TDEE (Daily Total)</p>
                      <h3 className="text-4xl font-black">{metrics?.tdee} <span className="text-lg">kcal</span></h3>
                      <p className="text-xs mt-2 text-gray-600">Adjusted for {profile.activityLevel.replace("_", " ")}</p>
                    </GlassCard>
                  </div>

                  {/* Charts Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <GlassCard className="p-6">
                      <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                        <Utensils className="w-5 h-5" /> Macronutrient Split
                      </h3>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={macroData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {macroData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="#000" strokeWidth={2} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#fff', 
                                border: '2px solid #000', 
                                borderRadius: '8px',
                                fontWeight: 'bold'
                              }} 
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex justify-center gap-6 mt-4">
                        {macroData.map((m) => (
                          <div key={m.name} className="flex items-center gap-2">
                            <div className="w-3 h-3 border border-black" style={{ backgroundColor: m.color }} />
                            <span className="text-xs font-bold uppercase">{m.name}</span>
                          </div>
                        ))}
                      </div>
                    </GlassCard>

                    <div className="space-y-6">
                      <h3 className="text-xl font-black flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-500" /> Daily Micro-Challenges
                      </h3>
                      <div className="space-y-4">
                        {challenges.map((c, i) => (
                          <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            <GlassCard className="p-4 bg-white/80 flex gap-4 items-center">
                              <div className="w-10 h-10 rounded-full bg-orange-100 border-2 border-black flex items-center justify-center flex-shrink-0">
                                <CheckCircle2 className="w-5 h-5 text-orange-600" />
                              </div>
                              <div>
                                <h4 className="font-bold">{c.title}</h4>
                                <p className="text-xs text-gray-600">{c.description}</p>
                                <p className="text-[10px] font-bold text-green-600 mt-1 uppercase">Benefit: {c.benefit}</p>
                              </div>
                            </GlassCard>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="meals" className="outline-none">
                  {mealPlan ? (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mealPlan.days.map((day: any) => (
                          <GlassCard key={day.day} className="p-0">
                            <div className="bg-black text-white p-3 font-black text-center uppercase tracking-widest">
                              Day {day.day}
                            </div>
                            <div className="p-4 space-y-4">
                              {day.meals.map((meal: any, idx: number) => (
                                <div key={idx} className="space-y-1">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase text-orange-500">{meal.type}</span>
                                    <span className="text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded border border-black/10">{meal.calories} kcal</span>
                                  </div>
                                  <p className="font-bold text-sm">{meal.name}</p>
                                  <div className="flex gap-2 text-[9px] font-medium text-gray-500">
                                    <span>P: {meal.macros.p}g</span>
                                    <span>C: {meal.macros.c}g</span>
                                    <span>F: {meal.macros.f}g</span>
                                  </div>
                                  {idx < day.meals.length - 1 && <Separator className="mt-2" />}
                                </div>
                              ))}
                            </div>
                          </GlassCard>
                        ))}
                      </div>
                      <GlassCard className="p-6 bg-blue-50">
                        <h3 className="font-black text-xl mb-4">Nutritionist Tips</h3>
                        <ul className="space-y-2">
                          {mealPlan.tips.map((tip: string, i: number) => (
                            <li key={i} className="flex gap-2 items-start text-sm font-medium">
                              <div className="w-5 h-5 rounded-full bg-blue-400 border-2 border-black flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
                                {i + 1}
                              </div>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </GlassCard>
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <div className="inline-block p-6 bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl">
                        <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-black mb-2">No Meal Plan Yet</h3>
                        <p className="text-gray-500 mb-6">Click the button above to generate your personalized 7-day plan.</p>
                        <BrutalButton onClick={generateMealPlan} disabled={loading}>
                          {loading ? "Generating..." : "Generate Now"}
                        </BrutalButton>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="macros" className="outline-none">
                  <MacroEstimator />
                </TabsContent>

                <TabsContent value="pantry" className="outline-none">
                  <PantryOptimizer />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}

function MacroEstimator() {
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!description) return;
    setLoading(true);
    try {
      const data = await healthAssistant.analyzeMeal(description);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <GlassCard className="p-8">
        <h3 className="text-2xl font-black mb-4">Macro Estimator</h3>
        <p className="text-gray-600 mb-6">Describe your meal in plain text (e.g., "A bowl of oatmeal with blueberries and a scoop of whey protein").</p>
        <div className="space-y-4">
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-32 p-4 border-2 border-black rounded-xl focus:ring-0 focus:border-orange-400 font-medium"
            placeholder="Describe your meal..."
          />
          <BrutalButton onClick={analyze} className="w-full" disabled={loading}>
            {loading ? "Analyzing..." : "Analyze Meal"}
          </BrutalButton>
        </div>
      </GlassCard>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-8 bg-white">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center p-4 bg-orange-50 border-2 border-black rounded-xl">
                <p className="text-[10px] font-black uppercase text-gray-500">Calories</p>
                <p className="text-2xl font-black">{result.calories}</p>
              </div>
              <div className="text-center p-4 bg-green-50 border-2 border-black rounded-xl">
                <p className="text-[10px] font-black uppercase text-gray-500">Protein</p>
                <p className="text-2xl font-black">{result.protein}g</p>
              </div>
              <div className="text-center p-4 bg-blue-50 border-2 border-black rounded-xl">
                <p className="text-[10px] font-black uppercase text-gray-500">Carbs</p>
                <p className="text-2xl font-black">{result.carbs}g</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 border-2 border-black rounded-xl">
                <p className="text-[10px] font-black uppercase text-gray-500">Fats</p>
                <p className="text-2xl font-black">{result.fats}g</p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-2 border-black border-dashed rounded-xl">
              <h4 className="font-black text-sm uppercase mb-2">AI Insight</h4>
              <p className="text-sm text-gray-700 font-medium">{result.insight}</p>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}

function PantryOptimizer() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addIngredient = () => {
    if (input && !ingredients.includes(input)) {
      setIngredients([...ingredients, input]);
      setInput("");
    }
  };

  const getRecipes = async () => {
    if (ingredients.length === 0) return;
    setLoading(true);
    try {
      const data = await healthAssistant.getPantrySuggestions(ingredients);
      setRecipes(data.recipes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <GlassCard className="p-6">
          <h3 className="text-xl font-black mb-4">Your Pantry</h3>
          <div className="flex gap-2 mb-4">
            <Input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === "Enter" && addIngredient()}
              placeholder="Add ingredient..."
              className="border-2 border-black"
            />
            <Button onClick={addIngredient} className="bg-black text-white hover:bg-gray-800">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {ingredients.map((ing) => (
              <Badge key={ing} variant="outline" className="border-2 border-black bg-white px-3 py-1 font-bold">
                {ing}
                <button onClick={() => setIngredients(ingredients.filter(i => i !== ing))} className="ml-2 hover:text-red-500">×</button>
              </Badge>
            ))}
          </div>
          <BrutalButton 
            variant="accent" 
            onClick={getRecipes} 
            className="w-full mt-6"
            disabled={ingredients.length === 0 || loading}
          >
            {loading ? "Finding Recipes..." : "Find Recipes"}
          </BrutalButton>
        </GlassCard>
      </div>

      <div className="lg:col-span-2 space-y-6">
        {recipes.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {recipes.map((recipe, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-2xl font-black">{recipe.name}</h4>
                    <Badge className="bg-green-400 text-black border-2 border-black">{recipe.calories} kcal</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {recipe.usedIngredients.map((ing: string) => (
                      <span key={ing} className="text-[10px] font-bold uppercase bg-orange-100 px-2 py-1 rounded border border-black/10">{ing}</span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{recipe.instructions}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center border-4 border-dashed border-black/10 rounded-3xl">
            <div className="text-center p-8">
              <Apple className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-400 font-bold">Add ingredients to see magic recipes</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
