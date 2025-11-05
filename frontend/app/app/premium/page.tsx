'use client';
import { motion } from 'framer-motion';
import { Crown, Check } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { useRouter } from 'next/navigation';

export default function Premium() {
  const { user, updateUser } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useRouter();

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
      current: !user?.isPremium,
    },
    {
      name: 'Premium',
      price: '$9.99',
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
      current: user?.isPremium,
    },
    {
      name: 'Family',
      price: '$14.99',
      period: 'month',
      features: [
        'All Premium features',
        'Up to 6 accounts',
        'Family Mix playlist',
        'Parental controls',
      ],
    },
  ];

  const handleSubscribe = (planName: string) => {
    if (planName === 'Premium') {
      updateUser({ isPremium: true });
      addToast('Successfully upgraded to Premium!', 'success');
      navigate.push('/profile');
    } else {
      addToast('This is a UI-only demo', 'info');
    }
  };

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
                plan.recommended ? 'ring-4 ring-orange-500' : ''
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
                    <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSubscribe(plan.name)}
                disabled={plan.current}
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

        <div className="bg-linear-to-br from-orange-500 to-pink-500 rounded-3xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Why Premium?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Ad-Free Experience</h3>
              <p className="text-white/90">
                Enjoy uninterrupted music without any ads. Listen to your favorite songs without
                interruption.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">High Quality Audio</h3>
              <p className="text-white/90">
                Experience music the way it was meant to be heard with high-quality streaming.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Offline Downloads</h3>
              <p className="text-white/90">
                Download your favorite songs and playlists to listen offline anytime, anywhere.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Unlimited Access</h3>
              <p className="text-white/90">
                Play any song, anytime. Skip as many times as you want and enjoy unlimited listening.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
