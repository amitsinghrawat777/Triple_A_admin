import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, setDoc, Timestamp, collection, query, orderBy, getDocs, where, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useTheme } from '../context/ThemeContext';

interface MemberDetails {
  id: string;
  name: string;
  displayName?: string;
  photoURL?: string;
  email: string;
  phone: string;
  joinDate: string;
  membershipStatus: string;
  membershipType: string;
  membershipStartDate: string;
  membershipEndDate: string;
  lastAttendance: string;
  totalAttendance: number;
  address?: string;
  emergencyContact?: string;
  notes?: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  checkInTime: string;
  checkOutTime: string;
}

interface PaymentHistory {
  id: string;
  amount: number;
  date: string;
  plan_name: string;
  payment_status: string;
  payment_method?: string;
}

interface PersonalInfo {
  contact: string;
  date_of_birth: string;
  gender: string;
  blood_type: string;
  height: number;
  weight: number;
}

// Add membership plan constants
const MEMBERSHIP_PLANS = {
  MONTHLY: {
    id: 'monthly',
    name: 'Monthly Plan',
    duration: 1, // months
    amount: 699,
    features: [
      'Access to all gym equipment',
      'Personal trainer consultation',
      'Group fitness classes',
      'Locker room access',
      'Fitness assessment'
    ]
  },
  QUARTERLY: {
    id: 'quarterly',
    name: 'Quarterly Plan',
    duration: 3, // months
    amount: 1999,
    features: [
      'All Monthly Plan features',
      'Nutrition consultation',
      'Progress tracking',
      'Priority booking for classes',
      'Guest passes (2)'
    ]
  },
  HALF_YEARLY: {
    id: '6month',
    name: '6 Month Plan',
    duration: 6, // months
    amount: 3999,
    features: [
      'All Quarterly Plan features',
      'Personalized workout plans',
      'Monthly body composition analysis',
      'Premium app features',
      'Unlimited guest passes'
    ]
  }
};

const MemberDetails: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<MemberDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isEditingMembership, setIsEditingMembership] = useState(false);
  const [newMembershipData, setNewMembershipData] = useState({
    membershipType: '',
    startDate: '',
    endDate: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    contact: '',
    date_of_birth: '',
    gender: '',
    blood_type: '',
    height: 0,
    weight: 0
  });

  const [editableInfo, setEditableInfo] = useState<PersonalInfo>({
    contact: '',
    date_of_birth: '',
    gender: '',
    blood_type: '',
    height: 0,
    weight: 0
  });

  useEffect(() => {
    fetchMemberDetails();
    fetchAttendanceHistory();
    fetchPaymentHistory();
  }, [memberId]);

  const fetchMemberDetails = async () => {
    try {
      if (!memberId) return;

      setLoading(true);
      setError(null);

      // Fetch profile data
      const profileRef = doc(db, 'profiles', memberId);
      const profileSnap = await getDoc(profileRef);

      if (!profileSnap.exists()) {
        setError('Member not found');
        return;
      }

      const profileData = profileSnap.data();
      console.log('Profile data:', profileData);

      // Get photoURL from profile data
      const photoURL = profileData.photoURL || 
        (profileData.personal_info && profileData.personal_info.photoURL) || 
        null;

      // Fetch latest membership data
      const membershipsRef = collection(db, 'memberships');
      const membershipQuery = query(
        membershipsRef,
        where('userId', '==', memberId),
        orderBy('created_at', 'desc'),
        limit(1)
      );
      const membershipSnap = await getDocs(membershipQuery);
      const membershipData = !membershipSnap.empty ? membershipSnap.docs[0].data() : null;
      console.log('Latest membership data:', membershipData);

      // Calculate membership status
      let membershipStatus = 'pending';
      let startDate = 'N/A';
      let endDate = 'N/A';
      let membershipType = 'N/A';

      if (membershipData) {
        membershipType = membershipData.plan_name || 'N/A';
        membershipStatus = membershipData.is_active ? 'active' : 'expired';
        
        if (membershipData.start_date) {
          const startDateTime = membershipData.start_date instanceof Timestamp 
            ? membershipData.start_date.toDate() 
            : new Date(membershipData.start_date);
          
          startDate = startDateTime.toLocaleDateString();
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

      // Fetch attendance data
      const attendanceRef = collection(db, 'attendance');
      const q = query(attendanceRef, where('userId', '==', memberId), orderBy('date', 'desc'), limit(1));
      const attendanceSnap = await getDocs(q);
      let lastAttendance = 'Never';
      let totalAttendance = 0;

      if (!attendanceSnap.empty) {
        const lastRecord = attendanceSnap.docs[0].data();
        lastAttendance = lastRecord.date instanceof Timestamp 
          ? lastRecord.date.toDate().toLocaleDateString()
          : new Date(lastRecord.date).toLocaleDateString();
        totalAttendance = attendanceSnap.size;
      }

      const memberDetails: MemberDetails = {
        id: memberId,
        name: profileData.username || 'N/A',
        displayName: profileData.username || 'N/A',
        photoURL: photoURL,
        email: profileData.email || 'N/A',
        phone: profileData.personal_info?.contact || 'N/A',
        joinDate: profileData.createdAt instanceof Timestamp 
          ? profileData.createdAt.toDate().toLocaleDateString()
          : new Date(profileData.createdAt || Date.now()).toLocaleDateString(),
        membershipStatus,
        membershipType,
        membershipStartDate: startDate,
        membershipEndDate: endDate,
        lastAttendance,
        totalAttendance,
        address: profileData.address || 'N/A',
        emergencyContact: profileData.emergencyContact || 'N/A',
        notes: profileData.notes || 'N/A'
      };

      console.log('Setting member details with photo:', memberDetails);
      setMember(memberDetails);

      // Fetch personal info
      const info = profileData.personal_info || {};
      const personalInfoData = {
        contact: info.contact || '',
        date_of_birth: info.date_of_birth || '',
        gender: info.gender || '',
        blood_type: info.blood_type || '',
        height: info.height || 0,
        weight: info.weight || 0
      };
      setPersonalInfo(personalInfoData);
      setEditableInfo(personalInfoData);

    } catch (error) {
      console.error('Error fetching member details:', error);
      setError('Failed to fetch member details');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      if (!memberId) return;

      const attendanceRef = collection(db, 'attendance');
      const q = query(
        attendanceRef,
        where('userId', '==', memberId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const attendanceRecords: AttendanceRecord[] = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        attendanceRecords.push({
          id: doc.id,
          date: data.date instanceof Timestamp 
            ? data.date.toDate().toLocaleDateString()
            : new Date(data.date).toLocaleDateString(),
          checkInTime: data.checkInTime || 'N/A',
          checkOutTime: data.checkOutTime || 'N/A'
        });
      });

      console.log('Attendance records:', attendanceRecords);
      setAttendance(attendanceRecords);

      // Update member's last attendance and total if needed
      if (member && attendanceRecords.length > 0) {
        setMember(prev => prev ? {
          ...prev,
          lastAttendance: attendanceRecords[0].date,
          totalAttendance: attendanceRecords.length
        } : null);
      }
    } catch (error) {
      console.error('Error fetching attendance history:', error);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const paymentsRef = collection(db, 'memberships');
      const q = query(
        paymentsRef,
        where('userId', '==', memberId),
        orderBy('created_at', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const payments: PaymentHistory[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        payments.push({
          id: doc.id,
          amount: data.amount || 0,
          date: data.created_at instanceof Timestamp 
            ? data.created_at.toDate().toLocaleDateString()
            : new Date(data.created_at).toLocaleDateString(),
          plan_name: data.plan_name || 'N/A',
          payment_status: data.payment_status || 'N/A',
          payment_method: data.payment_method || 'N/A'
        });
      });
      
      setPaymentHistory(payments);
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
  };

  const handleUpdateMembership = async () => {
    try {
      if (!memberId || !newMembershipData.membershipType || !newMembershipData.startDate) {
        setError('Please select a plan and start date');
        return;
      }

      const selectedPlan = Object.values(MEMBERSHIP_PLANS).find(
        plan => plan.id === newMembershipData.membershipType
      );

      if (!selectedPlan) {
        setError('Invalid plan selected');
        return;
      }

      const startDate = new Date(newMembershipData.startDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + selectedPlan.duration);

      // Create a new document reference with auto-generated ID
      const membershipRef = doc(collection(db, 'memberships'));
      
      const membershipData = {
        userId: memberId,
        plan_id: selectedPlan.id,
        plan_name: selectedPlan.name,
        amount: selectedPlan.amount,
        start_date: Timestamp.fromDate(startDate),
        end_date: Timestamp.fromDate(endDate),
        features: selectedPlan.features,
        is_active: true,
        payment_status: 'completed',
        created_at: Timestamp.fromDate(new Date()),
        updated_at: Timestamp.fromDate(new Date())
      };

      // Save the membership document
      await setDoc(membershipRef, membershipData);

      // Refresh the data
      setIsEditingMembership(false);
      await Promise.all([
        fetchMemberDetails(),
        fetchPaymentHistory()
      ]);

      // Show success message or handle UI updates
      console.log('Membership updated successfully:', membershipData);
    } catch (error) {
      console.error('Error updating membership:', error);
      setError('Failed to update membership. Please try again.');
    }
  };

  const handleDiscontinueMembership = async () => {
    try {
      if (!memberId) return;

      // Get the latest active membership
      const membershipsRef = collection(db, 'memberships');
      const membershipQuery = query(
        membershipsRef,
        where('userId', '==', memberId),
        where('is_active', '==', true),
        orderBy('created_at', 'desc'),
        limit(1)
      );

      const membershipSnap = await getDocs(membershipQuery);
      
      if (membershipSnap.empty) {
        setError('No active membership found');
        return;
      }

      // Update the membership document
      const membershipDoc = membershipSnap.docs[0];
      await updateDoc(doc(db, 'memberships', membershipDoc.id), {
        is_active: false,
        end_date: Timestamp.fromDate(new Date()),
        updated_at: Timestamp.fromDate(new Date())
      });

      // Refresh the data
      await Promise.all([
        fetchMemberDetails(),
        fetchPaymentHistory()
      ]);

      console.log('Membership discontinued successfully');
    } catch (error) {
      console.error('Error discontinuing membership:', error);
      setError('Failed to discontinue membership. Please try again.');
    }
  };

  const formatDateForInput = (dateStr: string): string => {
    if (dateStr === 'N/A') return '';
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  };

  const handleSavePersonalInfo = async () => {
    try {
      const profileRef = doc(db, 'profiles', memberId!);
      await updateDoc(profileRef, {
        'personal_info': {
          contact: editableInfo.contact,
          date_of_birth: editableInfo.date_of_birth,
          gender: editableInfo.gender,
          blood_type: editableInfo.blood_type,
          height: Number(editableInfo.height),
          weight: Number(editableInfo.weight)
        }
      });
      
      setPersonalInfo(editableInfo);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating personal info:', error);
      setError('Failed to update personal information');
    }
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg shadow-lg`}>
          <div className="text-red-500 text-lg font-medium mb-2">Error</div>
          <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{error}</div>
          <button 
            onClick={() => fetchMemberDetails()}
            className={`mt-4 px-4 py-2 ${
              isDarkMode 
                ? 'bg-indigo-500 hover:bg-indigo-400' 
                : 'bg-indigo-600 hover:bg-indigo-500'
            } text-white rounded-lg transition-colors`}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!member) return null;

  return (
    <div className={`px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Member Details
          </h1>
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            View and manage member information
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/admin"
            className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm 
              ${isDarkMode 
                ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Member Profile Section */}
      <div className={`mt-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg`}>
        <div className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {member.photoURL ? (
                <img className="h-24 w-24 rounded-full" src={member.photoURL} alt="" />
              ) : (
                <div className={`h-24 w-24 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <span className={`text-3xl font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="ml-6">
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {member.name}
              </h2>
              <div className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {member.email}
              </div>
              <div className="mt-2">
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
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="mt-8">
            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Personal Information
            </h3>
            <div className={`mt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <dl className="divide-y divide-gray-200">
                <div className={`py-4 ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  <dt className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Phone</dt>
                  <dd className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{member.phone}</dd>
                </div>
                <div className={`py-4 ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  <dt className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Join Date</dt>
                  <dd className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{member.joinDate}</dd>
                </div>
                <div className={`py-4 ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  <dt className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Address</dt>
                  <dd className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{member.address}</dd>
                </div>
                <div className={`py-4 ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  <dt className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Emergency Contact</dt>
                  <dd className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{member.emergencyContact}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Membership Information */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Membership Details
              </h3>
              <button
                onClick={() => setIsEditingMembership(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium
                  ${isDarkMode
                    ? 'bg-indigo-500 text-white hover:bg-indigo-400'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                  }`}
              >
                Update Membership
              </button>
            </div>
            <div className={`mt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <dl className="divide-y divide-gray-200">
                <div className={`py-4 ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  <dt className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Plan</dt>
                  <dd className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{member.membershipType}</dd>
                </div>
                <div className={`py-4 ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  <dt className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Start Date</dt>
                  <dd className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{member.membershipStartDate}</dd>
                </div>
                <div className={`py-4 ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  <dt className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>End Date</dt>
                  <dd className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{member.membershipEndDate}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Attendance Information */}
          <div className="mt-8">
            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Attendance History
            </h3>
            <div className={`mt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <dl className="divide-y divide-gray-200">
                <div className={`py-4 ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  <dt className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Visits</dt>
                  <dd className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{member.totalAttendance}</dd>
                </div>
                <div className={`py-4 ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  <dt className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Last Visit</dt>
                  <dd className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{member.lastAttendance}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Payment History */}
          <div className="mt-8">
            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Payment History
            </h3>
            <div className="mt-4 overflow-hidden">
              <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Date</th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Plan</th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Amount</th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Status</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {paymentHistory.map((payment) => (
                    <tr key={payment.id} className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{payment.date}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{payment.plan_name}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>₹{payment.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 
                          ${payment.payment_status === 'completed'
                            ? isDarkMode 
                              ? 'bg-green-900 text-green-300'
                              : 'bg-green-100 text-green-800'
                            : isDarkMode
                              ? 'bg-yellow-900 text-yellow-300'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {payment.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {paymentHistory.length === 0 && (
                    <tr className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
                      <td colSpan={4} className={`px-6 py-4 text-sm text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        No payment history available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDetails; 