/**
 * ThinkSaathi - Central Application Controller
 * Handles SPA navigation, local storage tracking, mood trend graphics, the Thought Clarity tool,
 * the pranayama breathing loops, and audio synthesis triggers.
 */
let chatHistory = [];
class ThinkSaathiApp {
  constructor() {
    this.currentView = 'home';
    this.moodHistory = [];
    this.clarityLogs = [];
    this.journalEntries = [];
    
    // AI Instance
    this.ai = new window.SaathiAI();
    
    // Active Reset Timer state variables
    this.activeSession = null;
    this.timerInterval = null;
    this.breathCycleInterval = null;
    this.isPlayingReset = false;
    this.timeLeftSeconds = 180; // 3 Mins default
    this.isMuted = false;
    
    // Standard daily wisdom database
    this.quotes = [
      { text: "You have the right to action, not to the fruits of action.", author: "Bhagavad Gita", reflection: "Focus on what you can control today and let go of what you cannot." },
      { text: "Peace comes from within. Do not seek it without.", author: "Gautama Buddha", reflection: "External achievements won't quiet the mind. True calm is an inside job." },
      { text: "Take up one idea. Make that one idea your life; think of it, dream of it, live on that idea.", author: "Swami Vivekananda", reflection: "Clarity comes from singular focus." },
      { text: "Cultivation of mind should be the ultimate aim of human existence.", author: "Dr. B. R. Ambedkar", reflection: "Your mind is your most valuable asset. Nurture it with patience and positive thoughts." },
      { text: "You have power over your mind - not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius", reflection: "When overwhelmed, pause and ask: 'Is this in my control?' If not, release it." },
      { text: "We suffer more often in imagination than in reality.", author: "Seneca", reflection: "Notice when your mind is writing a tragic story that hasn't actually happened." },
      { text: "The wound is the place where the Light enters you.", author: "Rumi", reflection: "Your current struggles are building the resilience you'll use tomorrow." },
      { text: "You can't cross the sea merely by standing and staring at the water.", author: "Rabindranath Tagore", reflection: "Small actions overcome large anxieties. Take one tiny step forward." },
      { text: "You may not control all the events that happen to you, but you can decide not to be reduced by them.", author: "Maya Angelou", reflection: "Your worth is not defined by difficult moments or setbacks." },
      { text: "Between stimulus and response there is a space. In that space is our power to choose our response.", author: "Viktor Frankl", reflection: "Take a deep breath before reacting. You are not your immediate emotions." }
    ];
    
    this.prompts = [
      "Look around you. What are 3 beautiful things in your direct sight that have nothing to do with school?",
      "Close your eyes. What is one noise you can hear that is calm and steady?",
      "If you could write down one mistake you made today and drop it in the trash, what would it be?",
      "What is a small, happy memory from last week that always makes you smile?"
    ];
    
    this.challenges = [
      "Stand up, stretch your arms above your head for 15 seconds, and take two slow deep breaths.",
      "Message a classmate saying 'good luck with studying' or complimenting them on something minor.",
      "Write down 3 tiny things you are grateful for today, even if it is just a good cup of tea or a warm bed.",
      "Drink a cold glass of water right now, slowly, and pay attention to how refreshing it feels."
    ];

    // Specialized Breathing Cycle configs for the 6 Resets
    this.sessionConfigs = {
      ocean_breathing: {
        title: "Ocean Breathing",
        subtitle: "Breathe with the waves",
        benefits: "Syncs your nervous system with a calm natural rhythm.",
        steps: [
          { phase: 'inhale', label: 'Inhale', duration: 4000, desc: 'Breathe in slowly as the waves rise.' },
          { phase: 'hold', label: 'Hold', duration: 1000, desc: 'Pause softly.' },
          { phase: 'exhale', label: 'Exhale', duration: 6000, desc: 'Breathe out gently as the waves settle.' },
          { phase: 'hold', label: 'Hold', duration: 1000, desc: 'Pause softly.' }
        ]
      },
      pink_sky: {
        title: "Pink Sky Breathing",
        subtitle: "Evening atmosphere",
        benefits: "Softens mental tension and prepares the mind for rest.",
        steps: [
          { phase: 'inhale', label: 'Inhale', duration: 4000, desc: 'Draw in calm energy as the sky brightens.' },
          { phase: 'hold', label: 'Hold', duration: 1000, desc: 'Pause softly.' },
          { phase: 'exhale', label: 'Exhale', duration: 6000, desc: 'Release worry as the clouds drift away.' },
          { phase: 'hold', label: 'Hold', duration: 1000, desc: 'Pause softly.' }
        ]
      },
      mountain_calm: {
        title: "Mountain Calm",
        subtitle: "Morning valley",
        benefits: "Grounds erratic thoughts and brings steady focus.",
        steps: [
          { phase: 'inhale', label: 'Inhale', duration: 4000, desc: 'Breathe in the clear mountain air.' },
          { phase: 'hold', label: 'Hold', duration: 1000, desc: 'Pause softly.' },
          { phase: 'exhale', label: 'Exhale', duration: 6000, desc: 'Breathe out and let the mist settle.' },
          { phase: 'hold', label: 'Hold', duration: 1000, desc: 'Pause softly.' }
        ]
      },
      gentle_yoga: {
        title: "Gentle Yoga",
        subtitle: "Lo-Fi Flow",
        benefits: "Releases physical tension built up from studying.",
        steps: [
          { phase: 'inhale', label: 'Breathe In', duration: 4000, desc: 'Stretch gently and find your center.' },
          { phase: 'hold', label: 'Hold', duration: 1000, desc: 'Pause softly.' },
          { phase: 'exhale', label: 'Breathe Out', duration: 6000, desc: 'Relax into the pose and let go.' },
          { phase: 'hold', label: 'Hold', duration: 1000, desc: 'Pause softly.' }
        ]
      },
      stretch_release: {
        title: "Stretch & Release",
        subtitle: "Indoor calm",
        benefits: "Relieves shoulder and neck tightness from sitting.",
        steps: [
          { phase: 'inhale', label: 'Inhale', duration: 4000, desc: 'Elongate your spine and open your chest.' },
          { phase: 'hold', label: 'Hold', duration: 1000, desc: 'Pause softly.' },
          { phase: 'exhale', label: 'Exhale', duration: 6000, desc: 'Release the tension from your muscles.' },
          { phase: 'hold', label: 'Hold', duration: 1000, desc: 'Pause softly.' }
        ]
      },
      guided_meditation: {
        title: "Guided Meditation",
        subtitle: "Deep rest",
        benefits: "Quietens a racing mind with guided focus.",
        steps: [
  { phase: 'settle', label: 'Settle', duration: 5000, desc: 'Let your body relax and allow your thoughts to slow down.' },
  { phase: 'release', label: 'Release', duration: 6000, desc: 'Let go of tension and allow your mind to become quieter.' },
  { phase: 'rest', label: 'Rest', duration: 6000, desc: 'Stay here for a moment and simply be.' }
]

      }
    };
    
    // Voice setup
    this.speechVoice = null;
    this.initSpeechVoice();
  }

  initSpeechVoice() {
    const setVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      // Try to find a calming or Indian English female voice
      this.speechVoice = voices.find(v => v.lang === 'en-IN' && v.name.includes('Female')) ||
                         voices.find(v => v.name.includes('Google UK English Female')) ||
                         voices.find(v => v.name.includes('Samantha') || v.name.includes('Victoria')) ||
                         voices[0];
    };
    setVoice();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = setVoice;
    }
  }

  speak(text) {
    if (!window.speechSynthesis || this.isMuted) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (this.speechVoice) utterance.voice = this.speechVoice;
    utterance.rate = 0.85; // Calming, slightly slower rate
    utterance.pitch = 0.95; // Slightly lower pitch for calmness
    utterance.volume = 0.8;
    window.speechSynthesis.speak(utterance);
  }

  init() {
    this.loadState();
    this.setupEventListeners();
    this.setupDailyBoosts();
    this.renderClarityLogs();
    this.renderMoodChart();
    this.renderJournalEntries();
    
    // Expose routing globally
    window.appRouter = this;
  }

  // LocalStorage data operations
  loadState() {
    try {
      const moodData = localStorage.getItem('saathi_moods');
      this.moodHistory = moodData ? JSON.parse(moodData) : [];
      
      const clarityData = localStorage.getItem('saathi_clarity');
      this.clarityLogs = clarityData ? JSON.parse(clarityData) : [];
      
      const journalData = localStorage.getItem('saathi_journal');
      this.journalEntries = journalData ? JSON.parse(journalData) : [];
    } catch (e) {
      console.warn("Could not load local state from browser storage.", e);
    }
  }

  saveMoodState() {
    try {
      localStorage.setItem('saathi_moods', JSON.stringify(this.moodHistory));
    } catch (e) {
      console.error("Failed storing mood log.", e);
    }
  }

  saveClarityState() {
    try {
      localStorage.setItem('saathi_clarity', JSON.stringify(this.clarityLogs));
    } catch (e) {
      console.error("Failed storing thought clarity logs.", e);
    }
  }

  saveJournalState() {
    try {
      localStorage.setItem('saathi_journal', JSON.stringify(this.journalEntries));
    } catch (e) {
      console.error("Failed storing journal entries.", e);
    }
  }

  // VIEW NAVIGATION ENGINE
  switchView(viewName) {
    if (this.currentView === viewName) return;
    
    // Stop active reset player if leaving Reset view
    if (this.currentView === 'reset' && this.isPlayingReset) {
      this.stopActiveResetSession();
    }

    // Deactivate previous active panels
    document.querySelectorAll('.view-panel').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    // Activate selected panels
    const targetPanel = document.getElementById(`view-${viewName}`);
    if (targetPanel) {
      targetPanel.classList.add('active');
      this.currentView = viewName;
    }

    const targetTab = document.querySelector(`.tab-btn[data-view="${viewName}"]`);
    if (targetTab) {
      targetTab.classList.add('active');
    }

    // Scroll to top of main area
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- INTERACTIVE EVENT LISTENERS BINDING ---
  setupEventListeners() {
    // 1. Bottom tab menu actions
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-view');
        this.switchView(target);
      });
    });

    // 2. Hero buttons redirections
    const heroChatBtn = document.getElementById('hero-start-chat-btn');
    if (heroChatBtn) {
      heroChatBtn.addEventListener('click', () => this.switchView('chat'));
    }

    const heroResetBtn = document.getElementById('hero-start-reset-btn');
    if (heroResetBtn) {
      heroResetBtn.addEventListener('click', () => this.switchView('reset'));
    }

    const brandHomeLink = document.getElementById('brand-home-link');
    if (brandHomeLink) {
      brandHomeLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchView('home');
      });
    }

    // 3. Crisis Support drawer overlay
    const safetyBtn = document.getElementById('safety-alert-btn');
    const crisisOverlay = document.getElementById('crisis-support-overlay');
    const crisisCloseBtn = document.getElementById('crisis-drawer-close');

    if (safetyBtn && crisisOverlay) {
      safetyBtn.addEventListener('click', () => {
        crisisOverlay.style.display = 'flex';
      });
    }

    if (crisisCloseBtn && crisisOverlay) {
      crisisCloseBtn.addEventListener('click', () => {
        crisisOverlay.style.display = 'none';
      });
    }

    window.addEventListener('click', (e) => {
      if (e.target === crisisOverlay) {
        crisisOverlay.style.display = 'none';
      }
    });

    // 4. Dashboard Emoji Mood Quick Log
    document.querySelectorAll('.mood-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const moodVal = btn.getAttribute('data-mood');
        
        // Visual toggle active selection
        document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        
        this.logMood(moodVal);
      });
    });

    // 5. Daily Challenge Checkbox mark
    const challengeCard = document.getElementById('daily-challenge-btn');
    if (challengeCard) {
      challengeCard.addEventListener('click', () => {
        challengeCard.classList.toggle('completed');
      });
    }

    // 6. Empathetic Chat triggers
    const sendChatBtn = document.getElementById('send-chat-btn');
    const chatInput = document.getElementById('user-chat-input');
    
    if (sendChatBtn && chatInput) {
      const triggerSend = () => {
        const msg = chatInput.value.trim();
        if (!msg) return;
        chatInput.value = '';
        this.handleUserChatMessage(msg);
      };
      
      sendChatBtn.addEventListener('click', triggerSend);
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          triggerSend();
        }
      });
    }

    // Chat preset quick suggestions
    document.querySelectorAll('.chat-suggestion-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-text');
        this.handleUserChatMessage(text);
        
        // Hide preset suggestions after first use
        const suggestionsBox = document.getElementById('chat-presets-container');
        if (suggestionsBox) suggestionsBox.style.display = 'none';
      });
    });

    // 7. Thought Clarity Step Navigation
    document.querySelectorAll('.btn-clarity-nav.next').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetStage = parseInt(btn.getAttribute('data-target'));
        
        // Input validation before moving forward
        if (targetStage === 2) {
          const worryText = document.getElementById('clarity-worry-input').value.trim();
          if (!worryText) {
            alert("Please write down what's on your mind before continuing!");
            return;
          }
        } else if (targetStage === 3) {
          const factsText = document.getElementById('clarity-facts-input').value.trim();
          if (!factsText) {
            alert("Let's separate facts from guesses first. Share a small note in Step 2.");
            return;
          }
        } else if (targetStage === 4) {
          const reframeText = document.getElementById('clarity-reframe-input').value.trim();
          if (!reframeText) {
            alert("Think about how you would comfort a close friend in this situation. Jot it down!");
            return;
          }
        }

        this.switchClarityStage(targetStage);
      });
    });

    document.querySelectorAll('.btn-clarity-nav.back').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetStage = parseInt(btn.getAttribute('data-target'));
        this.switchClarityStage(targetStage);
      });
    });

    // Save final Thought Clarity session log
    const saveClarityBtn = document.getElementById('btn-save-clarity');
    if (saveClarityBtn) {
      saveClarityBtn.addEventListener('click', () => {
        const actionVal = document.getElementById('clarity-action-input').value.trim();
        if (!actionVal) {
          alert("Think of just one small, tiny task you can do today, or write what you release.");
          return;
        }

        this.commitThoughtClaritySession();
      });
    }

    // 8. 5-Minute Reset Session Cards selection
    document.querySelectorAll('.reset-card').forEach(card => {
      card.addEventListener('click', () => {
        const sessionType = card.getAttribute('data-session');
        this.launchResetSession(sessionType);
      });
    });

    // 5-Minute Reset Player Controls binding
    const backBtn = document.getElementById('player-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.closeResetSessionPanel());
    }

    const togglePlayBtn = document.getElementById('btn-player-toggle');
    if (togglePlayBtn) {
      togglePlayBtn.addEventListener('click', () => this.toggleResetPlayState());
    }

    const restartBtn = document.getElementById('btn-player-reset');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => this.restartResetSession());
    }

    const muteBtn = document.getElementById('btn-player-mute');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => this.toggleResetMuteState());
    }

    // 9. Journal Interactivity
    const journalInput = document.getElementById('journal-input');
    const journalCharCount = document.getElementById('journal-char-count');
    const btnSaveJournal = document.getElementById('btn-save-journal');

    if (journalInput && journalCharCount) {
      journalInput.addEventListener('input', () => {
        const count = journalInput.value.length;
        journalCharCount.innerText = `${count} / 2000`;
      });
    }

    if (btnSaveJournal && journalInput) {
      btnSaveJournal.addEventListener('click', () => {
        const text = journalInput.value.trim();
        if (!text) return;
        this.saveJournalEntry(text);
        journalInput.value = '';
        journalCharCount.innerText = '0 / 2000';
        this.showToast('Journal entry saved successfully.', 'success');
      });
    }
  }

  // --- 1. DAILY MOOD CHECK-IN MANAGER ---
  logMood(mood) {
    const logItem = {
      mood: mood,
      timestamp: Date.now()
    };
    
    // Add to state and save
    this.moodHistory.push(logItem);
    this.saveMoodState();
    
    // Re-render chart statistics
    this.renderMoodChart();
    
    // Provide customized, teenage-friendly empathetic companion tip
    const insightBox = document.getElementById('mood-insight-txt');
    if (insightBox) {
      let customTip = "";
      switch (mood) {
        case 'happy':
          customTip = "😊 Wonderful! Celebrate this boost. Take a screenshot or jot down in Thought Clarity what made you happy so you can recall it on tougher days!";
          break;
        case 'calm':
          customTip = "😌 Beautiful. A steady mind is a superpower. Enjoy this still moment. Our **Mountain Calm** reset can help maintain this tranquility.";
          break;
        case 'stressed':
          customTip = "😟 I feel you. School and expectations get heavy. Give yourself a break. Try our **Ocean Breathing** reset right now to drop muscle tension.";
          break;
        case 'tired':
          customTip = "😴 It's totally okay to feel tired. You don't have to carry a cheerful face all the time. Vent with **Saathi Chat**—I am here to listen.";
          break;
        case 'overwhelmed':
          customTip = "😰 Deep breath. The overthinking spiral is trying to make guesses feel like facts. Use the signature **Thought Clarity Tool** to untangle this spiral.";
          break;
      }
      
      insightBox.innerHTML = `<strong>Saathi says:</strong> ${customTip}`;
      insightBox.style.display = 'block';
      insightBox.style.color = 'var(--text-main)';
      insightBox.style.fontSize = '0.85rem';
      insightBox.style.animation = 'fade-slide 0.4s ease forwards';
    }
  }

  // Renders the dynamic weekly SVG/HTML charts based on history entries
  renderMoodChart() {
    const barsContainer = document.getElementById('mood-bars-grid');
    if (!barsContainer) return;
    
    // Count occurrences of each of the 5 moods in the last 7 days
    const counts = { happy: 0, calm: 0, stressed: 0, overwhelmed: 0, tired: 0 };
    const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    const recentLogs = this.moodHistory.filter(l => l.timestamp >= cutoff);
    recentLogs.forEach(l => {
      if (counts[l.mood] !== undefined) {
        counts[l.mood] += 1;
      }
    });

    const totalLogs = recentLogs.length || 1; // avoid division by zero
    
    // Inject dynamic, styled bars into grid
    barsContainer.innerHTML = '';
    const emojis = { happy: '😊', calm: '😌', stressed: '😟', overwhelmed: '😰', tired: '😴' };
    
    for (const [moodName, val] of Object.entries(counts)) {
      const percentage = (val / totalLogs) * 100;
      // Cap height to at least 4% for design aesthetics, or scale up to 100%
      const barHeight = recentLogs.length === 0 ? 5 : Math.max(5, percentage);
      
      const barItem = document.createElement('div');
      barItem.className = 'chart-bar-wrapper';
      barItem.innerHTML = `
        <div class="chart-bar" style="height: ${barHeight}px;" title="${moodName}: ${val} logs"></div>
        <div class="chart-label" style="font-size: 1.15rem; margin-top: 0.25rem;">${emojis[moodName]}</div>
        <span style="font-size: 0.6rem; color: var(--text-muted); font-weight: bold;">${val}</span>
      `;
      barsContainer.appendChild(barItem);
    }
  }

  // --- 2. SIGNATURE THOUGHT CLARITY VIEW CONTROLLER ---
  switchClarityStage(stage) {
    // Toggle active classes on dots
    document.querySelectorAll('.clarity-step-dot').forEach((dot, index) => {
      const dotNum = index + 1;
      dot.classList.remove('active', 'completed');
      if (dotNum === stage) {
        dot.classList.add('active');
      } else if (dotNum < stage) {
        dot.classList.add('completed');
      }
    });

    // Toggle active classes on cards
    document.querySelectorAll('.clarity-card-stage').forEach(card => {
      card.classList.remove('active');
      if (parseInt(card.getAttribute('data-stage')) === stage) {
        card.classList.add('active');
      }
    });
  }

  // Saves completed Thought Clarity entry, clears fields, and slides to archive list
  commitThoughtClaritySession() {
    const worry = document.getElementById('clarity-worry-input').value.trim();
    const facts = document.getElementById('clarity-facts-input').value.trim();
    const reframe = document.getElementById('clarity-reframe-input').value.trim();
    const action = document.getElementById('clarity-action-input').value.trim();

    const logEntry = {
      id: 'clarity_' + Date.now(),
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      worry: worry,
      facts: facts,
      reframe: reframe,
      action: action
    };

    // Save state
    this.clarityLogs.unshift(logEntry); // new entry at top
    this.saveClarityState();
    
    // Clear text boxes
    document.getElementById('clarity-worry-input').value = '';
    document.getElementById('clarity-facts-input').value = '';
    document.getElementById('clarity-reframe-input').value = '';
    document.getElementById('clarity-action-input').value = '';

    // Re-render list
    this.renderClarityLogs();
    
    // Transition back to step 1
    this.switchClarityStage(1);
    
    // Smooth scroll down to logs archive
    const archiveTitle = document.getElementById('archive-section-head');
    if (archiveTitle) {
      archiveTitle.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Renders the private archived clarity reflection cards
  renderClarityLogs() {
    const listContainer = document.getElementById('clarity-logs-container');
    if (!listContainer) return;

    if (this.clarityLogs.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 2.5rem 1rem; border: 1px dashed var(--border-light); border-radius: var(--radius-md); background: white;">
          <img src="./assets/images/clarity_empty.png" alt="Empty Clarity State" class="empty-state-img">
          <p>Your completed Thought Clarity sessions will be saved here securely.</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = '';
    this.clarityLogs.forEach(log => {
      const card = document.createElement('div');
      card.className = 'clarity-history-card';
      card.innerHTML = `
        <div class="clarity-card-header">
          <span class="clarity-card-date">${log.date}</span>
          <button class="clarity-card-del" data-id="${log.id}" aria-label="Delete reflection">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
        
        <div class="clarity-sec">
          <div class="clarity-sec-lbl">The Worry</div>
          <div class="clarity-sec-txt">${log.worry}</div>
        </div>
        
        <div class="clarity-sec">
          <div class="clarity-sec-lbl">Facts vs. Assumptions</div>
          <div class="clarity-sec-txt">${log.facts}</div>
        </div>

        <div class="clarity-sec">
          <div class="clarity-sec-lbl">Reflection & Perspective Reframe</div>
          <div class="clarity-sec-txt">${log.reframe}</div>
        </div>

        <div class="clarity-sec">
          <div class="clarity-sec-lbl">My Commitment / Release</div>
          <div class="clarity-sec-txt" style="color: var(--primary-hover); font-weight: 600;">${log.action}</div>
        </div>
      `;

      // Bind delete button
      const delBtn = card.querySelector('.clarity-card-del');
      delBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to permanently clear this private reflection?")) {
          this.deleteClarityLog(log.id);
        }
      });

      listContainer.appendChild(card);
    });
  }

  deleteClarityLog(id) {
    this.clarityLogs = this.clarityLogs.filter(l => l.id !== id);
    this.saveClarityState();
    this.renderClarityLogs();
  }

  // --- 3. DYNAMIC DAILY BOOST GENERATOR ---
  setupDailyBoosts() {
    // Generate a pseudo-random index based on the day of the year
    const now = new Date();
    const dayIndex = (now.getFullYear() + now.getMonth() + now.getDate()) % this.quotes.length;

    const wisdom = this.quotes[dayIndex];

    const quoteBox = document.getElementById('daily-quote-text');
    const authorBox = document.getElementById('daily-quote-author');
    const reflectionBox = document.getElementById('daily-quote-reflection');

    if (quoteBox) quoteBox.innerText = `"${wisdom.text}"`;
    if (authorBox) authorBox.innerText = `— ${wisdom.author}`;
    if (reflectionBox) reflectionBox.innerText = wisdom.reflection;
  }

  // --- 4. EMPATHETIC CHAT MESSENGER CONTROLLER ---
  handleUserChatMessage(text) {
    const chatScroller = document.getElementById('chat-scroller');
    if (!chatScroller) return;

    // A. Append user message bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-msg user';
    userBubble.innerHTML = `<p>${text}</p>`;
    chatScroller.insertBefore(userBubble, document.getElementById('ai-typing-indicator'));
    
    // Auto scroll down
    chatScroller.scrollTop = chatScroller.scrollHeight;

    // B. Trigger typing animation and mock response latency
    const typingIndicator = document.getElementById('ai-typing-indicator');
    if (typingIndicator) typingIndicator.style.display = 'flex';

    chatScroller.scrollTop = chatScroller.scrollHeight;

    setTimeout(async () => {
  try {chatHistory.push({
    role: "user",
    content: text
});
    const response = await fetch("https://thinksaathinew.onrender.com/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
     body: JSON.stringify({
    message: text,
    history: chatHistory
})
    });

    const data = await response.json();
    chatHistory.push({
    role: "assistant",
    content: data.reply
});

    if (typingIndicator) typingIndicator.style.display = "none";

    const assistantBubble = document.createElement("div");
    assistantBubble.className = "chat-msg assistant";

    let formattedText = data.reply
      .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>");

    assistantBubble.innerHTML = `<p>${formattedText}</p>`;
    chatScroller.insertBefore(assistantBubble, typingIndicator);

    chatScroller.scrollTop = chatScroller.scrollHeight;

  } catch (error) {
    console.error(error);

    if (typingIndicator) typingIndicator.style.display = "none";

    const assistantBubble = document.createElement("div");
    assistantBubble.className = "chat-msg assistant";
    assistantBubble.innerHTML = `<p>Sorry, I couldn't connect to ThinkSaathi's AI.</p>`;

    chatScroller.insertBefore(assistantBubble, typingIndicator);
  }
}, 500);
  }

  // --- 5. 5-MINUTE SOMATIC RESET PLAYER ORCHESTRATOR ---
  launchResetSession(sessionType) {
    const config = this.sessionConfigs[sessionType];
    if (!config) return;

    // Hide selection menu, show player interface
    document.getElementById('reset-selection-panel').style.display = 'none';
    const playerPanel = document.getElementById('reset-player-panel');
    playerPanel.style.display = 'block';
    
    // Apply dynamic animated CSS background theme
    playerPanel.className = 'env-' + sessionType;

    // Configure details
    document.getElementById('current-session-title').innerText = config.title;
    document.getElementById('current-session-subtitle').innerText = config.subtitle;
    document.getElementById('player-time-left').innerText = "03:00";
    
    // Show/hide custom alternate nostril indicators
    const nostrilPanel = document.getElementById('nostril-cue-panel');
    if (sessionType === 'anulom_vilom') {
      nostrilPanel.style.display = 'flex';
      document.getElementById('cue-left').className = 'nostril-cue';
      document.getElementById('cue-right').className = 'nostril-cue';
    } else {
      nostrilPanel.style.display = 'none';
    }

    // Configure state
    this.activeSession = {
      type: sessionType,
      steps: config.steps,
      currentStepIndex: 0,
      elapsedMs: 0
    };
    
    this.timeLeftSeconds = 180;
    this.isPlayingReset = false;
    
    // Configure buttons state
    const playBtnSvg = document.getElementById('play-pause-svg');
    if (playBtnSvg) {
      playBtnSvg.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"></polygon>`; // reset to play icon
    }
    
    const breatheContainer = document.getElementById('breathing-animation-container');
    if (breatheContainer) breatheContainer.className = 'breath-outer'; // neutral state
    
    document.getElementById('breath-text-prompt').innerText = "Begin";
    document.getElementById('player-instruction-caption').innerText = "Tap the Play button to start your guided somatic session.";

    // Smooth scroll player into focus
    document.getElementById('reset-player-panel').scrollIntoView({ behavior: 'smooth' });
  }

  closeResetSessionPanel() {
    this.stopActiveResetSession();
    
    // Show selection grid, hide active player
    document.getElementById('reset-player-panel').style.display = 'none';
    document.getElementById('reset-selection-panel').style.display = 'block';
  }

  toggleResetPlayState() {
    if (this.isPlayingReset) {
      this.pauseActiveResetSession();
    } else {
      this.startActiveResetSession();
    }
  }

  startActiveResetSession() {
    if (this.isPlayingReset) return;
    this.isPlayingReset = true;

    // Toggle button icon to Pause
    const playBtnSvg = document.getElementById('play-pause-svg');
    if (playBtnSvg) {
      playBtnSvg.innerHTML = `
        <line x1="18" y1="4" x2="18" y2="20"></line>
        <line x1="6" y1="4" x2="6" y2="20"></line>
      `;
    }

    // 1. Initialize custom physical synth sound
    if (window.audioEngine) {
      window.audioEngine.start(this.activeSession.type);
      window.audioEngine.setMasterVolume(this.isMuted ? 0 : 0.6);
    }

    // 2. Start global 5-minute countdown clock
    this.timerInterval = setInterval(() => {
      this.timeLeftSeconds--;
      this.updateCountdownClockUI();

      if (this.timeLeftSeconds <= 0) {
        this.completeResetSessionSuccessfully();
      }
    }, 1000);

    // 3. Start sequential breathing rhythm cycles
    this.processNextBreathingStep();
  }

  pauseActiveResetSession() {
    if (!this.isPlayingReset) return;
    this.isPlayingReset = false;

    // Toggle button icon to Play
    const playBtnSvg = document.getElementById('play-pause-svg');
    if (playBtnSvg) {
      playBtnSvg.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"></polygon>`;
    }

    // Clear all interval runners
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.breathCycleInterval) clearTimeout(this.breathCycleInterval);

    // Stop physical audio synthesis
    if (window.audioEngine) {
      window.audioEngine.stop();
    }

    // Reset breathing visual ring
    const breatheContainer = document.getElementById('breathing-animation-container');
    if (breatheContainer) {
      breatheContainer.className = 'breath-outer';
    }
    document.getElementById('breath-text-prompt').innerText = "Paused";
  }

  restartResetSession() {
    const prevType = this.activeSession ? this.activeSession.type : 'deep_belly';
    this.stopActiveResetSession();
    this.launchResetSession(prevType);
    this.startActiveResetSession();
  }

  stopActiveResetSession() {
    this.pauseActiveResetSession();
    this.activeSession = null;
  }

  // Standard counting clock formatter
  updateCountdownClockUI() {
    const mins = Math.floor(this.timeLeftSeconds / 60);
    const secs = this.timeLeftSeconds % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    
    const clock = document.getElementById('player-time-left');
    if (clock) clock.innerText = formatted;
  }

  // Recursive breathing loop controller
  processNextBreathingStep() {
    if (!this.isPlayingReset || !this.activeSession) return;

    const currentStep = this.activeSession.steps[this.activeSession.currentStepIndex];
    
    // A. Update visual indicators & classes based on phase (inhale, hold, exhale)
    const container = document.getElementById('breathing-animation-container');
    const promptText = document.getElementById('breath-text-prompt');
    const instruction = document.getElementById('player-instruction-caption');

    if (container) {
      container.className = 'breath-outer'; // clear
      
      if (currentStep.phase.includes('inhale')) {
        container.classList.add('inhale');
      } else if (currentStep.phase.includes('exhale')) {
        container.classList.add('exhale');
      } else if (currentStep.phase === 'hold') {
        container.classList.add('hold');
      }
    }

    if (promptText) promptText.innerText = currentStep.label;
    if (instruction) instruction.innerText = currentStep.desc;
    
    // Speak the instruction aloud
    this.speak(currentStep.label);

    // B. Alternate Nostril Panel triggers
    if (this.activeSession.type === 'anulom_vilom') {
      const cueLeft = document.getElementById('cue-left');
      const cueRight = document.getElementById('cue-right');
      
      if (cueLeft && cueRight) {
        cueLeft.className = 'nostril-cue';
        cueRight.className = 'nostril-cue';
        
        if (currentStep.phase.includes('left')) {
          cueLeft.classList.add('active');
        } else if (currentStep.phase.includes('right')) {
          cueRight.classList.add('active');
        }
      }
    }

    // C. Trigger dynamic synth updates (panning, buzz pitch changes)
    if (window.audioEngine) {
      window.audioEngine.updateBreathingPhase(currentStep.phase, currentStep.duration);
    }

    // D. Recurse to next step after timing finishes
    this.breathCycleInterval = setTimeout(() => {
      if (!this.isPlayingReset || !this.activeSession) return;
      
      // Advance counter
      this.activeSession.currentStepIndex = (this.activeSession.currentStepIndex + 1) % this.activeSession.steps.length;
      
      this.processNextBreathingStep();
    }, currentStep.duration);
  }

  completeResetSessionSuccessfully() {
    this.stopActiveResetSession();
    
    // Render success panel overlay/alert and celebrate
    alert(`🎉 Brilliant work! You have successfully completed your 3-minute ${this.activeSession ? this.sessionConfigs[this.activeSession.type].title : 'mindfulness'} reset. Your mind is already clearer. Keep moving forward!`);
    
    this.closeResetSessionPanel();
  }

  toggleResetMuteState() {
    this.isMuted = !this.isMuted;
    
    const muteSvg = document.getElementById('volume-toggle-svg');
    if (muteSvg) {
      if (this.isMuted) {
        // Render Muted state SVG
        muteSvg.innerHTML = `
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        `;
      } else {
        // Render Active sound state SVG
        muteSvg.innerHTML = `
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        `;
      }
    }

    if (window.audioEngine) {
      window.audioEngine.setMasterVolume(this.isMuted ? 0 : 0.6);
    }
  }

  // --- 6. JOURNAL CORE LOGIC ---
  saveJournalEntry(text) {
    const entry = {
      id: 'entry_' + Date.now(),
      text: text,
      timestamp: Date.now(),
      dateString: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    
    this.journalEntries.unshift(entry); // Add to beginning
    this.saveJournalState();
    this.renderJournalEntries();
  }

  deleteJournalEntry(id) {
    this.journalEntries = this.journalEntries.filter(e => e.id !== id);
    this.saveJournalState();
    this.renderJournalEntries();
    this.showToast('Entry deleted.', 'info');
  }

  editJournalEntry(id) {
    const entryIndex = this.journalEntries.findIndex(e => e.id === id);
    if (entryIndex === -1) return;
    
    const entry = this.journalEntries[entryIndex];
    const newText = prompt("Edit your journal entry:", entry.text);
    
    if (newText !== null && newText.trim() !== '') {
      this.journalEntries[entryIndex].text = newText.trim();
      this.journalEntries[entryIndex].edited = true;
      this.saveJournalState();
      this.renderJournalEntries();
      this.showToast('Entry updated.', 'success');
    }
  }

  renderJournalEntries() {
    const listContainer = document.getElementById('journal-entries-list');
    if (!listContainer) return;

    if (this.journalEntries.length === 0) {
      listContainer.innerHTML = `
        <div class="journal-empty-state" style="text-align: center; padding: 2rem;">
          <img src="./assets/images/journal_empty.png" alt="Empty Journal" class="empty-state-img">
          <p style="color: var(--text-muted); font-size: 0.9rem;">Your journal entries will appear here — private and safe.</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = '';
    this.journalEntries.forEach(entry => {
      const card = document.createElement('div');
      card.className = 'journal-entry-card';
      
      const safeText = entry.text.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, '<br>');
      
      card.innerHTML = `
        <div class="journal-entry-header">
          <span class="journal-entry-date">${entry.dateString} ${entry.edited ? '(Edited)' : ''}</span>
          <div class="journal-entry-actions">
            <button class="journal-action-btn edit" data-id="${entry.id}" aria-label="Edit entry">✏️</button>
            <button class="journal-action-btn delete" data-id="${entry.id}" aria-label="Delete entry">🗑️</button>
          </div>
        </div>
        <div class="journal-entry-body">${safeText}</div>
      `;

      card.querySelector('.journal-action-btn.edit').addEventListener('click', () => {
        this.editJournalEntry(entry.id);
      });
      
      card.querySelector('.journal-action-btn.delete').addEventListener('click', () => {
        if (confirm('Are you sure you want to permanently delete this entry?')) {
          this.deleteJournalEntry(entry.id);
        }
      });

      listContainer.appendChild(card);
    });
  }

  showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style = "padding: 12px 24px; background: var(--surface); border-left: 4px solid var(--primary); box-shadow: var(--shadow-md); margin-top: 10px; border-radius: var(--radius-sm); z-index: 9999; animation: slideIn 0.3s ease forwards;";
    toast.innerHTML = `<p style="margin:0; font-size: 0.9rem; font-weight: 500;">${message}</p>`;
    
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}

// Instantiate on document load
document.addEventListener('DOMContentLoaded', () => {
  const app = new ThinkSaathiApp();
  app.init();
});
// ==========================================
// THINKSAATHI — INNER JOURNEY PROGRESS
// ==========================================

const JOURNEY_STORAGE_KEY = "thinksaathi_journey_reflections";

function getJourneyReflections() {
    return Number(localStorage.getItem(JOURNEY_STORAGE_KEY)) || 0;
}

function updateJourneyUI() {
    const count = getJourneyReflections();

    const seed = document.getElementById("journey-seed");
    const growing = document.getElementById("journey-growing");
    const blooming = document.getElementById("journey-blooming");

    const line1 = document.getElementById("journey-line-1");
    const line2 = document.getElementById("journey-line-2");

    const countText = document.getElementById("journey-progress-count");
    const progressFill = document.getElementById("journey-progress-fill");
    const nextStep = document.getElementById("journey-next-step");
    const description = document.getElementById("journey-desc");

    if (!seed || !growing || !blooming) return;

    seed.classList.remove("active");
    growing.classList.remove("active");
    blooming.classList.remove("active");

    line1?.classList.remove("completed");
    line2?.classList.remove("completed");

    countText.textContent = count;

    if (count < 3) {
        seed.classList.add("active");

        nextStep.textContent =
            `Complete ${3 - count} more reflection${3 - count === 1 ? "" : "s"} to reach Growing Mind.`;

        description.textContent =
            "Every moment of reflection helps your resilience grow.";

        progressFill.style.width = `${(count / 3) * 33.33}%`;
    } 
    
    else if (count < 7) {
        growing.classList.add("active");
        line1?.classList.add("completed");

        nextStep.textContent =
            `Complete ${7 - count} more reflection${7 - count === 1 ? "" : "s"} to reach Blooming Lotus.`;

        description.textContent =
            "Your reflections are helping your mind grow stronger.";

        progressFill.style.width =
            `${33.33 + ((count - 3) / 4) * 33.33}%`;
    } 
    
    else {
        blooming.classList.add("active");
        line1?.classList.add("completed");
        line2?.classList.add("completed");

        nextStep.textContent =
            "🌸 You've reached Blooming Lotus. Keep nurturing your journey.";

        description.textContent =
            "Your consistent reflection is helping your resilience bloom.";

        progressFill.style.width = "100%";
    }
}

const journeyReflectionButton =
    document.getElementById("journey-reflection-btn");

if (journeyReflectionButton) {
    journeyReflectionButton.addEventListener("click", () => {
        const currentCount = getJourneyReflections();

        localStorage.setItem(
            JOURNEY_STORAGE_KEY,
            currentCount + 1
        );

        updateJourneyUI();
    });
}

updateJourneyUI();