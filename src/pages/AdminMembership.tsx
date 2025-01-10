import React, { useState } from 'react';
import { db } from '../config/firebase';
import { doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

interface UsageMetrics {
  totalLogins: number;
  lastLogin: string;
  deviceTypes: string[];
  featuresUsed: {
    workouts: number;
    nutrition: number;
    consultation: number;
    downloads: number;
  };
  sessionsCompleted: number;
  totalTimeSpent: number; // in minutes
}

export default function AdminMembership() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const grantMembershipToRawatAmit = async () => {
    const targetEmail = 'rawatamit446@gmail.com';
    
    setIsProcessing(true);
    setStatus('Processing membership grant for ' + targetEmail);

    try {
      const now = new Date();
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 6);

      const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const subscriptionId = `SUB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Get existing user data
      const userRef = doc(db, 'users', targetEmail);
      const userDoc = await getDoc(userRef);

      const membershipData = {
        type: 'biannual',
        name: '6 Months Plan',
        price: 3999,
        duration: '6 months',
        startDate: now.toISOString().split('T')[0],
        expiryDate: expiryDate.toISOString().split('T')[0],
        status: 'Active',
        features: [
          'All Quarterly Plan features',
          'Personal training consultation',
          'Custom meal plans',
          'Premium support 24/7',
          'Exclusive content access'
        ],
        paymentId,
        transactionId,
        subscriptionId,
        purchasedAt: now.toISOString(),
        autoRenew: false,
        renewalPrice: 3999,
        renewalNotificationSent: false
      };

      // Initialize analytics data
      const analyticsData = {
        subscriptionId,
        startDate: now.toISOString(),
        endDate: expiryDate.toISOString(),
        status: 'Active',
        metrics: {
          totalValue: 3999,
          remainingDays: 180,
          usagePercentage: 0,
          renewalProbability: 100,
        },
        features: {
          enabled: membershipData.features,
          used: [],
          lastUsed: null
        }
      };

      // Initialize usage metrics
      const usageMetrics: UsageMetrics = {
        totalLogins: 0,
        lastLogin: now.toISOString(),
        deviceTypes: [],
        featuresUsed: {
          workouts: 0,
          nutrition: 0,
          consultation: 0,
          downloads: 0
        },
        sessionsCompleted: 0,
        totalTimeSpent: 0
      };

      // Update user document
      const userData = {
        email: targetEmail,
        displayName: userDoc.exists() ? userDoc.data()?.displayName : '',
        photoURL: userDoc.exists() ? userDoc.data()?.photoURL : '',
        personalInfo: userDoc.exists() ? userDoc.data()?.personalInfo : {},
        stats: userDoc.exists() ? userDoc.data()?.stats : {},
        preferences: userDoc.exists() ? userDoc.data()?.preferences : {},
        goals: userDoc.exists() ? userDoc.data()?.goals : [],
        medicalInfo: userDoc.exists() ? userDoc.data()?.medicalInfo : {},
        membership: membershipData,
        lastUpdated: serverTimestamp(),
        createdAt: userDoc.exists() ? userDoc.data()?.createdAt : serverTimestamp()
      };

      // Batch write all data
      const batch = db.batch();

      // 1. Update user document
      batch.set(userRef, userData);

      // 2. Create membership history
      const historyRef = doc(db, 'membershipHistory', targetEmail);
      batch.set(historyRef, {
        userId: targetEmail,
        memberships: userDoc.exists() && userDoc.data()?.membershipHistory 
          ? [...userDoc.data().membershipHistory, membershipData]
          : [membershipData]
      }, { merge: true });

      // 3. Create payment record
      const paymentRef = doc(collection(db, 'payments'));
      batch.set(paymentRef, {
        userId: targetEmail,
        paymentId,
        transactionId,
        subscriptionId,
        amount: 3999,
        currency: 'INR',
        status: 'completed',
        type: 'membership',
        plan: '6 Months Plan',
        createdAt: serverTimestamp(),
        metadata: {
          membershipType: 'biannual',
          startDate: membershipData.startDate,
          expiryDate: membershipData.expiryDate
        }
      });

      // 4. Create analytics record
      const analyticsRef = doc(db, 'membershipAnalytics', subscriptionId);
      batch.set(analyticsRef, analyticsData);

      // 5. Create usage metrics record
      const usageRef = doc(db, 'usageMetrics', subscriptionId);
      batch.set(usageRef, {
        userId: targetEmail,
        subscriptionId,
        metrics: usageMetrics,
        lastUpdated: serverTimestamp()
      });

      // 6. Schedule expiry check
      const expiryCheckRef = doc(db, 'expiryChecks', subscriptionId);
      batch.set(expiryCheckRef, {
        userId: targetEmail,
        subscriptionId,
        expiryDate: expiryDate.toISOString(),
        notificationDates: {
          sevenDays: new Date(expiryDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          threeDays: new Date(expiryDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          oneDay: new Date(expiryDate.getTime() - 24 * 60 * 60 * 1000).toISOString()
        },
        notificationsSent: {
          sevenDays: false,
          threeDays: false,
          oneDay: false
        },
        status: 'pending'
      });

      // Commit all changes
      await batch.commit();

      setStatus('Successfully granted 6-month membership to ' + targetEmail);
      console.log('Membership granted successfully', userData);
      
      setTimeout(() => {
        navigate('/profile');
      }, 2000);

    } catch (error) {
      console.error('Error granting membership:', error);
      setStatus('Error: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-8">
      <div className="max-w-md mx-auto bg-[#1E1E1E] rounded-xl p-6">
        <h1 className="text-xl font-semibold mb-6">Grant 6-Month Membership</h1>
        <p className="text-gray-400 mb-6">
          Target Account: rawatamit446@gmail.com
        </p>
        
        <button
          onClick={grantMembershipToRawatAmit}
          disabled={isProcessing}
          className={`w-full py-3 rounded-lg font-medium ${
            isProcessing 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-emerald-600 hover:bg-emerald-700'
          } transition-colors`}
        >
          {isProcessing ? 'Processing...' : 'Grant 6-Month Membership'}
        </button>

        {status && (
          <div className={`mt-4 p-4 rounded-lg ${
            status.includes('Error') 
              ? 'bg-red-500/10 text-red-500' 
              : 'bg-emerald-500/10 text-emerald-400'
          }`}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
} 