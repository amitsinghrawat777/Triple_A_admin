import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, 
  Target, 
  Calendar, 
  TrendingUp, 
  Dumbbell, 
  Scale,
  Clock,
  ChevronRight,
  Flame 
} from 'lucide-react';

export default function Dashboard() {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();

  // Mock data (replace with actual data from your database)
  const userStats = {
    currentWeight: '75 kg',
    targetWeight: '80 kg',
    workoutsCompleted: 12,
    currentStreak: 5,
    nextWorkout: 'Push Day (Chest, Shoulders, Triceps)',
    calorieTarget: '2800 kcal',
    proteinTarget: '160g',
    progress: {
      monthly: '+2.5 kg',
      workoutFrequency: '4 days/week'
    }
  };

  const [streak, setStreak] = useState(0);
  
  const calculateStreak = () => {
    // Get stored workout dates from localStorage
    const workoutDates = JSON.parse(localStorage.getItem('workoutDates') || '[]');
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    // If no workouts, return 0
    if (workoutDates.length === 0) return 0;
    
    // Check if worked out today
    const workedOutToday = workoutDates.includes(today);
    // Check if worked out yesterday
    const workedOutYesterday = workoutDates.includes(yesterday);
    
    // Get the current streak from localStorage
    let currentStreak = parseInt(localStorage.getItem('currentStreak') || '0');
    
    if (workedOutToday) {
      // If worked out today, maintain or increment streak
      currentStreak = workedOutYesterday ? currentStreak + 1 : 1;
    } else if (!workedOutYesterday) {
      // If missed two days, reset streak
      currentStreak = 0;
    }
    
    // Save updated streak
    localStorage.setItem('currentStreak', currentStreak.toString());
    return currentStreak;
  };

  // Add useEffect to calculate streak on component mount
  useEffect(() => {
    const currentStreak = calculateStreak();
    setStreak(currentStreak);
  }, []);

  const StatCard = ({ icon: Icon, title, value, subtext }: {
    icon: React.ElementType;
    title: string;
    value: string;
    subtext?: string;
  }) => (
    <div className={`p-4 rounded-lg ${
      isDarkMode ? 'bg-dark-surface' : 'bg-white'
    } shadow-lg`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>{title}</p>
          <h3 className="text-xl font-bold mt-1">{value}</h3>
          {subtext && (
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            } mt-1`}>{subtext}</p>
          )}
        </div>
        <Icon className={`w-5 h-5 ${
          isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
        }`} />
      </div>
    </div>
  );

  const ImmersiveStreakCounter = ({ streak }: { streak: number }) => (
    <div className={`p-4 rounded-lg ${
      isDarkMode ? 'bg-dark-surface' : 'bg-white'
    } shadow-lg relative overflow-hidden`}>
      <div className={`absolute top-0 left-0 h-1 transition-all duration-1000 ${
        isDarkMode ? 'bg-orange-500' : 'bg-orange-400'
      }`} style={{ width: `${Math.min((streak / 30) * 100, 100)}%` }} />
      
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>Current Streak</p>
          
          <div className="flex items-center gap-3 mt-2">
            <div className="relative">
              <Flame className={`w-8 h-8 ${
                isDarkMode ? 'text-orange-500' : 'text-orange-400'
              } animate-pulse`} />
              {streak >= 7 && (
                <div className="absolute -top-1 -right-1">
                  <div className={`w-3 h-3 rounded-full ${
                    isDarkMode ? 'bg-orange-500' : 'bg-orange-400'
                  } animate-ping`} />
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-3xl font-bold">{streak}</h3>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>days</p>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {streak >= 30 ? '🔥 Unstoppable!' : 
             streak >= 14 ? '💪 Crushing it!' :
             streak >= 7 ? '👊 Solid streak!' :
             'Keep going!'}
          </div>
          <div className={`text-xs mt-1 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`}>
            {streak >= 7 ? `${30 - (streak % 30)} days to next milestone` : 
             `${7 - streak} days to first milestone`}
          </div>
        </div>
      </div>
    </div>
  );

  const NextWorkoutCard = () => (
    <div className={`p-4 rounded-lg ${
      isDarkMode ? 'bg-dark-surface' : 'bg-white'
    } shadow-lg`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Next Workout</h3>
        <Calendar className="w-5 h-5 text-emerald-600" />
      </div>
      <p className={`text-sm ${
        isDarkMode ? 'text-gray-400' : 'text-gray-600'
      } mb-3`}>Today's Session</p>
      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium">{userStats.nextWorkout}</p>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          } mt-1`}>Estimated time: 60 min</p>
        </div>
        <button className={`px-3 py-1.5 rounded-lg flex items-center ${
          isDarkMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-500 hover:bg-emerald-600'
        } text-white transition-colors text-sm`}>
          Start
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );

  const NutritionCard = () => (
    <div className={`p-4 rounded-lg ${
      isDarkMode ? 'bg-dark-surface' : 'bg-white'
    } shadow-lg`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Daily Nutrition</h3>
        <Target className="w-5 h-5 text-emerald-600" />
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Calories</span>
            <span>{userStats.calorieTarget}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-3/4"></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Protein</span>
            <span>{userStats.proteinTarget}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`max-w-4xl mx-auto p-4 ${
      isDarkMode ? 'text-dark-text' : 'text-gray-800'
    }`}>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Welcome back, {user?.displayName || 'Athlete'}!</h1>
        <p className={`${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>Let's crush today's goals</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <ImmersiveStreakCounter streak={streak} />
        <StatCard
          icon={Scale}
          title="Current Weight"
          value={userStats.currentWeight}
          subtext={`Target: ${userStats.targetWeight}`}
        />
        <StatCard
          icon={Activity}
          title="Workouts Completed"
          value={userStats.workoutsCompleted.toString()}
        />
      </div>

      {/* Workout and Nutrition Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NextWorkoutCard />
        <NutritionCard />
      </div>
    </div>
  );
}