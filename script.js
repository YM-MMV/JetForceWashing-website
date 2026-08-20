/* JetForce Washing — site behaviour
   Hand-rolled: no GSAP, no ScrollTrigger, no Lenis, no dependencies.

   Reveals use IntersectionObserver; the two scrubbed effects (polaroid fan-out
   and the drawn walkway) read scroll position inside a rAF loop that only runs
   while their section is on screen. */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- year -- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------- mobile nav -- */
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('topnav');

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
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { closeNav(); toggle.focus(); }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) closeNav();
    });
  }

  /* ------------------------------------------------------------- reveals -- */
  // Everything that just needs to appear once when scrolled into view.
  var revealTargets = []
    .concat([].slice.call(document.querySelectorAll('.fade-up')))
    .concat([].slice.call(document.querySelectorAll('.hero-anim')))
    .concat([].slice.call(document.querySelectorAll('.reveal-lines')))
    .concat([].slice.call(document.querySelectorAll('.svc')))
    .concat([].slice.call(document.querySelectorAll('.step')))
    .concat([].slice.call(document.querySelectorAll('.pill')));

  function revealNow(el) {
    el.classList.add('is-in');
    // Stagger the masked lines inside a heading.
    var lines = el.querySelectorAll('.l-in');
    for (var i = 0; i < lines.length; i++) {
      (function (line, idx) {
        window.setTimeout(function () { line.classList.add('is-in'); }, idx * 110);
      })(lines[i], i);
    }
  }

  if (reduced || !('IntersectionObserver' in window)) {
    revealTargets.forEach(revealNow);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        revealNow(entry.target);
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.1 });

    revealTargets.forEach(function (el) { io.observe(el); });

    // Hero is above the fold — show it immediately rather than waiting for a scroll.
    var heroBits = document.querySelectorAll('.hero .hero-anim, .hero .reveal-lines');
    window.setTimeout(function () {
      for (var i = 0; i < heroBits.length; i++) {
        revealNow(heroBits[i]);
        io.unobserve(heroBits[i]);
      }
    }, 120);
  }

  // Area pills drift gently once revealed; randomised per pill so they don't
  // move in lockstep.
  if (!reduced) {
    var pills = document.querySelectorAll('.pill');
    for (var p = 0; p < pills.length; p++) {
      var s = pills[p].style;
      s.setProperty('--dx', (Math.random() * 16 - 8).toFixed(1) + 'px');
      s.setProperty('--dy', (-12 - Math.random() * 10).toFixed(1) + 'px');
      s.setProperty('--dr', (Math.random() * 5 - 2.5).toFixed(1) + 'deg');
      s.setProperty('--dur', (2.6 + Math.random() * 1.8).toFixed(2) + 's');
      s.setProperty('--delay', (p * 0.18).toFixed(2) + 's');
    }
  }

  /* ------------------------------------------------- scrubbed animations -- */
  // Runs a callback with 0..1 progress while `section` is in view. One rAF loop
  // shared by every registered effect, started and stopped by an observer so it
  // is idle whenever nothing is on screen.
  var scrubbers = [];
  var ticking = false;

  function registerScrub(section, startFrac, endFrac, fn) {
    if (!section) return;
    var entry = { el: section, start: startFrac, end: endFrac, fn: fn, active: false };
    scrubbers.push(entry);

    if (!('IntersectionObserver' in window)) { entry.active = true; kick(); return; }
    new IntersectionObserver(function (entries) {
      entry.active = entries[0].isIntersecting;
      if (entry.active) kick();
    }, { rootMargin: '20% 0px 20% 0px' }).observe(section);
  }

  function kick() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(step);
  }

  function step() {
    var anyActive = false;
    var vh = window.innerHeight;

    for (var i = 0; i < scrubbers.length; i++) {
      var s = scrubbers[i];
      if (!s.active) continue;
      anyActive = true;

      var r = s.el.getBoundingClientRect();
      // Progress from "top of section reaches startFrac of viewport" to
      // "bottom of section reaches endFrac of viewport".
      var from = vh * s.start;
      var to = -r.height + vh * s.end;
      var prog = (from - r.top) / (from - to);
      s.fn(Math.max(0, Math.min(1, prog)));
    }

    ticking = false;
    if (anyActive) kick();
  }

  // Polaroid fan-out: stacked → spread, driven by scroll through the section.
  var fan = document.getElementById('fan');
  if (fan && !reduced) {
    var pols = fan.querySelectorAll('.pol');
    var restX = [-350, 0, 350];
    var restR = [-8, 0, 8];
    var restY = [40, 0, 40];
    var startR = [-7, 2, 8];

    // Narrow screens can't spread 350px each way without overflowing.
    function spread() {
      return Math.min(350, Math.max(96, (fan.clientWidth - 300) / 2));
    }

    registerScrub(fan, 0.78, 0.4, function (t) {
      var sp = spread();
      for (var i = 0; i < pols.length; i++) {
        var x = (restX[i] / 350) * sp * t;
        var r = startR[i] + (restR[i] - startR[i]) * t;
        var y = i * 16 + (restY[i] - i * 16) * t;
        pols[i].style.setProperty('--x', x.toFixed(1) + 'px');
        pols[i].style.setProperty('--r', r.toFixed(2) + 'deg');
        pols[i].style.setProperty('--y', y.toFixed(1) + 'px');
      }
    });
  } else if (fan) {
    // Reduced motion: show them already fanned, no scroll coupling.
    var staticPols = fan.querySelectorAll('.pol');
    var sx = Math.min(350, Math.max(96, (fan.clientWidth - 300) / 2));
    var vals = [[-sx, -8, 40], [0, 0, 0], [sx, 8, 40]];
    for (var q = 0; q < staticPols.length; q++) {
      staticPols[q].style.setProperty('--x', vals[q][0] + 'px');
      staticPols[q].style.setProperty('--r', vals[q][1] + 'deg');
      staticPols[q].style.setProperty('--y', vals[q][2] + 'px');
    }
  }

  // Walkway path draws itself as you scroll the process section.
  var walkPath = document.getElementById('walkPath');
  var processSec = document.getElementById('process');
  if (walkPath && processSec) {
    var len = walkPath.getTotalLength();
    walkPath.style.strokeDasharray = len;
    walkPath.style.strokeDashoffset = reduced ? 0 : len;
    if (!reduced) {
      registerScrub(processSec, 0.65, 0.85, function (t) {
        walkPath.style.strokeDashoffset = (len * (1 - t)).toFixed(1);
      });
    }
  }

  /* ---------------------------------------------------- hero parallax -- */
  var pebble = document.getElementById('heroPebble');
  if (pebble && !reduced) {
    registerScrub(document.querySelector('.hero'), 1, 0, function (t) {
      pebble.style.transform = 'translateY(' + (-70 * t).toFixed(1) + 'px)';
    });
  }

  /* --------------------------------------------------------- magnetic -- */
  if (!reduced && window.matchMedia('(hover: hover)').matches) {
    var magnets = document.querySelectorAll('.magnet');
    for (var m = 0; m < magnets.length; m++) {
      (function (btn) {
        btn.addEventListener('pointermove', function (e) {
          var r = btn.getBoundingClientRect();
          var mx = (e.clientX - r.left - r.width / 2) / r.width;
          var my = (e.clientY - r.top - r.height / 2) / r.height;
          btn.style.transform = 'translate(' + (mx * 12).toFixed(1) + 'px,' + (my * 10).toFixed(1) + 'px)';
        });
        btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
      })(magnets[m]);
    }
  }

  /* ---------------------------------------------------------- reviews -- */
  var track = document.getElementById('revTrack');
  if (track) {
    var slides = track.querySelectorAll('.rev');
    var dots = document.querySelectorAll('.rev-dot');
    var cur = 0;
    var timer = null;

    function show(n) {
      cur = (n + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-(100 / slides.length) * cur) + '%)';
      for (var i = 0; i < dots.length; i++) {
        dots[i].setAttribute('aria-selected', String(i === cur));
      }
    }
    function play() {
      if (reduced) return;
      stop();
      timer = window.setInterval(function () { show(cur + 1); }, 5600);
    }
    function stop() { if (timer) { window.clearInterval(timer); timer = null; } }

    for (var d = 0; d < dots.length; d++) {
      (function (i) {
        dots[i].addEventListener('click', function () { show(i); play(); });
      })(d);
    }

    // Don't yank the slide out from under someone reading or tabbing through it.
    track.addEventListener('mouseenter', stop);
    track.addEventListener('mouseleave', play);
    track.addEventListener('focusin', stop);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else play();
    });

    show(0);
    play();
  }

  /* -------------------------------------------------------------- FAQ -- */
  var faqButtons = document.querySelectorAll('.faq-q');
  for (var f = 0; f < faqButtons.length; f++) {
    (function (btn) {
      var panel = btn.nextElementSibling;
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        // Animate to the measured height, then release to auto so the panel
        // reflows correctly if the window is resized while open.
        if (open) {
          panel.style.height = panel.scrollHeight + 'px';
          requestAnimationFrame(function () { panel.style.height = '0px'; });
        } else {
          panel.style.height = panel.scrollHeight + 'px';
          window.setTimeout(function () {
            if (btn.getAttribute('aria-expanded') === 'true') panel.style.height = 'auto';
          }, 420);
        }
      });
    })(faqButtons[f]);
  }

  /* ------------------------------------------------------------ video -- */
  // 2.2MB file: only fetched once the panel is close to the viewport.
  var video = document.getElementById('stoneVideo');
  if (video && video.dataset.src) {
    if (reduced) {
      // Leave the poster in place; never autoplay motion for this preference.
      video.removeAttribute('data-src');
    } else if ('IntersectionObserver' in window) {
      var vio = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        video.src = video.dataset.src;
        video.autoplay = true;
        var pl = video.play();
        if (pl && pl.catch) pl.catch(function () { /* autoplay blocked; poster stays */ });
        vio.disconnect();
      }, { rootMargin: '200px' });
      vio.observe(video);
    } else {
      video.src = video.dataset.src;
    }
  }

  /* ------------------------------------------------- floating labels -- */
  // Keeps the label raised when a field has content but isn't focused.
  var fields = document.querySelectorAll('.field input, .field textarea');
  function syncField(el) {
    el.parentNode.classList.toggle('is-filled', el.value.trim() !== '');
  }
  for (var i2 = 0; i2 < fields.length; i2++) {
    (function (el) {
      el.addEventListener('input', function () { syncField(el); });
      el.addEventListener('blur', function () { syncField(el); });
      syncField(el);
    })(fields[i2]);
  }

  /* --------------------------------------------------------- the form -- */
  var form = document.getElementById('quoteForm');
  if (!form) return;

  var button = document.getElementById('submitBtn');
  var status = document.getElementById('formStatus');
  var idleLabel = button ? button.innerHTML : 'Send my request';

  function setStatus(message, state) {
    if (!status) return;
    status.textContent = message;
    status.className = 'form-status' + (state ? ' is-' + state : '');
  }

  form.addEventListener('submit', function (e) {
    if (!form.checkValidity()) return;   // let the browser show its own messages
    e.preventDefault();

    if (button) { button.disabled = true; button.textContent = 'Sending…'; }
    setStatus('', '');

    // Archived demo: no endpoint to post to. Run the same loading state, then
    // say plainly that nothing was sent rather than faking a confirmation.
    if (form.hasAttribute('data-demo')) {
      window.setTimeout(function () {
        setStatus('This is an archived demo — the form works, but nothing was sent.', 'ok');
        if (button) { button.disabled = false; button.innerHTML = idleLabel; }
      }, 700);
      return;
    }

    fetch(form.action, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form)
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Request failed');
        form.reset();
        for (var k = 0; k < fields.length; k++) syncField(fields[k]);
        setStatus('Thanks — your request is in. We’ll be in touch shortly.', 'ok');
        if (button) button.textContent = 'Request sent ✓';
      })
      .catch(function () {
        setStatus('Sorry, that didn’t send. Please call or text us on 07700 900123.', 'error');
        if (button) { button.disabled = false; button.innerHTML = idleLabel; }
      });
  });
})();
