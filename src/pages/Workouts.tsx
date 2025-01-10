import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { wgerService } from '../services/api/wgerService';
import { Dumbbell, Plus, ChevronRight, ChevronDown, Info } from 'lucide-react';
import { pplWorkoutPlan, WorkoutDay } from '../data/workoutPlans';

export default function Workouts() {
  const { isDarkMode } = useTheme();
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    async function fetchExercises() {
      try {
        const data = await wgerService.getExercises();
        setExercises(data);
      } catch (err) {
        setError('Failed to load exercises');
      } finally {
        setLoading(false);
      }
    }

    fetchExercises();
  }, []);

  const renderWorkoutDay = (day: WorkoutDay, index: number) => (
    <div key={index} className={`mb-4 rounded-lg ${
      isDarkMode ? 'bg-dark-surface' : 'bg-white'
    } shadow-lg overflow-hidden`}>
      <div
        className={`p-4 cursor-pointer flex justify-between items-center ${
          isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
        }`}
        onClick={() => setSelectedDay(selectedDay === index ? null : index)}
      >
        <div>
          <h3 className="font-semibold">{day.name}</h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {day.focus}
          </p>
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform ${
          selectedDay === index ? 'transform rotate-180' : ''
        }`} />
      </div>

      {selectedDay === index && (
        <div className="p-4 border-t border-gray-200">
          {day.exercises.map((exercise, i) => (
            <div key={i} className="mb-3 last:mb-0">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{exercise.name}</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {exercise.sets} sets × {exercise.reps} reps
                  </p>
                </div>
                {exercise.notes && (
                  <div className="text-sm text-gray-500 italic">
                    {exercise.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto p-4 ${
      isDarkMode ? 'text-dark-text' : 'text-gray-800'
    }`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Dumbbell className="w-6 h-6 mr-2" />
          Workouts
        </h1>
        <button className={`px-4 py-2 rounded-lg flex items-center ${
          isDarkMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-500 hover:bg-emerald-600'
        } text-white transition-colors`}>
          <Plus className="w-5 h-5 mr-2" />
          New Workout
        </button>
      </div>

      {/* Current Plan */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{pplWorkoutPlan.name}</h2>
          <button
            onClick={() => setShowTips(!showTips)}
            className={`p-2 rounded-lg ${
              isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
            }`}
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
        
        {showTips && (
          <div className={`mb-6 p-4 rounded-lg ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            {pplWorkoutPlan.tips.map((tip, index) => (
              <div key={index} className="mb-4 last:mb-0">
                <h3 className="font-semibold mb-2">{tip.category}</h3>
                <ul className="list-disc list-inside">
                  {tip.items.map((item, i) => (
                    <li key={i} className="text-sm">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {pplWorkoutPlan.days.map((day, index) => renderWorkoutDay(day, index))}
      </div>

      {error && (
        <div className="text-red-500 mt-4 text-center">
          {error}
        </div>
      )}
    </div>
  );
} 