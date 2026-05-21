import React from "react";
import { DisplayMode } from "../types";

interface TopAppBarProps {
  currentMode: DisplayMode;
  userEmail?: string;
  onNavigate: (mode: DisplayMode) => void;
  onToggleSidebar?: () => void;
}

export default function TopAppBar({
  currentMode,
  userEmail = "user@signbridge.io",
  onNavigate,
  onToggleSidebar,
}: TopAppBarProps) {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-[#e2e2da] shadow-sm flex justify-between items-center h-16 px-5">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Open navigation menu"
          className="material-symbols-outlined text-[#5a5a40] transition-colors p-2 rounded-full cursor-pointer hover:bg-[#f5f5f0]"
          id="menu_trigger"
        >
          menu
        </button>
        <div 
          onClick={() => onNavigate("home")} 
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <h1 className="text-2xl font-serif font-bold italic text-[#5a5a40] tracking-tight hover:opacity-90 transition-opacity">
            SignBridge
          </h1>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {/* User profile section matching SignBridge branding */}
        <div className="flex flex-col items-end text-right hidden sm:flex">
          <span className="text-xs font-semibold text-[#33332d] truncate max-w-[140px]" title={userEmail}>
            {userEmail.split("@")[0]}
          </span>
          <span className="text-[10px] text-[#8a8a7c] font-medium tracking-wide uppercase">Active Session</span>
        </div>
        
        <div className="w-9 h-9 rounded-full bg-[#f5f5f0] overflow-hidden border border-[#e2e2da] hover:border-[#8d917a]/50 transition-colors cursor-pointer">
          <img
            alt="Profile Avatar"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtiXpKZxkQ5Ve8B2rbUait1nsBu1ND1hz5oHlMKvcRxXUJlJOyuzT5DbR0xabAekxfHxY1Izq-RNkh_Hth4PUP5FM9k57hq9zIKzaIZbVl4WzWGWHInNl7cnuYIVK7ansCfsnB6xaOFMbEbJe-6bPkNhtUpmedxCEwg_EZ-NzfMRTRtwte5rDb2ctGmoUM2vFeqHvA_Mhm7DjwvIu_87nIc0HHKaiw3nQ453nmV-kjx2zJynx8tKRmJOqYUH7DMaMO8X3F7f3axP4"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </header>
  );
}
