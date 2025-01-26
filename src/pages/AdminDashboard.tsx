import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, doc, getDoc, query, orderBy, where, Timestamp, limit, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { DocumentData } from 'firebase/firestore';
import { useTheme } from '../context/ThemeContext';

interface Member {
  id: string;
  name: string;
  displayName?: string;
  photoURL?: string | null;
  email: string;
  phone: string;
  joinDate: string;
  membershipStatus: string;
  membershipType: string;
  membershipStartDate: string;
  membershipEndDate: string;
  lastAttendance: string;
  totalAttendance: number;
}

interface MemberStats {
  active: number;
  expired: number;
  pending: number;
}

type SortField = 'name' | 'joinDate' | 'membershipEndDate' | 'membershipStatus';
type SortDirection = 'asc' | 'desc';

interface ProfileData {
  username?: string;
  photoURL?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  createdAt: Timestamp | Date;
  personal_info?: {
    contact?: string;
    date_of_birth?: string;
    gender?: string;
    photoURL?: string;
  };
  medical_info?: {
    conditions?: string;
  };
  stats?: {
    activity_level?: string;
    bmi?: string;
  };
}

interface MembershipData {
  amount?: number;
  created_at: Timestamp;
  end_date: Timestamp;
  features?: string[];
  is_active: boolean;
  payment_status?: string;
  plan_id?: string;
  plan_name?: string;
  start_date: Timestamp;
  status: string;
  updated_at: Timestamp;
  userId: string;
}

interface AttendanceData {
  userId: string;
  date: Timestamp | Date;
  checkInTime?: string;
  checkOutTime?: string;
}

const AdminDashboard: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [stats, setStats] = useState<MemberStats>({
    active: 0,
    expired: 0,
    pending: 0
  });

  const fetchMembershipData = async (userId: string) => {
    try {
      const membershipRef = doc(db, 'memberships', userId);
      const membershipSnap = await getDoc(membershipRef);

      if (membershipSnap.exists()) {
        const data = membershipSnap.data();
        let status = 'pending';
        
        if (data.endDate) {
          const endDate = data.endDate instanceof Timestamp 
            ? data.endDate.toDate() 
            : new Date(data.endDate);
            
          status = endDate < new Date() ? 'expired' : 'active';
        }

        return {
          membershipStatus: status,
          membershipType: data.plan || data.membershipType || 'N/A',
          membershipStartDate: data.startDate instanceof Timestamp 
            ? data.startDate.toDate().toLocaleDateString() 
            : new Date(data.startDate || Date.now()).toLocaleDateString(),
          membershipEndDate: data.endDate instanceof Timestamp 
            ? data.endDate.toDate().toLocaleDateString() 
            : data.endDate ? new Date(data.endDate).toLocaleDateString() : 'N/A'
        };
      }
      return null;
    } catch (error) {
      console.error(`Error fetching membership for ${userId}:`, error);
      return null;
    }
  };

  const fetchAttendanceData = async (userId: string) => {
    try {
      const attendanceRef = collection(db, 'attendance');
      const q = query(attendanceRef, where('userId', '==', userId), orderBy('date', 'desc'));
      const attendanceSnap = await getDocs(q);
      
      let totalAttendance = 0;
      let lastAttendance = 'Never';
      
      attendanceSnap.forEach(doc => {
        const data = doc.data();
        totalAttendance++;
        if (lastAttendance === 'Never') {
          lastAttendance = data.date instanceof Timestamp 
            ? data.date.toDate().toLocaleDateString()
            : new Date(data.date).toLocaleDateString();
        }
      });

      return {
        lastAttendance,
        totalAttendance
      };
    } catch (error) {
      console.error(`Error fetching attendance for ${userId}:`, error);
      return {
        lastAttendance: 'Error',
        totalAttendance: 0
      };
    }
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);

      let activeCount = 0;
      let expiredCount = 0;
      let pendingCount = 0;
      const membersData: Member[] = [];

      console.log("Fetching user profiles...");
      const profilesRef = collection(db, 'profiles');
      const profilesSnap = await getDocs(profilesRef);
      
      console.log("Query response:", {
        empty: profilesSnap.empty,
        size: profilesSnap.size
      });

      for (const docSnapshot of profilesSnap.docs) {
        const profileData = docSnapshot.data() as ProfileData;
        console.log("Processing profile:", docSnapshot.id, profileData);

        // Fetch membership data
        const membershipRef = doc(db, 'memberships', docSnapshot.id);
        const membershipSnap = await getDoc(membershipRef);
        const membershipData = membershipSnap.exists() ? membershipSnap.data() as MembershipData : null;

        // Calculate membership status
        let membershipStatus = 'pending';
        let startDate = 'N/A';
        let endDate = 'N/A';
        let membershipType = 'N/A';

        if (membershipData) {
          membershipType = membershipData.plan_name || 'N/A';
          membershipStatus = membershipData.status || 'pending';
          
          if (membershipData.start_date) {
            startDate = membershipData.start_date instanceof Timestamp 
              ? membershipData.start_date.toDate().toLocaleDateString()
              : new Date(membershipData.start_date).toLocaleDateString();
          }

          if (membershipData.end_date) {
            const endDateTime = membershipData.end_date instanceof Timestamp 
              ? membershipData.end_date.toDate() 
              : new Date(membershipData.end_date);
            
            endDate = endDateTime.toLocaleDateString();
            
            // Update status based on end date and is_active flag
            if (!membershipData.is_active || endDateTime < new Date()) {
              membershipStatus = 'expired';
            } else {
              membershipStatus = 'active';
            }
          }
        }

        // Fetch attendance data with proper error handling
        let lastAttendance = 'N/A';
        let totalAttendance = 0;

        try {
          const attendanceRef = collection(db, 'attendance');
          const q = query(
            attendanceRef,
            where('userId', '==', docSnapshot.id),
            orderBy('date', 'desc'),
            limit(1)
          );
          const attendanceSnap = await getDocs(q);

          if (!attendanceSnap.empty) {
            const lastRecord = attendanceSnap.docs[0].data() as AttendanceData;
            lastAttendance = lastRecord.date instanceof Timestamp 
              ? lastRecord.date.toDate().toLocaleDateString()
              : new Date(lastRecord.date).toLocaleDateString();
            
            // Get total attendance count
            const totalQ = query(
              attendanceRef,
              where('userId', '==', docSnapshot.id)
            );
            const totalSnap = await getDocs(totalQ);
            totalAttendance = totalSnap.size;
          }
        } catch (error) {
          console.error(`Error fetching attendance for ${docSnapshot.id}:`, error);
          lastAttendance = 'Error';
          totalAttendance = 0;
        }

        const member: Member = {
          id: docSnapshot.id,
          name: profileData.username || 'N/A',
          displayName: profileData.username || 'N/A',
          photoURL: profileData.photoURL || 
            (profileData.personal_info && profileData.personal_info.photoURL) || 
            null,
          email: profileData.email || 'N/A',
          phone: profileData.personal_info?.contact || 'N/A',
          joinDate: profileData.createdAt instanceof Timestamp 
            ? profileData.createdAt.toDate().toLocaleDateString()
            : profileData.createdAt 
              ? new Date(profileData.createdAt).toLocaleDateString()
              : 'N/A',
          membershipStatus,
          membershipType,
          membershipStartDate: startDate,
          membershipEndDate: endDate,
          lastAttendance,
          totalAttendance
        };
        
        membersData.push(member);
        
        // Update stats based on membership status
        switch (membershipStatus) {
          case 'active':
            activeCount++;
            break;
          case 'expired':
            expiredCount++;
            break;
          default:
            pendingCount++;
        }
      }

      setMembers(membersData);
      setStats({
        active: activeCount,
        expired: expiredCount,
        pending: pendingCount
      });
      
      console.log("Fetched members:", {
        total: membersData.length,
        active: activeCount,
        expired: expiredCount,
        pending: pendingCount
      });

    } catch (error) {
      console.error("Error fetching members:", error);
      setError("Failed to fetch members. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleSort = (field: SortField) => {
    setSortDirection(prev => 
      sortField === field ? (prev === 'asc' ? 'desc' : 'asc') : 'asc'
    );
    setSortField(field);
  };

  const filteredAndSortedMembers = useMemo(() => {
    return members
      .filter(member => 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const aValue = String(a[sortField]).toLowerCase();
        const bValue = String(b[sortField]).toLowerCase();
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });
  }, [members, searchTerm, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedMembers.length / itemsPerPage);

  const paginatedMembers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedMembers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedMembers, currentPage, itemsPerPage]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="text-red-500 text-lg font-medium mb-2">Error</div>
          <div className="text-gray-600">{error}</div>
          <button 
            onClick={() => fetchMembers()}
            className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Admin Dashboard
          </h1>
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
            Manage your members and view statistics
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Active Members Card */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden shadow rounded-lg`}>
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`h-12 w-12 rounded-md flex items-center justify-center ${isDarkMode ? 'bg-green-900' : 'bg-green-100'}`}>
                  <svg className={`h-6 w-6 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className={`text-sm font-medium truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active Members</dt>
                  <dd className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.active}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Expired Memberships Card */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden shadow rounded-lg`}>
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`h-12 w-12 rounded-md flex items-center justify-center ${isDarkMode ? 'bg-red-900' : 'bg-red-100'}`}>
                  <svg className={`h-6 w-6 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className={`text-sm font-medium truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Expired Memberships</dt>
                  <dd className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.expired}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Members Card */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden shadow rounded-lg`}>
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`h-12 w-12 rounded-md flex items-center justify-center ${isDarkMode ? 'bg-yellow-900' : 'bg-yellow-100'}`}>
                  <svg className={`h-6 w-6 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className={`text-sm font-medium truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pending Members</dt>
                  <dd className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.pending}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Table Section */}
      <div className={`mt-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg`}>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="sm:flex sm:items-center">
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search members by name, email, or phone..."
                  className={`block w-full rounded-md border-0 py-1.5 pr-10 ring-1 ring-inset 
                    ${isDarkMode 
                      ? 'bg-gray-700 text-white placeholder-gray-400 ring-gray-600 focus:ring-indigo-500' 
                      : 'bg-white text-gray-900 placeholder-gray-400 ring-gray-300 focus:ring-indigo-600'
                    } focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`}
                />
              </div>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-4">
              <button
                onClick={() => window.location.reload()}
                className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm 
                  ${isDarkMode 
                    ? 'bg-indigo-500 text-white hover:bg-indigo-400' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                  }`}
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th scope="col" className={`py-3.5 pl-4 pr-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        NAME
                      </th>
                      <th scope="col" className={`px-3 py-3.5 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        CONTACT
                      </th>
                      <th scope="col" className={`px-3 py-3.5 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        MEMBERSHIP
                      </th>
                      <th scope="col" className={`px-3 py-3.5 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        STATUS
                      </th>
                      <th scope="col" className={`px-3 py-3.5 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        ATTENDANCE
                      </th>
                      <th scope="col" className={`relative py-3.5 pl-3 pr-4 sm:pr-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {members.map((member) => (
                      <tr key={member.id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                        <td className={`whitespace-nowrap py-4 pl-4 pr-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {member.photoURL ? (
                                <img className="h-10 w-10 rounded-full" src={member.photoURL} alt="" />
                              ) : (
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                                  <span className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {member.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{member.name}</div>
                              <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className={`whitespace-nowrap px-3 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          <div>{member.phone}</div>
                          <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Joined: {member.joinDate}</div>
                        </td>
                        <td className={`whitespace-nowrap px-3 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          <div>{member.membershipType}</div>
                          <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {member.membershipEndDate}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 
                            ${member.membershipStatus === 'active'
                              ? isDarkMode 
                                ? 'bg-green-900 text-green-300'
                                : 'bg-green-100 text-green-800'
                              : member.membershipStatus === 'expired'
                                ? isDarkMode
                                  ? 'bg-red-900 text-red-300'
                                  : 'bg-red-100 text-red-800'
                                : isDarkMode
                                  ? 'bg-yellow-900 text-yellow-300'
                                  : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {member.membershipStatus}
                          </span>
                        </td>
                        <td className={`whitespace-nowrap px-3 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          <div>Total: {member.totalAttendance}</div>
                          <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Last: {member.lastAttendance}</div>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <Link
                            to={`/admin/members/${member.id}`}
                            className={`text-indigo-600 hover:text-indigo-900 ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : ''}`}
                          >
                            View Details
                          </Link>
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
  );
};

export default AdminDashboard; 