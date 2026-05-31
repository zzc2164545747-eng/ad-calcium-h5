// ===== S1 3D星轨层 — 裸眼3D波普星环 =====
(function() {
  var container = document.getElementById('hero3DCanvas');
  if (!container) return;

  try {

  // ---- SCENE ----
  var scene = new THREE.Scene();

  // Stronger perspective for depth
  var camera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 0.1, 25);
  camera.position.set(0, 0.2, 4.5);
  camera.lookAt(0, 0.15, 0);

  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // ---- DEEP BACKGROUND STARS (small, distant) ----
  var deepCount = 500;
  var deepGeo = new THREE.BufferGeometry();
  var deepPos = new Float32Array(deepCount * 3);
  for (var i = 0; i < deepCount; i++) {
    deepPos[i * 3] = (Math.random() - 0.5) * 12;
    deepPos[i * 3 + 1] = (Math.random() - 0.5) * 12;
    deepPos[i * 3 + 2] = -3 - Math.random() * 6;
  }
  deepGeo.setAttribute('position', new THREE.BufferAttribute(deepPos, 3));
  var deepMat = new THREE.PointsMaterial({
    size: 0.012,
    color: 0xffffff,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  var deepStars = new THREE.Points(deepGeo, deepMat);
  scene.add(deepStars);

  // ---- MIDGROUND COLOR STARS ----
  var midCount = 200;
  var midGeo = new THREE.BufferGeometry();
  var midPositions = new Float32Array(midCount * 3);
  var midColors = new Float32Array(midCount * 3);
  var popColors = [
    [1.0, 0.88, 0.2],  // Yellow
    [1.0, 1.0, 1.0],   // White
    [1.0, 0.42, 0.62], // Pink
    [0.12, 0.83, 0.37],// Green
    [0.22, 0.82, 0.96],// Cyan
  ];
  for (var i = 0; i < midCount; i++) {
    midPositions[i * 3] = (Math.random() - 0.5) * 9;
    midPositions[i * 3 + 1] = (Math.random() - 0.5) * 9;
    midPositions[i * 3 + 2] = -2 - Math.random() * 5;
    var c = popColors[Math.floor(Math.random() * 5)];
    midColors[i * 3] = c[0];
    midColors[i * 3 + 1] = c[1];
    midColors[i * 3 + 2] = c[2];
  }
  midGeo.setAttribute('position', new THREE.BufferAttribute(midPositions, 3));
  midGeo.setAttribute('color', new THREE.BufferAttribute(midColors, 3));
  var midMat = new THREE.PointsMaterial({
    size: 0.025,
    vertexColors: true,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  var midStars = new THREE.Points(midGeo, midMat);
  scene.add(midStars);

  // ---- FOREGROUND LARGE STARS (depth anchors) ----
  var fgCount = 30;
  var fgStars = [];
  for (var i = 0; i < fgCount; i++) {
    var fgSize = 0.03 + Math.random() * 0.06;
    var fgGeo = new THREE.SphereGeometry(fgSize, 6, 6);
    var fgColor = popColors[Math.floor(Math.random() * 5)];
    var fgMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(fgColor[0], fgColor[1], fgColor[2]),
      transparent: true,
      opacity: 0.6 + Math.random() * 0.4,
    });
    var fgStar = new THREE.Mesh(fgGeo, fgMat);
    fgStar.position.set(
      (Math.random() - 0.5) * 7,
      (Math.random() - 0.5) * 7,
      1 + Math.random() * 3
    );
    fgStar.userData = {
      speed: 0.3 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
      baseY: fgStar.position.y,
      baseX: fgStar.position.x,
      amplitude: 0.15 + Math.random() * 0.4,
    };
    fgStars.push(fgStar);
    scene.add(fgStar);
  }

  // ---- 30 ORBITING STARS (30周年) ----
  var orbitStars = [];
  var orbitGroup = new THREE.Group();
  var starColors = [0xFFE135, 0xFFFFFF, 0xFF6B9D, 0x1ed45e, 0xFFE135];

  for (var i = 0; i < 30; i++) {
    var color = starColors[i % 5];
    var size = (i % 5 === 0) ? 0.06 : 0.032;

    var starGeo = new THREE.SphereGeometry(size, 8, 8);
    var starMat = new THREE.MeshBasicMaterial({ color: color });
    var star = new THREE.Mesh(starGeo, starMat);

    var goldenRatio = (1 + Math.sqrt(5)) / 2;
    var idx = i + 1;
    var phi = Math.acos(1 - 2 * idx / 31);
    var theta = 2 * Math.PI * idx / goldenRatio;
    var radius = 2.2 + (i % 3) * 0.6;

    star.userData = {
      baseRadius: radius,
      phi: phi,
      theta: theta,
      speed: 0.1 + Math.random() * 0.18,
      phase: Math.random() * Math.PI * 2,
    };

    star.position.set(
      Math.cos(theta) * Math.sin(phi) * radius,
      Math.cos(phi) * radius + 0.25,
      Math.sin(theta) * Math.sin(phi) * radius
    );

    orbitStars.push(star);
    orbitGroup.add(star);
  }
  scene.add(orbitGroup);

  // ---- GLOW RINGS (5 rings for richer depth) ----
  function createGlowRing(radius, y, rotX, rotY, color, opacity, thickness) {
    var ringGeo = new THREE.TorusGeometry(radius, thickness || 0.008, 8, 80);
    var ringMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: opacity || 0.7 });
    var ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = rotX;
    if (rotY) ring.rotation.y = rotY;
    ring.position.y = y;
    ring.userData = { baseRadius: radius };
    return ring;
  }

  var ring1 = createGlowRing(1.05, 0.05, Math.PI * 0.48, 0, 0xFFE135, 0.8, 0.01);
  var ring2 = createGlowRing(1.4, -0.1, Math.PI * 0.38, 0.15, 0x1ed45e, 0.65, 0.007);
  var ring3 = createGlowRing(1.25, 0.3, Math.PI * 0.55, -0.1, 0xFF6B9D, 0.7, 0.009);
  var ring4 = createGlowRing(1.55, -0.25, Math.PI * 0.3, 0.2, 0xffffff, 0.45, 0.006);
  var ring5 = createGlowRing(1.7, 0.15, Math.PI * 0.42, -0.2, 0x00ddff, 0.55, 0.006);
  scene.add(ring1);
  scene.add(ring2);
  scene.add(ring3);
  scene.add(ring4);
  scene.add(ring5);

  // ---- ANIMATION ----
  var clock = new THREE.Clock();
  var isVisible = true;

  function animate() {
    requestAnimationFrame(animate);

    var dt = Math.min(clock.getDelta(), 0.1);
    var t = performance.now() * 0.001;

    // Orbit group
    orbitGroup.rotation.y += dt * 0.13;
    orbitGroup.rotation.x += dt * 0.04;

    // Background layers drift at different speeds (parallax depth)
    deepStars.rotation.y += dt * 0.01;
    deepStars.rotation.z += dt * 0.004;
    midStars.rotation.y += dt * 0.025;
    midStars.rotation.z += dt * 0.01;

    // Foreground stars float
    for (var i = 0; i < fgStars.length; i++) {
      var fs = fgStars[i];
      fs.position.x = fs.userData.baseX + Math.sin(t * fs.userData.speed + fs.userData.phase) * fs.userData.amplitude;
      fs.position.y = fs.userData.baseY + Math.cos(t * fs.userData.speed * 0.7 + fs.userData.phase) * fs.userData.amplitude;
    }

    // Orbit star pulse
    for (var i = 0; i < orbitStars.length; i++) {
      var star = orbitStars[i];
      var s = 1 + Math.sin(t * 2.5 + star.userData.phase) * 0.45;
      star.scale.setScalar(s);
    }

    // Ring pulses (each ring different phase)
    ring1.scale.setScalar(1 + Math.sin(t * 1.3) * 0.07);
    ring2.scale.setScalar(1 + Math.sin(t * 1.3 + 1.2) * 0.07);
    ring3.scale.setScalar(1 + Math.sin(t * 1.7 + 2.4) * 0.06);
    ring4.scale.setScalar(1 + Math.sin(t * 1.5 + 3.6) * 0.05);
    ring5.scale.setScalar(1 + Math.sin(t * 1.6 + 4.8) * 0.06);

    if (isVisible) {
      renderer.render(scene, camera);
    }
  }

  // ---- VISIBILITY ----
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      isVisible = entry.isIntersecting;
    });
  }, { threshold: 0.1 });
  observer.observe(container);

  // ---- RESIZE ----
  function onResize() {
    var w = container.clientWidth;
    var h = container.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

  // ---- START ----
  animate();

  window.Hero3D = { orbitGroup: orbitGroup, scene: scene, camera: camera, renderer: renderer };

  } catch (err) {
    console.error('Hero3D init failed:', err);
    container.style.display = 'none';
  }
})();
