/* =========================================
   CUTS BY LOPEZ — Script
   ========================================= */

// ---- NAV SCROLL EFFECT ----
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

// ---- HAMBURGER MENU ----
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ---- YEAR ----
document.getElementById('year').textContent = new Date().getFullYear();

// ---- DATE MIN ----
const dateInput = document.getElementById('date');
if (dateInput) {
  const today = new Date();
  today.setDate(today.getDate() + 1);
  dateInput.min = today.toISOString().split('T')[0];
}

// ---- VISITOR TRACKING ----
// Tracks unique visits using localStorage; stores visit log
function trackVisitor() {
  const STORAGE_KEY = 'mjcuts_visitors';
  const SESSION_KEY = 'mjcuts_session';

  // Build or load visitor log
  let visitors = [];
  try {
    visitors = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    visitors = [];
  }

  const totalCount = visitors.length;

  // Only add a new entry if no session yet (counts unique sessions)
  const alreadyTracked = sessionStorage.getItem(SESSION_KEY);
  if (!alreadyTracked) {
    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      page: location.pathname,
      referrer: document.referrer || 'direct',
      ua: navigator.userAgent.slice(0, 80),
    };
    visitors.push(entry);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(visitors));
    } catch {
      // Storage full — trim old entries
      visitors = visitors.slice(-200);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(visitors));
    }
    sessionStorage.setItem(SESSION_KEY, '1');
  }

  // Display count in hero
  const el = document.getElementById('visitor-count');
  if (el) el.textContent = visitors.length.toLocaleString();

  // Expose admin log to console for mom/owner to inspect
  window.__visitorLog = () => {
    const log = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    console.table(log.map(v => ({
      date: new Date(v.id).toLocaleString(),
      referrer: v.referrer,
    })));
    return log;
  };
}

trackVisitor();

// ---- COUNT-UP ANIMATION ----
function countUp(el, target, duration = 1800) {
  let start = 0;
  const step = Math.ceil(target / (duration / 16));
  const tick = () => {
    start = Math.min(start + step, target);
    el.textContent = start.toLocaleString();
    if (start < target) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.count, 10);
    if (!isNaN(target)) countUp(el, target);
    countObserver.unobserve(el);
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));

// ---- SCROLL REVEAL ----
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.service-card, .testi-card').forEach(el => {
  el.classList.add('reveal-ready');
  revealObserver.observe(el);
});

