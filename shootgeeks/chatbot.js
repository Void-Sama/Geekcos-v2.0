// ===== ShootGeeks Chatbot =====
(function () {
  const WELCOME_MESSAGE =
    "👋 Welcome to ShootGeeks! I'm your virtual assistant, GeekTalk. I can help you with our services, photographers, booking a session, and more. How can I help you today?";

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
          messages: conversationHistory,
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