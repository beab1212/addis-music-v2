'use client';

import { motion } from 'framer-motion';
import { Crown, Check } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import PlanSelectionModal from '@/components/PlanSelectionModal'; // Import PlanSelectionModal

export default function Premium() {
  const { isAuthenticated, user } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useRouter();

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        'Ad-supported listening',
        'Standard audio quality',
        'Limited skips',
        'Shuffle play',
      ],
      current: !user?.subscription,
    },
    {
      name: 'Premium',
      price: '$100',
      period: 'month',
      features: [
        'Ad-free listening',
        'High audio quality',
        'Unlimited skips',
        'Offline downloads',
        'Play any song',
        'Admin dashboard access',
      ],
      recommended: true,
      current: user?.subscription?.plan === 'PREMIUM',
    },
    {
      name: 'Family',
      price: '$150',
      period: 'month',
      features: [
        'All Premium features',
        'Up to 6 accounts',
        'Family Mix playlist',
        'Parental controls',
      ],
      current: user?.subscription?.plan === 'FAMILY',
      disabled: true, // UI-only demo
    },
  ];

  const handleSubscribe = (planName: string) => {
    if (planName === 'Free') {
      addToast('Free plan selected', 'info');
      return;
    }

    setSelectedPlan(planName);
    setShowModal(true);  // Show the modal to select the billing period
  };

  const handlePlanSelection = (plan: string, period: string) => {
    setShowModal(false);  // Close modal after selecting the plan period
    console.log("selected plans: ", plan, period);

    api.post('/subscriptions', {
      plan: plan.toLocaleLowerCase(),
      planType: period.toLocaleLowerCase(),
    })
      .then((res) => {
        addToast(`You have successfully selected the ${period} plan for ${plan}`, 'success');
        // redirect to checkout url
        window.location.href = res.data?.data?.checkoutUrl;
        console.log("CheckOut URL: ", res.data?.data.checkoutUrl)
      })
      .catch((error) => {
        console.error("Error creating subscription: ", error);
        addToast(error.response?.data?.message || 'Failed to create subscription', 'error');
      });
  };

  useEffect(() => {
    console.log("User: ", user);
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-linear-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full mb-6">
            <Crown size={24} />
            <span className="font-bold text-lg">Upgrade to Premium</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Get unlimited access to millions of songs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              whileHover={{ scale: 1.02, y: -5 }}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg ${
                plan.recommended ? 'ring-4 ring-orange-500' : ''} ${plan.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Recommended
                </div>
              )}
              {plan.current && (
                <div className="absolute -top-4 right-4 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Current Plan
                </div>
              )}

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {plan.name}
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {plan.price}
                </span>
                <span className="text-gray-600 dark:text-gray-400">/{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check size={20} className="text-green-500 **:shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSubscribe(plan.name)}
                disabled={plan.current || plan?.disabled}
                className={`w-full py-3 rounded-full font-semibold transition-colors ${
                  plan.current
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                    : plan.recommended
                    ? 'bg-linear-to-r from-orange-500 to-pink-500 text-white hover:shadow-xl'
                    : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                }`}
              >
                {plan.current ? 'Current Plan' : 'Subscribe'}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* PlanSelectionModal */}
        <PlanSelectionModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSelectPlan={handlePlanSelection}
          selectedPlan={selectedPlan!}
        />
      </motion.div>
    </div>
  );
}
