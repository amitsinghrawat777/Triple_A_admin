import { useState, useCallback } from 'react';
import { exerciseService } from '../services/api/exerciseService';
import { nutritionService } from '../services/api/nutritionService';
import { aiService } from '../services/api/aiService';
import { useAuth } from '../context/AuthContext';

export function useFitness() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPersonalizedWorkout = useCallback(async (
    goals: string,
    fitnessLevel: string,
    limitations?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const suggestion = await aiService.getWorkoutSuggestion(
        goals,
        fitnessLevel,
        limitations
      );
      
      // Get detailed exercise information
      const exercises = await Promise.all(
        suggestion.recommendations.map(exercise => 
          exerciseService.getExerciseById(exercise)
        )
      );

      return {
        plan: suggestion.suggestion,
        exercises
      };
    } catch (err) {
      setError('Failed to get personalized workout');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const trackNutrition = useCallback(async (foodQuery: string) => {
    setLoading(true);
    setError(null);
    try {
      const nutritionInfo = await nutritionService.getNutritionInfo(foodQuery);
      return nutritionInfo;
    } catch (err) {
      setError('Failed to track nutrition');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getPersonalizedWorkout,
    trackNutrition
  };
} 