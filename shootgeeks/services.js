// ===== SERVICES.JS — Modal, Gallery & Packages Logic =====

// ——— Reusable Modal Logic ———
function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    document.body.style.overflow = 'hidden';
    modal.classList.add('open');
    // Hide chatbot when modal is open
    const chatBtn = document.getElementById('chatbot-toggle-btn');
    const chatWin = document.getElementById('chatbot-window');
    if (chatBtn) chatBtn.style.display = 'none';
    if (chatWin) chatWin.style.display = 'none';
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
    // Restore chatbot when modal closes
    const chatBtn = document.getElementById('chatbot-toggle-btn');
    const chatWin = document.getElementById('chatbot-window');
    if (chatBtn) chatBtn.style.display = '';
    if (chatWin) chatWin.style.display = '';
}

// Close modals on overlay click (using event delegation on document)
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay') && e.target.classList.contains('open')) {
        e.target.classList.remove('open');
        document.body.style.overflow = '';
    }
});

// Close modals on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.open').forEach(m => {
            m.classList.remove('open');
            document.body.style.overflow = '';
        });
    }
});

// ——— Gallery Data (Unsplash fallbacks — replaced at runtime by Cloudinary) ———
const EVENT_CATEGORIES = ['wedding', 'corporate', 'birthday', 'portrait'];

const galleryData = {
    wedding: [
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=900&h=600&fit=crop',
        'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=900&h=600&fit=crop',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&h=600&fit=crop',
        'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=900&h=600&fit=crop',
        'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=900&h=600&fit=crop',
    ],
    corporate: [
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&h=600&fit=crop',
        'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=900&h=600&fit=crop',
        'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=900&h=600&fit=crop',
        'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=900&h=600&fit=crop',
        'https://images.unsplash.com/photo-1591115765373-5f9cf1da1703?w=900&h=600&fit=crop',
    ],
    birthday: [
        'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=900&h=600&fit=crop',
        'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=900&h=600&fit=crop',
        'https://images.unsplash.com/photo-1464349153159-4e4ab92a3b5d?w=900&h=600&fit=crop',
        'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=900&h=600&fit=crop',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&h=600&fit=crop',
    ],
    portrait: [
        'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&h=600&fit=crop',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&h=600&fit=crop',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&h=600&fit=crop',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=900&h=600&fit=crop',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&h=600&fit=crop',
    ],
};

let currentGallery = [];
let currentImageIndex = 0;

/**
 * Fetch 5 random photos from Cloudinary for each event category.
 * Uses the first photo as the card background image.
 * Falls back to Unsplash if Cloudinary is disabled or fetch fails.
 */
async function loadEventCoverageImages() {
    const useCloudinary = typeof CLOUDINARY_CONFIG !== 'undefined' && CLOUDINARY_CONFIG.enabled;
    if (!useCloudinary) return;

    const fetchCategory = async (tag) => {
        try {
            const res = await fetch(
                `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/list/${tag}.json`
            );
            if (!res.ok) return;

            const data = await res.json();
            const resources = data.resources || [];
            if (resources.length === 0) return;

            // Shuffle (Fisher-Yates)
            for (let i = resources.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [resources[i], resources[j]] = [resources[j], resources[i]];
            }

            // Pick up to 5 random photos
            const picked = resources.slice(0, 5).map(r =>
                buildCloudinaryUrl(r.public_id, r.format, 'f_auto,q_auto,w_900,c_fill,g_auto')
            );

            // Update gallery data for this category
            galleryData[tag] = picked;

            // Update the card background image with the first photo
            const cardImg = document.getElementById(`event-card-img-${tag}`);
            if (cardImg && picked.length > 0) {
                cardImg.src = picked[0];
            }

            console.info(`[Event Coverage] Loaded ${picked.length} Cloudinary images for "${tag}".`);
        } catch (err) {
            console.warn(`[Event Coverage] Cloudinary fetch failed for "${tag}", using fallback.`, err.message);
        }
    };

    // Fetch all categories in parallel
    await Promise.all(EVENT_CATEGORIES.map(fetchCategory));
}

function openGallery(category) {
    currentGallery = galleryData[category] || [];
    currentImageIndex = 0;
    if (currentGallery.length === 0) return;
    updateGalleryImage();
    openModal('gallery-modal');
}

function closeGallery() {
    closeModal('gallery-modal');
}

function updateGalleryImage() {
    const img = document.getElementById('gallery-image');
    const counter = document.getElementById('gallery-counter');
    if (img) img.src = currentGallery[currentImageIndex];
    if (counter) counter.textContent = `${currentImageIndex + 1} / ${currentGallery.length}`;
}

function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % currentGallery.length;
    updateGalleryImage();
}

function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + currentGallery.length) % currentGallery.length;
    updateGalleryImage();
}

// Load Cloudinary images for Event Coverage on page load
loadEventCoverageImages();

// ——— Packages Data ———
const packagesData = [
    {
        name: 'Elite Lite',
        description: 'Our entry-level wedding and event package with essential cinematic coverage. Perfect for couples looking for quality highlights and professional photo-video documentation.',
        inclusions: [
            'Full HD Cinematic Video Highlights',
            '1 Professional Photographer',
            '1 Professional Videographer',
            'All Photos are enhanced',
            'Full Video Documentation (Raw Video)',
        ],
        price: 'Php 25,000',
    },
    {
        name: 'Royale Lite',
        description: 'A complete wedding day package featuring same-day edit video, full photo and video coverage, plus a FREE prenuptial photoshoot to capture your love story before the big day.',
        inclusions: [
            'Full HD Cinematic Same Day Edit Video (SDE)',
            'Photo and Video Coverage on Wedding Day',
            '1 Professional Photographer',
            '2 Professional Videographers',
            'All Photos are enhanced',
            'FREE Prenuptial Photoshoot',
            'Full Video Documentation (Raw Video)',
            'AVP Presentation',
        ],
        price: 'Php 39,999',
    },
    {
        name: 'Summit Lite',
        description: 'Includes everything in Royale Lite plus a premium 20-page hard bound album to preserve your wedding memories in a beautiful keepsake you can treasure forever.',
        inclusions: [
            'Full HD Cinematic Same Day Edit Video (SDE)',
            'Photo and Video Coverage on Wedding Day',
            '1 Professional Photographer',
            '2 Professional Videographers',
            'All Photos are enhanced',
            '20 Pages 8x10 Hard Bound Album',
            'FREE Prenuptial Photoshoot',
            'Full Video Documentation (Raw Video)',
            'AVP Presentation',
        ],
        price: 'Php 44,999',
    },
    {
        name: 'Summit Premium',
        description: 'Our most popular premium package with an expanded team, larger album, save the date video, and aerial drone coverage for breathtaking perspectives of your special day.',
        inclusions: [
            'Full HD Cinematic Same Day Edit Video (SDE)',
            'Photo and Video Coverage on Wedding Day',
            '2 Professional Photographers',
            '2 Professional Videographers',
            '40 Pages 8x10 Hard Bound Album',
            'Save The Date Video',
            'Aerial / Drone Shots',
            'FREE Prenuptial Photoshoot',
            'All Photos are enhanced',
            'Full Video Documentation',
            'AVP Presentation',
        ],
        price: 'Php 54,999',
    },
    {
        name: 'Paramount',
        description: 'The ultimate wedding experience — SDE directed and edited by Ernesto Dadula. Features the largest team, pre-wedding film, drone coverage, and a 1TB hard drive with all your files.',
        inclusions: [
            'SDE Directed and Edited by Ernesto Dadula',
            'Full HD Cinematic Same Day Edit Video (SDE)',
            'Full HD Onsite Photo (Same Day Edit Photo)',
            '40 Pages 8x10 Hard Bound Album',
            'Save The Date Video / Pre-Wedding Film',
            'Aerial / Drone Shots',
            'FREE Prenuptial Photoshoot',
            '3 Professional Photographers',
            '3 Professional Videographers',
            'All Photos are enhanced',
            'Full Video Documentation (Raw Video)',
            'AVP Presentation',
            '1 TB Hard Drive (For File Storage)',
        ],
        price: 'Php 100,000',
    },
];

let _currentPackageIndex = null; // track which package the modal is showing

function openPackage(index) {
    const pkg = packagesData[index];
    if (!pkg) return;

    _currentPackageIndex = index; // remember which package was opened

    document.getElementById('pkg-modal-title').textContent = pkg.name;
    document.getElementById('pkg-modal-desc').textContent = pkg.description;
    document.getElementById('pkg-modal-price').textContent = pkg.price;

    const inclusionsList = document.getElementById('pkg-modal-inclusions');
    inclusionsList.innerHTML = pkg.inclusions.map(item =>
        `<li class="flex items-start gap-2 text-sm text-text-dark">
      <i class="ri-checkbox-circle-fill text-lime-dark text-lg mt-0.5 shrink-0"></i>
      <span>${item}</span>
    </li>`
    ).join('');

    openModal('package-modal');
}

/**
 * Called by the "Book" button inside the package modal.
 * Saves the package index to localStorage so booking.js can pre-select it,
 * then navigates to the Booking tab.
 */
function bookFromServices() {
    if (_currentPackageIndex !== null) {
        localStorage.setItem('shootgeeks_preselect_pkg', String(_currentPackageIndex));
    }
    closePackage();
    if (typeof switchTab === 'function') switchTab('#booking');
}

function closePackage() {
    closeModal('package-modal');
}

// ——— Keyboard Navigation for Gallery ———
document.addEventListener('keydown', (e) => {
    const galleryModal = document.getElementById('gallery-modal');
    if (!galleryModal || !galleryModal.classList.contains('open')) return;
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
});
