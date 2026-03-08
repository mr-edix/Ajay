const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-menu a');

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
