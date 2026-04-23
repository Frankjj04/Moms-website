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
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.service-card, .testi-card, .gallery__item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  revealObserver.observe(el);
});

// ---- BOOKING FORM ----
const bookingForm = document.getElementById('bookingForm');
const toast = document.getElementById('toast');

bookingForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Basic validation
  let valid = true;
  ['fname', 'lname', 'phone', 'service', 'date'].forEach(id => {
    const el = document.getElementById(id);
    if (!el.value.trim()) {
      el.classList.add('error');
      valid = false;
    } else {
      el.classList.remove('error');
    }
  });

  if (!valid) {
    bookingForm.querySelector('.error')?.focus();
    return;
  }

  // Disable button while sending
  const submitBtn = bookingForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';

  // Build form data for Formspree
  const data = {
    name: `${document.getElementById('fname').value} ${document.getElementById('lname').value}`.trim(),
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value || 'Not provided',
    service: document.getElementById('service').value,
    preferredDate: document.getElementById('date').value,
    notes: document.getElementById('notes').value || 'None',
    newsletter: document.getElementById('newsletter').checked ? 'Yes' : 'No',
  };

  try {
    const res = await fetch('https://formspree.io/f/meevvgkg', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      // Save to localStorage as backup
      saveLead();
      // Show success toast
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 4000);
      bookingForm.reset();
    } else {
      alert('Something went wrong. Please call us directly at (614) 674-0328.');
    }
  } catch {
    alert('Network error. Please call us directly at (614) 674-0328.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Request Appointment ✦';
  }
});

// Remove error on input
bookingForm.querySelectorAll('input, select').forEach(el => {
  el.addEventListener('input', () => el.classList.remove('error'));
});

function saveLead() {
  const LEADS_KEY = 'mjcuts_leads';
  const leads = JSON.parse(localStorage.getItem(LEADS_KEY)) || [];

  const lead = {
    id: Date.now(),
    submittedAt: new Date().toISOString(),
    name: `${document.getElementById('fname').value} ${document.getElementById('lname').value}`.trim(),
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value,
    service: document.getElementById('service').value,
    date: document.getElementById('date').value,
    notes: document.getElementById('notes').value,
    newsletter: document.getElementById('newsletter').checked,
  };

  leads.push(lead);
  try {
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
  } catch {
    leads.shift();
    leads.push(lead);
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
  }

  // Expose leads viewer to console
  window.__leads = () => {
    const all = JSON.parse(localStorage.getItem(LEADS_KEY)) || [];
    console.table(all.map(l => ({
      submitted: new Date(l.id).toLocaleString(),
      name: l.name,
      phone: l.phone,
      service: l.service,
      preferredDate: l.date,
    })));
    return all;
  };
}
