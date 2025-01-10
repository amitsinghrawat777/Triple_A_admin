import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  Apple, 
  Coffee, 
  Utensils, 
  Moon,
  Plus,
  ChevronDown,
  Info,
  Search
} from 'lucide-react';

interface Meal {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  time: string;
  foods: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    portion: string;
  }[];
}

export default function DietPlan() {
  const { isDarkMode } = useTheme();
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with actual data from your database
  const dailyGoals = {
    calories: 2800,
    protein: 160,
    carbs: 350,
    fats: 78
  };

  const meals: Meal[] = [
    {
      type: 'breakfast',
      time: '7:00 AM',
      foods: [
        {
          name: 'Oatmeal with Banana',
          calories: 350,
          protein: 12,
          carbs: 65,
          fats: 6,
          portion: '1 bowl'
        },
        {
          name: 'Greek Yogurt',
          calories: 130,
          protein: 15,
          carbs: 8,
          fats: 4,
          portion: '1 cup'
        }
      ]
    },
    {
      type: 'lunch',
      time: '1:00 PM',
      foods: [
        {
          name: 'Grilled Chicken Breast',
          calories: 280,
          protein: 35,
          carbs: 0,
          fats: 8,
          portion: '200g'
        },
        {
          name: 'Brown Rice',
          calories: 220,
          protein: 5,
          carbs: 45,
          fats: 2,
          portion: '1 cup'
        }
      ]
    },
    {
      type: 'dinner',
      time: '7:00 PM',
      foods: [
        {
          name: 'Salmon Fillet',
          calories: 350,
          protein: 42,
          carbs: 0,
          fats: 18,
          portion: '200g'
        },
        {
          name: 'Sweet Potato',
          calories: 180,
          protein: 2,
          carbs: 41,
          fats: 0,
          portion: '1 medium'
        },
        {
          name: 'Steamed Broccoli',
          calories: 55,
          protein: 4,
          carbs: 11,
          fats: 0,
          portion: '1 cup'
        }
      ]
    }
  ];

  const getMealIcon = (type: string) => {
    switch (type) {
      case 'breakfast':
        return Coffee;
      case 'lunch':
        return Utensils;
      case 'dinner':
        return Moon;
      default:
        return Apple;
    }
  };

  const calculateTotalNutrients = (foods: Meal['foods']) => {
    return foods.reduce((acc, food) => ({
      calories: acc.calories + food.calories,
      protein: acc.protein + food.protein,
      carbs: acc.carbs + food.carbs,
      fats: acc.fats + food.fats
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
  };

  const NutrientProgress = ({ label, current, goal, color }: {
    label: string;
    current: number;
    goal: number;
    color: string;
  }) => (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>{current} / {goal}g</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color}`} 
          style={{ width: `${Math.min((current / goal) * 100, 100)}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className={`max-w-4xl mx-auto p-4 ${
      isDarkMode ? 'text-dark-text' : 'text-gray-800'
    }`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Diet Plan</h1>
          <p className={`${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>Track your nutrition and meals</p>
        </div>
        <button className={`px-4 py-2 rounded-lg flex items-center ${
          isDarkMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-500 hover:bg-emerald-600'
        } text-white transition-colors`}>
          <Plus className="w-5 h-5 mr-2" />
          Add Meal
        </button>
      </div>

      {/* Nutrition Overview */}
      <div className={`p-4 rounded-lg ${
        isDarkMode ? 'bg-dark-surface' : 'bg-white'
      } shadow-lg mb-6`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Daily Nutrition</h2>
          <Info className="w-5 h-5 text-emerald-600" />
        </div>
        <NutrientProgress 
          label="Protein" 
          current={85} 
          goal={dailyGoals.protein}
          color="bg-blue-500"
        />
        <NutrientProgress 
          label="Carbs" 
          current={180} 
          goal={dailyGoals.carbs}
          color="bg-emerald-500"
        />
        <NutrientProgress 
          label="Fats" 
          current={45} 
          goal={dailyGoals.fats}
          color="bg-yellow-500"
        />
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search foods..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full p-3 pl-10 rounded-lg border ${
            isDarkMode 
              ? 'bg-dark-surface border-gray-700 text-dark-text' 
              : 'bg-white border-gray-300'
          }`}
        />
        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>

      {/* Meals List */}
      <div className="space-y-4">
        {meals.map((meal, index) => {
          const Icon = getMealIcon(meal.type);
          const totals = calculateTotalNutrients(meal.foods);
          
          return (
            <div 
              key={index}
              className={`rounded-lg ${
                isDarkMode ? 'bg-dark-surface' : 'bg-white'
              } shadow-lg overflow-hidden`}
            >
              <div
                className={`p-4 cursor-pointer ${
                  isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedMeal(selectedMeal === meal.type ? null : meal.type)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Icon className="w-5 h-5 mr-3 text-emerald-600" />
                    <div>
                      <h3 className="font-medium capitalize">{meal.type}</h3>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>{meal.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-3">{totals.calories} kcal</span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${
                      selectedMeal === meal.type ? 'transform rotate-180' : ''
                    }`} />
                  </div>
                </div>
              </div>

              {selectedMeal === meal.type && (
                <div className="p-4 border-t border-gray-200">
                  {meal.foods.map((food, foodIndex) => (
                    <div 
                      key={foodIndex}
                      className={`p-3 rounded-lg mb-2 last:mb-0 ${
                        isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{food.name}</p>
                          <p className={`text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>{food.portion}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{food.calories} kcal</p>
                          <p className={`text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            P: {food.protein}g • C: {food.carbs}g • F: {food.fats}g
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}