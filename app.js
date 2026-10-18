/**
 * Android Tablet Minimalist Chrome Start Page - Nova Launcher Edition
 * Persistent Homescreen & App Drawer Engine
 */

// Universal Zero-Sound Mute Guard: Guarantees the app never emits any audio, sounds, or beeps
(function silenceAllAudio() {
  try {
    // 1. Permanently mute all HTMLMediaElement instances (audio/video/new Audio)
    if (typeof window.HTMLMediaElement !== 'undefined') {
      try {
        Object.defineProperty(HTMLMediaElement.prototype, 'muted', {
          get: () => true,
          set: () => {}
        });
        Object.defineProperty(HTMLMediaElement.prototype, 'volume', {
          get: () => 0,
          set: () => {}
        });
        HTMLMediaElement.prototype.play = function() {
          return Promise.resolve();
        };
      } catch (e) {}
    }

    // 2. Suspend & silence AudioContext & webkitAudioContext
    const silenceCtx = (ctor) => {
      if (typeof ctor === 'function') {
        const orig = ctor;
        const silenced = function(...args) {
          const ctx = new orig(...args);
          try { ctx.suspend(); } catch (e) {}
          return ctx;
        };
        silenced.prototype = orig.prototype;
        return silenced;
      }
      return ctor;
    };
    if (typeof window.AudioContext !== 'undefined') {
      window.AudioContext = silenceCtx(window.AudioContext);
    }
    if (typeof window.webkitAudioContext !== 'undefined') {
      window.webkitAudioContext = silenceCtx(window.webkitAudioContext);
    }

    // 3. Disable Web Speech API synthesis
    if (typeof window.speechSynthesis !== 'undefined') {
      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak = function() {};
      } catch (e) {}
    }
  } catch (err) {}
})();

(function () {
  'use strict';

  // =========================================================================
  // Icon Registries: Custom Minimalist Pure White Vector Glyphs (Default) & Classic
  // =========================================================================
  const MINIMAL_ICONS = {
    spotify: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 11.5c3-1 6-.8 9 1"/><path d="M8.5 14.5c2.5-.8 5-.6 7.5.8"/><path d="M9 17.5c2-.5 4-.4 6 .6"/></svg>`,
    gmail: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><polyline points="3 7 12 13 21 7"/></svg>`,
    settings_app: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06-.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    youtube: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5" width="19" height="14" rx="4.5"/><polygon points="10 9 16 12 10 15" fill="#FFFFFF" stroke="none"/></svg>`,
    snapchat: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="#FFFFFF"><path d="M12 3c-3.1 0-5.5 2.2-5.5 5.5 0 .9.3 1.9.4 2.2-.5.2-1.3.6-1.5 1.4-.2.7.3 1.4 1 1.6.1 1.1-.7 2-1.8 2.2-.4.1-.7.4-.6.8.1.4.5.7.9.7 1.2 0 2.2-.5 2.7-1 .8.8 2.3 1.6 4.4 1.6s3.6-.8 4.4-1.6c.5.5 1.5 1 2.7 1 .4 0 .8-.3.9-.7.1-.4-.2-.7-.6-.8-1.1-.2-1.9-1.1-1.8-2.2.7-.2 1.2-.9 1-1.6-.2-.8-1-1.2-1.5-1.4.1-.3.4-1.3.4-2.2C17.5 5.2 15.1 3 12 3z"/></svg>`,
    twitter: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="#FFFFFF"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    instagram: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="#FFFFFF" stroke="none"/></svg>`,
    tiktok: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="#FFFFFF"><path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743 2.895 2.895 0 0 1 3.12-4.509V9.418a6.34 6.34 0 0 0-4.004-.33 6.338 6.338 0 0 0-4.877 6.136 6.34 6.34 0 0 0 6.34 6.34 6.337 6.337 0 0 0 6.34-6.34V8.756a8.19 8.19 0 0 0 4.887 1.621v-3.46c-.463-.008-.925-.086-1.39-.231z"/></svg>`,
    docs: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
    canvas: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="7" r="1.5" fill="#FFFFFF"/><circle cx="16" cy="9.5" r="1.5" fill="#FFFFFF"/><circle cx="16.5" cy="14" r="1.5" fill="#FFFFFF"/><circle cx="13.5" cy="17" r="1.5" fill="#FFFFFF"/><circle cx="8.5" cy="16" r="1.5" fill="#FFFFFF"/><circle cx="7.5" cy="11" r="1.5" fill="#FFFFFF"/></svg>`,
    canva: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="#FFFFFF"><path d="M17.5 7.5c-1.8-1.2-4-1.8-6.4-1.8-5.4 0-9.4 3.9-9.4 9.6s4 9.6 9.6 9.6c2.6 0 5-.8 6.8-2.4.9-.8.6-2-.5-2-1.1 0-2.1.7-3.2 1.3-1 .6-2 1-3.2 1-3.8 0-6.9-2.9-6.9-7.5s3.2-7.5 6.9-7.5c1.4 0 2.6.5 3.5 1.2.8.7 1.9 1.1 2.6.5.8-.5.5-1.5-.7-1.9z"/></svg>`,
    analytics: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/><circle cx="18" cy="6" r="2.2" fill="#FFFFFF"/></svg>`,
    mildang: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><polyline points="10 8 14 12 10 16"/></svg>`,
    maps: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>`,
    photos: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
    sentral: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L3 7v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>`,
    drive: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6l6 11-3 5H9L3 14z"/><line x1="9" y1="3" x2="15" y2="14"/></svg>`,
    calendar: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    notion: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="#FFFFFF"><path d="M5 4h3.5l6.5 10.5V4H19v16h-3.5L9 9.5V20H5V4z"/></svg>`,
    github: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="#FFFFFF"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>`,
    chatgpt: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="5.6" y1="5.6" x2="18.4" y2="18.4"/><line x1="18.4" y1="5.6" x2="5.6" y2="18.4"/></svg>`,
    keep: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>`,
    ads: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 19 10 5 14 13 8 16"/><circle cx="18" cy="17" r="2"/></svg>`,
    playstore: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
    playconsole: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="4 5 14 12 4 19 4 5"/><polyline points="15 7 20 12 15 17"/></svg>`,
    meet: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="13" height="12" rx="2"/><polygon points="16 10 21 7 21 17 16 14"/></svg>`,
    chat: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    classroom: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="3"/><path d="M6 19c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>`,
    googleone: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 6l4-3v18"/></svg>`,
    slides: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="14" rx="2"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="12" y1="18" x2="12" y2="21"/></svg>`,
    ytmusic: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><polygon points="11 9 15 12 11 15" fill="#FFFFFF" stroke="none"/></svg>`,
    quizlet: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="#FFFFFF"><rect x="4" y="4" width="16" height="4" rx="2"/><rect x="4" y="10" width="16" height="4" rx="2"/><rect x="4" y="16" width="16" height="4" rx="2"/></svg>`,
    moodle: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><text x="12" y="18" fill="#FFFFFF" font-size="18" font-weight="900" text-anchor="middle">m</text></svg>`,
    compass: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polygon points="12 6 15 12 12 10 9 12" fill="#FFFFFF"/><polygon points="12 18 15 12 12 14 9 12" fill="#FFFFFF"/></svg>`,
    word: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><text x="12" y="16" fill="#FFFFFF" font-size="12" font-weight="900" text-anchor="middle">W</text></svg>`,
    excel: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><text x="12" y="16" fill="#FFFFFF" font-size="12" font-weight="900" text-anchor="middle">X</text></svg>`,
    powerpoint: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><text x="12" y="16" fill="#FFFFFF" font-size="12" font-weight="900" text-anchor="middle">P</text></svg>`,
    onenote: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><text x="12" y="16" fill="#FFFFFF" font-size="12" font-weight="900" text-anchor="middle">N</text></svg>`,
    onedrive: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H6.2a4.2 4.2 0 0 1-.2-8.4 5.6 5.6 0 0 1 10.8-2 3.8 3.8 0 0 1 .7 10.4z"/></svg>`,
    blooket: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="#FFFFFF"><text x="12" y="16" fill="#FFFFFF" font-size="10" font-weight="900" text-anchor="middle">B</text></svg>`,
    trading: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 17 9 11 13 15 21 7"/><polyline points="14 7 21 7 21 14"/></svg>`,
    discord: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="#FFFFFF"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>`,
    reddit: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="#FFFFFF"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm5.01 11.08a1.5 1.5 0 0 1-1.39.92 6.54 6.54 0 0 1-3.62 1.05 6.54 6.54 0 0 1-3.62-1.05 1.5 1.5 0 0 1-1.39-.92 1.48 1.48 0 0 1 .42-1.63 1.5 1.5 0 0 1 1.7-.17 7.7 7.7 0 0 1 2.89-.54l.5-2.33 1.63.35a1.14 1.14 0 1 1 .23 1.07l-1.3-.28-.38 1.78a7.66 7.66 0 0 1 2.89.54 1.5 1.5 0 0 1 1.7.17 1.48 1.48 0 0 1 .42 1.63z"/></svg>`,
    claude: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="none" stroke="#FFFFFF" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 3v18"/><path d="M3 12h18"/><path d="M5.6 5.6l12.8 12.8"/><path d="M18.4 5.6L5.6 18.4"/></svg>`,
    generic: `<svg viewBox="0 0 24 24" class="app-icon-svg" fill="none" stroke="#FFFFFF" stroke-width="2"><circle cx="12" cy="12" r="9"/><text x="12" y="16" fill="#FFFFFF" font-size="12" font-weight="700" text-anchor="middle">★</text></svg>`
  };

  // =========================================================================
  // Authentic Official Brand Icons (Vector SVGs)
  // =========================================================================
  const OFFICIAL_ICONS = {
    // 8 Homescreen Apps
    docs: `<svg viewBox="0 0 48 48" class="app-icon-svg"><defs><filter id="docShadow" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="rgba(0,0,0,0.18)"/></filter></defs><rect width="44" height="44" x="2" y="2" rx="11" fill="#FFFFFF"/><g filter="url(#docShadow)"><path fill="#4285F4" d="M29 10H15a3 3 0 0 0-3 3v22a3 3 0 0 0 3 3h18a3 3 0 0 0 3-3V17l-7-7z"/><path fill="#A1C2FA" d="M29 10v7h7l-7-7z"/><path fill="#1967D2" opacity="0.35" d="M29 17h7l-7-7v7z"/><rect x="16.5" y="21" width="15" height="2" rx="1" fill="#FFFFFF"/><rect x="16.5" y="25.5" width="15" height="2" rx="1" fill="#FFFFFF"/><rect x="16.5" y="30" width="9.5" height="2" rx="1" fill="#FFFFFF"/></g></svg>`,
    playconsole: `<svg viewBox="0 0 48 48" class="app-icon-svg"><defs><linearGradient id="gpcBg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#023859"/><stop offset="100%" stop-color="#011F33"/></linearGradient></defs><rect width="44" height="44" x="2" y="2" rx="11" fill="url(#gpcBg)"/><path fill="#00B0FF" d="M12 14v20l12-10L12 14z"/><path fill="#FF3D00" d="M12 14l12 10 4-4-16-6z"/><path fill="#00E676" d="M12 34l16-6-4-4-12 10z"/><path fill="#FFD600" d="M24 24l4-4 4 4-4 4-4-4z"/><path fill="#FFFFFF" d="M22 29l2.5 2.5-2.5 2.5 1.2 1.2 3.7-3.7-3.7-3.7-1.2 1.2zm6 5.2h5v1.6h-5v-1.6z"/></svg>`,
    gmail: `<svg viewBox="0 0 48 48" class="app-icon-svg"><rect width="44" height="44" x="2" y="2" rx="11" fill="#FFFFFF"/><g transform="translate(1, 0.5)"><path fill="#4285F4" d="M10 18v15a3.5 3.5 0 0 0 3.5 3.5h3.5V23.5L10 18z"/><path fill="#34A853" d="M36 18l-7 5.5V36.5h3.5a3.5 3.5 0 0 0 3.5-3.5V18z"/><path fill="#FBBC05" d="M10 18l7 5.5V12h-3.5A3.5 3.5 0 0 0 10 15.5V18z"/><path fill="#C5221F" d="M36 18v-2.5A3.5 3.5 0 0 0 32.5 12H29v11.5l7-5.5z"/><path fill="#EA4335" d="M17 23.5l6 4.8 6-4.8V12H17v11.5z"/></g></svg>`,
    analytics: `<svg viewBox="0 0 48 48" class="app-icon-svg"><rect width="44" height="44" x="2" y="2" rx="11" fill="#FFFFFF"/><g transform="translate(2, 2)"><rect x="8" y="24" width="6.5" height="13" rx="3.25" fill="#F9AB00"/><rect x="17.5" y="15" width="6.5" height="22" rx="3.25" fill="#E37400"/><rect x="27" y="6" width="6.5" height="31" rx="3.25" fill="#EA4335"/><circle cx="30.25" cy="9.25" r="3.25" fill="#F9AB00"/></g></svg>`,
    canvas: `<svg viewBox="0 0 48 48" class="app-icon-svg"><rect width="44" height="44" x="2" y="2" rx="11" fill="#E1382B"/><g fill="#FFFFFF"><circle cx="24" cy="13" r="2.9"/><circle cx="31.8" cy="16.2" r="2.9"/><circle cx="35" cy="24" r="2.9"/><circle cx="31.8" cy="31.8" r="2.9"/><circle cx="24" cy="35" r="2.9"/><circle cx="16.2" cy="31.8" r="2.9"/><circle cx="13" cy="24" r="2.9"/><circle cx="16.2" cy="16.2" r="2.9"/><circle cx="24" cy="24" r="2.4"/></g></svg>`,
    sentral: `<svg viewBox="0 0 48 48" class="app-icon-svg"><defs><linearGradient id="sentralShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#00C0FF"/><stop offset="100%" stop-color="#0066FF"/></linearGradient></defs><rect width="44" height="44" x="2" y="2" rx="11" fill="#0A2540"/><path fill="url(#sentralShieldGrad)" d="M24 9.5l11.5 4.8v9.8c0 7.4-5 13.2-11.5 15-6.5-1.8-11.5-7.6-11.5-15v-9.8L24 9.5z"/><path fill="#FFFFFF" d="M28.2 17.2c-1.3-.6-2.7-.9-4.2-.9-3.4 0-5.5 1.7-5.5 4.4 0 5 10 3 10 8.2 0 3.4-3 5-6.6 5-2.1 0-4-.5-5.4-1.4l1-3.2c1.2.7 2.8 1.2 4.4 1.2 3.1 0 5.1-1.5 5.1-4 0-5.4-10-3.2-10-8.3 0-3.3 2.7-5.3 6.6-5.3 1.9 0 3.5.3 4.9 1l-1.3 3.3z"/></svg>`,
    canva: `<svg viewBox="0 0 48 48" class="app-icon-svg"><defs><linearGradient id="canvaTileGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#00C4CC"/><stop offset="45%" stop-color="#2D5BFF"/><stop offset="100%" stop-color="#7D2AE8"/></linearGradient></defs><rect width="44" height="44" x="2" y="2" rx="11" fill="url(#canvaTileGrad)"/><path fill="#FFFFFF" d="M29 16.5c-2.3-1.3-4.9-1.7-7.8-1.1-4.2.9-7.4 4.5-7.4 9.5 0 5.6 3.9 9.1 9.5 9.1 3.2 0 6.1-1.2 8-3.1.7-.8.3-2-.8-2-1.2 0-2.3.8-3.6 1.4-1.1.5-2.3.8-3.6.8-4.1 0-7.1-2.6-7.1-6.8 0-4.5 3.3-7.5 7.6-7.5 1.6 0 3.1.4 4.1 1.2.9.7 2.1 1 2.8.3.8-.7.4-1.9-.7-2.6z"/></svg>`,
    mildang: `<svg viewBox="0 0 48 48" class="app-icon-svg"><rect width="44" height="44" x="2" y="2" rx="11" fill="#6F42C1"/><path fill="#FFFFFF" d="M24 12l14 7-14 7-14-7 14-7z"/><path fill="#FFFFFF" opacity="0.9" d="M14.5 22.5v6.5c0 3.8 4.3 6.8 9.5 6.8s9.5-3 9.5-6.8v-6.5l-9.5 4.8-9.5-4.8z"/><path fill="#FFD54F" d="M38 19v9c0 .7-.6 1.3-1.4 1.3s-1.4-.6-1.4-1.3v-7.6l2.8-1.4z"/><polygon points="24,28.5 25.4,31.2 28.3,31.6 26.2,33.5 26.7,36.4 24,35 21.3,36.4 21.8,33.5 19.7,31.6 22.6,31.2" fill="#FFD54F"/></svg>`,

    // Google Suite & Productivity
    meet: `<svg viewBox="0 0 48 48" class="app-icon-svg"><rect width="44" height="44" x="2" y="2" rx="11" fill="#FFFFFF"/><g transform="translate(1, 0.5)"><path fill="#00832D" d="M28.5 26.5l8.5 7V12.5l-8.5 7v7z"/><path fill="#0066DA" d="M28.5 33H11.5a3.5 3.5 0 0 1-3.5-3.5V18h20.5v15z"/><path fill="#E53935" d="M11.5 13.5h17a3.5 3.5 0 0 1 3.5 3.5v3.5H8v-3.5a3.5 3.5 0 0 1 3.5-3.5z"/><path fill="#00AC47" d="M8 17h20.5v11H8z"/><path fill="#FFBA00" d="M28.5 13.5l8.5 6.5v-6.5l-8.5 0z"/></g></svg>`,
    chat: `<svg viewBox="0 0 48 48" class="app-icon-svg"><rect width="44" height="44" x="2" y="2" rx="11" fill="#FFFFFF"/><g transform="translate(1, 1)"><path fill="#00AC47" d="M26 11H13a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h2v5l6-5h5a5 5 0 0 0 5-5V16a5 5 0 0 0-5-5z"/><path fill="#00832D" d="M31 16h-3v10a5 5 0 0 1-5 5h-7v2a5 5 0 0 0 5 5h6l6 5v-5h2a5 5 0 0 0 5-5V21a5 5 0 0 0-5-5z"/></g></svg>`,
    photos: `<svg viewBox="0 0 48 48" class="app-icon-svg"><rect width="44" height="44" x="2" y="2" rx="11" fill="#FFFFFF"/><g><path fill="#EA4335" d="M24 14.5c0-5.25-4.25-9.5-9.5-9.5S5 9.25 5 14.5s4.25 9.5 9.5 9.5h9.5v-9.5z"/><path fill="#FBBC04" d="M33.5 24c5.25 0 9.5-4.25 9.5-9.5s-4.25-9.5-9.5-9.5-9.5 4.25-9.5 9.5v9.5h9.5z"/><path fill="#34A853" d="M24 33.5c0 5.25 4.25 9.5 9.5 9.5s9.5-4.25 9.5-9.5-4.25-9.5-9.5-9.5H24v9.5z"/><path fill="#4285F4" d="M14.5 24c-5.25 0-9.5 4.25-9.5 9.5s4.25 9.5 9.5 9.5 9.5-4.25 9.5-9.5V24h-9.5z"/></g></svg>`,
    drive: `<svg viewBox="0 0 48 48" class="app-icon-svg"><path fill="#FFBA00" d="M18.8 7.5h10.4l13.6 23.5H32.4L18.8 7.5z"/><path fill="#2684FC" d="M15.4 31H42.8L37.6 40H10.2L15.4 31z"/><path fill="#00AC47" d="M5.2 24.8l5 8.7 13.6-23.5-5-8.7L5.2 24.8z"/></svg>`,
    calendar: `<svg viewBox="0 0 48 48" class="app-icon-svg"><rect width="36" height="36" x="6" y="6" rx="8" fill="#FFFFFF"/><path fill="#4285F4" d="M14 6h20a8 8 0 0 1 8 8v3H6v-3a8 8 0 0 1 8-8z"/><path fill="#EA4335" d="M34 6a8 8 0 0 1 8 8v3h-8V6z"/><text x="24" y="34" fill="#1A73E8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" text-anchor="middle">31</text></svg>`,
    keep: `<svg viewBox="0 0 48 48" class="app-icon-svg"><rect width="36" height="36" x="6" y="6" rx="8" fill="#FBBC04"/><path fill="#FFFFFF" d="M24 12a8 8 0 0 0-5 14.2V29c0 .6.4 1 1 1h8c.6 0 1-.4 1-1v-2.8A8 8 0 0 0 24 12zm-3 20h6v1.5h-6V32z"/></svg>`,
    slides: `<svg viewBox="0 0 48 48" class="app-icon-svg"><path fill="#F9AB00" d="M30 4H14a4 4 0 0 0-4 4v32a4 4 0 0 0 4 4h20a4 4 0 0 0 4-4V14L30 4z"/><path fill="#FFE082" d="M30 4v10h10L30 4z"/><rect x="16" y="21" width="16" height="11" rx="1.5" fill="#FFFFFF"/></svg>`,
    playstore: `<svg viewBox="0 0 48 48" class="app-icon-svg"><path fill="#4285F4" d="M8.2 6.4c-.4.5-.6 1.1-.6 1.9v31.4c0 .8.2 1.4.6 1.9l16.8-17.6L8.2 6.4z"/><path fill="#EA4335" d="M29.5 28.5L25 24 8.2 41.6c.6.3 1.4.3 2.1-.1l19.2-13z"/><path fill="#34A853" d="M29.5 19.5L10.3 6.5c-.7-.4-1.5-.4-2.1-.1L25 24l4.5-4.5z"/><path fill="#FBBC04" d="M39.8 21.8l-10.3-2.3 4.5 4.5-4.5 4.5 10.3-2.3c1.4-.8 1.4-3.6 0-4.4z"/></svg>`,
    classroom: `<svg viewBox="0 0 48 48" class="app-icon-svg"><rect width="38" height="30" x="5" y="9" rx="5" fill="#F9AB00"/><rect width="32" height="24" x="8" y="12" rx="3" fill="#0F9D58"/><circle cx="24" cy="20" r="3.2" fill="#FFFFFF"/><path fill="#FFFFFF" d="M19 28c0-2.8 2.2-4.5 5-4.5s5 1.7 5 4.5v1h-10v-1z"/><circle cx="16" cy="21.5" r="2.5" fill="#FFFFFF" opacity="0.8"/><path fill="#FFFFFF" d="M12.5 28.5c0-2 1.6-3.2 3.5-3.2 1 0 1.9.4 2.5 1v2.2h-6z" opacity="0.8"/><circle cx="32" cy="21.5" r="2.5" fill="#FFFFFF" opacity="0.8"/><path fill="#FFFFFF" d="M35.5 28.5c0-2-1.6-3.2-3.5-3.2-1 0-1.9.4-2.5 1v2.2h6z" opacity="0.8"/></svg>`,
    maps: `<svg viewBox="0 0 48 48" class="app-icon-svg"><path fill="#4285F4" d="M24 4C14.6 4 7 11.6 7 21c0 11.5 14.5 22.2 16.1 23.3.5.4 1.3.4 1.8 0C26.5 33.2 41 22.5 41 21c0-9.4-7.6-17-17-17z"/><path fill="#EA4335" d="M24 4c-9.4 0-17 7.6-17 17 0 5.4 2.5 10.2 6.5 13.5L24 21V4z"/><path fill="#34A853" d="M24 43.5c-.3 0-.6-.1-.9-.3C21.5 42.1 7 31.4 7 21c0-2.3.5-4.4 1.3-6.4L24 35v8.5z"/><path fill="#FBBC04" d="M24 4v17l10.5 13.5c4-3.3 6.5-8.1 6.5-13.5 0-9.4-7.6-17-17-17z"/><circle cx="24" cy="20" r="6" fill="#FFFFFF"/></svg>`,
    googleone: `<svg viewBox="0 0 48 48" class="app-icon-svg"><path fill="#4285F4" d="M28 8v32h-7V16.5l-4 2.5-3.5-5.5L24 7.5h4z"/><path fill="#EA4335" d="M28 8v8h-7l3-8h4z"/><path fill="#34A853" d="M28 32v8h-7v-8h7z"/><path fill="#FBBC04" d="M21 40h-4a4 4 0 0 1-4-4v-8h6v8h2z"/></svg>`,
    ads: `<svg viewBox="0 0 48 48" class="app-icon-svg"><path fill="#4285F4" d="M9.5 34.5l14-24.2c1.8-3.1 5.8-4.2 8.9-2.4s4.2 5.8 2.4 8.9l-14 24.2c-1.8 3.1-5.8 4.2-8.9 2.4s-4.2-5.8-2.4-8.9z"/><path fill="#34A853" d="M23.5 10.3l14 24.2c1.8 3.1.7 7.1-2.4 8.9s-7.1.7-8.9-2.4l-14-24.2c-1.8-3.1-.7-7.1 2.4-8.9s7.1-.7 8.9 2.4z"/><circle cx="15" cy="37" r="5.5" fill="#FBBC04"/></svg>`,

    // Tools & Developer
    settings_app: `<svg viewBox="0 0 48 48" class="app-icon-svg"><circle cx="24" cy="24" r="6" fill="#FFFFFF"/><path fill="#FFFFFF" d="M38.8 21.6l-2.6-.4c-.3-.9-.7-1.8-1.2-2.6l1.6-2.1c.5-.7.4-1.6-.2-2.2l-2.6-2.6c-.6-.6-1.5-.7-2.2-.2l-2.1 1.6c-.8-.5-1.7-.9-2.6-1.2l-.4-2.6c-.1-.8-.8-1.5-1.7-1.5h-3.6c-.9 0-1.6.7-1.7 1.5l-.4 2.6c-.9.3-1.8.7-2.6 1.2l-2.1-1.6c-.7-.5-1.6-.4-2.2.2l-2.6 2.6c-.6.6-.7 1.5-.2 2.2l1.6 2.1c-.5.8-.9 1.7-1.2 2.6l-2.6.4c-.8.1-1.5.8-1.5 1.7v3.6c0 .9.7 1.6 1.5 1.7l2.6.4c.3.9.7 1.8 1.2 2.6l-1.6 2.1c-.5.7-.4 1.6.2 2.2l2.6 2.6c.6.6 1.5.7 2.2.2l2.1-1.6c.8.5 1.7.9 2.6 1.2l.4 2.6c.1.8.8 1.5 1.7 1.5h3.6c.9 0 1.6-.7 1.7-1.5l.4-2.6c.9-.3 1.8-.7 2.6-1.2l2.1 1.6c.7.5 1.6.4 2.2-.2l2.6-2.6c.6-.6.7-1.5.2-2.2l-1.6-2.1c.5-.8.9-1.7 1.2-2.6l2.6-.4c.8-.1 1.5-.8 1.5-1.7v-3.6c0-.9-.7-1.6-1.5-1.7zm-14.8 8.4c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"/></svg>`,
    chatgpt: `<svg viewBox="0 0 48 48" class="app-icon-svg"><rect width="40" height="40" x="4" y="4" rx="10" fill="#10A37F"/><path fill="#FFFFFF" d="M34.8 21.6a6.8 6.8 0 0 0-.6-5.8 7 7 0 0 0-7.3-3.2 6.8 6.8 0 0 0-5.3-2.6 7 7 0 0 0-6.7 5 6.8 6.8 0 0 0-4.7 3.4 7 7 0 0 0 .6 8 6.8 6.8 0 0 0 .6 5.8 7 7 0 0 0 7.3 3.2 6.8 6.8 0 0 0 5.3 2.6 7 7 0 0 0 6.7-5 6.8 6.8 0 0 0 4.7-3.4 7 7 0 0 0-.6-8zm-11.8 13.9a5.1 5.1 0 0 1-3.6-1.5l1.2-1.2a3.4 3.4 0 0 0 4.8 0l.4.4a5.1 5.1 0 0 1-2.8 2.3zm-7.6-4.5a5.1 5.1 0 0 1-1.3-3.7l1.7-.3a3.4 3.4 0 0 0 2.4 4.2l-.3.5a5.1 5.1 0 0 1-2.5-.7zm-2.4-8.8a5.1 5.1 0 0 1 2.3-3.1l.8 1.5a3.4 3.4 0 0 0-2.4 4.2l-.6-.2a5.1 5.1 0 0 1-.1-2.4zm16.4-4.5a3.4 3.4 0 0 0-4.8 0l-.4-.4a5.1 5.1 0 0 1 6.4-.8l-1.2 1.2zm2.8 8.4l-.8-1.5a3.4 3.4 0 0 0 2.4-4.2l.6.2a5.1 5.1 0 0 1 .1 2.4 5.1 5.1 0 0 1-2.3 3.1zm-3.2 7a3.4 3.4 0 0 0 2.4-4.2l.6-.2a5.1 5.1 0 0 1 .1 2.4 5.1 5.1 0 0 1-2.3 3.1l-.8-1.1z"/></svg>`,
    claude: `<svg viewBox="0 0 48 48" class="app-icon-svg"><rect width="40" height="40" x="4" y="4" rx="10" fill="#CC785C"/><path fill="#FFFFFF" d="M27.8 13.5l-3.2 7.2-3.2-7.2-2.8 1.4 3.2 7.2-7.2-3.2-1.4 2.8 7.2 3.2-7.2 3.2 1.4 2.8 7.2-3.2-3.2 7.2 2.8 1.4 3.2-7.2 3.2 7.2 2.8-1.4-3.2-7.2 7.2 3.2 1.4-2.8-7.2-3.2 7.2-3.2-1.4-2.8-7.2 3.2 3.2-7.2-2.8-1.4z"/></svg>`,
    notion: `<svg viewBox="0 0 48 48" class="app-icon-svg"><rect width="40" height="40" x="4" y="4" rx="10" fill="#000000"/><path fill="#FFFFFF" d="M12.5 12.8c1.3.4 1.8 1.1 1.8 2.6v17.2c0 1.6-.7 2.2-2.3 2.6l-.5.1v1.2h8.6v-1.2l-.7-.1c-1.6-.4-2.1-1.1-2.1-2.6V19.4l11.5 15.6c.9 1.2 1.8 1.6 3.2 1.6h5.8v-1.2l-1.3-.2c-1.2-.2-1.7-.8-1.7-2.2V15.7c0-1.4.6-2 1.9-2.3l1.1-.2V12h-8.2v1.2l.6.1c1.5.3 2 1 2 2.3v11.8L21.3 12h-8.8v.8z"/></svg>`,
    github: `<svg viewBox="0 0 48 48" class="app-icon-svg"><rect width="40" height="40" x="4" y="4" rx="10" fill="#24292E"/><path fill="#FFFFFF" fill-rule="evenodd" d="M24 10a14 14 0 0 0-4.4 27.3c.7.1 1-.3 1-.7v-2.4c-3.9.8-4.7-1.9-4.7-1.9-.6-1.6-1.5-2.1-1.5-2.1-1.3-.9.1-.9.1-.9 1.4.1 2.2 1.5 2.2 1.5 1.2 2.2 3.3 1.5 4.1 1.2.1-.9.5-1.5.9-1.9-3.1-.4-6.4-1.6-6.4-7 0-1.5.5-2.8 1.4-3.8-.1-.4-.6-1.8.1-3.7 0 0 1.2-.4 3.9 1.5a13.5 13.5 0 0 1 7.1 0c2.7-1.9 3.9-1.5 3.9-1.5.7 1.9.3 3.3.1 3.7.9 1 1.4 2.3 1.4 3.8 0 5.4-3.3 6.6-6.4 7 .5.4.9 1.3.9 2.6v3.9c0 .4.3.8 1 .7A14 14 0 0 0 24 10z"/></svg>`,
    trading: `<svg viewBox="0 0 48 48" class="app-icon-svg"><rect width="40" height="40" x="4" y="4" rx="10" fill="#131722"/><path fill="#2962FF" d="M12 28h5v-8h-5v8zm8 6h5V14h-5v20zm8-18v12h5V16h-5z"/><polyline points="10,24 17,16 25,22 35,12" fill="none" stroke="#00E676" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

    // Entertainment, Leisure & Social
    youtube: `<svg viewBox="0 0 48 48" class="app-icon-svg"><path fill="#FF0000" d="M43.2 15.5c-.5-1.9-2-3.4-3.9-3.9C35.8 10.5 24 10.5 24 10.5s-11.8 0-15.3 1.1c-1.9.5-3.4 2-3.9 3.9C3.7 19 3.7 24 3.7 24s0 5 1.1 8.5c.5 1.9 2 3.4 3.9 3.9 3.5 1.1 15.3 1.1 15.3 1.1s11.8 0 15.3-1.1c1.9-.5 3.4-2 3.9-3.9 1.1-3.5 1.1-8.5 1.1-8.5s0-5-1.1-8.5z"/><polygon points="20,18 31,24 20,30" fill="#FFFFFF"/></svg>`,
    spotify: `<svg viewBox="0 0 48 48" class="app-icon-svg"><circle cx="24" cy="24" r="20" fill="#1ED760"/><path fill="#000000" d="M33.2 29.4c-.4.6-1.2.8-1.8.4-5-3.1-11.3-3.8-18.7-2.1-.7.2-1.4-.3-1.5-1-.2-.7.3-1.4 1-1.5 8.1-1.9 15.1-1.1 20.6 2.3.6.4.8 1.3.4 1.9zm2.4-5.3c-.5.8-1.5 1-2.3.5-5.7-3.5-14.4-4.5-21.2-2.4-.9.3-1.8-.2-2.1-1.1-.3-.9.2-1.8 1.1-2.1 7.7-2.3 17.3-1.2 24 2.9.8.4 1 1.5.5 2.2zm.2-5.5C29 14.6 17.7 14.2 11.2 16.2c-1.1.3-2.2-.3-2.5-1.4-.3-1.1.3-2.2 1.4-2.5 7.6-2.3 20.1-1.8 27.6 2.7 1 .6 1.3 1.9.7 2.9-.6.9-1.9 1.3-2.6.7z"/></svg>`,
    ytmusic: `<svg viewBox="0 0 48 48" class="app-icon-svg"><circle cx="24" cy="24" r="20" fill="#FF0000"/><circle cx="24" cy="24" r="14" fill="#FFFFFF" opacity="0.25"/><circle cx="24" cy="24" r="8" fill="#FFFFFF"/><polygon points="22,20 28,24 22,28" fill="#FF0000"/></svg>`,
    snapchat: `<svg viewBox="0 0 48 48" class="app-icon-svg"><rect width="40" height="40" x="4" y="4" rx="10" fill="#FFFC00"/><path fill="#FFFFFF" stroke="#000000" stroke-width="1.8" stroke-linejoin="round" d="M24 11c-5.2 0-9.2 3.8-9.2 9.2 0 1.5.5 3.2.7 3.7-.8.3-2.2 1-2.5 2.4-.3 1.2.5 2.4 1.7 2.7.2 1.8-1.2 3.4-3 3.7-.7.2-1.2.7-1 1.4.2.7.8 1.2 1.5 1.2 2 0 3.7-.8 4.5-1.7 1.4 1.4 3.8 2.7 7.3 2.7s6-1.3 7.3-2.7c.8.9 2.5 1.7 4.5 1.7.7 0 1.3-.5 1.5-1.2.2-.7-.3-1.2-1-1.4-1.8-.3-3.2-1.9-3-3.7 1.2-.3 2-1.5 1.7-2.7-.3-1.4-1.7-2.1-2.5-2.4.2-.5.7-2.2.7-3.7 0-5.4-4-9.2-9.2-9.2z"/></svg>`,
    twitter: `<svg viewBox="0 0 48 48" class="app-icon-svg"><rect width="40" height="40" x="4" y="4" rx="10" fill="#000000"/><path fill="#FFFFFF" d="M30.4 13h4.6l-10 11.4 11.8 15.6H27.5l-7.3-9.5-8.3 9.5H7.3l10.7-12.2L6.8 13h9.6l6.6 8.7L30.4 13zm-1.6 24.3h2.6L16.4 15.5h-2.8L28.8 37.3z"/></svg>`,
    instagram: `<svg viewBox="0 0 48 48" class="app-icon-svg"><defs><radialGradient id="instaGrad" cx="30%" cy="105%" r="130%"><stop offset="0%" stop-color="#FFD521"/><stop offset="10%" stop-color="#FFD521"/><stop offset="50%" stop-color="#F50000"/><stop offset="100%" stop-color="#B700B0"/></radialGradient></defs><rect width="40" height="40" x="4" y="4" rx="11" fill="url(#instaGrad)"/><rect x="12" y="12" width="24" height="24" rx="7" fill="none" stroke="#FFFFFF" stroke-width="2.5"/><circle cx="24" cy="24" r="5.5" fill="none" stroke="#FFFFFF" stroke-width="2.5"/><circle cx="31" cy="17" r="1.5" fill="#FFFFFF"/></svg>`,
    tiktok: `<svg viewBox="0 0 48 48" class="app-icon-svg"><rect width="40" height="40" x="4" y="4" rx="10" fill="#000000"/><path fill="#25F4EE" d="M31 16.5a8 8 0 0 1-5-2v14.5a7 7 0 1 1-7-7c.7 0 1.4.1 2 .3V17a12 12 0 1 0 10 11.8V21a13 13 0 0 0 7 2.2v-5a8 8 0 0 1-7-1.7z" opacity="0.8"/><path fill="#FE2C55" d="M33 18.5a8 8 0 0 1-5-2v14.5a7 7 0 1 1-7-7c.7 0 1.4.1 2 .3V19a12 12 0 1 0 10 11.8V23a13 13 0 0 0 7 2.2v-5a8 8 0 0 1-7-1.7z" opacity="0.8"/><path fill="#FFFFFF" d="M32 17.5a8 8 0 0 1-5-2v14.5a7 7 0 1 1-7-7c.7 0 1.4.1 2 .3V18a12 12 0 1 0 10 11.8V22a13 13 0 0 0 7 2.2v-5a8 8 0 0 1-7-1.7z"/></svg>`,
    discord: `<svg viewBox="0 0 48 48" class="app-icon-svg"><rect width="40" height="40" x="4" y="4" rx="10" fill="#5865F2"/><path fill="#FFFFFF" d="M32.8 14.8a21.4 21.4 0 0 0-5.3-1.6c-.2.4-.5 1-.7 1.4a20 20 0 0 0-6 0c-.2-.4-.5-1-.7-1.4a21.4 21.4 0 0 0-5.3 1.6 22.8 22.8 0 0 0-3.8 15.6 21.6 21.6 0 0 0 6.6 3.4c.5-.7 1-1.5 1.4-2.3a14.4 14.4 0 0 1-2.3-1.1c.2-.1.4-.3.6-.4 4.5 2.1 9.4 2.1 13.8 0 .2.1.4.3.6.4-.7.4-1.5.8-2.3 1.1.4.8.9 1.6 1.4 2.3a21.6 21.6 0 0 0 6.6-3.4c.5-5.9-1-11.4-4.2-15.6zM19.2 26.8c-1.3 0-2.4-1.2-2.4-2.7s1.1-2.7 2.4-2.7 2.4 1.2 2.4 2.7-1.1 2.7-2.4 2.7zm9.6 0c-1.3 0-2.4-1.2-2.4-2.7s1.1-2.7 2.4-2.7 2.4 1.2 2.4 2.7-1.1 2.7-2.4 2.7z"/></svg>`,
    reddit: `<svg viewBox="0 0 48 48" class="app-icon-svg"><circle cx="24" cy="24" r="20" fill="#FF4500"/><path fill="#FFFFFF" d="M37.3 22.7c0-1.4-1.1-2.5-2.5-2.5-.7 0-1.3.3-1.7.7-2.5-1.7-5.9-2.8-9.7-2.9l1.7-7.7 5.4 1.2a2.3 2.3 0 1 0 2.2-1.7c-.8 0-1.5.4-1.9 1l-6.1-1.3c-.3-.1-.6.1-.7.4l-2 9.2c-3.9.1-7.4 1.2-9.9 2.9-.4-.4-1-.7-1.7-.7-1.4 0-2.5 1.1-2.5 2.5 0 1 .6 1.8 1.4 2.2-.1.5-.1 1-.1 1.5 0 4.6 5.3 8.3 11.9 8.3s11.9-3.7 11.9-8.3c0-.5 0-1-.1-1.5.8-.4 1.4-1.2 1.4-2.2zM18.8 24.8a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm10.7 6.4c-1.6 1.2-4.1 1.2-5.5 1.2s-3.9 0-5.5-1.2c-.3-.2-.3-.6-.1-.9.2-.3.6-.3.9-.1 1.3.9 3.3.9 4.7.9s3.4 0 4.7-.9c.3-.2.7-.1.9.1.2.3.1.7-.1.9zm-.3-4.4a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>`,

    // Microsoft 365
    word: `<svg viewBox="0 0 48 48" class="app-icon-svg"><rect width="36" height="36" x="6" y="6" rx="6" fill="#185ABD"/><path fill="#FFFFFF" d="M14 14h4.5l3.2 13 3.5-13h4.6l3.5 13 3.2-13H41l-4.8 20h-5l-3.6-13.5L24 34h-5L14 14z"/></svg>`,
    excel: `<svg viewBox="0 0 48 48" class="app-icon-svg"><rect width="36" height="36" x="6" y="6" rx="6" fill="#107C41"/><path fill="#FFFFFF" d="M16 14h5.5l4.5 7.5 4.5-7.5H36l-6.8 10 7.2 10h-5.5L26 26l-4.9 8H15.5l7.2-10L16 14z"/></svg>`,
    powerpoint: `<svg viewBox="0 0 48 48" class="app-icon-svg"><rect width="36" height="36" x="6" y="6" rx="6" fill="#C43E1C"/><path fill="#FFFFFF" d="M17 14h8.5c4.7 0 8 2.8 8 7s-3.3 7-8 7H22v6h-5V14zm5 9.5h3.2c2 0 3.3-1.1 3.3-2.5s-1.3-2.5-3.3-2.5H22v5z"/></svg>`,
    onenote: `<svg viewBox="0 0 48 48" class="app-icon-svg"><rect width="36" height="36" x="6" y="6" rx="6" fill="#7719AA"/><path fill="#FFFFFF" d="M17 14h5l9 12.5V14h5v20h-5L22 21.5V34h-5V14z"/></svg>`,
    onedrive: `<svg viewBox="0 0 48 48" class="app-icon-svg"><path fill="#0078D4" d="M33 34H12.5a8.5 8.5 0 0 1-1.2-16.9A11.5 11.5 0 0 1 33 16.5 8.5 8.5 0 0 1 33 34z"/><path fill="#50E6FF" d="M23 20a9 9 0 0 1 14 3.5 7.5 7.5 0 0 1 2 14.5H23V20z" opacity="0.6"/></svg>`,

    // School & Study
    compass: `<svg viewBox="0 0 48 48" class="app-icon-svg"><circle cx="24" cy="24" r="20" fill="#1B9AAA"/><polygon points="24,10 27.5,21.5 38,24 27.5,26.5 24,38 20.5,26.5 10,24 20.5,21.5" fill="#FFFFFF"/><circle cx="24" cy="24" r="2.5" fill="#1B9AAA"/></svg>`,
    moodle: `<svg viewBox="0 0 48 48" class="app-icon-svg"><rect width="40" height="40" x="4" y="4" rx="10" fill="#F98012"/><path fill="#FFFFFF" d="M14 22v12h4v-7.5c0-2 1.2-3.2 2.8-3.2 1.6 0 2.5 1 2.5 2.8V34h4v-7.5c0-2 1.2-3.2 2.8-3.2 1.6 0 2.5 1 2.5 2.8V34h4V24.5c0-3.5-2.2-5.5-5.2-5.5-2.2 0-4 1-5 2.6-.9-1.6-2.5-2.6-4.6-2.6-2.4 0-4.3 1.2-5.3 3v-2.5h-2.5v2.5H14z"/><polygon points="24,8 34,13 24,18 14,13" fill="#FFFFFF"/></svg>`,
    quizlet: `<svg viewBox="0 0 48 48" class="app-icon-svg"><rect width="40" height="40" x="4" y="4" rx="10" fill="#4257B2"/><path fill="#FFFFFF" d="M24 12c-6.6 0-12 5.4-12 12s5.4 12 12 12c2.8 0 5.4-1 7.4-2.6l3.3 3.3 2.8-2.8-3.3-3.3c1.8-2 2.8-4.6 2.8-7.6 0-6.6-5.4-12-12-12zm0 19c-3.9 0-7-3.1-7-7s3.1-7 7-7 7 3.1 7 7-3.1 7-7 7z"/></svg>`,
    blooket: `<svg viewBox="0 0 48 48" class="app-icon-svg"><rect width="40" height="40" x="4" y="4" rx="10" fill="#00C3FF"/><path fill="#FFFFFF" d="M17 12h8.5c4.1 0 7 2.2 7 5.5 0 2.2-1.2 3.8-3.2 4.7 2.6.8 4.2 2.7 4.2 5.3 0 3.8-3.2 6.5-7.5 6.5H17V12zm5.5 8h2.8c1.5 0 2.5-.8 2.5-2s-1-2-2.5-2h-2.8v4zm0 9.5h3.2c1.8 0 2.8-.9 2.8-2.2s-1-2.3-2.8-2.3h-3.2v4.5z"/></svg>`,
    generic: `<svg viewBox="0 0 48 48" class="app-icon-svg"><rect width="40" height="40" x="4" y="4" rx="10" fill="#4A4E5A"/><polygon points="24,12 27.5,19.5 35.5,20.5 29.5,26 31,34 24,30 17,34 18.5,26 12.5,20.5 20.5,19.5" fill="#FFFFFF"/></svg>`
  };

  const CLASSIC_ICONS = { ...OFFICIAL_ICONS };

  // PNG Logo Assets Provided by User in Project Folder
  const PNG_ICONS = {
    docs: 'Google Docs.png',
    playconsole: 'Google Play Console.png',
    gmail: 'Gmail.png',
    analytics: 'Google Analytics.png',
    canvas: 'Canvas.png',
    sentral: 'Sentral.png',
    canva: 'Canva.png',
    mildang: 'Mildang PT.png',
    meet: 'Google Meet.png',
    chat: 'Google Chat.png',
    photos: 'Google Photos.png',
    drive: 'Google Drive.png',
    forms: 'Google Forms.png',
    keep: 'Google Keep.png',
    maps: 'Google Maps.png',
    googleone: 'Google One.png',
    ads: 'Google Ads.png',
    slides: 'Google Slides.png',
    spreadsheets: 'Google Spreadsheets.png',
    gemini: 'Gemini.png',
    gemini_app: 'Gemini.png',
    google: 'Google.png',
    youtube: 'Youtube.png',
    ytmusic: 'Yt Music.png',
    word: 'Words.png',
    excel: 'Excel.png',
    powerpoint: 'PowerPoint.png',
    onenote: 'OneNote.png',
    smartaviation: 'Smart Aviation.png',
    hl8006: 'HL8006 Logo.png'
  };

  let iconTheme = localStorage.getItem('android_tablet_icon_theme_v2') || 'official';

  function getIconSvg(iconKey, customIcon, altText) {
    if (customIcon) return customIcon;
    // Prefer user-provided authentic PNG assets
    if (PNG_ICONS[iconKey]) {
      return `<img src="${encodeURI(PNG_ICONS[iconKey])}" alt="${escapeHtml(altText || iconKey)}" class="nova-app-img" draggable="false">`;
    }
    if (iconTheme === 'official') {
      return OFFICIAL_ICONS[iconKey] || OFFICIAL_ICONS.generic || MINIMAL_ICONS[iconKey] || MINIMAL_ICONS.generic;
    }
    return MINIMAL_ICONS[iconKey] || MINIMAL_ICONS.generic;
  }

  // =========================================================================
  // Master App Database (Includes User-Specified Homescreen Apps & Tablet Roster)
  // =========================================================================
  const DEFAULT_HOMESCREEN_APPS = [
    'docs',
    'playconsole',
    'gmail',
    'analytics',
    'canvas',
    'sentral',
    'canva',
    'mildang'
  ];

  const APP_DATABASE = [
    // 8 Homescreen Applications (Middle 2x4 Grid)
    { id: 'docs', name: 'Google Docs', url: 'https://docs.google.com', iconKey: 'docs', category: 'google', bg: '#ffffff', fg: '#2684fc', isDefault: true },
    { id: 'playconsole', name: 'Google Play Console', url: 'https://play.google.com/console/u/0/developers/8498331805521071513/app-list', iconKey: 'playconsole', category: 'google', bg: '#ffffff', fg: '#02569b', isDefault: true },
    { id: 'gmail', name: 'Gmail', url: 'https://mail.google.com/mail/u/0/', iconKey: 'gmail', category: 'google', bg: '#ffffff', fg: '#ea4335', isDefault: true },
    { id: 'analytics', name: 'Google Analytics', url: 'https://analytics.google.com/analytics/web/#/a399885729p548079740/reports/intelligenthome', iconKey: 'analytics', category: 'google', bg: '#ffffff', fg: '#f9ab00', isDefault: true },
    { id: 'canvas', name: 'Canvas', url: 'https://merewetherhs.instructure.com/', iconKey: 'canvas', category: 'school', bg: '#ffffff', fg: '#e62429', isDefault: true },
    { id: 'sentral', name: 'Sentral', url: 'https://merewether-h.sentral.com.au/s-n2v7Be/portal/#!/student/3493', iconKey: 'sentral', category: 'school', bg: '#ffffff', fg: '#002e5d', isDefault: true },
    { id: 'canva', name: 'Canva', url: 'https://www.canva.com/', iconKey: 'canva', category: 'tools', bg: '#ffffff', fg: '#7d2ae8', isDefault: true },
    { id: 'mildang', name: 'Mildang PT', url: 'https://study.mildang.kr/today-mission', iconKey: 'mildang', category: 'school', bg: '#ffffff', fg: '#7952f5', isDefault: true },

    // Google Suite & Productivity (Authentic User-Provided PNG Logos)
    { id: 'meet', name: 'Google Meet', url: 'https://meet.google.com', iconKey: 'meet', category: 'google', bg: '#ffffff', fg: '#00ac47', isDefault: false },
    { id: 'chat', name: 'Google Chat', url: 'https://chat.google.com', iconKey: 'chat', category: 'google', bg: '#ffffff', fg: '#00832d', isDefault: false },
    { id: 'photos', name: 'Google Photos', url: 'https://photos.google.com', iconKey: 'photos', category: 'google', bg: '#ffffff', fg: '#ea4335', isDefault: false },
    { id: 'drive', name: 'Drive', url: 'https://drive.google.com', iconKey: 'drive', category: 'google', bg: '#ffffff', fg: '#34a853', isDefault: false },
    { id: 'forms', name: 'Google Forms', url: 'https://docs.google.com/forms', iconKey: 'forms', category: 'google', bg: '#ffffff', fg: '#7248b9', isDefault: false },
    { id: 'keep', name: 'Keep', url: 'https://keep.google.com', iconKey: 'keep', category: 'google', bg: '#ffffff', fg: '#fbbc04', isDefault: false },
    { id: 'slides', name: 'Slides', url: 'https://slides.google.com', iconKey: 'slides', category: 'google', bg: '#ffffff', fg: '#f29900', isDefault: false },
    { id: 'spreadsheets', name: 'Sheets', url: 'https://sheets.google.com', iconKey: 'spreadsheets', category: 'google', bg: '#ffffff', fg: '#0f9d58', isDefault: false },
    { id: 'maps', name: 'Maps', url: 'https://maps.google.com', iconKey: 'maps', category: 'google', bg: '#ffffff', fg: '#34a853', isDefault: false },
    { id: 'googleone', name: 'Google One', url: 'https://one.google.com', iconKey: 'googleone', category: 'google', bg: '#ffffff', fg: '#4285f4', isDefault: false },
    { id: 'ads', name: 'Google Ads', url: 'https://ads.google.com', iconKey: 'ads', category: 'google', bg: '#ffffff', fg: '#4285f4', isDefault: false },
    { id: 'gemini_app', name: 'Gemini', url: 'https://gemini.google.com', iconKey: 'gemini', category: 'google', bg: '#ffffff', fg: '#1a1a1a', isDefault: false },
    { id: 'google', name: 'Google', url: 'https://www.google.com', iconKey: 'google', category: 'google', bg: '#ffffff', fg: '#4285f4', isDefault: false },

    // Entertainment, Media & Social (Authentic PNG Assets + Preserved Discord)
    { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com', iconKey: 'youtube', category: 'media', bg: '#ffffff', fg: '#ff0000', isDefault: false },
    { id: 'ytmusic', name: 'YT Music', url: 'https://music.youtube.com', iconKey: 'ytmusic', category: 'media', bg: '#ffffff', fg: '#ff0000', isDefault: false },
    { id: 'discord', name: 'Discord', url: 'https://discord.com/app', iconKey: 'discord', category: 'media', bg: '#5865f2', fg: '#ffffff', isDefault: false },

    // Microsoft 365 (Authentic User-Provided PNG Logos)
    { id: 'word', name: 'Word', url: 'https://word.office.com', iconKey: 'word', category: 'microsoft', bg: '#ffffff', fg: '#185abd', isDefault: false },
    { id: 'excel', name: 'Excel', url: 'https://excel.office.com', iconKey: 'excel', category: 'microsoft', bg: '#ffffff', fg: '#107c41', isDefault: false },
    { id: 'powerpoint', name: 'PowerPoint', url: 'https://powerpoint.office.com', iconKey: 'powerpoint', category: 'microsoft', bg: '#ffffff', fg: '#c43e1c', isDefault: false },
    { id: 'onenote', name: 'OneNote', url: 'https://onenote.office.com', iconKey: 'onenote', category: 'microsoft', bg: '#ffffff', fg: '#7719aa', isDefault: false },

    // Tools & Organizations (Authentic User-Provided PNG Logo)
    { id: 'smartaviation', name: 'Smart', url: 'https://smartaviation.net', iconKey: 'smartaviation', category: 'tools', bg: '#ffffff', fg: '#0066cc', isDefault: false }
  ];

  // Storage Keys
  const STORAGE_KEY_HOMESCREEN = 'android_tablet_nova_homescreen_v4';
  const STORAGE_KEY_CUSTOM_APPS = 'android_tablet_custom_apps_v2';
  const STORAGE_KEY_ICON_THEME = 'android_tablet_icon_theme_v2';
  const STORAGE_KEY_GLOW_PRESET = 'android_tablet_glow_preset';
  const STORAGE_KEY_GLOW_INTENSITY = 'android_tablet_glow_intensity';
  const STORAGE_KEY_ANIM_PRESET = 'android_tablet_anim_preset';
  const STORAGE_KEY_DEFOCUS_PRESET = 'android_tablet_defocus_preset';
  const STORAGE_KEY_WALLPAPER_PRESET = 'android_tablet_wallpaper_preset';

  // State
  let homescreenAppIds = [];
  let customApps = [];
  let isEditMode = false;
  let glowPreset = 'rainbow';
  let glowIntensity = 'vibrant';
  let animPreset = 'fluid';
  let defocusPreset = 'deep';
  let wallpaperPreset = 'oled';

  // DOM Elements
  const glowbar = document.getElementById('topGlowbar');
  const clockEl = document.getElementById('tabletClock');
  const searchInput = document.getElementById('searchInput');
  const searchForm = document.getElementById('searchForm');
  const novaSearchWrap = document.getElementById('novaSearchWrap');
  const searchExpandShell = document.getElementById('searchExpandShell');
  const searchClearBtn = document.getElementById('searchClearBtn');
  const searchSuggestionsDropdown = document.getElementById('searchSuggestionsDropdown');

  const feedToggleBtn = document.getElementById('feedToggleBtn');
  const feedDrawer = document.getElementById('feedDrawer');
  const appsGrid = document.getElementById('appsGrid');
  const appDockBtn = document.getElementById('appDockBtn');
  const addAppsBtn = document.getElementById('appDockBtn'); // Alias
  const geminiBtn = document.getElementById('geminiBtn');

  // Nova Launcher Layout Elements
  const novaDayPill = document.getElementById('novaDayPill');
  const novaDateLine = document.getElementById('novaDateLine');
  const novaOutlineClock = document.getElementById('novaOutlineClock');
  const novaDockSettingsBtn = document.getElementById('novaDockSettingsBtn');
  const novaViewport = document.querySelector('.nova-viewport');

  // Settings Modal Elements (Essentials Edition)
  const settingsModal = document.getElementById('settingsModal');
  const openSettingsBtn = document.getElementById('openSettingsBtn');
  const settingsCloseBtn = document.getElementById('settingsCloseBtn');

  // Samsung One UI Tablet Drawer Elements
  const oneUiDrawerWindow = document.getElementById('oneUiDrawerWindow');
  const oneUiBackdrop = document.getElementById('oneUiBackdrop');
  const oneUiGrid = document.getElementById('oneUiGrid');
  const oneUiSearchInput = document.getElementById('oneUiSearchInput');
  const drawerModal = document.getElementById('oneUiDrawerWindow'); // Alias
  const drawerSearchInput = document.getElementById('oneUiSearchInput'); // Alias
  const libraryGrid = document.getElementById('oneUiGrid'); // Alias
  const categoryChips = document.querySelectorAll('.category-chip');
  const openCustomModalBtn = document.getElementById('openCustomModalBtn');
  const addAllAppsBtn = document.getElementById('addAllAppsBtn');

  // Custom App Modal Elements
  const customAppModal = document.getElementById('customAppModal');
  const customModalCloseBtn = document.getElementById('customModalCloseBtn');
  const customAppForm = document.getElementById('customAppForm');
  const customNameInput = document.getElementById('customNameInput');
  const customUrlInput = document.getElementById('customUrlInput');
  const customCancelBtn = document.getElementById('customCancelBtn');

  // =========================================================================
  // Glow Bar Removed as requested (no-op stub for safety)
  // =========================================================================
  function triggerGlow() {}

  // =========================================================================
  // Live Google Search Autocomplete & Forward-Expanding Search Bar Engine
  // =========================================================================
  let suggestScript = null;
  let currentSuggestQuery = '';
  let suggestDebounceTimer = null;
  let activeSuggestionIndex = -1;
  let currentSuggestions = [];

  function updateSearchCenterOffsets() {
    if (!novaSearchWrap) return;

    const isExpanded = document.body.classList.contains('search-expanded') || 
                       novaSearchWrap.classList.contains('search-expanded');

    let deltaX = 0;
    let deltaY = 0;

    if (!isExpanded) {
      const rect = novaSearchWrap.getBoundingClientRect();
      const wrapCenterX = rect.left + rect.width / 2;
      const wrapCenterY = rect.top + rect.height / 2;

      // Target position when expanded: horizontal center of viewport (window.innerWidth / 2)
      // and vertical spotlight center (window.innerHeight * 0.44) so search bar + dropdown are balanced
      const targetCenterX = window.innerWidth / 2;
      const targetCenterY = Math.round(window.innerHeight * 0.44);

      deltaX = targetCenterX - wrapCenterX;
      deltaY = targetCenterY - wrapCenterY;

      novaSearchWrap.dataset.centerX = String(Math.round(deltaX));
      novaSearchWrap.dataset.centerY = String(Math.round(deltaY));
    } else {
      deltaX = parseFloat(novaSearchWrap.dataset.centerX) || 0;
      deltaY = parseFloat(novaSearchWrap.dataset.centerY) || 0;
    }

    document.documentElement.style.setProperty('--search-center-x', `${Math.round(deltaX)}px`);
    document.documentElement.style.setProperty('--search-center-y', `${Math.round(deltaY)}px`);
  }

  function expandSearchBar() {
    updateSearchCenterOffsets();
    if (novaSearchWrap) {
      novaSearchWrap.classList.add('search-expanded');
    }
    document.body.classList.add('search-expanded');
    updateClearButton();
  }

  function collapseSearchBar() {
    if (novaSearchWrap) {
      novaSearchWrap.classList.remove('search-expanded');
    }
    document.body.classList.remove('search-expanded');
    closeSuggestions();
    updateClearButton();
    updateSearchCenterOffsets();
  }

  function updateClearButton() {
    if (!searchClearBtn) return;
    const hasText = searchInput && searchInput.value.trim().length > 0;
    searchClearBtn.classList.toggle('visible', hasText);
  }

  function closeSuggestions() {
    if (searchSuggestionsDropdown) {
      searchSuggestionsDropdown.classList.remove('open');
      searchSuggestionsDropdown.innerHTML = '';
    }
    activeSuggestionIndex = -1;
    currentSuggestions = [];
  }

  const suggestCache = new Map();
  let currentSuggestRequestId = 0;

  function renderLoadingSkeleton(count = 5) {
    if (!searchSuggestionsDropdown) return;
    searchSuggestionsDropdown.innerHTML = '';
    activeSuggestionIndex = -1;
    currentSuggestions = [];

    const widths = ['74%', '54%', '82%', '60%', '68%'];
    for (let i = 0; i < count; i++) {
      const item = document.createElement('div');
      item.className = 'suggestion-item suggestion-skeleton-item';
      item.setAttribute('aria-hidden', 'true');
      const w = widths[i % widths.length];

      item.innerHTML = `
        <div class="suggestion-item-main">
          <span class="suggestion-icon skeleton-icon-pulse">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="7"/>
              <line x1="21" y1="21" x2="16.5" y2="16.5"/>
            </svg>
          </span>
          <div class="suggestion-skeleton-pill" style="width: ${w};"></div>
        </div>
      `;
      searchSuggestionsDropdown.appendChild(item);
    }
    searchSuggestionsDropdown.classList.add('open');
  }

  window.__googleSuggestCallback = function(data) {
    if (!data || !Array.isArray(data[1])) return;
    const query = data[0];
    if (searchInput && query.toLowerCase() !== searchInput.value.trim().toLowerCase()) {
      return;
    }
    const suggestions = data[1].slice(0, 6);
    if (suggestCache.size > 120) {
      const firstKey = suggestCache.keys().next().value;
      suggestCache.delete(firstKey);
    }
    suggestCache.set(query.toLowerCase(), suggestions);
    renderSuggestions(suggestions, query);
  };

  function fetchSuggestions(query) {
    clearTimeout(suggestDebounceTimer);
    const trimmed = (query || '').trim();

    if (!trimmed) {
      closeSuggestions();
      updateClearButton();
      return;
    }

    expandSearchBar();
    updateClearButton();

    const cacheKey = trimmed.toLowerCase();
    if (suggestCache.has(cacheKey)) {
      renderSuggestions(suggestCache.get(cacheKey), trimmed);
      return;
    }

    // Only load the grey skeleton lines if they are not already active in the dropdown.
    // This ensures typing subsequent letters keeps the skeleton continuous without refreshing/blinking on every keystroke.
    const isSkeletonActive = searchSuggestionsDropdown &&
      searchSuggestionsDropdown.classList.contains('open') &&
      searchSuggestionsDropdown.querySelector('.suggestion-skeleton-pill');

    if (!isSkeletonActive) {
      renderLoadingSkeleton(5);
    }

    currentSuggestRequestId++;
    const requestId = currentSuggestRequestId;

    // Snappy 35ms debounce for immediate search response
    suggestDebounceTimer = setTimeout(() => {
      if (requestId !== currentSuggestRequestId) return;
      currentSuggestQuery = trimmed;
      if (suggestScript) {
        suggestScript.remove();
        suggestScript = null;
      }
      suggestScript = document.createElement('script');
      suggestScript.src = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(trimmed)}&callback=__googleSuggestCallback`;
      suggestScript.onerror = () => {
        if (requestId === currentSuggestRequestId) {
          renderFallbackSuggestions(trimmed);
        }
      };
      document.head.appendChild(suggestScript);
    }, 35);
  }

  function renderFallbackSuggestions(query) {
    const qLower = query.toLowerCase();
    const fallbackList = [
      'weather today',
      'google maps',
      'youtube music',
      'calculator',
      'google translate',
      'reddit',
      'news'
    ].filter(item => item.includes(qLower) && item !== qLower);

    renderSuggestions(fallbackList.slice(0, 5), query);
  }

  function renderSuggestions(suggestions, query) {
    if (!searchSuggestionsDropdown) return;
    searchSuggestionsDropdown.innerHTML = '';
    activeSuggestionIndex = -1;
    currentSuggestions = suggestions || [];

    if (!suggestions || suggestions.length === 0) {
      closeSuggestions();
      return;
    }

    const qLower = (query || '').toLowerCase();

    suggestions.forEach((text, idx) => {
      const item = document.createElement('div');
      item.className = 'suggestion-item';
      item.setAttribute('role', 'option');
      item.setAttribute('data-idx', String(idx));

      // Highlight the matching query portion
      let highlightedHtml = escapeHtml(text);
      if (text.toLowerCase().startsWith(qLower)) {
        const matchPart = escapeHtml(text.slice(0, qLower.length));
        const restPart = escapeHtml(text.slice(qLower.length));
        highlightedHtml = `<strong>${matchPart}</strong>${restPart}`;
      }

      item.innerHTML = `
        <div class="suggestion-item-main">
          <span class="suggestion-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="7"/>
              <line x1="21" y1="21" x2="16.5" y2="16.5"/>
            </svg>
          </span>
          <span class="suggestion-text">${highlightedHtml}</span>
        </div>
        <button type="button" class="suggestion-append-btn" title="Fill into search bar" aria-label="Fill search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="7" y1="17" x2="17" y2="7"/>
            <polyline points="7 7 17 7 17 17"/>
          </svg>
        </button>
      `;

      item.addEventListener('click', (e) => {
        if (e.target.closest('.suggestion-append-btn')) {
          e.preventDefault();
          e.stopPropagation();
          if (searchInput) {
            searchInput.value = text;
            searchInput.focus();
            fetchSuggestions(text);
          }
          return;
        }

        executeSearch(text);
      });

      searchSuggestionsDropdown.appendChild(item);
    });

    searchSuggestionsDropdown.classList.add('open');
  }

  function executeSearch(query) {
    const q = (query || '').trim();
    if (!q) return;

    // No animation: navigate straight to the results in this tab
    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
  }

  function updateSuggestionSelection() {
    if (!searchSuggestionsDropdown) return;
    const items = searchSuggestionsDropdown.querySelectorAll('.suggestion-item');
    items.forEach((item, idx) => {
      item.classList.toggle('selected', idx === activeSuggestionIndex);
    });
  }

  // Google Search Submission (Loads directly inside Startup Screen)
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = (searchInput ? searchInput.value : '').trim();
      if (!query) return;
      executeSearch(query);
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const val = searchInput.value;
      if (!val.trim()) {
        closeSuggestions();
        updateClearButton();
      } else {
        fetchSuggestions(val);
      }
    });

    searchInput.addEventListener('focus', () => {
      if (searchInput.value.trim().length > 0) {
        expandSearchBar();
        fetchSuggestions(searchInput.value);
      }
    });

    searchInput.addEventListener('blur', () => {
      if (!searchInput.value.trim()) {
        collapseSearchBar();
      }
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        if (searchSuggestionsDropdown && searchSuggestionsDropdown.classList.contains('open') && currentSuggestions.length > 0) {
          e.preventDefault();
          activeSuggestionIndex = (activeSuggestionIndex + 1) % currentSuggestions.length;
          updateSuggestionSelection();
          searchInput.value = currentSuggestions[activeSuggestionIndex];
        }
      } else if (e.key === 'ArrowUp') {
        if (searchSuggestionsDropdown && searchSuggestionsDropdown.classList.contains('open') && currentSuggestions.length > 0) {
          e.preventDefault();
          activeSuggestionIndex = (activeSuggestionIndex - 1 + currentSuggestions.length) % currentSuggestions.length;
          updateSuggestionSelection();
          searchInput.value = currentSuggestions[activeSuggestionIndex];
        }
      } else if (e.key === 'Escape') {
        collapseSearchBar();
        searchInput.blur();
      }
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      collapseSearchBar();
    });
  }

  // Dismiss search expansion when clicking outside search area
  document.addEventListener('pointerdown', (e) => {
    if (novaSearchWrap && !novaSearchWrap.contains(e.target)) {
      collapseSearchBar();
    }
  });

  // =========================================================================
  // Live Date & Time Engine - Smooth Rolling Timepiece (Hour, Minute, Second)
  // =========================================================================
  const flipH1 = document.getElementById('flip-h1');
  const flipH2 = document.getElementById('flip-h2');
  const flipM1 = document.getElementById('flip-m1');
  const flipM2 = document.getElementById('flip-m2');
  const flipS1 = document.getElementById('flip-s1');
  const flipS2 = document.getElementById('flip-s2');
  const clockPeriodBadge = document.getElementById('clockPeriodBadge');

  let is24HourFormat = localStorage.getItem('android_tablet_clock_24h') === 'true';

  function updateFlipper(flipperEl, targetChar) {
    if (!flipperEl) return;
    const currentVal = flipperEl.getAttribute('data-val');
    if (currentVal === targetChar) return;

    const currSpan = flipperEl.querySelector('.d-curr');
    const nextSpan = flipperEl.querySelector('.d-next');
    if (!currSpan || !nextSpan) return;

    if (!currentVal) {
      // First boot: set immediately without animation
      currSpan.textContent = targetChar;
      nextSpan.textContent = targetChar;
      flipperEl.setAttribute('data-val', targetChar);
      return;
    }

    // Clean up any ongoing flip
    if (flipperEl.classList.contains('flipping')) {
      currSpan.textContent = flipperEl.getAttribute('data-val');
      flipperEl.classList.remove('flipping');
      void flipperEl.offsetWidth; // Force CSS reflow
    }

    nextSpan.textContent = targetChar;
    flipperEl.setAttribute('data-val', targetChar);

    requestAnimationFrame(() => {
      flipperEl.classList.add('flipping');
      setTimeout(() => {
        currSpan.textContent = targetChar;
        flipperEl.classList.remove('flipping');
      }, 430);
    });
  }

  function updateClock() {
    if (document.hidden) return;
    const now = new Date();
    
    // Status bar clock (fallback)
    const hours24 = now.getHours();
    const minutesVal = now.getMinutes();
    const secondsVal = now.getSeconds();
    const ampm = hours24 >= 12 ? 'PM' : 'AM';
    const displayHours = is24HourFormat ? hours24 : (hours24 % 12 || 12);
    const minutes = String(minutesVal).padStart(2, '0');
    const seconds = String(secondsVal).padStart(2, '0');
    const hrsStr = String(displayHours).padStart(2, '0');

    if (clockEl) {
      clockEl.textContent = `${displayHours}:${minutes} ${ampm}`;
    }

    // Nova Day Pill Badge (e.g. MONDAY)
    if (novaDayPill) {
      const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      novaDayPill.textContent = dayNames[now.getDay()];
    }

    // Nova Dotted Date Line (e.g. 09 · 10 · 2026)
    if (novaDateLine) {
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yyyy = now.getFullYear();
      novaDateLine.textContent = `${dd} · ${mm} · ${yyyy}`;
    }

    // Smooth Rolling Digital Clock with Hours, Minutes, and Seconds
    updateFlipper(flipH1, hrsStr[0]);
    updateFlipper(flipH2, hrsStr[1]);
    updateFlipper(flipM1, minutes[0]);
    updateFlipper(flipM2, minutes[1]);
    // Seconds only displayed and updated when directly in clock mode
    if (document.body.classList.contains('clock-expanded') && !document.body.classList.contains('standby-mode')) {
      updateFlipper(flipS1, seconds[0]);
      updateFlipper(flipS2, seconds[1]);
    }
  }

  // Clock Color Themes (Warm Nuances: White, Golden Yellow & Sunrise Orange)
  const CLOCK_COLOR_THEMES = [
    'clock-theme-warm-sunrise',
    'clock-theme-amber-daylight',
    'clock-theme-golden-honey',
    'clock-theme-solar-glow'
  ];

  let clockThemeIdx = parseInt(localStorage.getItem('android_tablet_clock_theme_idx') || '0', 10);
  if (isNaN(clockThemeIdx) || clockThemeIdx < 0 || clockThemeIdx >= CLOCK_COLOR_THEMES.length) {
    clockThemeIdx = 0;
  }

  function applyClockColorTheme(index) {
    if (!novaOutlineClock) return;
    CLOCK_COLOR_THEMES.forEach((cls) => novaOutlineClock.classList.remove(cls));
    novaOutlineClock.classList.add(CLOCK_COLOR_THEMES[index]);
    localStorage.setItem('android_tablet_clock_theme_idx', String(index));
  }

  // Initialize saved clock color theme immediately
  applyClockColorTheme(clockThemeIdx);

  // Compute exact horizontal and vertical center offsets for fullscreen and standby clock
  function updateClockCenterOffsets() {
    if (!novaOutlineClock) return;

    const isExpanded = document.body.classList.contains('clock-expanded') || 
                       document.body.classList.contains('standby-mode');

    let deltaX = 0;
    let deltaY = 0;

    if (!isExpanded) {
      const rect = novaOutlineClock.getBoundingClientRect();
      const clockCenterX = rect.left + rect.width / 2;
      const clockCenterY = rect.top + rect.height / 2;
      deltaX = (window.innerWidth / 2) - clockCenterX;
      deltaY = (window.innerHeight / 2) - clockCenterY;
      novaOutlineClock.dataset.centerX = String(Math.round(deltaX));
      novaOutlineClock.dataset.centerY = String(Math.round(deltaY));
    } else {
      deltaX = parseFloat(novaOutlineClock.dataset.centerX) || 0;
      deltaY = parseFloat(novaOutlineClock.dataset.centerY) || ((window.innerHeight / 2) - 263);
    }

    document.documentElement.style.setProperty('--clock-center-x', `${Math.round(deltaX)}px`);
    document.documentElement.style.setProperty('--clock-center-y', `${Math.round(deltaY)}px`);
  }

  window.addEventListener('resize', () => {
    updateClockCenterOffsets();
    updateSearchCenterOffsets();
  }, { passive: true });

  const clockExitExpandBtn = document.getElementById('clockExitExpandBtn');

  function isFullscreenActive() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  }

  function syncFullscreenClass() {
    const isFs = isFullscreenActive();
    document.body.classList.toggle('is-fullscreen', isFs);
  }

  ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach((evt) => {
    document.addEventListener(evt, syncFullscreenClass);
  });

  function requestFullscreenIfPossible() {
    try {
      if (!isFullscreenActive()) {
        const root = document.documentElement;
        if (root.requestFullscreen) {
          const promise = root.requestFullscreen();
          if (promise && promise.catch) {
            promise.catch(() => {});
          }
        } else if (root.webkitRequestFullscreen) {
          root.webkitRequestFullscreen();
        } else if (root.msRequestFullscreen) {
          root.msRequestFullscreen();
        }
      }
    } catch (e) {}
  }

  function exitFullscreenIfRequested() {
    try {
      if (isFullscreenActive()) {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    } catch (e) {}
  }

  function exitExpandedClock() {
    exitFullscreenIfRequested();
    enteredStandbyFromIdle = false;
    if (document.body.classList.contains('clock-expanded')) {
      document.body.classList.remove('clock-expanded');
      updateClockCenterOffsets();
    }
  }

  function enterExpandedClock() {
    requestFullscreenIfPossible();
    enteredStandbyFromIdle = false;
    if (window.scrollY !== 0) {
      window.scrollTo(0, 0);
    }
    document.body.classList.add('clock-expanded');
    updateClock();
    updateClockCenterOffsets();
  }

  if (clockExitExpandBtn) {
    clockExitExpandBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      exitExpandedClock();
    });
  }

  if (novaOutlineClock) {
    novaOutlineClock.addEventListener('click', (e) => {
      // If in standby mode, click immediately forces F11 fullscreen!
      if (document.body.classList.contains('standby-mode')) {
        requestFullscreenIfPossible();
        return;
      }

      // If not yet in expanded clock mode, smoothly expand into fullscreen minimalistic view
      if (!document.body.classList.contains('clock-expanded')) {
        enterExpandedClock();
        return;
      }

      // If already expanded, cycle to next duo-color theme smoothly and gradually
      clockThemeIdx = (clockThemeIdx + 1) % CLOCK_COLOR_THEMES.length;
      applyClockColorTheme(clockThemeIdx);

      triggerGlow(1400, true);
    });
  }

  // Clicking on background outside clock while in expanded mode exits expanded mode
  document.addEventListener('click', (e) => {
    if (document.body.classList.contains('standby-mode')) {
      // Direct click gesture during standby mode activates browser F11 fullscreen
      requestFullscreenIfPossible();
      return;
    }
    if (document.body.classList.contains('clock-expanded')) {
      if (!e.target.closest('#novaOutlineClock') && !e.target.closest('#clockExitExpandBtn')) {
        exitExpandedClock();
      }
    }
  });

  // F11 and Escape key enhancements
  window.addEventListener('keydown', (e) => {
    if (e.key === 'F11') {
      if (!isFullscreenActive()) {
        requestFullscreenIfPossible();
      }
    } else if (e.key === 'Escape') {
      if (document.body.classList.contains('standby-mode')) {
        exitStandbyMode();
      } else if (document.body.classList.contains('clock-expanded')) {
        exitExpandedClock();
      }
    }
  });

  // Live Slow Smooth Color Cycling Every 15 Seconds
  const COLOR_CYCLE_INTERVAL = 15000;
  setInterval(() => {
    if (document.hidden) return;
    if (document.body.classList.contains('standby-mode')) return;

    clockThemeIdx = (clockThemeIdx + 1) % CLOCK_COLOR_THEMES.length;
    applyClockColorTheme(clockThemeIdx);
  }, COLOR_CYCLE_INTERVAL);

  // =========================================================================
  // Standby Mode Engine (8s Inactivity Detection with Fullscreen Support)
  // Seamlessly transitions into pure ambient clock standby from any screen
  // Wakes on deliberate user interaction
  // Only arms / triggers when the tab is actively visible on screen
  // =========================================================================
  let standbyTimer = null;
  let enteredStandbyFromIdle = false;
  const STANDBY_IDLE_DELAY = 8000; // 8 seconds as requested

  function isScreenActiveAndVisible() {
    if (document.hidden) return false;
    return true;
  }

  function enterStandbyMode() {
    // Only enter standby mode if the user is actively viewing this tab / on screen!
    if (!isScreenActiveAndVisible()) {
      return;
    }

    // Attempt browser fullscreen (F11) on standby mode entry
    requestFullscreenIfPossible();
    syncFullscreenClass();

    // If not already in manually expanded clock mode, record that we entered from idle
    if (!document.body.classList.contains('clock-expanded')) {
      enteredStandbyFromIdle = true;
    }

    // Dismiss any open app drawers, modals, or settings windows so only the clock takes over
    if (oneUiDrawerWindow && oneUiDrawerWindow.classList.contains('open')) {
      closeOneUiDrawer();
    }
    if (settingsModal && settingsModal.classList.contains('open')) {
      closeSettings();
    }
    if (customAppModal && customAppModal.classList.contains('open')) {
      closeCustomModal();
    }
    if (feedDrawer && feedDrawer.classList.contains('open')) {
      feedDrawer.classList.remove('open');
    }

    if (window.scrollY !== 0) {
      window.scrollTo(0, 0);
    }
    updateClockCenterOffsets();
    document.body.classList.add('standby-mode');
    if (novaOutlineClock) {
      novaOutlineClock.classList.add('standby-active');
    }
  }

  function exitStandbyMode() {
    const wasInStandby = document.body.classList.contains('standby-mode') || 
                         (novaOutlineClock && novaOutlineClock.classList.contains('standby-active'));
    if (wasInStandby) {
      // NOTE: Do not forcibly call exitFullscreen here so fullscreen is preserved if user is in F11 mode!
      document.body.classList.remove('standby-mode');
      if (novaOutlineClock) {
        novaOutlineClock.classList.remove('standby-active');
      }

      // If entered standby automatically from idle, return smoothly to homescreen
      if (enteredStandbyFromIdle) {
        if (document.body.classList.contains('clock-expanded')) {
          document.body.classList.remove('clock-expanded');
        }
        enteredStandbyFromIdle = false;
      }

      triggerGlow(1400);
    }
  }

  function resetStandbyTimer() {
    clearTimeout(standbyTimer);
    if (document.hidden) {
      return;
    }
    standbyTimer = setTimeout(() => {
      if (isScreenActiveAndVisible()) {
        enterStandbyMode();
      }
    }, STANDBY_IDLE_DELAY);
  }

  // Throttled user activity handler with drift threshold so micro-movements don't glitch standby
  let lastActivityTime = 0;
  let pointerStartX = null;
  let pointerStartY = null;

  function onUserActivity(e) {
    if (e && e.type === 'pointermove') {
      if (pointerStartX === null || pointerStartY === null) {
        pointerStartX = e.clientX;
        pointerStartY = e.clientY;
        return;
      }
      const dist = Math.hypot(e.clientX - pointerStartX, e.clientY - pointerStartY);
      if (dist < 35) {
        return; // Ignore slight table vibrations and optical sensor drifts
      }
      pointerStartX = e.clientX;
      pointerStartY = e.clientY;
    } else {
      pointerStartX = null;
      pointerStartY = null;
    }

    exitStandbyMode();
    const now = Date.now();
    if (now - lastActivityTime > 300) {
      lastActivityTime = now;
      triggerGlow(2400);
      resetStandbyTimer();
    }
  }

  ['pointerdown', 'keydown', 'wheel', 'pointermove'].forEach((evt) => {
    window.addEventListener(evt, onUserActivity, { passive: true });
  });

  resetStandbyTimer();

  // Background tab memory saver & standby prevention:
  // When tab is hidden, cancel the timer so background time NEVER triggers standby.
  // When tab is focused again, wake back to normal homescreen and restart timer fresh.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearTimeout(standbyTimer);
    } else {
      // Returned to this tab: if in standby mode from idle, immediately restore homescreen!
      if (enteredStandbyFromIdle || document.body.classList.contains('standby-mode')) {
        exitStandbyMode();
      }
      updateClock();
      updateClockCenterOffsets();
      onUserActivity();
    }
  }, { passive: true });

  window.addEventListener('focus', () => {
    if (!document.hidden) {
      if (enteredStandbyFromIdle || document.body.classList.contains('standby-mode')) {
        exitStandbyMode();
      }
      updateClock();
      updateClockCenterOffsets();
      resetStandbyTimer();
    }
  }, { passive: true });

  setInterval(updateClock, 1000);
  updateClock();

  // =========================================================================
  // Storage & State Management
  // =========================================================================
  function loadState() {
    try {
      const savedHomescreen = localStorage.getItem(STORAGE_KEY_HOMESCREEN);
      if (savedHomescreen) {
        homescreenAppIds = JSON.parse(savedHomescreen);
        const validAppIds = new Set(APP_DATABASE.map(a => a.id));
        homescreenAppIds = homescreenAppIds.filter(id => validAppIds.has(id));
        if (homescreenAppIds.length === 0) {
          homescreenAppIds = [...DEFAULT_HOMESCREEN_APPS];
        }
      } else {
        // Defaults matching the Nova Launcher 2x4 setup in reference photo
        homescreenAppIds = [...DEFAULT_HOMESCREEN_APPS];
      }

      const savedCustom = localStorage.getItem(STORAGE_KEY_CUSTOM_APPS);
      if (savedCustom) {
        customApps = JSON.parse(savedCustom);
      } else {
        customApps = [];
      }

      glowPreset = localStorage.getItem(STORAGE_KEY_GLOW_PRESET) || 'rainbow';
      glowIntensity = localStorage.getItem(STORAGE_KEY_GLOW_INTENSITY) || 'vibrant';
      animPreset = localStorage.getItem(STORAGE_KEY_ANIM_PRESET) || 'fluid';
      defocusPreset = localStorage.getItem(STORAGE_KEY_DEFOCUS_PRESET) || 'deep';
      wallpaperPreset = localStorage.getItem(STORAGE_KEY_WALLPAPER_PRESET) || 'oled';
    } catch (e) {
      console.error('Error loading homescreen config from localStorage:', e);
      homescreenAppIds = [...DEFAULT_HOMESCREEN_APPS];
      customApps = [];
      glowPreset = 'rainbow';
      glowIntensity = 'vibrant';
      animPreset = 'fluid';
      defocusPreset = 'deep';
      wallpaperPreset = 'oled';
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY_HOMESCREEN, JSON.stringify(homescreenAppIds));
      localStorage.setItem(STORAGE_KEY_CUSTOM_APPS, JSON.stringify(customApps));
    } catch (e) {
      console.error('Error saving homescreen config to localStorage:', e);
    }
  }

  function applyAppearanceSettings() {
    // 1. Motion Physics Preset
    document.body.classList.remove('anim-fluid', 'anim-snappy', 'anim-reduced');
    document.body.classList.add(`anim-${animPreset}`);

    // 2. Defocus Depth Preset
    document.body.classList.remove('defocus-deep', 'defocus-soft', 'defocus-dim');
    document.body.classList.add(`defocus-${defocusPreset}`);

    // 3. Wallpaper Preset
    document.body.classList.remove('wallpaper-oled', 'wallpaper-obsidian', 'wallpaper-carbon', 'wallpaper-cosmic', 'wallpaper-horizon');
    document.body.classList.add(`wallpaper-${wallpaperPreset}`);

    // Update active states on segmented controls & wallpaper cards
    updateSegmentedControlsUI();
  }

  function updateSegmentedControlsUI() {
    // Motion Physics Preset
    document.querySelectorAll('#animPresetControl .seg-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-anim') === animPreset);
    });

    // Background Defocus Depth
    document.querySelectorAll('#defocusControl .seg-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-defocus') === defocusPreset);
    });

    // Wallpaper Preset Cards
    document.querySelectorAll('#wallpaperControl .wallpaper-card-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-wallpaper') === wallpaperPreset);
    });
  }

  function renderLivePreview() {}
  function renderSettingsDockList() {}

  function getAllApps() {
    return [...APP_DATABASE, ...customApps];
  }

  function getAppById(id) {
    return getAllApps().find(app => app.id === id);
  }

  // =========================================================================
  // Native Fullscreen App Opening Zoom Animation (Same-Tab OS Experience)
  // =========================================================================
  let isNavigatingToApp = false;

  function launchAppWithZoom(targetEl, appInfo) {
    if (isNavigatingToApp) return;
    if (!appInfo || !appInfo.url) return;

    if (appInfo.id === 'settings_app' || appInfo.url === '#settings') {
      if (oneUiDrawerWindow && oneUiDrawerWindow.classList.contains('open')) {
        closeOneUiDrawer();
      }
      openSettings();
      return;
    }

    isNavigatingToApp = true;
    const overlay = document.getElementById('appLaunchZoomOverlay');
    const iconContainer = document.getElementById('appLaunchZoomIcon');
    const titleEl = document.getElementById('appLaunchZoomTitle');

    if (!overlay || !targetEl) {
      window.location.href = appInfo.url;
      return;
    }

    // Dismiss any open app drawers, modals, or dropdowns
    if (oneUiDrawerWindow && oneUiDrawerWindow.classList.contains('open')) {
      oneUiDrawerWindow.classList.remove('open');
      if (oneUiBackdrop) oneUiBackdrop.classList.remove('open');
      if (appDockBtn) appDockBtn.classList.remove('active');
    }

    const rect = targetEl.getBoundingClientRect();
    const iconMarkup = getIconSvg(appInfo.iconKey, appInfo.customIcon, appInfo.name);

    if (iconContainer) iconContainer.innerHTML = iconMarkup;
    if (titleEl) titleEl.textContent = appInfo.name || '';

    // Position overlay exactly over the clicked app icon at start
    overlay.style.transition = 'none';
    overlay.style.top = `${Math.round(rect.top)}px`;
    overlay.style.left = `${Math.round(rect.left)}px`;
    overlay.style.width = `${Math.round(rect.width)}px`;
    overlay.style.height = `${Math.round(rect.height)}px`;
    overlay.style.borderRadius = '22px';
    overlay.classList.remove('animating');
    overlay.classList.add('active');

    // Add viewport zoom-out background effect
    document.body.classList.add('app-opening-active');

    // Force layout reflow so starting coordinates are applied before animating
    void overlay.offsetWidth;

    // Trigger full-screen bloom animation
    requestAnimationFrame(() => {
      overlay.classList.add('animating');
    });

    // At 360ms, the expanding window covers 100% of the viewport -> navigate in same tab!
    setTimeout(() => {
      window.location.href = appInfo.url;
    }, 360);
  }

  // Clear zoom overlay if user navigates back (via browser back button)
  window.addEventListener('pageshow', () => {
    isNavigatingToApp = false;
    document.body.classList.remove('app-opening-active');
    const overlay = document.getElementById('appLaunchZoomOverlay');
    if (overlay) {
      overlay.classList.remove('active', 'animating');
      overlay.style.display = 'none';
    }
  });

  window.addEventListener('focus', () => {
    if (!document.hidden) {
      isNavigatingToApp = false;
      document.body.classList.remove('app-opening-active');
      const overlay = document.getElementById('appLaunchZoomOverlay');
      if (overlay && !overlay.classList.contains('animating')) {
        overlay.classList.remove('active');
        overlay.style.display = 'none';
      }
    }
  });

  // =========================================================================
  // Nova Launcher Homescreen Rendering (Pure White Minimalist Glyphs)
  // =========================================================================
  function renderHomescreen() {
    if (!appsGrid) return;
    appsGrid.innerHTML = '';

    const allApps = getAllApps();
    const activeApps = homescreenAppIds
      .map(id => allApps.find(app => app.id === id))
      .filter(Boolean);

    activeApps.forEach(app => {
      const card = document.createElement('a');
      card.className = 'nova-app-item';
      card.href = app.url;
      card.title = `${app.name} (${app.url})`;

      const iconMarkup = getIconSvg(app.iconKey, app.customIcon, app.name);

      card.innerHTML = `
        <div class="nova-app-glyph">${iconMarkup}</div>
        <button type="button" class="app-remove-btn" title="Remove from homescreen" data-app-id="${app.id}">×</button>
      `;

      // Handle card click with full-screen zoom app opening animation
      card.addEventListener('click', (e) => {
        if (e.target.closest('.app-remove-btn')) {
          e.preventDefault();
          e.stopPropagation();
          removeAppFromHomescreen(app.id);
          triggerGlow(1200);
          return;
        }

        if (isEditMode) {
          e.preventDefault();
          return;
        }

        e.preventDefault();
        launchAppWithZoom(card, app);
      });

      appsGrid.appendChild(card);
    });

    if (isEditMode) {
      appsGrid.classList.add('edit-mode');
    } else {
      appsGrid.classList.remove('edit-mode');
    }
  }

  function removeAppFromHomescreen(appId) {
    homescreenAppIds = homescreenAppIds.filter(id => id !== appId);
    saveState();
    renderHomescreen();
    renderLibrary();
    renderLivePreview();
    renderSettingsDockList();
  }

  function toggleAppOnHomescreen(appId) {
    if (homescreenAppIds.includes(appId)) {
      homescreenAppIds = homescreenAppIds.filter(id => id !== appId);
    } else {
      homescreenAppIds.push(appId);
    }
    saveState();
    renderHomescreen();
    renderLibrary();
    renderLivePreview();
    renderSettingsDockList();
    triggerGlow(1500);
  }

  // =========================================================================
  // Samsung One UI Tablet Floating App Drawer (Matching Reference Photo)
  // =========================================================================
  function renderOneUiDrawer() {
    if (!oneUiGrid) return;
    oneUiGrid.innerHTML = '';

    const allApps = getAllApps();
    const query = oneUiSearchInput ? oneUiSearchInput.value.trim().toLowerCase() : '';
    const filtered = allApps.filter(app => {
      if (!query) return true;
      return app.name.toLowerCase().includes(query) ||
             (app.url && app.url.toLowerCase().includes(query));
    });

    if (filtered.length === 0) {
      oneUiGrid.innerHTML = `
        <div class="oneui-empty-state">
          No applications found for "<strong>${escapeHtml(query)}</strong>"
        </div>
      `;
      return;
    }

    filtered.forEach(app => {
      const item = document.createElement('a');
      item.className = 'oneui-app-item';
      item.href = app.url;
      item.title = `${app.name} (${app.url})`;

      const iconMarkup = getIconSvg(app.iconKey, app.customIcon, app.name);
      const bgStyle = app.bg ? `background: ${app.bg};` : 'background: #383b42;';
      const fgStyle = app.fg ? `color: ${app.fg};` : 'color: #ffffff;';

      item.innerHTML = `
        <div class="oneui-app-icon" style="${bgStyle} ${fgStyle}">
          ${iconMarkup}
        </div>
        <span class="oneui-app-title">${escapeHtml(app.name)}</span>
      `;

      item.addEventListener('click', (e) => {
        e.preventDefault();
        launchAppWithZoom(item, app);
      });

      oneUiGrid.appendChild(item);
    });
  }

  function openOneUiDrawer() {
    if (!oneUiDrawerWindow) return;
    if (oneUiSearchInput && oneUiSearchInput.value !== '') {
      oneUiSearchInput.value = '';
      renderOneUiDrawer();
    } else if (oneUiGrid && oneUiGrid.children.length === 0) {
      renderOneUiDrawer();
    }

    requestAnimationFrame(() => {
      oneUiDrawerWindow.classList.add('open');
      if (oneUiBackdrop) oneUiBackdrop.classList.add('open');
      const viewport = document.querySelector('.nova-viewport');
      if (viewport) viewport.classList.add('drawer-expanded');
      document.body.classList.add('drawer-open');
      if (appDockBtn) appDockBtn.classList.add('active');

      if (oneUiSearchInput) {
        setTimeout(() => oneUiSearchInput.focus(), 120);
      }
    });

    triggerGlow(2400);
  }

  function closeOneUiDrawer() {
    if (!oneUiDrawerWindow) return;
    oneUiDrawerWindow.classList.remove('open');
    if (oneUiBackdrop) oneUiBackdrop.classList.remove('open');
    const viewport = document.querySelector('.nova-viewport');
    if (viewport) viewport.classList.remove('drawer-expanded');
    document.body.classList.remove('drawer-open');
    if (appDockBtn) appDockBtn.classList.remove('active');
    triggerGlow(1200);
  }

  function toggleOneUiDrawer() {
    if (oneUiDrawerWindow && oneUiDrawerWindow.classList.contains('open')) {
      closeOneUiDrawer();
    } else {
      openOneUiDrawer();
    }
  }

  // Compatibility aliases
  const openDrawer = openOneUiDrawer;
  const closeDrawer = closeOneUiDrawer;
  const renderLibrary = renderOneUiDrawer;

  // =========================================================================
  // Custom App Creator Form
  // =========================================================================
  function openCustomModal() {
    if (!customAppModal) return;
    customAppModal.classList.add('open');
    if (customNameInput) customNameInput.focus();
    triggerGlow(1500);
  }

  function closeCustomModal() {
    if (!customAppModal) return;
    customAppModal.classList.remove('open');
    if (customAppForm) customAppForm.reset();
    triggerGlow(800);
  }

  function handleCreateCustomApp(e) {
    e.preventDefault();
    const name = customNameInput.value.trim();
    let url = customUrlInput.value.trim();

    if (!name || !url) return;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const newApp = {
      id: 'custom_' + Date.now(),
      name: name,
      url: url,
      iconKey: 'generic',
      category: 'custom',
      isDefault: false
    };

    customApps.push(newApp);
    homescreenAppIds.push(newApp.id);
    saveState();
    renderHomescreen();
    renderLibrary();
    renderLivePreview();
    renderSettingsDockList();
    closeCustomModal();
    triggerGlow(2500, true);
  }

  // =========================================================================
  // Settings Window Controls
  // =========================================================================
  function openSettings() {
    if (!settingsModal) return;
    document.body.classList.add('settings-open');
    settingsModal.classList.add('open');
    updateSegmentedControlsUI();
    triggerGlow(2000);
  }

  function closeSettings() {
    if (!settingsModal) return;
    document.body.classList.remove('settings-open');
    settingsModal.classList.remove('open');
    triggerGlow(800);
  }


  // 3. System Motion Physics segmented control
  document.querySelectorAll('#animPresetControl .seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      animPreset = btn.getAttribute('data-anim') || 'fluid';
      localStorage.setItem(STORAGE_KEY_ANIM_PRESET, animPreset);
      applyAppearanceSettings();
      triggerGlow(1200);
    });
  });

  // 4. Background Defocus Depth segmented control
  document.querySelectorAll('#defocusControl .seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      defocusPreset = btn.getAttribute('data-defocus') || 'deep';
      localStorage.setItem(STORAGE_KEY_DEFOCUS_PRESET, defocusPreset);
      applyAppearanceSettings();
      triggerGlow(1200);
    });
  });

  // 5. Seamless Background Wallpaper cards
  document.querySelectorAll('#wallpaperControl .wallpaper-card-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      wallpaperPreset = btn.getAttribute('data-wallpaper') || 'oled';
      localStorage.setItem(STORAGE_KEY_WALLPAPER_PRESET, wallpaperPreset);
      applyAppearanceSettings();
      triggerGlow(1600);
    });
  });

  // 6. Reset Visuals to Default button
  const settingsResetVisualsBtn = document.getElementById('settingsResetVisualsBtn');
  if (settingsResetVisualsBtn) {
    settingsResetVisualsBtn.addEventListener('click', () => {
      glowPreset = 'rainbow';
      glowIntensity = 'vibrant';
      animPreset = 'fluid';
      defocusPreset = 'deep';
      wallpaperPreset = 'oled';

      localStorage.setItem(STORAGE_KEY_GLOW_PRESET, glowPreset);
      localStorage.setItem(STORAGE_KEY_GLOW_INTENSITY, glowIntensity);
      localStorage.setItem(STORAGE_KEY_ANIM_PRESET, animPreset);
      localStorage.setItem(STORAGE_KEY_DEFOCUS_PRESET, defocusPreset);
      localStorage.setItem(STORAGE_KEY_WALLPAPER_PRESET, wallpaperPreset);

      applyAppearanceSettings();
      triggerGlow(2400, true);
    });
  }

  // =========================================================================
  // Event Listeners Wiring
  // =========================================================================

  // Gemini Quick Launch button (opens in current tab with full-screen zoom animation)
  if (geminiBtn) {
    geminiBtn.addEventListener('click', (e) => {
      const href = geminiBtn.getAttribute('href') || 'https://gemini.google.com';
      e.preventDefault();
      launchAppWithZoom(geminiBtn, { name: 'Google Gemini', url: href, iconKey: 'gemini' });
    });
  }

  // Bottom dock bar interactive animations & full-screen zoom launches
  document.querySelectorAll('.nova-bottom-dock .nova-dock-icon-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (btn.id === 'novaDockSettingsBtn' || btn.id === 'appDockBtn') return;
      const href = btn.getAttribute('href');
      if (href && href !== '#') {
        e.preventDefault();
        const title = btn.getAttribute('title') || '';
        let iconKey = 'generic';
        if (href.includes('meet.google.com')) iconKey = 'meet';
        else if (href.includes('chat.google.com')) iconKey = 'chat';
        else if (href.includes('photos.google.com')) iconKey = 'photos';
        launchAppWithZoom(btn, { name: title.replace(/\s*\(.*\)/, '').trim(), url: href, iconKey });
      }
    });
  });

  // Bottom dock bar Settings trigger
  if (novaDockSettingsBtn) {
    novaDockSettingsBtn.addEventListener('click', () => {
      setTimeout(() => {
        openSettings();
      }, 90);
      triggerGlow(1600);
    });
  }

  // Settings Close button
  if (settingsCloseBtn) {
    settingsCloseBtn.addEventListener('click', closeSettings);
  }

  if (settingsModal) {
    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) closeSettings();
    });
  }

  // One UI App Drawer Open / Close / Toggle
  if (appDockBtn) {
    appDockBtn.addEventListener('click', (e) => {
      e.preventDefault();
      setTimeout(() => {
        toggleOneUiDrawer();
      }, 70);
    });
  }

  if (oneUiBackdrop) {
    oneUiBackdrop.addEventListener('click', closeOneUiDrawer);
  }

  if (oneUiSearchInput) {
    oneUiSearchInput.addEventListener('input', () => {
      renderOneUiDrawer();
    });
  }


  // Custom App Creator
  if (openCustomModalBtn) {
    openCustomModalBtn.addEventListener('click', openCustomModal);
  }
  if (customModalCloseBtn) {
    customModalCloseBtn.addEventListener('click', closeCustomModal);
  }
  if (customCancelBtn) {
    customCancelBtn.addEventListener('click', closeCustomModal);
  }
  if (customAppModal) {
    customAppModal.addEventListener('click', (e) => {
      if (e.target === customAppModal) closeCustomModal();
    });
  }
  if (customAppForm) {
    customAppForm.addEventListener('submit', handleCreateCustomApp);
  }

  // Quick topics feed drawer toggle
  if (feedToggleBtn && feedDrawer) {
    feedToggleBtn.addEventListener('click', () => {
      feedDrawer.classList.toggle('open');
      triggerGlow(1200);
    });
  }

  // Keyboard shortcut: Press 'Escape' to close active modals / drawer / expanded clock
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (document.body.classList.contains('clock-expanded')) {
        exitExpandedClock();
      } else if (oneUiDrawerWindow && oneUiDrawerWindow.classList.contains('open')) {
        closeOneUiDrawer();
      } else if (settingsModal && settingsModal.classList.contains('open')) {
        closeSettings();
      } else if (customAppModal && customAppModal.classList.contains('open')) {
        closeCustomModal();
      } else if (feedDrawer && feedDrawer.classList.contains('open')) {
        feedDrawer.classList.remove('open');
      }
    }
  });

  // Global auto-type into search bar (type anywhere to start searching immediately)
  window.addEventListener('keydown', (e) => {
    // If user is currently typing in an input, textarea, or contenteditable, don't intercept
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) {
      return;
    }

    // Ignore keyboard shortcuts with Ctrl / Cmd / Alt
    if (e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }

    // Don't intercept function or system navigation keys
    if (e.key === 'Escape' || e.key === 'Tab' || e.key === 'Enter' || e.key.startsWith('F')) {
      return;
    }

    // Don't intercept if settings modal or custom app modal is open
    if (settingsModal && settingsModal.classList.contains('open')) return;
    if (customAppModal && customAppModal.classList.contains('open')) return;

    // If One UI drawer is open, route typing to drawer search input instead
    if (oneUiDrawerWindow && oneUiDrawerWindow.classList.contains('open')) {
      if (oneUiSearchInput && (e.key.length === 1 || e.key === 'Backspace')) {
        oneUiSearchInput.focus();
      }
      return;
    }

    // If in clock expanded or standby mode, smoothly return to normal homescreen
    if (document.body.classList.contains('clock-expanded')) {
      exitExpandedClock();
    }
    if (document.body.classList.contains('standby-mode')) {
      exitStandbyMode();
    }

    if (searchInput && (e.key.length === 1 || e.key === 'Backspace')) {
      searchInput.focus();
      const len = searchInput.value.length;
      searchInput.setSelectionRange(len, len);
    }
  });

  // =========================================================================
  // Utilities
  // =========================================================================
  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatCategory(cat) {
    switch (cat) {
      case 'google': return 'Google Suite';
      case 'school': return 'School & Study';
      case 'microsoft': return 'Microsoft 365';
      case 'tools': return 'Productivity';
      case 'media': return 'Media & Leisure';
      case 'custom': return 'Custom';
      default: return 'App';
    }
  }

  // =========================================================================
  // Initialize (Instant 0ms Startup · Memory Optimized)
  // =========================================================================
  loadState();
  applyAppearanceSettings();
  renderHomescreen();
  updateClockCenterOffsets();
  updateSearchCenterOffsets();
  // Note: renderOneUiDrawer() is now lazy-loaded on-demand on first drawer click to minimize initial DOM footprint and RAM!

  // Auto-focus search bar on startup so typing works immediately
  if (searchInput) {
    searchInput.focus();
  }

})();

