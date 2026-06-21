/**
 * ThinkSaathi AI Companion Engine — v2.1
 * Natural conversational flow, separate casual/greeting detection,
 * and reduced repetitive therapy script phrasing.
 */

class SaathiAI {
  constructor() {
    this.conversationHistory = [];
    this.messageCount = 0;
    this.detectedCategory = null;

    // ── CORE RESPONSE BANK ──
    this.responses = {

      greetings: [
        "Hey there! 👋 How's your day going so far?",
        "Hi! So glad you dropped by. Kya chal raha hai aaj?",
        "Hello! I'm Saathi. How are you feeling today?",
        "Hey! Good to see you. Sab theek?"
      ],

      casual: [
        "I'm doing well, just hanging out here ready to chat! Tum batao, kya chal raha hai?",
        "That's cool! Tell me more about what's going on with you.",
        "Got it! I'm always here if you want to chat about anything—big or small.",
        "Nice! It's always good to take a moment just to catch up."
      ],

      overthinking: [
        "I hear you, and it's incredibly common to feel this way. Overthinking makes us build huge mountains out of tiny pebbles. What is one tiny thing in this moment you *actually* have control over?",
        "Spiraling is exhausting yaar. It feels like your mind is running a marathon. Remember: thoughts are not facts. What's the main 'what-if' playing on repeat right now?",
        "When thoughts spin out of control, everything feels heavier than it really is. Let's try to gently ground ourselves. 5 years from now—will this exact moment still feel this enormous?",
        "The overthinking loop is like a browser with too many tabs open. You don't have to close all of them at once. Which *one* tab feels the loudest right now?"
      ],

      academic_stress: [
        "Exam stress can feel like your whole future is riding on one sheet of paper. But your grades are just a snapshot, not a measurement of your worth. Can we break your study load into one ridiculously tiny first task?",
        "Pressure bahut hai, I know. Extreme stress actually hurts performance. What's one small break you can give yourself right now?",
        "Feeling overwhelmed by studies is so common. Take a breath. What is the *actual next action* that would help—just the very next thing?",
        "School pressure can make it feel like everyone else has it together while you're drowning. I promise, they don't. What would 'good enough for today' look like for you?"
      ],

      loneliness: [
        "Loneliness is a heavy feeling, made worse when it looks like everyone else has their social life perfectly figured out. They don't—I promise. What's a small hobby or song that usually makes you feel a bit more like yourself?",
        "It's really hard to feel lonely. Akele lagna bahut normal hai. I'm here and I want to listen. What would help most right now?",
        "Feeling disconnected is one of the most painful experiences. Is there one person in your life, even someone you've drifted from, who felt like a genuine connection?",
        "Loneliness doesn't mean something is wrong with you—sometimes it means you're looking for deeper connections than small talk can offer. What kind of connection do you actually crave right now?"
      ],

      self_doubt: [
        "Self-doubt highlights everyone else's wins while cataloguing your every mistake. It's not a fair judge. You have navigated so many hard days to get here. What is one tiny win you can hold onto today?",
        "It's easy to compare your inner struggle to everyone else's outer image. Tum koshish kar rahe ho, and that matters. What's one quality you have that you rarely give yourself credit for?",
        "The voice of self-doubt is loud, but it's not wise. When it says 'you can't do this,' what would your most supportive friend say back to it?",
        "Feeling 'not good enough' often shows up when we're pushing into new territory. The discomfort is a sign you're trying. What is one thing you've done recently that required courage?"
      ],

      friendship: [
        "Friend situations can feel so complicated. Dosto ke beech conflicts bahut drain karte hain. What happened, if you want to share?",
        "Friendship conflict is genuinely draining. The people we care most about have the most power to hurt us. What's the part that's hurting the most right now?",
        "Losing or drifting from a close friend can feel like grief. You don't have to 'just get over it' quickly. Who in your life still makes you feel genuinely cared for?"
      ],

      social_pressure: [
        "Social pressure is incredibly real—the pressure to look or act a certain way. It's exhausting yaar. Who are you when no one is watching—what does *that* version of you enjoy?",
        "Feeling like you have to constantly adapt to be accepted takes a huge mental toll. What's one thing you genuinely love that has nothing to do with how others see you?",
        "The pressure to be popular or socially 'right' is something nearly every teenager carries. What's one social situation that's been draining you lately?"
      ],

      general_distress: [
        "That sounds really tough, and it makes complete sense that you're feeling this way. I'm here to support you. What feels like the heaviest part of this right now?",
        "I'm listening. Pareshani mein akele feel karna common hai. How can I best support you today?",
        "Whatever's on your mind—big or small—I'm here for it. No thought is too messy to share. What's been sitting heavily with you lately?"
      ],

      chit_chat: [
        "Haha, I'm just an AI, so I don't eat burgers or watch movies, but I'm always down for a good conversation! What else are you up to?",
        "That's a fun question! As a digital companion, my favorite thing is chatting with you. What are your favorite things to do?",
        "I love that we can just chat casually! I don't have a physical life, but I find human lives so interesting. Tell me more about yours?",
        "Haha, nice! I'm here for the deep talks AND the casual chats. What else is on your mind today?"
      ],

      general: [
        "Oh, interesting! Tell me more about that.",
        "Got it. Remember, this is your space to talk about whatever you want. Kaise ho aaj?",
        "I'm here and listening! We can talk about that, or anything else you'd like to explore."
      ],

      crisis: [
        "I'm really glad you reached out, and what you're feeling right now matters deeply. Because I care about your safety, I want to make sure you have the right, immediate support. Please tap the **🚨 Crisis Support** button at the top of the page. You deserve real, safe, and immediate care. You are not alone in this.",
        "You reaching out matters so much. What you're feeling is serious, and the most important thing right now is your safety. Please use the **Crisis Support** button above to reach someone trained to truly help you through this. You do not have to carry this alone."
      ]
    };

    // ── FOLLOW-UP SUGGESTIONS after 2nd message ──
    this.followUps = {
      overthinking: "\n\n🧭 *Would you like to try the **Thought Clarity Tool**? It's designed to untangle overthinking loops and separate facts from fears.*",
      academic_stress: "\n\n🧭 *Our **Exam Calm Reset** (5 minutes) can bring your nervous system back to a steady baseline before studying. Try it from the 5-Min Reset tab.*",
      loneliness: "\n\n🧭 *Sometimes writing things down privately helps. Try the **Journal** tab to express freely.*",
      self_doubt: "\n\n🧭 *The **Thought Clarity Tool** is great for challenging the inner critic—it helps separate harsh assumptions from what's actually true.*",
      friendship: "\n\n🧭 *Writing your feelings out sometimes reveals a lot. Try the **Journal** for a private space to express everything you can't say out loud yet.*",
      social_pressure: "\n\n🧭 *A **Morning Clarity** or **Deep Belly Breathing** reset can help ground you when social situations leave you feeling off-balance.*",
      general_distress: "\n\n🧭 *You can also explore the **Thought Clarity Tool** or a **5-Minute Reset** anytime you want a more structured way to find calm.*"
    };

    // ── INTENT PATTERNS (Hinglish + Contextual) ──
    this.patterns = {
      greetings:        [/\b(hi|hello|hey|namaste|heya)\b/i, /kya chal raha hai/i, /kaise ho/i],
      casual:           [/how are you/i, /what are you doing/i, /aur batao/i, /sab badhiya/i],
      overthinking:     [/overthink/i, /spiral/i, /stuck/i, /worry/i, /loop/i, /dimag.*kharab/i, /soch.*raha/i, /kya hoga/i, /panic/i],
      academic_stress:  [/exam/i, /test/i, /grade/i, /study/i, /fail/i, /pressure/i, /padhai/i, /marks/i, /syllabus/i, /jee|neet|board/i, /tension/i, /result/i],
      loneliness:       [/alone/i, /lonely/i, /friend/i, /left out/i, /sad/i, /akele/i, /koi nahi/i, /ignore/i, /disconnect/i],
      self_doubt:       [/loser/i, /dumb/i, /not good enough/i, /useless/i, /compare/i, /worthless/i, /mujhe nahi/i, /bekar/i],
      friendship:       [/best friend/i, /fight/i, /betray/i, /trust/i, /dost/i, /gossip/i, /jealous/i],
      social_pressure:  [/popular/i, /fit in/i, /peer pressure/i, /judged/i, /embarrassed/i, /log kya/i],
      general_distress: [/help/i, /crying/i, /upset/i, /overwhelmed/i, /exhausted/i, /bad day/i, /stress/i, /pareshan/i, /bura lag/i, /anxious/i],
      chit_chat:        [/burger/i, /pizza/i, /food/i, /eat/i, /movie/i, /music/i, /song/i, /game/i, /play/i, /joke/i, /robot/i, /ai/i, /do you like/i, /what is your/i],
      crisis:           [/suicide/i, /kill myself/i, /die/i, /cutting/i, /self.?harm/i, /marne/i, /khatam/i, /no point living/i]
    };
  }

  // Detect the best-matching category for user input
  analyzeMessage(msg) {
    const text = msg.toLowerCase();
    
    // Check if it's a direct casual question (ends with ?) and has no distress markers
    const isQuestion = text.trim().endsWith('?');
    
    // Quick exact matches or startswith for common single-word greetings
    const cleanText = text.replace(/[^\w\s]/g, '').trim();
    if (this.patterns.greetings.some(p => p.test(cleanText))) return 'greetings';

    // Crisis safety check first — always priority
    for (const pattern of this.patterns.crisis) {
      if (pattern.test(text)) return 'crisis';
    }

    let scores = {
      greetings: 0, casual: 0, overthinking: 0, academic_stress: 0, loneliness: 0,
      self_doubt: 0, friendship: 0, social_pressure: 0, general_distress: 0, chit_chat: 0
    };

    for (const [category, patterns] of Object.entries(this.patterns)) {
      if (category === 'crisis') continue;
      
      patterns.forEach(p => {
        if (p.test(text)) scores[category] += 1;
      });
    }

    // Special logic: if it has distress words, override casual/greetings/chit_chat
    const distressTotal = scores.overthinking + scores.academic_stress + scores.loneliness + 
                          scores.self_doubt + scores.friendship + scores.social_pressure + scores.general_distress;
                          
    if (distressTotal === 0) {
        if (scores.greetings > 0) return 'greetings';
        if (scores.chit_chat > 0 || isQuestion) return 'chit_chat';
        if (scores.casual > 0) return 'casual';
    } else {
        scores.greetings = 0;
        scores.casual = 0;
        scores.chit_chat = 0;
    }

    let bestCategory = 'general';
    let maxScore = 0;
    for (const [cat, score] of Object.entries(scores)) {
      if (score > maxScore) { maxScore = score; bestCategory = cat; }
    }

    this.detectedCategory = maxScore > 0 ? bestCategory : 'general';
    return this.detectedCategory;
  }

  // Generate an empathetic, contextual response
  generateResponse(userMsg) {
    this.messageCount++;
    const category = this.analyzeMessage(userMsg);
    const pool = this.responses[category];

    // Cycle through responses to avoid repetition across the session
    const index = (this.conversationHistory.length / 2) % pool.length;
    let reply = pool[Math.floor(index)];

    // Add mindfulness micro-tip for specific categories
    if (category === 'overthinking') {
      reply += "\n\n💡 *Saathi Tip*: Try our **Anulom Vilom** or **Bhramari Pranayama** breathing reset — it physically calms mental chatter in just a few minutes.";
    } else if (category === 'academic_stress') {
      reply += "\n\n💡 *Saathi Tip*: When exam stress hits, try the **Exam Calm Reset** or **Deep Belly Breathing** to reset your nervous system before studying.";
    }

    // After the 2nd message, offer a relevant feature suggestion if it's a distress category
    const distressCategories = ['overthinking', 'academic_stress', 'loneliness', 'self_doubt', 'friendship', 'social_pressure', 'general_distress'];
    if (this.messageCount >= 2 && distressCategories.includes(category)) {
      const followUp = this.followUps[category] || this.followUps.general_distress;
      // Only append if it's not already recently suggested
      reply += followUp;
    }

    // Track conversation history for context
    this.conversationHistory.push({ role: 'user', text: userMsg });
    this.conversationHistory.push({ role: 'assistant', text: reply });

    return reply;
  }
}

window.SaathiAI = SaathiAI;
