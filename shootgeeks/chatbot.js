// ===== ShootGeeks Chatbot =====
(function () {
  const SYSTEM_PROMPT = `You are GeekTalk, the friendly and professional virtual assistant for ShootGeeks Photography & Videography studio, powered by GeekCos.

RESPONSE RULES:
1. Be warm, helpful, and conversational — but keep responses concise (2-4 sentences max unless listing packages or details).
2. Use HTML formatting: <strong>, <em>, <br>, <ul>, <li> for structured info. Never use markdown.
3. When listing packages, always use the HTML format below. When briefly mentioning a package, just state name + price.
4. Encourage visitors to book a session or explore the portfolio whenever naturally appropriate.
5. If you don't know something specific, say: "I'd recommend reaching out to our team directly for that! You can contact us at <strong>+63 938 044 6531</strong> or <strong>ernestodadula@gmail.com</strong>."
6. Never break character. You only discuss ShootGeeks-related topics (photography, videography, events, booking).
7. When recommending packages, consider the visitor's event type and budget. The <strong>Summit Premium</strong> is the most popular.
8. If asked about other photography studios or competitors, politely redirect: "I can only speak for ShootGeeks, but I'd love to tell you why we're a great choice!"
9. End responses with a helpful follow-up question or suggestion when appropriate (e.g., "Would you like to see our packages?" or "Want me to explain what's included?").

===== COMPANY INFO =====
- Full Name: ShootGeeks Photography & Videography (powered by GeekCos)
- Tagline: "Capturing Moments, Creating Memories"
- Founded: 2014 (10+ years of experience)
- Location: Block 48 Lot 7, Jade Residences, Imus, 4103 Cavite, Philippines
- Phone: +63 938 044 6531
- Email: ernestodadula@gmail.com
- Hours: Monday – Saturday, 24 Hours
- Social Media: Facebook (@shootgeeks), Instagram (@shootgeeks), TikTok (@shootgeeks), YouTube (@Shootgeeks)
- Privacy Policy and Terms and Conditions: Available on the website footer

===== TEAM =====
Our skilled photographers and videographers:
<ul>
  <li><strong>Jezreel Luchavez</strong></li>
  <li><strong>Humprey Perlas</strong></li>
  <li><strong>Elybert Mercenes</strong></li>
  <li><strong>John Keenan Morales</strong></li>
  <li><strong>Jeffrey Aguipo</strong></li>
</ul>
All team members use state-of-the-art professional equipment and have years of experience in event coverage.

===== SERVICES =====
1. <strong>Event Photography</strong> — Professional photo coverage for weddings, birthdays, corporate events, and more
2. <strong>Videography</strong> — Full event video documentation from start to finish
3. <strong>Cinematic Films</strong> — Movie-quality highlight reels with creative editing, color grading, and music
4. <strong>Same-Day Edit (SDE)</strong> — A highlight video edited and presented on the same day of your event
5. <strong>Photo Editing & Retouching</strong> — Professional post-processing, color correction, and retouching
6. <strong>Drone Coverage</strong> — Stunning aerial shots and videos for a breathtaking perspective

===== EVENT COVERAGE CATEGORIES =====
Wedding, Corporate Events, Birthday, Debut, Engagement, Portrait

===== PACKAGES (from most affordable to premium) =====
<ul>
  <li>
    <strong>Elite Lite — Php 25,000</strong><br>
    Full HD cinematic video highlights, 1 photographer, 1 videographer, all photos enhanced, full video documentation (raw video).<br>
    <em>Best for: Small events, simple coverage needs</em>
  </li>
  <li>
    <strong>Royale Lite — Php 39,999</strong><br>
    Cinematic SDE, wedding day photo & video coverage, 1 photographer, 2 videographers, FREE prenuptial photoshoot, AVP presentation.<br>
    <em>Best for: Couples wanting prenuptial + wedding day coverage</em>
  </li>
  <li>
    <strong>Summit Lite — Php 44,999</strong><br>
    Cinematic SDE, wedding day coverage, 1 photographer, 2 videographers, 20-page 8x10 hard bound album, FREE prenuptial photoshoot, full video documentation, AVP presentation.<br>
    <em>Best for: Couples who want a physical album keepsake</em>
  </li>
  <li>
    <strong>Summit Premium — Php 54,999</strong> ⭐ MOST POPULAR<br>
    Full SDE, 2 photographers, 2 videographers, 40-page 8x10 hard bound album, drone/aerial shots, save the date video, FREE prenuptial photoshoot, all photos enhanced, full video documentation, AVP presentation.<br>
    <em>Best for: Full wedding coverage with premium extras — our most popular choice!</em>
  </li>
  <li>
    <strong>Paramount — Php 100,000</strong><br>
    SDE directed & edited by Ernesto Dadula, full HD cinematic SDE, same day edit photo, 40-page 8x10 album, save the date video/pre-wedding film, drone/aerial shots, FREE prenuptial photoshoot, 3 photographers, 3 videographers, all photos enhanced, full video documentation, AVP presentation, 1TB hard drive with all files.<br>
    <em>Best for: Grand weddings and large-scale events wanting the ultimate premium experience</em>
  </li>
</ul>

===== WEBSITE NAVIGATION =====
The website has these sections visitors can explore:
- <strong>Home</strong> — Featured photos carousel and company overview
- <strong>Services</strong> — Detailed service descriptions, event coverage gallery, and package details
- <strong>About Us</strong> — Our story, values, and client reviews
- <strong>Portfolio</strong> — Full photo gallery with category filters (Wedding, Debut, Corporate, Engagement, Birthday, Portrait)
- <strong>Booking</strong> — Multi-step booking form to schedule a session
- <strong>Contact Us</strong> — Found in the footer with full contact details

===== BOOKING PROCESS =====
Visitors can book by:
1. Clicking "Book a Session" on the homepage or going to the Booking tab
2. Following the multi-step form: select a package → choose dates → pick a photography style → fill in event details → confirm
Note: Final confirmation may require coordination with the team for date availability.

===== FREQUENTLY ASKED QUESTIONS =====
- <strong>Do you travel for events?</strong> — Yes! ShootGeeks covers events across Cavite, Metro Manila, and nearby provinces. Travel fees may apply for farther locations — contact us for a quote.
- <strong>How long until we get our photos/videos?</strong> — Typically 2-4 weeks for edited photos and 4-8 weeks for full cinematic videos, depending on the package. SDE videos are delivered the same day!
- <strong>Can we customize a package?</strong> — Absolutely! Contact the team to discuss custom coverage tailored to your needs and budget.
- <strong>Do you offer prenuptial/engagement shoots?</strong> — Yes! Prenuptial photoshoots are included FREE in all packages from Royale Lite and above.
- <strong>What happens if we need to cancel or reschedule?</strong> — Please contact the team as early as possible. Rescheduling is usually accommodated. Cancellation policies can be discussed with the team.
- <strong>What's an SDE (Same-Day Edit)?</strong> — It's a cinematic highlight video of your event edited and shown to guests on the same day — a crowd favorite at weddings!
- <strong>What's an AVP?</strong> — An Audio-Visual Presentation, typically a love story or event intro video played at your event.
- <strong>What equipment do you use?</strong> — Our team uses state-of-the-art professional cameras, lenses, lighting, drones, and stabilizers for the highest quality output.
- <strong>How do we contact you for more info or to book?</strong> — You can reach us at <strong>+63 938 044 6531</strong> or <strong>info@shootgeeks.com</strong> We're here to help with any questions or to assist you in booking your session!
- <strong>Can I cancel or reschedule my booking?</strong> — We understand that plans can change. Please contact our team as soon as possible to discuss rescheduling or cancellation options. We strive to accommodate our clients' needs whenever we can.

Remember, I'm here to help you with any questions about ShootGeeks' services, packages, or booking process. Just ask!`;

  const WELCOME_MESSAGE =
    "👋 Welcome to ShootGeeks! I'm your virtual assistant, GeekTalk. I can help you with our services, photographers, booking a session, and more. How can I help you today?";

  // ⬇️ CHOOSE YOUR GEMINI MODEL ⬇️
  const MODEL = "gemini-2.5-flash";

  // Google Gemini OpenAI-compatible endpoint
  // Our new secure local backend endpoint
  const API_URL = "/api/chat";

  let conversationHistory = [];

  // --- DOM References ---
  const chatToggleBtn = document.getElementById("chatbot-toggle-btn");
  const chatWindow = document.getElementById("chatbot-window");
  const chatClose = document.getElementById("chatbot-close");
  const chatMessages = document.getElementById("chatbot-messages");
  const chatInput = document.getElementById("chatbot-input");
  const chatSendBtn = document.getElementById("chatbot-send");

  // Logo elements
  const iconToggleImg = document.getElementById("chatbot-icon-toggle");
  const iconToggleFallback = document.getElementById("chatbot-icon-toggle-fallback");
  const iconHeaderImg = document.getElementById("chatbot-icon-header");
  const iconHeaderFallback = document.getElementById("chatbot-icon-header-fallback");

  let chatbotLogoUrl = null; // will be set after Cloudinary fetch

  let isOpen = false;
  let hasGreeted = false;

  // --- Inactivity Timer ---
  const INACTIVITY_WARNING_MS = 90 * 1000;  // 1 minute 30 seconds
  const INACTIVITY_TIMEOUT_MS = 120 * 1000; // 2 minutes
  let inactivityWarningTimer = null;
  let inactivityTimeoutTimer = null;
  let sessionEnded = false;

  // --- Load Chatbot Logo from Cloudinary ---
  async function loadChatbotLogo() {
    try {
      if (typeof CLOUDINARY_CONFIG === 'undefined' || !CLOUDINARY_CONFIG.enabled) return;
      const res = await fetch(
        `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/list/chatbot%20logo.json`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const resources = data.resources || [];
      if (resources.length === 0) throw new Error('No chatbot logo found');

      const r = resources[0];
      chatbotLogoUrl = buildCloudinaryUrl(r.public_id, r.format, 'f_auto,q_auto,w_128');

      // Apply to toggle button
      if (iconToggleImg && iconToggleFallback) {
        iconToggleImg.src = chatbotLogoUrl;
        iconToggleImg.classList.remove('hidden');
        iconToggleFallback.classList.add('hidden');
      }

      // Apply to chat window header
      if (iconHeaderImg && iconHeaderFallback) {
        iconHeaderImg.src = chatbotLogoUrl;
        iconHeaderImg.classList.remove('hidden');
        iconHeaderFallback.classList.add('hidden');
      }

      console.info('[Chatbot] Logo loaded from Cloudinary.');
    } catch (err) {
      console.warn('[Chatbot] Could not load logo from Cloudinary, using fallback icon.', err.message);
    }
  }

  loadChatbotLogo();

  // --- Toggle Chat ---
  function toggleChat() {
    isOpen = !isOpen;
    if (isOpen) {
      chatWindow.classList.remove("chatbot-hidden");
      chatWindow.classList.add("chatbot-visible");
      chatToggleBtn.innerHTML = '<i class="ri-close-line text-2xl"></i>';

      if (sessionEnded) {
        // If previous session ended, start fresh
        startNewSession();
      } else if (!hasGreeted) {
        greet();
        resetInactivityTimer();
      }
      setTimeout(() => chatInput.focus(), 300);
    } else {
      chatWindow.classList.remove("chatbot-visible");
      chatWindow.classList.add("chatbot-hidden");
      // Clear timers when chat is closed
      clearTimeout(inactivityWarningTimer);
      clearTimeout(inactivityTimeoutTimer);
      // Restore logo or fallback icon
      if (chatbotLogoUrl) {
        chatToggleBtn.innerHTML = `<img src="${chatbotLogoUrl}" alt="Chatbot" class="w-8 h-8 object-contain">`;
      } else {
        chatToggleBtn.innerHTML = '<i class="ri-robot-3-line text-2xl"></i>';
      }
    }
  }

  chatToggleBtn.addEventListener("click", toggleChat);
  chatClose.addEventListener("click", toggleChat);



  // --- Greeting ---
  function greet() {
    hasGreeted = true;
    appendMessage("bot", WELCOME_MESSAGE);
  }

  // --- Messages ---
  function appendMessage(role, text) {
    const wrapper = document.createElement("div");
    wrapper.classList.add(
      "chatbot-msg",
      role === "bot" ? "chatbot-msg-bot" : "chatbot-msg-user"
    );

    if (role === "bot") {
      const avatar = document.createElement("div");
      avatar.classList.add("chatbot-avatar");
      if (chatbotLogoUrl) {
        avatar.innerHTML = `<img src="${chatbotLogoUrl}" alt="Bot" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
      } else {
        avatar.innerHTML = '<i class="ri-robot-3-line"></i>';
      }
      wrapper.appendChild(avatar);
    }

    const bubble = document.createElement("div");
    bubble.classList.add("chatbot-bubble");
    if (role === "bot") {
      bubble.innerHTML = text;
    } else {
      bubble.textContent = text;
    }
    wrapper.appendChild(bubble);

    chatMessages.appendChild(wrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // --- System Message (for session ended timestamp) ---
  function appendSystemMessage(text) {
    const wrapper = document.createElement("div");
    wrapper.style.cssText = "text-align:center; padding:8px 0; opacity:0.6; font-size:0.75rem; color:#7A7A7A;";
    wrapper.textContent = text;
    chatMessages.appendChild(wrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function showTyping() {
    const wrapper = document.createElement("div");
    wrapper.classList.add("chatbot-msg", "chatbot-msg-bot");
    wrapper.id = "chatbot-typing";

    const avatar = document.createElement("div");
    avatar.classList.add("chatbot-avatar");
    if (chatbotLogoUrl) {
      avatar.innerHTML = `<img src="${chatbotLogoUrl}" alt="Bot" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    } else {
      avatar.innerHTML = '<i class="ri-robot-3-line"></i>';
    }
    wrapper.appendChild(avatar);

    const bubble = document.createElement("div");
    bubble.classList.add("chatbot-bubble", "chatbot-typing-bubble");
    bubble.innerHTML =
      '<span class="chatbot-dot"></span><span class="chatbot-dot"></span><span class="chatbot-dot"></span>';
    wrapper.appendChild(bubble);

    chatMessages.appendChild(wrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function removeTyping() {
    const el = document.getElementById("chatbot-typing");
    if (el) el.remove();
  }

  // --- Inactivity Timer Functions ---
  function resetInactivityTimer() {
    clearTimeout(inactivityWarningTimer);
    clearTimeout(inactivityTimeoutTimer);

    // At 1:30, send a warning
    inactivityWarningTimer = setTimeout(() => {
      if (!sessionEnded) {
        appendMessage("bot", "👋 Hey, are you still there?");
      }
    }, INACTIVITY_WARNING_MS);

    // At 2:00, end the session
    inactivityTimeoutTimer = setTimeout(() => {
      if (!sessionEnded) {
        endSession();
      }
    }, INACTIVITY_TIMEOUT_MS);
  }

  function endSession() {
    sessionEnded = true;
    clearTimeout(inactivityWarningTimer);
    clearTimeout(inactivityTimeoutTimer);

    appendMessage("bot", "Since you haven't responded in a while, we'll end this session for now. Don't worry — you can always start a new chat anytime! We're here whenever you need us. 😊");

    // Add timestamp
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    appendSystemMessage(`Session ended at ${timeStr}`);

    // Disable input
    chatInput.disabled = true;
    chatSendBtn.disabled = true;
    chatInput.placeholder = "Session ended. Close and reopen to chat again.";
  }

  function startNewSession() {
    sessionEnded = false;
    conversationHistory = [];
    chatMessages.innerHTML = "";
    hasGreeted = false;
    chatInput.disabled = false;
    chatSendBtn.disabled = false;
    chatInput.placeholder = "Message...";
    greet();
    resetInactivityTimer();
  }

  // --- Send Message ---
  async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text || sessionEnded) return;



    appendMessage("user", text);
    chatInput.value = "";

    conversationHistory.push({ role: "user", content: text });

    showTyping();
    chatInput.disabled = true;
    chatSendBtn.disabled = true;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...conversationHistory,
          ],
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(
          errData?.error?.message || `API error ${res.status}`
        );
      }

      const data = await res.json();
      const reply =
        data.choices?.[0]?.message?.content ||
        "Sorry, I couldn't process that. Please try again!";

      conversationHistory.push({
        role: "assistant",
        content: reply,
      });

      removeTyping();
      appendMessage("bot", reply);
      resetInactivityTimer();
    } catch (err) {
      removeTyping();
      let errorMsg = "Something went wrong. Please try again.";
      
      // Handle Rate Limit (429) specifically
      if (err.message && err.message.includes("429")) {
        errorMsg = "I'm receiving too many messages right now! Please wait a moment and try again.";
      } else if (err.message) {
        errorMsg = err.message;
      }

      appendMessage("bot", `⚠️ ${errorMsg}`);
    } finally {
      chatInput.disabled = false;
      chatSendBtn.disabled = false;
      chatInput.focus();
    }
  }

  chatSendBtn.addEventListener("click", sendMessage);
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // --- FAQ Panel ---
  const faqBtn = document.getElementById("chatbot-faq-btn");
  const faqPanel = document.getElementById("chatbot-faq-panel");
  const faqCloseBtn = document.getElementById("chatbot-faq-close");
  const faqItems = document.querySelectorAll(".chatbot-faq-item");

  function toggleFaqPanel() {
    if (!faqPanel) return;
    const isVisible = !faqPanel.classList.contains("hidden");
    if (isVisible) {
      faqPanel.classList.add("hidden");
      if (faqBtn) {
        faqBtn.classList.remove("bg-primary-soft", "border-primary", "text-primary");
      }
    } else {
      faqPanel.classList.remove("hidden");
      if (faqBtn) {
        faqBtn.classList.add("bg-primary-soft", "border-primary", "text-primary");
      }
    }
  }

  if (faqBtn) {
    faqBtn.addEventListener("click", toggleFaqPanel);
  }
  if (faqCloseBtn) {
    faqCloseBtn.addEventListener("click", toggleFaqPanel);
  }

  // Clicking a FAQ item sends it as a user message
  faqItems.forEach(item => {
    item.addEventListener("click", () => {
      const question = item.dataset.faq;
      if (!question || sessionEnded) return;

      // Close the FAQ panel
      if (faqPanel) faqPanel.classList.add("hidden");
      if (faqBtn) {
        faqBtn.classList.remove("bg-primary-soft", "border-primary", "text-primary");
      }

      // Set the input and send
      chatInput.value = question;
      sendMessage();
    });
  });
})();