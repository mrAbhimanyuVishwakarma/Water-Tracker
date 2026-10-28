/**
 * Brownie Water Tracker - Client Interactions & Progressive Enhancement
 * 
 * Includes:
 * - Theme controller with persistence
 * - Mobile navigation menu with accessibility
 * - Dynamic GitHub Release API integration with resilient static fallbacks
 * - Interactive hydration preview widget with accurate drink multipliers
 * - Header scroll shadow
 * - Copyright year synchronizer
 */
(function() {
  'use strict';

  var config = window.SITE_CONFIG || {
    releasesPageUrl: "https://github.com/mrAbhimanyuVishwakarma/Water-Tracker/releases/latest",
    releasesApiUrl: "https://api.github.com/repos/mrAbhimanyuVishwakarma/Water-Tracker/releases/latest",
    playStoreUrl: "",
    demoGoalMl: 2500
  };

  document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initMobileNav();
    initHeaderScroll();
    initLatestRelease();
    initHydrationDemo();
    initPlayStoreState();
    syncCopyrightYear();
  });

  /* --------------------------------------------------------------------------
     Theme Management (Light / Dark)
     -------------------------------------------------------------------------- */
  function initTheme() {
    var toggleBtn = document.getElementById('themeToggleBtn');
    var saved = null;
    try {
      saved = localStorage.getItem('brownie-theme');
    } catch (e) {}

    var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = saved || (systemDark ? 'dark' : 'light');
    applyTheme(theme);

    if (toggleBtn) {
      toggleBtn.addEventListener('click', function() {
        var current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        var next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        try {
          localStorage.setItem('brownie-theme', next);
        } catch (e) {}
      });
    }

    // Listen to system theme updates if not overridden
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
      var userSet = null;
      try { userSet = localStorage.getItem('brownie-theme'); } catch (err) {}
      if (!userSet) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  /* --------------------------------------------------------------------------
     Mobile Navigation
     -------------------------------------------------------------------------- */
  function initMobileNav() {
    var toggle = document.querySelector('.mobile-menu-toggle');
    var drawer = document.querySelector('.mobile-nav-drawer');
    if (!toggle || !drawer) return;

    function openDrawer() {
      drawer.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
      drawer.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', function() {
      var isOpen = drawer.classList.contains('open');
      if (isOpen) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    // Close when clicking any nav link
    drawer.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', closeDrawer);
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        closeDrawer();
        toggle.focus();
      }
    });
  }

  /* --------------------------------------------------------------------------
     Header Scroll Shadow
     -------------------------------------------------------------------------- */
  function initHeaderScroll() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    window.addEventListener('scroll', function() {
      if (window.scrollY > 20) {
        header.classList.add('header-scrolled');
      } else {
        header.classList.remove('header-scrolled');
      }
    }, { passive: true });
  }

  /* --------------------------------------------------------------------------
     GitHub Latest Release Fetcher (Progressive Enhancement)
     -------------------------------------------------------------------------- */
  function initLatestRelease() {
    var versionEls = document.querySelectorAll('.js-release-version');
    var sizeEls = document.querySelectorAll('.js-release-size');
    var dateEls = document.querySelectorAll('.js-release-date');
    var downloadBtns = document.querySelectorAll('.js-download-btn');
    var statusNotice = document.getElementById('releaseStatusNotice');

    // Default static fallback values are already present in HTML.
    // Fetch latest release details from GitHub API:
    fetch(config.releasesApiUrl, {
      cache: 'no-store',
      headers: { 'Accept': 'application/vnd.github+json' }
    })
    .then(function(res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function(data) {
      if (!data) return;

      var tag = data.tag_name || data.name || 'Latest';
      versionEls.forEach(function(el) {
        el.textContent = tag + ' (Latest)';
      });

      if (data.published_at) {
        var d = new Date(data.published_at);
        var formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        dateEls.forEach(function(el) {
          el.textContent = formattedDate;
        });
      }

      // Look for an installable Android APK in assets
      if (data.assets && Array.isArray(data.assets) && data.assets.length > 0) {
        var apkAsset = null;
        // Prefer official production/beta apk over debug
        for (var i = 0; i < data.assets.length; i++) {
          var a = data.assets[i];
          if (a.name && a.name.toLowerCase().endsWith('.apk')) {
            apkAsset = a;
            break;
          }
        }

        if (apkAsset && apkAsset.browser_download_url) {
          var sizeMb = (apkAsset.size / (1024 * 1024)).toFixed(1) + ' MB';
          sizeEls.forEach(function(el) {
            el.textContent = sizeMb;
          });

          downloadBtns.forEach(function(btn) {
            btn.href = '/api/download';
            btn.removeAttribute('download');
            btn.setAttribute('title', 'Direct Download: ' + apkAsset.name + ' (' + sizeMb + ')');
          });

          if (statusNotice) {
            statusNotice.textContent = 'Verified release: ' + apkAsset.name + ' (' + sizeMb + ') ready for direct download.';
            statusNotice.className = 'release-status-success';
          }
        }
      }
    })
    .catch(function(err) {
      // Fallback remains the static GitHub Releases page
      if (statusNotice) {
        statusNotice.textContent = 'Direct download lookup unavailable. You can download directly from the official GitHub Releases page.';
        statusNotice.className = 'release-status-fallback';
      }
      console.warn('GitHub release API check:', err.message);
    });
  }

  /* --------------------------------------------------------------------------
     Google Play Store Integration State
     -------------------------------------------------------------------------- */
  function initPlayStoreState() {
    var playWrappers = document.querySelectorAll('.js-playstore-area');
    if (!playWrappers.length) return;

    if (config.playStoreUrl && /^https:\/\//i.test(config.playStoreUrl)) {
      playWrappers.forEach(function(area) {
        area.innerHTML = [
          '<a href="' + config.playStoreUrl + '" class="btn btn-secondary btn-lg" target="_blank" rel="noopener noreferrer">',
          '  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3.6 1.8c-.2.2-.4.6-.4 1.1v18.2c0 .5.2.9.4 1.1l9.5-10.2L3.6 1.8zm12.3 7.8l-2.8-1.7-8.3-4.9 11.1 6.6zm0 4.8L4.8 21l8.3-4.9 2.8-1.7zm1.1-1.2l3.4 2c1 .6 1 1.6 0 2.2l-2.3 1.3-3.2-3.4 2.1-2.1z"/></svg>',
          '  Get on Google Play',
          '</a>'
        ].join('');
      });
    }
  }

  /* --------------------------------------------------------------------------
     Interactive Hydration Demonstration
     -------------------------------------------------------------------------- */
  function initHydrationDemo() {
    var vessel = document.getElementById('demoVesselLiquid');
    var valEl = document.getElementById('demoValDisplay');
    var pctEl = document.getElementById('demoPctDisplay');
    var hintEl = document.getElementById('demoFactorHint');
    var resetBtn = document.getElementById('demoResetBtn');
    var buttons = document.querySelectorAll('[data-drink]');

    if (!vessel || !valEl) return;

    var currentEffectiveMl = 0;
    var goalMl = config.demoGoalMl || 2500;

    var drinkData = {
      water: { name: 'Water', factor: 1.0, amount: 250, desc: 'Pure hydration (1.0x)' },
      green_tea: { name: 'Green Tea', factor: 0.95, amount: 300, desc: 'Gentle hydration with antioxidants (0.95x)' },
      coffee: { name: 'Coffee', factor: 0.80, amount: 200, desc: 'Mild diuretic effect accounted for (0.80x)' },
      juice: { name: 'Juice', factor: 0.85, amount: 250, desc: 'Hydrating with natural sugars (0.85x)' },
      electrolyte: { name: 'Electrolyte', factor: 1.0, amount: 500, desc: 'Optimal sports rehydration (1.0x)' }
    };

    function updateDisplay(drinkLogged) {
      var pct = Math.min(Math.round((currentEffectiveMl / goalMl) * 100), 100);
      vessel.style.height = pct + '%';
      valEl.textContent = currentEffectiveMl + ' ml';
      if (pctEl) {
        pctEl.textContent = pct + '% of 2,500 ml goal';
      }

      if (drinkLogged && hintEl) {
        var net = Math.round(drinkLogged.amount * drinkLogged.factor);
        hintEl.innerHTML = '<strong>Logged ' + drinkLogged.name + ' (' + drinkLogged.amount + ' ml):</strong> added <strong>+' + net + ' ml</strong> effective hydration (' + drinkLogged.desc + ').';
      }
    }

    buttons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var key = btn.getAttribute('data-drink');
        var d = drinkData[key];
        if (!d) return;

        var netAmount = Math.round(d.amount * d.factor);
        currentEffectiveMl = Math.min(currentEffectiveMl + netAmount, 3500);
        updateDisplay(d);
      });
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        currentEffectiveMl = 0;
        updateDisplay(null);
        if (hintEl) {
          hintEl.textContent = 'Tap any drink above to preview effective hydration calculations.';
        }
      });
    }

    // Initialize with a friendly starting sip
    currentEffectiveMl = 500;
    updateDisplay(null);
  }

  /* --------------------------------------------------------------------------
     Copyright Year Sync
     -------------------------------------------------------------------------- */
  function syncCopyrightYear() {
    var yearEls = document.querySelectorAll('.js-current-year');
    var yr = new Date().getFullYear();
    yearEls.forEach(function(el) {
      el.textContent = yr;
    });
  }
})();
