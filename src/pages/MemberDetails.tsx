import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, setDoc, Timestamp, collection, query, orderBy, getDocs, where, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';
import { auth } from '../config/firebase';

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

interface MembershipPlan {
  id: string;
  name: string;
  duration: number;
  amount: number;
  features: string[];
}

interface MembershipPlans {
  [key: string]: MembershipPlan;
}

const MEMBERSHIP_PLANS: MembershipPlans = {
  MONTHLY: {
    id: 'MONTHLY',
    name: 'Monthly Plan',
    duration: 1,
    amount: 699,
    features: ['Gym access', 'Personal trainer consultation', 'Group classes']
  },
  QUARTERLY: {
    id: 'QUARTERLY', 
    name: 'Quarterly Plan',
    duration: 3,
    amount: 1999,
    features: ['All Monthly features', 'Nutrition consultation', 'Guest passes']
  },
  HALF_YEARLY: {
    id: 'HALF_YEARLY',
    name: '6 Month Plan',
    duration: 6,
    amount: 3999,
    features: ['All Quarterly features', 'Personalized workout plans', 'Unlimited guest passes']
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
      setLoading(true);
      
      // Get the selected plan details
      const selectedPlan = MEMBERSHIP_PLANS[newMembershipData.membershipType];
      if (!selectedPlan) {
        throw new Error('Invalid plan selected');
      }

      // Calculate end date based on plan duration
      const startDate = new Date(newMembershipData.startDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + selectedPlan.duration);

      // Create a new membership document
      const membershipRef = doc(collection(db, 'memberships'));
      const membershipData = {
        userId: memberId,
        plan_name: selectedPlan.name,
        plan_id: selectedPlan.id,
        amount: selectedPlan.amount,
        duration: selectedPlan.duration,
        start_date: Timestamp.fromDate(startDate),
        end_date: Timestamp.fromDate(endDate),
        is_active: true,
        created_at: Timestamp.fromDate(new Date()),
        updated_at: Timestamp.fromDate(new Date()),
        payment_status: 'completed',
        payment_method: 'admin'
      };

      await setDoc(membershipRef, membershipData);
      console.log('Membership updated successfully with end date:', endDate.toLocaleDateString());
      
      // Refresh member details and payment history
      await Promise.all([
        fetchMemberDetails(),
        fetchPaymentHistory()
      ]);

      setIsEditingMembership(false);
      toast.success('Membership updated successfully');
    } catch (error) {
      console.error('Error updating membership:', error);
      toast.error('Failed to update membership. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscontinueMembership = async () => {
    try {
      if (!memberId) {
        toast.error('Member ID is required');
        return;
      }
      
      setLoading(true);
      console.log('Finding active membership for user:', memberId);

      // Check admin status first
      const token = await auth.currentUser?.getIdTokenResult();
      if (!token?.claims?.admin) {
        toast.error('Only admin users can discontinue memberships');
        return;
      }

      // Find the latest membership
      const membershipsRef = collection(db, 'memberships');
      const q = query(
        membershipsRef,
        where('userId', '==', memberId),
        orderBy('created_at', 'desc'),
        limit(1)
      );

      const membershipSnap = await getDocs(q);
      console.log('Found memberships:', membershipSnap.size);
      
      if (membershipSnap.empty) {
        toast.error('No membership found');
        setLoading(false);
        return;
      }

      const membershipDoc = membershipSnap.docs[0];
      const membershipData = membershipDoc.data();
      
      if (!membershipData.is_active) {
        toast.error('Membership is already inactive');
        setLoading(false);
        return;
      }

      console.log('Discontinuing membership:', membershipDoc.id);
      const membershipRef = doc(db, 'memberships', membershipDoc.id);

      // Create the update data
      const updateData = {
        is_active: false,
        end_date: Timestamp.fromDate(new Date()),
        updated_at: Timestamp.fromDate(new Date())
      };

      console.log('Updating membership with data:', updateData);

      // Update the membership to inactive and set end date to today
      await updateDoc(membershipRef, updateData);

      console.log('Membership discontinued successfully');
      toast.success('Membership discontinued successfully');
      
      // Refresh member details and payment history
      await Promise.all([
        fetchMemberDetails(),
        fetchPaymentHistory()
      ]);
    } catch (error: any) {
      console.error('Error discontinuing membership:', error);
      
      // More specific error messages based on the error type
      if (error.code === 'permission-denied') {
        toast.error('You do not have permission to discontinue memberships. Please ensure you are logged in as an admin.');
      } else if (error.code === 'not-found') {
        toast.error('Membership record not found');
      } else {
        toast.error('Failed to discontinue membership. Please try again.');
      }
    } finally {
      setLoading(false);
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

  const renderMembershipForm = () => {
    if (!isEditingMembership) {
      return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                member?.membershipStatus === 'active'
                  ? 'bg-green-500'
                  : member?.membershipStatus === 'expired'
                    ? 'bg-red-500'
                    : 'bg-yellow-500'
              }`} />
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {member?.membershipType || 'No active plan'}
              </h3>
            </div>
            <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {member?.membershipStatus === 'active' 
                ? `Valid until ${member?.membershipEndDate}`
                : 'Membership expired'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setNewMembershipData({
                  membershipType: '',
                  startDate: new Date().toISOString().split('T')[0],
                  endDate: ''
                });
                setIsEditingMembership(true);
              }}
              className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md
                ${isDarkMode 
                  ? 'bg-blue-600 text-white hover:bg-blue-500' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Update Plan
            </button>
            {member?.membershipStatus === 'active' && (
              <button
                onClick={handleDiscontinueMembership}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md
                  ${isDarkMode 
                    ? 'bg-red-600 text-white hover:bg-red-500' 
                    : 'bg-red-600 text-white hover:bg-red-700'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Discontinue
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Plan Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.values(MEMBERSHIP_PLANS).map((plan) => (
            <div
              key={plan.id}
              onClick={() => setNewMembershipData(prev => ({ ...prev, membershipType: plan.id }))}
              className={`relative cursor-pointer rounded-lg p-5 transition-all transform hover:scale-105
                ${newMembershipData.membershipType === plan.id
                  ? isDarkMode 
                    ? 'bg-blue-900/30 border-2 border-blue-500 shadow-lg shadow-blue-500/20' 
                    : 'bg-blue-50 border-2 border-blue-500 shadow-lg shadow-blue-500/20'
                  : isDarkMode
                    ? 'bg-gray-800 border border-gray-700 hover:border-gray-600'
                    : 'bg-white border border-gray-200 hover:border-gray-300'
                }`}
            >
              {newMembershipData.membershipType === plan.id && (
                <div className="absolute top-3 right-3">
                  <svg className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {plan.name}
              </h3>
              <div className="mt-2">
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ₹{plan.amount}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {plan.duration} month{plan.duration > 1 ? 's' : ''}
                </p>
              </div>
              <ul className="mt-4 space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} mr-2`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Start Date */}
        <div className="max-w-xs">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Start Date
          </label>
          <input
            type="date"
            value={newMembershipData.startDate}
            onChange={(e) => setNewMembershipData(prev => ({ ...prev, startDate: e.target.value }))}
            min={new Date().toISOString().split('T')[0]}
            className={`mt-1 block w-full rounded-md shadow-sm 
              ${isDarkMode 
                ? 'bg-gray-800 border-gray-700 text-white' 
                : 'bg-white border-gray-300 text-gray-900'} 
              focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setIsEditingMembership(false)}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md
              ${isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Cancel
          </button>
          <button
            onClick={handleUpdateMembership}
            disabled={loading || !newMembershipData.membershipType || !newMembershipData.startDate}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md
              ${isDarkMode 
                ? 'bg-blue-600 text-white hover:bg-blue-500' 
                : 'bg-blue-600 text-white hover:bg-blue-700'}
              disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Confirm Update
              </>
            )}
          </button>
        </div>
      </div>
    );
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
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header with breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-4 sm:mb-8">
          <div className="flex items-center text-sm overflow-x-auto whitespace-nowrap pb-2">
            <Link to="/admin" className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>
              Dashboard
            </Link>
            <span className={`mx-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>/</span>
            <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Member Details</span>
          </div>
          <h1 className={`mt-2 text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Member Profile
          </h1>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Left Column - Profile & Personal Info */}
          <div className="lg:col-span-1 sticky top-0 lg:h-screen lg:overflow-y-auto">
            <div className={`rounded-lg shadow overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              {/* Profile Header */}
              <div className="p-4 sm:p-6">
                <div className="text-center">
                  {member.photoURL ? (
                    <img 
                      className="h-24 w-24 sm:h-32 sm:w-32 rounded-full mx-auto ring-4 ring-offset-4 ring-offset-gray-800 ring-blue-500" 
                      src={member.photoURL} 
                      alt="" 
                    />
                  ) : (
                    <div className={`h-24 w-24 sm:h-32 sm:w-32 rounded-full mx-auto flex items-center justify-center ring-4 ring-offset-4 ${
                      isDarkMode 
                        ? 'bg-gray-700 ring-offset-gray-800 ring-blue-500' 
                        : 'bg-gray-200 ring-offset-white ring-blue-500'
                    }`}>
                      <span className={`text-3xl sm:text-4xl font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <h2 className={`mt-4 text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {member.name}
                  </h2>
                  <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {member.email}
                  </p>
                  <div className="mt-3">
                    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium 
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

                {/* Quick Stats */}
                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} py-4">
                  <div className="text-center">
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Visits</p>
                    <p className={`mt-1 text-xl sm:text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {member.totalAttendance}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Last Visit</p>
                    <p className={`mt-1 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {member.lastAttendance}
                    </p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mt-6 space-y-4">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Phone</p>
                    <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{member.phone}</p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Address</p>
                    <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{member.address}</p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Emergency Contact</p>
                    <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{member.emergencyContact}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Membership & Activity */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-8">
            {/* Membership Card */}
            <div className={`rounded-lg shadow overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4 sm:mb-0`}>
                    Membership Details
                  </h3>
                </div>
                {renderMembershipForm()}
              </div>
            </div>

            {/* Payment History Card */}
            <div className={`rounded-lg shadow overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="p-4 sm:p-6">
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Payment History
                </h3>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      <thead className={isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
                        <tr>
                          <th scope="col" className={`py-3 px-3 sm:px-6 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Date</th>
                          <th scope="col" className={`py-3 px-3 sm:px-6 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Plan</th>
                          <th scope="col" className={`py-3 px-3 sm:px-6 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Amount</th>
                          <th scope="col" className={`py-3 px-3 sm:px-6 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Status</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {paymentHistory.map((payment) => (
                          <tr key={payment.id} className={`${isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                            <td className={`py-4 px-3 sm:px-6 whitespace-nowrap text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{payment.date}</td>
                            <td className={`py-4 px-3 sm:px-6 whitespace-nowrap text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{payment.plan_name}</td>
                            <td className={`py-4 px-3 sm:px-6 whitespace-nowrap text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>₹{payment.amount}</td>
                            <td className="py-4 px-3 sm:px-6 whitespace-nowrap text-xs sm:text-sm">
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
                          <tr>
                            <td colSpan={4} className={`px-3 sm:px-6 py-8 text-sm text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
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

            {/* Attendance History Card */}
            <div className={`rounded-lg shadow overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="p-4 sm:p-6">
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Recent Attendance
                </h3>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      <thead className={isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
                        <tr>
                          <th scope="col" className={`py-3 px-3 sm:px-6 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Date</th>
                          <th scope="col" className={`py-3 px-3 sm:px-6 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Check In</th>
                          <th scope="col" className={`py-3 px-3 sm:px-6 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Check Out</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {attendance.slice(0, 5).map((record) => (
                          <tr key={record.id} className={`${isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                            <td className={`py-4 px-3 sm:px-6 whitespace-nowrap text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{record.date}</td>
                            <td className={`py-4 px-3 sm:px-6 whitespace-nowrap text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{record.checkInTime}</td>
                            <td className={`py-4 px-3 sm:px-6 whitespace-nowrap text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{record.checkOutTime}</td>
                          </tr>
                        ))}
                        {attendance.length === 0 && (
                          <tr>
                            <td colSpan={3} className={`px-3 sm:px-6 py-8 text-sm text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              No attendance records available
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
        </div>
      </div>
    </div>
  );
};

export default MemberDetails; 