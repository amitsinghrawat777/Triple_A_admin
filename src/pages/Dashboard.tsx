import React from 'react';
import { useProfile } from '../context/ProfileContext';
import { Activity, Award, Calendar, Clock, Dumbbell, Target, TrendingUp, User } from 'lucide-react';

export default function Dashboard() {
  const { profileData, loading } = useProfile();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="container mx-auto px-4 py-4 pb-24">
        {/* Welcome Section */}
        <div className="bg-[#1E1E1E] rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {profileData?.displayName || 'Athlete'}!
          </h1>
          <p className="text-gray-300 mt-2">Let's achieve your fitness goals together.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Today's Workout */}
          <div className="bg-[#1E1E1E] rounded-xl shadow-sm p-4">
            <div className="flex items-center">
              <div className="p-3 bg-[#282828] rounded-full">
                <Dumbbell className="h-6 w-6 text-emerald-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Today's Workout</p>
                <p className="text-lg font-semibold text-white">Pending</p>
              </div>
            </div>
          </div>

          {/* Progress Stats */}
          <div className="bg-[#1E1E1E] rounded-xl shadow-sm p-4">
            <div className="flex items-center">
              <div className="p-3 bg-[#282828] rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Weekly Progress</p>
                <p className="text-lg font-semibold text-white">On Track</p>
              </div>
            </div>
          </div>

          {/* Goals */}
          <div className="bg-[#1E1E1E] rounded-xl shadow-sm p-4">
            <div className="flex items-center">
              <div className="p-3 bg-[#282828] rounded-full">
                <Target className="h-6 w-6 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Active Goals</p>
                <p className="text-lg font-semibold text-white">
                  {profileData?.goals?.length || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-[#1E1E1E] rounded-xl shadow-sm p-4">
            <div className="flex items-center">
              <div className="p-3 bg-[#282828] rounded-full">
                <Award className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Achievements</p>
                <p className="text-lg font-semibold text-white">3</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Workout Plan */}
          <div className="lg:col-span-2">
            <div className="bg-[#1E1E1E] rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Today's Workout Plan</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#282828] rounded-xl">
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 text-emerald-500 mr-3" />
                    <div>
                      <p className="font-medium text-white">Warm Up</p>
                      <p className="text-sm text-gray-400">5-10 minutes</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-sm text-emerald-500 bg-emerald-500/10 rounded-full">
                    Pending
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Summary */}
          <div className="bg-[#1E1E1E] rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Profile Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Current Weight</p>
                  <p className="font-medium text-white">
                    {profileData?.stats?.weight ? `${profileData.stats.weight} kg` : 'Not set'}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Fitness Level</p>
                  <p className="font-medium text-white capitalize">
                    {profileData?.preferences?.fitnessLevel || 'Not set'}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Activity Level</p>
                  <p className="font-medium text-white capitalize">
                    {profileData?.preferences?.activityLevel || 'Not set'}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Next Workout</p>
                  <p className="font-medium text-white">Today</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}