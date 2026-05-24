/**
 * ShootGeeks — Portfolio Gallery
 * Dynamically loads images, assigns randomised metadata, and filters via
 * sidebar (category) + pill sub-filters (style & photographer).
 *
 * Image source is controlled by cloudinary.js:
 *   - CLOUDINARY_CONFIG.enabled = false  → serve from local resources/photos/
 *   - CLOUDINARY_CONFIG.enabled = true   → serve from Cloudinary CDN
 */
(() => {
    /* ------------------------------------------------------------------ */
    /*  CONSTANTS                                                          */
    /* ------------------------------------------------------------------ */
    const CATEGORIES = ['Wedding', 'Debut', 'Corporate', 'Engagement', 'Birthday', 'Portrait'];
    const STYLES = ['Candid', 'Documentary', 'Emotional Moments', 'Timeless'];
    const PHOTOS_JSON = '../resources/photos/photos.json';
    const PHOTOS_DIR  = '../resources/photos/';
    const DATE_YEAR_MIN = 2022;
    const DATE_YEAR_MAX = 2026;

    /* ------------------------------------------------------------------ */
    /*  STATE                                                              */
    /* ------------------------------------------------------------------ */
    let allImages = [];   // { src, categories[], styles[], dateYear }
    let activeCategory = 'All';
    let activeStyle = 'All';
    let dateFromYear = null;    // 2022-2026 or null
    let dateToYear = null;

    /* ------------------------------------------------------------------ */
    /*  DOM REFS                                                           */
    /* ------------------------------------------------------------------ */
    const sidebar = document.getElementById('gallery-sidebar');
    const sidebarToggle = document.getElementById('gallery-sidebar-toggle');
    const sidebarLinks = document.querySelectorAll('.gallery-sidebar-link');
    const subFilterBar = document.getElementById('gallery-sub-filters');
    const stylePills = document.querySelectorAll('.pill-style');
    const galleryGrid = document.getElementById('gallery-grid');
    const imageCountEl = document.getElementById('gallery-image-count');

    // Date filter DOM refs (year only)
    const dateFromYearEl = document.getElementById('date-from-year');
    const dateToYearEl = document.getElementById('date-to-year');
    const dateClearBtn = document.getElementById('date-filter-clear');

    /* ------------------------------------------------------------------ */
    /*  HELPERS                                                            */
    /* ------------------------------------------------------------------ */
    /** Seed-style seeded random using filename hash for consistency within a session */
    function hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return hash;
    }

    /** Generate a deterministic random date for a given filename */
    function randomDateForFile(filename) {
        const h = Math.abs(hashCode(filename));
        const totalMonths = (DATE_YEAR_MAX - DATE_YEAR_MIN + 1) * 12; // 60 months
        const offset = h % totalMonths;
        const year = DATE_YEAR_MIN + Math.floor(offset / 12);
        const month = (offset % 12) + 1; // 1-12
        return { month, year };
    }

    /* ------------------------------------------------------------------ */
    /*  LOAD & RENDER                                                      */
    /* ------------------------------------------------------------------ */
    async function loadGallery() {
        const useCloudinary = typeof CLOUDINARY_CONFIG !== 'undefined' && CLOUDINARY_CONFIG.enabled;

        try {
            if (useCloudinary) {
                // ── Cloudinary: fetch image list via tag endpoint ──────────────
                // Requires: Settings → Security → "Resource list" to be UNCHECKED
                // Requires: images in Cloudinary to have the tag set in CLOUDINARY_CONFIG.tag
                const tagUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/list/${CLOUDINARY_CONFIG.tag}.json`;
                console.info(`[Gallery] Fetching image list from Cloudinary tag: "${CLOUDINARY_CONFIG.tag}"`);

                const res = await fetch(tagUrl);
                if (!res.ok) throw new Error(
                    `Cloudinary tag fetch failed (HTTP ${res.status}). ` +
                    `Make sure "Resource list" is enabled in Cloudinary Settings → Security, ` +
                    `and that your images have the tag "${CLOUDINARY_CONFIG.tag}".`
                );

                const data = await res.json();
                const resources = data.resources || [];
                console.info(`[Gallery] Cloudinary returned ${resources.length} image(s).`);

                // Fetch tags maps: We do parallel fetches for mainTags and secondaryTags
                // to map public_ids to the tags the user added in Cloudinary!
                const categoriesMap = {};
                const stylesMap = {};

                const fetchTagList = async (tag, map) => {
                    try {
                        const tr = await fetch(`https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/list/${encodeURIComponent(tag)}.json`);
                        if (tr.ok) {
                            const td = await tr.json();
                            const capitalized = tag.split(/[\s_]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                            (td.resources || []).forEach(r => {
                                if (!map[r.public_id]) map[r.public_id] = [];
                                map[r.public_id].push(capitalized);
                            });
                        }
                    } catch (e) {
                         // Ignore map errors to ensure list still loads even if a tag has no images yet
                    }
                };

                const tagFetches = [];
                if (CLOUDINARY_CONFIG.mainTags) {
                    CLOUDINARY_CONFIG.mainTags.forEach(t => tagFetches.push(fetchTagList(t, categoriesMap)));
                }
                if (CLOUDINARY_CONFIG.secondaryTags) {
                    CLOUDINARY_CONFIG.secondaryTags.forEach(t => tagFetches.push(fetchTagList(t, stylesMap)));
                }

                await Promise.all(tagFetches);

                allImages = resources.map(resource => {
                    // public_id example: "shootgeeks/portfolio/IMG_001"
                    const parts = resource.public_id.split('/');
                    const name  = `${parts[parts.length - 1]}.${resource.format}`;
                    const d     = randomDateForFile(name);

                    const categories = categoriesMap[resource.public_id] || ['Uncategorized'];
                    const styles = stylesMap[resource.public_id] || [];

                    return {
                        src:           buildCloudinaryUrl(resource.public_id, resource.format),
                        name,
                        categories,
                        styles,
                        dateYear:      d.year,
                    };
                });

            } else {
                // ── Local fallback: read filenames from photos.json ────────────
                console.info('[Gallery] Using local photos.json. Set CLOUDINARY_CONFIG.enabled = true for Cloudinary.');
                const res = await fetch(PHOTOS_JSON);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const filenames = await res.json();

                allImages = filenames.map(name => {
                    const d = randomDateForFile(name);
                    return {
                        src:           PHOTOS_DIR + name,
                        name,
                        categories:    ['Wedding'], // Local static fallback
                        styles:        [],
                        dateYear:      d.year,
                    };
                });
            }

            renderGrid();

        } catch (err) {
            console.error('[Gallery] Could not load images:', err);
            galleryGrid.innerHTML =
                `<p class="col-span-full text-center text-text-muted py-20">
                    Unable to load gallery images.<br>
                    <span class="text-xs opacity-60">${err.message}</span>
                 </p>`;
        }
    }


    function renderGrid() {
        galleryGrid.innerHTML = '';
        allImages.forEach((img, i) => {
            const card = document.createElement('div');
            card.className =
                'gallery-card group relative rounded-xl overflow-hidden cursor-pointer bg-gray-100 aspect-[4/3]';
            card.dataset.categories = img.categories.join(',');
            card.dataset.styles = img.styles.join(',');
            card.dataset.dateYear = img.dateYear;
            card.dataset.index = i;
            card.style.animationDelay = `${i * 30}ms`;

            card.innerHTML = `
        <img src="${img.src}" alt="${img.name}" loading="lazy"
             class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div class="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0
                    transition-transform duration-300">
          <div class="flex flex-wrap gap-1">
            ${img.categories.map(c =>
                `<span class="text-[10px] bg-primary/90 text-text-primary px-2 py-0.5 rounded-full font-medium">${c}</span>`
            ).join('')}
            ${img.styles.map(s =>
                `<span class="text-[10px] bg-surface/80 text-text-primary px-2 py-0.5 rounded-full font-medium">${s}</span>`
            ).join('')}
           </div>
           <p class="text-white/60 text-[10px] mt-0.5"><i class="ri-calendar-line"></i> ${img.dateYear}</p>
         </div>
       `;

            // Lightbox on click
            card.addEventListener('click', () => openLightbox(i));
            galleryGrid.appendChild(card);
        });

        applyFilters();
    }

    /* ------------------------------------------------------------------ */
    /*  FILTERING                                                          */
    /* ------------------------------------------------------------------ */
    function applyFilters() {
        const cards = galleryGrid.querySelectorAll('.gallery-card');
        let visibleCount = 0;

        // Year-only date range comparison
        const hasFrom = dateFromYear !== null;
        const hasTo = dateToYear !== null;

        cards.forEach(card => {
            const cats = (card.dataset.categories || '').split(',').filter(Boolean);
            const stls = (card.dataset.styles || '').split(',').filter(Boolean);

            const matchCat = activeCategory === 'All' || cats.includes(activeCategory);
            const matchStyle = activeStyle === 'All' || stls.includes(activeStyle);

            // Year range matching
            let matchDate = true;
            const cardYear = parseInt(card.dataset.dateYear, 10);

            if (hasFrom && cardYear < dateFromYear) matchDate = false;
            if (hasTo && cardYear > dateToYear) matchDate = false;

            if (matchCat && matchStyle && matchDate) {
                card.classList.remove('gallery-card-hidden');
                card.classList.add('gallery-card-visible');
                visibleCount++;
            } else {
                card.classList.remove('gallery-card-visible');
                card.classList.add('gallery-card-hidden');
            }
        });

        if (imageCountEl) {
            imageCountEl.textContent = `${visibleCount} photo${visibleCount !== 1 ? 's' : ''}`;
        }
    }

    /* ------------------------------------------------------------------ */
    /*  SIDEBAR                                                            */
    /* ------------------------------------------------------------------ */
    const mobileCatPills = document.querySelectorAll('.gallery-mobile-cat');

    // Shared function: select a category from either sidebar or mobile pills
    function selectCategory(category) {
        activeCategory = category;

        // Update sidebar active state
        sidebarLinks.forEach(l => l.classList.remove('gallery-sidebar-link-active'));
        sidebarLinks.forEach(l => {
            if (l.dataset.category === category) l.classList.add('gallery-sidebar-link-active');
        });

        // Update mobile pill active state
        mobileCatPills.forEach(p => p.classList.remove('gallery-pill-active'));
        mobileCatPills.forEach(p => {
            if (p.dataset.category === category) p.classList.add('gallery-pill-active');
        });

        // Reset sub-filters when switching category
        activeStyle = 'All';
        resetPills(stylePills);

        // Show/hide sub-filter bar
        if (subFilterBar) {
            subFilterBar.classList.toggle('hidden', activeCategory === 'All');
        }

        applyFilters();
    }

    // Toggle collapsed/expanded
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('gallery-sidebar-collapsed');
        });
    }

    // Sidebar category clicks
    sidebarLinks.forEach(link => {
        link.addEventListener('click', () => selectCategory(link.dataset.category));
    });

    // Mobile category pill clicks
    mobileCatPills.forEach(pill => {
        pill.addEventListener('click', () => selectCategory(pill.dataset.category));
    });

    /* ------------------------------------------------------------------ */
    /*  PILL SUB-FILTERS                                                   */
    /* ------------------------------------------------------------------ */
    function resetPills(pills) {
        pills.forEach(p => p.classList.remove('gallery-pill-active'));
        if (pills.length) pills[0].classList.add('gallery-pill-active');
    }

    stylePills.forEach(pill => {
        pill.addEventListener('click', () => {
            stylePills.forEach(p => p.classList.remove('gallery-pill-active'));
            pill.classList.add('gallery-pill-active');
            activeStyle = pill.dataset.value;
            applyFilters();
        });
    });

    /* ------------------------------------------------------------------ */
    /*  DATE RANGE FILTER (YEAR ONLY)                                      */
    /* ------------------------------------------------------------------ */
    function readDateFilters() {
        dateFromYear = dateFromYearEl && dateFromYearEl.value ? parseInt(dateFromYearEl.value, 10) : null;
        dateToYear = dateToYearEl && dateToYearEl.value ? parseInt(dateToYearEl.value, 10) : null;
        applyFilters();
    }

    [dateFromYearEl, dateToYearEl].forEach(el => {
        if (el) el.addEventListener('change', readDateFilters);
    });

    if (dateClearBtn) {
        dateClearBtn.addEventListener('click', () => {
            if (dateFromYearEl) dateFromYearEl.value = '';
            if (dateToYearEl) dateToYearEl.value = '';
            readDateFilters();
        });
    }

    /* ------------------------------------------------------------------ */
    /*  LIGHTBOX                                                           */
    /* ------------------------------------------------------------------ */
    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    const lightboxCounter = document.getElementById('lightbox-counter');
    let currentLightboxIndex = 0;

    function getVisibleIndices() {
        return Array.from(galleryGrid.querySelectorAll('.gallery-card:not(.gallery-card-hidden)'))
            .map(c => parseInt(c.dataset.index, 10));
    }

    function openLightbox(index) {
        currentLightboxIndex = index;
        updateLightboxImage();
        if (lightbox) lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
        // Hide chatbot when lightbox is open
        const chatBtn = document.getElementById('chatbot-toggle-btn');
        const chatWin = document.getElementById('chatbot-window');
        if (chatBtn) chatBtn.style.display = 'none';
        if (chatWin) chatWin.style.display = 'none';
    }

    function closeLightbox() {
        if (lightbox) lightbox.classList.remove('open');
        document.body.style.overflow = '';
        // Restore chatbot when lightbox closes
        const chatBtn = document.getElementById('chatbot-toggle-btn');
        const chatWin = document.getElementById('chatbot-window');
        if (chatBtn) chatBtn.style.display = '';
        if (chatWin) chatWin.style.display = '';
    }

    function updateLightboxImage() {
        if (!lightboxImg || !allImages[currentLightboxIndex]) return;
        lightboxImg.src = allImages[currentLightboxIndex].src;
        lightboxImg.alt = allImages[currentLightboxIndex].name;
        const visible = getVisibleIndices();
        const pos = visible.indexOf(currentLightboxIndex) + 1;
        if (lightboxCounter) lightboxCounter.textContent = `${pos} / ${visible.length}`;
    }

    function navigateLightbox(dir) {
        const visible = getVisibleIndices();
        if (!visible.length) return;
        let pos = visible.indexOf(currentLightboxIndex);
        pos = (pos + dir + visible.length) % visible.length;
        currentLightboxIndex = visible[pos];
        updateLightboxImage();
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
    if (lightboxNext) lightboxNext.addEventListener('click', () => navigateLightbox(1));
    if (lightbox) {
        lightbox.addEventListener('click', e => {
            if (e.target === lightbox) closeLightbox();
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', e => {
        if (!lightbox || !lightbox.classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
    });

    /* ------------------------------------------------------------------ */
    /*  INIT                                                               */
    /* ------------------------------------------------------------------ */
    // Only load gallery when portfolio tab becomes active
    const portfolioTab = document.getElementById('portfolio');
    let galleryLoaded = false;

    // Use MutationObserver to detect when portfolio tab becomes visible
    if (portfolioTab) {
        const observer = new MutationObserver(() => {
            if (portfolioTab.classList.contains('active') && !galleryLoaded) {
                galleryLoaded = true;
                loadGallery();
            }
        });
        observer.observe(portfolioTab, { attributes: true, attributeFilter: ['class'] });

        // Also check immediately
        if (portfolioTab.classList.contains('active') && !galleryLoaded) {
            galleryLoaded = true;
            loadGallery();
        }
    }
})();
