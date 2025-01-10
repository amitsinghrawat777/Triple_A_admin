import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { Edit } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { profileData } = useProfile();

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="max-w-3xl mx-auto px-4 py-4 pb-24">
        <div className="bg-[#1E1E1E] rounded-xl shadow-sm">
          {/* Header with Edit Button */}
          <div className="px-6 py-5 flex justify-between items-center border-b border-[#282828]">
            <h2 className="text-xl font-semibold">Profile Information</h2>
            <button
              onClick={() => navigate('/profile/edit')}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Personal Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-400">Age</p>
                  <p className="mt-1">{profileData?.personalInfo?.age || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Date of Birth</p>
                  <p className="mt-1">{profileData?.personalInfo?.dateOfBirth || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Gender</p>
                  <p className="mt-1">{profileData?.personalInfo?.gender || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Blood Type</p>
                  <p className="mt-1">{profileData?.personalInfo?.bloodType || 'Not set'}</p>
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Medical Information</h3>
              <div>
                <p className="text-sm text-gray-400">Medical Conditions</p>
                <p className="mt-1">{profileData?.medicalInfo?.conditions || 'None reported'}</p>
              </div>
            </div>

            {/* Physical Stats */}
            <div>
              <h3 className="text-lg font-medium mb-4">Physical Stats</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-400">Weight</p>
                  <p className="mt-1">{profileData?.stats?.weight || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Height</p>
                  <p className="mt-1">{profileData?.stats?.height || 'Not set'}</p>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div>
              <h3 className="text-lg font-medium mb-4">Preferences</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-400">Fitness Level</p>
                  <p className="mt-1">{profileData?.preferences?.fitnessLevel || 'Not Set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Activity Level</p>
                  <p className="mt-1">{profileData?.preferences?.activityLevel || 'Not Set'}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-400">Dietary Preferences</p>
                <p className="mt-1">
                  {profileData?.preferences?.dietary?.length > 0 
                    ? profileData.preferences.dietary.join(', ') 
                    : 'No dietary preferences set'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 