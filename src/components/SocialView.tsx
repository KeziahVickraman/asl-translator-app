import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

// Native highly-resilient Disqus implementation that is React 19 compatible
interface DisqusEmbedProps {
  shortname: string;
  config: {
    url: string;
    identifier: string;
    title: string;
    language?: string;
  };
}

function CustomDiscussionEmbed({ shortname, config }: DisqusEmbedProps) {
  const [loadError, setLoadError] = useState<boolean>(false);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);

  useEffect(() => {
    setLoadError(false);
    setIsBlocked(false);

    // Setup global config
    (window as any).disqus_config = function (this: any) {
      this.page.url = config.url;
      this.page.identifier = config.identifier;
      this.page.title = config.title;
      if (config.language) {
        this.language = config.language;
      }
    };

    const threadContainer = document.getElementById("disqus_thread");
    if (threadContainer) {
      threadContainer.innerHTML = ""; // clean up previous instances safely
    }

    // Check if DISQUS is already loaded
    if ((window as any).DISQUS) {
      try {
        (window as any).DISQUS.reset({
          reload: true,
          config: function (this: any) {
            this.page.url = config.url;
            this.page.identifier = config.identifier;
            this.page.title = config.title;
            if (config.language) {
              this.language = config.language;
            }
          }
        });
      } catch (e) {
        console.warn("Disqus reset failed, loading script directly:", e);
        loadScript();
      }
    } else {
      loadScript();
    }

    function loadScript() {
      const existingScript = document.querySelector(`script[src*="${shortname}.disqus.com/embed.js"]`);
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement("script");
      script.src = `https://${shortname}.disqus.com/embed.js`;
      script.setAttribute("data-timestamp", (+new Date()).toString());
      script.async = true;
      script.onerror = (err) => {
        console.error("Disqus failed to load:", err);
        setLoadError(true);
      };
      
      const timeout = setTimeout(() => {
        if (!(window as any).DISQUS && !loadError) {
          setIsBlocked(true);
        }
      }, 5000);

      document.body.appendChild(script);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [shortname, config.url, config.identifier, config.title, config.language]);

  if (loadError || isBlocked) {
    return (
      <div className="bg-[#1e242d] border border-amber-500/20 text-center rounded-2xl p-8 space-y-4">
        <span className="material-symbols-outlined text-4xl text-amber-400">warning</span>
        <h4 className="text-md font-bold text-[#dfe2eb]">Disqus Forum Blocked or Offline</h4>
        <p className="text-xs text-[#8a8a7c] leading-relaxed max-w-md mx-auto">
          We couldn't load the community forum. This usually occurs because of **adblockers** (blocking Disqus domains) or high-security browser rules in sandbox preview iframes.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <a
            href={config.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#8d917a] hover:bg-[#8d917a]/80 text-white rounded-xl text-xs font-bold transition-all"
          >
            Open in New Tab
          </a>
          <button
            onClick={() => {
              setLoadError(false);
              setIsBlocked(false);
              const script = document.createElement("script");
              script.src = `https://${shortname}.disqus.com/embed.js`;
              script.async = true;
              document.body.appendChild(script);
            }}
            className="px-4 py-2 bg-[#181c22] border border-[#3d4a42]/35 text-[#82f9c5] rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div id="disqus_thread" className="w-full bg-white p-4 rounded-xl text-[#1a1a1a]" />
      <p className="text-[10px] text-center text-[#8a8a7c]">
        Comments are powered by Disqus. Disable adblockers for this page if they do not load.
      </p>
    </div>
  );
}

// Resilient Disqus CommentCount
function CustomCommentCount({ shortname, config, children }: { shortname: string; config: { url: string; identifier: string; title: string }; children?: React.ReactNode }) {
  useEffect(() => {
    const scriptId = "dsq-count-scr";
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://${shortname}.disqus.com/count.js`;
      script.async = true;
      document.body.appendChild(script);
    } else {
      if ((window as any).DISQUSWIDGETS) {
        try {
          (window as any).DISQUSWIDGETS.getCount({ reset: true });
        } catch (e) {
          // Ignore reset errors
        }
      }
    }
  }, [shortname, config.identifier]);

  return (
    <span
      className="disqus-comment-count font-mono"
      data-disqus-identifier={config.identifier}
      data-disqus-url={config.url}
    >
      {children || "Comments"}
    </span>
  );
}

export default function SocialView() {
  const threads = [
    {
      id: "general-lobby",
      title: "General Community Lobby & Sign Language Chat",
      category: "Lobby",
      topic: "Connect with sign learners and active translators globally",
      icon: "diversity_3",
      url: "https://signbridge.io/forum/general-lobby"
    },
    {
      id: "asl-dialect",
      title: "ASL & Dialect Accents Discussion Board",
      category: "Dialect",
      topic: "Deep dive into ASL vs. Auslan vs. BSL hand gestures and variations",
      icon: "record_voice_over",
      url: "https://signbridge.io/forum/asl-dialect"
    },
    {
      id: "finger-spelling",
      title: "Fingerspelling & Hand Gesture Learning Lobby",
      category: "Education",
      topic: "Share memory tips, hand muscle advice, and speed practices",
      icon: "school",
      url: "https://signbridge.io/forum/finger-spelling"
    },
    {
      id: "app-feedback",
      title: "SignBridge Developer Feedback & Feature Requests",
      category: "Development",
      topic: "Suggest new AI Sign detection improvements, features or report bugs",
      icon: "terminal",
      url: "https://signbridge.io/forum/app-feedback"
    }
  ];

  const [activeThread, setActiveThread] = useState(threads[0]);
  const [langPreference, setLangPreference] = useState<string>("en");

  // Custom shortname as requested: 'asl-translator'
  const disqusShortname = "asl-translator";

  // Configuration for Disqus thread
  const disqusConfig = {
    url: activeThread.url,
    identifier: activeThread.id,
    title: activeThread.title,
    language: langPreference // e.g. 'en', 'zh_TW' or standard ISO code
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="flex-grow flex flex-col max-w-5xl mx-auto w-full px-5 py-6 pb-28"
    >
      {/* Intro Header */}
      <section className="space-y-4 mb-8 text-left" id="social_header">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-[#82f9c5] uppercase font-bold tracking-widest font-mono">
            SignLanguage Social Forum
          </span>
          <h2 className="text-3xl font-serif font-bold italic text-[#82f9c5]">
            Social Hub
          </h2>
          <p className="text-sm text-[#8a8a7c] font-medium leading-relaxed max-w-2xl">
            Discuss signs, query translation improvements, coordinate practices online, and ask community questions in the live Disqus forum.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        {/* Left Side: Forums Channels list */}
        <div className="lg:col-span-1 space-y-4" id="forums_channels_panel">
          <div className="bg-[#181c22] border border-[#3d4a42]/35 p-5 rounded-3xl space-y-4">
            <h3 className="text-md font-bold text-[#82f9c5] flex items-center gap-2">
              <span className="material-symbols-outlined text-md">forum</span>
              <span>Forums Channels</span>
            </h3>

            <div className="flex flex-col gap-2.5">
              {threads.map((t) => {
                const isActive = activeThread.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveThread(t)}
                    className={`w-full p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#8d917a]/15 border-[#82f9c5] text-white shadow-sm"
                        : "bg-[#1e242d]/45 border-[#3d4a42]/20 text-[#bccac0] hover:bg-[#1e242d] hover:border-[#3d4a42]/45 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className="text-[10px] bg-[#82f9c5]/10 text-[#82f9c5] px-2 py-0.5 rounded font-mono uppercase font-bold">
                        {t.category}
                      </span>
                      
                      {/* Interactive Disqus Live Comment count widget preview */}
                      <span className="text-[10px] text-[#8a8a7c] font-mono flex items-center gap-1.5 ml-auto">
                        <span className="material-symbols-outlined text-xs">chat_bubble</span>
                        <CustomCommentCount
                          shortname={disqusShortname}
                          config={{
                            url: t.url,
                            identifier: t.id,
                            title: t.title
                          }}
                        >
                          Comments
                        </CustomCommentCount>
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-md text-[#82f9c5] mt-0.5">
                        {t.icon}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold leading-tight">
                          {t.title}
                        </h4>
                        <p className="text-[10px] text-[#bccac0]/80 mt-1 line-clamp-2">
                          {t.topic}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Settings block for Language locale preferred inside Disqus frame */}
          <div className="bg-[#181c22]/70 border border-[#3d4a42]/20 p-5 rounded-3xl space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#bccac0] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">settings_accessibility</span>
              <span>Disqus Localization</span>
            </h4>
            
            <div className="space-y-2">
              <p className="text-[10px] text-[#8a8a7c] leading-normal">
                Disqus widgets will adapt according to your targeted language locale configuration.
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                {[
                  { code: "en", label: "English" },
                  { code: "zh_TW", label: "Traditional Chinese" },
                  { code: "es", label: "Español" },
                  { code: "ja", label: "日本語" }
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLangPreference(lang.code)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold text-center border transition-all cursor-pointer ${
                      langPreference === lang.code
                        ? "bg-[#82f9c5]/15 border-[#82f9c5] text-[#82f9c5]"
                        : "bg-[#1e242d]/80 border-[#3d4a42]/20 text-[#bccac0] hover:bg-[#1e242d]"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Disqus Forum Thread Viewport */}
        <div className="lg:col-span-2 space-y-4" id="disqus_forum_panel">
          <div className="bg-white border border-[#e2e2da] rounded-3xl p-6 shadow-sm">
            
            {/* Header displaying active thread context info details */}
            <div className="border-b border-gray-100 pb-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3 text-left">
              <div className="space-y-1">
                <span className="text-[10px] bg-[#8d917a]/10 text-[#5a5a40] px-2.5 py-1 rounded-full font-mono font-bold uppercase">
                  ACTIVE DISCUSSION
                </span>
                <h3 className="text-lg font-serif font-bold text-[#5a5a40]">
                  {activeThread.title}
                </h3>
                <p className="text-xs text-[#8a8a7c]">
                  Thread ID: <span className="font-mono">{activeThread.id}</span>
                </p>
              </div>

              <div className="self-start md:self-auto flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-xs animate-pulse">wifi_tethering</span>
                <span>Active Feed</span>
              </div>
            </div>

            {/* Embed actual Disqus React plugin! Force recreate on thread switches using activeThread.id */}
            <div className="min-h-[500px]" key={`${activeThread.id}-${langPreference}`} id="disqus_embed_box">
              <CustomDiscussionEmbed
                shortname={disqusShortname}
                config={disqusConfig}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
