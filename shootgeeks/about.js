// ===== ABOUT US — REVIEW STAR FILTER =====
(function () {
  const filterContainer = document.getElementById('about-star-filters');
  const reviewsGrid = document.getElementById('about-reviews-grid');
  const noReviewsMsg = document.getElementById('about-no-reviews');

  if (!filterContainer || !reviewsGrid) return;

  const pills = filterContainer.querySelectorAll('.about-filter-pill');
  const cards = reviewsGrid.querySelectorAll('.about-review-card');

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      // Update active pill
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filter = pill.dataset.filter;
      let visibleCount = 0;

      cards.forEach(card => {
        const stars = card.dataset.stars;
        const show = filter === 'all' || stars === filter;

        if (show) {
          card.style.display = '';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      // Toggle no-reviews message
      if (noReviewsMsg) {
        noReviewsMsg.classList.toggle('hidden', visibleCount > 0);
      }
    });
  });
})();

// ===== ABOUT US — REVIEW SUBMISSION FORM =====
(function () {
  const form = document.getElementById('about-review-form');
  const starPicker = document.getElementById('review-star-picker');
  const ratingInput = document.getElementById('review-rating');

  if (!form || !starPicker || !ratingInput) return;

  const starBtns = starPicker.querySelectorAll('.review-star-btn');

  // ── "Other" Event Type Toggle ──
  const eventSelect = document.getElementById('review-event');
  const eventOtherInput = document.getElementById('review-event-other');

  if (eventSelect && eventOtherInput) {
    eventSelect.addEventListener('change', () => {
      if (eventSelect.value === 'Other') {
        eventOtherInput.classList.remove('hidden');
        eventOtherInput.required = true;
        eventOtherInput.focus();
      } else {
        eventOtherInput.classList.add('hidden');
        eventOtherInput.required = false;
        eventOtherInput.value = '';
      }
    });
  }

  // ── Feedback Tags Data ──
  const POSITIVE_TAGS = [
    'Professional and easy to work with',
    'Friendly and approachable',
    'Good communication',
    'Followed instructions well',
    'Made us feel comfortable',
    'Arrived on time',
    'Fast turnaround of photos',
    'Delivered as promised',
    'Excellent photo quality',
    'Great editing/style',
    'Creative shots and angles',
    'Captured important moments well',
    'Good lighting and composition',
    'Worth the price',
    'Exceeded expectations',
    'Would book again',
    'Highly recommended',
  ];

  const NEUTRAL_TAGS = [
    'Okay experience overall',
    'Photos were decent but not exceptional',
    'Could improve communication',
    'Turnaround time was acceptable',
  ];

  const NEGATIVE_TAGS = [
    'Unprofessional behavior',
    'Poor communication',
    "Didn't follow instructions",
    'Made the session uncomfortable',
    'Late arrival',
    'Delayed photo delivery',
    'Missed schedule or rushed shoot',
    'Poor photo quality',
    'Over/under edited photos',
    'Missed important moments',
    'Lack of creativity',
    'Bad lighting/composition',
    'Equipment issues affected shoot',
    'Disorganized workflow',
    'Unexpected extra charges',
    "Didn't match agreed style",
  ];

  // ── Feedback Tags UI ──
  const feedbackTagsSection = document.getElementById('review-feedback-tags');
  const tagsContainer = document.getElementById('review-tags-container');
  let selectedTags = new Set();

  function renderFeedbackTags(rating) {
    if (!feedbackTagsSection || !tagsContainer) return;

    // Choose tags based on rating
    let tags = [];
    if (rating >= 4) {
      tags = POSITIVE_TAGS;
    } else if (rating === 3) {
      tags = NEUTRAL_TAGS;
    } else if (rating >= 1) {
      tags = NEGATIVE_TAGS;
    }

    // Reset
    selectedTags.clear();
    tagsContainer.innerHTML = '';

    if (tags.length === 0 || rating === 0) {
      feedbackTagsSection.classList.add('hidden');
      return;
    }

    feedbackTagsSection.classList.remove('hidden');

    // Color scheme by sentiment (using inline styles for dynamic elements)
    let baseColor, hoverBg, activeBg, activeBorder, activeText;
    if (rating >= 4) {
      baseColor = 'rgba(16, 185, 129, 0.55)';   // emerald
      hoverBg   = 'rgba(16, 185, 129, 0.1)';
      activeBg  = 'rgba(16, 185, 129, 0.2)';
      activeBorder = 'rgba(16, 185, 129, 0.9)';
      activeText = '#6ee7b7';
    } else if (rating === 3) {
      baseColor = 'rgba(245, 158, 11, 0.55)';   // amber
      hoverBg   = 'rgba(245, 158, 11, 0.1)';
      activeBg  = 'rgba(245, 158, 11, 0.2)';
      activeBorder = 'rgba(245, 158, 11, 0.9)';
      activeText = '#fbbf24';
    } else {
      baseColor = 'rgba(239, 68, 68, 0.55)';    // red
      hoverBg   = 'rgba(239, 68, 68, 0.1)';
      activeBg  = 'rgba(239, 68, 68, 0.2)';
      activeBorder = 'rgba(239, 68, 68, 0.9)';
      activeText = '#fca5a5';
    }

    tags.forEach(tag => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = tag;
      btn.style.cssText = `
        font-size: 0.75rem;
        padding: 0.375rem 0.875rem;
        border-radius: 9999px;
        border: 1.5px solid ${baseColor};
        color: ${baseColor};
        background: transparent;
        cursor: pointer;
        transition: all 0.2s ease;
        user-select: none;
      `;

      // Hover effects
      btn.addEventListener('mouseenter', () => {
        if (!selectedTags.has(tag)) {
          btn.style.background = hoverBg;
          btn.style.borderColor = activeBorder;
          btn.style.transform = 'translateY(-1px)';
        }
      });
      btn.addEventListener('mouseleave', () => {
        if (!selectedTags.has(tag)) {
          btn.style.background = 'transparent';
          btn.style.borderColor = baseColor;
          btn.style.transform = 'translateY(0)';
        }
      });

      // Toggle selection
      btn.addEventListener('click', () => {
        if (selectedTags.has(tag)) {
          selectedTags.delete(tag);
          btn.style.background = 'transparent';
          btn.style.borderColor = baseColor;
          btn.style.color = baseColor;
          btn.style.transform = 'translateY(0)';
        } else {
          selectedTags.add(tag);
          btn.style.background = activeBg;
          btn.style.borderColor = activeBorder;
          btn.style.color = activeText;
          btn.style.transform = 'translateY(-1px)';
        }
      });

      tagsContainer.appendChild(btn);
    });
  }

  // ── Star Picker ──
  function setStars(value) {
    ratingInput.value = value;
    starBtns.forEach(btn => {
      const v = parseInt(btn.dataset.value, 10);
      if (v <= value) {
        btn.classList.add('text-yellow-400');
        btn.classList.remove('text-border');
      } else {
        btn.classList.remove('text-yellow-400');
        btn.classList.add('text-border');
      }
    });

    // Update feedback tags when rating changes
    renderFeedbackTags(value);
  }

  starBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setStars(parseInt(btn.dataset.value, 10));
    });
  });

  // ── Reference Number Generator ──
  function generateReviewRef() {
    const storageKey = 'sg_used_refs_review';
    let used = [];
    try { used = JSON.parse(sessionStorage.getItem(storageKey) || '[]'); } catch (_) {}
    let num;
    do {
      num = Math.floor(100000 + Math.random() * 900000);
    } while (used.includes(num));
    used.push(num);
    try { sessionStorage.setItem(storageKey, JSON.stringify(used)); } catch (_) {}
    return `SG-2026-${num}`;
  }

  // ── Review Success Modal ──
  const reviewModal       = document.getElementById('review-success-modal');
  const reviewModalRef    = document.getElementById('review-modal-ref');
  const reviewModalStars  = document.getElementById('review-modal-stars');
  const reviewModalName   = document.getElementById('review-modal-reviewer');
  const reviewModalEvent  = document.getElementById('review-modal-event');
  const reviewModalDone   = document.getElementById('review-modal-done');
  const reviewModalHome   = document.getElementById('review-modal-home');
  const reviewModalCopy   = document.getElementById('review-modal-copy');

  function openReviewModal(name, event, rating) {
    if (!reviewModal) return;

    const ref = generateReviewRef();
    if (reviewModalRef)   reviewModalRef.textContent   = ref;
    if (reviewModalName)  reviewModalName.textContent  = name || '—';
    if (reviewModalEvent) reviewModalEvent.textContent = event || '—';

    // Render stars
    if (reviewModalStars) {
      reviewModalStars.innerHTML = Array.from({ length: 5 }, (_, i) =>
        `<i class="${i < rating ? 'sg-modal-star-filled' : 'sg-modal-star-empty'} ri-star-fill"></i>`
      ).join('');
    }

    reviewModal.classList.add('sg-modal-open');
    document.body.style.overflow = 'hidden';
    reviewModal._currentRef = ref;
  }

  function closeReviewModal() {
    if (!reviewModal) return;
    reviewModal.classList.remove('sg-modal-open');
    document.body.style.overflow = '';
  }

  if (reviewModalDone) reviewModalDone.addEventListener('click', closeReviewModal);

  if (reviewModalHome) {
    reviewModalHome.addEventListener('click', () => {
      closeReviewModal();
      if (typeof switchTab === 'function') {
        switchTab('#main');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  if (reviewModalCopy) {
    reviewModalCopy.addEventListener('click', () => {
      const ref = reviewModal ? reviewModal._currentRef : (reviewModalRef ? reviewModalRef.textContent : '');
      if (ref && navigator.clipboard) {
        navigator.clipboard.writeText(ref).then(() => {
          reviewModalCopy.innerHTML = '<i class="ri-check-line"></i> Copied!';
          setTimeout(() => {
            reviewModalCopy.innerHTML = '<i class="ri-file-copy-line"></i> Copy';
          }, 2000);
        });
      }
    });
  }

  if (reviewModal) {
    reviewModal.addEventListener('click', (e) => {
      if (e.target === reviewModal) closeReviewModal();
    });
  }

  // ── Input Validation / Filtering ──
  const reviewNameInput = document.getElementById('review-name');
  if (reviewNameInput) {
    reviewNameInput.addEventListener('input', (e) => {
      // Automatically strip numbers and special characters not typical in names
      e.target.value = e.target.value.replace(/[^A-Za-z\s\-'.]/g, '');
    });
  }

  const reviewEventOtherInput = document.getElementById('review-event-other');
  if (reviewEventOtherInput) {
    reviewEventOtherInput.addEventListener('input', (e) => {
      // Automatically strip numbers and special characters from custom event type
      e.target.value = e.target.value.replace(/[^A-Za-z\s\-'.]/g, '');
    });
  }

  // ── Form Submit ──
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = reviewNameInput ? reviewNameInput.value.trim() : '';
    const eventSelect = document.getElementById('review-event');
    const eventOther = document.getElementById('review-event-other');
    let event = eventSelect ? eventSelect.value : '';
    if (event === 'Other' && eventOther) {
      event = eventOther.value.trim() || 'Other';
    }
    const rating = parseInt(ratingInput.value, 10);
    const comment = document.getElementById('review-comment').value.trim();

    if (!name || !event || !rating || !comment) {
      alert('Please fill out all fields and select a star rating.');
      return;
    }

    // Strict validation check on submit to ensure name contains valid alphabet characters
    const nameRegex = /^[A-Za-z\s\-'.]+$/;
    if (!nameRegex.test(name)) {
      alert('Please enter a valid name using only letters, spaces, hyphens, or apostrophes.');
      if (reviewNameInput) reviewNameInput.focus();
      return;
    }

    // Validate event type if "Other" was selected
    if (eventSelect && eventSelect.value === 'Other') {
      if (!nameRegex.test(event)) {
        alert('Please enter a valid event type using only letters, spaces, hyphens, or apostrophes.');
        if (eventOther) eventOther.focus();
        return;
      }
    }

    // Open the review success modal
    openReviewModal(name, event, rating);

    // Reset form
    form.reset();
    setStars(0);
    if (eventOtherInput) {
      eventOtherInput.classList.add('hidden');
      eventOtherInput.required = false;
      eventOtherInput.value = '';
    }
    if (feedbackTagsSection) feedbackTagsSection.classList.add('hidden');
    selectedTags.clear();
  });


  // ── Warn on reload if form has data ──
  function hasReviewData() {
    const name = document.getElementById('review-name');
    const comment = document.getElementById('review-comment');
    const rating = parseInt(ratingInput.value, 10);
    return (name && name.value.trim()) || (comment && comment.value.trim()) || rating > 0;
  }

  window.addEventListener('beforeunload', (e) => {
    if (hasReviewData()) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
})();
