import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export type SubscriptionTier = "basic" | "pro" | "enterprise";

interface SubscriptionPlansProps {
  currentTier: SubscriptionTier;
  onUpgradeTier: (tier: SubscriptionTier) => void;
}

export default function SubscriptionPlans({ currentTier, onUpgradeTier }: SubscriptionPlansProps) {
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    id: SubscriptionTier;
    name: string;
    price: string;
    period: string;
    color: string;
    bg: string;
    icon: string;
    features: string[];
  } | null>(null);

  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const PLANS = [
    {
      id: "basic" as const,
      name: "Basic Standard",
      price: "$0",
      period: "forever",
      color: "#8a8a7c",
      bg: "bg-white",
      borderColor: "border-[#e2e2da]",
      icon: "spa",
      features: [
        "10 automated camera scans daily",
        "Standard English text voice synthesizer",
        "Default regional dialect database",
        "Single-device history logs"
      ],
      desc: "Perfect for casual sign language learners and daily basic lookups."
    },
    {
      id: "pro" as const,
      name: "Premium Pro",
      price: "$12",
      period: "per month",
      color: "#8d917a",
      bg: "bg-gradient-to-br from-white to-[#cbd2b1]/15",
      borderColor: "border-[#8d917a]/50",
      icon: "bolt",
      features: [
        "Unlimited continuous recording capture",
        "High-fidelity Gemini-powered sign analysis",
        "Full Web Speech voice options & speechrate control",
        "Tremor suppression & noise filter metrics",
        "Real-time usage accuracy charts",
        "Interactive analytics reports dashboard"
      ],
      desc: "For deaf communicators, teachers, and serious language learners.",
      popular: true
    },
    {
      id: "enterprise" as const,
      name: "Schools & Enterprise",
      price: "$79",
      period: "per user/month",
      color: "#5a5a40",
      bg: "bg-gradient-to-br from-white to-[#5a5a40]/10",
      borderColor: "border-[#5a5a40]/40",
      icon: "school",
      features: [
        "Everything in Pro unlocked",
        "Classroom dashboard & group analytics",
        "Multi-student engagement progress reports",
        "Priority educator & admin controls",
        "Custom sign language curriculum export",
        "Dedicated billing & priority support support"
      ],
      desc: "Tailor-made for educators, schools, healthcare, and enterprise teams."
    }
  ];

  const handlePlanClick = (plan: typeof PLANS[0]) => {
    if (plan.id === "basic") {
      onUpgradeTier("basic");
      return;
    }
    setSelectedPlan(plan);
    setPaymentSuccess(false);
    setIsProcessing(false);
    setShowPaymentModal(true);
  };

  const handleSimulatedPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    if ("vibrate" in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
    // Simulate real gateway loading
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      if ("vibrate" in navigator) {
        navigator.vibrate([300, 100, 300]);
      }
      setTimeout(() => {
        if (selectedPlan) {
          onUpgradeTier(selectedPlan.id);
        }
        setShowPaymentModal(false);
        setSelectedPlan(null);
      }, 1500);
    }, 2000);
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center max-w-md mx-auto space-y-1.5 pb-2">
        <h3 className="text-2xl font-serif font-bold italic text-[#5a5a40] tracking-tight">
          Choose Your Plan
        </h3>
        <p className="text-xs text-[#8a8a7c] font-medium leading-relaxed">
          Unlock high-fidelity AI translation, tremor suppression filters, and personalized analytics reports.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isActive = currentTier === plan.id;
          return (
            <div
              key={plan.id}
              className={`flex flex-col relative overflow-hidden rounded-[32px] p-6 border transition-all duration-300 ${plan.bg} ${plan.borderColor} ${
                plan.popular ? "shadow-md scale-[1.02] md:scale-105" : "shadow-sm"
              } ${isActive ? "ring-2 ring-[#8d917a] border-transparent" : "hover:border-[#8d917a]/30"}`}
            >
              {plan.popular && (
                <div className="absolute top-5 right-5 bg-[#8d917a] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm z-10">
                  Most Popular
                </div>
              )}

              {isActive && (
                <div className="absolute top-5 right-5 bg-[#5a5a40] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm z-10 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[10px]">task_alt</span>
                  Active Plan
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: plan.color }}>
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{plan.icon}</span>
                </div>
                <div>
                  <h4 className="font-serif font-bold italic text-[#5a5a40] text-lg leading-tight">{plan.name}</h4>
                  <p className="text-[10px] text-[#8a8a7c] font-semibold tracking-wider uppercase mt-0.5">{plan.id}</p>
                </div>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-serif font-black text-[#33332d]">{plan.price}</span>
                <span className="text-xs text-[#8a8a7c] font-medium ml-1">/ {plan.period}</span>
              </div>

              <p className="text-xs text-[#6a6a5c] leading-relaxed mb-6 font-medium min-h-[40px]">
                {plan.desc}
              </p>

              <div className="border-t border-[#e2e2da] pt-5 space-y-3 mb-8 flex-grow">
                {plan.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[16px] text-emerald-600 mt-0.5 font-bold">
                      check_circle
                    </span>
                    <span className="text-xs text-[#5a5a40] leading-snug font-medium">
                      {feat}
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handlePlanClick(plan)}
                disabled={isActive}
                className={`w-full py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-sm ${
                  isActive
                    ? "bg-[#e2e2da] text-[#8a8a7c] cursor-default shadow-none"
                    : plan.popular
                    ? "bg-[#8d917a] hover:bg-[#7a7e67] text-white font-black"
                    : "bg-[#5a5a40] hover:bg-[#464632] text-white"
                }`}
              >
                {isActive ? "Currently Active" : plan.price === "$0" ? "Downgrade to Basic" : "Select & Activate"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Credit card checkout payment details modal overlay */}
      <AnimatePresence>
        {showPaymentModal && selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-[32px] border border-[#e2e2da] shadow-2xl p-6 max-w-sm w-full relative z-50 space-y-5 cursor-default text-[#33332d]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center pb-2 border-b border-[#e2e2da]">
                <div>
                  <h4 className="font-serif font-bold italic text-base text-[#5a5a40]">Simulated Checkout</h4>
                  <p className="text-[10px] text-[#8a8a7c] uppercase font-bold tracking-wider">Plan: {selectedPlan.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="material-symbols-outlined text-[#8a8a7c] hover:bg-[#f5f5f0] rounded-full p-1 leading-none cursor-pointer"
                >
                  close
                </button>
              </div>

              {paymentSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 animate-bounce">
                    <span className="material-symbols-outlined text-4xl font-extrabold">check</span>
                  </div>
                  <h5 className="font-serif font-bold italic text-lg text-[#5a5a40]">Payment Successful!</h5>
                  <p className="text-xs text-[#8a8a7c] font-medium">Your suite has been successfully upgraded to {selectedPlan.name}. Enjoy premium features!</p>
                </div>
              ) : (
                <form onSubmit={handleSimulatedPaymentSubmit} className="space-y-4">
                  <div className="p-3 bg-[#f5f5f0] border border-[#e2e2da] rounded-2xl flex justify-between items-center">
                    <div>
                      <span className="text-xs text-[#6a6a5c] font-semibold">Total Billing Amount:</span>
                      <p className="text-lg font-serif font-black text-[#5a5a40]">{selectedPlan.price} <span className="text-[10px] text-[#8a8a7c] font-bold">/ month</span></p>
                    </div>
                    <span className="text-xs bg-[#e2e2da] text-[#5a5a40] px-2.5 py-1 rounded-full font-bold">Secure Stripe</span>
                  </div>

                  <div className="space-y-3 text-left">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#5a5a40] uppercase tracking-wider">Credit Card Number</label>
                      <input
                        type="text"
                        required
                        placeholder="4242 •••• •••• 4242"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, ""))}
                        maxLength={16}
                        className="w-full px-4 py-2.5 bg-[#f5f5f0] border border-[#e2e2da] focus:border-[#8d917a] rounded-xl outline-none text-xs font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#5a5a40] uppercase tracking-wider">Expiration Date</label>
                        <input
                          type="text"
                          required
                          placeholder="MM / YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          maxLength={5}
                          className="w-full px-4 py-2.5 bg-[#f5f5f0] border border-[#e2e2da] focus:border-[#8d917a] rounded-xl outline-none text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#5a5a40] uppercase tracking-wider">CVC Code</label>
                        <input
                          type="password"
                          required
                          placeholder="•••"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          maxLength={3}
                          className="w-full px-4 py-2.5 bg-[#f5f5f0] border border-[#e2e2da] focus:border-[#8d917a] rounded-xl outline-none text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-[#5a5a40] hover:bg-[#464632] disabled:opacity-50 rounded-2xl text-xs font-bold text-white tracking-widest uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    {isProcessing ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                        Processing...
                      </>
                    ) : (
                      `Purchase ${selectedPlan.name}`
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
