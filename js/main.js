/**
 * TravelEase — Main Application JavaScript (main.js)
 * Manages toast notifications, interactive booking modals, coupon code copying,
 * newsletter validation, password visibility toggles, and shared UI interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
  initToastsContainer();
  initNewsletterForm();
  initCouponCopyButtons();
  initBookingModal();
  initPasswordToggles();
  initAuthFormValidation();
  initListingsFiltering();
});

/**
 * Toast Notification System
 */
let toastContainer = null;

function initToastsContainer() {
  toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
}

window.showToast = function (message, type = 'info') {
  if (!toastContainer) initToastsContainer();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconSvg = type === 'success' 
    ? `<svg style="width:18px;height:18px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`
    : type === 'error'
    ? `<svg style="width:18px;height:18px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`
    : `<svg style="width:18px;height:18px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;

  toast.innerHTML = `${iconSvg}<span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3800);
};

/**
 * Newsletter Form Validation & Handling
 */
function initNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  const emailInput = form.querySelector('.newsletter-input');
  const msgEl = form.querySelector('.newsletter-msg');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      if (msgEl) {
        msgEl.textContent = 'Please enter an email address.';
        msgEl.className = 'newsletter-msg error';
      }
      return;
    }

    if (!emailRegex.test(email)) {
      if (msgEl) {
        msgEl.textContent = 'Please enter a valid email address (e.g., name@example.com).';
        msgEl.className = 'newsletter-msg error';
      }
      return;
    }

    // Success response
    emailInput.value = '';
    if (msgEl) {
      msgEl.textContent = 'Thank you for subscribing to TravelEase insider travel perks!';
      msgEl.className = 'newsletter-msg success';
    }
    window.showToast('Subscription successful! Check your inbox for exclusive deals.', 'success');
  });
}

/**
 * Promotional Coupon Copy to Clipboard
 */
function initCouponCopyButtons() {
  const copyButtons = document.querySelectorAll('.copy-coupon-btn');
  copyButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const code = btn.getAttribute('data-code') || btn.parentElement.querySelector('.coupon-code').innerText;
      
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(() => {
          handleCopiedState(btn, code);
        }).catch(() => {
          fallbackCopy(code, btn);
        });
      } else {
        fallbackCopy(code, btn);
      }
    });
  });

  function fallbackCopy(code, btn) {
    const input = document.createElement('input');
    input.value = code;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    handleCopiedState(btn, code);
  }

  function handleCopiedState(btn, code) {
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    btn.style.color = '#10B981';
    window.showToast(`Promo code "${code}" copied to clipboard!`, 'success');
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.color = '';
    }, 2000);
  }
}

/**
 * Universal Booking & Inquiry Modal
 */
let modalOverlay = null;

function initBookingModal() {
  // Create or attach modal overlay
  modalOverlay = document.getElementById('booking-modal');
  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'booking-modal';
    modalOverlay.className = 'modal-overlay';
    modalOverlay.innerHTML = `
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title" id="modal-service-title">Confirm Booking</h3>
          <button class="modal-close-btn" aria-label="Close modal">
            <svg style="width:18px;height:18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p id="modal-service-desc" style="font-size:0.875rem; color:var(--text-muted); margin-bottom:1.25rem;">
            Review your selected travel experience and proceed with reservation request.
          </p>
          <form id="modal-booking-form" style="display:flex; flex-direction:column; gap:1rem;">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input type="text" class="form-input" required placeholder="e.g. Alex Henderson">
            </div>
            <div class="form-group">
              <label class="form-label">Contact Email</label>
              <input type="email" class="form-input" required placeholder="alex@example.com">
            </div>
            <div class="form-group">
              <label class="form-label">Phone Number</label>
              <input type="tel" class="form-input" required placeholder="+1 (555) 000-0000">
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
              <div class="form-group">
                <label class="form-label">Travel Date</label>
                <input type="date" class="form-input" required>
              </div>
              <div class="form-group">
                <label class="form-label">Travelers</label>
                <select class="form-select">
                  <option value="1">1 Traveler</option>
                  <option value="2" selected>2 Travelers</option>
                  <option value="3">3 Travelers</option>
                  <option value="4">4+ Travelers</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Special Requests (Optional)</label>
              <textarea class="form-input" rows="2" placeholder="Dietary preference, wheelchair access, window seat, etc."></textarea>
            </div>
            <div style="background:var(--bg-subtle); padding:1rem; border-radius:var(--radius-md); display:flex; justify-content:space-between; align-items:center;">
              <div>
                <span style="font-size:0.75rem; color:var(--text-muted); display:block;">Estimated Total</span>
                <span id="modal-estimated-price" style="font-size:1.25rem; font-weight:800; color:var(--primary-navy);">₹4,999</span>
              </div>
              <span style="font-size:0.75rem; font-weight:600; color:var(--accent-teal); background:#CCFBF1; padding:0.25rem 0.5rem; border-radius:4px;">Best Rate Guaranteed</span>
            </div>
            <button type="submit" class="btn btn-primary" style="margin-top:0.5rem; width:100%; height:46px;">
              Confirm Booking Request
            </button>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(modalOverlay);
  }

  // Close triggers
  const closeBtn = modalOverlay.querySelector('.modal-close-btn');
  closeBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // Modal Form Submission
  const bookingForm = document.getElementById('modal-booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const refNum = 'TE-' + Math.floor(100000 + Math.random() * 900000);
      closeModal();
      window.showToast(`Booking request submitted! Reference: #${refNum}`, 'success');
    });
  }

  // Attach to trigger buttons
  document.querySelectorAll('[data-action="book"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const title = btn.getAttribute('data-title') || 'Travel Reservation';
      const price = btn.getAttribute('data-price') || '₹4,999';
      const desc = btn.getAttribute('data-desc') || 'Instant confirmation with zero reservation fees.';
      window.openBookingModal(title, price, desc);
    });
  });
}

window.openBookingModal = function (title, price = '₹4,999', desc = '') {
  if (!modalOverlay) initBookingModal();
  const titleEl = document.getElementById('modal-service-title');
  const priceEl = document.getElementById('modal-estimated-price');
  const descEl = document.getElementById('modal-service-desc');

  if (titleEl) titleEl.textContent = title;
  if (priceEl) priceEl.textContent = price;
  if (descEl && desc) descEl.textContent = desc;

  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
};

function closeModal() {
  if (!modalOverlay) return;
  modalOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

/**
 * Toggle Password Visibility (Login & Signup)
 */
function initPasswordToggles() {
  document.querySelectorAll('.password-toggle-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      if (!input) return;

      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';

      btn.innerHTML = isPassword
        ? `<svg style="width:18px;height:18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`
        : `<svg style="width:18px;height:18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
    });
  });
}

/**
 * Authentication Form Validation (Login & Signup)
 */
function initAuthFormValidation() {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = loginForm.querySelector('[type="email"]').value;
      const pass = loginForm.querySelector('[type="password"]').value;

      if (!email || !pass) {
        window.showToast('Please enter both email and password', 'error');
        return;
      }

      window.showToast('Welcome back! Logging you in...', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    });
  }

  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const pass = document.getElementById('signup-password')?.value;
      const confirmPass = document.getElementById('signup-confirm-password')?.value;

      if (pass && confirmPass && pass !== confirmPass) {
        window.showToast('Passwords do not match. Please verify.', 'error');
        return;
      }

      window.showToast('Account created successfully! Welcome to TravelEase.', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1200);
    });
  }
}

/**
 * Filter checkboxes for secondary search listing pages
 */
function initListingsFiltering() {
  const filterInputs = document.querySelectorAll('.filter-checkbox input');
  if (!filterInputs.length) return;

  filterInputs.forEach((input) => {
    input.addEventListener('change', () => {
      window.showToast('Updated travel results based on selected filters', 'info');
    });
  });
}
