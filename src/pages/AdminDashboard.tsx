import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, doc, getDoc, query, orderBy, where, Timestamp, limit, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { DocumentData } from 'firebase/firestore';

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-500">Manage your members and view statistics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-700">Active Members</h2>
                <p className="text-4xl font-bold text-emerald-600 mt-2">{stats.active}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-700">Expired Memberships</h2>
                <p className="text-4xl font-bold text-red-600 mt-2">{stats.expired}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-700">Pending Members</h2>
                <p className="text-4xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search members by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                />
              </div>
              <button 
                onClick={() => fetchMembers()}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Name</span>
                      {sortField === 'name' && (
                        <svg className={`w-4 h-4 ${sortDirection === 'asc' ? '' : 'transform rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membership</th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('membershipStatus')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      {sortField === 'membershipStatus' && (
                        <svg className={`w-4 h-4 ${sortDirection === 'asc' ? '' : 'transform rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {member.photoURL ? (
                            <img 
                              src={member.photoURL} 
                              alt={member.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                              <span className="text-lg font-medium text-emerald-700">
                                {member.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          {member.displayName && member.displayName !== member.name && (
                            <div className="text-sm text-gray-500">{member.displayName}</div>
                          )}
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.phone}</div>
                      <div className="text-sm text-gray-500">Joined: {member.joinDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.membershipType}</div>
                      <div className="text-sm text-gray-500">
                        {member.membershipEndDate !== 'N/A' ? `Expires: ${member.membershipEndDate}` : 'No active plan'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${member.membershipStatus === 'active' ? 'bg-green-100 text-green-800' : 
                          member.membershipStatus === 'expired' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {member.membershipStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Total: {member.totalAttendance}</div>
                      <div className="text-sm text-gray-500">Last: {member.lastAttendance}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link 
                        to={`/admin/members/${member.id}`}
                        className="text-emerald-600 hover:text-emerald-900 transition-colors"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, filteredAndSortedMembers.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredAndSortedMembers.length}</span> results
                </p>
              </div>
              <div className="flex justify-end">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 