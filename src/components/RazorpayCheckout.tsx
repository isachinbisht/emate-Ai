'use client';

import React, { useState, useCallback } from 'react';

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

interface RazorpayCheckoutProps {
  amount: number; // in INR (e.g. 699)
  planTier: 'growth' | 'scale';
  userEmail?: string;
  userName?: string;
  onSuccess?: () => void;
  className?: string;
  children?: React.ReactNode;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function RazorpayCheckout({
  amount,
  planTier,
  userEmail,
  userName,
  onSuccess,
  className = '',
  children,
}: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = useCallback(async () => {
    setLoading(true);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert('Razorpay SDK failed to load. Are you online?');
        return;
      }

      // 1. Create order on backend
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency: 'INR', planTier }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        alert(orderData.error || 'Failed to create payment order');
        return;
      }

      // 2. Launch Razorpay modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'e-Mate AI',
        description: `Upgrade to ${planTier.charAt(0).toUpperCase() + planTier.slice(1)} Plan`,
        order_id: orderData.id,
        prefill: {
          name: userName || '',
          email: userEmail || '',
        },
        theme: {
          color: '#1f51ff',
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          // 3. Verify payment
          const verifyRes = await fetch('/api/razorpay/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planTier,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            onSuccess?.();
            window.location.href = '/ai-topper-chat?payment=success';
          } else {
            alert('Payment verification failed. Please contact support.');
          }
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error('[RazorpayCheckout]', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [amount, planTier, userEmail, userName, onSuccess]);

  return (
    <button
      type="button"
      onClick={handlePayment}
      disabled={loading}
      className={`cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children ?? (
        <>
          Pay with UPI / Cards (₹{amount.toLocaleString('en-IN')})
        </>
      )}
    </button>
  );
}
