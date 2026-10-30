/* =========================================================
   FOOTER YEAR — auto-increment, future-proof against
   async/defer/dynamic script loading
   ========================================================= */
function setFooterYear() {
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        // Local year (flips at the visitor's local midnight).
        // Use new Date().getUTCFullYear() if you want a single
        // worldwide flip at 00:00 UTC instead.
        yearSpan.textContent = String(new Date().getFullYear());
    }
}

/* =========================================================
   BOOTSTRAP
   ========================================================= */
function init() {
    setFooterYear();
    fetchProdigies();
    initMarquees();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM is already parsed — run immediately.
    init();
}

/* =========================================================
   PRODIGIES
   ========================================================= */
function fetchProdigies() {
    fetch('data.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => renderProdigy(data))
        .catch(error => {
            console.error('Error fetching data:', error);
            const container = document.getElementById('prodigy-container');
            if (container) {
                container.innerHTML = `<p class="empty" style="color: var(--accent);">Failed to load data. Ensure data.json exists and you are running a local server.</p>`;
            }
        });
}

function renderProdigy(data) {
    const container = document.getElementById('prodigy-container');
    if (!container) return;
    container.classList.remove('loading');
    const prodigies = Array.isArray(data) ? data : [data];
    container.innerHTML = '';
    prodigies.forEach(prodigy => {
        const cardHTML = `
            <div class="prodigy-card">
                <div class="image-placeholder" style="background-image: url('${prodigy.image || ''}')">
                    ${!prodigy.image ? 'Image' : ''}
                </div>
                <ul class="details-list">
                    <li><strong>Year:</strong> <span>${prodigy.year}</span></li>
                    <li><strong>Full name:</strong> <span>${prodigy.fullName}</span></li>
                    <li><strong>Age:</strong> <span>${prodigy.age ?? '—'}</span></li>
                    <li><strong>Nationality:</strong> <span>${prodigy.nationality}</span></li>
                    <li><strong>Hobbies:</strong> <span>${prodigy.hobbies}</span></li>
                    <li><strong>URL:</strong> <a href="${prodigy.url}" target="_blank">${prodigy.url}</a></li>
                </ul>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

/* =========================================================
   MARQUEE LOGIC
   ========================================================= */
const MARQUEE_SPEED = 55; // pixels per second
let marqueeResizeTimer;

function initMarquees() {
    const tracks = document.querySelectorAll('.marquee-track');
    tracks.forEach(track => {
        if (track.dataset.originalHTML) return; // already initialized
        track.dataset.originalHTML = track.innerHTML;
        buildMarquee(track);
    });

    // Rebuild on resize (debounced)
    window.addEventListener('resize', () => {
        clearTimeout(marqueeResizeTimer);
        marqueeResizeTimer = setTimeout(() => {
            tracks.forEach(track => buildMarquee(track));
        }, 200);
    });
}

function buildMarquee(track) {
    const wrapper = track.parentElement; // .marquee-wrapper
    if (!wrapper) return;

    // Restore original items
    track.innerHTML = track.dataset.originalHTML;
    const originalItems = Array.from(track.children);
    if (originalItems.length === 0) return;

    // Measure wrapper width
    const wrapperWidth = wrapper.clientWidth;
    if (wrapperWidth === 0) return;

    // Read gap from computed style
    const style = getComputedStyle(track);
    const gap = parseFloat(style.gap) || 0;

    // Measure total width of the original items
    let originalItemsWidth = 0;
    originalItems.forEach(item => {
        originalItemsWidth += item.getBoundingClientRect().width;
    });

    // Width of one full set INCLUDING the gap after the last item
    const setWidth = originalItemsWidth + originalItems.length * gap;

    // We need enough copies so that after shifting by setWidth the viewport
    // is still filled. That means: totalCopies * setWidth - setWidth >= wrapperWidth
    const copiesNeeded = Math.ceil(wrapperWidth / setWidth) + 1;
    const copies = Math.max(2, copiesNeeded); // at least 2 for the loop

    // Rebuild the track with the required number of copies
    track.innerHTML = '';
    for (let i = 0; i < copies; i++) {
        originalItems.forEach(item => {
            track.appendChild(item.cloneNode(true));
        });
    }

    // Tell CSS how far to shift
    track.style.setProperty('--shift', `${setWidth}px`);

    // Set animation duration based on the chosen speed
    const duration = setWidth / MARQUEE_SPEED;
    track.style.animationDuration = `${duration}s`;

    // Ensure the animation is applied (in case CSS was overridden)
    track.style.animationName = 'slide';
    track.style.animationTimingFunction = 'linear';
    track.style.animationIterationCount = 'infinite';
}