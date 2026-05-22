import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface LoginViewProps {
  onLogin: (email: string, displayName: string) => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Suggested quick accounts to bypass manual typing
  const DEFAULTS_LIST = [
    { email: "keziahvickraman@gmail.com", name: "Keziah Vickraman" },
    { email: "guest@signbridge.io", name: "Guest User" },
    { email: "test.student@academy.org", name: "Hannah Lee" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!email.includes("@")) {
      setErrorMsg("Email address must correspond to a valid pattern (e.g. '@' symbol).");
      return;
    }
    if (!name.trim()) {
      setErrorMsg("Please provide your name or nickname.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    setTimeout(() => {
      setIsLoading(false);
      onLogin(email.trim().toLowerCase(), name.trim());
    }, 850);
  };

  const handleSelectQuick = (entry: { email: string; name: string }) => {
    setEmail(entry.email);
    setName(entry.name);
    setErrorMsg("");
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center bg-[#10141a] text-[#dfe2eb] px-4 relative overflow-hidden"
      id="login_page_container"
    >
      {/* Decorative high-contrast ambient glow circle */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#8d917a]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#5a5a40]/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-[#181c22] border border-[#3d4a42]/35 rounded-[32px] p-8 shadow-2xl relative z-10"
        id="login_card_wrapper"
      >
        {/* Branding Title */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8d917a]/20 to-[#5a5a40]/30 border border-[#8d917a]/40 text-[#82f9c5] mb-3">
            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              translate
            </span>
          </div>
          <h1 className="text-3xl font-serif font-bold italic text-[#82f9c5] tracking-tight">
            SignBridge Suite
          </h1>
          <p className="text-sm text-[#bccac0] max-w-xs mx-auto">
            Authorized sign language model workspace & continuous tracker
          </p>
        </div>

        {/* Form panel block */}
        <form onSubmit={handleSubmit} className="space-y-5" id="user_login_form">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-3.5 bg-[#ba1a1a]/15 border border-[#ba1a1a]/30 rounded-2xl text-xs text-rose-300 font-medium"
              id="login_error_notif"
            >
              {errorMsg}
            </motion.div>
          )}

          {/* Email input field */}
          <div className="space-y-1.5 text-left">
            <label htmlFor="login_email" className="block text-xs uppercase font-bold tracking-widest text-[#bccac0] pl-1">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 material-symbols-outlined text-lg text-[#bccac0]/60">
                mail
              </span>
              <input
                id="login_email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                placeholder="keziahvickraman@gmail.com"
                className="w-full h-12 pl-11 pr-4 bg-[#1e242d] border border-[#3d4a42]/45 rounded-2xl text-sm text-white focus:outline-none focus:border-[#82f9c5] transition-all"
              />
            </div>
          </div>

          {/* Display Name input */}
          <div className="space-y-1.5 text-left">
            <label htmlFor="login_name" className="block text-xs uppercase font-bold tracking-widest text-[#bccac0] pl-1">
              Display Name
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 material-symbols-outlined text-lg text-[#bccac0]/60">
                person
              </span>
              <input
                id="login_name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                placeholder="Keziah Vickraman"
                className="w-full h-12 pl-11 pr-4 bg-[#1e242d] border border-[#3d4a42]/45 rounded-2xl text-sm text-white focus:outline-none focus:border-[#82f9c5] transition-all"
              />
            </div>
          </div>

          {/* Locked Indicator / Account Type */}
          <div className="bg-[#1e242d] border border-[#3d4a42]/20 p-4 rounded-2xl flex items-center justify-between text-left">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#82f9c5]">
                verified_user
              </span>
              <div>
                <span className="block text-[10px] text-[#bccac0] uppercase font-bold tracking-wider">Workspace Plan</span>
                <span className="text-xs font-bold text-[#82f9c5]">Free Tier Active</span>
              </div>
            </div>
            <span className="text-[9px] bg-[#82f9c5]/10 text-[#82f9c5] px-2 py-0.5 rounded font-bold uppercase border border-[#82f9c5]/30">
              No Fee
            </span>
          </div>

          {/* Submit Trigger action */}
          <button
            id="login_submit_btn"
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-2xl bg-[#82f9c5] text-[#002114] font-bold text-sm tracking-wide shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                <span>Opening SignBridge...</span>
              </>
            ) : (
              <>
                <span>Access Free Tier Client</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Pre-fill options */}
        <div className="mt-8 pt-6 border-t border-[#3d4a42]/20 text-left">
          <p className="text-xs text-[#bccac0] font-bold mb-3 uppercase tracking-wider pl-1">
            Or quick login with:
          </p>
          <div className="flex flex-col gap-2">
            {DEFAULTS_LIST.map((entry, idx) => (
              <button
                key={idx}
                id={`btn_quick_login_${idx}`}
                type="button"
                onClick={() => handleSelectQuick(entry)}
                className="w-full text-left px-4 py-2.5 bg-[#1e242d]/60 hover:bg-[#1e242d] border border-[#3d4a42]/20 hover:border-[#82f9c5]/30 rounded-xl flex items-center justify-between text-xs text-[#dfe2eb] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-[#82f9c5]">
                    account_circle
                  </span>
                  <div>
                    <span className="font-bold block text-[#dfe2eb]">{entry.name}</span>
                    <span className="text-[10px] text-[#bccac0] opacity-80">{entry.email}</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-xs text-[#bccac0]/60 group-hover:text-[#82f9c5] transition-colors">
                  double_arrow
                </span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
