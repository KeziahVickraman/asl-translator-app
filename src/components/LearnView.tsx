import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SignItem } from "../types";

export default function LearnView() {
  const [signs, setSigns] = useState<SignItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All Signs");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Custom states for interactive view
  const [selectedSign, setSelectedSign] = useState<SignItem | null>(null);
  const [isChallengeActive, setIsChallengeActive] = useState<boolean>(false);
  const [challengeStep, setChallengeStep] = useState<number>(0);
  const [score, setScore] = useState<number>(0);

  const categories = ["All Signs", "Basics", "Family", "Emotions", "Emergency", "Numbers"];

  const fetchSignsList = async (categoryStr: string, queryStr: string) => {
    setIsLoading(true);
    try {
      const catParam = categoryStr === "All Signs" ? "" : categoryStr;
      const url = `/api/learn?category=${encodeURIComponent(catParam)}&search=${encodeURIComponent(queryStr)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.signs) {
        setSigns(data.signs);
      }
    } catch (e) {
      console.error("Error fetching sign list data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSignsList(activeCategory, searchQuery);
  }, [activeCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSignsList(activeCategory, searchQuery);
  };

  // Pre-configured Daily Challenge questions list
  const CHALLENGE_QUESTIONS = [
    {
      word: "Help",
      options: [
        "Rub hand in circle over chest",
        "Place closed thumb-up hand on non-dominant palm, lift together",
        "Touch fingertips to lips and move downward"
      ],
      correctIndex: 1,
      hint: "Usually signed during priority/alert scenarios."
    },
    {
      word: "Thank You",
      options: [
        "Touch flat palm to chin and bend fingers backward",
        "Finger interlock",
        "Touch fingertips to lips, then bring hand down and forward"
      ],
      correctIndex: 2,
      hint: "Pragmatic response of gratitude."
    },
    {
      word: "Friend",
      options: [
        "Interlock curved index fingers clockwise and counter-clockwise",
        "Circular rubs over chest",
        "Flat salute from forehead"
      ],
      correctIndex: 0,
      hint: "Refers to a close relationship or peer."
    }
  ];

  const handleAnswerSubmit = (optionIndex: number) => {
    if (optionIndex === CHALLENGE_QUESTIONS[challengeStep].correctIndex) {
      setScore(score + 1);
    }
    
    if (challengeStep + 1 < CHALLENGE_QUESTIONS.length) {
      setChallengeStep(challengeStep + 1);
    } else {
      setChallengeStep(-1); // Finished flag
    }
  };

  const resetChallenge = () => {
    setChallengeStep(0);
    setScore(0);
    setIsChallengeActive(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="flex-grow flex flex-col max-w-5xl mx-auto w-full px-5 py-6 pb-28"
    >
      {/* Upper search and filter section */}
      <section className="space-y-5 mb-8" id="learn_upper_sec">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-serif font-bold italic text-[#5a5a40]">Learn Signs</h2>
          <p className="text-sm text-[#8a8a7c] font-medium">
            Master the core essentials of sign language language standards with interactive visual guides.
          </p>
        </div>

        {/* Search input bar form */}
        <form onSubmit={handleSearchSubmit} className="relative select-all">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#8a8a7c]" aria-hidden="true">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search our database or describe any sign word to generate descriptive steps..."
            className="w-full h-[56px] pl-12 pr-16 bg-white rounded-2xl border border-[#e2e2da] focus:border-[#8d917a] focus:outline-none focus:ring-0 text-sm placeholder:text-[#8a8a7c]/40 transition-all text-[#33332d] shadow-sm font-medium"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8d917a] hover:text-[#5a5a40] px-3.5 py-1.5 bg-[#f5f5f0] rounded-xl border border-[#e2e2da] transition-all shadow-sm cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Scrollable chip filters */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar" id="category_chips_deck">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-[#8d917a] text-white shadow-sm font-bold"
                    : "bg-white border border-[#e2e2da] text-[#8a8a7c] hover:bg-[#e2e2da]/40 hover:text-[#33332d]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Grid learning section rendering signs */}
      <section className="space-y-4" id="learning_cards_grid">
        {isLoading ? (
          <div className="py-20 text-center text-xs text-[#6a6a5c] font-medium flex flex-col items-center gap-2">
            <span className="material-symbols-outlined animate-spin text-2xl text-[#8d917a]">sync</span>
            Querying active indexes...
          </div>
        ) : signs.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#6a6a5c] px-6 bg-white rounded-3xl border border-[#e2e2da] shadow-sm">
            <span className="material-symbols-outlined text-3xl mb-1 text-[#8d917a]">info</span>
            <p className="font-semibold text-[#5a5a40]">No direct sign matches found offline.</p>
            <p className="text-xs text-[#6a6a5c]/60 mt-1">
              Press "Search" above to command Gemini to instantly generate this sign card dynamically!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {signs.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedSign(item)}
                className="bg-white rounded-3xl p-3 transition-all active:scale-[0.98] cursor-pointer hover:border-[#8d917a] border border-[#e2e2da] flex flex-col justify-between shadow-sm hover:shadow-md group"
              >
                <div className="aspect-square rounded-2xl overflow-hidden bg-[#f5f5f0] relative mb-3">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    alt={`Illustration for ${item.word}`}
                    src={item.imageUrl}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-[#8d917a] rounded-sm text-[9px] font-extrabold text-white tracking-widest uppercase shadow-sm">
                    {item.category}
                  </div>
                  {item.isGenerated && (
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-[#5a5a40] text-white rounded text-[8px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                      <span className="material-symbols-outlined text-[10px]">auto_awesome</span>
                      AI-Made
                    </div>
                  )}
                </div>

                <div className="px-1.5 pb-1">
                  <h3 className="font-serif font-bold italic text-[#5a5a40] text-sm tracking-wide">
                    {item.word}
                  </h3>
                  <p className="text-[11px] text-[#6a6a5c] truncate opacity-90 mt-0.5 font-medium">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Daily Challenge Promo banner */}
      <section className="mt-8 mb-6" id="promo_banner_challenge">
        <div className="w-full bg-gradient-to-br from-[#5a5a40] to-[#8d917a] p-6 rounded-[32px] border border-[#cbd2b1]/20 shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-[#e2e2da]">
              <span className="material-symbols-outlined text-xl">bolt</span>
              <span className="font-bold text-xs tracking-wider uppercase">Active Task Challenge</span>
            </div>
            
            <h3 className="text-2xl font-serif font-bold italic text-white tracking-tight">
              Master 5 Emergency Signs
            </h3>
            
            <p className="text-xs text-white/90 max-w-sm leading-relaxed font-medium">
              Complete today's quick visual comprehension quiz to earn the "Safety First" priority milestone.
            </p>
            
            <button
              onClick={() => {
                setChallengeStep(0);
                setScore(0);
                setIsChallengeActive(true);
              }}
              className="mt-2.5 px-6 h-11 bg-white hover:bg-[#f5f5f0] text-[#5a5a40] font-bold text-xs rounded-xl self-start tracking-wider transition-all active:scale-95 cursor-pointer uppercase shadow-sm"
            >
              Start Quiz Challenge
            </button>
          </div>
        </div>
      </section>

      {/* Dynamic Detail Card Modal */}
      <AnimatePresence>
        {selectedSign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5 cursor-pointer"
            onClick={() => setSelectedSign(null)}
          >
            <motion.div
              initial={{ scale: 0.93, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.93, y: 15 }}
              className="w-full max-w-md bg-white rounded-[32px] border border-[#e2e2da] overflow-hidden shadow-2xl p-2 cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-video w-full bg-[#f5f5f0] overflow-hidden rounded-2xl">
                <img
                  className="w-full h-full object-cover"
                  src={selectedSign.imageUrl}
                  alt={selectedSign.word}
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => setSelectedSign(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-[#dfe2eb] hover:bg-black/90 flex items-center justify-center material-symbols-outlined text-sm cursor-pointer"
                >
                  close
                </button>
                <div className="absolute bottom-3 left-4 bg-[#8d917a] text-white text-[10px] font-extrabold tracking-widest uppercase px-2.5 py-0.5 rounded-md shadow">
                  {selectedSign.category} Guide
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-2xl font-serif font-bold italic text-[#33332d] tracking-tight flex items-center gap-2">
                    {selectedSign.word}
                  </h3>
                  {selectedSign.usage && (
                    <p className="text-xs text-[#8a8a7c] font-semibold italic mt-1">{selectedSign.usage}</p>
                  )}
                </div>

                <div className="bg-[#f5f5f0] p-5 rounded-2xl border border-[#e2e2da]">
                  <h4 className="text-xs font-serif font-bold italic text-[#8d917a] tracking-wide uppercase mb-1.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">front_hand</span>
                    Instructional Gesture steps:
                  </h4>
                  <p className="text-sm text-[#33332d] font-medium leading-relaxed">
                    {selectedSign.description}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      if ("speechSynthesis" in window) {
                        const utterance = new SpeechSynthesisUtterance(`Word: ${selectedSign.word}. Instruction: ${selectedSign.description}`);
                        window.speechSynthesis.speak(utterance);
                      }
                    }}
                    className="flex-1 py-3 text-xs font-bold rounded-2xl bg-white hover:bg-[#f5f5f0] text-[#5a5a40] border border-[#e2e2da] flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">volume_up</span>
                    Speak Out
                  </button>
                  <button
                    onClick={() => setSelectedSign(null)}
                    className="flex-1 py-3 text-xs font-bold rounded-2xl bg-[#8d917a] hover:bg-[#7a7e67] text-white flex items-center justify-center cursor-pointer shadow-sm transition-all"
                  >
                    Got It
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quiz Challenge Interactive Overlay */}
      <AnimatePresence>
        {isChallengeActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-[32px] border border-[#e2e2da] p-6 space-y-5 shadow-2xl"
            >
              <div className="flex justify-between items-center pb-3 border-b border-[#e2e2da]">
                <h3 className="text-base font-serif font-bold italic text-[#5a5a40] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-lg">school</span>
                  Sign Comprehension Test
                </h3>
                <button
                  onClick={resetChallenge}
                  className="material-symbols-outlined text-[#8a8a7c] hover:text-[#33332d] text-sm cursor-pointer p-1 rounded-full hover:bg-[#f5f5f0]"
                >
                  close
                </button>
              </div>

              {challengeStep >= 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#8d917a] font-serif italic uppercase tracking-wide font-bold">
                      Question {challengeStep + 1} of {CHALLENGE_QUESTIONS.length}
                    </span>
                    <span className="text-[#6a6a5c] font-semibold">Current Score: {score}</span>
                  </div>

                  <h4 className="text-lg font-serif font-bold italic text-[#33332d] leading-tight">
                    Which gesture description correctly represents the sign: <span className="text-[#8d917a] italic">"{CHALLENGE_QUESTIONS[challengeStep].word}"</span>?
                  </h4>

                  <div className="space-y-2">
                    {CHALLENGE_QUESTIONS[challengeStep].options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswerSubmit(idx)}
                        className="w-full p-3 bg-[#f5f5f0] hover:bg-[#e2e2da]/40 hover:border-[#8d917a]/50 text-left text-xs rounded-2xl border border-[#e2e2da] text-[#33332d] font-medium transition-all cursor-pointer flex items-start gap-2.5 shadow-sm"
                      >
                        <span className="w-5 h-5 rounded-full bg-white border border-[#e2e2da] flex items-center justify-center text-[10px] font-bold text-[#5a5a40]">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1 mt-0.5 leading-relaxed">{option}</span>
                      </button>
                    ))}
                  </div>

                  <p className="text-[11px] text-[#6a6a5c] italic pt-1 flex items-center gap-1 bg-[#f5f5f0]/50 p-3 rounded-2xl border border-[#e2e2da]">
                    <span className="material-symbols-outlined text-[13px] text-[#8d917a]">lightbulb</span>
                    Hint: {CHALLENGE_QUESTIONS[challengeStep].hint}
                  </p>
                </div>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <span className="material-symbols-outlined text-5xl text-[#8d917a] animate-bounce">
                    workspace_premium
                  </span>
                  <div>
                    <h4 className="text-xl font-serif font-bold italic text-[#33332d]">Challenge Completed!</h4>
                    <p className="text-xs text-[#6a6a5c] mt-1 max-w-xs mx-auto font-medium">
                      You scored {score} out of {CHALLENGE_QUESTIONS.length} on today's Emergency terminology set!
                    </p>
                  </div>
                  
                  <div className="bg-[#e2e2da]/50 border border-[#e2e2da] p-3 rounded-2xl inline-block text-xs font-bold px-4 text-[#5a5a40]">
                    ★ "Safety First" Badge Earned!
                  </div>

                  <button
                    onClick={resetChallenge}
                    className="w-full py-3 bg-[#8d917a] text-white hover:bg-[#7a7e67] font-bold text-xs rounded-2xl uppercase tracking-wider cursor-pointer shadow-sm transition-all"
                  >
                    Finish and return to study
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
