/* Runs before styles paint; System follows the device unless a choice was saved. */
(function () {
  'use strict';
  var key = 'brownie-theme';
  var root = document.documentElement;
  var system = window.matchMedia('(prefers-color-scheme: dark)');
  var preference = 'system';
  var modes = ['system', 'dark', 'light'];
  var icons = { system: 'monitor', dark: 'moon', light: 'sun' };
  var labels = { system: 'System', dark: 'Dark', light: 'Light' };

  function valid(value) {
    return value === 'dark' || value === 'light' || value === 'system' ? value : 'system';
  }

  function updateControls() {
    document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
      button.hidden = false;
      var next = modes[(modes.indexOf(preference) + 1) % modes.length];
      button.setAttribute('aria-label', 'Appearance: ' + labels[preference] + '. Switch to ' + labels[next] + '.');
      button.title = 'Appearance: ' + labels[preference] + '. Click for ' + labels[next] + '.';
      button.querySelector('[data-theme-icon]').style.setProperty('--icon',
        "url('assets/icons/" + icons[preference] + ".svg')");
    });
  }

  function apply() {
    var resolved = preference === 'system' ? (system.matches ? 'dark' : 'light') : preference;
    var changed = root.dataset.theme !== resolved;
    root.dataset.theme = resolved;
    root.dataset.themePreference = preference;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = resolved === 'dark' ? '#161615' : '#FEFCF9';
    updateControls();
    if (changed) window.dispatchEvent(new CustomEvent('brownie:themechange', {
      detail: { theme: resolved, preference: preference }
    }));
  }

  try { preference = valid(localStorage.getItem(key)); } catch (error) {}
  apply();
  system.addEventListener('change', function () { if (preference === 'system') apply(); });
  window.addEventListener('storage', function (event) {
    if (event.key !== key && event.key !== null) return;
    preference = valid(event.newValue);
    apply();
  });

  document.addEventListener('DOMContentLoaded', function () {
    updateControls();
    document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
      button.addEventListener('click', function () {
        preference = modes[(modes.indexOf(preference) + 1) % modes.length];
        try { localStorage.setItem(key, preference); } catch (error) {}
        apply();
        document.querySelectorAll('[data-theme-announcement]').forEach(function (status) {
          status.textContent = labels[preference] + ' appearance selected.';
        });
      });
    });
  });
})();
