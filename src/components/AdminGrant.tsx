import React, { useState } from 'react';
import { db } from '../config/firebase';
import { doc, setDoc, arrayUnion } from 'firebase/firestore';

export default function AdminGrant() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');

  const grantMembership = async () => {
    setIsProcessing(true);
    setMessage('Processing...');
    
    try {
      const now = new Date();
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 6);

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
        paymentId: `ADMIN-GRANT-${Date.now()}`,
        grantedBy: 'admin',
        grantedAt: now.toISOString()
      };

      const email = 'rawatamit446@gmail.com';
      
      // Update user profile
      await setDoc(doc(db, 'users', email), {
        membership: membershipData
      }, { merge: true });

      // Add to history
      await setDoc(doc(db, 'membershipHistory', email), {
        userId: email,
        memberships: arrayUnion({
          ...membershipData,
          purchasedAt: now.toISOString(),
        })
      }, { merge: true });

      setMessage('Membership granted successfully!');
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error granting membership');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={grantMembership}
        disabled={isProcessing}
        className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
      >
        Grant 6-Month Membership
      </button>
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
} 