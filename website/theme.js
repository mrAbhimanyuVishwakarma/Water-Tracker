/* Runs before styles paint; System follows the device unless a choice was saved. */
(function () {
  'use strict';
  var key = 'brownie-theme';
  var root = document.documentElement;
  var system = window.matchMedia('(prefers-color-scheme: dark)');
  var preference = 'system';
  var icons = { system: 'monitor', dark: 'moon', light: 'sun' };
  var labels = { system: 'System', dark: 'Dark', light: 'Light' };

  function valid(value) {
    return value === 'dark' || value === 'light' || value === 'system' ? value : 'system';
  }

  function updateControls() {
    document.querySelectorAll('[data-theme-picker]').forEach(function (picker) {
      picker.hidden = false;
      var summary = picker.querySelector('summary');
      summary.setAttribute('aria-label', 'Appearance: ' + labels[preference]);
      summary.title = 'Appearance: ' + labels[preference];
      picker.querySelector('[data-theme-label]').textContent = labels[preference];
      picker.querySelector('[data-theme-icon]').style.setProperty('--icon',
        "url('assets/icons/" + icons[preference] + ".svg')");
      picker.querySelectorAll('input[name="color-theme"]').forEach(function (radio) {
        radio.checked = radio.value === preference;
      });
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
    document.querySelectorAll('[data-theme-picker]').forEach(function (picker) {
      picker.addEventListener('change', function (event) {
        if (event.target.name !== 'color-theme') return;
        preference = valid(event.target.value);
        try { localStorage.setItem(key, preference); } catch (error) {}
        apply();
      });
      document.addEventListener('click', function (event) {
        if (!picker.contains(event.target)) picker.open = false;
      });
      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && picker.open) {
          picker.open = false;
          picker.querySelector('summary').focus();
        }
      });
    });
  });
})();
