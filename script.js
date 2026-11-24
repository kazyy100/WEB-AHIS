// 0. Korowa-Style Curtain Preloader (Lifts up automatically in 2 seconds)
(function initKorowaCurtain() {
  const curtain = document.getElementById('app-preloader');
  if (!curtain) return;

  const DISPLAY_TIME_MS = 2000; // Exactly 2 seconds as requested

  function liftCurtain() {
    if (curtain.classList.contains('lift-up')) return;
    curtain.classList.add('lift-up');
    document.body.classList.remove('preloader-active');
    setTimeout(() => {
      curtain.style.display = 'none';
    }, 1100);
  }

  // Auto lift up after 2 seconds
  setTimeout(liftCurtain, DISPLAY_TIME_MS);
})();
// 1. Shrink Header on Scroll (Scroll Effect 5)
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 30) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

// 2. Mobile Menu Drawer
function toggleMobileMenu() {
  const drawer = document.getElementById('mobileMenu');
  drawer.classList.toggle('open');
}
function closeMobileMenu() {
  const drawer = document.getElementById('mobileMenu');
  drawer.classList.remove('open');
}

// 3. Program Tabs Data & Switcher
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
    tag: "PILAR 02 — KEMENDIKBUDRISTEK TERAKREDITASI A",
    title: "Kurikulum Terpadu & Nalar Akademik",
    desc: "Memadukan kurikulum nasional Kemendikbud dengan wawasan keislaman secara integral. Menyiapkan peserta didik unggul dalam literasi sains, matematika, bahasa internasional, dan teknologi informasi.",
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

function switchProgramTab(index) {
  const buttons = document.querySelectorAll('.program-segmented-bar .seg-btn');
  buttons.forEach((btn, idx) => {
    if (idx === index) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  const data = programData[index];
  const showcase = document.querySelector('.program-showcase-box');
  showcase.style.opacity = '0.4';
  // opacity transition only to keep 3D tilt uninterrupted

  setTimeout(() => {
    document.getElementById('progPillarTag').textContent = data.tag;
    document.getElementById('progTitle').textContent = data.title;
    document.getElementById('progDesc').textContent = data.desc;
    document.getElementById('progCardHeader').textContent = data.cardHeader;
    document.getElementById('progCardBody').textContent = data.cardBody;

    const list = document.getElementById('progFeatureList');
    list.innerHTML = data.features.map(f => `
      <li>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <span>${f}</span>
      </li>
    `).join('');

    showcase.style.opacity = '1';
    // reset transform preserved for 3D tilt
  }, 150);
}

// 4. Cinema Gallery Data & Controls
const cinemaPhotos = [
  {
    src: "foto1.jpg",
    title: "Gedung Permanen 5 Lantai di Ciater, Serpong",
    cat: "GEDUNG MILIK SENDIRI"
  },
  {
    src: "foto2.jpg",
    title: "Tadabbur Alam & Sains Terapan",
    cat: "OUTING CLASS"
  },
  {
    src: "foto3.jpg",
    title: "Kelas Full AC & Smart Screen",
    cat: "RUANG KELAS"
  }
];
let currentCinemaIdx = 0;

function openCinemaGallery(index) {
  currentCinemaIdx = index;
  updateCinemaPhoto();
  const modal = document.getElementById('cinemaGalleryModal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCinemaGallery() {
  const modal = document.getElementById('cinemaGalleryModal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

function updateCinemaPhoto() {
  const item = cinemaPhotos[currentCinemaIdx];
  document.getElementById('cinemaImg').src = item.src;
  document.getElementById('cinemaTitle').textContent = item.title;
  document.getElementById('cinemaCategory').textContent = item.cat;
}

function nextCinemaPhoto() {
  currentCinemaIdx = (currentCinemaIdx + 1) % cinemaPhotos.length;
  updateCinemaPhoto();
}

function prevCinemaPhoto() {
  currentCinemaIdx = (currentCinemaIdx - 1 + cinemaPhotos.length) % cinemaPhotos.length;
  updateCinemaPhoto();
}

function closeCinemaOnClickOutside(e) {
  if (e.target.id === 'cinemaGalleryModal') closeCinemaGallery();
}

// 5. SPMB Poster Modal
function openPosterModal() {
  const modal = document.getElementById('spmbPosterModal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closePosterModal() {
  const modal = document.getElementById('spmbPosterModal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
}
function closePosterOnClickOutside(e) {
  if (e.target.id === 'spmbPosterModal') closePosterModal();
}

// 6. SPMB Direct Modal
function openSpmbModal() {
  const modal = document.getElementById('spmbDirectModal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeSpmbModal() {
  const modal = document.getElementById('spmbDirectModal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
}
function closeSpmbOnClickOutside(e) {
  if (e.target.id === 'spmbDirectModal') closeSpmbModal();
}

// 7. FAQ Accordion Toggle
function toggleFaq(card) {
  const isOpen = card.classList.contains('open');
  document.querySelectorAll('.faq-card').forEach(c => c.classList.remove('open'));
  if (!isOpen) {
    card.classList.add('open');
  }
}

// 8. Origin Awareness Ripple on All Buttons
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function (e) {
    const rect = this.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'origin-ripple';
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// 9. Interactive 3D Cursor Tilt on Cards (Solid Drawing & Slow-in Slow-out Damping Return)
document.querySelectorAll('.tilt-card').forEach(card => {
  let rafId = null;

  card.addEventListener('mouseenter', () => {
    // Fast yet damped anticipation transition into active tilt tracking
    card.style.transition = 'transform 0.16s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.3s ease';
  });

  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    // Proportional rotation angles: ~5-6 deg maximum
    const rx = -(dy / (rect.height / 2)) * 5.5;
    const ry = (dx / (rect.width / 2)) * 5.5;

    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      // Responsive tracking while moving cursor inside
      card.style.transition = 'transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.25s ease';
      card.style.transform = `perspective(1200px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-6px) scale3d(1.012, 1.012, 1.012)`;
    });
  });

  card.addEventListener('mouseleave', () => {
    if (rafId) cancelAnimationFrame(rafId);
    // "Slow in, slow out" & "Follow-through": Silky smooth 0.85s return damping back to level horizon
    card.style.transition = 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.85s cubic-bezier(0.16, 1, 0.3, 1)';
    card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1)';
  });
});

// 10. Scroll 7: Count Up Animation
function animateCounter(el, target, duration = 1200) {
  const start = 0;
  const startTime = performance.now();
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(easeOut * target);
    el.textContent = current;
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target;
    }
  }
  requestAnimationFrame(update);
}

const countObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.counted) {
      entry.target.dataset.counted = 'true';
      const target = parseInt(entry.target.dataset.target, 10);
      animateCounter(entry.target, target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.counter-num[data-target]').forEach(el => countObserver.observe(el));

// 11. Scroll 2: Blur In & Scroll 8: Mask Reveal Observer
const scrollRevealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      scrollRevealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.scroll-blur-in, .mask-reveal').forEach(el => scrollRevealObserver.observe(el));

// 12. Scroll 1: Zoom-Out Hero Parallax Background
const heroBg = document.querySelector('.hero-parallax-bg');
if (heroBg) {
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const scale = 1.10 - (scrolled * 0.00015);
    heroBg.style.transform = `scale(${Math.max(1.0, scale)})`;
  }, { passive: true });
}

// ===== SCROLL EFFECTS ADD-ON =====
// A. Progress bar + hero fade + kedalaman tumpukan kartu (satu rAF)
(function () {
  const bar = document.getElementById('scrollProgress');
  const hero = document.querySelector('.hero');
  const tcards = [...document.querySelectorAll('.timeline-card')];
  let ticking = false;
  function frame() {
    ticking = false;
    const y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')';
    if (hero) hero.style.setProperty('--hp', Math.min(1, Math.max(0, y / (hero.offsetHeight * 0.8))).toFixed(3));
    tcards.forEach((c, i) => {
      const n = tcards[i + 1];
      if (!n) return c.style.setProperty('--k', 0);
      const cr = c.getBoundingClientRect(), nr = n.getBoundingClientRect();
      const k = Math.min(1, Math.max(0, (cr.bottom - nr.top) / Math.max(1, cr.height - 20)));
      c.style.setProperty('--k', k.toFixed(3));
    });
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', req);
  frame();
})();

// B. Sticky stacking sections + scrollspy + anchor halus
(function () {
  const ids = ['profil', 'program', 'pembiasaan', 'fasilitas', 'galeri', 'lokasi', 'spmb', 'faq'];
  const sticky = ['profil', 'program', 'fasilitas', 'galeri', 'lokasi', 'spmb', 'faq']; // pembiasaan sudah punya tumpukan kartu sendiri
  const secs = ids.map(id => document.getElementById(id)).filter(Boolean);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const anchors = new Map();

  secs.forEach((s, i) => {
    s.style.setProperty('--z', 11 + i);
    if (reduce) return;
    if (sticky.includes(s.id)) {
      s.classList.add('stack-sec');
      // penanda nol-tinggi di posisi normal section (dipakai untuk anchor & scrollspy)
      const a = document.createElement('span');
      a.className = 'stack-anchor';
      s.parentNode.insertBefore(a, s);
      anchors.set(s.id, a);
    } else {
      s.classList.add('stack-rel');
    }
  });

  const links = [...document.querySelectorAll('nav .links a[href^="#"]')];
  const topOf = s => (anchors.get(s.id) || s).getBoundingClientRect().top;

  // Section lebih tinggi dari layar: menempel saat BAGIAN BAWAHNYA mencapai dasar layar
  function setTops() {
    secs.forEach(s => {
      if (s.classList.contains('stack-sec')) s.style.top = Math.min(0, innerHeight - s.offsetHeight) + 'px';
    });
  }

  function update() {
    const vh = innerHeight; let cur = null;
    secs.forEach((s, i) => {
      if (topOf(s) <= vh * 0.45) cur = s.id;
      if (s.classList.contains('stack-sec')) {
        const n = secs[i + 1] || document.querySelector('footer');
        const k = n ? Math.min(1, Math.max(0, 1 - n.getBoundingClientRect().top / vh)) : 0;
        s.style.setProperty('--cover', k.toFixed(3));
      }
    });
    if (!window.__navLock) links.forEach(a => a.classList.toggle('active', a.getAttribute('href').slice(1) === cur));
  }

  let t = false;
  function req() { if (!t) { t = true; requestAnimationFrame(() => { t = false; update(); }); } }
  function relayout() { setTops(); req(); }

  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', relayout);
  addEventListener('load', relayout);
  if ('ResizeObserver' in window) { const ro = new ResizeObserver(relayout); secs.forEach(s => ro.observe(s)); }
  relayout();

  // Klik menu: scroll ke posisi normal section (bukan posisi menempelnya)
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1), an = anchors.get(id);
    if (!an) return;
    e.preventDefault();
    const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    scrollTo({ top: an.getBoundingClientRect().top + scrollY - pad, behavior: 'smooth' });
    try { history.replaceState(null, '', '#' + id); } catch (_) {}
  }));
})();

// C. Staggered reveal untuk kartu
(function () {
  const sel = '.stats-card,.visi-card-hero,.misi-tile,.facility-card,.lokasi-card,.faq-card,.spmb-price-card,.spmb-info-panel,.spmb-poster-box';
  const els = [...document.querySelectorAll(sel)];
  const canIO = 'IntersectionObserver' in window;
  els.forEach(el => {
    const sibs = [...el.parentElement.children].filter(c => c.matches(sel));
    el.style.setProperty('--d', (Math.max(0, sibs.indexOf(el)) % 4) * 0.09 + 's');
    el.classList.add('rv-card');
    if (!canIO) el.classList.add('in');
  });
  if (!canIO) return;
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  els.forEach(el => io.observe(el));
})();

// Keyboard navigation for modals (Escape key)
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeCinemaGallery();
    closePosterModal();
    closeSpmbModal();
    closeMobileMenu();
  }
});

// ===== GLASS BOTTOM NAV: bubble + cekungan bar yang bergeser (spring) =====
(function () {
  const ITEMS = [
    { id: 'beranda', label: 'Beranda', cover: ['beranda'], ic: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>' },
    { id: 'profil', label: 'Profil', cover: ['profil'], ic: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>' },
    { id: 'program', label: 'Program', cover: ['program', 'pembiasaan'], ic: '<path d="M2 5h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"/><path d="M22 5h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/>' },
    { id: 'fasilitas', label: 'Fasilitas', cover: ['fasilitas', 'galeri', 'lokasi'], ic: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M10 21v-4h4v4"/>' },
    { id: 'spmb', label: 'Daftar SPMB', cover: ['spmb', 'faq'], ic: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>' }
  ];
  const nav = document.getElementById('gnav'); if (!nav) return;
  const T = 26, H = 60, R = 30, HW = 34, DEP = 26, BD = 46; // geometri bar & cekungan
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const so = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ';

  nav.innerHTML =
    '<svg class="gnav-fx gnav-shadow" aria-hidden="true"><path id="gnShadow"/></svg>' +
    '<div class="gnav-glass" id="gnGlass"></div>' +
    '<svg class="gnav-fx" aria-hidden="true"><defs><linearGradient id="gnGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity=".2"/></linearGradient></defs><path id="gnEdge" fill="none" stroke="url(#gnGrad)" stroke-width="1.5"/></svg>' +
    '<div class="gnav-items" id="gnItems">' + ITEMS.map((it, i) =>
      '<button type="button" class="gnav-btn" data-i="' + i + '" aria-label="' + it.label + '" title="' + it.label + '">' + so + 'class="ic">' + it.ic + '</svg></button>').join('') + '</div>' +
    '<div class="gnav-bubble" id="gnBubble" aria-hidden="true">' + ITEMS.map((it, i) => so + 'class="bi" data-i="' + i + '">' + it.ic + '</svg>').join('') + '</div>';

  const glass = document.getElementById('gnGlass'), edgeP = document.getElementById('gnEdge'), shP = document.getElementById('gnShadow');
  const itemsEl = document.getElementById('gnItems'), bubble = document.getElementById('gnBubble');
  const btns = [...itemsEl.children], bis = [...bubble.children], fx = [...nav.querySelectorAll('.gnav-fx')];
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
    const st = Math.min(0.16, Math.abs(v) / 3600); // meregang saat bergerak cepat
    bubble.style.transform = 'translate3d(' + (x - BD / 2) + 'px,0,0) scale(' + (1 + st) + ',' + (1 - st * 0.7) + ')';
  }
  function tick(t) {
    const dt = Math.min(0.033, (t - last) / 1000 || 0.016); last = t;
    v += (190 * (tx - x) - 21 * v) * dt; x += v * dt; draw();
    if (Math.abs(tx - x) < 0.15 && Math.abs(v) < 2) { x = tx; v = 0; draw(); raf = 0; return; }
    raf = requestAnimationFrame(tick);
  }
  function go() {
    if (reduce) { x = tx; v = 0; draw(); return; }
    if (!raf && W) { last = performance.now(); raf = requestAnimationFrame(tick); }
  }
  function layout() {
    W = nav.clientWidth; if (!W) return;
    const pad = Math.max(12, (R + HW + 2 - W / 10) / 0.8); // pusat ikon pertama cukup jauh dari ujung bar
    itemsEl.style.setProperty('--pad', pad + 'px');
    centers = btns.map(b => b.offsetLeft + b.offsetWidth / 2);
    fx.forEach(s => { s.setAttribute('viewBox', '0 0 ' + W + ' ' + (T + H)); });
    x = tx = centers[active]; v = 0; draw();
  }
  function setActive(i) {
    if (i === active) return;
    active = i;
    btns.forEach((b, j) => { b.classList.toggle('is-active', j === i); j === i ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current'); });
    bis.forEach((el, j) => el.classList.toggle('on', j === i));
    tx = centers[i]; go();
  }

  // --- sinkron dengan scroll ---
  const secIds = ['beranda', 'profil', 'program', 'pembiasaan', 'fasilitas', 'galeri', 'lokasi', 'spmb', 'faq'];
  const refOf = id => { const el = document.getElementById(id); if (!el) return null; const p = el.previousElementSibling; return (p && p.classList.contains('stack-anchor')) ? p : el; };
  let locked = false, lt = 0, pend = false;
  function sync() {
    if (locked) return;
    let cur = 'beranda';
    secIds.forEach(id => { const r = refOf(id); if (r && r.getBoundingClientRect().top <= innerHeight * 0.5) cur = id; });
    const i = ITEMS.findIndex(it => it.cover.includes(cur));
    if (i >= 0) setActive(i);
  }
  addEventListener('scroll', () => {
    if (locked) { clearTimeout(lt); lt = setTimeout(() => { locked = false; sync(); }, 140); }
    if (!pend) { pend = true; requestAnimationFrame(() => { pend = false; sync(); }); }
  }, { passive: true });

  // --- klik: bubble langsung pindah, halaman menyusul ---
  btns.forEach((b, i) => b.addEventListener('click', () => {
    const it = ITEMS[i];
    locked = true; clearTimeout(lt); lt = setTimeout(() => { locked = false; sync(); }, 900);
    setActive(i);
    if (it.id === 'beranda') return scrollTo({ top: 0, behavior: 'smooth' });
    const r = refOf(it.id); if (!r) return;
    const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    scrollTo({ top: r.getBoundingClientRect().top + scrollY - pad, behavior: 'smooth' });
  }));

  btns[0].classList.add('is-active'); btns[0].setAttribute('aria-current', 'true'); bis[0].classList.add('on');
  layout(); sync(); x = tx = centers[active]; v = 0; draw();
  if ('ResizeObserver' in window) new ResizeObserver(layout).observe(nav); else addEventListener('resize', layout);
  addEventListener('load', layout);
})();

// ===== NAVBAR DESKTOP: cekungan + bubble yang meluncur ke menu aktif =====
(function () {
  const nav = document.getElementById('navbar'), box = nav && nav.querySelector('.links'); if (!box) return;
  const mq = matchMedia('(min-width:960px)'), reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  nav.insertAdjacentHTML('afterbegin',
    '<svg class="nb-fx nb-shadow" aria-hidden="true"><path/></svg><div class="nb-glass"></div>' +
    '<svg class="nb-fx" aria-hidden="true"><defs><linearGradient id="nbGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".8"/><stop offset="1" stop-color="#fff" stop-opacity=".22"/></linearGradient></defs><path fill="none" stroke="url(#nbGrad)" stroke-width="1.5"/></svg>');
  const bubble = document.createElement('div'); bubble.className = 'nb-bubble'; bubble.setAttribute('aria-hidden', 'true');
  const txt = document.createElement('span'); bubble.appendChild(txt); nav.appendChild(bubble);
  const [shP, edP] = nav.querySelectorAll('.nb-fx path'), glass = nav.querySelector('.nb-glass'), fxs = [...nav.querySelectorAll('.nb-fx')];
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
    W = nav.offsetWidth; H = nav.offsetHeight; if (!W || !mq.matches) return;
    fxs.forEach(s => s.setAttribute('viewBox', '0 0 ' + W + ' ' + H));
    const a = box.querySelector('a.active');
    if (a) {
      const nr = nav.getBoundingClientRect(), r = a.getBoundingClientRect();
      T.x = r.left - nr.left + r.width / 2; T.w = Math.max(70, r.width + 16); T.d = 1;
      txt.textContent = a.textContent.trim(); nav.classList.add('has-notch');
      if (S.d < 0.02) { S.x = T.x; S.w = T.w; }
    } else { T.d = 0; nav.classList.remove('has-notch'); }
    if (snap || reduce) { K.forEach(k => { S[k] = T[k]; V[k] = 0; }); draw(); return; }
    draw();
    if (!raf && K.some(k => Math.abs(T[k] - S[k]) > EPS[k])) { last = performance.now(); raf = requestAnimationFrame(tick); }
  }
  // klik: bubble langsung pindah, halaman menyusul
  box.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    window.__navLock = true; clearTimeout(lk); lk = setTimeout(() => { window.__navLock = false; }, 900);
    box.querySelectorAll('a').forEach(l => l.classList.toggle('active', l === a));
  }));
  addEventListener('scroll', () => {
    if (window.__navLock) { clearTimeout(lk); lk = setTimeout(() => { window.__navLock = false; dispatchEvent(new Event('scroll')); }, 140); }
  }, { passive: true });

  new MutationObserver(() => measure(false)).observe(box, { attributes: true, attributeFilter: ['class'], subtree: true });
  if ('ResizeObserver' in window) new ResizeObserver(() => measure(true)).observe(nav);
  mq.addEventListener('change', () => measure(true));
  addEventListener('load', () => measure(true));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => measure(true));
  measure(true);
})();
