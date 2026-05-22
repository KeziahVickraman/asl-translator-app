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
import LoginView from "./components/LoginView";
import { supabase } from "./supabaseClient";

// Helper to safely convert dynamic Supabase table rows from "entries" to standard TranslationHistoryItem type
function mapRowToHistoryItem(row: any): TranslationHistoryItem {
  let recognizedText = "";
  if (row.recognized_text !== undefined) {
    recognizedText = row.recognized_text;
  } else if (row.recognizedText !== undefined) {
    recognizedText = row.recognizedText;
  } else if (row.recognizedtext !== undefined) {
    recognizedText = row.recognizedtext;
  } else if (row.recognized !== undefined) {
    recognizedText = row.recognized;
  } else {
    // Dynamically fallback to find any extra string property that is not standard
    const key = Object.keys(row).find(
      (k) =>
        !["id", "text", "mode", "created_at", "timestamp"].includes(k) &&
        typeof row[k] === "string"
    );
    recognizedText = key ? row[key] : "";
  }

  const rawTime = row.created_at || row.timestamp || row.created_time || new Date().toISOString();
  let formattedTime = "";
  try {
    const d = new Date(rawTime);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    const timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (d.toDateString() === today.toDateString()) {
      formattedTime = `Today, ${timeStr}`;
    } else if (d.toDateString() === yesterday.toDateString()) {
      formattedTime = `Yesterday, ${timeStr}`;
    } else {
      formattedTime = `${d.toLocaleDateString([], { month: "short", day: "numeric" })}, ${timeStr}`;
    }
  } catch (err) {
    formattedTime = rawTime;
  }

  return {
    id: row.id?.toString() || ("hist-" + Date.now()),
    text: row.text || "",
    recognizedText: recognizedText,
    mode: row.mode || "camera",
    timestamp: formattedTime,
    language: row.language || row.dialect || "ASL",
  };
}

const DEFAULT_MOCK_HISTORY: TranslationHistoryItem[] = [
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
];

export default function App() {
  // User Authentication variables
  const [userEmail, setUserEmail] = useState<string>(() => localStorage.getItem("signbridge_user_email") || "");
  const [userName, setUserName] = useState<string>(() => localStorage.getItem("signbridge_user_name") || "");

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

  // Translation history list initialized from mock records, updated dynamically by Supabase
  const [history, setHistory] = useState<TranslationHistoryItem[]>(DEFAULT_MOCK_HISTORY);

  // 2. Fetch history on mount & subscribe to live Supabase Postgres updates
  useEffect(() => {
    const loadInitialHistory = async () => {
      try {
        let { data, error } = await supabase
          .from("entries")
          .select("*")
          .order("id", { ascending: false })
          .limit(30);
        
        if (error) {
          // Fallback to query without specific ID ordering if custom primary key was named otherwise
          const fb = await supabase.from("entries").select("*").limit(30);
          data = fb.data;
          error = fb.error;
        }

        if (!error && data) {
          if (data.length > 0) {
            const mappedItems = data.map(mapRowToHistoryItem);
            setHistory(mappedItems);
          } else {
            // Table was empty; set custom defaults
            setHistory(DEFAULT_MOCK_HISTORY);
          }
        } else {
          console.warn("Supabase loading history issue / empty callback:", error);
        }
      } catch (err) {
        console.warn("Supabase initial load error:", err);
      }
    };

    loadInitialHistory();

    // Set up Realtime listener to watch INSERTs on table "entries" and update state live
    const channel = supabase
      .channel("live_entries_channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "entries",
        },
        (payload) => {
          if (payload.new) {
            const mapped = mapRowToHistoryItem(payload.new);
            setHistory((prev) => {
              // Avoid duplicate entries if they were added locally by active instance
              if (prev.some((item) => item.id === mapped.id)) {
                return prev;
              }
              // Clean default placeholder data if user entries take place
              const cleanedPrev = prev.filter(item => !item.id.startsWith("hist-"));
              return [mapped, ...cleanedPrev];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Post items to Postgres storage live with self-healing fallback loops
  const addHistoryItem = async (text: string, recognizedText: string, logMode: "camera" | "text") => {
    const attempts = [
      { text, recognized_text: recognizedText, mode: logMode, user_email: userEmail, language: languageClass },
      { text, recognizedText: recognizedText, mode: logMode, user_email: userEmail, language: languageClass },
      { text, recognizedtext: recognizedText, mode: logMode, user_email: userEmail, language: languageClass },
      { text, recognized: recognizedText, mode: logMode, user_email: userEmail, language: languageClass },
      { text, mode: logMode, user_email: userEmail, language: languageClass }
    ];

    let insertedRecord = null;
    for (const payload of attempts) {
      try {
        const { data, error } = await supabase
          .from("entries")
          .insert([payload])
          .select();
        
        if (!error && data && data.length > 0) {
          insertedRecord = data[0];
          break;
        }
      } catch (err) {
        // Log & check next fallback
      }
    }

    if (insertedRecord) {
      const mapped = mapRowToHistoryItem(insertedRecord);
      setHistory((prev) => {
        if (prev.some((item) => item.id === mapped.id)) {
          return prev;
        }
        const cleanedPrev = prev.filter(item => !item.id.startsWith("hist-"));
        return [mapped, ...cleanedPrev];
      });
    } else {
      // Local fallback representation if server connection drops or Supabase table entries isn't fully configured
      const localItem: TranslationHistoryItem = {
        id: "hist-local-" + Date.now(),
        timestamp: "Now",
        text,
        recognizedText,
        mode: logMode,
        language: languageClass
      };
      setHistory((prev) => {
        const cleanedPrev = prev.filter(item => !["hist-1", "hist-2", "hist-3"].includes(item.id));
        return [localItem, ...cleanedPrev];
      });
    }
  };

  const handleLogin = (email: string, name: string) => {
    localStorage.setItem("signbridge_user_email", email);
    localStorage.setItem("signbridge_user_name", name);
    setUserEmail(email);
    setUserName(name || email.split("@")[0]);
  };

  const handleLogout = () => {
    localStorage.removeItem("signbridge_user_email");
    localStorage.removeItem("signbridge_user_name");
    setUserEmail("");
    setUserName("");
    setMode("home");
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

  if (!userEmail) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className={`min-h-screen flex flex-col bg-[#10141a] text-[#dfe2eb] overflow-x-hidden ${highContrast ? "contrast-125" : ""}`}>
      
      {/* Top Banner Branding Header */}
      <TopAppBar
        currentMode={mode}
        userEmail={userEmail}
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
                userEmail={userEmail}
                userName={userName}
                onLogout={handleLogout}
                recentHistory={history}
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
