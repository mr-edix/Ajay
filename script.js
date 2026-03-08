const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-menu a');

const initStarBackground = () => {
  const canvas = document.getElementById('earth-canvas');
  if (!canvas || typeof window.THREE === 'undefined') {
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 14;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });

  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.zIndex = '0';
  canvas.style.pointerEvents = 'none';

  const maxPixelRatio = window.innerWidth < 700 ? 1.2 : 1.5;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPixelRatio));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  // Stars
  const starCount = 1800;
  const starPositions = new Float32Array(starCount * 3);
  const starSizes = new Float32Array(starCount);
  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    starPositions[i3] = (Math.random() - 0.5) * 300;
    starPositions[i3 + 1] = (Math.random() - 0.5) * 300;
    starPositions[i3 + 2] = -Math.random() * 250;
    starSizes[i] = Math.random() * 1.5 + 0.5;
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    sizeAttenuation: true,
    size: 0.4,
    transparent: true,
    opacity: 0.85,
  });
  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

  const onScroll = () => {
    const scrollY = window.scrollY;
    // Parallax: shift stars on scroll
    stars.position.y = scrollY * 0.05;
    stars.position.x = scrollY * 0.01;
    stars.rotation.x = scrollY * 0.00008;
  };

  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    const nextPixelRatio = window.innerWidth < 700 ? 1.2 : 1.4;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, nextPixelRatio));
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);

  let rafId = 0;

  const animate = () => {
    rafId = window.requestAnimationFrame(animate);
    stars.rotation.y += 0.00008;
    stars.rotation.x += 0.00003;
    renderer.render(scene, camera);
  };

  onResize();
  animate();

  window.addEventListener('beforeunload', () => {
    window.cancelAnimationFrame(rafId);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    starGeometry.dispose();
    starMaterial.dispose();
    renderer.dispose();
  });
};

// Animated wireframe sphere
const initTechSphere = () => {
  const canvas = document.getElementById('sphere-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let w, h, dpr;

  const resize = () => {
    const rect = canvas.parentElement.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width;
    h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  resize();
  window.addEventListener('resize', resize);

  const points = [];
  const rings = 14;
  const perRing = 20;
  const radius = Math.min(w, h) * 0.38;

  for (let i = 0; i < rings; i++) {
    const phi = (Math.PI * (i + 1)) / (rings + 1);
    for (let j = 0; j < perRing; j++) {
      const theta = (2 * Math.PI * j) / perRing;
      points.push({ phi, theta });
    }
  }

  // Floating particles
  const particles = [];
  for (let i = 0; i < 40; i++) {
    particles.push({
      phi: Math.random() * Math.PI,
      theta: Math.random() * Math.PI * 2,
      r: radius * (1.1 + Math.random() * 0.4),
      speed: 0.002 + Math.random() * 0.004,
      size: 1 + Math.random() * 1.5,
      alpha: 0.3 + Math.random() * 0.5,
    });
  }

  let angleY = 0;
  let angleX = 0.3;
  let scrollBoost = 0;

  window.addEventListener('scroll', () => {
    scrollBoost = window.scrollY * 0.00003;
  }, { passive: true });

  const project = (phi, theta, r) => {
    const sp = Math.sin(phi), cp = Math.cos(phi);
    const st = Math.sin(theta + angleY), ct = Math.cos(theta + angleY);
    let x = r * sp * ct;
    let y = r * cp;
    let z = r * sp * st;
    // X-axis rotation
    const y2 = y * Math.cos(angleX) - z * Math.sin(angleX);
    const z2 = y * Math.sin(angleX) + z * Math.cos(angleX);
    return { x: x + w / 2, y: y2 + h / 2, z: z2 };
  };

  const animate = () => {
    requestAnimationFrame(animate);
    const r = Math.min(w, h) * 0.38;

    ctx.clearRect(0, 0, w, h);
    angleY += 0.005 + scrollBoost;
    scrollBoost *= 0.95;

    // Draw wireframe rings
    ctx.strokeStyle = 'rgba(143, 183, 255, 0.12)';
    ctx.lineWidth = 0.8;

    // Latitude lines
    for (let i = 0; i < rings; i++) {
      const phi = (Math.PI * (i + 1)) / (rings + 1);
      ctx.beginPath();
      for (let j = 0; j <= perRing; j++) {
        const theta = (2 * Math.PI * j) / perRing;
        const p = project(phi, theta, r);
        if (j === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }

    // Longitude lines
    for (let j = 0; j < perRing; j++) {
      const theta = (2 * Math.PI * j) / perRing;
      ctx.beginPath();
      for (let i = 0; i <= rings + 1; i++) {
        const phi = (Math.PI * i) / (rings + 1);
        const p = project(phi, theta, r);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }

    // Draw dots at intersections
    for (const pt of points) {
      const p = project(pt.phi, pt.theta, r);
      const depth = (p.z + r) / (2 * r);
      const alpha = 0.15 + depth * 0.5;
      const size = 1 + depth * 1.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(143, 183, 255, ${alpha})`;
      ctx.fill();
    }

    // Draw floating particles
    for (const pt of particles) {
      pt.theta += pt.speed;
      const p = project(pt.phi, pt.theta, pt.r);
      ctx.beginPath();
      ctx.arc(p.x, p.y, pt.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(143, 183, 255, ${pt.alpha * 0.6})`;
      ctx.fill();
    }

    // Center glow
    const glow = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, r * 1.2);
    glow.addColorStop(0, 'rgba(143, 183, 255, 0.06)');
    glow.addColorStop(0.5, 'rgba(143, 183, 255, 0.02)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
  };

  animate();
};

// === Skills 3D Tree ===
const initSkillsTree = () => {
  const container = document.querySelector('.skills-3d-container');
  const canvas = document.getElementById('skills-canvas');
  const tooltipEl = document.getElementById('skill-tooltip');
  if (!canvas || !container || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const cw = container.clientWidth;
  const ch = container.clientHeight;
  const camera = new THREE.PerspectiveCamera(50, cw / ch, 0.1, 1000);
  camera.position.set(0, 0, 22);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(cw, ch);
  renderer.setClearColor(0x000000, 0);

  const treeGroup = new THREE.Group();
  scene.add(treeGroup);

  // Helper: cylinder between two 3D points
  const makeBranch = (from, to, rTop, rBot, material) => {
    const dir = new THREE.Vector3().subVectors(to, from);
    const len = dir.length();
    if (len < 0.001) return null;
    const geo = new THREE.CylinderGeometry(rTop, rBot, len, 8);
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.lerpVectors(from, to, 0.5);
    const up = new THREE.Vector3(0, 1, 0);
    mesh.quaternion.setFromUnitVectors(up, dir.clone().normalize());
    return mesh;
  };

  // --- Trunk ---
  const trunkFrom = new THREE.Vector3(0, -5, 0);
  const trunkTo = new THREE.Vector3(0, 6.5, 0);
  const trunkMat = new THREE.MeshBasicMaterial({ color: 0x4a7adb });
  treeGroup.add(makeBranch(trunkFrom, trunkTo, 0.1, 0.22, trunkMat));

  // Trunk glow
  const trunkGlowMat = new THREE.MeshBasicMaterial({ color: 0x8fb7ff, transparent: true, opacity: 0.06 });
  treeGroup.add(makeBranch(trunkFrom, trunkTo, 0.3, 0.5, trunkGlowMat));

  // Crown glow
  const crownMat = new THREE.MeshBasicMaterial({ color: 0x8fb7ff, transparent: true, opacity: 0.25 });
  const crown = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), crownMat);
  crown.position.set(0, 6.8, 0);
  treeGroup.add(crown);
  const crownOuter = new THREE.Mesh(
    new THREE.SphereGeometry(1.0, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0x8fb7ff, transparent: true, opacity: 0.05 })
  );
  crownOuter.position.set(0, 6.8, 0);
  treeGroup.add(crownOuter);

  // Root tendrils
  const rootMat = new THREE.MeshBasicMaterial({ color: 0x2a4a8a });
  const rootGlowMat = new THREE.MeshBasicMaterial({ color: 0x8fb7ff, transparent: true, opacity: 0.04 });
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.3;
    const end = new THREE.Vector3(Math.cos(a) * 2, -6.5, Math.sin(a) * 2);
    const r1 = makeBranch(trunkFrom, end, 0.03, 0.08, rootMat);
    const r2 = makeBranch(trunkFrom, end, 0.08, 0.15, rootGlowMat);
    if (r1) treeGroup.add(r1);
    if (r2) treeGroup.add(r2);
  }

  // Junction rings at branch levels
  const levelYs = [-3.5, -1, 1.5, 3.5, 5.5];
  const junctionRings = [];
  levelYs.forEach(y => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.28, 0.04, 8, 24),
      new THREE.MeshBasicMaterial({ color: 0x8fb7ff, transparent: true, opacity: 0.35 })
    );
    ring.position.set(0, y, 0);
    ring.rotation.x = Math.PI / 2;
    treeGroup.add(ring);
    junctionRings.push(ring);
  });

  // --- Skills data ---
  const skills = [
    { name: 'JavaScript', color: 0xf7df1e, level: 0, slot: 0 },
    { name: 'HTML', color: 0xe34c26, level: 0, slot: 1 },
    { name: 'CSS', color: 0x264de4, level: 0, slot: 2 },
    { name: 'Node.js', color: 0x68a063, level: 1, slot: 0 },
    { name: 'React.js', color: 0x61dafb, level: 1, slot: 1 },
    { name: 'Express.js', color: 0x999999, level: 1, slot: 2 },
    { name: 'MongoDB', color: 0x47a248, level: 2, slot: 0 },
    { name: 'MySQL', color: 0x4479a1, level: 2, slot: 1 },
    { name: 'Selenium WebDriver', color: 0x43b02a, level: 2, slot: 2 },
    { name: 'AWS', color: 0xff9900, level: 3, slot: 0 },
    { name: 'Git', color: 0xf05032, level: 3, slot: 1 },
    { name: 'GitHub', color: 0xc9d1d9, level: 3, slot: 2 },
    { name: 'CI/CD', color: 0x2088ff, level: 4, slot: 0 },
    { name: 'Grafana', color: 0xf46800, level: 4, slot: 1 },
    { name: 'New Relic', color: 0x1ce783, level: 4, slot: 2 },
  ];

  const branchLens = [5, 4.5, 4, 3.5, 3];
  const angleOffsets = [0, 40, 80, 20, 60];
  const upSlopes = [0.3, 0.5, 0.7, 1.0, 1.4];
  const branchMat = new THREE.MeshBasicMaterial({ color: 0x3a6bc5 });
  const branchGlowMat = new THREE.MeshBasicMaterial({ color: 0x8fb7ff, transparent: true, opacity: 0.05 });

  // Label creator
  const makeLabel = (text) => {
    const c = document.createElement('canvas');
    const cx = c.getContext('2d');
    c.width = 512; c.height = 80;
    cx.font = '700 34px Inter, system-ui, sans-serif';
    cx.textAlign = 'center';
    cx.textBaseline = 'middle';
    cx.fillStyle = '#ffffff';
    cx.fillText(text, 256, 40);
    const tex = new THREE.CanvasTexture(c);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.9 }));
    sp.scale.set(3.2, 0.65, 1);
    return sp;
  };

  const nodes = [];
  const targets = [];

  skills.forEach(sk => {
    const y = levelYs[sk.level];
    const bLen = branchLens[sk.level];
    const angle = (sk.slot * 120 + angleOffsets[sk.level]) * Math.PI / 180;
    const up = upSlopes[sk.level];

    const startPt = new THREE.Vector3(0, y, 0);
    const endPt = new THREE.Vector3(Math.cos(angle) * bLen, y + up, Math.sin(angle) * bLen);

    // Branch solid + glow
    const b1 = makeBranch(startPt, endPt, 0.04, 0.07, branchMat);
    const b2 = makeBranch(startPt, endPt, 0.1, 0.16, branchGlowMat);
    if (b1) treeGroup.add(b1);
    if (b2) treeGroup.add(b2);

    // Skill node
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 20, 20),
      new THREE.MeshBasicMaterial({ color: sk.color })
    );
    mesh.position.copy(endPt);

    // Glow shell
    const glowMat = new THREE.MeshBasicMaterial({ color: sk.color, transparent: true, opacity: 0.12 });
    mesh.add(new THREE.Mesh(new THREE.SphereGeometry(0.65, 12, 12), glowMat));

    // Label
    const label = makeLabel(sk.name);
    label.position.set(0, -0.9, 0);
    mesh.add(label);

    treeGroup.add(mesh);
    targets.push(mesh);
    nodes.push({ mesh, glowMat, name: sk.name, color: sk.color, baseY: endPt.y });
  });

  // --- Floating particles ---
  const pCount = 50;
  const pPos = new Float32Array(pCount * 3);
  const pSpeeds = [];
  for (let i = 0; i < pCount; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 0.5 + Math.random() * 5.5;
    pPos[i * 3] = Math.cos(a) * r;
    pPos[i * 3 + 1] = -5 + Math.random() * 12;
    pPos[i * 3 + 2] = Math.sin(a) * r;
    pSpeeds.push(0.003 + Math.random() * 0.008);
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0x8fb7ff, size: 0.06, transparent: true, opacity: 0.4, sizeAttenuation: true });
  treeGroup.add(new THREE.Points(pGeo, pMat));

  // --- Energy pulse up trunk ---
  const pulseMat = new THREE.MeshBasicMaterial({ color: 0x8fb7ff, transparent: true, opacity: 0.6 });
  const pulse = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), pulseMat);
  pulse.position.set(0, -5, 0);
  treeGroup.add(pulse);

  // --- Raycaster for hover ---
  const raycaster = new THREE.Raycaster();
  const mVec = new THREE.Vector2(-999, -999);
  let hovered = -1;

  const resetGlows = () => {
    nodes.forEach(n => { n.glowMat.opacity = 0.12; n.mesh.scale.setScalar(1); });
  };

  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    mVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    tooltipEl.style.left = (e.clientX - rect.left + 14) + 'px';
    tooltipEl.style.top = (e.clientY - rect.top - 32) + 'px';
  });

  container.addEventListener('mouseleave', () => {
    mVec.set(-999, -999);
    hovered = -1;
    tooltipEl.classList.remove('visible');
    resetGlows();
  });

  // Click-to-rotate boost
  let rotBoost = 0;
  container.addEventListener('click', () => { rotBoost += 0.04; });

  // --- Animation loop ---
  let t = 0;
  const animate = () => {
    requestAnimationFrame(animate);
    t += 0.008;

    // Slow auto-rotation + click boost
    treeGroup.rotation.y += 0.002 + rotBoost;
    rotBoost *= 0.985;

    // Subtle float
    treeGroup.position.y = Math.sin(t * 0.6) * 0.12;

    // Crown pulse
    crownMat.opacity = 0.2 + Math.sin(t * 2) * 0.08;
    crown.scale.setScalar(1 + Math.sin(t * 1.5) * 0.08);

    // Energy pulse traveling up trunk
    pulse.position.y = -5 + ((t * 0.8) % 1) * 11.5;
    pulseMat.opacity = 0.4 + Math.sin(t * 6) * 0.2;

    // Junction ring pulse
    junctionRings.forEach((r, i) => {
      r.material.opacity = 0.25 + Math.sin(t * 2 + i * 1.2) * 0.12;
    });

    // Particle drift upward
    const pArr = pGeo.attributes.position.array;
    for (let i = 0; i < pCount; i++) {
      pArr[i * 3 + 1] += pSpeeds[i];
      if (pArr[i * 3 + 1] > 7.5) pArr[i * 3 + 1] = -5;
    }
    pGeo.attributes.position.needsUpdate = true;

    // Node breathing glow
    nodes.forEach((n, i) => {
      if (i !== hovered) {
        n.glowMat.opacity = 0.1 + Math.sin(t * 1.5 + i * 0.7) * 0.04;
      }
    });

    // Hover detection
    raycaster.setFromCamera(mVec, camera);
    const hits = raycaster.intersectObjects(targets);
    if (hits.length > 0) {
      const idx = targets.indexOf(hits[0].object);
      if (idx !== -1 && idx !== hovered) {
        resetGlows();
        hovered = idx;
        nodes[idx].glowMat.opacity = 0.5;
        nodes[idx].mesh.scale.setScalar(1.4);
        tooltipEl.textContent = nodes[idx].name;
        tooltipEl.classList.add('visible');
        tooltipEl.style.borderColor = '#' + new THREE.Color(nodes[idx].color).getHexString();
      }
    } else if (hovered !== -1) {
      hovered = -1;
      resetGlows();
      tooltipEl.classList.remove('visible');
    }

    renderer.render(scene, camera);
  };

  animate();

  // Resize
  window.addEventListener('resize', () => {
    const nw = container.clientWidth;
    const nh = container.clientHeight;
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
    renderer.setSize(nw, nh);
  });
};

initStarBackground();
initTechSphere();
initSkillsTree();

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    navMenu?.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
  });
});

const sections = [...document.querySelectorAll('main section[id]')];
const navLinkMap = [...navLinks].map((link) => ({
  link,
  targetId: link.getAttribute('href')?.replace('#', ''),
}));

const highlightActiveLink = () => {
  const offset = 120;
  const currentSection = sections.find((section) => {
    const top = section.offsetTop - offset;
    const bottom = top + section.offsetHeight;
    return window.scrollY >= top && window.scrollY < bottom;
  });

  navLinkMap.forEach(({ link, targetId }) => {
    const isActive = currentSection?.id === targetId;
    link.classList.toggle('active', Boolean(isActive));
  });
};

window.addEventListener('scroll', highlightActiveLink, { passive: true });
highlightActiveLink();

const rotatingTitle = document.getElementById('hero-rotating-title');
const rotatingTitles = [
  'Full-Stack Engineer with SRE Capabilities',
  'AI-Focused Full-Stack Engineer',
  'Backend & Reliability Engineer',
];

if (rotatingTitle && rotatingTitles.length > 1) {
  let titleIndex = 0;

  setInterval(() => {
    rotatingTitle.classList.add('swap');

    setTimeout(() => {
      titleIndex = (titleIndex + 1) % rotatingTitles.length;
      rotatingTitle.textContent = rotatingTitles[titleIndex];
      rotatingTitle.classList.remove('swap');
    }, 280);
  }, 2600);
}

// 3D Mouse-tracking card tilt effect
const canHover = window.matchMedia('(hover: hover)').matches;
if (canHover) {
  const tiltCards = document.querySelectorAll('.skill-card, .exp-card, .edu-card, .cert-card, .summary-card, .contact-info-card, .contact-form-card');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(12px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateZ(0)';
      card.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1), box-shadow 0.45s cubic-bezier(0.23,1,0.32,1), border-color 0.35s ease';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'box-shadow 0.45s cubic-bezier(0.23,1,0.32,1), border-color 0.35s ease';
    });
  });
}

// Animated counter for stat numbers
const animateCounters = () => {
  const stats = document.querySelectorAll('.stat-number');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const text = el.textContent;
        const match = text.match(/(\d+)/);
        if (match) {
          const target = parseInt(match[1], 10);
          const suffix = text.replace(match[1], '');
          const duration = 1200;
          const startTime = performance.now();

          const step = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target) + suffix;
            if (progress < 1) requestAnimationFrame(step);
          };

          requestAnimationFrame(step);
        }
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  stats.forEach(stat => counterObserver.observe(stat));
};

animateCounters();

// Stagger reveal animations for cards within grids
const staggerContainers = document.querySelectorAll('.skills-grid, .exp-timeline, .edu-grid, .cert-grid');
staggerContainers.forEach(container => {
  const items = container.querySelectorAll('.reveal');
  items.forEach((item, i) => {
    item.style.transitionDelay = `${i * 80}ms`;
  });
});

const revealElements = document.querySelectorAll('.reveal');
const supportsIntersectionObserver = 'IntersectionObserver' in window;

if (supportsIntersectionObserver) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  revealElements.forEach((el) => revealObserver.observe(el));
} else {
  revealElements.forEach((el) => el.classList.add('visible'));
}

const contactForm = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');

if (contactForm && formMessage) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const message = String(formData.get('message') || '').trim();

    if (!name || !email || !message) {
      formMessage.textContent = 'Please fill in all required fields.';
      formMessage.className = 'form-message error';
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      formMessage.textContent = 'Please enter a valid email address.';
      formMessage.className = 'form-message error';
      return;
    }

    formMessage.textContent = 'Thanks for your message! I will get back to you soon.';
    formMessage.className = 'form-message success';
    contactForm.reset();
  });
}
