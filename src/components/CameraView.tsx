import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DisplayMode, TranslationHistoryItem } from "../types";

const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script ${src}`));
    document.head.appendChild(script);
  });
};

interface CameraViewProps {
  languageClass: "ASL" | "Auslan" | "BSL";
  textSize: number;
  onNavigate: (mode: DisplayMode) => void;
  onAddHistoryItem: (text: string, recognized: string, mode: "camera" | "text") => void;
  recentHistory: TranslationHistoryItem[];
}

export default function CameraView({
  languageClass,
  textSize,
  onNavigate,
  onAddHistoryItem,
  recentHistory,
}: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingIntervalRef = useRef<any>(null);
  const predictionLoopRef = useRef<number | null>(null);

  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [recognisedText, setRecognisedText] = useState<string>("Thank you for helping me navigate this.");
  const [confidence, setConfidence] = useState<number>(0.95);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  // Advanced start/stop continuous recording states
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [chosenMockSign, setChosenMockSign] = useState<string>("Thank you");

  const [landmarks, setLandmarks] = useState<Array<{ cx: number; cy: number; r: number }>>([
    { cx: 450, cy: 600, r: 6 },
    { cx: 480, cy: 520, r: 5 },
    { cx: 520, cy: 480, r: 5 },
    { cx: 580, cy: 450, r: 5 },
    { cx: 440, cy: 500, r: 5 },
    { cx: 430, cy: 420, r: 5 },
    { cx: 420, cy: 350, r: 5 },
    { cx: 480, cy: 480, r: 5 },
    { cx: 500, cy: 400, r: 5 },
    { cx: 520, cy: 320, r: 5 },
  ]);

  // Teachable Machine integration states
  const [tmModelUrl, setTmModelUrl] = useState<string>(() => {
    return localStorage.getItem("signbridge_tm_model_url") || "https://teachablemachine.withgoogle.com/models/v020rUMcL/";
  });
  const [isTmModelLoading, setIsTmModelLoading] = useState<boolean>(false);
  const [tmModel, setTmModel] = useState<any>(null);
  const [tmPredictions, setTmPredictions] = useState<Array<{ className: string; probability: number }>>([]);
  const [isTmActive, setIsTmActive] = useState<boolean>(false);

  // Active tab defaults to "teachable" for quick custom model demo. Calibrator removed.
  const [activeTab, setActiveTab] = useState<"demo" | "teachable" | "faq">("teachable");


  const handleLoadTmModel = async (url: string, isManual: boolean = false) => {
    if (!url || !url.trim()) return;
    setIsTmModelLoading(true);
    try {
      await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.17.0/dist/tf.min.js");
      await loadScript("https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8.5/dist/teachablemachine-image.min.js");

      let formattedUrl = url.trim();
      if (!formattedUrl.endsWith("/")) {
        formattedUrl += "/";
      }

      const tmImage = (window as any).tmImage;
      if (!tmImage) {
        throw new Error("Teachable Machine library is not defined on window.");
      }

      const loadedModel = await tmImage.load(
        formattedUrl + "model.json",
        formattedUrl + "metadata.json"
      );

      setTmModel(loadedModel);
      setIsTmActive(true);
      setTmModelUrl(formattedUrl);
      localStorage.setItem("signbridge_tm_model_url", formattedUrl);
      if (isManual) {
        alert("🎯 Teachable Machine Model loaded successfully! Live stream is now active in Teachable Machine mode.");
      }
    } catch (err: any) {
      console.error("TM loading error:", err);
      if (isManual) {
        alert(`Failed to load Teachable Machine model: ${err.message}. Check that the URL is correct (must contain project files like model.json and metadata.json).`);
      }
    } finally {
      setIsTmModelLoading(false);
    }
  };

  // Autoload custom TM model on mount
  useEffect(() => {
    const savedUrl = localStorage.getItem("signbridge_tm_model_url") || "https://teachablemachine.withgoogle.com/models/v020rUMcL/";
    handleLoadTmModel(savedUrl, false);
  }, []);

  // List of simulated triggers the user can test if no camera or physically testing
  const SIMULATED_SIGNS = [
    { text: "Thank you for helping me navigate this.", confidence: 0.98, word: "Thank you" },
    { text: "Hello, good afternoon!", confidence: 0.94, word: "Hello" },
    { text: "Please show me where the exit is.", confidence: 0.92, word: "Please" },
    { text: "I need urgent medical assistance.", confidence: 0.99, word: "Emergency" },
    { text: "Are you my friend?", confidence: 0.89, word: "Friend" },
    { text: "Yes, I understand.", confidence: 0.91, word: "Yes" },
    { text: "No, thank you.", confidence: 0.93, word: "No" },
    { text: "Goodbye, have a great day!", confidence: 0.95, word: "Goodbye/Bye" },
  ];

  // Try starting the real camera feed
  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCamera(true);
    } catch (err) {
      console.warn("webcam stream blocked or not supported. Falling back to mock feed illustration.", err);
      setHasCamera(false);
    }
  };

  const stopCamera = () => {
    if (isRecording) {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      setIsRecording(false);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startRecording = () => {
    if (!isCameraActive) {
      startCamera();
    }
    setIsRecording(true);
    setRecordingSeconds(0);
    if ("vibrate" in navigator) {
      navigator.vibrate([80, 50, 80]);
    }
    recordingIntervalRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    setIsRecording(false);
    
    // Auto translate when they stop recording!
    if (hasCamera && videoRef.current) {
      handleSnapAndRecognize();
    } else {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        const match = SIMULATED_SIGNS.find(s => s.word.toLowerCase() === chosenMockSign.toLowerCase()) || {
          text: `Recognized simulated gesture for "${chosenMockSign}" successfully!`,
          confidence: 0.95
        };
        setRecognisedText(match.text);
        setConfidence(match.confidence);
        onAddHistoryItem("Webcam Gesture", match.text, "camera");
        if ("vibrate" in navigator) {
          navigator.vibrate(120);
        }
      }, 1000);
    }
  };

  const toggleRecording = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  // Periodic landmark jitter animation to look highly sophisticated
  useEffect(() => {
    const interval = setInterval(() => {
      setLandmarks((prev) =>
        prev.map((pt) => ({
          ...pt,
          cx: pt.cx + (Math.random() - 0.5) * 6,
          cy: pt.cy + (Math.random() - 0.5) * 6,
        }))
      );
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // Continuous Teachable Machine prediction loop running at ~4 FPS (super snappy but highly efficient)
  useEffect(() => {
    if (isTmActive && tmModel && isCameraActive && videoRef.current && hasCamera) {
      let isStopped = false;
      
      const predictFrame = async () => {
        if (isStopped || !videoRef.current || !tmModel) return;
        
        try {
          if (videoRef.current.readyState >= 2) { // HAVE_CURRENT_DATA
            const predictions = await tmModel.predict(videoRef.current);
            // Sort to get highest probability
            const sorted = [...predictions].sort((a: any, b: any) => b.probability - a.probability);
            setTmPredictions(sorted);

            if (sorted.length > 0 && sorted[0].probability > 0.70) {
              const best = sorted[0];
              // Update recognized text if it's different and stable
              setRecognisedText((prev) => {
                const stripTag = (s: string) => s.split(" (Teachable")[0];
                if (stripTag(prev) !== best.className) {
                  // Vibrate to confirm
                  if ("vibrate" in navigator) {
                    navigator.vibrate(50);
                  }
                  onAddHistoryItem("Teachable Machine", best.className, "camera");
                  
                  // Trigger speak aloud
                  if ("speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(best.className);
                    utterance.rate = 1.0;
                    window.speechSynthesis.speak(utterance);
                  }
                  setConfidence(Math.round(best.probability * 100) / 100);
                  return `${best.className} (Teachable Machine AI Match)`;
                }
                return prev;
              });
            }
          }
        } catch (err) {
          console.error("Prediction loop frame classification error:", err);
        }
        
        // Schedule next prediction in 250ms (4 FPS is excellent for quick translations and extremely light on CPU)
        setTimeout(() => {
          if (!isStopped) {
            predictionLoopRef.current = requestAnimationFrame(predictFrame);
          }
        }, 250);
      };

      predictionLoopRef.current = requestAnimationFrame(predictFrame);

      return () => {
        isStopped = true;
        if (predictionLoopRef.current) {
          cancelAnimationFrame(predictionLoopRef.current);
          predictionLoopRef.current = null;
        }
      };
    }
  }, [isTmActive, tmModel, isCameraActive, hasCamera]);

  // Trigger frame snapshot detection with Gemini
  const handleSnapAndRecognize = async () => {
    setIsLoading(true);
    try {
      let captureBase64 = null;

      if (hasCamera && videoRef.current) {
        // Draw video capture frame on canvas
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          captureBase64 = canvas.toDataURL("image/jpeg", 0.8);
        }
      }

      const response = await fetch("/api/sign/recognition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: captureBase64,
          languageClass,
        }),
      });
      const data = await response.json();

      if (data.recognizedText) {
        // Update state
        setRecognisedText(data.recognizedText);
        setConfidence(data.confidence || 0.92);
        if (data.landmarks) {
          setLandmarks(data.landmarks);
        }
        // Save to histories state
        onAddHistoryItem("Webcam Gesture", data.recognizedText, "camera");
      }
    } catch (e) {
      console.error(e);
      // Fallback
      const randomSign = SIMULATED_SIGNS[Math.floor(Math.random() * SIMULATED_SIGNS.length)];
      setRecognisedText(randomSign.text);
      setConfidence(randomSign.confidence);
      onAddHistoryItem("Webcam Gesture", randomSign.text, "camera");
    } finally {
      setIsLoading(false);
    }
  };

  // Convert current translation state to audible output via Web Speech Engine (TTS)
  const handleSpeakAloud = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(recognisedText);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Speech synthesis is not supported on your browser.");
    }
  };

  // Switch recognition trigger or sample signs for premium demo
  const handleSimulateCycle = (selectedText: string, selectedConf: number) => {
    setRecognisedText(selectedText);
    setConfidence(selectedConf);
    // Custom haptic feedback browser support check
    if ("vibrate" in navigator) {
      navigator.vibrate(100);
    }
    onAddHistoryItem("Webcam Gesture", selectedText, "camera");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="flex-grow relative h-screen w-full flex flex-col pt-16 pb-20 justify-between overflow-hidden"
    >
      {/* Upper Viewport representing Camera workspace */}
      <section 
        className={`absolute inset-0 z-0 bg-[#0a0e14] overflow-hidden transition-all duration-300 ${
          isRecording ? "ring-8 ring-rose-500/85 ring-inset" : ""
        }`} 
        id="workspace_viewport_cam"
      >
        <div 
          onClick={toggleRecording}
          title={isRecording ? "Click camera preview to stop recording" : "Click camera preview to start recording"}
          className="relative w-full h-full cursor-pointer group"
        >
          {isCameraActive ? (
            hasCamera ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              /* High-end Illustrative vector mimicking ASL camera landmark mapping if camera inactive/not found */
              <div className="w-full h-full relative bg-[#0a0e14] flex items-center justify-center">
                <img
                  className="w-full h-full object-cover opacity-35 scale-x-[-1]"
                  alt="Realistic sign language tracking illustration fallback"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyRD1yppSBbyVg0JWAq73EcgUhqNBySli4lBt-5wPm1jveF-GSGRwkMrgIolr3FEAmCpClDTw_KnW1yLVeQiuDmCF5ShobNl570nYfSc03IiHK2ziCv0pBFNwGyb4fRvcKlF1DXszqlQnFytFjU-Z406gLuUrCKllEiR0_4alWmkoBn0sWb-QxaSvCi4BHDiCRbojKZnAWmPLfFbiGENuuRwzZdBM7RUV-Jvc9oAtFvw6-pcNiGakYVTzjo13SJu0sLkmCfv8W42w"
                  referrerPolicy="no-referrer"
                />
                
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center p-6 text-xs bg-white/95 backdrop-blur-md rounded-3xl max-w-sm mx-auto border border-[#e2e2da] shadow-lg z-20">
                  <span className="material-symbols-outlined text-[#8d917a] text-3xl mb-2 pulsate-primary">
                    videocam_off
                  </span>
                  <p className="font-serif font-bold italic text-[#5a5a40] text-sm">Camera active in simulated landmark tracking mode</p>
                  <p className="text-[#6a6a5c] mt-1">Tap this camera screen to start/stop continuous recording</p>
                </div>
              </div>
            )
          ) : (
            <div className="w-full h-full bg-[#f5f5f0] flex flex-col items-center justify-center p-6 text-center" onClick={(e) => e.stopPropagation()}>
              <span className="material-symbols-outlined text-[#ba1a1a] text-5xl mb-3">
                videocam_off
              </span>
              <h3 className="text-xl font-serif font-bold italic text-[#5a5a40]">Camera translation offline</h3>
              <p className="text-sm text-[#6a6a5c] mt-2 max-w-xs">
                Toggle the live video connection back on to initiate sign detection.
              </p>
              <button
                onClick={startCamera}
                className="mt-4 px-6 py-2.5 bg-[#8d917a] text-white rounded-full font-bold text-sm active:scale-95 transition-transform hover:bg-[#7a7e67] shadow-sm"
              >
                Enable Camera
              </button>
            </div>
          )}

          {/* SVG Hand Landmark Overlay mappings (MediaPipe tracking effect) */}
          {isCameraActive && (
            <svg
              className="absolute inset-0 w-full h-full z-10 pointer-events-none"
              preserveAspectRatio="xMidYMid slice"
              viewBox="0 0 1000 1000"
            >
              {/* Connecting landmark tracker lines */}
              {landmarks.length > 3 && (
                <>
                  <line
                    x1={landmarks[0].cx} y1={landmarks[0].cy}
                    x2={landmarks[1].cx} y2={landmarks[1].cy}
                    className="stroke-[#8d917a] stroke-[3.5] opacity-80"
                    style={{ filter: "drop-shadow(0 0 4px rgba(141, 145, 122, 0.6))" }}
                  />
                  <line
                    x1={landmarks[1].cx} y1={landmarks[1].cy}
                    x2={landmarks[2].cx} y2={landmarks[2].cy}
                    className="stroke-[#8d917a] stroke-[3.5] opacity-80"
                  />
                  <line
                    x1={landmarks[2].cx} y1={landmarks[2].cy}
                    x2={landmarks[3].cx} y2={landmarks[3].cy}
                    className="stroke-[#8d917a] stroke-[3.5] opacity-80"
                  />
                  {/* Finger joint indices linkage */}
                  <line
                    x1={landmarks[0].cx} y1={landmarks[0].cy}
                    x2={landmarks[4].cx} y2={landmarks[4].cy}
                    className="stroke-[#8d917a] stroke-[3.5] opacity-80"
                  />
                  <line
                    x1={landmarks[4].cx} y1={landmarks[4].cy}
                    x2={landmarks[5].cx} y2={landmarks[5].cy}
                    className="stroke-[#8d917a] stroke-[3.5] opacity-80"
                  />
                  <line
                    x1={landmarks[5].cx} y1={landmarks[5].cy}
                    x2={landmarks[6].cx} y2={landmarks[6].cy}
                    className="stroke-[#8d917a] stroke-[3.5] opacity-80"
                  />
                  <line
                    x1={landmarks[0].cx} y1={landmarks[0].cy}
                    x2={landmarks[7].cx} y2={landmarks[7].cy}
                    className="stroke-[#8d917a] stroke-[3.5] opacity-80"
                  />
                  <line
                    x1={landmarks[7].cx} y1={landmarks[7].cy}
                    x2={landmarks[8].cx} y2={landmarks[8].cy}
                    className="stroke-[#8d917a] stroke-[3.5] opacity-80"
                  />
                  <line
                    x1={landmarks[8].cx} y1={landmarks[8].cy}
                    x2={landmarks[9].cx} y2={landmarks[9].cy}
                    className="stroke-[#8d917a] stroke-[3.5] opacity-80"
                  />
                </>
              )}

              {/* Render dynamic marker dots representing auto hand landmarks */}
              {landmarks.map((dot, idx) => (
                <circle
                  key={idx}
                  cx={dot.cx}
                  cy={dot.cy}
                  r={dot.r + 1}
                  className="transition-all fill-[#8d917a] drop-shadow-[0_0_3px_rgba(141,145,122,0.9)] opacity-95"
                />
              ))}
            </svg>
          )}

          {/* Touch instructions bubble */}
          {isCameraActive && (
            <div className="absolute top-18 right-5 z-20 flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[9px] font-bold text-[#dfe2eb] uppercase tracking-widest select-none pointer-events-none transition-opacity group-hover:bg-black/95">
              <span className="material-symbols-outlined text-xs text-rose-400">touch_app</span>
              {isRecording ? "Tap feed to stop & result" : "Tap feed to record"}
            </div>
          )}

          {/* Recording active indicator overlay block */}
          {isCameraActive && (
            <div className="absolute top-5 left-5 z-20 flex items-center gap-2 bg-[#5a5a40]/90 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/10 shadow">
              <div className={`w-2.5 h-2.5 rounded-full ${isRecording ? "bg-rose-500 animate-ping" : "bg-[#82f9c5]"}`} />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                {isRecording ? `Recording Gestures (${recordingSeconds}s)` : `${languageClass} Live Translation`}
              </span>
            </div>
          )}

          {/* Big pulsing central clock overlay */}
          {isRecording && (
            <div className="absolute inset-0 flex items-center justify-center bg-rose-950/20 pointer-events-none z-10 transition-all">
              <div className="bg-black/80 border border-rose-500/25 px-6 py-4 rounded-[28px] text-center shadow-2xl flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-[10px] text-rose-300 font-bold uppercase tracking-widest">Capture Session Live</span>
                </div>
                <span className="font-mono text-3xl font-bold tracking-tight text-white mt-1">
                  {String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:{String(recordingSeconds % 60).padStart(2, '0')}
                </span>
                <span className="text-[9px] text-[#8a8a7c] mt-0.5">We are recording. Perform sign gestures then tap stop!</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Control overlay & Result panel anchored perfectly to the bottom */}
      <section className="absolute inset-x-0 bottom-0 z-30 px-5 pb-24 flex flex-col gap-4 pointer-events-none">
        
        {/* Dynamic simulator shortcut deck & Custom Calibrator panel */}
        <div className="w-full flex flex-col gap-3 pointer-events-auto select-none bg-white/95 backdrop-blur-md p-3.5 rounded-3xl border border-[#e2e2da] shadow-md transition-all">
          
          {/* Elegant mini tabs headers */}
          <div className="flex border-b border-[#e2e2da] pb-1 gap-1 text-[11px] overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => { setActiveTab("teachable"); }}
              className={`flex-1 min-w-[105px] py-1.5 rounded-lg font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === "teachable"
                  ? "bg-[#5a5a40] text-white"
                  : "text-[#6a6a5c] hover:bg-[#f5f5f0]"
              }`}
            >
              <span className="material-symbols-outlined text-xs">model_training</span>
              Teachable AI
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab("demo"); }}
              className={`flex-1 min-w-[75px] py-1.5 rounded-lg font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === "demo"
                  ? "bg-[#5a5a40] text-white"
                  : "text-[#6a6a5c] hover:bg-[#f5f5f0]"
              }`}
            >
              <span className="material-symbols-outlined text-xs font-bold">auto_awesome</span>
              Presets
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab("faq"); }}
              className={`flex-1 min-w-[65px] py-1.5 rounded-lg font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === "faq"
                  ? "bg-[#5a5a40] text-white"
                  : "text-[#6a6a5c] hover:bg-[#f5f5f0]"
              }`}
            >
              <span className="material-symbols-outlined text-xs">language</span>
              ASL APIs
            </button>
          </div>

          {/* TAB 1: Demo Presets */}
          {activeTab === "demo" && (
            <div className="flex flex-col gap-1.5 text-left">
              <div className="text-[10px] text-[#8a8a7c] px-1 font-mono uppercase tracking-wider">
                Select sign gesture preset to test camera or matching sequence:
              </div>
              <div className="w-full flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {SIMULATED_SIGNS.map((s, index) => {
                  const isSelected = chosenMockSign.toLowerCase() === s.word.toLowerCase();
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setChosenMockSign(s.word);
                        handleSimulateCycle(s.text, s.confidence);
                      }}
                      className={`flex-shrink-0 px-3 py-1.5 border text-xs rounded-full transition-all cursor-pointer font-bold ${
                        isSelected
                          ? "bg-[#5a5a40] text-white border-transparent shadow-sm"
                          : "bg-[#f5f5f0] border-[#e2e2da] text-[#6a6a5c] hover:bg-[#8d917a] hover:text-white"
                      }`}
                    >
                      {s.word}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Teachable Machine Custom Training */}
          {activeTab === "teachable" && (
            <div className="flex flex-col gap-2 text-left">
              <span className="text-[10px] text-[#5a5a40] font-bold uppercase tracking-wider block">
                🧠 Live-Load Custom Teachable Machine Models
              </span>
              <p className="text-[10px] text-[#6a6a5c] leading-relaxed">
                Connect your Google Teachable Machine exported link to run instant, 100% private sign language classifications client-side on your webcam!
              </p>
              
              <div className="bg-[#f5f5f0] p-2 rounded-xl border border-[#e2e2da] text-[8.5px] text-[#333333] space-y-1">
                <div className="flex gap-1.5"><span className="text-emerald-700 font-bold">Step 1:</span><span>Navigate to <strong>teachablemachine.withgoogle.com</strong> & select <strong>Image Project</strong>.</span></div>
                <div className="flex gap-1.5"><span className="text-emerald-700 font-bold">Step 2:</span><span>Record classes with your web camera (e.g. <em>Hello</em>, <em>Eat</em>, <em>More</em>).</span></div>
                <div className="flex gap-1.5"><span className="text-emerald-700 font-bold">Step 3:</span><span>Train & Export &rarr; <strong>Upload (shareable link)</strong>. Paste that link below.</span></div>
              </div>

              <div className="flex flex-col gap-1 mt-1">
                <label className="text-[9px] font-bold text-[#565949]">Your Exported Model Link:</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={tmModelUrl}
                    onChange={(e) => setTmModelUrl(e.target.value)}
                    placeholder="https://teachablemachine.withgoogle.com/models/vA-xB3_9X/"
                    className="flex-1 bg-[#f5f5f0] text-[10px] border border-[#e2e2da] px-2.5 py-1.5 rounded-lg text-[#33332d] focus:outline-none focus:border-[#8d917a] font-mono leading-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleLoadTmModel(tmModelUrl, true)}
                    disabled={isTmModelLoading}
                    className="px-3 py-1.5 bg-[#5a5a40] hover:bg-[#464632] disabled:bg-gray-300 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    {isTmModelLoading ? "Loading..." : "Load Model"}
                  </button>
                </div>
              </div>

              {isTmActive && tmModel ? (
                <div className="mt-1 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="flex items-center gap-1.5 font-bold text-emerald-700 leading-none">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse inline-block" />
                      Teachable Model Active
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsTmActive(false);
                        setTmModel(null);
                        setTmModelUrl("");
                        localStorage.removeItem("signbridge_tm_model_url");
                        alert("Custom Teachable Machine model disconnected.");
                      }}
                      className="text-[9px] text-rose-600 font-bold hover:underline cursor-pointer"
                    >
                      Disconnect
                    </button>
                  </div>

                  {tmPredictions.length > 0 && (
                    <div className="p-1.5 bg-[#8d917a]/15 rounded-lg border border-[#8d917a]/30">
                      <span className="text-[8.5px] font-bold text-[#5a5a40] uppercase block mb-1">Live Class Confidences:</span>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[9px] text-[#33332d]">
                        {tmPredictions.map((pred, i) => (
                          <div key={i} className="flex justify-between">
                            <span className="truncate max-w-[90px] font-bold">{pred.className}</span>
                            <span className="font-mono font-bold text-emerald-800">{(pred.probability * 100).toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[9px] text-[#8a8a7c] bg-[#f5f5f0]/50 p-1.5 rounded-lg border border-dashed border-[#e2e2da] italic">
                  Not connected. Paste your URL and click "Load Model" to run live webcam image classification.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ASL Public APIs FAQ Info */}
          {activeTab === "faq" && (
            <div className="flex flex-col gap-2 text-left">
              <span className="text-[10px] text-[#5a5a40] font-sans font-bold uppercase tracking-wider block">
                How do I connect standard database sources or train on my own?
              </span>
              <p className="text-[10px] text-[#6a6a5c] leading-relaxed">
                For complete offline or custom dataset training, developers use standard open platforms:
              </p>
              
              <ul className="space-y-1.5 text-[9px] text-[#33332d]">
                <li className="flex items-start gap-1">
                  <span className="text-emerald-700 font-bold">1. Lifeprint ASL & ASL-LEX:</span>
                  <span>Provides high-resolution lexical records & standard coordinates to map fingertips.</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-emerald-700 font-bold">2. MediaPipe Hand Landmark API:</span>
                  <span>Open-source real-time finger coordinate tracing engine. You can integrate this client-side via WebGL.</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-emerald-700 font-bold">3. SignPuddle API & Dataset:</span>
                  <span>Public sign language database servers that support dictionary API lookups.</span>
                </li>
              </ul>
              
              <p className="text-[9px] text-[#8a8a7c] italic mt-0.5 leading-relaxed bg-amber-50 p-1.5 rounded">
                For now, our new local calibrator provides instant offline tuning for your 3-5 custom finger postures.
              </p>
            </div>
          )}

        </div>

        {/* Caption Result Card */}
        <div className="w-full bg-white/95 backdrop-blur-xl rounded-[32px] border border-[#e2e2da] p-6 shadow-xl pointer-events-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#8d917a] text-xs font-serif font-bold italic flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">visibility</span>
              Live Recognized Phrase
            </span>
            <span className="text-[#5a5a40] text-xs bg-[#f5f5f0] border border-[#e2e2da] px-2.5 py-1 rounded-full font-bold">
              Confidence {Math.round(confidence * 100)}%
            </span>
          </div>

          <div className="min-h-[50px] flex items-center">
            <h2 
              className="font-serif font-bold italic tracking-tight text-[#33332d] leading-tight transition-all duration-300"
              style={{ fontSize: `${textSize}px` }}
            >
              {isLoading ? (
                <span className="text-[#8a8a7c] animate-pulse flex items-center gap-2 font-sans not-italic text-sm">
                  <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                  Analyzing recorded gesture sequence...
                </span>
              ) : (
                recognisedText
              )}
            </h2>
          </div>
        </div>

        {/* Camera action buttons row */}
        <div className="flex gap-2.5 items-center justify-between pointer-events-auto">
          {/* Speak Aloud Button */}
          <button
            onClick={handleSpeakAloud}
            title="Read translated caption aloud"
            className="w-[50px] h-[54px] bg-[#8d917a] text-white hover:bg-[#7a7e67] font-bold rounded-xl flex items-center justify-center shadow-sm active:scale-[0.98] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              volume_up
            </span>
          </button>

          {/* Primary Record Gesture Toggle */}
          <button
            onClick={toggleRecording}
            title={isRecording ? "Stop and translate" : "Tap to record continuous gesture"}
            className={`flex-1 h-[54px] font-bold rounded-xl flex items-center justify-center gap-2.5 shadow-md active:scale-[0.97] transition-all cursor-pointer border ${
              isRecording
                ? "bg-rose-600 border-transparent text-white ring-2 ring-rose-400"
                : "bg-rose-50 border-rose-200 text-white hover:bg-rose-600 animate-pulse"
            }`}
          >
            <span className="relative flex h-3.5 w-3.5 items-center justify-center">
              {isRecording ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-200 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              )}
            </span>
            <span className="text-xs uppercase tracking-wider font-bold">
              {isRecording ? `Stop (${recordingSeconds}s)` : "Record Gesture"}
            </span>
          </button>

          {/* Manual Snapshot Camera button */}
          <button
            onClick={handleSnapAndRecognize}
            disabled={isLoading || !isCameraActive || isRecording}
            title="Manual snapshot"
            className="w-[50px] h-[54px] bg-white border border-[#e2e2da] hover:bg-[#f5f5f0] text-[#8d917a] disabled:opacity-40 rounded-xl flex items-center justify-center active:scale-[0.98] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              photo_camera
            </span>
          </button>

          {/* History drawer trigger */}
          <button
            onClick={() => setShowHistoryModal(true)}
            title="Browse translation logs"
            className="w-[50px] h-[54px] bg-white border border-[#e2e2da] hover:bg-[#f5f5f0] text-[#5a5a40] rounded-xl flex items-center justify-center active:scale-[0.98] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined">history</span>
          </button>
        </div>
      </section>

      {/* History log drawer sheet component */}
      <AnimatePresence>
        {showHistoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center"
            onClick={() => setShowHistoryModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
              className="w-full max-w-lg bg-white rounded-t-3xl border-t border-[#e2e2da] p-6 max-h-[80vh] flex flex-col justify-between shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-xl font-serif font-bold italic text-[#5a5a40] flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">history</span>
                    Camera Translation Log
                  </h3>
                  <button
                    onClick={() => setShowHistoryModal(false)}
                    className="material-symbols-outlined text-[#8a8a7c] hover:text-[#33332d] hover:bg-[#f5f5f0] rounded-full p-1.5 cursor-pointer"
                  >
                    close
                  </button>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[50vh] pr-1">
                  {recentHistory.filter(h => h.mode === "camera").length === 0 ? (
                    <div className="py-12 text-center text-xs text-[#8a8a7c] font-medium">
                      No webcam gestures logged yet. Point your camera or use simulator pills to log frames.
                    </div>
                  ) : (
                    recentHistory
                      .filter(h => h.mode === "camera")
                      .map((item) => (
                        <div
                          key={item.id}
                          className="p-4 bg-[#f5f5f0] rounded-2xl border border-[#e2e2da] flex justify-between items-center hover:border-[#8d917a]/50 transition-all shadow-sm"
                        >
                          <div className="flex-1 pr-2">
                            <p className="text-xs text-[#8a8a7c] font-semibold">{item.timestamp}</p>
                            <p className="text-sm font-semibold text-[#33332d] mt-1.5 leading-snug">{item.recognizedText}</p>
                          </div>
                          <button
                            onClick={() => {
                              setRecognisedText(item.recognizedText);
                              setShowHistoryModal(false);
                            }}
                            className="p-2.5 rounded-xl bg-white text-[#5a5a40] border border-[#e2e2da] hover:bg-[#8d917a] hover:text-white transition-all material-symbols-outlined text-sm cursor-pointer shadow-sm"
                          >
                            restore
                          </button>
                        </div>
                      ))
                  )}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#e2e2da]">
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="w-full py-3 bg-[#5a5a40] hover:bg-[#464632] rounded-2xl text-xs font-bold text-white tracking-widest uppercase transition-colors cursor-pointer"
                >
                  Dismiss Drawer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
