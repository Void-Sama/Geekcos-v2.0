/**
 * ShootGeeks — Booking Timeline
 * Multi-step booking flow: Package → Date & Time → Your Info → Style → Confirm
 */
(() => {
    /* ------------------------------------------------------------------ */
    /*  CONSTANTS                                                          */
    /* ------------------------------------------------------------------ */
    const TOTAL_STEPS = 5;
    const MONTHS = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
    const PHOTOS_JSON = '../resources/photos/photos.json';
    const PHOTOS_DIR = '../resources/photos/';

    const PACKAGES = [
        { name: 'Elite Lite', price: 'PHP 25,000',  desc: 'Full HD cinematic video highlights, 1 professional photographer, 1 professional videographer, all photos enhanced, and full video documentation.' },
        { name: 'Royale Lite', price: 'PHP 39,999', desc: 'Full HD cinematic SDE, wedding day coverage, 1 photographer, 2 videographers, FREE prenuptial photoshoot, AVP presentation, and full video documentation.' },
        { name: 'Summit Lite', price: 'PHP 44,999', desc: 'Full HD cinematic SDE, wedding day coverage, 20-page 8x10 hard bound album, prenuptial photoshoot, AVP presentation, and full video documentation.' },
        { name: 'Summit Premium', price: 'PHP 54,999', desc: 'Full HD cinematic SDE, 2 photographers, 2 videographers, 40-page album, save the date video, aerial/drone shots, FREE prenuptial photoshoot, and AVP presentation.' },
        { name: 'Paramount', price: 'PHP 100,000', desc: 'SDE by Ernesto Dadula, 3 photographers, 3 videographers, 40-page album, pre-wedding film, aerial/drone shots, FREE prenuptial photoshoot, 1TB hard drive, and AVP presentation.' },
    ];

    const STYLES = [
        { name: 'Candid & Natural',       sub: 'Capture authentic moments as they happen',              tag: 'candid and natural' },
        { name: 'Traditional Posed',      sub: 'Classic formal portraits and group photos',             tag: 'traditional posed' },
        { name: 'Documentary Style',      sub: 'Tell your story through photojournalistic approach',    tag: 'documentary style' },
        { name: 'Artistic & Creative',    sub: 'Unique angle and creative compositions',                tag: 'artistic and creative' },
        { name: 'Vintage',                sub: 'Timeless, classic aesthetic with warm tones',            tag: 'vintage' },
        { name: 'Modern & Minimalistic',  sub: 'Clean contemporary style with bold composition',        tag: 'modern and minimalistic' },
    ];

    // Today's date
    const TODAY = new Date();
    TODAY.setHours(0, 0, 0, 0);

    /* ------------------------------------------------------------------ */
    /*  STATE                                                              */
    /* ------------------------------------------------------------------ */
    let currentStep = 1;
    let highestCompleted = 0; // highest step that has been validated

    let selectedPackage = null;   // 0-4
    let numDays = 1;              // number of booking days
    let selectedDates = [];       // array of Date objects
    let calViewYear = TODAY.getFullYear();
    let calViewMonth = TODAY.getMonth(); // 0-indexed
    let timeFrom = '';
    let timeTo = '';
    let userEmail = '';
    let userFirstName = '';
    let userLastName = '';
    let userStreet1 = '';
    let userStreet2 = '';
    let userCountry = '';
    let userState = '';
    let userCity = '';
    let userZip = '';
    let userPhone = '';
    let userDetails = '';
    let userEventType = '';
    let selectedStyles = new Set();
    let styleImages = [];         // random images for style cards

    /* ------------------------------------------------------------------ */
    /*  HELPERS                                                            */
    /* ------------------------------------------------------------------ */
    function dateKey(d) {
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    }

    function isDateSelected(d) {
        return selectedDates.some(sd => dateKey(sd) === dateKey(d));
    }

    function formatDateShort(d) {
        return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    }

    function isMultiDay() {
        return numDays >= 2;
    }

    /* ------------------------------------------------------------------ */
    /*  DOM REFS                                                           */
    /* ------------------------------------------------------------------ */
    const bookingSection = document.getElementById('booking');
    const timeline = document.getElementById('booking-timeline');
    const tlSteps = timeline ? timeline.querySelectorAll('.booking-tl-step') : [];
    const panels = document.querySelectorAll('.booking-panel');

    // Step 1
    const pkgCards = document.querySelectorAll('.booking-pkg-card');
    const nextBtn1 = document.getElementById('booking-next-1');

    // Step 2
    const numDaysEl = document.getElementById('booking-num-days');
    const calTitle = document.getElementById('booking-cal-title');
    const calGrid = document.getElementById('booking-cal-grid');
    const calPrev = document.getElementById('booking-cal-prev');
    const calNext = document.getElementById('booking-cal-next');
    const calHelper = document.getElementById('booking-cal-helper');
    const selectedDatesContainer = document.getElementById('booking-selected-dates');
    const selectedDatesList = document.getElementById('booking-selected-dates-list');
    const timeSectionEl = document.getElementById('booking-time-section');
    const multidayNoteEl = document.getElementById('booking-multiday-note');
    const timeFromEl = document.getElementById('booking-time-from');
    const timeToEl = document.getElementById('booking-time-to');
    const backBtn2 = document.getElementById('booking-back-2');
    const nextBtn2 = document.getElementById('booking-next-2');

    // Step 3
    const emailEl = document.getElementById('booking-email');
    const firstNameEl = document.getElementById('booking-first-name');
    const lastNameEl = document.getElementById('booking-last-name');
    const street1El = document.getElementById('booking-street1');
    const street2El = document.getElementById('booking-street2');
    const countryEl = document.getElementById('booking-country');
    const stateEl = document.getElementById('booking-state');
    const cityEl = document.getElementById('booking-city');
    const zipEl = document.getElementById('booking-zip');
    const phoneEl = document.getElementById('booking-phone');
    const detailsEl = document.getElementById('booking-details');
    const eventTypeEl = document.getElementById('booking-event-type');
    const eventTypeOtherEl = document.getElementById('booking-event-type-other');
    const backBtn3 = document.getElementById('booking-back-3');
    const nextBtn3 = document.getElementById('booking-next-3');

    // Step 4
    const stylesGrid = document.getElementById('booking-styles-grid');
    const backBtn4 = document.getElementById('booking-back-4');
    const nextBtn4 = document.getElementById('booking-next-4');

    // Step 5
    const confirmDate = document.getElementById('confirm-date');
    const confirmNumDays = document.getElementById('confirm-num-days');
    const confirmPkg = document.getElementById('confirm-package');
    const confirmPkgDesc = document.getElementById('confirm-package-desc');
    const confirmStylesList = document.getElementById('confirm-styles');
    const confirmDetails = document.getElementById('confirm-details');
    const confirmInfoBody = document.getElementById('confirm-info-body');
    const backBtn5 = document.getElementById('booking-back-5');
    const confirmBtn = document.getElementById('booking-confirm');

    if (!bookingSection) return; // bail if no booking section

    /* ------------------------------------------------------------------ */
    /*  STEP NAVIGATION                                                    */
    /* ------------------------------------------------------------------ */
    function goToStep(step) {
        if (step < 1 || step > TOTAL_STEPS) return;
        // Can only go forward if previous steps are completed
        if (step > currentStep && step > highestCompleted + 1) return;

        currentStep = step;
        updateTimeline();
        updatePanels();
        // Scroll to top of booking section
        bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // If entering step 5, populate confirmation
        if (step === 5) populateConfirmation();
    }

    function updateTimeline() {
        tlSteps.forEach(btn => {
            const s = parseInt(btn.dataset.step, 10);
            btn.classList.remove('active', 'completed');
            if (s === currentStep) {
                btn.classList.add('active');
            } else if (s <= highestCompleted) {
                btn.classList.add('completed');
            }
        });
    }

    function updatePanels() {
        panels.forEach(p => p.classList.remove('active'));
        const active = document.getElementById(`booking-step-${currentStep}`);
        if (active) active.classList.add('active');
    }

    // Timeline step clicks — allow going back but not forward past completed
    tlSteps.forEach(btn => {
        btn.addEventListener('click', () => {
            const s = parseInt(btn.dataset.step, 10);
            if (s <= highestCompleted + 1 && s <= currentStep) {
                goToStep(s);
            }
        });
    });

    /* ------------------------------------------------------------------ */
    /*  VALIDATION HELPERS                                                 */
    /* ------------------------------------------------------------------ */
    function enableBtn(btn) {
        if (!btn) return;
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
    }

    function disableBtn(btn) {
        if (!btn) return;
        btn.disabled = true;
        btn.classList.add('opacity-50', 'cursor-not-allowed');
    }

    function validateStep(step) {
        switch (step) {
            case 1: return selectedPackage !== null;
            case 2:
                if (isMultiDay()) {
                    // Multi-day: need exactly numDays dates selected, no time needed
                    return selectedDates.length === numDays;
                } else {
                    // Single day: need 1 date + valid time range (min 1 hr, end after start)
                    return selectedDates.length === 1 && timeFrom && timeTo && validateTimeRange() === '';
                }
            case 3: return userFirstName.trim() && userLastName.trim() && userEmail.trim() && userEventType.trim() && userStreet1.trim() && userCountry && userState && userCity && userZip.trim() && userPhone.trim();
            case 4: return selectedStyles.size > 0;
            case 5: return true;
            default: return false;
        }
    }

    function checkCurrentStep() {
        const valid = validateStep(currentStep);
        const nextBtn = document.getElementById(`booking-next-${currentStep}`);
        if (nextBtn) {
            if (valid) enableBtn(nextBtn);
            else disableBtn(nextBtn);
        }
        if (valid && currentStep > highestCompleted) {
            highestCompleted = currentStep;
        }
    }

    /* ------------------------------------------------------------------ */
    /*  STEP 1: PACKAGE SELECTION                                          */
    /* ------------------------------------------------------------------ */
    pkgCards.forEach(card => {
        card.addEventListener('click', () => {
            const radio = card.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
            selectedPackage = parseInt(card.dataset.pkg, 10);

            // Visual update
            pkgCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');

            checkCurrentStep();
        });
    });

    if (nextBtn1) {
        nextBtn1.addEventListener('click', () => {
            if (validateStep(1)) {
                if (highestCompleted < 1) highestCompleted = 1;
                goToStep(2);
                updateStep2UI();
                renderCalendar();
            }
        });
    }

    /* ------------------------------------------------------------------ */
    /*  STEP 2: NUMBER OF DAYS + CALENDAR + TIME                           */
    /* ------------------------------------------------------------------ */

    /** Toggle visibility of time section vs multi-day note */
    function updateStep2UI() {
        if (isMultiDay()) {
            // Hide time section, show multi-day note
            if (timeSectionEl) timeSectionEl.classList.add('hidden');
            if (multidayNoteEl) multidayNoteEl.classList.remove('hidden');
            // Clear time values
            timeFrom = '';
            timeTo = '';
            if (timeFromEl) timeFromEl.value = '';
            if (timeToEl) timeToEl.value = '';
            // Update calendar helper
            if (calHelper) calHelper.textContent = `Select ${numDays} dates for your event`;
        } else {
            // Show time section, hide multi-day note
            if (timeSectionEl) timeSectionEl.classList.remove('hidden');
            if (multidayNoteEl) multidayNoteEl.classList.add('hidden');
            if (calHelper) calHelper.textContent = 'Pick your event date';
        }
        updateSelectedDatesDisplay();
        checkCurrentStep();
    }

    /** Show selected dates as pills below the calendar */
    function updateSelectedDatesDisplay() {
        if (!selectedDatesContainer || !selectedDatesList) return;

        if (selectedDates.length === 0) {
            selectedDatesContainer.classList.add('hidden');
            return;
        }

        selectedDatesContainer.classList.remove('hidden');

        // Sort dates chronologically
        selectedDates.sort((a, b) => a - b);

        selectedDatesList.innerHTML = selectedDates.map((d, i) => `
            <span class="inline-flex items-center gap-1.5 bg-primary/20 text-text-primary text-xs font-medium px-3 py-1.5 rounded-full">
                ${formatDateShort(d)}
                <button type="button" data-remove-date="${i}" class="hover:text-red-400 transition cursor-pointer" aria-label="Remove date">
                    <i class="ri-close-line"></i>
                </button>
            </span>
        `).join('');

        // Add remove listeners
        selectedDatesList.querySelectorAll('[data-remove-date]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.removeDate, 10);
                selectedDates.splice(idx, 1);
                renderCalendar();
                updateSelectedDatesDisplay();
                checkCurrentStep();
            });
        });
    }

    // Number of days change handler
    if (numDaysEl) {
        numDaysEl.addEventListener('change', () => {
            numDays = parseInt(numDaysEl.value, 10) || 1;
            // Clear selected dates when switching modes
            selectedDates = [];
            updateStep2UI();
            renderCalendar();
        });
    }

    function renderCalendar() {
        if (!calGrid || !calTitle) return;
        calTitle.textContent = `${MONTHS[calViewMonth]} ${calViewYear}`;

        const firstDay = new Date(calViewYear, calViewMonth, 1).getDay(); // 0=Sun
        const daysInMonth = new Date(calViewYear, calViewMonth + 1, 0).getDate();

        calGrid.innerHTML = '';

        // Empty cells for days before the 1st
        for (let i = 0; i < firstDay; i++) {
            const blank = document.createElement('div');
            blank.className = 'booking-cal-cell empty';
            calGrid.appendChild(blank);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const cell = document.createElement('button');
            cell.className = 'booking-cal-cell';
            cell.textContent = d;

            const cellDate = new Date(calViewYear, calViewMonth, d);
            cellDate.setHours(0, 0, 0, 0);

            // Disable past dates
            if (cellDate < TODAY) {
                cell.classList.add('disabled');
                cell.disabled = true;
            } else {
                cell.addEventListener('click', () => {
                    handleDateClick(cellDate);
                });
            }

            // Highlight selected
            if (isDateSelected(cellDate)) {
                cell.classList.add('selected');
            }

            calGrid.appendChild(cell);
        }
    }

    function handleDateClick(clickedDate) {
        if (isMultiDay()) {
            // Multi-day: toggle date selection
            const existingIdx = selectedDates.findIndex(d => dateKey(d) === dateKey(clickedDate));
            if (existingIdx !== -1) {
                // Deselect
                selectedDates.splice(existingIdx, 1);
            } else if (selectedDates.length < numDays) {
                // Select (only if under limit)
                selectedDates.push(clickedDate);
            } else {
                // At limit — replace the oldest selection
                selectedDates.shift();
                selectedDates.push(clickedDate);
            }
        } else {
            // Single day: replace selection
            selectedDates = [clickedDate];
        }

        renderCalendar();
        updateSelectedDatesDisplay();
        checkCurrentStep();
    }

    if (calPrev) {
        calPrev.addEventListener('click', () => {
            calViewMonth--;
            if (calViewMonth < 0) { calViewMonth = 11; calViewYear--; }
            renderCalendar();
        });
    }

    if (calNext) {
        calNext.addEventListener('click', () => {
            calViewMonth++;
            if (calViewMonth > 11) { calViewMonth = 0; calViewYear++; }
            renderCalendar();
        });
    }

    // Time inputs
    const timeErrorEl = document.getElementById('booking-time-error');
    const timeErrorMsg = document.getElementById('booking-time-error-msg');

    /** Convert "HH:MM" to total minutes for comparison */
    function timeToMinutes(t) {
        if (!t) return -1;
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    }

    /** Validate time range for single-day bookings. Returns error string or '' if valid. */
    function validateTimeRange() {
        if (!timeFrom || !timeTo) return '';
        const fromMin = timeToMinutes(timeFrom);
        const toMin = timeToMinutes(timeTo);

        if (fromMin === toMin) {
            return 'Start and end time cannot be the same.';
        }
        if (toMin < fromMin) {
            return 'End time cannot be earlier than start time.';
        }
        if ((toMin - fromMin) < 60) {
            return 'Minimum booking duration is 1 hour.';
        }
        return '';
    }

    function showTimeError(msg) {
        if (timeErrorEl && timeErrorMsg) {
            if (msg) {
                timeErrorMsg.textContent = msg;
                timeErrorEl.classList.remove('hidden');
            } else {
                timeErrorEl.classList.add('hidden');
                timeErrorMsg.textContent = '';
            }
        }
    }

    function handleTimeChange() {
        const err = validateTimeRange();
        showTimeError(err);
        checkCurrentStep();
    }

    if (timeFromEl) {
        timeFromEl.addEventListener('change', () => {
            timeFrom = timeFromEl.value;
            handleTimeChange();
        });
    }
    if (timeToEl) {
        timeToEl.addEventListener('change', () => {
            timeTo = timeToEl.value;
            handleTimeChange();
        });
    }

    if (backBtn2) backBtn2.addEventListener('click', () => goToStep(1));
    if (nextBtn2) {
        nextBtn2.addEventListener('click', () => {
            if (validateStep(2)) {
                if (highestCompleted < 2) highestCompleted = 2;
                goToStep(3);
            }
        });
    }

    /* ------------------------------------------------------------------ */
    /*  STEP 3: YOUR INFO                                                  */
    /* ------------------------------------------------------------------ */
    function readFormFields() {
        userEmail = emailEl ? emailEl.value : '';
        userFirstName = firstNameEl ? firstNameEl.value : '';
        userLastName = lastNameEl ? lastNameEl.value : '';
        userStreet1 = street1El ? street1El.value : '';
        userStreet2 = street2El ? street2El.value : '';
        userCountry = countryEl ? countryEl.value : '';
        userState = stateEl ? stateEl.value : '';
        userCity = cityEl ? cityEl.value : '';
        userZip = zipEl ? zipEl.value : '';
        userPhone = phoneEl ? phoneEl.value : '';
        userDetails = detailsEl ? detailsEl.value : '';

        // Event Type: use "Other" textbox value if "Other" is selected
        if (eventTypeEl && eventTypeEl.value === 'Other') {
            userEventType = eventTypeOtherEl ? eventTypeOtherEl.value : '';
        } else {
            userEventType = eventTypeEl ? eventTypeEl.value : '';
        }

        checkCurrentStep();
    }

    // Text inputs — listen on 'input'
    [emailEl, firstNameEl, lastNameEl, street1El, street2El, zipEl, phoneEl, detailsEl, eventTypeOtherEl].forEach(el => {
        if (el) el.addEventListener('input', readFormFields);
    });

    // Dropdowns — listen on 'change'
    [countryEl, stateEl, cityEl].forEach(el => {
        if (el) el.addEventListener('change', readFormFields);
    });

    // Event Type dropdown — toggle "Other" textbox visibility
    if (eventTypeEl) {
        eventTypeEl.addEventListener('change', () => {
            if (eventTypeEl.value === 'Other') {
                if (eventTypeOtherEl) {
                    eventTypeOtherEl.classList.remove('hidden');
                    eventTypeOtherEl.focus();
                }
            } else {
                if (eventTypeOtherEl) {
                    eventTypeOtherEl.classList.add('hidden');
                    eventTypeOtherEl.value = '';
                }
            }
            readFormFields();
        });
    }

    // Enforce numbers-only on phone field
    if (phoneEl) {
        phoneEl.addEventListener('input', () => {
            phoneEl.value = phoneEl.value.replace(/[^0-9]/g, '');
        });
        phoneEl.addEventListener('keydown', (e) => {
            // Allow: backspace, delete, tab, escape, enter, arrows
            if ([8, 46, 9, 27, 13, 37, 38, 39, 40].includes(e.keyCode) ||
                // Allow: Ctrl+A/C/V/X
                (e.ctrlKey && [65, 67, 86, 88].includes(e.keyCode))) {
                return;
            }
            // Block if not a number key (0-9 on main keyboard or numpad)
            if ((e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
        });
        // Also catch paste — strip non-numbers
        phoneEl.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData('text');
            phoneEl.value = (phoneEl.value + text.replace(/[^0-9]/g, '')).slice(0, phoneEl.maxLength || 15);
            readFormFields();
        });
    }

    // Enforce letters-only on name fields (allows spaces, hyphens, apostrophes)
    // e.g. supports names like "Mary-Jane" or "O'Brien"
    function enforceNameField(el) {
        if (!el) return;
        el.addEventListener('input', () => {
            const cursor = el.selectionStart;
            const cleaned = el.value.replace(/[^a-zA-ZÀ-ÿ\s'\-]/g, '');
            if (cleaned !== el.value) {
                el.value = cleaned;
                // Restore cursor position
                el.setSelectionRange(cursor - 1, cursor - 1);
            }
        });
        el.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData('text');
            const cleaned = text.replace(/[^a-zA-ZÀ-ÿ\s'\-]/g, '');
            el.value = (el.value + cleaned).slice(0, el.maxLength || 50);
            readFormFields();
        });
    }
    enforceNameField(firstNameEl);
    enforceNameField(lastNameEl);

    // Enforce numbers-only on zip code field
    if (zipEl) {
        zipEl.addEventListener('input', () => {
            zipEl.value = zipEl.value.replace(/[^0-9]/g, '');
        });
        zipEl.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData('text');
            zipEl.value = (zipEl.value + text.replace(/[^0-9]/g, '')).slice(0, zipEl.maxLength || 10);
            readFormFields();
        });
    }

    /* ------------------------------------------------------------------ */
    /*  CASCADING DROPDOWNS: Country → State → City                        */
    /* ------------------------------------------------------------------ */
    const COUNTRIES_API = 'https://countriesnow.space/api/v0.1/countries';
    const STATES_API = 'https://countriesnow.space/api/v0.1/countries/states';
    const CITIES_API = 'https://countriesnow.space/api/v0.1/countries/state/cities';

    /** Reset a <select> to a single disabled placeholder option */
    function resetSelect(selectEl, placeholder, disable = true) {
        if (!selectEl) return;
        selectEl.innerHTML = `<option value="" disabled selected>${placeholder}</option>`;
        selectEl.disabled = disable;
    }

    /** Populate a <select> with an array of string values */
    function populateSelect(selectEl, items, placeholder) {
        if (!selectEl) return;
        selectEl.innerHTML = `<option value="" disabled selected>${placeholder}</option>`;
        items.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item;
            opt.textContent = item;
            selectEl.appendChild(opt);
        });
        selectEl.disabled = false;
    }

    // Load countries on init
    async function loadCountries() {
        if (!countryEl) return;
        resetSelect(countryEl, 'Loading...', true);
        try {
            const res = await fetch(COUNTRIES_API);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const countries = (data.data || []).map(c => c.country).sort();
            populateSelect(countryEl, countries, 'Select Country');
        } catch (err) {
            console.error('[Booking] Failed to load countries:', err);
            resetSelect(countryEl, '⚠ Failed to load countries', true);
        }
    }

    // Country → fetch states
    if (countryEl) {
        countryEl.addEventListener('change', async () => {
            const country = countryEl.value;
            userCountry = country;
            // Reset dependents
            resetSelect(stateEl, 'Loading...', true);
            resetSelect(cityEl, 'Select City', true);
            userState = '';
            userCity = '';
            readFormFields();

            try {
                const res = await fetch(STATES_API, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ country })
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                const states = (data.data && data.data.states ? data.data.states : []).map(s => s.name).sort();
                if (states.length === 0) {
                    resetSelect(stateEl, 'No states available', true);
                    // Enable city directly for countries with no states
                    await loadCitiesDirect(country);
                } else {
                    populateSelect(stateEl, states, 'Select State/Province');
                }
            } catch (err) {
                console.error('[Booking] Failed to load states:', err);
                resetSelect(stateEl, '⚠ Failed to load states', true);
            }
        });
    }

    // State → fetch cities
    if (stateEl) {
        stateEl.addEventListener('change', async () => {
            const country = countryEl ? countryEl.value : '';
            const state = stateEl.value;
            userState = state;
            resetSelect(cityEl, 'Loading...', true);
            userCity = '';
            readFormFields();

            try {
                const res = await fetch(CITIES_API, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ country, state })
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                const cities = (data.data || []).sort();
                if (cities.length === 0) {
                    resetSelect(cityEl, 'No cities available', true);
                } else {
                    populateSelect(cityEl, cities, 'Select City');
                }
            } catch (err) {
                console.error('[Booking] Failed to load cities:', err);
                resetSelect(cityEl, '⚠ Failed to load cities', true);
            }
        });
    }

    // Fallback: load cities directly for countries with no states
    async function loadCitiesDirect(country) {
        if (!cityEl) return;
        resetSelect(cityEl, 'Loading...', true);
        try {
            const res = await fetch(COUNTRIES_API);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const entry = (data.data || []).find(c => c.country === country);
            const cities = entry && entry.cities ? entry.cities.sort() : [];
            if (cities.length === 0) {
                resetSelect(cityEl, 'No cities available', true);
            } else {
                populateSelect(cityEl, cities, 'Select City');
            }
        } catch (err) {
            console.error('[Booking] Failed to load cities (direct):', err);
            resetSelect(cityEl, '⚠ Failed to load cities', true);
        }
    }

    // Kick off countries fetch
    loadCountries();

    if (backBtn3) backBtn3.addEventListener('click', () => goToStep(2));
    if (nextBtn3) {
        nextBtn3.addEventListener('click', () => {
            if (validateStep(3)) {
                if (highestCompleted < 3) highestCompleted = 3;
                goToStep(4);
                renderStyleCards();
            }
        });
    }

    /* ------------------------------------------------------------------ */
    /*  STEP 4: PHOTOGRAPHY STYLES                                         */
    /* ------------------------------------------------------------------ */
    async function loadPhotosForStyles() {
        if (styleImages.length) return; // already loaded

        const useCloudinary = typeof CLOUDINARY_CONFIG !== 'undefined' && CLOUDINARY_CONFIG.enabled;

        if (useCloudinary) {
            // Fetch one image per style from Cloudinary using each style's tag
            const fetches = STYLES.map(async (style) => {
                try {
                    const res = await fetch(
                        `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/list/${encodeURIComponent(style.tag)}.json`
                    );
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    const data = await res.json();
                    const resources = data.resources || [];
                    if (resources.length === 0) return '';
                    // Pick a random image from the tag
                    const pick = resources[Math.floor(Math.random() * resources.length)];
                    return buildCloudinaryUrl(pick.public_id, pick.format, 'f_auto,q_auto,w_600,c_fill,g_auto');
                } catch (err) {
                    console.warn(`[Booking] Could not load Cloudinary image for "${style.tag}":`, err.message);
                    return '';
                }
            });

            styleImages = await Promise.all(fetches);
            console.info('[Booking] Loaded style images from Cloudinary.');
        }

        // Fallback: fill any missing images with local photos
        const missing = styleImages.filter(s => !s).length;
        if (!styleImages.length || missing > 0) {
            try {
                const res = await fetch(PHOTOS_JSON);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const filenames = await res.json();
                const shuffled = [...filenames].sort(() => 0.5 - Math.random());
                let fallbackIdx = 0;
                for (let i = 0; i < STYLES.length; i++) {
                    if (!styleImages[i]) {
                        styleImages[i] = PHOTOS_DIR + (shuffled[fallbackIdx++] || '');
                    }
                }
            } catch (err) {
                console.error('Booking: could not load fallback photos for styles', err);
                styleImages = Array(STYLES.length).fill('');
            }
        }
    }

    async function renderStyleCards() {
        await loadPhotosForStyles();
        if (!stylesGrid) return;
        stylesGrid.innerHTML = '';

        STYLES.forEach((style, i) => {
            const card = document.createElement('div');
            card.className = 'booking-style-card';
            card.dataset.style = style.name;

            if (selectedStyles.has(style.name)) card.classList.add('selected');

            card.innerHTML = `
                <div class="booking-style-img-wrap">
                    <img src="${styleImages[i] || ''}" alt="${style.name}" class="booking-style-img" loading="lazy" />
                </div>
                <div class="p-3 sm:p-4">
                    <h4 class="font-bold text-text-primary text-sm sm:text-base">${style.name}</h4>
                    <p class="text-text-muted text-xs sm:text-sm mt-0.5">${style.sub}</p>
                </div>
            `;

            card.addEventListener('click', () => {
                if (selectedStyles.has(style.name)) {
                    selectedStyles.delete(style.name);
                    card.classList.remove('selected');
                } else {
                    selectedStyles.add(style.name);
                    card.classList.add('selected');
                }
                checkCurrentStep();
            });

            stylesGrid.appendChild(card);
        });
    }

    if (backBtn4) backBtn4.addEventListener('click', () => goToStep(3));
    if (nextBtn4) {
        nextBtn4.addEventListener('click', () => {
            if (validateStep(4)) {
                if (highestCompleted < 4) highestCompleted = 4;
                goToStep(5);
            }
        });
    }

    /* ------------------------------------------------------------------ */
    /*  REFERENCE IMAGE UPLOAD (within Step 4)                             */
    /*  Allows user to upload up to 4 reference images                     */
    /* ------------------------------------------------------------------ */
    const MAX_REFERENCE_IMAGES = 4;
    let referenceImages = []; // Array of { dataUrl, id }

    const dropZone = document.getElementById('reference-drop-zone');
    const fileInput = document.getElementById('reference-file-input');
    const previewGrid = document.getElementById('reference-preview-grid');

    /**
     * Render the preview grid with uploaded images
     */
    function renderReferencePreviews() {
        if (!previewGrid) return;

        if (referenceImages.length === 0) {
            previewGrid.innerHTML = '';
            return;
        }

        previewGrid.innerHTML = referenceImages.map((img, index) => `
            <div class="relative group rounded-xl overflow-hidden shadow-lg border border-border bg-card">
                <img src="${img.dataUrl}" alt="Reference ${index + 1}" class="w-full h-24 sm:h-32 object-cover" />
                <button type="button" data-remove-ref="${index}" 
                    class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition cursor-pointer hover:bg-red-600"
                    aria-label="Remove image">
                    <i class="ri-close-line"></i>
                </button>
                <div class="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                    ${index + 1}/${MAX_REFERENCE_IMAGES}
                </div>
            </div>
        `).join('');

        // Add remove listeners
        previewGrid.querySelectorAll('[data-remove-ref]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.removeRef, 10);
                referenceImages.splice(idx, 1);
                renderReferencePreviews();
                checkCurrentStep();
            });
        });
    }

    /**
     * Handle file selection and validation
     */
    function handleFiles(files) {
        if (!files || files.length === 0) return;

        const remainingSlots = MAX_REFERENCE_IMAGES - referenceImages.length;
        if (remainingSlots <= 0) {
            alert(`You can only upload up to ${MAX_REFERENCE_IMAGES} images.`);
            return;
        }

        const filesToProcess = Array.from(files).slice(0, remainingSlots);

        if (filesToProcess.length < files.length) {
            alert(`Only ${remainingSlots} more image(s) can be uploaded.`);
        }

        filesToProcess.forEach(file => {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert(`"${file.name}" is not a valid image file.`);
                return;
            }

            // Validate file size (max 5MB per image)
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                alert(`"${file.name}" is too large. Max size is 5MB.`);
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                referenceImages.push({
                    dataUrl: e.target.result,
                    id: Date.now() + Math.random()
                });
                renderReferencePreviews();
                checkCurrentStep();
            };
            reader.onerror = () => {
                alert(`Failed to read "${file.name}". Please try again.`);
            };
            reader.readAsDataURL(file);
        });
    }

    // Click to upload
    if (dropZone && fileInput) {
        dropZone.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            handleFiles(e.target.files);
            fileInput.value = ''; // Reset so same file can be selected again
        });

        // Drag and drop support
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('border-primary', 'bg-primary/5');
        });

        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-primary', 'bg-primary/5');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-primary', 'bg-primary/5');
            handleFiles(e.dataTransfer.files);
        });
    }

    /* ------------------------------------------------------------------ */
    /*  STEP 5: CONFIRMATION                                               */
    /* ------------------------------------------------------------------ */
    function populateConfirmation() {
        // Date(s)
        if (confirmDate) {
            if (selectedDates.length > 0) {
                // Sort dates chronologically
                const sorted = [...selectedDates].sort((a, b) => a - b);
                const dateStrs = sorted.map(d => formatDateShort(d));

                if (isMultiDay()) {
                    confirmDate.innerHTML = dateStrs.map(ds => `<span class="block">${ds}</span>`).join('');
                } else {
                    const timeStr = (timeFrom && timeTo) ? ` — ${formatTime(timeFrom)} to ${formatTime(timeTo)}` : '';
                    confirmDate.textContent = dateStrs[0] + timeStr;
                }
            } else {
                confirmDate.textContent = '—';
            }
        }

        // Number of Days
        if (confirmNumDays) {
            confirmNumDays.textContent = numDays === 1 ? '1 Day' : `${numDays} Days`;
        }

        // Package
        if (confirmPkg && selectedPackage !== null) {
            const pkg = PACKAGES[selectedPackage];
            confirmPkg.textContent = `${pkg.name}  — ${pkg.price}`;
            if (confirmPkgDesc) confirmPkgDesc.textContent = pkg.desc;
        }

        // Styles
        if (confirmStylesList) {
            if (selectedStyles.size) {
                confirmStylesList.innerHTML = [...selectedStyles]
                    .map(s => `<li>• ${s}</li>`).join('');
            } else {
                confirmStylesList.innerHTML = '<li>—</li>';
            }
        }

        // Details
        if (confirmDetails) {
            confirmDetails.textContent = userDetails.trim() || 'No additional details';
        }

        // Contact info
        if (confirmInfoBody) {
            const fullName = `${userFirstName} ${userLastName}`.trim();
            let addressParts = [userStreet1];
            if (userStreet2) addressParts.push(userStreet2);
            addressParts.push([userCity, userState].filter(Boolean).join(', '));
            if (userZip) addressParts[addressParts.length - 1] += ' ' + userZip;
            addressParts.push(userCountry);
            const fullAddress = addressParts.filter(Boolean).join(', ');

            let rows = [
                { icon: 'ri-user-fill', text: fullName || '—' },
                { icon: 'ri-mail-fill', text: userEmail || '—' },
                { icon: 'ri-phone-fill', text: userPhone || '—' },
                { icon: 'ri-calendar-event-fill', text: userEventType || '—' },
            ];
            rows.push({ icon: 'ri-map-pin-fill', text: fullAddress || '—' });

            confirmInfoBody.innerHTML = rows.map(r =>
                `<p><i class="${r.icon} mr-1"></i> ${r.text}</p>`
            ).join('');
        }

        // Uploaded Reference Images
        const confirmRefImages = document.getElementById('confirm-reference-images');
        const confirmRefGrid = document.getElementById('confirm-reference-grid');
        if (confirmRefImages && confirmRefGrid) {
            if (referenceImages && referenceImages.length > 0) {
                confirmRefGrid.innerHTML = referenceImages.map((img, index) => `
                    <div class="relative rounded-lg overflow-hidden shadow-md border border-white/20">
                        <img src="${img.dataUrl}" alt="Reference ${index + 1}" class="w-full h-24 object-cover" />
                        <div class="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                            ${index + 1}
                        </div>
                    </div>
                `).join('');
                confirmRefImages.classList.remove('hidden');
            } else {
                confirmRefImages.classList.add('hidden');
            }
        }
    }

    function formatTime(t) {
        if (!t) return '';
        const [h, m] = t.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 || 12;
        return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
    }

    /* ------------------------------------------------------------------ */
    /*  REFERENCE NUMBER GENERATOR                                        */
    /* ------------------------------------------------------------------ */
    /**
     * Generate a unique SG-2026-XXXXXX reference number.
     * Used numbers are stored in sessionStorage so they never repeat
     * within the same browser session.
     */
    function generateRefNumber(prefix) {
        const storageKey = `sg_used_refs_${prefix}`;
        let used = [];
        try { used = JSON.parse(sessionStorage.getItem(storageKey) || '[]'); } catch (_) {}

        let num;
        do {
            num = Math.floor(100000 + Math.random() * 900000); // 6-digit
        } while (used.includes(num));

        used.push(num);
        try { sessionStorage.setItem(storageKey, JSON.stringify(used)); } catch (_) {}
        return `SG-2026-${num}`;
    }

    /* ------------------------------------------------------------------ */
    /*  BOOKING SUCCESS MODAL                                              */
    /* ------------------------------------------------------------------ */
    const bookingModal      = document.getElementById('booking-success-modal');
    const bookingModalRef   = document.getElementById('booking-modal-ref');
    const bookingModalPkg   = document.getElementById('booking-modal-package');
    const bookingModalDate  = document.getElementById('booking-modal-date');
    const bookingModalName  = document.getElementById('booking-modal-name');
    const bookingModalDone  = document.getElementById('booking-modal-done');
    const bookingModalHome  = document.getElementById('booking-modal-home');
    const bookingModalCopy  = document.getElementById('booking-modal-copy');

    function openBookingModal() {
        if (!bookingModal) return;

        // Populate dynamic content
        const ref = generateRefNumber('booking');
        if (bookingModalRef) bookingModalRef.textContent = ref;

        // Package
        if (bookingModalPkg && selectedPackage !== null) {
            const pkg = PACKAGES[selectedPackage];
            bookingModalPkg.textContent = `${pkg.name} — ${pkg.price}`;
        }

        // Date(s)
        if (bookingModalDate && selectedDates.length > 0) {
            const sorted = [...selectedDates].sort((a, b) => a - b);
            if (isMultiDay()) {
                bookingModalDate.textContent = sorted.map(d => formatDateShort(d)).join(', ');
            } else {
                const timeStr = (timeFrom && timeTo) ? ` · ${formatTime(timeFrom)} – ${formatTime(timeTo)}` : '';
                bookingModalDate.textContent = formatDateShort(sorted[0]) + timeStr;
            }
        }

        // Name
        if (bookingModalName) {
            bookingModalName.textContent = `${userFirstName} ${userLastName}`.trim() || '—';
        }

        // Open with animation
        bookingModal.classList.add('sg-modal-open');
        document.body.style.overflow = 'hidden';

        // Store ref for potential copy
        bookingModal._currentRef = ref;
    }

    function closeBookingModal() {
        if (!bookingModal) return;
        bookingModal.classList.remove('sg-modal-open');
        document.body.style.overflow = '';
    }

    if (bookingModalDone) {
        bookingModalDone.addEventListener('click', () => {
            closeBookingModal();
        });
    }

    if (bookingModalHome) {
        bookingModalHome.addEventListener('click', () => {
            closeBookingModal();
            if (typeof switchTab === 'function') {
                switchTab('#main');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    if (bookingModalCopy) {
        bookingModalCopy.addEventListener('click', () => {
            const ref = bookingModal ? bookingModal._currentRef : (bookingModalRef ? bookingModalRef.textContent : '');
            if (ref && navigator.clipboard) {
                navigator.clipboard.writeText(ref).then(() => {
                    bookingModalCopy.innerHTML = '<i class="ri-check-line"></i> Copied!';
                    setTimeout(() => {
                        bookingModalCopy.innerHTML = '<i class="ri-file-copy-line"></i> Copy';
                    }, 2000);
                });
            }
        });
    }

    // Close modal when clicking backdrop
    if (bookingModal) {
        bookingModal.addEventListener('click', (e) => {
            if (e.target === bookingModal) closeBookingModal();
        });
    }

    if (backBtn5) backBtn5.addEventListener('click', () => goToStep(4));
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            const agreeTerms = document.getElementById('booking-agree-terms');
            const termsError = document.getElementById('booking-terms-error');
            const photoConsent = document.getElementById('booking-photo-consent');
            
            if (agreeTerms && !agreeTerms.checked) {
                if (termsError) termsError.classList.remove('hidden');
                return;
            }
            if (termsError) termsError.classList.add('hidden');

            // Show the booking success modal
            openBookingModal();
        });

        // Hide error when user clicks the checkbox
        const agreeTerms = document.getElementById('booking-agree-terms');
        const termsError = document.getElementById('booking-terms-error');
        if (agreeTerms && termsError) {
            agreeTerms.addEventListener('change', () => {
                if (agreeTerms.checked) {
                    termsError.classList.add('hidden');
                }
            });
        }
    }

    /* ------------------------------------------------------------------ */
    /*  INIT — render calendar when booking tab becomes visible            */
    /* ------------------------------------------------------------------ */

    /**
     * Check localStorage for a package pre-selected via the Services tab "Book" button.
     * If found, programmatically select that package card and reset to step 1.
     */
    function applyPreselectPackage() {
        const stored = localStorage.getItem('shootgeeks_preselect_pkg');
        if (stored === null) return;

        const idx = parseInt(stored, 10);
        localStorage.removeItem('shootgeeks_preselect_pkg'); // consume it

        if (isNaN(idx) || idx < 0 || idx >= pkgCards.length) return;

        // Reset to step 1 first (in case user came back from a later step)
        currentStep = 1;
        highestCompleted = 0;
        updateTimeline();
        updatePanels();

        // Simulate clicking the correct package card
        const targetCard = pkgCards[idx];
        if (targetCard) {
            // Deselect all first
            pkgCards.forEach(c => c.classList.remove('selected'));
            // Select the target
            const radio = targetCard.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
            targetCard.classList.add('selected');
            selectedPackage = idx;
            checkCurrentStep();

            // Scroll the card into view so the user sees which one was chosen
            targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    if (bookingSection) {
        const observer = new MutationObserver(() => {
            if (bookingSection.classList.contains('active')) {
                updateStep2UI();
                renderCalendar();
                // Check for a package pre-selected from the Services tab
                applyPreselectPackage();
            }
        });
        observer.observe(bookingSection, { attributes: true, attributeFilter: ['class'] });
    }

    /* ------------------------------------------------------------------ */
    /*  WARN ON RELOAD / LEAVE — prevent data loss                         */
    /* ------------------------------------------------------------------ */
    function hasBookingData() {
        return highestCompleted > 0 || currentStep > 1;
    }

    window.addEventListener('beforeunload', (e) => {
        if (hasBookingData()) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
})();