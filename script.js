// JetForce Washing JavaScript
// Handles scroll animations, sticky navigation states and mobile menu toggle.

document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const drawer = document.getElementById('drawer');

  // Helper to reveal elements when they enter the viewport
  function animateOnScroll() {
    const threshold = 0.85;
    document.querySelectorAll('[data-animate]').forEach((el) => {
      // Skip if already visible
      if (el.classList.contains('visible')) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * threshold) {
        el.classList.add('visible');
      }
    });
  }
  // Trigger animation checks on scroll and on load
  window.addEventListener('scroll', animateOnScroll);
  window.addEventListener('load', animateOnScroll);
  // Run once after DOM is ready
  animateOnScroll();

  // Change navbar background when scrolling down slightly
  const handleScroll = () => {
    if (window.scrollY > 40) {
      nav.style.background = 'rgba(5, 12, 26, 0.85)';
    } else {
      nav.style.background = 'rgba(5, 12, 26, 0.7)';
    }
  };
  window.addEventListener('scroll', handleScroll);

  // Mobile menu toggle
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    drawer.classList.toggle('open');
  });

  // Close drawer when clicking a link
  document.querySelectorAll('.drawer a').forEach((link) => {
    link.addEventListener('click', () => {
      drawer.classList.remove('open');
      hamburger.classList.remove('open');
    });
  });

  // Initialise custom effects once the DOM is ready
  initGlobalStars();
  initHoloCards();
  initMorphingTagline();
});

/**
 * Initialise a global starfield that spans the entire viewport.  Stars
 * twinkle by modulating their alpha values over time.  The canvas
 * remains fixed behind all content, emulating the futuristic hero
 * section from 21st.dev【470727655141461†screenshot】.  On resize the
 * star positions are recalculated to fill the viewport.
 */
function initGlobalStars() {
  const canvas = document.getElementById('stars-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Populate stars proportional to viewport area.  Increase the
    // density slightly so the starry backdrop is more pronounced.
    const count = Math.floor((canvas.width * canvas.height) / 5000);
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        // Stars vary from 1 to 3 pixels for greater presence.
        size: Math.random() * 2.0 + 1.0,
        // Boost the alpha range so stars are brighter overall.  They
        // will still twinkle over time.
        alpha: Math.random() * 0.5 + 0.5,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.5 + 0.3,
      });
    }
  }
  resize();
  window.addEventListener('resize', resize);

  function animate(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach((s) => {
      // Twinkle by adjusting brightness using a sine wave based on time
      const twinkle = 0.6 + 0.4 * Math.sin((time / 1000) * s.speed + s.phase);
      // Stars are tinted with the JetForce accent colour.  Combined
      // with the canvas blend mode, this allows the underlying glow to
      // shine through while the stars remain visible.
      ctx.fillStyle = `rgba(0, 188, 212, ${twinkle * s.alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

/**
 * Placeholder: removed the cursor splash effect per updated requirements. */

/**
 * Apply an interactive holographic effect to the before/after cards.  The
 * cards tilt in 3D space based on the cursor position, and the
 * gradient overlay rotates to follow the pointer.  On pointer exit
 * the card returns to its neutral position.  This is inspired by
 * holographic card demos such as the one on 21st.dev【606271261577944†screenshot】.
 */
function initHoloCards() {
  const cards = document.querySelectorAll('.holo-card');
  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      // Tilt angles scaled down to keep effect subtle
      // Increase rotation sensitivity for a more obvious tilt.  The factor
      // determines the maximum degrees of rotation at the edges of the card.
      const rotateX = -((y - centerY) / rect.height) * 20;
      const rotateY = ((x - centerX) / rect.width) * 20;
      // Apply perspective as part of the transform so the rotation has depth
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
      // Determine gradient rotation angle based on cursor direction from centre
      const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI) + 180;
      card.style.setProperty('--gradient-angle', `${angle}deg`);
    });
    card.addEventListener('mouseleave', () => {
      // Reset orientation when the cursor leaves
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
    });
  });
}

/**
 * Set up a morphing text animation for the tagline on the hero
 * section.  It cycles through a list of descriptors (Fast, Reliable,
 * Affordable) by fading the text out, changing its content, then
 * fading it back in.  The animation runs continuously.
 */
function initMorphingTagline() {
  const tagline = document.getElementById('morph-tagline');
  if (!tagline) return;
  const words = ['Fast', 'Reliable', 'Affordable'];
  let index = 0;
  tagline.textContent = words[index];
  setInterval(() => {
    // Fade out
    tagline.style.opacity = '0';
    setTimeout(() => {
      // Switch to next word
      index = (index + 1) % words.length;
      tagline.textContent = words[index];
      // Fade back in
      tagline.style.opacity = '1';
    }, 400);
  }, 2500);
}