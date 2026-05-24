const tabs = document.querySelectorAll('[data-tab-target]');
const tabContents = document.querySelectorAll('[data-tab-content]');
const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');
const menuIcon = document.getElementById('menu-icon');

// Function to switch tabs
function switchTab(targetId) {
  // Hide all tab contents
  tabContents.forEach(content => {
    content.classList.remove('active');
  });

  // Remove active class from all nav items
  tabs.forEach(tab => {
    tab.classList.remove('active');
  });

  // Show the selected tab content
  const targetContent = document.querySelector(targetId);
  if (targetContent) {
    targetContent.classList.add('active');
  }

  // Highlight the corresponding nav item
  const correspondingTab = Array.from(tabs).find(
    tab => tab.dataset.tabTarget === targetId
  );
  if (correspondingTab) {
    correspondingTab.classList.add('active');
  }

  // Save the active tab to localStorage
  localStorage.setItem('activeTab', targetId);
}

// Tab click event listeners
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const targetId = tab.dataset.tabTarget;
    switchTab(targetId);
    // Close mobile menu when a nav item is clicked
    if (window.innerWidth < 1145) {
      navMenu.classList.add('max-[1144px]:hidden');
      menuIcon.classList.replace('ri-close-line', 'ri-menu-line');
    }
  });
});

// Mobile menu toggle
if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    const isHidden = navMenu.classList.toggle('max-[1144px]:hidden');
    menuIcon.classList.toggle('ri-menu-line', isHidden);
    menuIcon.classList.toggle('ri-close-line', !isHidden);
  });
}

// On page load, restore the saved tab or default to home
window.addEventListener('DOMContentLoaded', () => {
  const savedTab = localStorage.getItem('activeTab') || '#main';
  switchTab(savedTab);
});

// ===== FEATURED PHOTOS CAROUSEL =====
(() => {
  const carousel = document.getElementById('featured-carousel');
  const prevBtn = document.getElementById('featured-prev');
  const nextBtn = document.getElementById('featured-next');
  if (!carousel) return;

  // Fallback photos if Cloudinary is unavailable
  const FALLBACK_PHOTOS = [
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=600&fit=crop',
  ];

  let featuredPhotos = [];
  let currentIndex = 0;
  let autoPlayTimer;

  // Position map: which data-pos each offset from center gets
  const POS_MAP = ['far-left', 'left', 'center', 'right', 'far-right'];

  function buildCards(photos) {
    carousel.innerHTML = '';
    photos.forEach((src, i) => {
      const card = document.createElement('div');
      card.className = 'featured-card';
      card.dataset.index = i;
      card.innerHTML = `<img src="${src}" alt="Featured photo ${i + 1}" loading="lazy">`;
      // Click side cards to navigate
      card.addEventListener('click', () => {
        const pos = card.dataset.pos;
        if (pos === 'left' || pos === 'far-left') navigate(-1);
        else if (pos === 'right' || pos === 'far-right') navigate(1);
      });
      carousel.appendChild(card);
    });
    arrangeCards();
  }

  function arrangeCards() {
    const cards = carousel.querySelectorAll('.featured-card');
    const total = cards.length;
    cards.forEach(card => {
      card.dataset.pos = 'hidden';
      card.style.opacity = '0';
      card.style.pointerEvents = 'none';
    });

    // Show 5 cards centered around currentIndex
    for (let offset = -2; offset <= 2; offset++) {
      let idx = (currentIndex + offset + total) % total;
      const card = cards[idx];
      if (card) {
        card.dataset.pos = POS_MAP[offset + 2];
        card.style.opacity = '';
        card.style.pointerEvents = '';
      }
    }
  }

  function navigate(dir) {
    const total = carousel.querySelectorAll('.featured-card').length;
    if (total === 0) return;
    currentIndex = (currentIndex + dir + total) % total;
    arrangeCards();
    resetAutoPlay();
  }

  function resetAutoPlay() {
    clearInterval(autoPlayTimer);
    autoPlayTimer = setInterval(() => navigate(1), 4000);
  }

  // Fetch from Cloudinary
  async function loadFeaturedPhotos() {
    const useCloudinary = typeof CLOUDINARY_CONFIG !== 'undefined' && CLOUDINARY_CONFIG.enabled;
    if (!useCloudinary) {
      featuredPhotos = FALLBACK_PHOTOS;
      buildCards(featuredPhotos);
      resetAutoPlay();
      return;
    }

    try {
      // Try 'featured' tag first (so user can curate which photos appear)
      // Fall back to 'portfolio' tag if 'featured' has no images
      let resources = [];
      const tags = ['featured', CLOUDINARY_CONFIG.tag];

      for (const tag of tags) {
        try {
          const res = await fetch(
            `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/list/${tag}.json`
          );
          if (res.ok) {
            const data = await res.json();
            resources = data.resources || [];
            if (resources.length > 0) {
              console.info(`[Featured] Using "${tag}" tag (${resources.length} images).`);
              break;
            }
          }
        } catch (_) { }
      }

      if (resources.length === 0) throw new Error('No images found');

      // Exclude portrait-tagged images
      try {
        const pRes = await fetch(
          `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/list/portrait.json`
        );
        if (pRes.ok) {
          const pData = await pRes.json();
          const portraitIds = new Set((pData.resources || []).map(r => r.public_id));
          resources = resources.filter(r => !portraitIds.has(r.public_id));
        }
      } catch (_) { }

      // Shuffle and pick up to 10
      for (let i = resources.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [resources[i], resources[j]] = [resources[j], resources[i]];
      }

      featuredPhotos = resources.slice(0, 10).map(r =>
        buildCloudinaryUrl(r.public_id, r.format, 'f_auto,q_auto,w_800,c_fill,g_auto')
      );

    } catch (err) {
      console.warn('[Featured] Cloudinary failed, using fallback.', err.message);
      featuredPhotos = FALLBACK_PHOTOS;
    }

    buildCards(featuredPhotos);
    resetAutoPlay();
  }

  // Navigation buttons
  if (prevBtn) prevBtn.addEventListener('click', () => navigate(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => navigate(1));

  // Keyboard support when on home tab
  document.addEventListener('keydown', e => {
    const homeTab = document.getElementById('main');
    if (!homeTab || !homeTab.classList.contains('active')) return;
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });

  loadFeaturedPhotos();
})();

// Photographer slideshow
const photographerNames = document.querySelectorAll('.js-photographer-name');
const photographerTitleEl = document.getElementById('photographer-title');
const photographerCaptionEl = document.getElementById('photographer-caption');
const photographerPhotoMainEl = document.getElementById('photographer-photo-main');

// Base slide data — imageMain will be filled from Cloudinary at runtime
const photographerSlides = [
  {
    name: 'Jezreel Luchavez',
    title: 'Professional Photography and Videography You Can Trust',
    caption: 'Showcasing every project with creativity and passion.',
    imageMain: '../resources/photos/random1.jpg',       // local fallback
  },
  {
    name: 'Humprey',
    title: 'Creative vision for every shoot.',
    caption: 'Blending technical skill with storytelling in every frame.',
    imageMain: '../resources/photos/random2.jpg',
  },
  {
    name: 'Elybert',
    title: 'Capturing emotions that last.',
    caption: 'From quiet moments to grand celebrations, nothing is missed.',
    imageMain: '../resources/photos/random3.jpg',
  },
  {
    name: 'John Keenan',
    title: 'Light, color, and composition.',
    caption: 'Crafting timeless visuals for your most important days.',
    imageMain: '../resources/photos/random4.jpg',
  },
  {
    name: 'Jeffrey',
    title: 'Every angle, every detail.',
    caption: 'Professional coverage for events, portraits, and more.',
    imageMain: '../resources/photos/random5.jpg',
  },
];

let photographerIndex = 0;
let photographerTimerId;

/**
 * Fetch random portfolio images from Cloudinary and assign them
 * to each photographer's main photo. Falls back to local images
 * if Cloudinary is disabled or the fetch fails.
 */
async function loadPhotographerImages() {
  const useCloudinary = typeof CLOUDINARY_CONFIG !== 'undefined' && CLOUDINARY_CONFIG.enabled;
  if (!useCloudinary) return;

  try {
    const tagUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/list/${CLOUDINARY_CONFIG.tag}.json`;
    const res = await fetch(tagUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    let resources = data.resources || [];
    if (resources.length === 0) return;

    // Fetch portrait tag list and exclude those images (we need horizontal only)
    try {
      const portraitRes = await fetch(`https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/list/portrait.json`);
      if (portraitRes.ok) {
        const portraitData = await portraitRes.json();
        const portraitIds = new Set((portraitData.resources || []).map(r => r.public_id));
        resources = resources.filter(r => !portraitIds.has(r.public_id));
      }
    } catch (_) { /* ignore — just skip filtering if portrait tag fetch fails */ }

    if (resources.length === 0) return;

    // Shuffle the resource list (Fisher-Yates)
    for (let i = resources.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [resources[i], resources[j]] = [resources[j], resources[i]];
    }

    // Assign a random Cloudinary image to each photographer
    photographerSlides.forEach((slide, idx) => {
      const resource = resources[idx % resources.length];
      slide.imageMain = buildCloudinaryUrl(resource.public_id, resource.format, 'f_auto,q_auto,w_800,c_fill,g_auto');
    });

    console.info(`[Photographers] Loaded ${resources.length} Cloudinary images, assigned 6 random photos.`);

    // Re-render the currently active photographer with the new image
    setActivePhotographer(photographerIndex);

  } catch (err) {
    console.warn('[Photographers] Cloudinary fetch failed, using local fallback images.', err.message);
  }
}

function setActivePhotographer(index) {
  photographerIndex = index;

  // highlight active name
  photographerNames.forEach((el, i) => {
    if (i === index) {
      el.classList.remove('text-gray-400');
      el.classList.add('text-text-primary');
    } else {
      el.classList.remove('text-text-primary');
      el.classList.add('text-gray-400');
    }
  });

  const slide = photographerSlides[index];
  if (!slide) return;

  if (photographerTitleEl) photographerTitleEl.textContent = slide.title;
  if (photographerCaptionEl) photographerCaptionEl.textContent = slide.caption;

  if (photographerPhotoMainEl && slide.imageMain) {
    photographerPhotoMainEl.src = slide.imageMain;
    photographerPhotoMainEl.alt = slide.name;
  }
}

function startPhotographerSlideshow() {
  if (!photographerNames.length) return;
  clearInterval(photographerTimerId);
  photographerTimerId = setInterval(() => {
    const next = (photographerIndex + 1) % photographerSlides.length;
    setActivePhotographer(next);
  }, 3000);
}

if (
  photographerNames.length &&
  photographerTitleEl &&
  photographerCaptionEl &&
  photographerPhotoMainEl
) {
  photographerNames.forEach((el, index) => {
    el.addEventListener('click', () => {
      setActivePhotographer(index);
      startPhotographerSlideshow(); // reset timer after manual click
    });
  });

  // initial state with local fallbacks, then upgrade to Cloudinary
  setActivePhotographer(0);
  startPhotographerSlideshow();
  loadPhotographerImages();
}

// ===== POLAROID GRID — Portrait Photos from Cloudinary =====
(async () => {
  const grid = document.getElementById('polaroid-grid');
  if (!grid) return;

  const frames = grid.querySelectorAll('.polaroid-frame');
  if (frames.length === 0) return;

  const PORTRAIT_FALLBACKS = [
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=533&fit=crop',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=533&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=533&fit=crop',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=533&fit=crop',
  ];

  let photos = [];

  const useCloudinary = typeof CLOUDINARY_CONFIG !== 'undefined' && CLOUDINARY_CONFIG.enabled;

  if (useCloudinary) {
    try {
      const res = await fetch(
        `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/list/portrait.json`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      let resources = data.resources || [];
      if (resources.length === 0) throw new Error('No portrait images found');

      // Shuffle (Fisher-Yates)
      for (let i = resources.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [resources[i], resources[j]] = [resources[j], resources[i]];
      }

      // Pick 4 images
      photos = resources.slice(0, 4).map(r =>
        buildCloudinaryUrl(r.public_id, r.format, 'f_auto,q_auto,w_500,h_667,c_fill,g_auto')
      );

      console.info(`[Polaroid] Loaded ${photos.length} portrait photos from Cloudinary.`);
    } catch (err) {
      console.warn('[Polaroid] Cloudinary fetch failed, using fallbacks.', err.message);
      photos = PORTRAIT_FALLBACKS;
    }
  } else {
    photos = PORTRAIT_FALLBACKS;
  }

  // Populate the frames
  frames.forEach((frame, i) => {
    const src = photos[i % photos.length];
    const img = frame.querySelector('.polaroid-img-wrapper img');
    const wrapper = frame.querySelector('.polaroid-img-wrapper');
    if (img) {
      img.onload = () => {
        img.classList.add('loaded');
        if (wrapper) wrapper.classList.add('loaded');
      };
      img.onerror = () => {
        // If Cloudinary image fails, use fallback
        img.src = PORTRAIT_FALLBACKS[i % PORTRAIT_FALLBACKS.length];
      };
      img.src = src;
    }
  });
})();
