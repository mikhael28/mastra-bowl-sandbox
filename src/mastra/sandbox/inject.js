/**
 * Mastra Studio Sandbox Tab Injector
 *
 * Injects a "Sandbox" navigation item into the Studio sidebar.
 * When clicked, an iframe overlays the main content area and loads
 * the user's sandbox page from ./assets/sandbox-page.html.
 *
 * This script is copied into the Studio assets directory by the
 * patch-studio.mjs script and loaded via a <script> tag in index.html.
 */
(function () {
  'use strict';

  var BASE = window.MASTRA_STUDIO_BASE_PATH || '';
  var PAGE_URL = BASE + '/assets/sandbox-page.html';
  var NAV_ID = 'mastra-sandbox-nav';
  var IFRAME_ID = 'mastra-sandbox-iframe';

  // Simple code-brackets icon (matches Lucide style used by Studio)
  var ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" ' +
    'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>';

  var active = false;

  // ── Helpers ──────────────────────────────────────────────────────

  /** Find the <ul> that holds the Primitives nav links (Agents, Workflows, etc.) */
  function findNavList() {
    var link = document.querySelector('a[href="/agents"]');
    if (!link) return null;
    var li = link.closest('li');
    return li ? li.parentElement : null;
  }

  /** Find the main content div (sibling of sidebar in the grid layout). */
  function findMainContent() {
    var link = document.querySelector('a[href="/agents"]');
    if (!link) return null;

    // Walk up from the agents link to the grid container
    var el = link;
    while (el) {
      if (el.className && typeof el.className === 'string' && el.className.indexOf('grid-cols-') !== -1) {
        // The main content is the last child of the grid container
        return el.children[el.children.length - 1] || null;
      }
      el = el.parentElement;
    }
    return null;
  }

  // ── Nav item injection ──────────────────────────────────────────

  function injectNavItem() {
    if (document.getElementById(NAV_ID)) return;

    var navList = findNavList();
    if (!navList) return;

    // Clone an existing <li> to inherit all Tailwind classes
    var template = navList.querySelector('li');
    if (!template) return;

    var li = template.cloneNode(true);
    li.id = NAV_ID;

    var link = li.querySelector('a');
    if (!link) return;

    // Swap href — use a data attribute so React Router ignores it
    link.setAttribute('href', '#sandbox');
    link.removeAttribute('data-discover');

    // Replace the SVG icon
    var oldSvg = link.querySelector('svg');
    if (oldSvg) {
      var wrapper = document.createElement('span');
      wrapper.innerHTML = ICON;
      var newSvg = wrapper.firstElementChild;
      // Carry over sizing classes from the original SVG
      if (oldSvg.getAttribute('class')) {
        newSvg.setAttribute('class', oldSvg.getAttribute('class'));
      }
      oldSvg.replaceWith(newSvg);
    }

    // Replace the label text — find the deepest <span> with text content
    var spans = link.querySelectorAll('span');
    for (var i = 0; i < spans.length; i++) {
      var s = spans[i];
      if (s.children.length === 0 && s.textContent.trim()) {
        s.textContent = 'Sandbox';
        break;
      }
    }

    // Remove any active-state indicator from the clone
    clearActiveClasses(li);

    // Click handler
    link.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (active) {
        hideSandbox();
      } else {
        showSandbox();
      }
    });

    navList.appendChild(li);
  }

  // ── Active state helpers ────────────────────────────────────────

  var ACTIVE_MARKERS = ['bg-surface3', 'text-neutral5', 'before:absolute'];

  function clearActiveClasses(li) {
    if (!li || typeof li.className !== 'string') return;
    // Remove known active-state classes
    ACTIVE_MARKERS.forEach(function (cls) {
      li.className = li.className
        .split(' ')
        .filter(function (c) { return c.indexOf(cls) === -1; })
        .join(' ');
    });
    var a = li.querySelector('a');
    if (a && typeof a.className === 'string') {
      ACTIVE_MARKERS.forEach(function (cls) {
        a.className = a.className
          .split(' ')
          .filter(function (c) { return c.indexOf(cls) === -1; })
          .join(' ');
      });
    }
  }

  function setActiveIndicator(on) {
    var li = document.getElementById(NAV_ID);
    if (!li) return;
    var a = li.querySelector('a');
    if (!a) return;
    if (on) {
      // Apply the same visual cues as Studio's active links
      a.style.backgroundColor = 'var(--surface3, rgba(255,255,255,0.08))';
      a.style.color = 'var(--neutral5, #e5e5e5)';
    } else {
      a.style.backgroundColor = '';
      a.style.color = '';
    }
  }

  // ── Sandbox show / hide ─────────────────────────────────────────

  function showSandbox() {
    if (document.getElementById(IFRAME_ID)) return;

    var main = findMainContent();
    if (!main) {
      console.warn('[Sandbox] Could not locate main content area');
      return;
    }

    // Ensure the container is positioned so the iframe can overlay it
    var pos = getComputedStyle(main).position;
    if (pos === 'static') {
      main.dataset.sandboxRestoredPosition = 'true';
      main.style.position = 'relative';
    }

    var iframe = document.createElement('iframe');
    iframe.id = IFRAME_ID;
    iframe.src = PAGE_URL;
    iframe.style.cssText = [
      'position:absolute',
      'inset:0',
      'width:100%',
      'height:100%',
      'border:none',
      'z-index:50',
      'background:#0a0a0a',
    ].join(';');

    main.appendChild(iframe);
    active = true;
    setActiveIndicator(true);
    history.pushState({ sandbox: true }, '', '#sandbox');
  }

  function hideSandbox() {
    var iframe = document.getElementById(IFRAME_ID);
    if (iframe) {
      var parent = iframe.parentElement;
      iframe.remove();
      // Restore original positioning if we changed it
      if (parent && parent.dataset.sandboxRestoredPosition) {
        parent.style.position = '';
        delete parent.dataset.sandboxRestoredPosition;
      }
    }
    active = false;
    setActiveIndicator(false);
    if (location.hash === '#sandbox') {
      history.replaceState(null, '', location.pathname + location.search);
    }
  }

  // ── Event listeners ─────────────────────────────────────────────

  function setupListeners() {
    // Hide sandbox when the user clicks any other nav link
    document.addEventListener(
      'click',
      function (e) {
        if (!active) return;
        var link = e.target.closest('a');
        if (!link) return;
        // Ignore clicks on the sandbox link itself
        if (link.closest('#' + NAV_ID)) return;
        hideSandbox();
      },
      true
    );

    // Handle browser back/forward
    window.addEventListener('popstate', function () {
      if (active && location.hash !== '#sandbox') {
        hideSandbox();
      } else if (!active && location.hash === '#sandbox') {
        showSandbox();
      }
    });
  }

  // ── Bootstrap ───────────────────────────────────────────────────

  function init() {
    // Re-inject the nav item whenever React re-renders the sidebar
    var observer = new MutationObserver(function () {
      if (
        document.querySelector('a[href="/agents"]') &&
        !document.getElementById(NAV_ID)
      ) {
        injectNavItem();
        if (active) setActiveIndicator(true);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Try immediately
    injectNavItem();
    setupListeners();

    // Restore sandbox if URL hash says so
    if (location.hash === '#sandbox') {
      var attempt = 0;
      var tryOpen = setInterval(function () {
        attempt++;
        if (findMainContent()) {
          clearInterval(tryOpen);
          showSandbox();
        }
        if (attempt > 50) clearInterval(tryOpen);
      }, 100);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
