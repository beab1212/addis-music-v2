'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Sparkles } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';

type PlanSelectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (plan: string, period: string) => void;
  selectedPlan: string;
};

const PlanSelectionModal: React.FC<PlanSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
  selectedPlan,
}) => {
  const { addToast } = useToastStore();

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  const handleSelect = (period: string) => {
    onSelectPlan(selectedPlan, period);
    addToast(`${selectedPlan} • ${period} selected`, 'success');
    onClose();
  };

  const periods = [
    {
      name: 'Monthly',
      price: '50 ETB',
      perMonth: '50 ETB/month',
      popular: false,
      savings: null,
    },
    {
      name: 'Quarterly',
      price: '127 ETB',
      perMonth: '42.33 ETB/month',
      popular: false,
      savings: 'Save 15%',
    },
    {
      name: 'Annual',
      price: '450 ETB',
      perMonth: '37.5 ETB/month',
      popular: true,
      savings: 'Best Value – Save 25%',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
              {/* Gradient Header */}
              <div className="bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white">
                <button
                  onClick={onClose}
                  aria-label="Close modal"
                  className="absolute top-6 right-6 p-2 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 transition-all"
                >
                  <X size={20} />
                </button>
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-8 h-8" />
                  <h2 className="text-3xl font-bold">{selectedPlan} Plan</h2>
                </div>
                <p className="text-white/90 text-lg">Choose your billing period</p>
              </div>

              {/* Pricing Cards */}
              <div className="p-8 bg-gray-50 dark:bg-gray-950">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {periods.map((period) => (
                    <motion.button
                      key={period.name}
                      whileHover={{ y: -8, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelect(period.name)}
                      className={`relative group overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                        period.popular
                          ? 'border-purple-500 shadow-xl shadow-purple-500/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      } bg-white dark:bg-gray-800`}
                    >
                      {/* Popular Badge */}
                      {period.popular && (
                        <div className="absolute -top-1 -right-1">
                          <div className="bg-linear-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl rounded-tr-2xl shadow-lg flex items-center gap-1">
                            <Sparkles size={14} />
                            MOST POPULAR
                          </div>
                        </div>
                      )}

                      <div className="p-6 text-center">
                        {/* Period Name */}
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                          {period.name}
                        </h3>

                        {/* Big Price */}
                        <div className="mb-4">
                          <span className="text-5xl font-extrabold text-gray-900 dark:text-white">
                            {period.price}
                          </span>
                          <span className="text-lg text-gray-500 dark:text-gray-400 ml-1">
                            {period.perMonth}
                          </span>
                        </div>

                        {/* Savings */}
                        {period.savings && (
                          <div className="mb-6">
                            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-semibold rounded-full">
                              <Check size={16} />
                              {period.savings}
                            </span>
                          </div>
                        )}

                        {/* CTA */}
                        <div className={`mt-6 py-3 px-6 rounded-xl font-bold text-lg transition-all ${
                          period.popular
                            ? 'bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                        }`}>
                          Select {period.name}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Footer Note */}
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
                  No hidden fees • Cancel anytime • 7-day money-back guarantee
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PlanSelectionModal;
