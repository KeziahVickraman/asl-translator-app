import React from "react";
import { motion } from "motion/react";
import { DisplayMode } from "../types";
import SubscriptionPlans, { SubscriptionTier } from "./SubscriptionPlans";

interface SettingsViewProps {
  languageClass: "ASL" | "Auslan" | "BSL";
  onChangeLanguage: (lang: "ASL" | "Auslan" | "BSL") => void;
  textSize: number;
  onChangeTextSize: (size: number) => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  hapticFeedback: boolean;
  onToggleHapticFeedback: () => void;
  aiNoiseSuppression: boolean;
  onToggleAiNoiseSuppression: () => void;
  subscriptionTier: SubscriptionTier;
  onUpgradeTier: (tier: SubscriptionTier) => void;
}

export default function SettingsView({
  languageClass,
  onChangeLanguage,
  textSize,
  onChangeTextSize,
  highContrast,
  onToggleHighContrast,
  hapticFeedback,
  onToggleHapticFeedback,
  aiNoiseSuppression,
  onToggleAiNoiseSuppression,
  subscriptionTier,
  onUpgradeTier,
}: SettingsViewProps) {
  
  const handleVibratePlay = () => {
    if ("vibrate" in navigator) {
      navigator.vibrate(120);
    }
  };

  const handleToggleNoiseAttempt = () => {
    if (subscriptionTier === "basic") {
      alert("⚠️ Advanced Tremor Suppression and Hand stabilizers are Pro / Enterprise level features. Please upgrade your subscription below to unlock these AI enhancements!");
    } else {
      onToggleAiNoiseSuppression();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="flex-grow flex flex-col max-w-4xl mx-auto w-full px-5 py-6 pb-28"
    >
      {/* Header coordinates description */}
      <section className="mb-8" id="settings_header_sec">
        <div className="flex items-center gap-2 mb-1.5">
          <h2 className="text-3xl font-serif font-bold italic text-[#5a5a40] tracking-tight">
            System & Billing Settings
          </h2>
          <span className="text-[10px] bg-[#8d917a] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
            Plan: {subscriptionTier}
          </span>
        </div>
        <p className="text-sm text-[#8a8a7c] font-medium leading-relaxed">
          Customize your translation output experience and manage your premium subscription plans.
        </p>
      </section>

      {/* Settings Grid list panel */}
      <div className="grid grid-cols-1 gap-5">
        
        {/* Sign dialect selection standard */}
        <section className="bg-white p-5 rounded-3xl border border-[#e2e2da] shadow-sm" id="lang_select_card">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-[#8d917a]" style={{ fontVariationSettings: "'FILL' 1" }}>
              translate
            </span>
            <h3 className="font-serif font-bold italic text-[#5a5a40] text-base tracking-wide">
              Default Sign Language Standard
            </h3>
          </div>

          <div className="flex gap-2.5">
            {(["ASL", "Auslan", "BSL"] as const).map((lang) => {
              const isSelected = languageClass === lang;
              return (
                <button
                  key={lang}
                  onClick={() => onChangeLanguage(lang)}
                  className={`flex-1 h-[52px] rounded-2xl font-bold text-sm flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer border ${
                    isSelected
                      ? "bg-[#8d917a] text-white border-transparent shadow-sm"
                      : "bg-white text-[#5a5a40] border-[#e2e2da] hover:bg-[#f5f5f0] hover:text-[#33332d]"
                  }`}
                >
                  {lang}
                </button>
              );
            })}
          </div>
        </section>

        {/* Dynamic scale visual typography slider */}
        <section className="bg-white p-5 rounded-3xl border border-[#e2e2da] shadow-sm" id="text_scale_card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#8d917a]">
                format_size
              </span>
              <h3 className="font-serif font-bold italic text-[#5a5a40] text-base tracking-wide">
                Translation FontSize
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-[#8d917a] bg-[#f5f5f0] px-2.5 py-0.5 rounded border border-[#e2e2da] shadow-inner">
              {textSize}px
            </span>
          </div>

          <div className="px-1 py-1">
            <input
              type="range"
              min="14"
              max="32"
              value={textSize}
              onChange={(e) => onChangeTextSize(Number(e.target.value))}
              className="w-full accent-[#8d917a] cursor-pointer"
            />
            <div className="flex justify-between items-center text-[11px] text-[#8a8a7c] mt-3 font-semibold px-0.5">
              <span>Minimalist (14px)</span>
              <span className="text-xl font-extrabold text-[#5a5a40]">Large Display (32px)</span>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-5" id="settings_toggles_sec">
          
          {/* High Contrast Mode toggle */}
          <div className="bg-white p-5 rounded-3xl border border-[#e2e2da] shadow-sm flex items-center justify-between min-h-[82px] hover:border-[#8d917a]/20 transition-colors">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#8d917a]">
                  contrast
                </span>
                <h3 className="font-serif font-bold italic text-[#5a5a40] text-base tracking-wide">
                  High Contrast Text
                </h3>
              </div>
              <span className="text-xs text-[#8a8a7c] mt-0.5 font-medium">Optimize text luminance values</span>
            </div>

            <button
              onClick={onToggleHighContrast}
              className={`w-14 h-8 rounded-full transition-colors relative cursor-pointer ${
                highContrast ? "bg-[#8d917a]" : "bg-[#e2e2da]"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full absolute top-1 transition-transform ${
                  highContrast ? "translate-x-7 bg-white" : "translate-x-1 bg-white"
                }`}
              />
            </button>
          </div>

          {/* Web Haptic Feedback */}
          <div className="bg-white p-5 rounded-3xl border border-[#e2e2da] shadow-sm flex items-center justify-between min-h-[82px] hover:border-[#8d917a]/20 transition-colors">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#8d917a]">
                  vibration
                </span>
                <h3 className="font-serif font-bold italic text-[#5a5a40] text-base tracking-wide">
                  Haptic Feedback
                </h3>
              </div>
              <span className="text-xs text-[#8a8a7c] mt-0.5 font-medium">Vibrate hand upon translation trigger</span>
            </div>

            <button
              onClick={() => {
                onToggleHapticFeedback();
                handleVibratePlay();
              }}
              className={`w-14 h-8 rounded-full transition-colors relative cursor-pointer ${
                hapticFeedback ? "bg-[#8d917a]" : "bg-[#e2e2da]"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full absolute top-1 transition-transform ${
                  hapticFeedback ? "translate-x-7 bg-white" : "translate-x-1 bg-white"
                }`}
              />
            </button>
          </div>
        </section>

        {/* AI smart parameters panel */}
        <section className={`p-6 rounded-[32px] border shadow-md relative overflow-hidden transition-all duration-300 ${
          subscriptionTier === "basic" 
            ? "bg-slate-900 border-slate-800 text-slate-300 opacity-80"
            : "bg-gradient-to-br from-[#5a5a40] to-[#8d917a] border-[#cbd2b1]/20 text-white"
        }`}>
          <div className="relative z-10 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-serif font-bold italic text-base tracking-tight select-none">
                Advanced AI Features
              </h3>
              <span className={`text-[9px] px-2.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                subscriptionTier === "basic"
                  ? "bg-rose-500 text-white"
                  : "bg-white text-[#5a5a40]"
              }`}>
                {subscriptionTier === "basic" ? "🔒 Upgrade to unlock" : "V3.5 ACTIVE"}
              </span>
            </div>
            
            <p className="text-xs leading-relaxed max-w-lg font-medium">
              Improve sign recognition accuracy by enabling on-device background noise filters and hand-tremor vector stabilization during camera mapping.
            </p>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold flex items-center gap-1.5">
                {subscriptionTier === "basic" && <span className="material-symbols-outlined text-sm text-rose-400">lock</span>}
                Activate Tremor Suppression & Vector Filter
              </span>
              <button
                onClick={handleToggleNoiseAttempt}
                className={`w-14 h-8 rounded-full transition-colors relative cursor-pointer ${
                  aiNoiseSuppression && subscriptionTier !== "basic" ? "bg-white" : "bg-black/20"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full absolute top-1 transition-transform ease-out duration-150 ${
                    aiNoiseSuppression && subscriptionTier !== "basic" ? "translate-x-7 bg-[#5a5a40]" : "translate-x-1 bg-white"
                  }`}
                />
              </button>
            </div>
          </div>
          
          <div className="absolute -right-12 -top-12 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        </section>

        {/* Subscription Billing Panel Embedded directly in Settings */}
        <section className="bg-[#f5f5f0] p-6 rounded-[32px] border border-[#e2e2da] shadow-sm">
          <SubscriptionPlans currentTier={subscriptionTier} onUpgradeTier={onUpgradeTier} />
        </section>
      </div>
    </motion.div>
  );
}
