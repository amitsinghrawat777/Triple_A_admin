import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../services/database';

interface UserDetails {
  age: number;
  dateOfBirth: string;
  weight: number;
  height: number;
  bloodType: string;
  dietaryPreferences: string[];
  fitnessLevel: string;
  medicalConditions: string;
  gender: string;
  activityLevel: string;
  goals: string[];
}

export default function UserOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  
  const [userDetails, setUserDetails] = useState<UserDetails>({
    age: 0,
    dateOfBirth: '',
    weight: 0,
    height: 0,
    bloodType: '',
    dietaryPreferences: [],
    fitnessLevel: 'beginner',
    medicalConditions: '',
    gender: '',
    activityLevel: 'moderate',
    goals: []
  });

  const dietaryOptions = [
    'Vegetarian',
    'Vegan',
    'Pescatarian',
    'Keto',
    'Paleo',
    'No restrictions'
  ];

  const fitnessLevels = [
    'Beginner',
    'Intermediate',
    'Advanced'
  ];

  const activityLevels = [
    'Sedentary',
    'Light',
    'Moderate',
    'Very Active',
    'Extremely Active'
  ];

  const goalOptions = [
    'Weight Loss',
    'Muscle Gain',
    'Improve Strength',
    'Increase Flexibility',
    'Better Endurance',
    'General Fitness'
  ];

  const handleDietaryChange = (preference: string) => {
    setUserDetails(prev => ({
      ...prev,
      dietaryPreferences: prev.dietaryPreferences.includes(preference)
        ? prev.dietaryPreferences.filter(p => p !== preference)
        : [...prev.dietaryPreferences, preference]
    }));
  };

  const handleGoalsChange = (goal: string) => {
    setUserDetails(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    try {
      await updateUserProfile(user.uid, {
        stats: {
          weight: userDetails.weight,
          height: userDetails.height,
          lastUpdated: new Date()
        },
        personalInfo: {
          age: userDetails.age,
          dateOfBirth: userDetails.dateOfBirth,
          bloodType: userDetails.bloodType,
          gender: userDetails.gender,
          medicalConditions: userDetails.medicalConditions
        },
        preferences: {
          dietary: userDetails.dietaryPreferences,
          fitnessLevel: userDetails.fitnessLevel,
          activityLevel: userDetails.activityLevel
        },
        goals: userDetails.goals,
        onboardingCompleted: true
      });
      
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to save user details. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-blue-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xl p-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Complete Your Profile</h2>
          <p className="mt-2 text-gray-600">Help us personalize your fitness journey</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Age</label>
                  <input
                    type="number"
                    value={userDetails.age || ''}
                    onChange={(e) => setUserDetails(prev => ({...prev, age: parseInt(e.target.value)}))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    value={userDetails.dateOfBirth}
                    onChange={(e) => setUserDetails(prev => ({...prev, dateOfBirth: e.target.value}))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                  <input
                    type="number"
                    value={userDetails.weight || ''}
                    onChange={(e) => setUserDetails(prev => ({...prev, weight: parseInt(e.target.value)}))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                  <input
                    type="number"
                    value={userDetails.height || ''}
                    onChange={(e) => setUserDetails(prev => ({...prev, height: parseInt(e.target.value)}))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors"
              >
                Next
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Blood Type</label>
                <select
                  value={userDetails.bloodType}
                  onChange={(e) => setUserDetails(prev => ({...prev, bloodType: e.target.value}))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="">Select Blood Type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select
                  value={userDetails.gender}
                  onChange={(e) => setUserDetails(prev => ({...prev, gender: e.target.value}))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Medical Conditions</label>
                <textarea
                  value={userDetails.medicalConditions}
                  onChange={(e) => setUserDetails(prev => ({...prev, medicalConditions: e.target.value}))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  rows={3}
                  placeholder="List any medical conditions or injuries..."
                />
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors"
                >
                  Next
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Preferences</label>
                <div className="grid grid-cols-2 gap-2">
                  {dietaryOptions.map(option => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={userDetails.dietaryPreferences.includes(option)}
                        onChange={() => handleDietaryChange(option)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Fitness Level</label>
                <select
                  value={userDetails.fitnessLevel}
                  onChange={(e) => setUserDetails(prev => ({...prev, fitnessLevel: e.target.value}))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                >
                  {fitnessLevels.map(level => (
                    <option key={level.toLowerCase()} value={level.toLowerCase()}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Activity Level</label>
                <select
                  value={userDetails.activityLevel}
                  onChange={(e) => setUserDetails(prev => ({...prev, activityLevel: e.target.value}))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                >
                  {activityLevels.map(level => (
                    <option key={level.toLowerCase()} value={level.toLowerCase()}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fitness Goals</label>
                <div className="grid grid-cols-2 gap-2">
                  {goalOptions.map(goal => (
                    <label key={goal} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={userDetails.goals.includes(goal)}
                        onChange={() => handleGoalsChange(goal)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{goal}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors"
                >
                  Complete Profile
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 