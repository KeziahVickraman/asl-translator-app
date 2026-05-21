import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { SignResult, DisplayMode, TranslationHistoryItem } from "../types";

interface TranscriptionViewProps {
  languageClass: "ASL" | "Auslan" | "BSL";
  onAddHistoryItem: (text: string, recognized: string, mode: "camera" | "text") => void;
}

export default function TranscriptionView({
  languageClass,
  onAddHistoryItem,
}: TranscriptionViewProps) {
  const [inputText, setInputText] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [signResults, setSignResults] = useState<SignResult[]>([
    {
      type: "WORD",
      word: "Hello",
      description: "Flat palm, moving outward from forehead.",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD--Irz_P_aMe8l_hKPe29c7SfKlMmqaHl_Greyeb6WQeN4ANd0bbUy2N7Ur2SEqRYAEDGkD1w3PLJherLHgTQgnr9rx54MHFRrpCmkHbdm_rZftXeAaIb940SV2fN_Acy4mL1VPXTYKubIuIsjZQYxRU9A_eQeTKHPv_JFQP0BTytC-wTeid3WJdtaT66xBaHXLgOZ837y8aJABT7XhWlCepXxmvY4flHd8vQnhZ5-Z1Fcqg8r9jpN0BLUWSW_pNF7TXR24e0Ntq0",
      category: "Basics"
    },
    {
      type: "FINGERSPELLING",
      word: "SpaceX",
      isUnknown: true,
      letters: [
        { char: "S", icon: "front_hand" },
        { char: "P", icon: "back_hand" },
        { char: "A", icon: "pan_tool_alt" },
        { char: "C", icon: "hand_gesture" },
        { char: "E", icon: "back_hand" },
        { char: "X", icon: "front_hand" }
      ]
    },
    {
      type: "WORD",
      word: "Launch",
      description: "One hand moving upwards from the other palm gesture.",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCnHnqSxLjKkiTFVnRraUJIKi_U2JrU4OzC7WAc0Z10ScajPqt3CBKO0uMgSQu4ivHaaGFrj_Gma8PO24XN20T18TgkqnpxpcsdXjOQuCWQNm7p56uFiUjIvPlhiEwfbSegsWmbEsElYdDoidt7esHuseraI_An2uP_UmV-EjLkXwXplEg7ftZmbYvV4mHqYcyrySTfAaoaF-RAgMnf0zNnvgI7XC4SUpbFb1eABZrl9IRw3HRghokFOPP6AfAurJjsenA6rsbfk-0"
    }
  ]);

  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  // Bind Web Speech API webkitSpeechRecognition
  useEffect(() => {
    // Check web speech API support
    const SpeechClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechClass) {
      const recInstance = new SpeechClass();
      recInstance.continuous = false;
      recInstance.interimResults = false;
      recInstance.lang = "en-US";

      recInstance.onstart = () => {
        setIsListening(true);
      };

      recInstance.onresult = (e: any) => {
        const textValue = e.results[0][0].transcript;
        setInputText(textValue);
        setIsListening(false);
        // Automatically translate immediately
        handleTranslate(textValue);
      };

      recInstance.onerror = (e: any) => {
        console.error("Speech recognition error:", e);
        setIsListening(false);
      };

      recInstance.onend = () => {
        setIsListening(false);
      };

      setRecognitionInstance(recInstance);
    }
  }, [languageClass]);

  // Translate command with API call
  const handleTranslate = async (textToSubmit?: string) => {
    const finalQuery = textToSubmit || inputText;
    if (!finalQuery || !finalQuery.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: finalQuery,
          signLanguage: languageClass,
        }),
      });
      const data = await response.json();
      if (data.signResults) {
        setSignResults(data.signResults);
        onAddHistoryItem(finalQuery, `${data.signResults.length} signs generated`, "text");
      }
    } catch (e) {
      console.error("Failed translation request:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle microphone
  const toggleListening = () => {
    if (isListening) {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
      setIsListening(false);
    } else {
      if (recognitionInstance) {
        try {
          recognitionInstance.start();
        } catch (err) {
          console.warn("Speech API start failed", err);
        }
      } else {
        // Simple simulator prompt in case mic permission blocked / browser not Chrome
        setIsListening(true);
        // Cycle simulated conversational text after 2.5s delay
        setTimeout(() => {
          const simulatedConversations = [
            "Can you help me please?",
            "Hello, launch SpaceX!",
            "I need a friend here.",
            "Sorry, can you show me the way?",
            "Thank you friend"
          ];
          const choice = simulatedConversations[Math.floor(Math.random() * simulatedConversations.length)];
          setInputText(choice);
          setIsListening(false);
          handleTranslate(choice);
        }, 2200);
      }
    }
  };

  // Play word synthesis
  const handleReadAloud = (term?: string) => {
    const textToSpeak = term || inputText;
    if (!textToSpeak) return;

    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="flex-grow flex flex-col max-w-2xl mx-auto w-full px-5 py-6 pb-28"
    >
      {/* Input container workspace */}
      <section className="mb-8 space-y-5" id="transcribe_input_sec">
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full h-32 bg-white border-2 border-[#e2e2da] rounded-3xl px-5 py-4 font-normal text-base text-[#33332d] focus:border-[#8d917a] focus:outline-none focus:ring-0 transition-all resize-none placeholder:text-[#8a8a7c]/40 shadow-sm"
            placeholder="Type or tap the mic to translate..."
          />
          
          <div className="absolute bottom-4 right-4 flex items-center gap-3">
            {inputText.trim() && (
              <button
                onClick={() => handleTranslate()}
                title="Translate Text"
                className="flex items-center gap-1.5 px-4.5 py-1.5 bg-[#8d917a] hover:bg-[#7a7e67] text-white rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">translate</span>
                Translate
              </button>
            )}

            <button
              onClick={() => handleReadAloud()}
              disabled={!inputText.trim()}
              title="Speak phrase aloud"
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#5a5a40] hover:bg-[#464632] text-white rounded-full text-xs font-bold disabled:opacity-[0.25] transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">volume_up</span>
              Read Aloud
            </button>
          </div>
        </div>

        {/* Big voice mic trigger layout */}
        <div className="flex flex-col items-center justify-center py-2" id="voice_recording_widget">
          <button
            onClick={toggleListening}
            aria-label={isListening ? "Stop listening" : "Start listening"}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-md ${
              isListening
                ? "bg-[#ba1a1a] text-white ring-8 ring-[#ba1a1a]/20 animate-pulse"
                : "bg-[#8d917a] text-white hover:scale-105 active:scale-95"
            } cursor-pointer`}
          >
            <span
              className="material-symbols-outlined text-4xl"
              style={{ fontVariationSettings: "'wght' 500" }}
            >
              {isListening ? "stop" : "mic"}
            </span>
          </button>
          
          <p
            className={`mt-4 font-bold text-sm text-[#8a8a7c] ${
              isListening ? "text-[#8d917a] animate-pulse font-bold" : ""
            }`}
          >
            {isListening ? "Listening (or simulated speech inputs)..." : "Tap to speak"}
          </p>
        </div>
      </section>

      {/* Structured dynamic visualization lists output */}
      <section className="space-y-5" id="visual_trans_output">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold italic text-[#5a5a40] tracking-tight">
            Visual Translation
          </h2>
          <span className="text-[11px] uppercase tracking-wider font-bold text-[#5a5a40] px-3.5 py-1 bg-[#e2e2da]/50 rounded-full border border-[#e2e2da]">
            {languageClass} Mode
          </span>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-sm text-[#6a6a5c] flex flex-col items-center gap-2 bg-white rounded-3xl border border-[#e2e2da] shadow-sm">
            <span className="material-symbols-outlined animate-spin text-3xl text-[#8d917a]">sync</span>
            <p className="font-semibold">Gemini processing phrase structure...</p>
            <p className="text-xs text-[#6a6a5c]/60 max-w-xs">Building customized fingerspelling sequences and descriptive guides</p>
          </div>
        ) : signResults.length === 0 ? (
          <div className="text-center py-16 text-xs text-[#6a6a5c] bg-white rounded-3xl border border-[#e2e2da] shadow-sm font-medium">
            No active translations. Enter words or click the talk button to see ASL visualizer results.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {signResults.map((result, index) => {
              const isWord = result.type === "WORD";

              if (isWord) {
                return (
                  <div
                    key={index}
                    className="bg-white rounded-3xl p-5 flex gap-5 items-center border-l-8 border-l-[#8d917a] border-y border-r border-[#e2e2da] hover:shadow-md transition-all shadow-sm group"
                  >
                    <div className="w-24 h-24 bg-[#f5f5f0] rounded-2xl flex items-center justify-center overflow-hidden border border-[#e2e2da] flex-shrink-0 relative">
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        alt={`Sign demonstration for ${result.word}`}
                        src={result.imageUrl}
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-1.5 right-1.5 px-2 py-0.5 bg-[#8d917a] text-[9px] font-bold text-white rounded uppercase tracking-wider">
                        {result.category || "Word"}
                      </div>
                    </div>
                    
                    <div className="flex-grow">
                      <p className="text-[10px] font-bold text-[#8d917a] font-serif italic uppercase tracking-wider">
                        WORD SIGN
                      </p>
                      <h3 className="text-xl font-serif font-bold italic text-[#5a5a40] mt-0.5">
                        {result.word}
                      </h3>
                      <p className="text-xs text-[#6a6a5c] mt-1.5 leading-relaxed italic opacity-90">
                        {result.description}
                      </p>
                    </div>

                    <button
                      onClick={() => handleReadAloud(`Sign for ${result.word}. ${result.description}`)}
                      title="Audio Description"
                      className="w-10 h-10 rounded-full bg-[#f5f5f0] border border-[#e2e2da]/70 hover:bg-[#8d917a] hover:text-white text-[#5a5a40] transition-colors flex items-center justify-center cursor-pointer flex-shrink-0 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        volume_up
                      </span>
                    </button>
                  </div>
                );
              } else {
                // Return awesome fingerspelling sequence
                return (
                  <div
                    key={index}
                    className="bg-white rounded-3xl p-6 border-l-8 border-l-[#5a5a40] border-y border-r border-[#e2e2da] hover:shadow-md transition-all shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[10px] font-bold text-[#8d917a] uppercase tracking-wider">
                          UNKNOWN CONCEPT: FINGERSPELLING
                        </p>
                        <h3 className="text-xl font-serif font-bold italic text-[#5a5a40] mt-0.5">
                          {result.word}
                        </h3>
                      </div>
                      <span className="px-2.5 py-0.5 bg-[#5a5a40]/10 text-[#5a5a40] border border-[#5a5a40]/25 rounded-full text-[10px] font-bold tracking-wider uppercase">
                        Alpha-Beta Spelling
                      </span>
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                      {result.letters?.map((letter, lIdx) => (
                        <div
                          key={lIdx}
                          className="flex-shrink-0 w-20 flex flex-col items-center gap-1.5"
                        >
                          <div className="w-20 h-24 bg-[#f5f5f0] rounded-2xl flex flex-col items-center justify-center border border-[#e2e2da] hover:border-[#8d917a] transition-all group shadow-sm">
                            <span 
                              className="material-symbols-outlined text-3xl text-[#5a5a40] group-hover:scale-105 transition-transform"
                              aria-hidden="true"
                            >
                              {letter.icon || "front_hand"}
                            </span>
                            <span className="text-[9px] font-bold text-[#6a6a5c] mt-1 p-0.5 px-1.5 bg-white rounded-md border border-[#e2e2da]">
                              {letter.char}
                            </span>
                          </div>
                          <span className="text-lg font-serif font-bold italic text-[#5a5a40] select-none">
                            {letter.char}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}
      </section>
    </motion.div>
  );
}
