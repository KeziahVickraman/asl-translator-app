import React from "react";
import { motion } from "motion/react";
import { DisplayMode } from "../types";
import { SubscriptionTier } from "./SubscriptionPlans";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

interface HomeViewProps {
  onStartCamera: () => void;
  onStartTranslation: () => void;
  onNavigate: (mode: DisplayMode) => void;
  subscriptionTier: SubscriptionTier;
}

export default function HomeView({ 
  onStartCamera, 
  onStartTranslation, 
  onNavigate,
  subscriptionTier
}: HomeViewProps) {

  // Premium Usage & Accuracy Analytics dataset (Recharts ready)
  const ANALYTICS_ACCURACY_DATA = [
    { day: "Mon", scans: 14, accuracy: 94 },
    { day: "Tue", scans: 25, accuracy: 96 },
    { day: "Wed", scans: 19, accuracy: 92 },
    { day: "Thu", scans: 38, accuracy: 98 },
    { day: "Fri", scans: 29, accuracy: 95 },
    { day: "Sat", scans: 52, accuracy: 99 },
    { day: "Sun", scans: 45, accuracy: 97 }
  ];

  const DIALECT_PERFORMANCE = [
    { name: "ASL", standard: 82, stabilized: 98 },
    { name: "Auslan", standard: 78, stabilized: 95 },
    { name: "BSL", standard: 80, stabilized: 96 }
  ];

  // Classroom Enterprise dataset for schools/enterprise subscriber
  const STUDENTS_METRICS = [
    { id: "s1", name: "Amara Okeke", level: "Intermediate", lessons: 14, hours: "5.5h", status: "Active" },
    { id: "s2", name: "Lucas Vance", level: "Beginner BSL", lessons: 8, hours: "3.2h", status: "Active" },
    { id: "s3", name: "Chen Wei", level: "ASL Fluency", lessons: 22, hours: "8.4h", status: "Excellent" },
    { id: "s4", name: "Sophie Dubois", level: "Auslan Basics", lessons: 4, hours: "1.5h", status: "Needs Practice" }
  ];

  const handleNavigateBilling = () => {
    onNavigate("settings");
    setTimeout(() => {
      const el = document.getElementById("billing_subscription_portal_sec") || document.getElementById("lang_select_card");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 450);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="flex-grow flex flex-col max-w-4xl mx-auto w-full px-5 py-6 space-y-8"
    >
      {/* Welcome Banner */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4" id="welcome_banner_sec">
        <div>
          <h2 className="text-3xl font-serif font-bold italic text-[#5a5a40] mb-1">
            Welcome to SignBridge
          </h2>
          <p className="text-sm text-[#8a8a7c] font-medium tracking-wide">
            How would you like to communicate or analyze metrics today?
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/80 border border-[#e2e2da] px-4.5 py-2.5 rounded-2xl shadow-xs self-start md:self-auto">
          <span className="material-symbols-outlined text-[#8d917a] font-bold">payments</span>
          <div className="text-left select-none">
            <span className="block text-[9px] text-[#8a8a7c] uppercase font-bold tracking-widest">Active Plan Membership</span>
            <span className="text-xs font-bold text-[#5a5a40] capitalize">{subscriptionTier} Plan Tier</span>
          </div>
        </div>
      </section>

      {/* Mode Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="navigation_action_grid">
        {/* Sign Language Real-time Capture (Webcam to Text) */}
        <button
          onClick={onStartCamera}
          id="btn_sign_mode"
          className="group relative overflow-hidden flex flex-col items-start p-6 bg-white rounded-3xl text-left transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] border border-[#e2e2da] hover:border-[#8d917a] shadow-sm hover:shadow-md cursor-pointer"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#8d917a] text-white flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300 shadow-sm">
            <span
              className="material-symbols-outlined text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              videocam
            </span>
          </div>
          
          <h3 className="text-2xl font-serif font-bold italic text-[#5a5a40] mb-1 tracking-tight">
            I want to sign (Webcam capture)
          </h3>
          
          <p className="text-sm text-[#6a6a5c] mb-5 leading-relaxed opacity-90">
            Translate sign language into text or speech in real-time, matching quick hand segments.
          </p>
          
          <div className="mt-auto flex items-center gap-1.5 text-[#8d917a] font-bold text-sm">
            <span>Start continuous recording</span>
            <span className="material-symbols-outlined text-xs group-hover:translate-x-1 transition-transform" aria-hidden="true">
              arrow_forward
            </span>
          </div>

          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#8d917a]/5 rounded-full blur-3xl group-hover:bg-[#8d917a]/10 transition-colors" />
        </button>

        {/* Text/Speech translation mapping */}
        <button
          onClick={onStartTranslation}
          id="btn_translate_mode"
          className="group relative overflow-hidden flex flex-col items-start p-6 bg-white rounded-3xl text-left transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] border border-[#e2e2da] hover:border-[#5a5a40] shadow-sm hover:shadow-md cursor-pointer"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#5a5a40] text-white flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300 shadow-sm">
            <span
              className="material-symbols-outlined text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              keyboard
            </span>
          </div>
          
          <h3 className="text-2xl font-serif font-bold italic text-[#5a5a40] mb-1 tracking-tight">
            I want to speak/type
          </h3>
          
          <p className="text-sm text-[#6a6a5c] mb-5 leading-relaxed opacity-90">
            Convert your spoken speech or text phrases into descriptive sign guides for others to see.
          </p>
          
          <div className="mt-auto flex items-center gap-1.5 text-[#5a5a40] font-bold text-sm">
            <span>Start Text Translation</span>
            <span className="material-symbols-outlined text-xs group-hover:translate-x-1 transition-transform" aria-hidden="true">
              arrow_forward
            </span>
          </div>

          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#5a5a40]/5 rounded-full blur-3xl group-hover:bg-[#5a5a40]/10 transition-colors" />
        </button>
      </div>

      {/* Subscription Features & Advanced Analytics Section */}
      <section className="bg-white rounded-3xl border border-[#e2e2da] p-6 shadow-sm relative overflow-hidden">
        {subscriptionTier === "basic" ? (
          /* Locked Premium teaser layout for Basic Standard plan */
          <div className="relative z-10 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#e2e2da] gap-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-rose-500 font-bold text-3xl">lock_open</span>
                <div className="text-left">
                  <h4 className="font-serif font-bold italic text-[#5a5a40] text-lg">🔒 AI Diagnostics & Analytics Locked</h4>
                  <p className="text-xs text-[#8a8a7c] font-medium mt-0.5">Track sign counts, daily stabilization speeds, and classroom compliance metrics.</p>
                </div>
              </div>
              <button
                onClick={handleNavigateBilling}
                className="px-5 py-2.5 bg-[#8d917a] hover:bg-[#7a7e67] text-white rounded-full font-bold text-xs uppercase tracking-wider transition-all self-start md:self-auto cursor-pointer"
              >
                Upgrade to Pro & Analytics
              </button>
            </div>

            {/* Simulated Blurred Chart Previews */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-30 select-none pointer-events-none filter blur-[1px]">
              <div className="h-44 bg-slate-100 rounded-2xl flex items-center justify-center">
                <span className="text-xs font-mono text-slate-400">Loading continuous gestures chart...</span>
              </div>
              <div className="h-44 bg-slate-100 rounded-2xl flex items-center justify-center">
                <span className="text-xs font-mono text-slate-400">Loading stabilization percentages...</span>
              </div>
            </div>

            <div className="text-center py-2">
              <p className="text-xs text-[#6a6a5c] font-semibold leading-relaxed">
                Add a subscription plan to unlock full charts, student lessons logs, and premium AI stabilizers.
              </p>
            </div>
          </div>
        ) : (
          /* Unlocked High-fidelity Advanced Analytics Suite (Pro and Enterprise) */
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#e2e2da] gap-4">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#8d917a] font-bold text-3xl">insights</span>
                <div className="text-left">
                  <h4 className="font-serif font-bold italic text-[#5a5a40] text-lg">AI Translation Analytics Dashboard</h4>
                  <p className="text-xs text-[#8a8a7c] font-medium mt-0.5">Real-time model accuracy metrics and performance indexes.</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-xs">verified</span>
                Premium Active
              </div>
            </div>

            {/* Stats summaries cards row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              <div className="p-4 bg-[#f5f5f0] border border-[#e2e2da] rounded-2xl">
                <span className="text-[10px] text-[#8a8a7c] font-bold uppercase tracking-widest block">Average Accuracy</span>
                <span className="text-2xl font-serif font-black text-[#5a5a40]">96.8%</span>
                <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">↑ 4.2% Stabilization</span>
              </div>
              <div className="p-4 bg-[#f5f5f0] border border-[#e2e2da] rounded-2xl">
                <span className="text-[10px] text-[#8a8a7c] font-bold uppercase tracking-widest block">Signings Recorded</span>
                <span className="text-2xl font-serif font-black text-[#5a5a40]">215</span>
                <span className="text-[10px] text-slate-500 font-bold block mt-0.5">This billing cycle</span>
              </div>
              <div className="p-4 bg-[#f5f5f0] border border-[#e2e2da] rounded-2xl">
                <span className="text-[10px] text-[#8a8a7c] font-bold uppercase tracking-widest block">AI Latency Index</span>
                <span className="text-2xl font-serif font-black text-[#5a5a40]">42 ms</span>
                <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Highly responsive</span>
              </div>
              <div className="p-4 bg-[#f5f5f0] border border-[#e2e2da] rounded-2xl">
                <span className="text-[10px] text-[#8a8a7c] font-bold uppercase tracking-widest block">Tremor status</span>
                <span className="text-2xl font-serif font-black text-[#5a5a40]">Filter On</span>
                <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Active stabilizer</span>
              </div>
            </div>

            {/* Dynamic Charts row using recharts library dependencies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[260px] pt-4">
              
              {/* Daily sign tracking Area map chart */}
              <div className="space-y-2 text-left bg-[#f5f5f0]/50 p-4 rounded-2xl border border-[#e2e2da]">
                <h5 className="text-xs font-serif font-bold italic text-[#5a5a40] flex items-center gap-1 px-1">
                  <span className="material-symbols-outlined text-sm">show_chart</span>
                  Daily Capture Volume & Model Confidence
                </h5>
                <div className="w-full h-48 text-[11px] font-mono leading-none">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ANALYTICS_ACCURACY_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8d917a" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#8d917a" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e2da" />
                      <XAxis dataKey="day" stroke="#8a8a7c" />
                      <YAxis stroke="#8a8a7c" />
                      <Tooltip />
                      <Area type="monotone" dataKey="scans" stroke="#8d917a" strokeWidth={2.5} fillOpacity={1} fill="url(#colorScans)" name="Gesture Count" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Dialect comparison double bars chart */}
              <div className="space-y-2 text-left bg-[#f5f5f0]/50 p-4 rounded-2xl border border-[#e2e2da]">
                <h5 className="text-xs font-serif font-bold italic text-[#5a5a40] flex items-center gap-1 px-1">
                  <span className="material-symbols-outlined text-sm">equalizer</span>
                  Regional Dialect Accuracy Output (%)
                </h5>
                <div className="w-full h-48 text-[11px] font-mono leading-none">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={DIALECT_PERFORMANCE} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e2da" />
                      <XAxis dataKey="name" stroke="#8a8a7c" />
                      <YAxis domain={[60, 100]} stroke="#8a8a7c" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="standard" fill="#8a8a7c" radius={[4, 4, 0, 0]} name="Raw accuracy %" />
                      <Bar dataKey="stabilized" fill="#8d917a" radius={[4, 4, 0, 0]} name="Stabilized Accuracy %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Exclusive Schools and Enterprise classroom progress table */}
            {subscriptionTier === "enterprise" && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 pt-6 border-t border-[#e2e2da] space-y-3"
              >
                <div className="flex justify-between items-center text-left">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#5a5a40] text-3xl">school</span>
                    <div>
                      <h4 className="font-serif font-bold italic text-[#5a5a40] text-base">Classroom Engagement Reports</h4>
                      <p className="text-[10px] text-[#8a8a7c] font-medium">Tracking students practice metrics and dialect session goals.</p>
                    </div>
                  </div>
                  <span className="text-[9px] bg-[#5a5a40] text-white px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                    Enterprise Portal
                  </span>
                </div>

                <div className="overflow-x-auto border border-[#e2e2da] rounded-2xl shadow-inner bg-white">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#f5f5f0] text-[#5a5a40] font-bold border-b border-[#e2e2da]">
                        <th className="p-3 pl-4">Student Name</th>
                        <th className="p-3">Course Dialect</th>
                        <th className="p-3 text-center">Lessons done</th>
                        <th className="p-3 text-center">Total time</th>
                        <th className="p-3 pr-4 text-right">Progress Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2e2da] font-medium text-[#33332d]">
                      {STUDENTS_METRICS.map((student) => (
                        <tr key={student.id} className="hover:bg-[#f5f5f0]/40 transition-colors">
                          <td className="p-3 pl-4 font-bold text-[#5a5a40]">{student.name}</td>
                          <td className="p-3 text-[#6a6a5c]">{student.level}</td>
                          <td className="p-3 text-center font-mono">{student.lessons}</td>
                          <td className="p-3 text-center font-mono">{student.hours}</td>
                          <td className="p-3 pr-4 text-right">
                            <span className={`inline-block px-2.5 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              student.status === "Excellent" 
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                                : student.status === "Active" 
                                ? "bg-[#8d917a]/10 text-[#5a5a40]" 
                                : "bg-amber-50 text-amber-800 border border-amber-200"
                            }`}>
                              {student.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </section>

      {/* Dialect Helper Badge */}
      <section 
        className="p-5 bg-white border border-[#e2e2da] rounded-3xl flex items-center gap-4 shadow-sm text-left"
        id="designed_for_you_badge"
      >
        <div className="text-[#8d917a] flex-shrink-0">
          <span 
            className="material-symbols-outlined text-[42px]" 
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
          >
            accessibility_new
          </span>
        </div>
        <div>
          <h4 className="font-serif font-bold italic text-[#5a5a40] text-sm tracking-wide">
            Designed for you & Your team
          </h4>
          <p className="text-xs text-[#6a6a5c] mt-0.5 leading-relaxed">
            SignBridge supports over 50 regional sign languages including ASL, Auslan, BSL, and local dialects. Upgrade to unlock full student heatmaps and continuous multi-recording.
          </p>
        </div>
      </section>

      {/* Decorative Interactive Bubble */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.05]">
        <div className="absolute w-[450px] h-[450px] bg-[#8d917a] rounded-full blur-[130px] bottom-10 left-10 anim-pulse" />
      </div>
    </motion.div>
  );
}
