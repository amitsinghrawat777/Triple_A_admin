import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, setDoc, Timestamp, collection, query, orderBy, getDocs, where, limit } from 'firebase/firestore';
import { db } from '../config/firebase';

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
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="text-red-500 text-lg font-medium mb-2">Error</div>
          <div className="text-gray-600">{error || 'Member not found'}</div>
          <button 
            onClick={() => navigate('/admin')}
            className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Member Details</h1>
              <p className="text-gray-500">View and manage member information</p>
            </div>
            <Link
              to="/admin"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
            <div className="flex items-start space-x-4 mb-6">
              <div className="flex-shrink-0">
                {member.photoURL ? (
                  <img 
                    src={member.photoURL} 
                    alt={member.name}
                    className="h-24 w-24 rounded-full object-cover border-2 border-emerald-500"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-emerald-500">
                    <span className="text-2xl font-bold text-emerald-700">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
                  {member.displayName && member.displayName !== member.name && (
                    <p className="text-sm text-gray-500">Also known as: {member.displayName}</p>
                  )}
                </div>
                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                  ${member.membershipStatus === 'active' ? 'bg-green-100 text-green-800' : 
                    member.membershipStatus === 'expired' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'}">
                  {member.membershipStatus}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{member.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-gray-900">{member.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Address</label>
                <p className="text-gray-900">{member.address}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Emergency Contact</label>
                <p className="text-gray-900">{member.emergencyContact}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Join Date</label>
                <p className="text-gray-900">{member.joinDate}</p>
              </div>
            </div>
          </div>

          {/* Membership Information */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Membership Details</h2>
              <div className="space-x-2">
                <button
                  onClick={() => {
                    setNewMembershipData({
                      membershipType: member.membershipType === 'N/A' ? '' : member.membershipType,
                      startDate: formatDateForInput(member.membershipStartDate),
                      endDate: formatDateForInput(member.membershipEndDate)
                    });
                    setIsEditingMembership(true);
                  }}
                  className="px-3 py-1 text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  Edit
                </button>
                {member.membershipStatus === 'active' && (
                  <button
                    onClick={handleDiscontinueMembership}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-700 transition-colors"
                  >
                    Discontinue
                  </button>
                )}
              </div>
            </div>
            
            {isEditingMembership ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Select Plan</label>
                  <div className="grid grid-cols-1 gap-4">
                    {Object.values(MEMBERSHIP_PLANS).map((plan) => (
                      <div 
                        key={plan.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          newMembershipData.membershipType === plan.id
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-emerald-300'
                        }`}
                        onClick={() => setNewMembershipData(prev => ({
                          ...prev,
                          membershipType: plan.id,
                          amount: plan.amount
                        }))}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium text-gray-900">{plan.name}</h3>
                          <span className="text-emerald-600 font-semibold">₹{plan.amount}</span>
                        </div>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center">
                              <svg className="w-4 h-4 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Start Date</label>
                  <input
                    type="date"
                    value={newMembershipData.startDate}
                    onChange={(e) => {
                      const startDate = new Date(e.target.value);
                      const selectedPlan = Object.values(MEMBERSHIP_PLANS).find(
                        plan => plan.id === newMembershipData.membershipType
                      );
                      
                      let endDate = new Date(startDate);
                      if (selectedPlan) {
                        endDate.setMonth(endDate.getMonth() + selectedPlan.duration);
                      }
                      
                      setNewMembershipData(prev => ({
                        ...prev,
                        startDate: e.target.value,
                        endDate: endDate.toISOString().split('T')[0]
                      }));
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">End Date</label>
                  <input
                    type="date"
                    value={newMembershipData.endDate}
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
                  />
                  <p className="mt-1 text-sm text-gray-500">End date is automatically calculated based on the plan duration</p>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setIsEditingMembership(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateMembership}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Current Plan</label>
                  <p className="text-gray-900">{member.membershipType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Start Date</label>
                  <p className="text-gray-900">{member.membershipStartDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">End Date</label>
                  <p className="text-gray-900">{member.membershipEndDate}</p>
                </div>
              </div>
            )}
          </div>

          {/* Attendance Information */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Attendance History</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Total Visits</label>
                <p className="text-gray-900">{member.totalAttendance}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Visit</label>
                <p className="text-gray-900">{member.lastAttendance}</p>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Recent Check-ins</h3>
                <div className="max-h-64 overflow-y-auto">
                  {attendance.map(record => (
                    <div key={record.id} className="py-2 border-b border-gray-100 last:border-0">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-900">{record.date}</span>
                        <div className="text-xs text-gray-500">
                          <span>{record.checkInTime}</span>
                          {record.checkOutTime !== 'N/A' && (
                            <span> - {record.checkOutTime}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment History</h2>
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paymentHistory.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.plan_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{payment.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          payment.payment_status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {paymentHistory.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        No payment history available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes Section */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes</h2>
            <p className="text-gray-600 whitespace-pre-line">{member.notes}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDetails; 