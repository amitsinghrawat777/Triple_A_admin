import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, X } from 'lucide-react';
import { differenceInYears } from 'date-fns';

interface UserProfile {
  personalInfo?: {
    age: string;
    dateOfBirth: string;
    gender: string;
    bloodType: string;
  };
  stats?: {
    weight: string;
    height: string;
  };
  preferences?: {
    fitnessLevel: string;
    activityLevel: string;
    dietary: string[];
  };
  goals?: string[];
  medicalInfo?: {
    conditions: string;
  };
}

export default function ProfileEdit() {
  const navigate = useNavigate();
  const { profileData, updateProfile } = useProfile();
  const [goals, setGoals] = useState<string[]>(profileData?.goals || []);
  const [isSaving, setIsSaving] = useState(false);
  const [hasMedicalConditions, setHasMedicalConditions] = useState(
    !!profileData?.medicalInfo?.conditions
  );

  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      age: profileData?.personalInfo?.age || '',
      dateOfBirth: profileData?.personalInfo?.dateOfBirth || '',
      gender: profileData?.personalInfo?.gender || '',
      bloodType: profileData?.personalInfo?.bloodType || '',
      weight: profileData?.stats?.weight || '',
      height: profileData?.stats?.height || '',
      fitnessLevel: profileData?.preferences?.fitnessLevel || '',
      activityLevel: profileData?.preferences?.activityLevel || '',
      medicalConditions: profileData?.medicalInfo?.conditions || '',
      newGoal: ''
    }
  });

  const newGoal = watch('newGoal');

  const addGoal = () => {
    if (newGoal && !goals.includes(newGoal)) {
      setGoals([...goals, newGoal]);
      setValue('newGoal', '');
    }
  };

  const removeGoal = (goalToRemove: string) => {
    setGoals(goals.filter(goal => goal !== goalToRemove));
  };

  const calculateAge = (dob: string) => {
    if (!dob) return '';
    const age = differenceInYears(new Date(), new Date(dob));
    setValue('age', age.toString());
    return age.toString();
  };

  const handleDOBChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dob = e.target.value;
    setValue('dateOfBirth', dob);
    calculateAge(dob);
  };

  const onSubmit = async (data: any) => {
    try {
      setIsSaving(true);
      console.log('Form data:', data);

      const updatedProfile = {
        personalInfo: {
          age: calculateAge(data.dateOfBirth),
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          bloodType: data.bloodType,
        },
        stats: {
          weight: data.weight,
          height: data.height,
        },
        preferences: {
          fitnessLevel: data.fitnessLevel,
          activityLevel: data.activityLevel,
          dietary: profileData?.preferences?.dietary || [],
        },
        goals: goals,
        medicalInfo: {
          conditions: hasMedicalConditions ? data.medicalConditions : '',
        },
      };

      console.log('Sending update:', updatedProfile);
      await updateProfile(updatedProfile);
      navigate('/profile');
    } catch (error) {
      console.error('Profile update error:', {
        error,
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      alert(`Failed to update profile: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="max-w-3xl mx-auto px-4 py-4 pb-24">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-[#1E1E1E] rounded-xl shadow-sm mb-6">
            <div className="p-6 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="p-2 hover:bg-[#282828] rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-semibold">Edit Profile</h1>
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isSaving 
                    ? 'bg-emerald-700 cursor-not-allowed' 
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          <div className="bg-[#1E1E1E] rounded-xl shadow-sm">
            <div className="space-y-8 p-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                <p className="text-sm text-gray-400 mb-4">Basic information about you</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      {...register('dateOfBirth')}
                      onChange={handleDOBChange}
                      className="w-full px-4 py-2 rounded-lg bg-[#282828] border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                      placeholder="YYYY-MM-DD"
                    />
                    <p className="text-xs text-gray-500 mt-1">Example: 1990-01-01</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Age</label>
                    <input
                      type="text"
                      {...register('age')}
                      disabled
                      className="w-full px-4 py-2 rounded-lg bg-[#282828] border border-gray-700 text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Gender</label>
                    <select
                      {...register('gender')}
                      className="w-full px-4 py-2 rounded-lg bg-[#282828] border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Blood Type</label>
                    <select
                      {...register('bloodType')}
                      className="w-full px-4 py-2 rounded-lg bg-[#282828] border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                    >
                      <option value="">Select blood type</option>
                      <option value="A+">A+ (Most common)</option>
                      <option value="O+">O+ (Universal donor)</option>
                      <option value="B+">B+</option>
                      <option value="AB+">AB+ (Universal recipient)</option>
                      <option value="A-">A-</option>
                      <option value="O-">O-</option>
                      <option value="B-">B-</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Physical Stats */}
              <div>
                <h3 className="text-lg font-medium mb-4">Physical Stats</h3>
                <p className="text-sm text-gray-400 mb-4">Your current physical measurements</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Weight (kg)</label>
                    <input
                      type="number"
                      {...register('weight')}
                      placeholder="70"
                      className="w-full px-4 py-2 rounded-lg bg-[#282828] border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-1">Example: 70 kg</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Height (cm)</label>
                    <input
                      type="number"
                      {...register('height')}
                      placeholder="175"
                      className="w-full px-4 py-2 rounded-lg bg-[#282828] border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-1">Example: 175 cm</p>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div>
                <h3 className="text-lg font-medium mb-4">Preferences</h3>
                <p className="text-sm text-gray-400 mb-4">Help us personalize your experience</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Fitness Level</label>
                    <select
                      {...register('fitnessLevel')}
                      className="w-full px-4 py-2 rounded-lg bg-[#282828] border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                    >
                      <option value="">Select fitness level</option>
                      <option value="beginner">Beginner (New to exercise)</option>
                      <option value="intermediate">Intermediate (Regular exerciser)</option>
                      <option value="advanced">Advanced (Experienced athlete)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Activity Level</label>
                    <select
                      {...register('activityLevel')}
                      className="w-full px-4 py-2 rounded-lg bg-[#282828] border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                    >
                      <option value="">Select activity level</option>
                      <option value="sedentary">Sedentary (Little to no exercise)</option>
                      <option value="moderate">Moderate (Exercise 1-3 times/week)</option>
                      <option value="active">Active (Exercise 3-5 times/week)</option>
                      <option value="very_active">Very Active (Exercise 6+ times/week)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div>
                <h3 className="text-lg font-medium mb-4">Medical Information</h3>
                <p className="text-sm text-gray-400 mb-4">Important health information for safe exercise planning</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Do you have any medical conditions?</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={hasMedicalConditions}
                          onChange={() => {
                            setHasMedicalConditions(true);
                            if (!hasMedicalConditions) {
                              setValue('medicalConditions', '');
                            }
                          }}
                          className="text-emerald-500 focus:ring-emerald-500"
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={!hasMedicalConditions}
                          onChange={() => {
                            setHasMedicalConditions(false);
                            setValue('medicalConditions', '');
                          }}
                          className="text-emerald-500 focus:ring-emerald-500"
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>

                  {hasMedicalConditions && (
                    <div className="mt-4">
                      <label className="block text-sm text-gray-400 mb-2">
                        Please describe your medical conditions
                      </label>
                      <textarea
                        {...register('medicalConditions')}
                        placeholder="Example: Asthma, High blood pressure, Previous injuries, etc."
                        className="w-full px-4 py-2 rounded-lg bg-[#282828] border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                        rows={3}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Please include any conditions that might affect your exercise routine
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Dietary Preferences */}
              <div>
                <h3 className="text-lg font-medium mb-4">Dietary Preferences</h3>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {profileData?.preferences?.dietary?.map((diet: string) => (
                      <span key={diet} className="px-3 py-1.5 bg-[#282828] text-emerald-400 rounded-full text-sm">
                        {diet}
                      </span>
                    ))}
                    {(!profileData?.preferences?.dietary || profileData.preferences.dietary.length === 0) && (
                      <p className="text-gray-400">No dietary preferences set</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Goals Section */}
              <div>
                <h3 className="text-lg font-medium mb-4">Fitness Goals</h3>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {goals.map((goal) => (
                      <span key={goal} className="px-3 py-1.5 bg-[#282828] text-blue-400 rounded-full text-sm flex items-center gap-2">
                        {goal}
                        <button
                          type="button"
                          onClick={() => removeGoal(goal)}
                          className="hover:text-blue-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                    {goals.length === 0 && (
                      <p className="text-gray-400">No goals set</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Add Goal</label>
                    <div className="flex gap-2">
                      <select
                        {...register('newGoal')}
                        className="flex-1 px-4 py-2 rounded-lg bg-[#282828] border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                      >
                        <option value="">Select goal</option>
                        <option value="Weight Loss">Weight Loss</option>
                        <option value="Muscle Gain">Muscle Gain</option>
                        <option value="Improve Endurance">Improve Endurance</option>
                        <option value="Increase Flexibility">Increase Flexibility</option>
                        <option value="Build Strength">Build Strength</option>
                        <option value="Maintain Fitness">Maintain Fitness</option>
                      </select>
                      <button
                        type="button"
                        onClick={addGoal}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 