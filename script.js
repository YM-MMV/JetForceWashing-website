/* JetForce Washing — site behaviour
   Mobile nav, sticky header state, scroll reveals and the quote form. */

(function () {
  'use strict';

  /* ------------------------------------------------------ Current year -- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* --------------------------------------------------------- Mobile nav -- */
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');

  function closeNav() {
    if (!nav || !toggle) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    // Close after picking a destination, or on Escape.
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        closeNav();
        toggle.focus();
      }
    });

    // Reset the menu if the viewport grows past the mobile breakpoint.
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) closeNav();
    });
  }

  /* ---------------------------------------------------- Sticky header -- */
  var header = document.getElementById('siteHeader');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------------------------------ Scroll reveal -- */
  var reveals = document.querySelectorAll('.reveal');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced || !('IntersectionObserver' in window)) {
    // No animation: just show everything.
    Array.prototype.forEach.call(reveals, function (el) {
      el.classList.add('is-visible');
    });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(reveals, function (el) {
      observer.observe(el);
    });
  }

  /* --------------------------------------------------------- Quote form -- */
  var form = document.getElementById('quoteForm');
  if (!form) return;

  var button = document.getElementById('submitBtn');
  var status = document.getElementById('formStatus');
  var idleLabel = button ? button.textContent : 'Send my request';

  function setStatus(message, state) {
    if (!status) return;
    status.textContent = message;
    status.className = 'form-status' + (state ? ' is-' + state : '');
  }

  form.addEventListener('submit', function (e) {
    // Let the browser show its own validation UI first.
    if (!form.checkValidity()) return;

    e.preventDefault();

    if (button) {
      button.disabled = true;
      button.textContent = 'Sending…';
    }
    setStatus('', '');

    fetch(form.action, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form)
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Request failed');
        form.reset();
        setStatus('Thanks — your request is in. We’ll be in touch shortly.', 'ok');
        if (button) button.textContent = 'Request sent ✓';
      })
      .catch(function () {
        setStatus(
          'Sorry, that didn’t send. Please call or text us on 07427 982678.',
          'error'
        );
        if (button) {
          button.disabled = false;
          button.textContent = idleLabel;
        }
      });
  });
})();
