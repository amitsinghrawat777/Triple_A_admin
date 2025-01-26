import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { db } from '../config/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

interface Admin {
  id: string;
  email: string;
  role: string;
  addedAt: string;
}

const AdminSettings: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);

  // Fetch existing admins
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const adminsRef = collection(db, 'admins');
      const adminsSnap = await getDocs(adminsRef);
      
      const adminsList = adminsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        addedAt: doc.data().addedAt?.toDate().toLocaleDateString() || 'N/A'
      })) as Admin[];

      setAdmins(adminsList);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Add new admin
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;

    try {
      setIsAddingAdmin(true);

      // Check if admin already exists
      const adminsRef = collection(db, 'admins');
      const q = query(adminsRef, where('email', '==', newAdminEmail.trim()));
      const existingAdmin = await getDocs(q);

      if (!existingAdmin.empty) {
        toast.error('This email is already an admin');
        return;
      }

      // Add new admin
      const newAdminRef = doc(adminsRef);
      await setDoc(newAdminRef, {
        email: newAdminEmail.trim(),
        role: 'admin',
        addedAt: new Date()
      });

      toast.success('Admin added successfully');
      setNewAdminEmail('');
      fetchAdmins();
    } catch (error) {
      console.error('Error adding admin:', error);
      toast.error('Failed to add admin');
    } finally {
      setIsAddingAdmin(false);
    }
  };

  // Remove admin
  const handleRemoveAdmin = async (adminId: string, adminEmail: string) => {
    if (!window.confirm(`Are you sure you want to remove ${adminEmail} as admin?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'admins', adminId));
      toast.success('Admin removed successfully');
      fetchAdmins();
    } catch (error) {
      console.error('Error removing admin:', error);
      toast.error('Failed to remove admin');
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className={`h-8 w-48 rounded mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-300'}`} />
            <div className={`h-4 w-64 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-gray-300'}`} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className={`text-2xl font-bold leading-7 ${isDarkMode ? 'text-white' : 'text-gray-900'} sm:truncate sm:text-3xl sm:tracking-tight`}>
              Admin Settings
            </h2>
            <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Manage admin access for Triple A Admin
            </p>
          </div>
        </div>

        {/* Add Admin Form */}
        <div className={`mt-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
          <div className="px-4 py-5 sm:p-6">
            <h3 className={`text-lg font-medium leading-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Add New Admin
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Add a new admin by entering their email address.</p>
            </div>
            <form onSubmit={handleAddAdmin} className="mt-5 sm:flex sm:items-center">
              <div className="w-full sm:max-w-xs">
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className={`block w-full rounded-md border-0 py-1.5 ${
                    isDarkMode 
                      ? 'bg-gray-700 text-white placeholder-gray-400' 
                      : 'bg-white text-gray-900 placeholder-gray-400'
                  } shadow-sm ring-1 ring-inset ${
                    isDarkMode ? 'ring-gray-600' : 'ring-gray-300'
                  } focus:ring-2 focus:ring-emerald-600 sm:text-sm sm:leading-6`}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isAddingAdmin}
                className={`mt-3 inline-flex w-full items-center justify-center rounded-md px-3 py-2 sm:mt-0 sm:ml-3 sm:w-auto
                  bg-emerald-600 text-white hover:bg-emerald-500
                  disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
              >
                {isAddingAdmin ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </>
                ) : (
                  'Add Admin'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Admins List */}
        <div className={`mt-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg`}>
          <div className="px-4 py-5 sm:p-6">
            <h3 className={`text-lg font-medium leading-6 ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              Current Admins
            </h3>
            <div className="mt-4 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th scope="col" className={`py-3.5 pl-4 pr-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          Email
                        </th>
                        <th scope="col" className={`px-3 py-3.5 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          Role
                        </th>
                        <th scope="col" className={`px-3 py-3.5 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          Added On
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {admins.map((admin) => (
                        <tr key={admin.id}>
                          <td className={`whitespace-nowrap py-4 pl-4 pr-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                            {admin.email}
                          </td>
                          <td className={`whitespace-nowrap px-3 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                            {admin.role}
                          </td>
                          <td className={`whitespace-nowrap px-3 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                            {admin.addedAt}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              onClick={() => handleRemoveAdmin(admin.id, admin.email)}
                              className={`text-red-600 hover:text-red-900 ${isDarkMode ? 'hover:text-red-400' : ''}`}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings; 