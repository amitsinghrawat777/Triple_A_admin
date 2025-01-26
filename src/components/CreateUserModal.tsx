import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { db } from '../config/firebase';
import { doc, setDoc, Timestamp, collection } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    contact: '',
    gender: '',
    date_of_birth: '',
    address: '',
    emergency_contact: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      // Generate a unique ID for the user
      const userId = doc(collection(db, 'profiles')).id;

      // Create user profile
      const profileRef = doc(db, 'profiles', userId);
      await setDoc(profileRef, {
        username: formData.username,
        email: formData.email,
        createdAt: Timestamp.fromDate(new Date()),
        personal_info: {
          contact: formData.contact,
          gender: formData.gender,
          date_of_birth: formData.date_of_birth
        },
        address: formData.address,
        emergencyContact: formData.emergency_contact
      });

      toast.success('User created successfully');
      onSuccess();
      onClose();
      setFormData({
        username: '',
        email: '',
        contact: '',
        gender: '',
        date_of_birth: '',
        address: '',
        emergency_contact: ''
      });
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className={`relative transform overflow-hidden rounded-xl ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } px-4 pb-4 pt-5 text-left shadow-2xl transition-all w-full max-w-2xl mx-auto`}>
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              onClick={onClose}
              className={`rounded-lg p-2 inline-flex items-center justify-center ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100'
              }`}
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <div className="flex items-center mb-6">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-emerald-900' : 'bg-emerald-100'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${
                    isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                  }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className={`text-xl font-semibold leading-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Create New Member
                  </h3>
                  <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Fill in the member details below
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-8">
                {/* Personal Information Section */}
                <div>
                  <h4 className={`text-sm font-medium mb-4 pb-2 border-b ${
                    isDarkMode ? 'text-gray-300 border-gray-700' : 'text-gray-900 border-gray-200'
                  }`}>Personal Information</h4>
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="username" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Full Name
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="text"
                          id="username"
                          required
                          value={formData.username}
                          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                          className={`block w-full rounded-md border-0 py-1.5 ${
                            isDarkMode 
                              ? 'bg-gray-700 text-white placeholder-gray-400' 
                              : 'bg-white text-gray-900 placeholder-gray-400'
                          } shadow-sm ring-1 ring-inset ${
                            isDarkMode ? 'ring-gray-600' : 'ring-gray-300'
                          } focus:ring-2 focus:ring-emerald-600 sm:text-sm sm:leading-6`}
                          placeholder="Enter full name"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Email
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="email"
                          id="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className={`block w-full rounded-md border-0 py-1.5 ${
                            isDarkMode 
                              ? 'bg-gray-700 text-white placeholder-gray-400' 
                              : 'bg-white text-gray-900 placeholder-gray-400'
                          } shadow-sm ring-1 ring-inset ${
                            isDarkMode ? 'ring-gray-600' : 'ring-gray-300'
                          } focus:ring-2 focus:ring-emerald-600 sm:text-sm sm:leading-6`}
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="contact" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Contact Number
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="tel"
                          id="contact"
                          required
                          value={formData.contact}
                          onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                          className={`block w-full rounded-md border-0 py-1.5 ${
                            isDarkMode 
                              ? 'bg-gray-700 text-white placeholder-gray-400' 
                              : 'bg-white text-gray-900 placeholder-gray-400'
                          } shadow-sm ring-1 ring-inset ${
                            isDarkMode ? 'ring-gray-600' : 'ring-gray-300'
                          } focus:ring-2 focus:ring-emerald-600 sm:text-sm sm:leading-6`}
                          placeholder="Enter contact number"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="gender" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Gender
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <select
                          id="gender"
                          required
                          value={formData.gender}
                          onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                          className={`block w-full rounded-md border-0 py-1.5 ${
                            isDarkMode 
                              ? 'bg-gray-700 text-white' 
                              : 'bg-white text-gray-900'
                          } shadow-sm ring-1 ring-inset ${
                            isDarkMode ? 'ring-gray-600' : 'ring-gray-300'
                          } focus:ring-2 focus:ring-emerald-600 sm:text-sm sm:leading-6`}
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="date_of_birth" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Date of Birth
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="date"
                          id="date_of_birth"
                          required
                          value={formData.date_of_birth}
                          onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                          className={`block w-full rounded-md border-0 py-1.5 ${
                            isDarkMode 
                              ? 'bg-gray-700 text-white' 
                              : 'bg-white text-gray-900'
                          } shadow-sm ring-1 ring-inset ${
                            isDarkMode ? 'ring-gray-600' : 'ring-gray-300'
                          } focus:ring-2 focus:ring-emerald-600 sm:text-sm sm:leading-6`}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="emergency_contact" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Emergency Contact
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="tel"
                          id="emergency_contact"
                          required
                          value={formData.emergency_contact}
                          onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact: e.target.value }))}
                          className={`block w-full rounded-md border-0 py-1.5 ${
                            isDarkMode 
                              ? 'bg-gray-700 text-white placeholder-gray-400' 
                              : 'bg-white text-gray-900 placeholder-gray-400'
                          } shadow-sm ring-1 ring-inset ${
                            isDarkMode ? 'ring-gray-600' : 'ring-gray-300'
                          } focus:ring-2 focus:ring-emerald-600 sm:text-sm sm:leading-6`}
                          placeholder="Enter emergency contact"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div>
                  <h4 className={`text-sm font-medium mb-4 pb-2 border-b ${
                    isDarkMode ? 'text-gray-300 border-gray-700' : 'text-gray-900 border-gray-200'
                  }`}>Address Information</h4>
                  <div>
                    <label htmlFor="address" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Address
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="address"
                        required
                        rows={3}
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        className={`block w-full rounded-md border-0 py-1.5 ${
                          isDarkMode 
                            ? 'bg-gray-700 text-white placeholder-gray-400' 
                            : 'bg-white text-gray-900 placeholder-gray-400'
                        } shadow-sm ring-1 ring-inset ${
                          isDarkMode ? 'ring-gray-600' : 'ring-gray-300'
                        } focus:ring-2 focus:ring-emerald-600 sm:text-sm sm:leading-6`}
                        placeholder="Enter complete address"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3 border-t pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md
                      bg-emerald-600 text-white hover:bg-emerald-500
                      disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Member
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUserModal; 