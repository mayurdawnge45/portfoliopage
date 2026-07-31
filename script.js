// ---- year
document.getElementById('yr').textContent = new Date().getFullYear();

// ---- nav scroll state + mobile menu
const nav = document.getElementById('nav');
const links = document.getElementById('links');
const burger = document.getElementById('burger');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 30);
});
burger.addEventListener('click', () => {
  links.classList.toggle('show');
  burger.classList.toggle('open');
});
links.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => {
    links.classList.remove('show');
    burger.classList.remove('open');
  })
);

// ---- active link on scroll
const sections = [...document.querySelectorAll('section[id]')];
const navLinks = [...links.querySelectorAll('a')];
const setActive = () => {
  const y = window.scrollY + 140;
  let cur = sections[0]?.id;
  sections.forEach(s => { if (s.offsetTop <= y) cur = s.id; });
  navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
};
window.addEventListener('scroll', setActive);
setActive();

// ---- reveal on scroll
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = (i % 6) * 70 + 'ms';
  io.observe(el);
});

// ---- skill bars
const bio = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); bio.unobserve(e.target); } });
}, { threshold: 0.4 });
document.querySelectorAll('.skill').forEach(el => bio.observe(el));

// ---- counters
const counters = document.querySelectorAll('.count');
const cio = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = +el.dataset.target;
    const suffix = el.dataset.suffix || '';
    const dur = 1400;
    const start = performance.now();
    const step = now => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    cio.unobserve(el);
  });
}, { threshold: 0.6 });
counters.forEach(c => cio.observe(c));

// ---- cursor glow (desktop only)
const glow = document.getElementById('glow');
if (window.matchMedia('(pointer:fine)').matches) {
  window.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
} else {
  glow.style.display = 'none';
}

// ---- hero card tilt
const tilt = document.getElementById('tilt');
if (tilt && window.matchMedia('(pointer:fine)').matches) {
  const wrap = tilt.parentElement;
  wrap.addEventListener('mousemove', e => {
    const r = wrap.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    tilt.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
  });
  wrap.addEventListener('mouseleave', () => { tilt.style.transform = ''; });
}

// ---- service card spotlight
document.querySelectorAll('.svc').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', e.clientX - r.left + 'px');
    card.style.setProperty('--my', e.clientY - r.top + 'px');
  });
});

// ---- project filters
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const f = chip.dataset.filter;
    document.querySelectorAll('.proj').forEach(p => {
      const show = f === 'all' || p.dataset.cat === f;
      p.classList.toggle('hide', !show);
      if (show) { p.classList.remove('in'); void p.offsetWidth; p.classList.add('in'); }
    });
  });
});

// ---- contact form (front-end only)
const form = document.getElementById('form');
const note = document.getElementById('note');
form.addEventListener('submit', e => {
  e.preventDefault();
  const data = new FormData(form);
  const body = encodeURIComponent(
    `Name: ${data.get('name')}\nEmail: ${data.get('email')}\n\n${data.get('message')}`
  );
  const subject = encodeURIComponent(data.get('subject') || 'Project enquiry from portfolio');
  note.textContent = 'Opening your email app...';
  window.location.href = `mailto:mayur@example.com?subject=${subject}&body=${body}`;
  setTimeout(() => { note.textContent = 'Thanks! Your message is ready to send.'; form.reset(); }, 800);
});
