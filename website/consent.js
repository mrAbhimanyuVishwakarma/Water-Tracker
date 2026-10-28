/**
 * Analytics and Privacy Consent Controller for Brownie Water Tracker
 * 
 * By default, NO cookies or tracking scripts are loaded.
 * If Google Analytics or other telemetry is configured in the future,
 * it will only execute after explicit user consent via this banner.
 */
(function() {
  'use strict';

  var STORAGE_KEY = 'brownie-consent-choice'; // 'granted' | 'denied'
  var banner = null;

  function readChoice() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function saveChoice(val) {
    try {
      localStorage.setItem(STORAGE_KEY, val);
    } catch (e) {
      // In private browsing, save fails silently
    }
  }

  function hideBanner() {
    if (banner) {
      banner.style.display = 'none';
      banner.setAttribute('aria-hidden', 'true');
    }
  }

  function showBanner() {
    if (!banner) {
      banner = createBanner();
    }
    banner.style.display = 'block';
    banner.setAttribute('aria-hidden', 'false');
    var acceptBtn = banner.querySelector('[data-consent="accept"]');
    if (acceptBtn) {
      acceptBtn.focus();
    }
  }

  function createBanner() {
    var el = document.createElement('div');
    el.id = 'consentBanner';
    el.className = 'consent-banner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-label', 'Cookie and privacy preferences');
    el.style.display = 'none';

    el.innerHTML = [
      '<div class="consent-container">',
      '  <div class="consent-text">',
      '    <p><strong>Privacy First:</strong> Brownie Water Tracker does not track you across the web. We do not use third-party advertising cookies. Optional anonymous analytics help us improve our pages, but only if you choose to enable them. <a href="privacy.html">Read our Privacy Policy</a>.</p>',
      '  </div>',
      '  <div class="consent-buttons">',
      '    <button type="button" class="btn btn-secondary btn-sm" data-consent="reject">Decline</button>',
      '    <button type="button" class="btn btn-primary btn-sm" data-consent="accept">Accept</button>',
      '  </div>',
      '</div>'
    ].join('');

    document.body.appendChild(el);

    el.querySelector('[data-consent="reject"]').addEventListener('click', function() {
      saveChoice('denied');
      hideBanner();
    });

    el.querySelector('[data-consent="accept"]').addEventListener('click', function() {
      saveChoice('granted');
      hideBanner();
      // Future analytics loader can hook in here
    });

    return el;
  }

  // Check consent when DOM is ready
  function init() {
    // Respect Global Privacy Control (GPC) if available
    if (navigator.globalPrivacyControl) {
      saveChoice('denied');
      return;
    }

    var current = readChoice();
    if (!current) {
      // Show consent after a gentle delay
      setTimeout(showBanner, 1200);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose reset function for footer link
  window.resetPrivacyConsent = function(e) {
    if (e && e.preventDefault) e.preventDefault();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {}
    showBanner();
  };
})();
