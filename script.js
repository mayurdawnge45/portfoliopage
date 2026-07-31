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

// ---- contact form (validation + email delivery)
const MY_EMAIL = 'mayurdawnge45@gmail.com';
const form = document.getElementById('form');
const note = document.getElementById('note');

const setError = (input, msg) => {
  const wrap = input.closest('.field') || input.parentElement;
  input.classList.toggle('invalid', !!msg);
  let el = input.nextElementSibling;
  if (!el || !el.classList.contains('err')) {
    el = document.createElement('small');
    el.className = 'err';
    input.insertAdjacentElement('afterend', el);
  }
  el.textContent = msg || '';
  el.style.display = msg ? 'block' : 'none';
  return !msg;
};

const rules = {
  name: v => (!v.trim() ? 'Please enter your name' : v.trim().length < 2 ? 'Name is too short' : v.trim().length > 100 ? 'Name must be under 100 characters' : ''),
  email: v => (!v.trim() ? 'Please enter your email' : !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()) ? 'Enter a valid email address' : v.trim().length > 255 ? 'Email is too long' : ''),
  subject: v => (v.trim().length > 150 ? 'Subject must be under 150 characters' : ''),
  message: v => (!v.trim() ? 'Please write a short message' : v.trim().length < 10 ? 'Message must be at least 10 characters' : v.trim().length > 2000 ? 'Message must be under 2000 characters' : ''),
};

const fields = ['name', 'email', 'subject', 'message']
  .map(n => form.elements[n])
  .filter(Boolean);

fields.forEach(input => {
  input.addEventListener('blur', () => setError(input, rules[input.name](input.value)));
  input.addEventListener('input', () => { if (input.classList.contains('invalid')) setError(input, rules[input.name](input.value)); });
});

const openMailFallback = (name, email, subject, message) => {
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
  window.location.href = `mailto:${MY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${body}`;
};

form.addEventListener('submit', async e => {
  e.preventDefault();

  let ok = true;
  fields.forEach(input => { if (!setError(input, rules[input.name](input.value))) ok = false; });
  if (!ok) {
    note.className = 'note bad';
    note.textContent = 'Please fix the highlighted fields.';
    form.querySelector('.invalid')?.focus();
    return;
  }

  const name = form.elements.name.value.trim();
  const email = form.elements.email.value.trim();
  const subject = (form.elements.subject?.value || '').trim() || 'Project enquiry from portfolio';
  const message = form.elements.message.value.trim();

  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  note.className = 'note';
  note.textContent = 'Sending your message...';

  try {
    const res = await fetch(`https://formsubmit.co/ajax/${MY_EMAIL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ name, email, _subject: subject, message, _template: 'table', _captcha: 'false' }),
    });
    if (!res.ok) throw new Error('send failed');
    note.className = 'note good';
    note.textContent = 'Thanks! Your message has been sent — I\'ll reply within 24 hours.';
    form.reset();
  } catch (err) {
    note.className = 'note bad';
    note.textContent = 'Could not send directly — opening your email app instead...';
    openMailFallback(name, email, subject, message);
  } finally {
    btn.disabled = false;
  }
});
