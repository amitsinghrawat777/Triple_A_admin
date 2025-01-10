import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { ArrowLeft, Check, Crown, Star } from 'lucide-react';

type PlanType = 'monthly' | 'quarterly' | 'biannual';

interface Plan {
  type: PlanType;
  name: string;
  price: number;
  duration: string;
  savings?: string;
  features: string[];
}

const plans: Plan[] = [
  {
    type: 'monthly',
    name: '1 Month Plan',
    price: 699,
    duration: '1 month',
    features: [
      'Full access to workout library',
      'Custom workout plans',
      'Progress tracking',
      'Basic analytics',
      'Email support'
    ]
  },
  {
    type: 'quarterly',
    name: '3 Months Plan',
    price: 1999,
    duration: '3 months',
    savings: 'Save ₹98',
    features: [
      'All Monthly Plan features',
      'Advanced analytics',
      'Nutrition tracking',
      'Priority support',
      'Workout downloads'
    ]
  },
  {
    type: 'biannual',
    name: '6 Months Plan',
    price: 3999,
    duration: '6 months',
    savings: 'Save ₹195',
    features: [
      'All Quarterly Plan features',
      'Personal training consultation',
      'Custom meal plans',
      'Premium support 24/7',
      'Exclusive content access'
    ]
  }
];

export default function Membership() {
  const navigate = useNavigate();
  const { profileData, updateProfile, updateMembership } = useProfile();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = async () => {
    try {
      setIsProcessing(true);
      const now = new Date();
      const expiryDate = new Date();
      
      // Set expiry based on plan
      switch (selectedPlan) {
        case 'monthly':
          expiryDate.setMonth(expiryDate.getMonth() + 1);
          break;
        case 'quarterly':
          expiryDate.setMonth(expiryDate.getMonth() + 3);
          break;
        case 'biannual':
          expiryDate.setMonth(expiryDate.getMonth() + 6);
          break;
      }

      const selectedPlanDetails = plans.find(p => p.type === selectedPlan)!;
      
      const membershipData = {
        type: selectedPlan,
        name: selectedPlanDetails.name,
        price: selectedPlanDetails.price,
        duration: selectedPlanDetails.duration,
        startDate: now.toISOString().split('T')[0],
        expiryDate: expiryDate.toISOString().split('T')[0],
        status: 'Active' as const,
        features: selectedPlanDetails.features,
        paymentId: `PAY-${Date.now()}`, // Replace with actual payment ID
      };

      await updateMembership(membershipData);
      navigate('/profile');
    } catch (error) {
      console.error('Error upgrading membership:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="max-w-6xl mx-auto px-4 py-4 pb-24">
        {/* Header */}
        <div className="bg-[#1E1E1E] rounded-xl shadow-sm mb-6">
          <div className="p-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/profile')}
                className="p-2 hover:bg-[#282828] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-semibold">Choose Your Plan</h1>
            </div>
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.type}
              className={`bg-[#1E1E1E] rounded-xl p-6 cursor-pointer transition-all ${
                selectedPlan === plan.type ? 'ring-2 ring-emerald-500' : ''
              }`}
              onClick={() => setSelectedPlan(plan.type)}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                    {plan.name}
                    {plan.type !== 'monthly' && <Crown className="w-5 h-5 text-yellow-500" />}
                  </h3>
                  <p className="text-gray-400">{plan.duration}</p>
                </div>
                {plan.savings && (
                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-sm">
                    {plan.savings}
                  </span>
                )}
              </div>
              <div className="mb-6">
                <span className="text-3xl font-bold">₹{plan.price}</span>
                <span className="text-gray-400">/{plan.duration}</span>
              </div>
              <ul className="space-y-4 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleUpgrade}
            disabled={isProcessing}
            className="px-6 py-3 rounded-lg font-medium bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            {isProcessing ? (
              'Processing...'
            ) : (
              <>
                <Crown className="w-5 h-5" />
                {`Get ${plans.find(p => p.type === selectedPlan)?.name} for ₹${plans.find(p => p.type === selectedPlan)?.price}`}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 