/* Progressive enhancement. Navigation, FAQs, and downloads also work without JS. */
(function () {
  'use strict';
  var config = window.SITE_CONFIG || {};

  function initMobileMenu() {
    var menu = document.querySelector('.mobile-menu');
    if (!menu) return;
    var summary = menu.querySelector('summary');
    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) menu.open = false;
    });
    document.addEventListener('click', function (event) {
      if (!menu.contains(event.target)) menu.open = false;
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menu.open) {
        menu.open = false;
        summary.focus();
      }
    });
    window.matchMedia('(min-width: 701px)').addEventListener('change', function (event) {
      if (event.matches) menu.open = false;
    });
  }

  function initLatestRelease() {
    if (!config.releasesApiUrl) return;
    var notice = document.getElementById('releaseStatusNotice');
    function updateAll(selector, text) {
      document.querySelectorAll(selector).forEach(function (element) {
        element.textContent = text;
      });
    }
    // Static HTML links to official releases, including when the API is unavailable.
    fetch(config.releasesApiUrl, {
      headers: { Accept: 'application/vnd.github+json' }
    }).then(function (response) {
      if (!response.ok) throw new Error('Release information unavailable');
      return response.json();
    }).then(function (release) {
      if (!release || release.draft) return;
      updateAll('.js-release-version', release.tag_name || release.name || 'Latest release');
      if (release.published_at) {
        var date = new Date(release.published_at);
        if (!Number.isNaN(date.getTime())) updateAll('.js-release-date', date.toLocaleDateString(undefined, {
          year: 'numeric', month: 'short', day: 'numeric'
        }));
      }
      var apk = (Array.isArray(release.assets) ? release.assets : []).find(function (asset) {
        return /\.apk$/i.test(asset.name || '') && typeof asset.browser_download_url === 'string' &&
          asset.browser_download_url.indexOf('https://github.com/' + config.repoOwner + '/' + config.repoName + '/releases/download/') === 0;
      });
      if (!apk) {
        if (notice) notice.textContent = 'Find available downloads on our official GitHub Releases page.';
        return;
      }
      if (typeof apk.size === 'number') updateAll('.js-release-size', (apk.size / 1048576).toFixed(1) + ' MB');
      document.querySelectorAll('.js-download-btn').forEach(function (button) { button.href = apk.browser_download_url; });
      if (notice) notice.textContent = 'Latest Android release: ' + (release.tag_name || release.name || apk.name) + '. Downloaded from GitHub.';
    }).catch(function () {
      if (notice) notice.textContent = 'Live release details are unavailable. The download button opens our official GitHub Releases page.';
    });
  }

  function initHydrationDemo() {
    var value = document.getElementById('demoValDisplay');
    var percentage = document.getElementById('demoPctDisplay');
    var progress = document.getElementById('demoProgress');
    var hint = document.getElementById('demoFactorHint');
    var reset = document.getElementById('demoResetBtn');
    if (!value || !progress) return;
    var goal = Number(config.demoGoalMl) > 0 ? Number(config.demoGoalMl) : 2500;
    var total = 500;
    var drinks = Array.isArray(config.beverages) ? config.beverages : [];
    function update() {
      var percent = Math.min(100, Math.round(total / goal * 100));
      value.textContent = total.toLocaleString() + ' ml';
      percentage.textContent = percent + '% of ' + goal.toLocaleString() + ' ml';
      progress.max = goal;
      progress.value = Math.min(goal, total);
      progress.textContent = percent + '%';
    }
    document.querySelectorAll('[data-drink]').forEach(function (button) {
      button.addEventListener('click', function () {
        var drink = drinks.find(function (item) { return item.id === button.dataset.drink; });
        if (!drink) return;
        var amount = Math.round(drink.defaultAmount * drink.factor);
        total = Math.min(goal, total + amount);
        update();
        hint.textContent = total >= goal ? 'Sample goal reached. A little progress, one sip at a time. Reset to try again.' :
          drink.name + ' added: ' + amount + ' ml estimated contribution from a ' + drink.defaultAmount + ' ml drink.';
      });
    });
    if (reset) reset.addEventListener('click', function () {
      total = 0;
      update();
      hint.textContent = 'A fresh start. Choose a drink to add your next sip.';
    });
    update();
  }

  function initPlayStore() {
    if (!config.playStoreUrl || !/^https:\/\/play\.google\.com\/store\/apps\/details\?/.test(config.playStoreUrl)) return;
    document.querySelectorAll('.js-playstore-area').forEach(function (area) {
      var anchor = document.createElement('a');
      anchor.href = config.playStoreUrl;
      anchor.className = 'btn btn-secondary';
      anchor.textContent = 'Get Brownie on Google Play';
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      area.replaceChildren(anchor);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initLatestRelease();
    initHydrationDemo();
    initPlayStore();
    document.querySelectorAll('.js-current-year').forEach(function (element) { element.textContent = new Date().getFullYear(); });
    document.querySelectorAll('[data-cookie-settings]').forEach(function (button) {
      button.addEventListener('click', function (event) {
        if (typeof window.resetPrivacyConsent === 'function') window.resetPrivacyConsent(event);
      });
    });
  });
})();
