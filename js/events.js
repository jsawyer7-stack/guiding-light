/* =====================================================
   Events renderer — fetches content/events.json
   (managed via /admin Decap CMS) and renders cards
   into any container with [data-events-target].
   Usage: <div data-events-target="home" data-limit="3" data-featured="true"></div>
          <div data-events-target="all"></div>
   ===================================================== */

(async () => {
  const targets = document.querySelectorAll('[data-events-target]');
  if (!targets.length) return;

  const CATEGORY_CLASS = {
    Revival: 'g-revival',
    Community: 'g-community',
    Youth: 'g-youth',
    Children: 'generated',
    Christmas: 'g-easter',
    Easter: 'g-easter',
    Thanksgiving: 'generated',
    Women: 'generated',
    Men: 'generated',
    General: 'generated'
  };

  // Fallback inline gradients for categories that don't have a preset class.
  const CATEGORY_GRADIENT = {
    Children: 'linear-gradient(160deg, var(--sage-700), var(--honey-600))',
    Thanksgiving: 'linear-gradient(160deg, var(--honey-500), var(--wine-700))',
    Women: 'linear-gradient(160deg, var(--wine-500), var(--terra-400))',
    Men: 'linear-gradient(160deg, var(--ink-800), var(--sage-700))',
    General: 'linear-gradient(160deg, var(--honey-600), var(--wine-700))'
  };

  const escapeHTML = (s) =>
    String(s || '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));

  const renderCard = (ev, idx) => {
    const cat = ev.category || 'General';
    const cls = CATEGORY_CLASS[cat] || 'generated';
    const gradient = CATEGORY_GRADIENT[cat];
    const bgStyle = gradient ? ` style="background: ${gradient}"` : '';
    const delay = idx > 0 ? ` style="--delay:.${idx}s"` : '';

    const mediaInner = ev.image
      ? `<img src="${escapeHTML(ev.image)}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover" />
         <span class="label">${escapeHTML(cat)}</span>`
      : `<span class="label">${escapeHTML(cat)}</span>`;

    const link = ev.link_text && ev.link_url
      ? `<a class="link" href="${escapeHTML(ev.link_url)}">${escapeHTML(ev.link_text)}</a>`
      : '';

    return `
      <article class="event reveal"${delay}>
        <div class="event-media ${ev.image ? '' : cls}"${ev.image ? '' : bgStyle}>
          ${mediaInner}
        </div>
        <span class="event-date">${escapeHTML(ev.date_display)}</span>
        <h3>${escapeHTML(ev.title)}</h3>
        <p>${escapeHTML(ev.description)}</p>
        ${link}
      </article>
    `;
  };

  const renderFeaturedBlock = (ev) => {
    // The big split layout at the top of events.html — used for the first featured event.
    const cat = ev.category || 'General';
    const cls = CATEGORY_CLASS[cat] || 'generated';
    const gradient = CATEGORY_GRADIENT[cat];
    const mediaStyle = ev.image
      ? `background: url('${escapeHTML(ev.image)}') center/cover no-repeat`
      : (gradient || 'linear-gradient(160deg, var(--honey-600), var(--wine-700))');

    const actions = (ev.link_text && ev.link_url)
      ? `<div class="split-actions reveal" style="--delay:.4s">
          <a class="btn btn-accent" href="${escapeHTML(ev.link_url)}">${escapeHTML(ev.link_text)} <span class="arr">→</span></a>
          <a class="link" href="#calendar">See all events</a>
         </div>`
      : `<div class="split-actions reveal" style="--delay:.4s">
          <a class="btn" href="#calendar">See all events <span class="arr">→</span></a>
         </div>`;

    return `
      <div class="split">
        <div class="split-media reveal-img">
          <div class="photo-placeholder" style="background: ${mediaStyle}">
            ${ev.image ? '' : `<span class="ph-label">${escapeHTML(ev.title)}</span>`}
          </div>
          <span class="tag">Featured · ${escapeHTML(cat)}</span>
        </div>
        <div class="split-copy">
          <span class="kicker reveal">Featured Event</span>
          <h2 class="reveal mt-3" style="--delay:.1s">${escapeHTML(ev.title)}</h2>
          <p class="lede reveal" style="--delay:.2s">${escapeHTML(ev.description)}</p>
          <div class="info-card reveal mt-4" style="--delay:.3s">
            <ul class="info-list">
              <li><span class="label">When</span><span class="val">${escapeHTML(ev.date_display)}</span></li>
              <li><span class="label">Category</span><span class="val">${escapeHTML(cat)}</span></li>
            </ul>
          </div>
          ${actions}
        </div>
      </div>
    `;
  };

  // Load data (cache-bust in case the CMS just republished).
  let data;
  try {
    const res = await fetch('content/events.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('fetch failed: ' + res.status);
    data = await res.json();
  } catch (err) {
    console.warn('[events] could not load events.json —', err);
    return; // Leave any fallback HTML in place
  }

  const events = Array.isArray(data?.events) ? data.events : [];

  targets.forEach((target) => {
    const mode = target.dataset.eventsTarget; // 'home' | 'all' | 'featured-single'
    const limit = parseInt(target.dataset.limit || '0', 10);
    const featuredOnly = target.dataset.featured === 'true';

    let list = events.slice();
    if (featuredOnly) list = list.filter(e => e.featured);
    if (limit > 0) list = list.slice(0, limit);

    if (mode === 'featured-single') {
      const ev = events.find(e => e.featured) || events[0];
      if (ev) target.innerHTML = renderFeaturedBlock(ev);
      return;
    }

    if (!list.length) {
      // Keep whatever static fallback markup the page shipped with.
      return;
    }

    target.innerHTML = list.map((ev, i) => renderCard(ev, i)).join('');
  });

  // Re-trigger reveal observers for newly inserted elements.
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('[data-events-target] .reveal, [data-events-target] .reveal-img').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('[data-events-target] .reveal, [data-events-target] .reveal-img').forEach(el => el.classList.add('is-visible'));
  }
})();
