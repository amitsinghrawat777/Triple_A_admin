import { auth } from './config/firebase';
import { db } from './config/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  status: 'active' | 'inactive';
}

async function updateStatus(message: string, type: 'status' | 'error' | 'success' = 'status') {
  const element = document.getElementById(type);
  if (element) {
    element.textContent = message;
    element.classList.remove('hidden');
  }
}

async function testPaymentIntegration() {
  try {
    updateStatus('Checking authentication...');
    
    // 1. Get the current user
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Please login to continue');
    }

    // 2. Get auth token
    const authToken = await user.getIdToken();
    if (!authToken) {
      throw new Error('Authentication token not found');
    }

    // 3. Get available plans
    updateStatus('Fetching membership plans...');
    const plansRef = collection(db, 'membership_plans');
    const q = query(plansRef, where('status', '==', 'active'), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('No active membership plans found');
    }

    const plan: MembershipPlan = {
      id: querySnapshot.docs[0].id,
      ...(querySnapshot.docs[0].data() as Omit<MembershipPlan, 'id'>)
    };
    
    updateStatus(`Creating order for ${plan.name}...`);

    // 4. Create an order
    const orderResponse = await fetch('https://gjuecyugpchcwznewohb.supabase.co/functions/v1/payment-functions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        path: 'create-order',
        amount: plan.price,
        planId: plan.id,
        userId: user.uid
      })
    });

    if (!orderResponse.ok) {
      const error = await orderResponse.json();
      throw new Error(`Failed to create order: ${error.message}`);
    }

    const { orderId } = await orderResponse.json();
    updateStatus('Initializing payment...');

    // 5. Initialize Razorpay payment
    const options = {
      key: 'rzp_test_GEZQfBnCrf1uyR',
      amount: plan.price * 100, // amount in paise
      currency: 'INR',
      name: 'Triple A Fitness',
      description: `${plan.name} Membership`,
      order_id: orderId,
      handler: async function(response: any) {
        try {
          updateStatus('Payment successful, verifying...', 'success');
          const verifyToken = await user.getIdToken();

          // 6. Verify payment
          const verifyResponse = await fetch('https://gjuecyugpchcwznewohb.supabase.co/functions/v1/payment-functions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${verifyToken}`
            },
            body: JSON.stringify({
              path: 'verify-payment',
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              userId: user.uid
            })
          });

          if (!verifyResponse.ok) {
            const error = await verifyResponse.json();
            throw new Error(`Failed to verify payment: ${error.message}`);
          }

          const verifyResult = await verifyResponse.json();
          updateStatus('Payment completed successfully! Membership activated.', 'success');
          console.log('Payment verified:', verifyResult);

          // Redirect to membership page after 2 seconds
          setTimeout(() => {
            window.location.href = '/membership';
          }, 2000);

        } catch (error) {
          updateStatus(error instanceof Error ? error.message : 'Payment verification failed', 'error');
        }
      },
      prefill: {
        name: user.displayName || '',
        email: user.email || '',
        contact: user.phoneNumber || ''
      },
      theme: {
        color: '#10B981'
      },
      modal: {
        ondismiss: function() {
          updateStatus('Payment cancelled', 'error');
        }
      }
    };

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);

    script.onload = () => {
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    };

  } catch (error) {
    console.error('Payment test failed:', error);
    updateStatus(error instanceof Error ? error.message : 'Payment test failed', 'error');
  }
}

// Add button to trigger test
const button = document.createElement('button');
button.textContent = 'Test Payment';
button.className = 'bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-all';
button.onclick = testPaymentIntegration;
document.body.appendChild(button); 