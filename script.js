// ===== Cursor glow =====
const glow = document.getElementById('cursorGlow');
window.addEventListener('mousemove', (e) => {
  glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
});

// ===== Mobile nav =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// ===== Floating icon parallax (mouse-driven) =====
const icons = document.querySelectorAll('.ficon');
window.addEventListener('mousemove', (e) => {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const dx = (e.clientX - cx);
  const dy = (e.clientY - cy);
  icons.forEach(icon => {
    const depth = parseFloat(icon.dataset.depth) || 0.03;
    icon.style.transform = `translate(${dx * depth}px, ${dy * depth}px)`;
  });
});

// ===== Lightweight particle field (canvas, no external deps) =====
const canvas = document.getElementById('fieldCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let W, H;

function resizeCanvas(){
  W = canvas.width = canvas.offsetWidth;
  H = canvas.height = canvas.offsetHeight;
}

function initParticles(){
  const count = Math.min(70, Math.floor((W * H) / 18000));
  particles = Array.from({length: count}, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.6 + 0.4,
    vx: (Math.random() - 0.5) * 0.15,
    vy: (Math.random() - 0.5) * 0.15,
    o: Math.random() * 0.5 + 0.2
  }));
}

function drawParticles(){
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
    if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(180,160,255,${p.o})`;
    ctx.fill();
  });
  // subtle connecting lines for nearby particles
  for (let i = 0; i < particles.length; i++){
    for (let j = i + 1; j < particles.length; j++){
      const a = particles[i], b = particles[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 110){
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(139,107,255,${0.12 * (1 - d / 110)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(drawParticles);
}

resizeCanvas();
initParticles();
drawParticles();
window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });

// ===== Animated stat counters (on scroll into view) =====
const statNums = document.querySelectorAll('.stat-num');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      const el = entry.target;
      const target = parseFloat(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      const isDecimal = target % 1 !== 0;
      let start = 0;
      const duration = 1200;
      const startTime = performance.now();
      function tick(now){
        const progress = Math.min((now - startTime) / duration, 1);
        const value = start + (target - start) * progress;
        el.textContent = (isDecimal ? value.toFixed(1) : Math.floor(value)) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.4 });
statNums.forEach(el => counterObserver.observe(el));

// ===== Process step reveal =====
const steps = document.querySelectorAll('.process-step');
const stepObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting){
      setTimeout(() => entry.target.classList.add('in-view'), i * 80);
      stepObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });
steps.forEach(s => stepObserver.observe(s));

// ===== Work filter =====
const filterBtns = document.querySelectorAll('.filter-btn');
const workCards = document.querySelectorAll('.work-card');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    workCards.forEach(card => {
      const match = filter === 'all' || card.dataset.cat === filter;
      card.classList.toggle('hidden', !match);
    });
  });
});

// ===== FAQ accordion =====
document.querySelectorAll('.faq-item').forEach(item => {
  const btn = item.querySelector('.faq-q');
  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// ===== Contact form (front-end only, no backend wired up) =====
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!form.checkValidity()){
    status.textContent = 'Please fill in your name, email and message.';
    status.style.color = '#ff8a8a';
    return;
  }
  const data = new FormData(form);
  const subject = encodeURIComponent(`New enquiry from ${data.get('name')} — SmartWork AI`);
  const body = encodeURIComponent(
    `Name: ${data.get('name')}\nEmail: ${data.get('email')}\nPhone: ${data.get('phone')}\nBusiness: ${data.get('business')}\nService: ${data.get('service')}\n\nMessage:\n${data.get('message')}`
  );
  window.location.href = `mailto:vanshikasehrawat@gmail.com?subject=${subject}&body=${body}`;
  status.textContent = 'Opening your email client to send this message…';
  status.style.color = '';
});
