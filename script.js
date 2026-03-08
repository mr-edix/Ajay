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

initStarBackground();
initTechSphere();

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

// Skill scroller
const skillTrack = document.getElementById('skill-track');
if (skillTrack) {
  const originalItems = Array.from(skillTrack.querySelectorAll('.skill-item'));
  const total = originalItems.length;
  const visible = 5;

  // Clone all items and append for seamless loop
  originalItems.forEach(item => {
    skillTrack.appendChild(item.cloneNode(true));
  });

  const allItems = skillTrack.querySelectorAll('.skill-item');
  let currentIndex = 0;

  const itemH = 54;
  const setupSizes = () => {
    const scroller = skillTrack.parentElement;
    allItems.forEach(item => { item.style.height = itemH + 'px'; });
  };

  setupSizes();
  window.addEventListener('resize', () => { setupSizes(); applyState(); });

  const applyState = () => {
    skillTrack.style.transform = `translateY(-${currentIndex * itemH}px)`;
    const centerIndex = currentIndex + 2;
    allItems.forEach((item, i) => {
      item.classList.toggle('active', i >= currentIndex && i < currentIndex + visible);
      item.classList.toggle('center', i === centerIndex);
    });
  };

  applyState();

  setInterval(() => {
    currentIndex++;
    skillTrack.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    applyState();

    // When we've scrolled past original set, silently reset
    if (currentIndex >= total) {
      setTimeout(() => {
        skillTrack.style.transition = 'none';
        currentIndex = 0;
        applyState();
      }, 520);
    }
  }, 1000);
}

const interactiveGroups = document.querySelectorAll('.interactive-group');

interactiveGroups.forEach((group) => {
  const items = group.querySelectorAll('.interactive-item');

  items.forEach((item) => {
    item.addEventListener('mouseenter', () => {
      group.classList.add('has-hover');
      items.forEach((target) => target.classList.remove('is-focus'));
      item.classList.add('is-focus');
    });

    item.addEventListener('mouseleave', () => {
      item.classList.remove('is-focus');
      group.classList.remove('has-hover');
    });

    item.addEventListener('focusin', () => {
      group.classList.add('has-hover');
      items.forEach((target) => target.classList.remove('is-focus'));
      item.classList.add('is-focus');
    });

    item.addEventListener('focusout', () => {
      group.classList.remove('has-hover');
      item.classList.remove('is-focus');
    });
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
    { threshold: 0.12 }
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
