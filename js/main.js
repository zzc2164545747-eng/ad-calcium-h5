// ======================
// AD钙奶30周年 H5 - 品牌重构版
// 风格：明亮奶白 / 极简现代 / 品牌动画
// 人格定位：青少年（复古新人类 / 甜心硬核派 / 活力佛系人 / 养生朋克族 / 尖牙猫奴系）
// ======================

// ===== STATE =====
let currentSection = 0;
const totalSections = 5;
let quizAnswers = [];
let currentQ = 0;

// ===== DOM =====
const main = document.getElementById('main');
const dots = document.querySelectorAll('.dot');
const loader = document.getElementById('loader');

// ===== WECHAT 100VH FIX =====
function setVH() {
  var vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', vh + 'px');
}
setVH();
window.addEventListener('resize', setVH);
window.addEventListener('orientationchange', function() { setTimeout(setVH, 100); });

// ===== UTILS =====
function lerpColor(c1, c2, t) {
  // c1, c2 are arrays of [r, g, b]
  const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
  return `${r},${g},${b}`;
}

// ===== PER-SECTION COLOR PALETTES =====
// Each section has its own palette; adjacent sections interpolate smoothly
const SECTION_PALETTES = [
  { // S0: Hero — deep bg + bright rings
    inner:[80,180,110], mid:[130,220,155], outer:[180,240,200],
    star:[220,248,230], spiral:[100,200,130], dot:[140,215,165],
    fill:'radial'
  },
  { // S1: Manifesto — ultra-bright + subtle dark rings
    inner:[200,228,208], mid:[248,253,249], outer:[155,198,170],
    star:[135,182,152], spiral:[108,158,128], dot:[118,168,138],
    fill:'radial'
  },
  { // S2: Products — light + light rings (seamless from S1)
    inner:[195,225,205], mid:[245,250,246], outer:[160,200,175],
    star:[140,185,158], spiral:[112,162,132], dot:[122,172,142],
    fill:'radial'
  },
  { // S3: Quiz — warm medium green, bridges light S2 → dark S4
    inner:[130,190,150], mid:[210,240,215], outer:[100,165,130],
    star:[175,220,190], spiral:[85,150,110], dot:[115,170,140],
    fill:'radial'
  },
  { // S4: Footer — deep bg + bright rings
    inner:[75,175,105], mid:[125,215,150], outer:[175,235,195],
    star:[215,245,225], spiral:[95,195,125], dot:[135,210,160],
    fill:'radial'
  },
];

function lerpPalette(a, b, t) {
  return {
    inner: lerpColor(a.inner, b.inner, t),
    mid:   lerpColor(a.mid,   b.mid,   t),
    outer: lerpColor(a.outer, b.outer, t),
    star:  lerpColor(a.star,  b.star,  t),
    spiral:lerpColor(a.spiral,b.spiral,t),
    dot:   lerpColor(a.dot,   b.dot,   t),
  };
}

// ===== CONFETTI TEXTURE FACTORY =====
function createConfettiTexture(canvasId) {
  return {
    canvas: null,
    ctx: null,
    animId: null,
    time: 0,
    particles: [],
    _paused: false,

    init() {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      this.createParticles();
      this.animate();
      window.addEventListener('resize', () => this.resize());
      var self = this;
      var obs = new IntersectionObserver(function(entries) {
        self._paused = !entries[0].isIntersecting;
      }, { threshold: 0 });
      obs.observe(this.canvas);
    },

    resize() {
      if (!this.canvas) return;
      var parent = this.canvas.parentElement;
      if (!parent) return;
      this.canvas.width = parent.offsetWidth * devicePixelRatio;
      this.canvas.height = parent.offsetHeight * devicePixelRatio;
      this.ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      this.w = parent.offsetWidth;
      this.h = parent.offsetHeight;
      this.createParticles();
    },

    createParticles() {
      var w = this.w || window.innerWidth;
      var h = this.h || window.innerHeight;
      var colors = [
        'rgba(34, 197, 94, 0.35)',
        'rgba(74, 222, 128, 0.30)',
        'rgba(134, 239, 172, 0.35)',
        'rgba(22, 163, 74, 0.28)',
        'rgba(187, 247, 208, 0.40)',
        'rgba(20, 83, 45, 0.16)',
        'rgba(255, 255, 255, 0.45)',
        'rgba(248, 250, 252, 0.38)',
      ];
      this.particles = [];
      for (var i = 0; i < 80; i++) {
        this.particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() * 8 + 3,
          vx: (Math.random() - 0.5) * 0.25,
          vy: Math.random() * 0.2 + 0.05,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.015,
          opacity: Math.random() * 0.5 + 0.2,
          shape: ['circle', 'diamond', 'leaf'][Math.floor(Math.random() * 3)],
          color: colors[Math.floor(Math.random() * colors.length)],
          phase: Math.random() * Math.PI * 2,
          sway: Math.random() * 0.4 + 0.1,
          bob: Math.random() * 0.25 + 0.05,
        });
      }
    },

    drawParticle(p) {
      var ctx = this.ctx;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.55, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'diamond') {
        var ds = p.size * 0.7;
        ctx.beginPath();
        ctx.moveTo(0, -ds);
        ctx.lineTo(ds * 0.5, 0);
        ctx.lineTo(0, ds);
        ctx.lineTo(-ds * 0.5, 0);
        ctx.closePath();
        ctx.fill();
      } else {
        var ls = p.size * 0.65;
        ctx.beginPath();
        ctx.ellipse(0, 0, ls, ls * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    },

    updateParticles() {
      var w = this.w;
      var h = this.h;
      for (var i = 0; i < this.particles.length; i++) {
        var p = this.particles[i];
        p.phase += 0.008;
        p.x += p.vx + Math.sin(p.phase) * p.sway;
        p.y += p.vy + Math.cos(p.phase * 0.7) * p.bob;
        p.rotation += p.rotSpeed;
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;
      }
    },

    animate() {
      if (!this.ctx) return;
      this.animId = requestAnimationFrame(() => this.animate());
      if (this._paused) return;
      this.time += 16;
      this.ctx.clearRect(0, 0, this.w, this.h);
      this.updateParticles();
      for (var i = 0; i < this.particles.length; i++) {
        this.drawParticle(this.particles[i]);
      }
    },

    destroy() {
      if (this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }
    },

    setPaused(v) { this._paused = v; }
  };
}

// ===== PRODUCTS DATA =====
var products = [
  {
    id: 'original',
    name: '经典原味',
    tag: '怀旧系 / 初心DNA',
    desc: '经典原味，是小时候藏在书包里的那一口甜。丝滑奶香配上微酸回甘，每一口都是童年的味道。',
    color: '#22C55E',
    light: '#DCFCE7',
    soft: '#86EFAC',
    img: 'wahaha/products/220-ad-classic.png',
    notes: ['维生素A+D', '钙奶经典配方', '220ml便携'],
    personality: '适合复古新人类 — vintage是穿搭，旧灵魂是内核'
  },
  {
    id: 'strawberry',
    name: '草莓甜心',
    tag: '甜酷系 / 敢爱敢恨',
    desc: '草莓的甜撞上AD钙的酸，像一场勇敢的初恋。鲜艳、热烈、不做作，喝下去整个人都亮起来。',
    color: '#F43F5E',
    light: '#FFE4E6',
    soft: '#FDA4AF',
    img: 'wahaha/products/220-ad-strawberry.png',
    notes: ['真实草莓汁', '0脂肪轻负担', '多巴胺配色'],
    personality: '适合甜心硬核派 — 甜美是保护色，硬核是真面目'
  },
  {
    id: 'peach',
    name: '蜜桃软糖',
    tag: '治愈系 / 温柔元气',
    desc: '蜜桃的温柔包裹住乳酸的清爽，像午后阳光晒过的被子。治愈不需要理由，这一口就是答案。',
    color: '#F59E0B',
    light: '#FEF3C7',
    soft: '#FCD34D',
    img: 'wahaha/products/220-ad-peach.png',
    notes: ['水蜜桃原汁', '温润顺口', '治愈系首选'],
    personality: '适合活力佛系人 — 嘴上说着随缘，心里全力以赴'
  },
  {
    id: 'collagen',
    name: '胶原仙紫',
    tag: '精致系 / 自律发光',
    desc: '胶原蛋白遇上AD经典，是宠爱自己的仪式感。仙紫瓶身里装的不只是饮料，更是「今天也要好好过」的宣言。',
    color: '#A855F7',
    light: '#F3E8FF',
    soft: '#D8B4FE',
    img: 'wahaha/products/450-ad-collagen.png',
    notes: ['胶原蛋白肽', '大容量450ml', '精致女孩必备'],
    personality: '适合养生朋克族 — 一边熬夜一边敷面膜，精致地活就是朋克'
  },
  {
    id: 'lacto',
    name: '清爽菌团',
    tag: '活力系 / 清爽无负担',
    desc: '乳酸菌发酵的清爽感，像操场上一阵风吹过。0负担、0拘束，喝完就想动起来。',
    color: '#38BDF8',
    light: '#E0F2FE',
    soft: '#7DD3FC',
    img: 'wahaha/products/450-ad-lacto.png',
    notes: ['活性乳酸菌', '清爽解腻', '运动好搭档'],
    personality: '适合尖牙猫奴系 — 骑最凶的金属摩托，贴最可爱的猫咪贴纸'
  }
];

// ===== RENDER PRODUCT TRACK =====
var morandi = {
  original:   { bg:'#D5E0D5', border:'#8FAF8F', rgb:'143,175,143' },
  strawberry: { bg:'#E5D8D8', border:'#B89595', rgb:'184,149,149' },
  peach:      { bg:'#E5DDD3', border:'#B8A990', rgb:'184,169,144' },
  collagen:   { bg:'#DDD8E2', border:'#A898B0', rgb:'168,152,176' },
  lacto:      { bg:'#D8DCE2', border:'#98A0B0', rgb:'152,160,176' },
};

function renderProductTrack() {
  var track = document.getElementById('productTrack');
  if (!track) return;
  track.innerHTML = products.map(function(p) {
    var m = morandi[p.id] || morandi.original;
    return '<div class="product-card" data-id="' + p.id + '" style="--card-border:' + m.border + ';--card-border-rgb:' + m.rgb + ';background: radial-gradient(circle at 50% 50%, ' + p.light + ' 0%, ' + p.light + ' 50%, #ffffff 100%);" onclick="openDetail(\'' + p.id + '\')">' +
      '<div class="card-bg" style="background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.3) 0%, transparent 60%);"></div>' +
      '<img src="' + p.img + '" alt="' + p.name + '" loading="lazy" decoding="async">' +
      '<h3>' + p.name + '</h3>' +
      '<span class="flavor-tag">' + p.tag + '</span>' +
    '</div>';
  }).join('');
}
renderProductTrack();

// ===== PRODUCT DETAIL =====
function openDetail(id) {
  var p = products.find(function(x) { return x.id === id; });
  if (!p) return;

  document.getElementById('detailImg').src = p.img;
  document.getElementById('detailImg').alt = p.name;
  document.getElementById('detailName').textContent = p.name;
  document.getElementById('detailDesc').textContent = p.desc;

  var tag = document.getElementById('detailTag');
  tag.textContent = p.tag.split(' / ')[0];
  tag.style.background = p.light;
  tag.style.color = p.color;

  var notesBox = document.getElementById('detailNotes');
  notesBox.innerHTML = p.notes.map(function(n) {
    return '<span class="detail-note" style="background:' + p.light + ';color:' + p.color + '">' + n + '</span>';
  }).join('');

  var persBox = document.getElementById('detailPersonality');
  persBox.textContent = p.personality;
  persBox.style.color = p.color;

  document.getElementById('productDetail').classList.add('show');
}

function closeDetail() {
  document.getElementById('productDetail').classList.remove('show');
}

document.getElementById('productDetail').addEventListener('click', function(e) {
  if (e.target === this) closeDetail();
});

var ManifestoTexture = createConfettiTexture('manifestoTexture');
var ProductsTexture = createConfettiTexture('productsTexture');
var QuizTexture = createConfettiTexture('quizTexture');
function removeWhiteFringe(img, threshold = 210) {
  if (img.naturalWidth === 0) return;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r > threshold && g > threshold && b > threshold) {
      const whiteness = Math.min(r, g, b);
      const alpha = 1 - (whiteness - threshold) / (255 - threshold);
      data[i + 3] = Math.round(data[i + 3] * Math.max(0, alpha));
    }
  }

  ctx.putImageData(imageData, 0, 0);
  img.src = canvas.toDataURL('image/png');
}

// ===== IMAGE PRELOADER — 预加载模块 =====
const loaderImage = document.getElementById('loaderImage');
const loaderProgressEl = document.getElementById('loaderProgress');
const loaderLoadingText = document.getElementById('loaderLoadingText');
let loaderFinished = false;

// All images that need preloading
var PRELOAD_IMAGES = [
  // Priority 1: visible on load/hero
  { url: 'wahaha/logo.png', pri: 0 },
  { url: 'wahaha/b18c14de69382b2f4a9fa34088062266.png', pri: 0 },
  { url: 'pic/hero-bottle.png', pri: 0 },
  // Priority 1: manifesto cards (visible on first scroll)
  { url: 'pic/schoolbag-ad.jpg', pri: 1 },
  { url: 'pic/store-shelf-ad.jpg', pri: 1 },
  { url: 'pic/kitchen-ad.jpg', pri: 1 },
  { url: 'pic/quiz-poster.jpg', pri: 1 },
  // Priority 2: product images
  { url: 'wahaha/products/220-ad-classic.png', pri: 2 },
  { url: 'wahaha/products/220-ad-strawberry.png', pri: 2 },
  { url: 'wahaha/products/220-ad-peach.png', pri: 2 },
  { url: 'wahaha/products/450-ad-collagen.png', pri: 2 },
  { url: 'wahaha/products/450-ad-lacto.png', pri: 2 },
  // Priority 2: character images
  { url: 'characters/vintage-human.png', pri: 2 },
  { url: 'characters/sweet-hardcore.png', pri: 2 },
  { url: 'characters/zen-energy.png', pri: 2 },
  { url: 'characters/punk-wellness.png', pri: 2 },
  { url: 'characters/cool-cat-lover.png', pri: 2 },
];

var preloadTotal = PRELOAD_IMAGES.length;
var preloadLoaded = 0;
var preloadStartTime = 0;
var preloadMinTime = 1800;  // minimum display 1.8s for brand impression
var preloadMaxTime = 10000; // max wait 10s then proceed anyway

function updateLoaderProgress(percent) {
  if (loaderFinished) return;
  loaderProgressEl.style.width = Math.min(100, percent) + '%';
}

function finishLoader() {
  if (loaderFinished) return;
  loaderFinished = true;
  updateLoaderProgress(100);

  try { ManifestoTexture.init(); } catch(e) {}
  try { ProductsTexture.init(); } catch(e) {}
  try { QuizTexture.init(); } catch(e) {}
  try { FooterTexture.init(); } catch(e) {}
  try { initOrientation(); } catch(e) {}

  setTimeout(function() {
    loader.classList.add('hide');
    try { initAnimations(); } catch(e) {}
  }, 400);

  // Absolute failsafe
  setTimeout(function() {
    loader.classList.add('hide');
  }, 5000);
}

function tryFinishPreloader() {
  var elapsed = Date.now() - preloadStartTime;
  var allPri1Done = true;

  // Check if all priority 0 and 1 images are loaded
  for (var i = 0; i < PRELOAD_IMAGES.length; i++) {
    if (PRELOAD_IMAGES[i].pri <= 1 && PRELOAD_IMAGES[i]._status !== 'done') {
      allPri1Done = false;
      break;
    }
  }

  // Finish when: all pri0+pri1 loaded AND min time elapsed, OR max time reached
  if (allPri1Done && elapsed >= preloadMinTime) {
    finishLoader();
  } else if (elapsed >= preloadMaxTime) {
    finishLoader();
  }
}

function onImageLoaded(entry) {
  preloadLoaded++;
  var pct = Math.round((preloadLoaded / preloadTotal) * 100);
  updateLoaderProgress(pct);

  if (pct < 30) loaderLoadingText.textContent = 'LOADING...';
  else if (pct < 60) loaderLoadingText.textContent = '资源加载中...';
  else if (pct < 90) loaderLoadingText.textContent = '准备就绪...';
  else loaderLoadingText.textContent = '即将开启...';

  tryFinishPreloader();
}

function onImageError(entry) {
  // Treat errors as "done" so they don't block
  preloadLoaded++;
  entry._status = 'done';
  updateLoaderProgress(Math.round((preloadLoaded / preloadTotal) * 100));
  tryFinishPreloader();
}

function initPreloader() {
  preloadStartTime = Date.now();
  updateLoaderProgress(5);

  // Sort by priority
  PRELOAD_IMAGES.sort(function(a, b) { return a.pri - b.pri; });
  preloadTotal = PRELOAD_IMAGES.length;

  // Load each image
  for (var i = 0; i < PRELOAD_IMAGES.length; i++) {
    (function(entry) {
      var img = new Image();
      img.onload = function() {
        entry._status = 'done';
        onImageLoaded(entry);
      };
      img.onerror = function() {
        onImageError(entry);
      };
      // Timeout per image: 15s
      setTimeout(function() {
        if (entry._status !== 'done') {
          entry._status = 'done';
          onImageLoaded(entry);
        }
      }, 15000);
      entry._status = 'loading';
      img.src = entry.url;
    })(PRELOAD_IMAGES[i]);
  }

  // Progress polling + min/max time enforcement
  var checkInterval = setInterval(function() {
    if (loaderFinished) {
      clearInterval(checkInterval);
      return;
    }
    tryFinishPreloader();
  }, 200);
}

// Click/touch to skip
loader.addEventListener('click', function() {
  if (!loaderFinished) finishLoader();
});
loader.addEventListener('touchstart', function(e) {
  if (!loaderFinished) { e.preventDefault(); finishLoader(); }
}, { passive: false });
document.addEventListener('keydown', function(e) {
  if ((e.key === ' ' || e.key === 'Enter') && !loaderFinished) {
    e.preventDefault();
    finishLoader();
  }
});

// ===== HERO STAR TRAILS (星轨) =====
function initHeroStarTrails() {
  var c = document.getElementById('heroStarTrails');
  if (!c) return;
  var ctx = c.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var w, h, cx, cy;
  var rotation = 0;
  var speed = 0.0003;

  // 4条轨道 = 4个十年节点
  var orbits = [
    { r: 85,  lw: 1.8, stroke: 'rgba(95,174,98,0.25)',  dash: 24, gap: 14, year: '1996', labelAngle: Math.PI },
    { r: 142, lw: 2.2, stroke: 'rgba(74,158,76,0.32)',  dash: 36, gap: 12, year: '2006', labelAngle: -Math.PI*0.08 },
    { r: 200, lw: 2.5, stroke: 'rgba(58,138,60,0.38)',  dash: 48, gap: 12, year: '2016', labelAngle: Math.PI*0.32 },
    { r: 258, lw: 2.8, stroke: 'rgba(255,179,71,0.45)', dash: 54, gap: 12, year: '2026', labelAngle: Math.PI*0.65 },
  ];

  function resize() {
    var hero = document.querySelector('.hero-comic');
    if (!hero) return;
    var rect = hero.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    c.width  = w * dpr;
    c.height = h * dpr;
    c.style.width  = w + 'px';
    c.style.height = h + 'px';
    cx = w / 2;
    cy = h * 0.46;
  }

  function draw() {
    ctx.setTransform(1,0,0,1,0,0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    for (var i = 0; i < orbits.length; i++) {
      var o = orbits[i];
      var r = o.r;

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.setLineDash([o.dash, o.gap]);
      ctx.lineDashOffset = rotation * r * 0.5 + i * 6;
      ctx.strokeStyle = o.stroke;
      ctx.lineWidth = o.lw;
      ctx.stroke();
      ctx.restore();

      // 轨道标注年份 — 分布在不同钟点方向
      if (o.year) {
        var la = o.labelAngle || 0;
        var lx = cx + Math.cos(la) * (r + 14);
        var ly = cy + Math.sin(la) * (r + 14);

        var isRight = Math.cos(la) > 0.15;
        var isLeft  = Math.cos(la) < -0.15;

        ctx.fillStyle = o.year === '2026' ? '#FFB347' : 'rgba(95,174,98,0.7)';
        ctx.font = (o.year === '2026' ? 'bold ' : '') + '11px "ErYaXinDaHei","Noto Sans SC",sans-serif';
        ctx.textAlign = isRight ? 'left' : (isLeft ? 'right' : 'center');
        ctx.textBaseline = 'middle';
        ctx.fillText(o.year, lx, ly);
      }
    }

    // 中心光斑
    var core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 28);
    core.addColorStop(0, 'rgba(123,198,126,0.3)');
    core.addColorStop(0.5, 'rgba(168,222,170,0.12)');
    core.addColorStop(1, 'rgba(123,198,126,0)');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, Math.PI * 2);
    ctx.fill();

    // —— 星星时钟指针 + 实时时间 ——
    drawClockHands(ctx, cx, cy);
    drawTimeDisplay(ctx, cx, cy);
  }

  // 实时时间角度
  function getRealTimeAngles() {
    var now = new Date();
    var h = now.getHours() % 12;
    var m = now.getMinutes();
    var s = now.getSeconds();
    var ms = now.getMilliseconds();
    // 时针：每12小时一圈
    var hourAngle = (h + m / 60) / 12 * Math.PI * 2 - Math.PI / 2;
    // 分针：每60分钟一圈
    var minAngle = (m + s / 60) / 60 * Math.PI * 2 - Math.PI / 2;
    // 秒针：每60秒一圈（含毫秒平滑）
    var secAngle = (s + ms / 1000) / 60 * Math.PI * 2 - Math.PI / 2;
    return { hour: hourAngle, min: minAngle, sec: secAngle };
  }

  function drawClockHands(ctx, cx, cy) {
    var angles = getRealTimeAngles();
    // 秒针 — 红色，细长，最外层
    drawStarHand(ctx, cx, cy, angles.sec, 8, 85, 270, 'rgba(123,198,126,GLOW)', 2.0, true);
    // 分针 — 橙色
    drawStarHand(ctx, cx, cy, angles.min, 6, 88, 260, 'rgba(255,179,71,GLOW)', 2.6, true);
    // 时针 — 品牌绿，最短
    drawStarHand(ctx, cx, cy, angles.hour, 5, 90, 200, 'rgba(95,174,98,GLOW)', 2.8, false);
  }

  function drawTimeDisplay(ctx, cx, cy) {
    var now = new Date();
    var hh = String(now.getHours()).padStart(2, '0');
    var mm = String(now.getMinutes()).padStart(2, '0');
    var ss = String(now.getSeconds()).padStart(2, '0');
    var timeStr = hh + ':' + mm + ':' + ss;

    // 时间框位于第3和第4轨道之间下方，避免被奶瓶遮挡
    var boxCY = cy + 225;
    var boxCX = cx;

    // 边框
    var boxW = 104;
    var boxH = 34;
    var rx = boxCX - boxW / 2;
    var ry = boxCY - boxH / 2;

    ctx.save();
    var radius = 8;
    ctx.beginPath();
    ctx.moveTo(rx + radius, ry);
    ctx.lineTo(rx + boxW - radius, ry);
    ctx.arcTo(rx + boxW, ry, rx + boxW, ry + radius, radius);
    ctx.lineTo(rx + boxW, ry + boxH - radius);
    ctx.arcTo(rx + boxW, ry + boxH, rx + boxW - radius, ry + boxH, radius);
    ctx.lineTo(rx + radius, ry + boxH);
    ctx.arcTo(rx, ry + boxH, rx, ry + boxH - radius, radius);
    ctx.lineTo(rx, ry + radius);
    ctx.arcTo(rx, ry, rx + radius, ry, radius);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(95,174,98,0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 时间文字
    ctx.fillStyle = '#5FAE62';
    ctx.font = '400 20px "ErYaXinDaHei","Noto Sans SC",sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(timeStr, boxCX, boxCY);
    ctx.restore();
  }

  function drawStarHand(ctx, cx, cy, angle, count, startR, endR, glowColor, starR, isMinute) {
    var step = (endR - startR) / (count - 1);

    // —— 连线：纯净发光细线 ——
    var x1 = cx + Math.cos(angle) * startR;
    var y1 = cy + Math.sin(angle) * startR;
    var x2 = cx + Math.cos(angle) * endR;
    var y2 = cy + Math.sin(angle) * endR;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = glowColor.replace('GLOW', '0.5');
    ctx.lineWidth = isMinute ? 1.5 : 2.0;
    ctx.stroke();
    ctx.restore();

    // —— 星点：自发光两层高光 ——
    for (var i = 0; i < count; i++) {
      var r = startR + i * step;
      var sx = cx + Math.cos(angle) * r;
      var sy = cy + Math.sin(angle) * r;

      var isTip = (i === count - 1);
      var rMul = isTip ? 1.8 : 1;
      var sr = starR * rMul;

      // 第一层：外层柔光
      var outerGlow = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 3.5);
      outerGlow.addColorStop(0, glowColor.replace('GLOW', '0.35'));
      outerGlow.addColorStop(1, glowColor.replace('GLOW', '0'));
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(sx, sy, sr * 3.5, 0, Math.PI * 2);
      ctx.fill();

      // 第二层：实心亮光（无色相过渡，纯色发光）
      var innerGlow = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 1.5);
      innerGlow.addColorStop(0, glowColor.replace('GLOW', '0.95'));
      innerGlow.addColorStop(0.6, glowColor.replace('GLOW', '0.65'));
      innerGlow.addColorStop(1, glowColor.replace('GLOW', '0'));
      ctx.fillStyle = innerGlow;
      ctx.beginPath();
      ctx.arc(sx, sy, sr * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function animate() {
    if (!c._paused) {
      rotation += speed;
      draw();
    }
    requestAnimationFrame(animate);
  }

  resize();
  draw();
  animate();

  window.addEventListener('resize', function() {
    resize();
    draw();
  });
}

// ===== MANIFESTO STAR TRAILS (light version) =====
function initManiStarTrails() {
  var c = document.getElementById('maniStarTrails');
  if (!c) return;
  var ctx = c.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var w, h, cx, cy;
  var rotation = 0;
  var speed = 0.00025;

  var orbits = [
    { r: 160, lw: 1.6, stroke: 'rgba(95,174,98,0.18)', dash: 30, gap: 16 },
    { r: 240, lw: 2.0, stroke: 'rgba(123,198,126,0.22)', dash: 42, gap: 14 },
  ];

  function resize() {
    var mani = document.querySelector('.manifesto');
    if (!mani) return;
    var rect = mani.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    c.width  = w * dpr;
    c.height = h * dpr;
    c.style.width  = w + 'px';
    c.style.height = h + 'px';
    cx = w / 2;
    cy = h * 0.42;
  }

  function draw() {
    ctx.setTransform(1,0,0,1,0,0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    for (var i = 0; i < orbits.length; i++) {
      var o = orbits[i];
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, o.r, 0, Math.PI * 2);
      ctx.setLineDash([o.dash, o.gap]);
      ctx.lineDashOffset = rotation * o.r * 0.4 + i * 5;
      ctx.strokeStyle = o.stroke;
      ctx.lineWidth = o.lw;
      ctx.stroke();
      ctx.restore();
    }

    // 中心微光
    var core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 20);
    core.addColorStop(0, 'rgba(123,198,126,0.15)');
    core.addColorStop(1, 'rgba(123,198,126,0)');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.fill();
  }

  function animate() {
    if (!c._paused) {
      rotation += speed;
      draw();
    }
    requestAnimationFrame(animate);
  }

  resize();
  draw();
  animate();

  window.addEventListener('resize', function() {
    resize();
    draw();
  });
}

function boot() {
  initPreloader();
  initHeroStarTrails();
  initManiStarTrails();
  initHourglass();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

// ===== HOURGLASS CLICK — 沙漏翻转进入下一页 =====
function bindHourglass(wrapId, targetIndex) {
  var wrap = document.getElementById(wrapId);
  var hg = wrap ? wrap.querySelector('.hourglass') : null;
  if (!wrap || !hg) return;

  wrap.addEventListener('click', function() {
    if (hg.classList.contains('flipping')) return;
    hg.classList.add('flipping');

    setTimeout(function() {
      scrollToSection(targetIndex);
    }, 500);

    setTimeout(function() {
      hg.classList.remove('flipping');
    }, 800);
  });
}

function initHourglass() {
  bindHourglass('scrollHint', 1);
  bindHourglass('maniHourglass', 2);
  bindHourglass('prodHourglass', 3);
  bindHourglass('quizHourglass', 4);
  bindHourglass('footerHourglass', 0);  // 最后一页回到顶部
}

// ===== DEVICE ORIENTATION — GRAVITY SENSOR =====
let rawTiltX = 0, rawTiltY = 0;
let smoothTiltX = 0, smoothTiltY = 0;

function initOrientation() {
  if (!window.DeviceOrientationEvent) return;
  window.addEventListener('deviceorientation', (e) => {
    rawTiltX = (e.gamma || 0) / 90;
    rawTiltY = ((e.beta || 0) - 45) / 90;
  });
}

function updateSmoothTilt() {
  smoothTiltX += (rawTiltX - smoothTiltX) * 0.1;
  smoothTiltY += (rawTiltY - smoothTiltY) * 0.1;
}

// ===== SCROLL CONTROL =====
function scrollToSection(index) {
  if (index < 0 || index >= totalSections) return;
  currentSection = index;
  var sections = document.querySelectorAll('.section');
  var target = sections[index];

  if ('scrollBehavior' in document.documentElement.style) {
    target.scrollIntoView({ behavior: 'smooth' });
  } else {
    // Manual smooth scroll polyfill for WeChat X5 (Chromium 69)
    var startY = main.scrollTop;
    var endY = target.offsetTop;
    var startTime = null;
    var duration = 500;
    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      main.scrollTop = startY + (endY - startY) * easeInOutCubic(progress);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  updateDots(index);
}

function updateDots(index) {
  dots.forEach((d, i) => {
    d.classList.toggle('active', i === index);
  });
}

dots.forEach(dot => {
  dot.addEventListener('click', () => {
    const idx = parseInt(dot.dataset.index);
    scrollToSection(idx);
  });
});

// ===== SCROLL-DRIVEN TRANSITION =====
const manifestoSection = document.querySelector('.manifesto');
const quizSection = document.querySelector('.quiz');
const footerSection = document.querySelector('.finale');

function updateTransition() {
  var vh = window.innerHeight;
  var scrollY = main.scrollTop;

  // ---- Section index ----
  var sectionIndex = Math.floor(scrollY / vh);
  sectionIndex = Math.max(0, Math.min(totalSections - 1, sectionIndex));
  var sectionProgress = (scrollY - sectionIndex * vh) / vh;
  sectionProgress = Math.max(0, Math.min(1, sectionProgress));

  // ---- Hero→Manifesto crossfade ----
  var heroProgress = Math.max(0, Math.min(1, scrollY / vh));
  var comicPanel = document.querySelector('.comic-panel');
  var heroFade = Math.max(0, Math.min(1, heroProgress / 0.25));
  if (comicPanel) {
    comicPanel.style.opacity = 1 - heroFade;
    comicPanel.style.pointerEvents = heroFade > 0.5 ? 'none' : 'auto';
  }
  var maniFade = Math.max(0, Math.min(1, (heroProgress - 0.55) / 0.45));
  if (manifestoSection) {
    manifestoSection.style.opacity = maniFade;
    manifestoSection.style.pointerEvents = maniFade > 0.5 ? 'auto' : 'none';
  }

  // ---- Flip clock trigger (no opacity manipulation — scroll-snap handles visibility) ----
  if (sectionIndex >= 4 && !flipTriggered) {
    flipTriggered = true;
    startFlipClock();
  }
}

// ===== FLIP CLOCK ANIMATION =====
var flipTriggered = false;

function startFlipClock() {
  var tensEl = document.getElementById('flipTens');
  var onesEl = document.getElementById('flipOnes');
  if (!tensEl || !onesEl) return;

  var tensNum = tensEl.querySelector('.flip-num');
  var onesNum = onesEl.querySelector('.flip-num');

  // 个位快速翻 0→9→0 (每步80ms)
  var onesVal = 0;
  var onesInterval = setInterval(function() {
    onesVal = (onesVal + 1) % 10;
    onesNum.textContent = onesVal;
    if (onesVal === 0) { clearInterval(onesInterval); }
  }, 80);

  // 十位慢翻 0→1→2→3 (每步300ms)
  var tensSteps = [1, 2, 3];
  var stepIdx = 0;
  var tensInterval = setInterval(function() {
    if (stepIdx < tensSteps.length) {
      tensNum.textContent = tensSteps[stepIdx];
      stepIdx++;
    } else {
      clearInterval(tensInterval);
      // 定格弹跳
      tensEl.style.transform = 'scale(1.12)';
      onesEl.style.transform = 'scale(1.12)';
      setTimeout(function() {
        tensEl.style.transition = 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)';
        onesEl.style.transition = 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)';
        tensEl.style.transform = 'scale(1)';
        onesEl.style.transform = 'scale(1)';
      }, 100);
    }
  }, 300);
}

// ===== FOOTER STARFIELD TEXTURE =====
var FooterTexture = {
  canvas: null,
  ctx: null,
  animId: null,
  time: 0,
  ripples: [],
  lastRippleTime: 0,
  expandProgress: 0,
  targetExpand: 0,
  _paused: false,

  setExpand(v) {
    this.targetExpand = Math.max(0, Math.min(1, v));
  },

  init() {
    this.canvas = document.getElementById('footerTexture');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.ripples = [];
    this.lastRippleTime = 0;
    this.resize();
    this.animate();
    window.addEventListener('resize', () => this.resize());
  },

  resize() {
    if (!this.canvas) return;
    var rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width * devicePixelRatio;
    this.canvas.height = rect.height * devicePixelRatio;
    this.ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    this.w = rect.width;
    this.h = rect.height;
  },

  draw(time) {
    var ctx = this.ctx;
    var w = this.w;
    var h = this.h;
    var cx = w * 0.5;
    var cy = h * 0.45;
    var maxR = Math.sqrt(w * w + h * h) * 0.65;
    var t = time * 0.0001;
    var rotation = t * 0.25;
    var elapsed = time * 0.001;

    // Smooth-follow expand progress
    this.expandProgress += (this.targetExpand - this.expandProgress) * 0.08;
    var expand = this.expandProgress;

    ctx.clearRect(0, 0, w, h);

    // ---- Spawn ripples (scale with expand) ----
    if (elapsed - this.lastRippleTime > 2.2) {
      this.lastRippleTime = elapsed;
      var rippleMax = Math.sqrt(w * w + h * h) * (0.65 + expand * 0.25);
      this.ripples.push({
        radius: 0,
        maxRadius: rippleMax,
        speed: (0.3 + Math.random() * 0.5) * (1 + expand * 0.5),
        opacity: 0.55 + Math.random() * 0.35,
        lineWidth: 0.8 + Math.random() * 1.8,
        born: elapsed,
      });
      // Limit ripples
      if (this.ripples.length > 12) this.ripples.shift();
    }

    // ---- Draw expanding ripples ----
    for (var ri = this.ripples.length - 1; ri >= 0; ri--) {
      var rp = this.ripples[ri];
      rp.radius += rp.speed;
      var life = (elapsed - rp.born) / 3.5;
      if (life > 1 || rp.radius > rp.maxRadius) {
        this.ripples.splice(ri, 1);
        continue;
      }
      var fadeAlpha = rp.opacity * (1 - life) * (1 - rp.radius / rp.maxRadius);
      ctx.beginPath();
      ctx.arc(cx, cy, rp.radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(134,239,172,' + fadeAlpha + ')';
      ctx.lineWidth = rp.lineWidth;
      ctx.stroke();

      // Inner glow ring
      var innerAlpha = fadeAlpha * 0.35;
      ctx.beginPath();
      ctx.arc(cx, cy, rp.radius * 0.92, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(187,247,208,' + innerAlpha + ')';
      ctx.lineWidth = rp.lineWidth * 2.5;
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.translate(-cx, -cy);

    // Concentric rings — expand outward with scroll
    var ringCount = 38;
    var ringScale = 1 + expand * 0.6;
    for (var i = 0; i < ringCount; i++) {
      var ratio = i / ringCount;
      var r = (30 + ratio * maxR) * ringScale;
      var alpha = 0.06 + ratio * 0.18;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(74,222,128,' + alpha + ')';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Spiral arcs
    for (var s = 0; s < 3; s++) {
      var offset = s * 2.1 + t;
      ctx.beginPath();
      var points = 600;
      var first = true;
      for (var i = 0; i < points; i++) {
        var ratio = i / points;
        var r = 50 + ratio * maxR * 0.8;
        var angle = ratio * Math.PI * 2 * 10 + offset;
        var x = cx + Math.cos(angle) * r;
        var y = cy + Math.sin(angle) * r;
        if (first) { ctx.moveTo(x, y); first = false; }
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(74,222,128,' + (0.06 + s * 0.04) + ')';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Twinkling stars
    var stars = [
      { x: 0.08, y: 0.12, s: 2.2, sp: 0.6 },
      { x: 0.15, y: 0.18, s: 2.5, sp: 0.7 },
      { x: 0.30, y: 0.10, s: 2.0, sp: 0.9 },
      { x: 0.82, y: 0.22, s: 2.8, sp: 0.9 },
      { x: 0.90, y: 0.45, s: 2.4, sp: 0.7 },
      { x: 0.72, y: 0.15, s: 2.1, sp: 1.1 },
      { x: 0.55, y: 0.65, s: 3.0, sp: 1.1 },
      { x: 0.25, y: 0.72, s: 2.3, sp: 0.8 },
      { x: 0.45, y: 0.80, s: 2.6, sp: 0.6 },
      { x: 0.70, y: 0.55, s: 2.6, sp: 1.0 },
      { x: 0.88, y: 0.70, s: 2.0, sp: 0.8 },
      { x: 0.40, y: 0.38, s: 3.2, sp: 0.6 },
      { x: 0.60, y: 0.28, s: 2.3, sp: 1.0 },
      { x: 0.18, y: 0.50, s: 2.7, sp: 0.7 },
      { x: 0.78, y: 0.38, s: 2.2, sp: 0.9 },
    ];
    for (var j = 0; j < stars.length; j++) {
      var st = stars[j];
      var sx = st.x * w;
      var sy = st.y * h;
      var twinkle = Math.sin(t * 1.5 * st.sp) * 0.5 + 0.5;
      var alpha = 0.1 + twinkle * 0.2;
      var size = st.s * (0.7 + twinkle * 0.5);

      var glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, size * 2);
      glow.addColorStop(0, 'rgba(134,239,172,' + alpha + ')');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(sx, sy, size * 2, 0, Math.PI * 2);
      ctx.fill();

      // Star shape
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = 'rgba(187,247,208,' + (alpha * 1.2) + ')';
      ctx.beginPath();
      var rr = size;
      ctx.moveTo(0, -rr);
      ctx.quadraticCurveTo(rr * 0.3, -rr * 0.15, rr * 0.7, 0);
      ctx.quadraticCurveTo(rr * 0.3, rr * 0.15, 0, rr);
      ctx.quadraticCurveTo(-rr * 0.3, rr * 0.15, -rr * 0.7, 0);
      ctx.quadraticCurveTo(-rr * 0.3, -rr * 0.15, 0, -rr);
      ctx.fill();
      ctx.restore();
    }

    // Grain dots — tighter spacing for more stars
    var spacing = 10;
    for (var gx = spacing; gx < w; gx += spacing) {
      for (var gy = spacing; gy < h; gy += spacing) {
        var dx = gx - cx;
        var dy = gy - cy;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var distRatio = Math.min(1, dist / maxR);
        var phase = Math.sin(dist * 0.04 + t * 0.8) * 0.5 + 0.5;
        if (Math.random() > phase * 0.12) continue;
        ctx.beginPath();
        ctx.arc(gx, gy, 0.3 + phase * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(74,222,128,' + (0.08 + phase * 0.12) + ')';
        ctx.fill();
      }
    }

    ctx.restore();
  },

  animate() {
    if (!this.ctx) return;
    this.animId = requestAnimationFrame(() => this.animate());
    if (this._paused) return;
    this.time += 16;
    this.resize();
    this.draw(this.time);
  },

  destroy() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }
};

function lerpHex(from, to, t) {
  var f = parseInt(from.slice(1), 16);
  var t2 = parseInt(to.slice(1), 16);
  var r = Math.round(((f >> 16) & 0xff) + (((t2 >> 16) & 0xff) - ((f >> 16) & 0xff)) * t);
  var g = Math.round(((f >> 8) & 0xff) + (((t2 >> 8) & 0xff) - ((f >> 8) & 0xff)) * t);
  var b = Math.round((f & 0xff) + ((t2 & 0xff) - (f & 0xff)) * t);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Listen to scroll on #main
main.addEventListener('scroll', updateTransition, { passive: true });

// Free native scrolling — user controls transition pace, can pause anywhere

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown' || e.key === 'PageDown') scrollToSection(currentSection + 1);
  if (e.key === 'ArrowUp' || e.key === 'PageUp') scrollToSection(currentSection - 1);
});

function setCanvasPaused(idx, paused) {
  switch(idx) {
    case 0: {
      var c = document.getElementById('heroStarTrails');
      if (c) c._paused = paused;
      break;
    }
    case 1: {
      var c = document.getElementById('maniStarTrails');
      if (c) c._paused = paused;
      if (ManifestoTexture && ManifestoTexture.setPaused) ManifestoTexture.setPaused(paused);
      break;
    }
    case 2: if (ProductsTexture && ProductsTexture.setPaused) ProductsTexture.setPaused(paused); break;
    case 3: if (QuizTexture && QuizTexture.setPaused) QuizTexture.setPaused(paused); break;
    case 4: FooterTexture._paused = paused; break;
  }
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const sections = Array.from(document.querySelectorAll('.section'));
    const idx = sections.indexOf(entry.target);
    if (idx === -1) return;
    if (entry.isIntersecting) {
      currentSection = idx;
      updateDots(idx);
      setCanvasPaused(idx, false);
      if (idx === 4 && !flipTriggered) {
        flipTriggered = true;
        startFlipClock();
      }
    } else {
      setCanvasPaused(idx, true);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.section').forEach(sec => observer.observe(sec));

// ===== GSAP ANIMATIONS =====
function initAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    // Fallback: GSAP not loaded, reveal all sections without animation
    document.querySelectorAll('.hero-comic .comic-bottle, .hero-comic .comic-title, .hero-comic .comic-tagline, .hero-comic .timeline, .hero-comic .scroll-hint, .hero-comic .star-trails-canvas').forEach(function(el) {
      el.style.opacity = '1';
    });
    var bottle = document.querySelector('.hero-comic .comic-bottle');
    if (bottle) bottle.style.transform = 'scale(1)';
    // Reveal all downstream sections — prevents invisible content when GSAP CDN fails
    document.querySelectorAll('.manifesto-line1a, .manifesto-line1b, .manifesto-accent, .m-card, .products-header, .product-card, .quiz-start, .finale-badge, .finale-title, .finale-subtitle, .flip-clock, .finale-slogan, .finale-poster, .finale-actions, .finale-copyright').forEach(function(el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  // Hero entrance — 分步进场
  // Phase 1: 奶瓶从小变大
  // Phase 2: 星轨+时针分针显现
  // Phase 3: 标题+tagline+时间线一起出现
  const heroTL = gsap.timeline({ delay: 0.15 });
  heroTL
    // Phase 1: bottle
    .to('.hero-comic .comic-bottle', { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' })
    // Phase 2: star trails
    .to('.hero-comic .star-trails-canvas', { opacity: 1, duration: 0.6, ease: 'power2.in' }, '-=0.15')
    // Phase 3: text + timeline
    .to('.hero-comic .comic-title', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
    .to('.hero-comic .comic-tagline', { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.25')
    .to('.hero-comic .timeline', { opacity: 1, duration: 0.4, ease: 'power2.out' }, '-=0.2')
    .to('.hero-comic .scroll-hint', { opacity: 1, duration: 0.4, ease: 'power2.out' }, '-=0.15');

  // Manifesto — line-by-line sequential reveal
  const manTL = gsap.timeline({
    scrollTrigger: {
      trigger: '.manifesto',
      scroller: '#main',
      start: 'top 70%',
      toggleActions: 'play none none reverse',
    }
  });

  manTL.from('.manifesto-line1a', { x: -60, opacity: 0, duration: 0.5, ease: 'power2.out' })
       .from('.manifesto-line1b', { x: 60, opacity: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')
       .from('.manifesto-accent', { y: 25, opacity: 0, duration: 0.5, ease: 'power2.out' })
       .from('.m-card:nth-child(1)', { y: 30, opacity: 0, duration: 0.5, ease: 'power2.out' })
       .from('.m-card:nth-child(2)', { y: 30, opacity: 0, duration: 0.5, ease: 'power2.out' })
       .from('.m-card:nth-child(3)', { y: 30, opacity: 0, duration: 0.5, ease: 'power2.out' });

  // Products
  gsap.from('.products-header', {
    scrollTrigger: { trigger: '.products', scroller: '#main', start: 'top 60%' },
    y: 30, opacity: 0, duration: 0.7, ease: 'power2.out'
  });
  gsap.from('.product-card', {
    scrollTrigger: { trigger: '.product-track-wrap', scroller: '#main', start: 'top 80%' },
    scale: 0.85, opacity: 0, duration: 0.5, stagger: 0.08, ease: 'back.out(1.7)'
  });

  // Quiz
  gsap.from('.quiz-start', {
    scrollTrigger: { trigger: '.quiz', scroller: '#main', start: 'top 60%' },
    y: 40, opacity: 0, duration: 0.8, ease: 'power2.out'
  });

  // Finale — 30周年终章 素材渐显动画
  const finaleTL = gsap.timeline({
    scrollTrigger: {
      trigger: '.finale',
      scroller: '#main',
      start: 'top 85%',
      toggleActions: 'play none play reverse',
    }
  });
  finaleTL
    .from('.finale-badge',  { y: 40, opacity: 0, duration: 0.7, ease: 'power3.out' })
    .from('.finale-title',  { y: 50, scale: 0.8, opacity: 0, duration: 0.7, ease: 'power3.out' }, '-=0.35')
    .from('.finale-subtitle',{ y: 25, opacity: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')
    .from('.flip-clock',    { y: 30, opacity: 0, duration: 0.6, ease: 'power3.out' }, '+=0.05')
    .from('.finale-slogan', { y: 25, scale: 0.9, opacity: 0, duration: 0.5, ease: 'power3.out' }, '+=0.05')
    .from('.finale-poster', { y: 35, opacity: 0, duration: 0.6, ease: 'power3.out' }, '+=0.05')
    .from('.finale-actions',{ y: 25, opacity: 0, duration: 0.5, ease: 'power2.out' }, '-=0.15')
    .from('.finale-copyright',{ opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.1');
}

// ===== QUIZ DATA =====
const quizData = [
  {
    question: '周五晚上，你的理想状态是？',
    options: [
      { text: '窝在家看老动漫，重温童年', scores: { original: 3, strawberry: 0, peach: 1, collagen: 0, lacto: 1 } },
      { text: '叫上闺蜜去探店，拍大片发小红书', scores: { original: 0, strawberry: 3, peach: 1, collagen: 2, lacto: 0 } },
      { text: '去公园散步，看日落发呆', scores: { original: 1, strawberry: 0, peach: 3, collagen: 0, lacto: 1 } },
      { text: '健身房/瑜伽课，自律给我自由', scores: { original: 0, strawberry: 1, peach: 0, collagen: 3, lacto: 2 } },
      { text: '临时约球/骑行，说走就走', scores: { original: 1, strawberry: 0, peach: 0, collagen: 1, lacto: 3 } }
    ]
  },
  {
    question: '如果AD钙奶变成一种穿搭风格，你选？',
    options: [
      { text: '复古运动套装 + 厚底鞋（Y2K经典）', scores: { original: 3, strawberry: 0, peach: 0, collagen: 0, lacto: 1 } },
      { text: '甜辣crop top + 荧光配饰', scores: { original: 0, strawberry: 3, peach: 1, collagen: 1, lacto: 0 } },
      { text: '软糯毛衣 + 百褶裙（奶油感）', scores: { original: 1, strawberry: 0, peach: 3, collagen: 0, lacto: 0 } },
      { text: '极简黑白灰 + 金属配饰', scores: { original: 0, strawberry: 1, peach: 0, collagen: 3, lacto: 1 } },
      { text: 'oversize卫衣 + 滑板裤（街头感）', scores: { original: 0, strawberry: 0, peach: 0, collagen: 0, lacto: 3 } }
    ]
  },
  {
    question: '你的情绪充电方式是？',
    options: [
      { text: '翻看老照片，nostalgia是最好的解药', scores: { original: 3, strawberry: 0, peach: 2, collagen: 0, lacto: 0 } },
      { text: '买买买，拆快递的瞬间回血', scores: { original: 0, strawberry: 3, peach: 1, collagen: 2, lacto: 0 } },
      { text: '做一顿精致brunch，拍照修图', scores: { original: 0, strawberry: 1, peach: 3, collagen: 1, lacto: 0 } },
      { text: '列计划表，把生活拉回掌控感', scores: { original: 1, strawberry: 0, peach: 0, collagen: 3, lacto: 1 } },
      { text: '户外运动到大汗淋漓', scores: { original: 0, strawberry: 0, peach: 0, collagen: 0, lacto: 3 } }
    ]
  },
  {
    question: '以下哪句歌词最戳你？',
    options: [
      { text: '我还是从前那个少年，没有一丝丝改变', scores: { original: 3, strawberry: 0, peach: 1, collagen: 0, lacto: 0 } },
      { text: '姐就是女王，自信放光芒', scores: { original: 0, strawberry: 3, peach: 0, collagen: 2, lacto: 0 } },
      { text: '慢慢喜欢你，慢慢地亲密', scores: { original: 1, strawberry: 0, peach: 3, collagen: 0, lacto: 0 } },
      { text: '我要我属于我自己', scores: { original: 0, strawberry: 1, peach: 0, collagen: 3, lacto: 1 } },
      { text: '奔跑吧，骄傲的少年！', scores: { original: 1, strawberry: 0, peach: 0, collagen: 0, lacto: 3 } }
    ]
  },
  {
    question: '如果送朋友一份AD钙奶，你会说？',
    options: [
      { text: '不管几岁，快乐万岁！', scores: { original: 3, strawberry: 1, peach: 2, collagen: 0, lacto: 0 } },
      { text: '喝了这瓶，今天必须给我美爆朋友圈', scores: { original: 0, strawberry: 3, peach: 0, collagen: 2, lacto: 0 } },
      { text: '累了吧？这一口是给你的温柔', scores: { original: 1, strawberry: 0, peach: 3, collagen: 0, lacto: 1 } },
      { text: '补充维A维D，今晚不许熬夜了', scores: { original: 0, strawberry: 0, peach: 0, collagen: 3, lacto: 1 } },
      { text: '走！喝完这瓶去打球/跑步！', scores: { original: 0, strawberry: 0, peach: 0, collagen: 0, lacto: 3 } }
    ]
  }
];

const resultData = {
  original: {
    title: '复古新人类',
    desc: '你是一边穿着爸妈年代的 vintage 运动外套，一边用最新款手机拍复古滤镜短视频的矛盾体。怀旧不是你的舒适区，而是你的时尚武器。AD原味是你衣橱里永不过时的白T——经典、百搭、越旧越有味道。',
    character: 'characters/vintage-human.png',
    product: 'wahaha/products/220-ad-classic.png',
    tags: ['复古DNA', '新世代旧灵魂', 'vintage玩家', '经典即潮流'],
    color: '#7B8D6E',
    light: '#E8EDE2'
  },
  strawberry: {
    title: '甜心硬核派',
    desc: '你的朋友圈是粉色滤镜的甜妹日常，但耳机里放的是重型贝斯。粉色卫衣是你的战袍，底下藏着乐队T恤和未愈合的滑板伤疤。草莓味的甜只是你的保护色，骨子里的硬核才是真面目。',
    character: 'characters/sweet-hardcore.png',
    product: 'wahaha/products/220-ad-strawberry.png',
    tags: ['甜酷双修', '粉色暴击', '反差战神', '硬核少女心'],
    color: '#C94B7A',
    light: '#FBE4ED'
  },
  peach: {
    title: '活力佛系人',
    desc: '你嘴上说着"随便吧""差不多得了"，体测却悄悄拿了满分。不争不抢是你的处世哲学，但实力不允许你低调。蜜桃的温柔就像你的存在感——看似佛系，一出手就知道有没有。',
    character: 'characters/zen-energy.png',
    product: 'wahaha/products/220-ad-peach.png',
    tags: ['佛系赢家', '隐藏大佬', '躺不平卷不赢', '轻松开挂'],
    color: '#D4875E',
    light: '#FEF0E8'
  },
  collagen: {
    title: '养生朋克族',
    desc: '你穿着破洞牛仔裤，裤兜里却装着枸杞茶包；凌晨三点的夜你照熬，但胶原蛋白一片都不能少。朋克是你的态度，养生是你的底线。胶原蛋白的精致，刚好配你那颗又想叛逆又想长命百岁的心。',
    character: 'characters/punk-wellness.png',
    product: 'wahaha/products/450-ad-collagen.png',
    tags: ['朋克养生', '精致保温杯', '熬夜续命', '叛逆保健'],
    color: '#6B7FAD',
    light: '#EDF0F7'
  },
  lacto: {
    title: '尖牙猫奴系',
    desc: '你的默认表情是"别烦我"，但遇到猫的瞬间会自动切换夹子音。社交对你来说是耗电模式，独处才是快充。乳酸的清爽就像你的存在感——看似冷淡，但对小动物温柔到骨子里，骑最凶的摩托，贴最萌的猫咪贴纸。',
    character: 'characters/cool-cat-lover.png',
    product: 'wahaha/products/450-ad-lacto.png',
    tags: ['金属猫猫党', '猫系少年', '冷脸暖芯', '社恐但温柔'],
    color: '#3B6FD4',
    light: '#E5EDFA'
  }
};

// ===== QUIZ LOGIC =====
function startQuiz() {
  quizAnswers = [];
  currentQ = 0;
  document.getElementById('quizStart').style.display = 'none';
  document.getElementById('quizQuestion').style.display = 'block';
  document.getElementById('quizResult').style.display = 'none';
  renderQuestion();
}

function renderQuestion() {
  const q = quizData[currentQ];
  const qNum = document.getElementById('qNum');
  const qText = document.getElementById('qText');
  const box = document.getElementById('qOptions');
  const progressFill = document.getElementById('quizProgressFill');

  // Fade out current content
  qText.style.opacity = '0';
  qText.style.transform = 'translateY(8px)';
  box.style.opacity = '0';
  box.style.transform = 'translateY(8px)';

  setTimeout(() => {
    qNum.textContent = `Q${currentQ + 1} / ${quizData.length}`;
    qText.textContent = q.question;
    progressFill.style.width = ((currentQ + 1) / quizData.length * 100) + '%';

    box.innerHTML = '';
    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'q-btn';
      btn.textContent = opt.text;
      btn.onclick = () => selectOption(idx);
      box.appendChild(btn);
    });

    // Fade in
    qText.style.opacity = '1';
    qText.style.transform = 'translateY(0)';
    box.style.opacity = '1';
    box.style.transform = 'translateY(0)';
  }, 180);
}

function selectOption(idx) {
  quizAnswers.push(quizData[currentQ].options[idx].scores);
  currentQ++;
  if (currentQ >= quizData.length) {
    showResult();
  } else {
    renderQuestion();
  }
}

function showResult() {
  document.getElementById('quizQuestion').style.display = 'none';
  document.getElementById('quizResult').style.display = 'block';

  const totals = { original: 0, strawberry: 0, peach: 0, collagen: 0, lacto: 0 };
  quizAnswers.forEach(scores => {
    for (let k in scores) totals[k] += scores[k];
  });

  let max = -1;
  let winner = 'original';
  for (let k in totals) {
    if (totals[k] > max) {
      max = totals[k];
      winner = k;
    }
  }

  const r = resultData[winner];

  // Inject personality colors as CSS custom properties
  const resultEl = document.getElementById('quizResult');
  resultEl.style.setProperty('--personality-color', r.color);
  resultEl.style.setProperty('--personality-light', r.light);

  document.getElementById('resultTitle').textContent = r.title;
  document.getElementById('resultTitle').style.color = r.color;
  document.getElementById('resultDesc').textContent = r.desc;
  document.getElementById('resultImg').src = r.character;

  const tagsBox = document.getElementById('resultTags');
  tagsBox.innerHTML = r.tags.map(t => `<span class="tag" style="border-color:${r.color}40;color:${r.color};">${t}</span>`).join('');

  const label = document.querySelector('.result-label');
  if (label) {
    label.style.background = r.light;
    label.style.color = r.color;
  }

  // Set hero visual background
  const visual = document.querySelector('.result-hero-visual');
  if (visual) {
    visual.style.background = r.light;
  }

  window._quizResult = { ...r, type: winner };

  // Staggered bounce-in animation
  const resultTitle = document.getElementById('resultTitle');
  const heroVisual = document.querySelector('.result-hero-visual');
  const resultDesc = document.getElementById('resultDesc');
  const resultActions = document.querySelector('.quiz-result .result-actions');

  [resultTitle, heroVisual, resultDesc, resultActions].forEach((el, i) => {
    if (!el) return;
    el.style.opacity = '0';
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = `resultBounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.1}s forwards`;
  });
}

function resetQuiz() {
  startQuiz();
}

// ===== POSTER GENERATION =====
function generatePoster() {
  const modal = document.getElementById('posterModal');
  modal.classList.add('show');

  const canvas = document.getElementById('posterCanvas');
  const ctx = canvas.getContext('2d');
  const r = window._quizResult || resultData.original;

  const topH = 130;
  const botH = 114;
  const imgTop = topH;
  const imgH = 1334 - topH - botH; // 1090px — the image area

  // Full background — personality theme color
  ctx.fillStyle = r.light;
  ctx.fillRect(0, 0, 750, 1334);

  // Character image — fills the middle area, no text on top
  const posterCharImg = document.getElementById('resultImg');
  if (posterCharImg && posterCharImg.complete && posterCharImg.naturalWidth > 0) {
    const iw = posterCharImg.naturalWidth;
    const ih = posterCharImg.naturalHeight;
    const scale = Math.max(750 / iw, imgH / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = 375 - dw / 2;
    const dy = imgTop + imgH / 2 - dh / 2;
    ctx.drawImage(posterCharImg, dx, dy, dw, dh);
  }

  // === Top bar — solid color strip above image ===
  ctx.fillStyle = r.color;
  ctx.fillRect(0, 0, 750, topH);

  ctx.fillStyle = r.light;
  ctx.globalAlpha = 0.9;
  ctx.font = '500 18px "DouyinMeiHao", serif';
  ctx.textAlign = 'left';
  ctx.fillText('AD钙奶 30周年', 32, 48);

  ctx.fillStyle = '#FFFFFF';
  ctx.globalAlpha = 1;
  ctx.font = '700 52px "DouyinMeiHao", serif';
  ctx.fillText(r.title, 32, 105);

  // Small dot between brand and name
  ctx.fillStyle = r.light;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.arc(720, 65, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // === Bottom bar — solid color strip below image ===
  ctx.fillStyle = r.color;
  ctx.fillRect(0, 1334 - botH, 750, botH);

  ctx.fillStyle = '#FFFFFF';
  ctx.globalAlpha = 0.95;
  ctx.font = '700 28px "DouyinMeiHao", serif';
  ctx.textAlign = 'center';
  ctx.fillText('陪你酸酸甜甜 · 懂你可可爱爱', 375, 1334 - botH + 42);

  ctx.fillStyle = r.light;
  ctx.globalAlpha = 0.8;
  ctx.font = '400 16px "DouyinMeiHao", serif';
  ctx.fillText('扫码测测你的AD钙奶人格', 375, 1334 - botH + 70);

  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '400 13px "DouyinMeiHao", serif';
  ctx.fillText('© 娃哈哈集团 | 大广赛参赛作品', 375, 1334 - botH + 92);
  ctx.globalAlpha = 1;
}

function drawStar(ctx, x, y, size, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    ctx.lineTo(
      x + Math.cos((18 + i * 72) * Math.PI / 180) * size,
      y - Math.sin((18 + i * 72) * Math.PI / 180) * size
    );
    ctx.lineTo(
      x + Math.cos((54 + i * 72) * Math.PI / 180) * (size / 2),
      y - Math.sin((54 + i * 72) * Math.PI / 180) * (size / 2)
    );
  }
  ctx.closePath();
  ctx.fill();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = text.split('');
  let line = '';
  let testLine = '';
  let lineArray = [];

  for (let n = 0; n < chars.length; n++) {
    testLine += chars[n];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      lineArray.push(line);
      line = chars[n];
      testLine = chars[n];
    } else {
      line = testLine;
    }
  }
  lineArray.push(line);
  lineArray.forEach((l, i) => {
    ctx.fillText(l, x, y + i * lineHeight);
  });
}

function closeModal() {
  document.getElementById('posterModal').classList.remove('show');
}

async function sharePoster() {
  const canvas = document.getElementById('posterCanvas');
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  const file = new File([blob], 'AD钙奶30周年-我的酸甜人格.png', { type: 'image/png' });

  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: 'AD钙奶30周年 | 我的酸甜人格',
        text: '我测出了我的AD钙奶人格，快来试试吧！陪你酸酸甜甜，懂你可可爱爱~',
        files: [file]
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        fallbackDownload(canvas);
      }
    }
  } else {
    fallbackDownload(canvas);
  }
}

function fallbackDownload(canvas) {
  const link = document.createElement('a');
  link.download = 'AD钙奶30周年-我的酸甜人格.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function savePoster() {
  scrollToSection(3);
  setTimeout(() => {
    if (document.getElementById('quizResult').style.display === 'none') {
      alert('请先完成人格测试，再生成纪念海报哦~');
      return;
    }
    generatePoster();
  }, 600);
}

function sharePage() {
  if (navigator.share) {
    navigator.share({
      title: 'AD钙奶30周年 | 我的酸甜人格',
      text: '我测出了我的AD钙奶人格，快来试试吧！陪你酸酸甜甜，懂你可可爱爱~',
      url: window.location.href
    });
  } else {
    alert('分享功能需要在手机浏览器或微信中打开哦~');
  }
}

// Prevent context menu for better app-like feel
document.addEventListener('contextmenu', e => e.preventDefault());
