import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { DisplayMode, SignResult, TranslationHistoryItem } from "./types";
import TopAppBar from "./components/TopAppBar";
import BottomNavBar from "./components/BottomNavBar";
import HomeView from "./components/HomeView";
import CameraView from "./components/CameraView";
import TranscriptionView from "./components/TranscriptionView";
import LearnView from "./components/LearnView";
import SettingsView from "./components/SettingsView";

export default function App() {
  // 1. Unified state shape mapping exactly to requested specs
  const [mode, setMode] = useState<DisplayMode>("home");
  const [inputText, setInputText] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");
  const [recognisedSign, setRecognisedSign] = useState<string>("Thank you");
  const [signResults, setSignResults] = useState<SignResult[]>([]);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [subscriptionTier, setSubscriptionTier] = useState<"basic" | "pro" | "enterprise">("basic");

  // Core configuration parameters
  const [languageClass, setLanguageClass] = useState<"ASL" | "Auslan" | "BSL">("ASL");
  const [textSize, setTextSize] = useState<number>(18);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [hapticFeedback, setHapticFeedback] = useState<boolean>(true);
  const [aiNoiseSuppression, setAiNoiseSuppression] = useState<boolean>(false);
  
  // Slide-out hamburger navigation drawer state
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Translation history list initialized with mock records
  const [history, setHistory] = useState<TranslationHistoryItem[]>([
    {
      id: "hist-1",
      timestamp: "Today, 5:40 PM",
      text: "How are you",
      recognizedText: "How are you (ASL Sequence)",
      mode: "text"
    },
    {
      id: "hist-2",
      timestamp: "Today, 5:35 PM",
      text: "Webcam Gesture",
      recognizedText: "Thank you for helping me navigate this.",
      mode: "camera"
    },
    {
      id: "hist-3",
      timestamp: "Yesterday, 3:12 PM",
      text: "Hello launch",
      recognizedText: "Hello launch (Fingerspelling & Word)",
      mode: "text"
    }
  ]);

  // Sync state values on changes
  const addHistoryItem = (text: string, recognizedText: string, logMode: "camera" | "text") => {
    const newItem: TranslationHistoryItem = {
      id: "hist-" + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text,
      recognizedText,
      mode: logMode
    };
    setHistory((prev) => [newItem, ...prev]);
  };

  const handleStartCamera = () => {
    setMode("camera");
    setIsCameraActive(true);
  };

  const handleStartTranslation = () => {
    setMode("text");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`min-h-screen flex flex-col bg-[#10141a] text-[#dfe2eb] overflow-x-hidden ${highContrast ? "contrast-125" : ""}`}>
      
      {/* Top Banner Branding Header */}
      <TopAppBar
        currentMode={mode}
        userEmail="keziahvickraman@gmail.com"
        onNavigate={setMode}
        onToggleSidebar={toggleSidebar}
      />

      {/* Main Container viewport */}
      <main className="flex-grow pt-20 pb-28 min-h-[calc(100vh-10rem)] w-full relative z-10">
        <AnimatePresence mode="wait">
          {mode === "home" && (
            <motion.div key="home" className="w-full flex flex-col">
              <HomeView
                onStartCamera={handleStartCamera}
                onStartTranslation={handleStartTranslation}
                onNavigate={setMode}
                subscriptionTier={subscriptionTier}
              />
            </motion.div>
          )}

          {mode === "camera" && (
            <motion.div key="camera" className="w-full flex flex-col">
              <CameraView
                languageClass={languageClass}
                textSize={textSize}
                onNavigate={setMode}
                onAddHistoryItem={addHistoryItem}
                recentHistory={history}
              />
            </motion.div>
          )}

          {mode === "text" && (
            <motion.div key="text" className="w-full flex flex-col">
              <TranscriptionView
                languageClass={languageClass}
                onAddHistoryItem={addHistoryItem}
              />
            </motion.div>
          )}

          {mode === "learn" && (
            <motion.div key="learn" className="w-full flex flex-col">
              <LearnView />
            </motion.div>
          )}

          {mode === "settings" && (
            <motion.div key="settings" className="w-full flex flex-col">
              <SettingsView
                languageClass={languageClass}
                onChangeLanguage={setLanguageClass}
                textSize={textSize}
                onChangeTextSize={setTextSize}
                highContrast={highContrast}
                onToggleHighContrast={() => setHighContrast(!highContrast)}
                hapticFeedback={hapticFeedback}
                onToggleHapticFeedback={() => setHapticFeedback(!hapticFeedback)}
                aiNoiseSuppression={aiNoiseSuppression}
                onToggleAiNoiseSuppression={() => setAiNoiseSuppression(!aiNoiseSuppression)}
                subscriptionTier={subscriptionTier}
                onUpgradeTier={setSubscriptionTier}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation Drawer Menu Backdrop overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 cursor-pointer"
              id="sidebar_backdrop"
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.35 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-[#181c22] border-r border-[#3d4a42]/30 p-6 z-50 flex flex-col justify-between shadow-2xl"
              id="sidebar_menu"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-[#3d4a42]/20">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#82f9c5] font-bold">
                      translate
                    </span>
                    <h2 className="text-xl font-bold text-[#82f9c5] tracking-tight">
                      SignBridge
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="material-symbols-outlined text-[#bccac0] hover:text-[#dfe2eb] p-1.5 rounded-full cursor-pointer hover:bg-[#353940]/25"
                    aria-label="Close sidebar menu"
                  >
                    close
                  </button>
                </div>

                {/* Sidebar Navigation Options */}
                <nav className="flex flex-col gap-2">
                  {[
                    { mode: "home" as const, label: "Home Dashboard", icon: "home" },
                    { mode: "camera" as const, label: "Live Camera Translation", icon: "videocam" },
                    { mode: "text" as const, label: "Text & Voice to Sign", icon: "keyboard" },
                    { mode: "learn" as const, label: "Sign Learning Library", icon: "school" },
                    { mode: "settings" as const, label: "Accessibility Settings", icon: "settings" },
                  ].map((item) => {
                    const isTabActive = mode === item.mode;
                    return (
                      <button
                        key={item.mode}
                        onClick={() => {
                          setMode(item.mode);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-4.5 px-4 h-12 rounded-xl text-left text-sm font-semibold transition-all cursor-pointer ${
                          isTabActive
                            ? "bg-[#64dcaa] text-[#002114] shadow font-bold transform translate-x-1"
                            : "text-[#bccac0] hover:text-[#dfe2eb] hover:bg-[#262a31]"
                        }`}
                      >
                        <span className="material-symbols-outlined text-xl" aria-hidden="true">
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Sidebar footer status coordinates */}
              <div className="pt-4 border-t border-[#3d4a42]/15 space-y-2">
                <div className="flex items-center gap-2 text-xs text-[#bccac0] opacity-80">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#82f9c5] animate-pulse" />
                  <span>Cloud AI Server connected</span>
                </div>
                <div className="text-[10px] text-[#87948b] font-mono leading-relaxed">
                  SignBridge Suite v2.05<br />
                  Membership: <span className="text-[#82f9c5] font-bold uppercase">{subscriptionTier}</span><br />
                  Standard dialect: {languageClass}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Persistent global floating navigation bar */}
      <BottomNavBar currentMode={mode} onNavigate={setMode} />
    </div>
  );
}
