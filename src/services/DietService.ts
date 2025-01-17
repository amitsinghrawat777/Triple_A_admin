import { useProfile } from '../context/ProfileContext';

// Export all necessary interfaces
export interface DietaryAlternative {
  name: string;
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
  servingSize: string;
  changes?: string;
}

export interface Food {
  name: string;
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
  servingSize: string;
  portion: string;
  alternatives?: {
    vegetarian?: DietaryAlternative;
    glutenFree?: DietaryAlternative;
    lactoseFree?: DietaryAlternative;
  };
  category?: string;
  difficulty?: string;
  preparationTime?: string;
  cookingTime?: string;
  imageUrl?: string;
  allergens?: string[];
  instructions?: string[];
  tips?: string[];
}

export interface Meal {
  type: string;
  time: string;
  foods: Food[];
  notes?: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}

export interface DailyMeals {
  day: string;
  meals: Meal[];
}

export interface WeeklyDietPlan {
  title: string;
  description: string;
  level: string;
  duration: string;
  type: string;
  goal: string;
  color: string;
  waterIntake: number;
  supplementation: Supplement[];
  nutritionalGoals: NutritionalGoals;
  weeklyPlan: DailyMeals[];
}

export interface NutritionalGoals {
  calories: number;
  protein: {
    grams: number;
    percentage: number;
  };
  carbs: {
    grams: number;
    percentage: number;
  };
  fats: {
    grams: number;
    percentage: number;
  };
}

export interface Supplement {
  name: string;
  dosage: string;
  timing: string;
  notes: string;
  benefits?: string;
}

const highProteinMealDatabase: Food[] = [
  {
    name: "Chicken Breast with Rice",
    protein: 30,
    carbs: 40,
    fats: 5,
    calories: 325,
    servingSize: "300g",
    portion: "300g",
      category: "High Protein",
    difficulty: "Easy",
      preparationTime: "10 mins",
    cookingTime: "20 mins",
    imageUrl: "https://images.unsplash.com/photo-1532550907401-a500c9a57435",
    allergens: []
  },
  {
    name: "Protein Oatmeal",
    protein: 20,
      carbs: 35,
    fats: 8,
    calories: 290,
    servingSize: "250g",
    portion: "250g",
      category: "High Protein",
    difficulty: "Easy",
    preparationTime: "5 mins",
    cookingTime: "10 mins",
    allergens: ["Dairy"]
  },
  {
    name: "Salmon with Sweet Potato",
          protein: 25,
    carbs: 30,
    fats: 15,
    calories: 355,
    servingSize: "300g",
    portion: "300g",
      category: "High Protein",
    difficulty: "Medium",
    preparationTime: "10 mins",
    cookingTime: "25 mins",
    allergens: ["Fish"]
  }
];

const lowCalorieMealDatabase: Food[] = [
  {
    name: "Grilled Chicken Breast",
    protein: 25,
    carbs: 0,
    fats: 3,
    calories: 165,
    servingSize: "100g",
    portion: "100g",
    category: "Low Calorie",
    difficulty: "Easy",
    preparationTime: "5 mins",
      cookingTime: "15 mins",
      alternatives: {
        vegetarian: {
        name: "Grilled Tofu",
        protein: 20,
        carbs: 2,
        fats: 5,
        calories: 150,
        servingSize: "100g",
        changes: "Replace chicken with firm tofu"
      }
    }
  },
  {
    name: "Mixed Green Salad",
    protein: 2,
    carbs: 5,
    fats: 0,
    calories: 25,
    servingSize: "100g",
    portion: "100g",
    category: "Low Calorie",
    difficulty: "Easy",
    preparationTime: "10 mins",
    cookingTime: "0 mins"
  },
  {
    name: "Quinoa Bowl",
    protein: 4,
    carbs: 21,
    fats: 2,
    calories: 120,
    servingSize: "100g",
    portion: "100g",
    category: "Low Calorie",
    difficulty: "Easy",
    preparationTime: "5 mins",
    cookingTime: "15 mins"
  }
];

const maintenanceMealDatabase: Food[] = [
  {
    name: "Brown Rice Bowl",
    protein: 3,
    carbs: 45,
    fats: 2,
    calories: 215,
    servingSize: "100g",
    portion: "100g",
    category: "Balanced",
    difficulty: "Easy",
    preparationTime: "5 mins",
    cookingTime: "20 mins"
  },
  {
    name: "Sweet Potato Mash",
    protein: 2,
    carbs: 20,
    fats: 0,
    calories: 90,
    servingSize: "100g",
    portion: "100g",
    category: "Balanced",
    difficulty: "Easy",
    preparationTime: "10 mins",
    cookingTime: "15 mins"
  },
  {
    name: "Grilled Salmon",
    protein: 20,
    carbs: 0,
    fats: 13,
    calories: 208,
    servingSize: "100g",
    portion: "100g",
    category: "Balanced",
    difficulty: "Medium",
    preparationTime: "5 mins",
    cookingTime: "15 mins",
    allergens: ["Fish"]
  }
];

const calculateMealTotals = (foods: Food[]): { 
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
} => {
  return foods.reduce((totals, food) => ({
    totalCalories: totals.totalCalories + food.calories,
    totalProtein: totals.totalProtein + food.protein,
    totalCarbs: totals.totalCarbs + food.carbs,
    totalFats: totals.totalFats + food.fats
  }), {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0
  });
};

const generateDietPlan = (profile: any, planType: string): WeeklyDietPlan => {
  const { weight, height, age, gender, activityLevel } = profile;
  
  // Calculate BMR using Mifflin-St Jeor Equation
  const bmr = Math.round(
    gender === 'male'
      ? (10 * weight) + (6.25 * height) - (5 * age) + 5
      : (10 * weight) + (6.25 * height) - (5 * age) - 161
  );

  // Activity level multipliers with exact values
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,      // Little or no exercise
    light: 1.375,        // Light exercise/sports 1-3 days/week
    moderate: 1.55,      // Moderate exercise/sports 3-5 days/week
    active: 1.725,       // Hard exercise/sports 6-7 days/week
    veryActive: 1.9      // Very hard exercise/sports & physical job or training twice per day
  };

  // Use a default multiplier if activityLevel is not found
  const multiplier = activityMultipliers[activityLevel] || activityMultipliers.moderate;
  const tdee = Math.round(bmr * multiplier);

  // Set target calories based on goal
  let targetCalories: number;
  let proteinMultiplier: number;
  let carbsMultiplier: number;
  let fatsMultiplier: number;
  let mealDatabase: Food[];
  let waterIntake: number;
  let supplementation: Supplement[];

  switch (planType) {
    case 'weight-loss':
      targetCalories = tdee - 500; // 500 calorie deficit
      proteinMultiplier = 2.2;     // Higher protein for muscle preservation (g/kg)
      carbsMultiplier = 2;         // Moderate carbs (g/kg)
      fatsMultiplier = 0.8;        // Lower fats (g/kg)
      mealDatabase = lowCalorieMealDatabase;
      waterIntake = Math.round(weight * 0.04 * 100) / 100; // 40ml per kg of body weight
      supplementation = [
        {
          name: "CLA (Conjugated Linoleic Acid)",
          dosage: "3g",
          timing: "With meals",
          notes: "May help with fat loss while preserving muscle mass",
          benefits: "Supports fat metabolism and lean muscle preservation"
        },
        {
          name: "Green Tea Extract",
          dosage: "500mg",
          timing: "Before exercise",
          notes: "Contains EGCG which may boost metabolism",
          benefits: "Supports metabolism and fat oxidation"
        }
      ];
      break;

    case 'muscle-gain':
      targetCalories = tdee + 300;  // Caloric surplus
      proteinMultiplier = 2.4;      // Higher protein for muscle growth (g/kg)
      carbsMultiplier = 4;          // Higher carbs for energy and recovery (g/kg)
      fatsMultiplier = 0.9;         // Moderate fats (g/kg)
      mealDatabase = highProteinMealDatabase;
      waterIntake = Math.round(weight * 0.05 * 100) / 100; // 50ml per kg of body weight
      supplementation = [
        {
          name: "Whey Protein",
          dosage: "25-30g",
          timing: "Post-workout",
          notes: "High-quality protein source for muscle recovery",
          benefits: "Supports muscle growth and recovery"
        },
        {
          name: "Creatine Monohydrate",
          dosage: "5g",
          timing: "Daily",
          notes: "Take with water, no loading phase needed",
          benefits: "Increases strength and muscle mass"
        }
      ];
      break;

    default: // maintenance
      targetCalories = tdee;
      proteinMultiplier = 2;        // Moderate protein (g/kg)
      carbsMultiplier = 3;          // Balanced carbs (g/kg)
      fatsMultiplier = 1;           // Balanced fats (g/kg)
      mealDatabase = maintenanceMealDatabase;
      waterIntake = Math.round(weight * 0.035 * 100) / 100; // 35ml per kg of body weight
      supplementation = [
        {
          name: "Multivitamin",
          dosage: "1 tablet",
          timing: "With breakfast",
          notes: "Covers potential nutritional gaps",
          benefits: "Supports overall health and wellness"
        },
        {
          name: "Fish Oil",
          dosage: "2-3g",
          timing: "With meals",
          notes: "Rich in omega-3 fatty acids",
          benefits: "Supports heart and brain health"
        }
      ];
  }

  // Calculate macronutrient goals
  const proteinGrams = Math.round(weight * proteinMultiplier);
  const proteinCalories = proteinGrams * 4;
  const fatsGrams = Math.round(weight * fatsMultiplier);
  const fatsCalories = fatsGrams * 9;
  const carbsGrams = Math.round((targetCalories - proteinCalories - fatsCalories) / 4);

  const nutritionalGoals: NutritionalGoals = {
    calories: targetCalories,
    protein: {
      grams: proteinGrams,
      percentage: Math.round((proteinCalories / targetCalories) * 100)
    },
    carbs: {
      grams: carbsGrams,
      percentage: Math.round((carbsGrams * 4 / targetCalories) * 100)
    },
    fats: {
      grams: fatsGrams,
      percentage: Math.round((fatsCalories / targetCalories) * 100)
    }
  };

  // Generate daily meals with totals
  const generateDailyMeals = (mealDb: Food[]): Meal[] => {
    const meals: Meal[] = [
      {
        type: 'Breakfast',
              time: '8:00 AM',
        foods: [mealDb[0]],
        totalCalories: mealDb[0].calories,
        totalProtein: mealDb[0].protein,
        totalCarbs: mealDb[0].carbs,
        totalFats: mealDb[0].fats
      },
      {
        type: 'Lunch',
              time: '1:00 PM',
        foods: [mealDb[1]],
        totalCalories: mealDb[1].calories,
        totalProtein: mealDb[1].protein,
        totalCarbs: mealDb[1].carbs,
        totalFats: mealDb[1].fats
      },
      {
        type: 'Dinner',
              time: '7:00 PM',
        foods: [mealDb[2]],
        totalCalories: mealDb[2].calories,
        totalProtein: mealDb[2].protein,
        totalCarbs: mealDb[2].carbs,
        totalFats: mealDb[2].fats
      }
    ];
    return meals;
  };

  // Generate weekly plan
  const weeklyPlan = Array(7).fill(null).map((_, index) => ({
    day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index],
    meals: generateDailyMeals(mealDatabase)
  }));

  return {
    title: `${planType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Diet Plan`,
    description: getDescription(planType),
    level: "Intermediate",
    duration: "12 weeks",
    type: planType,
    goal: getGoal(planType),
    color: getColor(planType),
    waterIntake,
    supplementation,
    nutritionalGoals,
    weeklyPlan
  };
};

const getDescription = (planType: string): string => {
  switch (planType) {
    case 'weight-loss':
      return "A calorie-controlled diet plan focused on sustainable fat loss while preserving muscle mass";
    case 'muscle-gain':
      return "A high-protein diet plan designed to support muscle growth and strength gains";
    default:
      return "A balanced diet plan to maintain weight and support overall health";
  }
};

const getGoal = (planType: string): string => {
  switch (planType) {
    case 'weight-loss':
      return "Lose fat while maintaining muscle";
    case 'muscle-gain':
      return "Build muscle and increase strength";
    default:
      return "Maintain weight and improve health";
  }
};

const getColor = (planType: string): string => {
  switch (planType) {
    case 'weight-loss':
      return "red";
    case 'muscle-gain':
      return "blue";
    default:
      return "green";
  }
};

export const useDietService = () => {
  const { profile } = useProfile();

  return {
    generateDietPlan: (profileData: any, planType: string) => generateDietPlan(profileData, planType)
  };
}; 