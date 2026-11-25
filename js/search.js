/**
 * TravelEase — Universal Travel Search Panel (search.js)
 * Controls tab switching, dynamic form activations, location swap actions,
 * date picker defaults, passenger steppers, and interactive search handling.
 */

document.addEventListener('DOMContentLoaded', () => {
  initSearchTabs();
  initSwapButtons();
  initDateDefaults();
  initSearchFormSubmissions();
});

/**
 * Initializes category tabs for the universal travel search panel
 * (Flights, Trains, Buses, Hotels, Cabs, Car Rentals, Holiday Packages, Cruises)
 */
function initSearchTabs() {
  const tabButtons = document.querySelectorAll('.search-tab-btn');
  const forms = document.querySelectorAll('.search-form');

  if (!tabButtons.length || !forms.length) return;

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const category = btn.getAttribute('data-category');
      if (!category) return;

      // Update active tab button
      tabButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      // Update active search form
      forms.forEach((form) => {
        if (form.getAttribute('data-category') === category) {
          form.classList.add('active');
        } else {
          form.classList.remove('active');
        }
      });
    });
  });
}

/**
 * Swaps "From" and "To" values when the user clicks the swap icon button
 */
function initSwapButtons() {
  const swapButtons = document.querySelectorAll('.swap-btn');
  swapButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const parentForm = btn.closest('.search-form');
      if (!parentForm) return;

      const fromInput = parentForm.querySelector('[data-type="from"]');
      const toInput = parentForm.querySelector('[data-type="to"]');

      if (fromInput && toInput) {
        const temp = fromInput.value;
        fromInput.value = toInput.value;
        toInput.value = temp;

        if (window.showToast) {
          window.showToast('Locations swapped successfully', 'info');
        }
      }
    });
  });
}

/**
 * Pre-populates date pickers with realistic upcoming travel dates
 */
function initDateDefaults() {
  const today = new Date();
  
  // Tomorrow's date
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // Return date in 5 days
  const returnDate = new Date(today);
  returnDate.setDate(today.getDate() + 6);
  const returnDateStr = returnDate.toISOString().split('T')[0];

  document.querySelectorAll('input[type="date"]').forEach((input) => {
    if (!input.value) {
      if (input.getAttribute('data-date-type') === 'return') {
        input.value = returnDateStr;
      } else {
        input.value = tomorrowStr;
      }
      // Set min date to today so users cannot select past dates
      input.min = today.toISOString().split('T')[0];
    }
  });
}

/**
 * Handles universal search form submissions across all categories
 */
function initSearchFormSubmissions() {
  const forms = document.querySelectorAll('.search-form');
  forms.forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const category = form.getAttribute('data-category') || 'Travel';
      
      // Basic validation: verify required inputs
      const inputs = form.querySelectorAll('input, select');
      let isValid = true;
      let firstInvalidInput = null;

      inputs.forEach((input) => {
        if (input.hasAttribute('required') && !input.value.trim()) {
          isValid = false;
          input.style.borderColor = '#EF4444';
          if (!firstInvalidInput) firstInvalidInput = input;
        } else {
          input.style.borderColor = '';
        }
      });

      if (!isValid) {
        if (window.showToast) {
          window.showToast('Please fill in all required travel fields', 'error');
        }
        if (firstInvalidInput) firstInvalidInput.focus();
        return;
      }

      // Collect summary data
      const fromEl = form.querySelector('[data-type="from"]');
      const toEl = form.querySelector('[data-type="to"]');
      const destEl = form.querySelector('[data-type="destination"]');
      const origin = fromEl ? fromEl.value : 'Departure';
      const destination = toEl ? toEl.value : (destEl ? destEl.value : 'Selected Destination');

      // Feedback to user
      const submitBtn = form.querySelector('.form-submit-btn');
      const originalText = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.innerHTML = `
          <svg style="animation: spin 1s linear infinite; width: 18px; height: 18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10"></path>
          </svg>
          Searching...
        `;
        submitBtn.disabled = true;
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }

        if (window.showToast) {
          window.showToast(`Found 18+ verified ${category} options for ${destination}!`, 'success');
        }

        // Redirect to category search page if on home page
        const pageName = window.location.pathname.split('/').pop() || 'index.html';
        const categoryPages = {
          'flights': 'flights.html',
          'trains': 'trains.html',
          'buses': 'buses.html',
          'hotels': 'hotels.html',
          'cabs': 'cabs.html',
          'rentals': 'rentals.html',
          'packages': 'packages.html',
          'cruises': 'cruises.html'
        };

        if (pageName === 'index.html' || pageName === '') {
          const targetPage = categoryPages[category.toLowerCase()];
          if (targetPage) {
            setTimeout(() => {
              window.location.href = targetPage;
            }, 800);
          }
        }
      }, 700);
    });
  });
}
