/* =========================================================
   FOOTER YEAR — auto-increment, future-proof against
   async/defer/dynamic script loading
   ========================================================= */
function setFooterYear() {
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = String(new Date().getFullYear());
    }
}

/* =========================================================
   HELPERS
   ========================================================= */

/* Turn a full URL into something short & readable.
   "https://agunechemba.name.ng/" -> "agunechemba.name.ng"
   Falls back to the raw string if it isn't a valid URL. */
function shortenUrl(url) {
    try {
        const u = new URL(url);
        return u.hostname.replace(/^www\./, '');
    } catch (_) {
        return url;
    }
}

/* Escape values before dropping them into template-literal HTML. */
function escAttr(s) {
    return String(s).replace(/[&<>"']/g, c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[c]));
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
                <div class="image-placeholder" style="background-image: url('${escAttr(prodigy.image || '')}')">
                    ${!prodigy.image ? 'Image' : ''}
                </div>
                <ul class="details-list">
                    <li><strong>Year:</strong> <span>${escAttr(prodigy.year)}</span></li>
                    <li><strong>Full name:</strong> <span>${escAttr(prodigy.fullName)}</span></li>
                    <li><strong>Age:</strong> <span>${prodigy.age ?? '—'}</span></li>
                    <li><strong>Nationality:</strong> <span>${escAttr(prodigy.nationality)}</span></li>
                    <li><strong>Hobbies:</strong> <span>${escAttr(prodigy.hobbies)}</span></li>
                    <li>
                        <strong>URL:</strong>
                        <a href="${escAttr(prodigy.url)}"
                           target="_blank"
                           rel="noopener noreferrer"
                           title="${escAttr(prodigy.url)}">${escAttr(shortenUrl(prodigy.url))}</a>
                    </li>
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
        if (track.dataset.originalHTML) return;
        track.dataset.originalHTML = track.innerHTML;
        buildMarquee(track);
    });

    window.addEventListener('resize', () => {
        clearTimeout(marqueeResizeTimer);
        marqueeResizeTimer = setTimeout(() => {
            tracks.forEach(track => buildMarquee(track));
        }, 200);
    });
}

function buildMarquee(track) {
    const wrapper = track.parentElement;
    if (!wrapper) return;

    track.innerHTML = track.dataset.originalHTML;
    const originalItems = Array.from(track.children);
    if (originalItems.length === 0) return;

    const wrapperWidth = wrapper.clientWidth;
    if (wrapperWidth === 0) return;

    const style = getComputedStyle(track);
    const gap = parseFloat(style.gap) || 0;

    let originalItemsWidth = 0;
    originalItems.forEach(item => {
        originalItemsWidth += item.getBoundingClientRect().width;
    });

    const setWidth = originalItemsWidth + originalItems.length * gap;
    const copiesNeeded = Math.ceil(wrapperWidth / setWidth) + 1;
    const copies = Math.max(2, copiesNeeded);

    track.innerHTML = '';
    for (let i = 0; i < copies; i++) {
        originalItems.forEach(item => {
            track.appendChild(item.cloneNode(true));
        });
    }

    track.style.setProperty('--shift', `${setWidth}px`);
    const duration = setWidth / MARQUEE_SPEED;
    track.style.animationDuration = `${duration}s`;
    track.style.animationName = 'slide';
    track.style.animationTimingFunction = 'linear';
    track.style.animationIterationCount = 'infinite';
}