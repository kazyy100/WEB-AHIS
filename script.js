/* SMP Al Haudh — interaksi halaman (v7)
   Catatan performa:
   - Semua efek scroll dijalankan dalam SATU requestAnimationFrame: baca layout dulu, baru tulis
     (menghindari "layout thrashing").
   - Efek tilt 3D hanya untuk perangkat dengan mouse.
   - Preloader tidak lagi menahan 2 detik: terangkat begitu halaman siap (maks. 1,5 dtk), dan hanya sekali per sesi.
*/
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const root = document.documentElement;
  const body = document.body;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ------------------------------------------------------------------
     0. Curtain preloader
     ------------------------------------------------------------------ */
  (function preloader() {
    const curtain = $('#app-preloader');
    const release = () => body.classList.remove('preloader-active');
    if (!curtain || root.classList.contains('no-preloader')) {
      if (curtain) curtain.remove();
      release();
      return;
    }
    try { sessionStorage.setItem('ah-seen', '1'); } catch (e) { }

    const MIN_MS = 750;   // cukup untuk animasi logo masuk
    const MAX_MS = 1500;  // batas atas, apa pun yang terjadi
    let lifted = false;
    function lift() {
      if (lifted) return;
      lifted = true;
      curtain.classList.add('lift-up');
      release();
      setTimeout(() => curtain.remove(), 1100);
    }
    const wait = ms => new Promise(r => setTimeout(r, Math.max(0, ms)));
    const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.all([Promise.race([fontsReady, wait(500)]), wait(MIN_MS - performance.now())]).then(lift);
    setTimeout(lift, Math.max(0, MAX_MS - performance.now()));
  })();

  /* ------------------------------------------------------------------
     1. Modal (dialog) generik: fokus terkunci, Esc, klik latar
     ------------------------------------------------------------------ */
  const FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';
  let openModalEl = null;
  let lastFocus = null;

  function lockScroll(on) { body.style.overflow = on ? 'hidden' : ''; }

  function openModal(id, trigger) {
    const m = document.getElementById(id);
    if (!m) return;
    if (openModalEl && openModalEl !== m) closeModal(false);
    if (!openModalEl) lastFocus = trigger || document.activeElement;
    m.hidden = false;
    m.classList.add('open');
    openModalEl = m;
    lockScroll(true);
    const first = $('.cinema-close-btn', m) || $(FOCUSABLE, m);
    if (first) first.focus({ preventScroll: true });
  }

  function closeModal(restore = true) {
    if (!openModalEl) return;
    openModalEl.classList.remove('open');
    openModalEl.hidden = true;
    openModalEl = null;
    lockScroll(false);
    if (restore && lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  document.addEventListener('click', e => {
    const opener = e.target.closest('[data-modal-open]');
    if (opener) {
      e.preventDefault();
      if (opener.hasAttribute('data-menu-close')) closeMenu(false);
      openModal(opener.getAttribute('data-modal-open'), opener);
      return;
    }
    if (e.target.closest('[data-modal-close]')) { closeModal(); return; }
    if (openModalEl && e.target === openModalEl) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (openModalEl) closeModal();
      else if (menu && menu.classList.contains('open')) closeMenu();
      return;
    }
    if (e.key === 'Tab' && openModalEl) {
      const f = $$(FOCUSABLE, openModalEl).filter(el => el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    if (openModalEl && openModalEl.id === 'cinemaGalleryModal') {
      if (e.key === 'ArrowRight') stepCinema(1);
      if (e.key === 'ArrowLeft') stepCinema(-1);
    }
  });

  /* ------------------------------------------------------------------
     2. Menu HP
     ------------------------------------------------------------------ */
  const menu = $('#mobileMenu');
  const menuBtn = $('#menuToggle');
  function openMenu() {
    menu.classList.add('open');
    menuBtn.setAttribute('aria-expanded', 'true');
    const firstLink = $('a', menu);
    if (firstLink) setTimeout(() => firstLink.focus({ preventScroll: true }), 50);
  }
  function closeMenu(restore = true) {
    if (!menu.classList.contains('open')) return;
    menu.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    if (restore) menuBtn.focus({ preventScroll: true });
  }
  if (menu && menuBtn) {
    menuBtn.addEventListener('click', () => (menu.classList.contains('open') ? closeMenu() : openMenu()));
    $$('[data-menu-close]', menu).forEach(b => b.addEventListener('click', () => closeMenu(!b.hasAttribute('data-modal-open'))));
    $$('.mobile-menu-links a', menu).forEach(a => a.addEventListener('click', () => closeMenu(false)));
  }

  /* ------------------------------------------------------------------
     3. Program tabs
     ------------------------------------------------------------------ */
  const programData = [
    {
      tag: "PILAR 01 — TARGET 5 JUZ MUTQIN",
      title: "Tahfizhul Qur'an Bersanad Talaqqi",
      desc: "Program hafalan Al-Qur'an intensif dengan target kelulusan 5 juz mutqin. Menggunakan metode talaqqi tajwid bersanad bersama asatidz hafidz, dilengkapi evaluasi harian dan ujian tasmi' resmi di hadapan orang tua.",
      features: [
        "Bimbingan talaqqi makharijul huruf & tajwid matan Jazariyah",
        "Halaqah pagi rutin sebelum KBM akademik dimulai",
        "Pemberian syahadah tahfizh resmi 3 & 5 juz untuk bekal studi lanjut"
      ],
      cardHeader: "Halaqah Eksklusif & Terbimbing",
      cardBody: "Setiap halaqah dibimbing oleh ustadz yang berdedikasi tinggi dengan rasio guru-siswa yang ideal, memastikan ketelitian bacaan dan kekuatan hafalan setiap murid."
    },
    {
      tag: "PILAR 02 — KURIKULUM NASIONAL · AKREDITASI A",
      title: "Kurikulum Terpadu & Nalar Akademik",
      desc: "Memadukan kurikulum nasional Kemendikdasmen dengan wawasan keislaman secara integral. Menyiapkan peserta didik unggul dalam literasi sains, matematika, bahasa internasional, dan teknologi informasi.",
      features: [
        "Penguasaan konsep IPA, Matematika & Bahasa Inggris aplikatif",
        "Ruang kelas ber-AC dengan multimedia smart board",
        "Ijazah resmi terakreditasi A untuk kelanjutan SMA/SMK unggulan"
      ],
      cardHeader: "Nalar Kritis & Wawasan Global",
      cardBody: "Pendekatan pembelajaran student-centered yang memacu rasa ingin tahu intelektual tanpa mengorbankan ketundukan pada nilai-nilai wahyu Ilahi."
    },
    {
      tag: "PILAR 03 — KEMANDIRIAN HIDUP NYATA",
      title: "Vokasi Mandiri & Life Skills",
      desc: "Membekali siswa dengan keterampilan praktis dunia nyata. Mulai dari dasar-dasar instalasi listrik rumah tangga, perbaikan elektronika, hingga manajemen adab berwirausaha yang syar'i.",
      features: [
        "Praktik bengkel instalasi listrik dasar & keselamatan kerja",
        "Pengenalan dasar kewirausahaan mandiri islami",
        "Kecakapan problem-solving dan kemandirian fungsional"
      ],
      cardHeader: "Lulusan Cakap & Mandiri",
      cardBody: "Keahlian terapan yang membuat peserta didik terbiasa mandiri, solutif, serta siap berkontribusi langsung bagi keluarga dan masyarakat."
    },
    {
      tag: "PILAR 04 — EKSPLORASI ALAM RAYA",
      title: "Outing Class & Tadabbur Alam",
      desc: "Pembelajaran kontekstual di luar kelas untuk mengamati keagungan ciptaan Allah. Memadukan kegiatan outdoor, sains lapangan, kepanduan, dan penguatan ukhuwah islamiyah.",
      features: [
        "Eksplorasi ekosistem alam dan penelitian sains mini",
        "Latihan ketahanan fisik, kepemimpinan & kedisiplinan",
        "Muhasabah malam dan penguatan ruhiyah di alam terbuka"
      ],
      cardHeader: "Belajar dari Alam Nyata",
      cardBody: "Mentadabburi ayat-ayat kauniyah Allah di alam terbuka untuk menumbuhkan rasa syukur, kerendahan hati, dan kecintaan pada ciptaan-Nya."
    }
  ];

  const tabs = $$('.program-segmented-bar .seg-btn');
  const showcase = $('.program-showcase-box');
  function switchProgramTab(index, focus) {
    const data = programData[index];
    if (!data || !showcase) return;
    tabs.forEach((btn, i) => {
      const on = i === index;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
      btn.tabIndex = on ? 0 : -1;
    });
    if (focus) tabs[index].focus();
    showcase.setAttribute('aria-labelledby', tabs[index].id);
    showcase.style.opacity = '0.4';
    setTimeout(() => {
      $('#progPillarTag').textContent = data.tag;
      $('#progTitle').textContent = data.title;
      $('#progDesc').textContent = data.desc;
      $('#progCardHeader').textContent = data.cardHeader;
      $('#progCardBody').textContent = data.cardBody;
      const list = $('#progFeatureList');
      list.textContent = '';
      data.features.forEach(f => {
        const li = document.createElement('li');
        li.innerHTML = '<svg aria-hidden="true"><use href="#i-check"/></svg><span></span>';
        li.lastChild.textContent = f;
        list.appendChild(li);
      });
      showcase.style.opacity = '1';
    }, 150);
  }
  tabs.forEach((btn, i) => {
    btn.addEventListener('click', () => switchProgramTab(i));
    btn.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        switchProgramTab(n, true);
      }
    });
  });

  /* ------------------------------------------------------------------
     4. Galeri layar penuh (data diambil dari HTML, satu sumber)
     ------------------------------------------------------------------ */
  const galleryItems = $$('#galeriGrid .galeri-item');
  const cinemaPhotos = galleryItems.map(el => ({
    src: el.dataset.full,
    title: el.dataset.title,
    cat: el.dataset.cat,
    alt: (el.querySelector('img') || {}).alt || ''
  }));
  let cinemaIdx = 0;
  const cImg = $('#cinemaImg');

  function renderCinema() {
    const item = cinemaPhotos[cinemaIdx];
    if (!item || !cImg) return;
    cImg.src = item.src;
    cImg.alt = item.alt;
    $('#cinemaTitle').textContent = item.title;
    $('#cinemaCategory').textContent = item.cat;
    $('#cinemaCount').textContent = (cinemaIdx + 1) + ' / ' + cinemaPhotos.length;
    // pra-muat foto berikutnya agar navigasi terasa instan
    const next = cinemaPhotos[(cinemaIdx + 1) % cinemaPhotos.length];
    if (next) { const pre = new Image(); pre.src = next.src; }
  }
  function stepCinema(d) {
    cinemaIdx = (cinemaIdx + d + cinemaPhotos.length) % cinemaPhotos.length;
    renderCinema();
  }
  galleryItems.forEach((el, i) => el.addEventListener('click', () => {
    cinemaIdx = i;
    renderCinema();
    openModal('cinemaGalleryModal', el);
  }));
  const cPrev = $('#cinemaPrev'), cNext = $('#cinemaNext');
  if (cPrev) cPrev.addEventListener('click', () => stepCinema(-1));
  if (cNext) cNext.addEventListener('click', () => stepCinema(1));

  // geser (swipe) di HP
  (function swipe() {
    const stage = $('.cinema-stage');
    if (!stage) return;
    let x0 = null;
    stage.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) stepCinema(dx < 0 ? 1 : -1);
      x0 = null;
    }, { passive: true });
  })();

  /* ------------------------------------------------------------------
     5. FAQ accordion
     ------------------------------------------------------------------ */
  $$('.faq-question').forEach(btn => btn.addEventListener('click', () => {
    const card = btn.closest('.faq-card');
    const wasOpen = card.classList.contains('open');
    $$('.faq-card.open').forEach(c => {
      c.classList.remove('open');
      $('.faq-question', c).setAttribute('aria-expanded', 'false');
    });
    if (!wasOpen) {
      card.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  }));

  /* ------------------------------------------------------------------
     6. Ripple pada tombol
     ------------------------------------------------------------------ */
  if (!reduceMotion) {
    document.addEventListener('click', e => {
      const btn = e.target.closest('.btn');
      if (!btn || e.detail === 0) return; // abaikan klik dari keyboard
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.className = 'origin-ripple';
      ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left}px;top:${e.clientY - rect.top}px`;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  }

  /* ------------------------------------------------------------------
     7. Tilt 3D — hanya untuk mouse (di HP tidak ada hover, hanya membebani)
     ------------------------------------------------------------------ */
  if (finePointer && !reduceMotion) {
    $$('.tilt-card').forEach(card => {
      let raf = 0, rect = null;
      card.addEventListener('mouseenter', () => {
        rect = card.getBoundingClientRect();
        card.style.willChange = 'transform';
        card.style.transition = 'transform 0.16s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.3s ease';
      });
      card.addEventListener('mousemove', e => {
        if (!rect) rect = card.getBoundingClientRect();
        const rx = -((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * 5.5;
        const ry = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 5.5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.style.transition = 'transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.25s ease';
          card.style.transform = `perspective(1200px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-6px) scale3d(1.012, 1.012, 1.012)`;
        });
      });
      card.addEventListener('mouseleave', () => {
        cancelAnimationFrame(raf);
        rect = null;
        card.style.transition = 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.85s cubic-bezier(0.16, 1, 0.3, 1)';
        card.style.transform = '';
        setTimeout(() => { card.style.willChange = ''; }, 900);
      });
    });
  }

  /* ------------------------------------------------------------------
     8. Count-up, reveal, stagger (IntersectionObserver)
     ------------------------------------------------------------------ */
  const hasIO = 'IntersectionObserver' in window;

  function animateCounter(el, target, duration = 1200) {
    const t0 = performance.now();
    (function step(t) {
      const p = Math.min((t - t0) / duration, 1);
      el.textContent = p < 1 ? Math.floor((1 - Math.pow(1 - p, 3)) * target) : target;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  if (hasIO && !reduceMotion) {
    const countIO = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      countIO.unobserve(en.target);
      animateCounter(en.target, parseInt(en.target.dataset.target, 10));
    }), { threshold: 0.5 });
    $$('.counter-num[data-target]').forEach(el => {
      // hanya animasikan angka yang belum terlihat saat halaman dibuka
      if (el.getBoundingClientRect().top > innerHeight) el.textContent = '0';
      countIO.observe(el);
    });
  }

  const revealEls = $$('.scroll-blur-in, .mask-reveal');
  if (hasIO && !reduceMotion) {
    const revealIO = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('revealed');
      revealIO.unobserve(en.target);
    }), { threshold: 0.15 });
    revealEls.forEach(el => revealIO.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('revealed'));
  }

  (function stagger() {
    const sel = '.stats-card,.visi-card-hero,.misi-tile,.facility-card,.lokasi-card,.faq-card,.spmb-info-panel,.spmb-poster-box,.spmb-step';
    const els = $$(sel);
    if (!hasIO || reduceMotion) return;
    els.forEach(el => {
      const sibs = Array.from(el.parentElement.children).filter(c => c.matches(sel));
      el.style.setProperty('--d', (Math.max(0, sibs.indexOf(el)) % 4) * 0.09 + 's');
      el.classList.add('rv-card');
    });
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(el => io.observe(el));
  })();

  /* ------------------------------------------------------------------
     9. Peta Google dimuat saat hampir terlihat
     ------------------------------------------------------------------ */
  (function lazyMap() {
    const box = $('#mapBox');
    const frame = box && $('iframe[data-src]', box);
    if (!frame) return;
    const load = () => {
      frame.src = frame.dataset.src;
      frame.addEventListener('load', () => { const ph = $('.map-placeholder', box); if (ph) ph.remove(); }, { once: true });
    };
    if (!hasIO) return load();
    const io = new IntersectionObserver(es => {
      if (es.some(e => e.isIntersecting)) { io.disconnect(); load(); }
    }, { rootMargin: '300px 0px' });
    io.observe(box);
  })();

  /* ------------------------------------------------------------------
     10. Sticky stacking sections + anchor halus
     ------------------------------------------------------------------ */
  const navbar = $('#navbar');
  const hero = $('.hero');
  const heroBg = $('.hero-parallax-bg');
  const bar = $('#scrollProgress');
  const tcards = $$('.timeline-card');
  const footer = $('footer');
  const navLinks = $$('nav .links a[href^="#"]');

  const secIds = ['profil', 'program', 'pembiasaan', 'fasilitas', 'galeri', 'lokasi', 'spmb', 'faq'];
  const stickyIds = ['profil', 'program', 'fasilitas', 'galeri', 'lokasi', 'spmb', 'faq']; // pembiasaan punya tumpukan kartu sendiri
  const secs = secIds.map(id => document.getElementById(id)).filter(Boolean);
  const anchors = new Map();

  secs.forEach((s, i) => {
    s.style.setProperty('--z', 11 + i);
    if (reduceMotion) return;
    if (stickyIds.includes(s.id)) {
      s.classList.add('stack-sec');
      const a = document.createElement('span'); // penanda posisi normal (untuk anchor & scrollspy)
      a.className = 'stack-anchor';
      s.parentNode.insertBefore(a, s);
      anchors.set(s.id, a);
    } else {
      s.classList.add('stack-rel');
    }
  });
  const refOf = id => anchors.get(id) || document.getElementById(id);

  function setTops() {
    secs.forEach(s => {
      if (s.classList.contains('stack-sec')) s.style.top = Math.min(0, innerHeight - s.offsetHeight) + 'px';
    });
  }

  function scrollToId(id) {
    const r = id === 'beranda' ? null : refOf(id);
    const pad = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
    const top = r ? r.getBoundingClientRect().top + scrollY - pad : 0;
    scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
    try { history.replaceState(null, '', '#' + id); } catch (_) { }
  }
  window.__scrollToId = scrollToId;

  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    if (!id || !document.getElementById(id)) return;
    e.preventDefault();
    scrollToId(id);
    if (id !== 'beranda') {
      const target = document.getElementById(id);
      target.setAttribute('tabindex', '-1');
      setTimeout(() => target.focus({ preventScroll: true }), 400);
    }
  }));

  /* ------------------------------------------------------------------
     11. SATU loop scroll untuk semua efek (baca dulu → tulis kemudian)
     ------------------------------------------------------------------ */
  const scrollSubs = [];
  let ticking = false;

  function frame() {
    ticking = false;
    // ---------- BACA ----------
    const y = scrollY, vh = innerHeight;
    const docH = root.scrollHeight - vh;
    const heroH = hero ? hero.offsetHeight : 0;
    const tRects = tcards.map(c => c.getBoundingClientRect());
    const secTops = secs.map(s => refOf(s.id).getBoundingClientRect().top);
    const nextTops = secs.map((s, i) => {
      if (!s.classList.contains('stack-sec')) return null;
      const n = secs[i + 1] || footer;
      return n ? n.getBoundingClientRect().top : null;
    });
    // ---------- TULIS ----------
    if (navbar) navbar.classList.toggle('scrolled', y > 30);
    if (bar) bar.style.transform = 'scaleX(' + (docH > 0 ? Math.min(1, y / docH) : 0) + ')';
    body.classList.toggle('past-hero', y > heroH * 0.6);

    if (!reduceMotion && hero && y < heroH * 1.2) {
      hero.style.setProperty('--hp', Math.min(1, Math.max(0, y / (heroH * 0.8))).toFixed(3));
      if (heroBg) heroBg.style.transform = 'scale(' + Math.max(1, 1.1 - y * 0.00015).toFixed(4) + ')';
    }

    tcards.forEach((c, i) => {
      const n = tRects[i + 1];
      const cr = tRects[i];
      const k = n ? Math.min(1, Math.max(0, (cr.bottom - n.top) / Math.max(1, cr.height - 20))) : 0;
      c.style.setProperty('--k', k.toFixed(3));
    });

    let cur = null;
    secs.forEach((s, i) => {
      if (secTops[i] <= vh * 0.45) cur = s.id;
      if (nextTops[i] !== null) {
        const k = Math.min(1, Math.max(0, 1 - nextTops[i] / vh));
        s.style.setProperty('--cover', k.toFixed(3));
      }
    });
    if (!window.__navLock) navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href').slice(1) === cur));

    scrollSubs.forEach(fn => fn(secTops, vh));
  }
  function requestFrame() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  function relayout() { setTops(); requestFrame(); }

  addEventListener('scroll', requestFrame, { passive: true });
  addEventListener('resize', relayout);
  addEventListener('load', relayout);
  if ('ResizeObserver' in window) {
    let rq = 0;
    const ro = new ResizeObserver(() => { cancelAnimationFrame(rq); rq = requestAnimationFrame(relayout); });
    secs.forEach(s => ro.observe(s));
  }
  relayout();

  /* ------------------------------------------------------------------
     12. Glass bottom nav (HP): bubble + cekungan bar yang bergeser
     ------------------------------------------------------------------ */
  (function bottomNav() {
    const ITEMS = [
      { id: 'beranda', label: 'Beranda', cover: ['beranda'], ic: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>' },
      { id: 'profil', label: 'Profil', cover: ['profil'], ic: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>' },
      { id: 'program', label: 'Program', cover: ['program', 'pembiasaan'], ic: '<path d="M2 5h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"/><path d="M22 5h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/>' },
      { id: 'fasilitas', label: 'Fasilitas', cover: ['fasilitas', 'galeri', 'lokasi'], ic: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M10 21v-4h4v4"/>' },
      { id: 'spmb', label: 'Daftar SPMB', cover: ['spmb', 'faq'], ic: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>' }
    ];
    const nav = $('#gnav');
    if (!nav) return;
    const mq = matchMedia('(max-width: 959px)');
    const T = 26, H = 60, R = 30, HW = 34, DEP = 26, BD = 46;
    const so = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ';

    nav.innerHTML =
      '<svg class="gnav-fx gnav-shadow" aria-hidden="true"><path id="gnShadow"/></svg>' +
      '<div class="gnav-glass" id="gnGlass"></div>' +
      '<svg class="gnav-fx" aria-hidden="true"><defs><linearGradient id="gnGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity=".2"/></linearGradient></defs><path id="gnEdge" fill="none" stroke="url(#gnGrad)" stroke-width="1.5"/></svg>' +
      '<div class="gnav-items" id="gnItems">' + ITEMS.map((it, i) =>
        '<button type="button" class="gnav-btn" data-i="' + i + '" aria-label="' + it.label + '" title="' + it.label + '">' + so + 'class="ic">' + it.ic + '</svg></button>').join('') + '</div>' +
      '<div class="gnav-bubble" id="gnBubble" aria-hidden="true">' + ITEMS.map((it, i) => so + 'class="bi" data-i="' + i + '">' + it.ic + '</svg>').join('') + '</div>';

    const glass = $('#gnGlass'), edgeP = $('#gnEdge'), shP = $('#gnShadow');
    const itemsEl = $('#gnItems'), bubble = $('#gnBubble');
    const btns = Array.from(itemsEl.children), bis = Array.from(bubble.children), fx = $$('.gnav-fx', nav);
    let W = 0, centers = [], active = 0, x = 0, v = 0, tx = 0, raf = 0, last = 0;

    function barPath(cx) {
      cx = Math.max(R + HW, Math.min(W - R - HW, cx));
      const sx = cx - HW, ex = cx + HW, by = T + DEP;
      return 'M' + R + ',' + T + 'H' + sx + 'C' + (sx + 18) + ',' + T + ' ' + (cx - 26) + ',' + by + ' ' + cx + ',' + by +
        'C' + (cx + 26) + ',' + by + ' ' + (ex - 18) + ',' + T + ' ' + ex + ',' + T + 'H' + (W - R) +
        'A' + R + ',' + R + ' 0 0 1 ' + (W - R) + ',' + (T + H) + 'H' + R + 'A' + R + ',' + R + ' 0 0 1 ' + R + ',' + T + 'Z';
    }
    function draw() {
      if (!W) return;
      const d = barPath(x);
      glass.style.clipPath = "path('" + d + "')";
      edgeP.setAttribute('d', d); shP.setAttribute('d', d);
      const st = Math.min(0.16, Math.abs(v) / 3600);
      bubble.style.transform = 'translate3d(' + (x - BD / 2) + 'px,0,0) scale(' + (1 + st) + ',' + (1 - st * 0.7) + ')';
    }
    function tick(t) {
      const dt = Math.min(0.033, (t - last) / 1000 || 0.016); last = t;
      v += (190 * (tx - x) - 21 * v) * dt; x += v * dt; draw();
      if (Math.abs(tx - x) < 0.15 && Math.abs(v) < 2) { x = tx; v = 0; draw(); raf = 0; return; }
      raf = requestAnimationFrame(tick);
    }
    function go() {
      if (reduceMotion) { x = tx; v = 0; draw(); return; }
      if (!raf && W) { last = performance.now(); raf = requestAnimationFrame(tick); }
    }
    function layout() {
      if (!mq.matches) { W = 0; return; }
      W = nav.clientWidth; if (!W) return;
      const pad = Math.max(12, (R + HW + 2 - W / 10) / 0.8);
      itemsEl.style.setProperty('--pad', pad + 'px');
      centers = btns.map(b => b.offsetLeft + b.offsetWidth / 2);
      fx.forEach(s => s.setAttribute('viewBox', '0 0 ' + W + ' ' + (T + H)));
      x = tx = centers[active]; v = 0; draw();
    }
    function setActive(i) {
      if (i === active) return;
      active = i;
      btns.forEach((b, j) => { b.classList.toggle('is-active', j === i); j === i ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current'); });
      bis.forEach((el, j) => el.classList.toggle('on', j === i));
      if (W) { tx = centers[i]; go(); }
    }

    let locked = false, lt = 0;
    scrollSubs.push(secTops => {
      if (locked || !W) return;
      let cur = 'beranda';
      secs.forEach((s, i) => { if (secTops[i] <= innerHeight * 0.5) cur = s.id; });
      const i = ITEMS.findIndex(it => it.cover.includes(cur));
      if (i >= 0) setActive(i);
    });
    addEventListener('scroll', () => {
      if (locked) { clearTimeout(lt); lt = setTimeout(() => { locked = false; requestFrame(); }, 140); }
    }, { passive: true });

    btns.forEach((b, i) => b.addEventListener('click', () => {
      locked = true; clearTimeout(lt); lt = setTimeout(() => { locked = false; requestFrame(); }, 900);
      setActive(i);
      scrollToId(ITEMS[i].id);
    }));

    btns[0].classList.add('is-active'); btns[0].setAttribute('aria-current', 'true'); bis[0].classList.add('on');
    layout();
    if ('ResizeObserver' in window) new ResizeObserver(layout).observe(nav); else addEventListener('resize', layout);
    mq.addEventListener('change', layout);
  })();

  /* ------------------------------------------------------------------
     13. Navbar desktop: cekungan + bubble yang meluncur ke menu aktif
     ------------------------------------------------------------------ */
  (function desktopNotch() {
    const nav = navbar, box = nav && $('.links', nav);
    if (!box) return;
    const mq = matchMedia('(min-width:960px)');
    nav.insertAdjacentHTML('afterbegin',
      '<svg class="nb-fx nb-shadow" aria-hidden="true"><path/></svg><div class="nb-glass"></div>' +
      '<svg class="nb-fx" aria-hidden="true"><defs><linearGradient id="nbGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".8"/><stop offset="1" stop-color="#fff" stop-opacity=".22"/></linearGradient></defs><path fill="none" stroke="url(#nbGrad)" stroke-width="1.5"/></svg>');
    const bubble = document.createElement('div'); bubble.className = 'nb-bubble'; bubble.setAttribute('aria-hidden', 'true');
    const txt = document.createElement('span'); bubble.appendChild(txt); nav.appendChild(bubble);
    const [shP, edP] = $$('.nb-fx path', nav), glass = $('.nb-glass', nav), fxs = $$('.nb-fx', nav);
    const BH = 34, DEP = 19, K = ['x', 'w', 'd'];
    const S = { x: 0, w: 90, d: 0 }, V = { x: 0, w: 0, d: 0 }, T = { x: 0, w: 90, d: 0 };
    const EPS = { x: 0.15, w: 0.15, d: 0.003 }, VEPS = { x: 2, w: 2, d: 0.05 };
    let W = 0, H = 0, raf = 0, last = 0, lk = 0;

    function path() {
      const R = H / 2, cx = S.x, flat = Math.max(0, S.w / 2 - 6), hw = flat + 30, by = H - DEP * Math.max(0, S.d);
      const sx = cx - hw, ex = cx + hw;
      return 'M' + R + ',0H' + (W - R) + 'A' + R + ',' + R + ' 0 0 1 ' + (W - R) + ',' + H + 'H' + ex +
        'C' + (ex - 16) + ',' + H + ' ' + (cx + flat + 14) + ',' + by + ' ' + (cx + flat) + ',' + by + 'H' + (cx - flat) +
        'C' + (cx - flat - 14) + ',' + by + ' ' + (sx + 16) + ',' + H + ' ' + sx + ',' + H + 'H' + R +
        'A' + R + ',' + R + ' 0 0 1 ' + R + ',0Z';
    }
    function draw() {
      const p = path(); glass.style.clipPath = "path('" + p + "')"; edP.setAttribute('d', p); shP.setAttribute('d', p);
      const st = Math.min(0.14, Math.abs(V.x) / 4500), sc = Math.max(0, S.d);
      bubble.style.opacity = Math.min(1, sc * 1.4); bubble.style.width = S.w + 'px';
      bubble.style.transform = 'translate3d(' + (S.x - S.w / 2) + 'px,' + (H - BH / 2 + 2) + 'px,0) scale(' + (sc * (1 + st)) + ',' + (sc * (1 - st * 0.6)) + ')';
    }
    function tick(t) {
      const dt = Math.min(0.033, (t - last) / 1000 || 0.016); last = t; let moving = false;
      K.forEach(k => {
        const kk = k === 'd' ? 220 : 190, cc = k === 'd' ? 24 : 21;
        V[k] += (kk * (T[k] - S[k]) - cc * V[k]) * dt; S[k] += V[k] * dt;
        if (Math.abs(T[k] - S[k]) > EPS[k] || Math.abs(V[k]) > VEPS[k]) moving = true;
      });
      if (!moving) { K.forEach(k => { S[k] = T[k]; V[k] = 0; }); draw(); raf = 0; return; }
      draw(); raf = requestAnimationFrame(tick);
    }
    function measure(snap) {
      if (!mq.matches) return;
      W = nav.offsetWidth; H = nav.offsetHeight; if (!W) return;
      fxs.forEach(s => s.setAttribute('viewBox', '0 0 ' + W + ' ' + H));
      const a = $('a.active', box);
      if (a) {
        const nr = nav.getBoundingClientRect(), r = a.getBoundingClientRect();
        T.x = r.left - nr.left + r.width / 2; T.w = Math.max(70, r.width + 16); T.d = 1;
        txt.textContent = a.textContent.trim(); nav.classList.add('has-notch');
        if (S.d < 0.02) { S.x = T.x; S.w = T.w; }
      } else { T.d = 0; nav.classList.remove('has-notch'); }
      if (snap || reduceMotion) { K.forEach(k => { S[k] = T[k]; V[k] = 0; }); draw(); return; }
      draw();
      if (!raf && K.some(k => Math.abs(T[k] - S[k]) > EPS[k])) { last = performance.now(); raf = requestAnimationFrame(tick); }
    }
    $$('a', box).forEach(a => a.addEventListener('click', () => {
      window.__navLock = true; clearTimeout(lk); lk = setTimeout(() => { window.__navLock = false; }, 900);
      $$('a', box).forEach(l => l.classList.toggle('active', l === a));
    }));
    addEventListener('scroll', () => {
      if (window.__navLock) { clearTimeout(lk); lk = setTimeout(() => { window.__navLock = false; requestFrame(); }, 140); }
    }, { passive: true });

    new MutationObserver(() => measure(false)).observe(box, { attributes: true, attributeFilter: ['class'], subtree: true });
    if ('ResizeObserver' in window) new ResizeObserver(() => measure(true)).observe(nav);
    mq.addEventListener('change', () => measure(true));
    addEventListener('load', () => measure(true));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => measure(true));
    measure(true);
  })();
})();
