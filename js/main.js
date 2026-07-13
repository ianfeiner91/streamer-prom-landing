/* ============================================
   STREAMER PROM — Main JavaScript
   ============================================ */

(function () {
  'use strict';

  // ============================================
  // PRELOADER
  // ============================================
  const preloader = document.getElementById('preloader');

  function hidePreloader() {
    if (!preloader || preloader.classList.contains('is-hidden')) return;
    preloader.classList.add('is-hidden');
    document.body.style.overflow = '';
    // Reveal hero content after preloader fades
    setTimeout(() => {
      document.querySelectorAll('.hero .reveal').forEach(el => {
        el.classList.add('is-visible');
      });
    }, 200);
  }

  document.body.style.overflow = 'hidden';
  window.addEventListener('load', () => {
    setTimeout(hidePreloader, 1800);
  });
  // Fallback
  setTimeout(hidePreloader, 3500);

  // ============================================
  // CUSTOM CURSOR (disco ball follower)
  // ============================================
  const cursor = document.getElementById('custom-cursor');
  const trail = document.getElementById('cursor-trail');
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  let trailX = 0, trailY = 0;

  if (!isTouchDevice && cursor && trail) {
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.classList.add('is-visible');
      trail.classList.add('is-visible');
    });

    document.addEventListener('mouseleave', () => {
      cursor.classList.remove('is-visible');
      trail.classList.remove('is-visible');
    });

    const interactiveSelectors = 'a, button, .btn, .tier-card, .about__card, .creator-card, .stat-card, .amp-stat, .polaroid, .social-card, .host-platform';
    document.querySelectorAll(interactiveSelectors).forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hovering'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hovering'));
    });

    function animateCursor() {
      cursorX += (mouseX - cursorX) * 0.18;
      cursorY += (mouseY - cursorY) * 0.18;
      trailX += (mouseX - trailX) * 0.08;
      trailY += (mouseY - trailY) * 0.08;

      cursor.style.left = cursorX + 'px';
      cursor.style.top  = cursorY + 'px';
      trail.style.left  = trailX + 'px';
      trail.style.top   = trailY + 'px';

      requestAnimationFrame(animateCursor);
    }
    animateCursor();
  }

  // ============================================
  // NAVIGATION
  // ============================================
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      navbar.classList.add('is-scrolled');
    } else {
      navbar.classList.remove('is-scrolled');
    }
  }, { passive: true });

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('is-active');
      mobileMenu.classList.toggle('is-open');
      document.body.style.overflow = mobileMenu.classList.contains('is-open') ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('.mobile-menu__link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('is-active');
        mobileMenu.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }

  // ============================================
  // SCROLL REVEAL (Intersection Observer)
  // ============================================
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px'
  });

  revealElements.forEach(el => {
    if (!el.closest('.hero')) {
      revealObserver.observe(el);
    }
  });

  // ============================================
  // STAT COUNTERS (animated count-up)
  // ============================================
  function decimalsOf(n) {
    const s = String(n);
    const i = s.indexOf('.');
    return i < 0 ? 0 : s.length - i - 1;
  }

  function animateCounter(el) {
    const targetRaw = el.dataset.target;
    const target = parseFloat(targetRaw);
    if (isNaN(target)) return;
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 2200;
    const startTime = performance.now();
    const decimals = decimalsOf(targetRaw);
    const useDecimals = decimals > 0 && target < 1000;

    function format(value, isFinal) {
      if (useDecimals) {
        return value.toFixed(isFinal ? decimals : Math.max(decimals, 1));
      }
      return Math.round(value).toLocaleString();
    }

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      el.textContent = prefix + format(current, false) + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = prefix + format(target, true) + suffix;
      }
    }
    requestAnimationFrame(update);
  }

  // Watch any container holding stat numbers
  function setupStatObserver(selector, numberSelector) {
    const els = document.querySelectorAll(selector);
    if (!els.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll(numberSelector).forEach(animateCounter);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    els.forEach(el => obs.observe(el));
  }

  setupStatObserver('.stats__grid', '.stat-card__number');
  setupStatObserver('.amp__big', '.amp-stat__num');
  setupStatObserver('.hero__metrics', '.hero__metric-num');
  setupStatObserver('.sponsor-proof__stats', '.sponsor-proof__num');

  // Animate hero metric numbers separately on load (slight delay)
  setTimeout(() => {
    document.querySelectorAll('.hero__metric-num').forEach(el => {
      const raw = el.textContent.trim();
      const match = raw.match(/^([\d.]+)([KkMmBb%+]+|\#?\d+|[#\w]+)$/);
      // Only animate purely numeric ones — keep "#1" as static
      if (raw === '#1') return;
      const num = parseFloat(raw);
      if (!isNaN(num)) {
        el.dataset.target = num;
        const suffix = raw.replace(/[\d.]/g, '');
        el.dataset.suffix = suffix;
        // animateCounter expects data-target — call directly
        animateCounter(el);
      }
    });
  }, 2400);

  // ============================================
  // AMPLIFICATION BAR CHART (animate on view)
  // ============================================
  const ampBars = document.getElementById('amp-bars');
  if (ampBars) {
    const barObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const cols = ampBars.querySelectorAll('.amp-bar__col');
          cols.forEach((col, i) => {
            const h = parseFloat(col.dataset.height) || 0;
            setTimeout(() => {
              col.style.height = h + '%';
            }, 100 + i * 80);
          });
          barObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    barObs.observe(ampBars);
  }

  // ============================================
  // RECAP VIDEO PLAYER (livestream window)
  // ============================================
  const recapVideo = document.getElementById('recap-video');
  const recapPlayBtn = document.getElementById('recap-play-btn');
  const livestreamTime = document.getElementById('livestream-time');
  const livestreamTotal = document.querySelector('.livestream__total');

  function formatTime(s) {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  if (recapVideo && recapPlayBtn) {
    recapPlayBtn.addEventListener('click', () => {
      recapVideo.muted = false;
      recapVideo.play().then(() => {
        recapPlayBtn.classList.add('is-hidden');
      }).catch(() => {
        recapVideo.muted = true;
        recapVideo.play();
        recapPlayBtn.classList.add('is-hidden');
      });
    });

    recapVideo.addEventListener('click', () => {
      if (recapVideo.paused) {
        recapVideo.play();
        recapPlayBtn.classList.add('is-hidden');
      } else {
        recapVideo.pause();
        recapPlayBtn.classList.remove('is-hidden');
      }
    });

    recapVideo.addEventListener('loadedmetadata', () => {
      if (livestreamTotal && isFinite(recapVideo.duration)) {
        livestreamTotal.textContent = '/ ' + formatTime(recapVideo.duration);
      }
    });

    recapVideo.addEventListener('timeupdate', () => {
      if (livestreamTime) {
        livestreamTime.textContent = formatTime(recapVideo.currentTime);
      }
    });
  }

  // ============================================
  // HERO PARTICLES (champagne bubbles + stars)
  // ============================================
  const particleContainer = document.getElementById('hero-particles');
  if (particleContainer) {
    const particleCount = 26;
    const colors = ['#e6c270', '#ff3b8a', '#f7da8b', '#fff3c4', '#ff6da7'];

    for (let i = 0; i < particleCount; i++) {
      const isStar = Math.random() > 0.65;
      const particle = document.createElement('div');
      particle.classList.add('particle');

      const size = isStar ? Math.random() * 8 + 4 : Math.random() * 5 + 2;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const tx = (Math.random() - 0.5) * 240;
      const ty = (Math.random() - 0.5) * 240;
      const duration = Math.random() * 10 + 7;
      const delay = Math.random() * 6;
      const opacity = Math.random() * 0.5 + 0.2;
      const color = colors[Math.floor(Math.random() * colors.length)];

      particle.style.cssText = `
        left: ${x}%;
        top: ${y}%;
        width: ${size}px;
        height: ${size}px;
        --tx: ${tx}px;
        --ty: ${ty}px;
        --duration: ${duration}s;
        --delay: ${delay}s;
        opacity: ${opacity};
      `;

      if (isStar) {
        particle.innerHTML = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}" style="filter: drop-shadow(0 0 6px ${color});"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.9l-6.2 4.4 2.4-7.4L2 9.4h7.6z"/></svg>`;
        particle.classList.add('particle--star');
      } else {
        particle.classList.add('particle--circle');
        particle.style.background = color;
        particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;
      }

      particleContainer.appendChild(particle);
    }
  }

  // ============================================
  // PARALLAX HOST PHOTO PLACEHOLDER
  // ============================================
  const hostPhoto = document.querySelector('.host__photo');
  if (hostPhoto && !isTouchDevice) {
    hostPhoto.addEventListener('mousemove', (e) => {
      const rect = hostPhoto.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const placeholder = hostPhoto.querySelector('.host__photo-placeholder');
      if (placeholder) {
        const tx = (x - 0.5) * 20;
        const ty = (y - 0.5) * 20;
        placeholder.style.transform = `translate(${tx}px, ${ty}px)`;
      }
    });
    hostPhoto.addEventListener('mouseleave', () => {
      const placeholder = hostPhoto.querySelector('.host__photo-placeholder');
      if (placeholder) placeholder.style.transform = '';
    });
  }

  // ============================================
  // POLAROID HOVER LIFT (subtle Z-stack control)
  // ============================================
  document.querySelectorAll('.polaroid').forEach(p => {
    p.addEventListener('mouseenter', () => {
      p.style.zIndex = 10;
    });
    p.addEventListener('mouseleave', () => {
      setTimeout(() => { p.style.zIndex = ''; }, 500);
    });
  });

  // ============================================
  // SMOOTH ANCHOR LINKS — close mobile menu on click
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId.length > 1) {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // ============================================
  // ROSTER / VENUE IMAGE FALLBACK
  // Headshot & venue photo files may not exist yet —
  // hide broken <img> so the styled placeholder shows.
  // Drop a file at the referenced path and it appears.
  // ============================================
  document.querySelectorAll('.roster-card__img, .venue-photo__img').forEach(img => {
    const hide = () => img.classList.add('is-missing');
    img.addEventListener('error', hide);
    if (img.complete && img.naturalWidth === 0) hide();
  });

})();
