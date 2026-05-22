import React from "react";
import { DisplayMode } from "../types";

interface BottomNavBarProps {
  currentMode: DisplayMode;
  onNavigate: (mode: DisplayMode) => void;
}

export default function BottomNavBar({ currentMode, onNavigate }: BottomNavBarProps) {
  const tabs = [
    { mode: "home" as const, label: "Home", icon: "home" },
    { mode: "camera" as const, label: "Camera", icon: "videocam" },
    { mode: "text" as const, label: "Text", icon: "keyboard" },
    { mode: "learn" as const, label: "Learn", icon: "school" },
    { mode: "social" as const, label: "Social", icon: "forum" },
    { mode: "settings" as const, label: "Settings", icon: "settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full h-20 flex justify-around items-center px-2 pb-safe bg-white/95 backdrop-blur-md border-t border-[#e2e2da] shadow-[0_-4px_16px_rgba(90,90,64,0.06)] z-50 rounded-t-xl select-none">
      {tabs.map((tab) => {
        const isActive = currentMode === tab.mode;
        return (
          <button
            key={tab.mode}
            onClick={() => onNavigate(tab.mode)}
            style={{ contentVisibility: "auto" }}
            id={`tab_${tab.mode}`}
            className={`flex flex-col items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer ${
              isActive
                ? "bg-[#8d917a] text-white rounded-full px-3 sm:px-5 py-1.5 shadow-sm transform -translate-y-0.5"
                : "text-[#8a8a7c] hover:text-[#33332d] px-2 sm:px-4 py-1.5 hover:bg-[#e2e2da]/40 rounded-xl"
            }`}
          >
            <span
              className={`material-symbols-outlined`}
              style={{
                fontVariationSettings: isActive ? `'FILL' 1, 'wght' 600` : `'FILL' 0, 'wght' 400`,
                fontSize: "24px"
              }}
            >
              {tab.icon}
            </span>
            <span className="text-xs font-semibold tracking-wide mt-0.5 animate-fade-in">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
