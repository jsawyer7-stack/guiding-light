/* =====================================================
   Guiding Light Apostolic Church of Christ — main.js
   Vanilla JS · No build step.
   ===================================================== */

(() => {
  const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = matchMedia('(hover: hover)').matches;

  /* ——— Nav scroll state + mobile drawer ——— */
  const nav = document.querySelector('.nav');
  const burger = document.querySelector('.burger');
  const drawer = document.querySelector('.drawer');

  const updateNav = () => {
    if (!nav) return;
    nav.classList.toggle('is-scrolled', window.scrollY > 30);
  };
  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });

  if (burger && drawer) {
    burger.addEventListener('click', () => {
      const open = drawer.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    drawer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        drawer.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ——— Scroll progress bar ——— */
  const bar = document.createElement('div');
  bar.className = 'scroll-bar';
  document.body.appendChild(bar);
  const tickProgress = () => {
    const h = document.documentElement;
    const p = (h.scrollTop || document.body.scrollTop) /
              ((h.scrollHeight - h.clientHeight) || 1);
    bar.style.width = (p * 100).toFixed(2) + '%';
  };
  tickProgress();
  window.addEventListener('scroll', tickProgress, { passive: true });

  /* ——— Cursor-follow glow ——— */
  if (!rm && canHover) {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    let tx = 0, ty = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    const loop = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      glow.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ——— Reveal on scroll ——— */
  if (!rm && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.reveal, .reveal-img, .reveal-words').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.reveal, .reveal-img, .reveal-words').forEach(el => el.classList.add('is-visible'));
  }

  /* ——— Word-by-word reveal split ——— */
  document.querySelectorAll('[data-split]').forEach(el => {
    const text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.textContent = '';
    text.split(' ').forEach((word, i) => {
      const wrap = document.createElement('span');
      wrap.className = 'reveal-words';
      wrap.style.setProperty('--i', i);
      const inner = document.createElement('span');
      inner.className = 'w';
      inner.textContent = word;
      wrap.appendChild(inner);
      el.appendChild(wrap);
      el.appendChild(document.createTextNode(' '));
    });
  });

  /* ——— Count-up stats ——— */
  const ups = document.querySelectorAll('[data-count]');
  if (ups.length && 'IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const end = parseFloat(el.dataset.count);
        const dur = 1800;
        const start = performance.now();
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        const step = (t) => {
          const p = Math.min((t - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = Math.round(end * eased);
          el.textContent = prefix + val.toLocaleString() + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        cio.unobserve(el);
      });
    }, { threshold: 0.6 });
    ups.forEach(el => cio.observe(el));
  }

  /* ——— FAQ ——— */
  const setFaqHeight = (item, open) => {
    const a = item.querySelector('.faq-a');
    a.style.maxHeight = open ? a.scrollHeight + 'px' : '0';
  };
  // Prime any initially-open FAQs so they animate from the right height later
  document.querySelectorAll('.faq.is-open').forEach(item => setFaqHeight(item, true));
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq');
      const wasOpen = item.classList.contains('is-open');
      item.parentElement.querySelectorAll('.faq.is-open').forEach(i => {
        i.classList.remove('is-open');
        setFaqHeight(i, false);
      });
      if (!wasOpen) {
        item.classList.add('is-open');
        setFaqHeight(item, true);
      }
    });
  });

  /* ——— Give amount chips ——— */
  document.querySelectorAll('.chips').forEach(group => {
    group.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      group.querySelectorAll('.chip').forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
    });
  });

  /* ——— Magnetic buttons ——— */
  if (!rm && canHover) {
    document.querySelectorAll('.btn-accent, .btn-lg, [data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.2}px, ${y * 0.3}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ——— Hero bg parallax ——— */
  const heroBg = document.querySelector('.hero-bg, .hero-rays');
  if (!rm && heroBg) {
    const els = document.querySelectorAll('.hero-bg, .hero-rays, .hero-grain');
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      els.forEach((el, i) => {
        const speed = [0.25, 0.15, 0.35][i] || 0.2;
        el.style.transform = `translate3d(0, ${y * speed}px, 0)`;
      });
    }, { passive: true });
  }

  /* ——— Smooth anchors ——— */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    const href = link.getAttribute('href');
    if (href === '#' || href.length < 2) return;
    link.addEventListener('click', (e) => {
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ——— Year in footer ——— */
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  /* ——— Active nav link ——— */
  const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav-links a, .drawer a').forEach(a => {
    const t = (a.getAttribute('href') || '').toLowerCase();
    if (t === current || (current === '' && t === 'index.html')) {
      a.setAttribute('aria-current', 'page');
    }
  });

  /* ——— Duplicate marquee/quotes content for seamless loop ——— */
  document.querySelectorAll('[data-loop]').forEach(track => {
    track.innerHTML += track.innerHTML;
  });
})();
