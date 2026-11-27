/* SMP Al Haudh — interaksi halaman (v8)
   Catatan performa:
   - Animasi scroll memakai GSAP + ScrollTrigger (file lokal di /vendor).
   - Efek scroll ringan lain dijalankan dalam SATU requestAnimationFrame: baca layout dulu, baru tulis
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
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  let curtainShown = false, curtainLifted = false, onCurtainLift = null, onCurtainDone = null;

  /* ------------------------------------------------------------------
     0. Welcoming animation (preloader) — sederhana & linear
        Bulatan muncul → bergeser lurus ke samping sambil "AL HAUDH" terbuka →
        tulisan & latar memudar, bulatan terbang & berubah menjadi bola logo di hero
        (.orb.o1), yang lalu terus bergerak pelan. Bisa dilewati: klik, tombol, scroll, geser.
     ------------------------------------------------------------------ */
  (function preloader() {
    const curtain = $('#app-preloader');
    const orb = $('.hero .orb.o1');
    const release = () => body.classList.remove('preloader-active');
    if (!curtain || root.classList.contains('no-preloader')) {
      if (curtain) curtain.remove();
      release();
      return;
    }
    try { sessionStorage.setItem('ah-seen', '1'); } catch (e) { }
    curtainShown = true;
    // JavaScript berjalan → pengaman CSS (auto-hilang 6 dtk) tidak diperlukan
    curtain.style.animation = 'none';
    body.style.animation = 'none';

    let heroStarted = false, finished = false;
    function startHero() {        // mainkan intro konten hero
      if (heroStarted) return;
      heroStarted = true;
      curtainLifted = true;
      if (onCurtainLift) onCurtainLift();
    }
    function finish() {
      if (finished) return;
      finished = true;
      startHero();
      release();
      if (orb) orb.style.opacity = ''; // bola logo mengambil alih
      curtain.remove();
      if (onCurtainDone) onCurtainDone();
      else if (orb) orb.style.animation = ''; // tanpa animasi GSAP → kembali ke animasi CSS
      ['keydown', 'wheel', 'touchmove'].forEach(t => removeEventListener(t, skip));
    }
    setTimeout(finish, 6000); // batas atas, apa pun yang terjadi

    let skip = () => { };
    if (hasGSAP) {
      const gsap = window.gsap;
      const dot = curtain.querySelector('.pl-dot');
      const text = curtain.querySelector('.pl-text');
      const bg = curtain.querySelector('.pl-bg');

      // Bulatan intro dibuat seukuran bola logo, lalu diperkecil → tetap tajam saat membesar.
      // Bola logo disembunyikan dulu & diam di posisi dasarnya agar bisa diukur tepat.
      if (orb) {
        orb.style.animation = 'none';
        orb.style.opacity = '0';
      }
      const S = orb ? orb.offsetWidth : 300;
      gsap.set(dot, { width: S, height: S, marginLeft: -S / 2, marginTop: -S / 2 });
      gsap.set(text, { xPercent: -50, yPercent: -50, x: 0, y: 0 }); // pusatkan lewat GSAP (lihat catatan di CSS)

      let d = 0, gap = 0, W = 0, target = { x: 0, y: 0 };
      const measure = () => {
        const fs = parseFloat(getComputedStyle(text).fontSize);
        d = fs * 0.72;      // diameter bulatan ≈ tinggi huruf kapital
        gap = fs * 0.34;
        W = text.offsetWidth;
      };
      const measureTarget = () => {
        if (!orb) { target = { x: 0, y: 0 }; return; }
        const r = orb.getBoundingClientRect();
        target = { x: r.left + r.width / 2 - innerWidth / 2, y: r.top + r.height / 2 - innerHeight / 2 };
      };

      const ease = 'power3.inOut';
      const tl = gsap.timeline({ paused: true, onComplete: finish });
      tl
        .call(measure, null, 0)
        // 1) bulatan muncul di tengah
        .fromTo(dot, { scale: 0 }, { scale: () => d / S, duration: 0.6, ease: 'power2.out', immediateRender: false }, 0.05)
        // 2) bergeser lurus ke kiri, "AL HAUDH" keluar dari sisi kanan bulatan.
        //    Tepi kiri tulisan selalu menempel di kanan bulatan (gerak & easing sama),
        //    sementara bagian yang terlihat melebar ke kanan → grup berakhir tepat di tengah.
        .addLabel('slide', 0.8)
        .to(dot, { x: () => -(gap + W) / 2, duration: 0.95, ease }, 'slide')
        .fromTo(text,
          { x: () => d / 2 + gap + W / 2, clipPath: 'inset(0% 100% 0% 0%)' },
          { x: () => (d + gap) / 2, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.95, ease, immediateRender: false },
          'slide')
        // 3) keluar: tulisan & latar memudar, bulatan terbang ke bola logo sambil membesar
        //    & memutih, lalu bola logo muncul menggantikannya (crossfade di posisi yang sama)
        .addLabel('exit', 2.35)
        .call(measureTarget, null, 'exit')
        .to(text, { opacity: 0, duration: 0.35, ease: 'power2.in' }, 'exit')
        .call(startHero, null, 'exit+=0.2')
        .to(bg, { opacity: 0, duration: 0.85, ease: 'power2.inOut' }, 'exit+=0.15')
        .to(dot, { x: () => target.x, y: () => target.y, scale: 1, duration: 1.15, ease }, 'exit')
        .to(dot, { backgroundColor: '#EDF4E9', duration: 0.9, ease: 'power1.inOut' }, 'exit+=0.2')
        .to(orb || {}, { opacity: 1, duration: 0.45, ease: 'power1.out' }, 'exit+=0.85')
        .to(dot, { opacity: 0, duration: 0.4, ease: 'power1.in' }, 'exit+=0.95');

      // Mulai setelah font siap (maks. 0,7 dtk) agar lebar tulisan terukur tepat
      const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
      Promise.race([fontsReady, new Promise(r => setTimeout(r, 700))]).then(() => { if (!finished) tl.play(); });

      // Lewati: lompat tepat sebelum bagian keluar, lalu keluar sedikit lebih cepat
      skip = () => {
        if (finished || tl.time() >= tl.labels.exit) return;
        measure();
        tl.seek(tl.labels.exit - 0.01).timeScale(1.5).play();
      };
    } else {
      // Tanpa GSAP: tulisan tampil, lalu tirai memudar (bulatan hero tetap dengan animasi CSS)
      curtain.classList.add('pl-static');
      let started = false;
      const out = () => {
        if (started) return;
        started = true;
        curtain.classList.add('lift-up');
        startHero();
        setTimeout(finish, 650);
      };
      setTimeout(out, 1300);
      skip = out;
    }
    curtain.addEventListener('click', () => skip());
    addEventListener('keydown', skip);
    addEventListener('wheel', skip, { passive: true });
    addEventListener('touchmove', skip, { passive: true });
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
    const fill = () => {
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
    };
    if (hasGSAP && !reduceMotion) {
      const parts = ['#progPillarTag', '#progTitle', '#progDesc', '#progFeatureList', '.prog-actions', '.program-preview-card'];
      window.gsap.to(parts, {
        opacity: 0, y: -10, duration: 0.18, stagger: 0.02, ease: 'power2.in', overwrite: true,
        onComplete: () => {
          fill();
          window.gsap.fromTo(parts, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power3.out', clearProps: 'transform' });
        }
      });
    } else {
      fill();
    }
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
     8. IntersectionObserver (dipakai peta)
     ------------------------------------------------------------------ */
  const hasIO = 'IntersectionObserver' in window;

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
     10. Anchor halus
     ------------------------------------------------------------------ */
  const navbar = $('#navbar');
  const hero = $('.hero');
  const bar = $('#scrollProgress');
  const navLinks = $$('nav .links a[href^="#"]');
  const secIds = ['profil', 'program', 'pembiasaan', 'fasilitas', 'galeri', 'lokasi', 'spmb', 'faq'];
  const secs = secIds.map(id => document.getElementById(id)).filter(Boolean);

  function scrollToId(id) {
    const el = id === 'beranda' ? null : document.getElementById(id);
    const pad = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
    const top = el ? el.getBoundingClientRect().top + scrollY - pad : 0;
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
     11. Satu loop scroll ringan: navbar, progress bar, scrollspy (baca dulu → tulis)
     ------------------------------------------------------------------ */
  const scrollSubs = [];
  let ticking = false;

  function frame() {
    ticking = false;
    // ---------- BACA ----------
    const y = scrollY, vh = innerHeight;
    const docH = root.scrollHeight - vh;
    const heroH = hero ? hero.offsetHeight : 0;
    const secTops = secs.map(s => s.getBoundingClientRect().top);
    // ---------- TULIS ----------
    if (navbar) navbar.classList.toggle('scrolled', y > 30);
    if (bar) bar.style.transform = 'scaleX(' + (docH > 0 ? Math.min(1, y / docH) : 0) + ')';
    body.classList.toggle('past-hero', y > heroH * 0.6);
    let cur = null;
    secs.forEach((s, i) => { if (secTops[i] <= vh * 0.45) cur = s.id; });
    if (!window.__navLock) navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href').slice(1) === cur));
    scrollSubs.forEach(fn => fn(secTops, vh));
  }
  function requestFrame() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', requestFrame, { passive: true });
  addEventListener('resize', requestFrame);
  addEventListener('load', requestFrame);
  requestFrame();

  /* ------------------------------------------------------------------
     11b. Animasi scroll — GSAP + ScrollTrigger
          Tanpa GSAP atau saat "kurangi animasi" aktif → konten langsung tampil apa adanya.
          Tidak ada lagi section/kartu yang saling menimpa.
     ------------------------------------------------------------------ */
  (function motion() {
    if (!hasGSAP) return;
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const ease = 'power3.out';

      // --- Intro hero: hanya saat tirai preloader tampil (kunjungan pertama) ---
      if (curtainShown && !curtainLifted) {
        const intro = gsap.timeline({ paused: true, defaults: { ease, duration: 0.95 } })
          .from('.hero-inner > *', { y: 36, opacity: 0, stagger: 0.09 }, 0.2)
          .from('.hero-architectural-title', { xPercent: -8, opacity: 0, duration: 1.3 }, 0.1);
        // bola logo tidak ikut di sini: ia muncul dari bulatan animasi pembuka
        onCurtainLift = () => intro.play();
      }

      // --- Bola logo hero: terus bergerak pelan (lintasan Lissajous, tanpa henti/patah) ---
      //     transform ditulis langsung (bukan lewat gsap.set) agar properti `translate`
      //     yang dipakai efek parallax scroll (--orb-y) tidak diambil alih GSAP.
      const circle = $('.hero .orb.o1');
      if (circle) {
        const TAU = Math.PI * 2;
        let t0 = 0, running = false, visible = true, started = false;
        const tick = () => {
          const t = (performance.now() - t0) / 1000;
          const ramp = Math.min(1, t / 2.5), k = ramp * ramp * (3 - 2 * ramp); // mulai lembut dari diam
          const ax = Math.min(innerWidth * 0.035, 48), ay = Math.min(innerHeight * 0.045, 36);
          const x = Math.sin(t * TAU / 13) * ax * k;   // periode panjang = gerak pelan
          const y = Math.sin(t * TAU / 9) * ay * k;
          const r = Math.sin(t * TAU / 11) * 5 * k;    // sedikit berayun
          circle.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) rotate(' + r.toFixed(2) + 'deg)';
        };
        const sync = () => {
          const on = started && visible;
          if (on && !running) gsap.ticker.add(tick);
          if (!on && running) gsap.ticker.remove(tick);
          running = on;
        };
        const begin = () => {
          if (started) return;
          started = true;
          circle.style.animation = 'none'; // gantikan animasi CSS (floatMarble) dengan gerak ini
          t0 = performance.now();
          sync();
        };
        // hemat CPU: berhenti saat hero tidak terlihat
        if ('IntersectionObserver' in window) {
          new IntersectionObserver(es => { visible = es[0].isIntersecting; sync(); }).observe($('.hero'));
        }
        if (curtainShown && !curtainLifted) onCurtainDone = begin; else begin();
      }

      // --- Hero parallax (scrub) ---
      gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 } })
        .fromTo('.hero-parallax-bg', { scale: 1.1, yPercent: 0 }, { scale: 1.1, yPercent: 14, ease: 'none' }, 0)
        .to('.hero-inner', { y: -80, opacity: 0.1, ease: 'none' }, 0)
        .to('.hero-architectural-title', { x: -120, ease: 'none' }, 0)
        .to('.hero .orb.o1', { '--orb-y': '-120px', ease: 'none' }, 0)
        .to('.scroll-indicator', { opacity: 0, ease: 'none', duration: 0.15 }, 0);

      // --- Judul section: chip → judul → deskripsi bergantian ---
      gsap.utils.toArray('.section-head, .spmb-steps-head').forEach(head => {
        gsap.from(head.children, {
          y: 32, opacity: 0, duration: 0.9, ease, stagger: 0.1,
          scrollTrigger: { trigger: head, start: 'top 86%', once: true }
        });
      });

      // --- Kartu muncul berkelompok (ScrollTrigger.batch) ---
      function reveal(sel, from, opts = {}) {
        const els = gsap.utils.toArray(sel);
        if (!els.length) return;
        // transition CSS dimatikan sementara agar tidak "melawan" tween GSAP
        gsap.set(els, Object.assign({ opacity: 0, transition: 'none' }, from));
        ScrollTrigger.batch(els, {
          start: opts.start || 'top 88%',
          once: true,
          onEnter: batch => gsap.to(batch, {
            x: 0, y: 0, scale: 1, opacity: 1,
            duration: opts.duration || 0.85, ease, stagger: opts.stagger || 0.09, overwrite: true,
            onComplete: () => gsap.set(batch, { clearProps: 'transform,opacity,transition' })
          })
        });
      }
      reveal('.stats-card', { y: 40 }, { start: 'top 99%' });
      reveal('.visi-card-hero, .misi-tile', { y: 40 });
      reveal('.program-segmented-bar, .program-showcase-box', { y: 36 });
      reveal('.timeline-card', { x: -36 }); // dari sisi garis timeline (kiri) — dari kanan bisa melebarkan halaman di HP
      reveal('.facility-card', { y: 40 });
      reveal('.galeri-item', { y: 50, scale: 0.94 }, { stagger: 0.06, duration: 0.9 });
      reveal('.lokasi-card, .map-frame-box', { y: 40 });
      reveal('.spmb-info-panel, .spmb-poster-box', { y: 40 });
      reveal('.spmb-step', { y: 36 });
      reveal('.faq-card', { y: 28 }, { stagger: 0.06 });

      // --- Timeline pembiasaan: garis progres + titik aktif ---
      const stack = $('.timeline-stack');
      if (stack) {
        gsap.fromTo('.timeline-line-fill', { scaleY: 0 }, {
          scaleY: 1, ease: 'none',
          scrollTrigger: { trigger: stack, start: 'top 62%', end: 'bottom 62%', scrub: 0.4 }
        });
        $$('.timeline-card', stack).forEach(card => ScrollTrigger.create({
          trigger: card, start: 'top+=40 62%',
          onEnter: () => card.classList.add('is-active'),
          onLeaveBack: () => card.classList.remove('is-active')
        }));
      }

      // --- Angka statistik menghitung naik ---
      $$('.counter-num[data-target]').forEach(el => {
        const o = { v: 0 }, target = parseInt(el.dataset.target, 10);
        el.textContent = '0';
        gsap.to(o, {
          v: target, duration: 1.4, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 98%', once: true },
          onUpdate: () => { el.textContent = Math.round(o.v); }
        });
      });

      return () => { onCurtainLift = null; };
    });

    // Tinggi konten berubah (FAQ dibuka, font dimuat, dsb.) → hitung ulang posisi trigger
    if ('ResizeObserver' in window) {
      let t = 0;
      const main = $('main');
      if (main) new ResizeObserver(() => { clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 250); }).observe(main);
    }
  })();

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
      '<svg class="gnav-fx gnav-shadow" aria-hidden="true" preserveAspectRatio="none"><path id="gnShadow"/></svg>' +
      '<div class="gnav-glass" id="gnGlass"></div>' +
      '<svg class="gnav-fx" aria-hidden="true" preserveAspectRatio="none"><defs><linearGradient id="gnGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity=".2"/></linearGradient></defs><path id="gnEdge" fill="none" stroke="url(#gnGrad)" stroke-width="1.5"/></svg>' +
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
      W = nav.getBoundingClientRect().width; if (!W) return;
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
      '<svg class="nb-fx nb-shadow" aria-hidden="true" preserveAspectRatio="none"><path/></svg><div class="nb-glass"></div>' +
      '<svg class="nb-fx" aria-hidden="true" preserveAspectRatio="none"><defs><linearGradient id="nbGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".8"/><stop offset="1" stop-color="#fff" stop-opacity=".22"/></linearGradient></defs><path fill="none" stroke="url(#nbGrad)" stroke-width="1.5"/></svg>');
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
      // Lapisan glass/garis tepi diposisikan absolut di dalam padding-box navbar.
      // Ukur lapisan glass itu sendiri dengan nilai pecahan (getBoundingClientRect) — clientWidth/Height
      // dibulatkan, dan selisih sekecil 0,3px membuat SVG mengecil & bergeser dari clip-path glass.
      const gr = glass.getBoundingClientRect();
      W = gr.width; H = gr.height; if (!W) return;
      fxs.forEach(s => s.setAttribute('viewBox', '0 0 ' + W + ' ' + H));
      const a = $('a.active', box);
      if (a) {
        const r = a.getBoundingClientRect();
        T.x = r.left - gr.left + r.width / 2; T.w = Math.max(70, r.width + 16); T.d = 1;
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
