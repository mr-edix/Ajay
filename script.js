const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-menu a');

const initEarthBackground = () => {
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

  const textureLoader = new THREE.TextureLoader();
  const earthGeometry = new THREE.SphereGeometry(8, 64, 64);
  const earthTexture = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-night.jpg');
  const earthMaterial = new THREE.MeshStandardMaterial({
    map: earthTexture,
    roughness: 0.7,
    metalness: 0.1,
    emissiveMap: earthTexture,
    emissive: new THREE.Color(0x112244),
    emissiveIntensity: 0.4,
    transparent: false,
  });

  const earth = new THREE.Mesh(earthGeometry, earthMaterial);
  earth.position.x = 6;
  earth.position.y = -0.5;
  earth.position.z = -6;
  scene.add(earth);

  const ambientLight = new THREE.AmbientLight(0x334466, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0x6688cc, 1.2);
  directionalLight.position.set(12, 8, 10);
  scene.add(directionalLight);

  const rimLight = new THREE.DirectionalLight(0x223355, 0.6);
  rimLight.position.set(-10, -4, -8);
  scene.add(rimLight);

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

  let scrollRotation = 0;

  const onScroll = () => {
    const scrollY = window.scrollY;
    earth.rotation.y += scrollY * 0.0003;
    scrollRotation = Math.min(scrollY * 0.000005, 0.004);

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

    const compact = window.innerWidth < 760;
    earth.scale.setScalar(compact ? 0.75 : 1);
    earth.position.x = compact ? 4.5 : 6;
    earth.position.y = compact ? -0.2 : -0.5;
    earth.position.z = compact ? -7 : -5;
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);

  let rafId = 0;

  const animate = () => {
    rafId = window.requestAnimationFrame(animate);

    earth.rotation.y += 0.001 + scrollRotation;
    scrollRotation *= 0.92;

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
    earthGeometry.dispose();
    earthMaterial.dispose();
    starGeometry.dispose();
    starMaterial.dispose();
    renderer.dispose();
  });
};

initEarthBackground();

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
