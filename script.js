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
});