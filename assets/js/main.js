// tsParticles config
if (window.tsParticles) {
  tsParticles.load("tsparticles", {
    fpsLimit: 60,
    background: { color: "transparent" },
    particles: {
      number: { value: 60, density: { enable: true, area: 800 } },
      color: { value: ["#ec4899", "#06b6d4", "#fde047", "#fff"] },
      shape: { type: "circle" },
      opacity: { value: 0.25, random: true },
      size: { value: 3, random: { enable: true, minimumValue: 1 } },
      move: {
        enable: true,
        speed: 1.2,
        direction: "none",
        random: false,
        straight: false,
        outModes: { default: "out" },
        attract: { enable: false }
      },
      links: {
        enable: true,
        distance: 120,
        color: "#fff",
        opacity: 0.08,
        width: 1
      }
    },
    interactivity: {
      events: {
        onHover: { enable: true, mode: "repulse" },
        onClick: { enable: true, mode: "push" }
      },
      modes: {
        repulse: { distance: 80, duration: 0.4 },
        push: { quantity: 4 }
      }
    },
    detectRetina: true
  });
}

// IntersectionObserver para animaciones (fade-up / left / right)
(function() {
  const fadeEls = document.querySelectorAll('.animate-fade-up, .animate-fade-left, .animate-fade-right');
  if (!fadeEls.length) return;
  const options = { threshold: 0.13 };
  const onIntersect = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  };
  const observer = new IntersectionObserver(onIntersect, options);
  fadeEls.forEach(el => observer.observe(el));
})();

// Scroll suave optimizado para enlaces de ancla
(function() {
  function smoothScrollTo(start, end, duration) {
    const change = end - start;
    const startTime = performance.now();
    function animateScroll(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
      window.scrollTo(0, start + change * ease);
      if (progress < 1) requestAnimationFrame(animateScroll);
    }
    requestAnimationFrame(animateScroll);
  }

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      const targetId = href.slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        const header = document.querySelector('header');
        const headerHeight = header ? header.offsetHeight : 0;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight + 1;
        smoothScrollTo(window.scrollY, targetPosition, 600);
      }
    });
  });
})();

// Back to top button
(function() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', function() {
    if (window.scrollY > 300) btn.style.display = 'flex'; else btn.style.display = 'none';
  });
  btn.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); });
})();

// Auto-scroll horizontal (prog-scroll y playlist-scroll)
(function(){
  const scrollIds = ['prog-scroll', 'playlist-scroll'];
  const duration = 40000;
  const resumeDelay = 5000;

  scrollIds.forEach(containerId => {
    const container = document.getElementById(containerId);
    if (!container) return;
    let animationFrame, start, paused = false, progress = 0, resumeTimeout = null;
    function getMaxScroll() { return container.scrollWidth - container.clientWidth; }
    function step(timestamp) {
      if (!start) start = timestamp;
      if (paused) return;
      const maxScroll = getMaxScroll();
      if (maxScroll <= 0) return;
      const elapsed = timestamp - start + progress;
      let percent = (elapsed % duration) / duration;
      container.scrollLeft = percent * maxScroll;
      if (container.scrollLeft >= maxScroll - 2) {
        container.scrollLeft = 0; start = timestamp; progress = 0;
      }
      animationFrame = requestAnimationFrame(step);
    }
    function startAnim() { if (animationFrame) cancelAnimationFrame(animationFrame); paused = false; start = null; animationFrame = requestAnimationFrame(step); }
    function pauseAnim() { paused = true; if (animationFrame) cancelAnimationFrame(animationFrame); const maxScroll = getMaxScroll(); progress = (container.scrollLeft / (maxScroll || 1)) * duration; }
    function stopAnimAndReset() { paused = true; if (animationFrame) cancelAnimationFrame(animationFrame); progress = 0; }
    function isPC() { return window.innerWidth > 900; }
    function hasOverflow() { return container.scrollWidth > container.clientWidth + 10; }
    function checkOverflowAndStart() {
      if (isPC()) { if (hasOverflow()) { startAnim(); enableManualScroll(); } else { stopAnimAndReset(); disableManualScroll(); } }
      else { stopAnimAndReset(); enableManualScroll(); }
    }
    function enableManualScroll() {
      container.style.pointerEvents = "auto";
      let isDown = false, startX, scrollLeft;
      if (isPC()) {
        container.onmousedown = function(e){ if(!hasOverflow()) return; isDown=true; startX = e.pageX - container.offsetLeft; scrollLeft = container.scrollLeft; pauseAnimAndResume(); };
        container.onmouseleave = function(){ isDown=false; };
        container.onmouseup = function(){ isDown=false; };
        container.onmousemove = function(e){ if(!isDown) return; e.preventDefault(); const x = e.pageX - container.offsetLeft; const walk = (x - startX) * 1.5; container.scrollLeft = scrollLeft - walk; if (container.scrollLeft < 0) container.scrollLeft = 0; pauseAnimAndResume(); };
        container.onwheel = function(e){ if(!hasOverflow()) return; setTimeout(()=>{ if(container.scrollLeft<0) container.scrollLeft=0; },0); pauseAnimAndResume(); };
      } else {
        container.onmousedown = null; container.onmouseleave = null; container.onmouseup = null; container.onmousemove = null; container.onwheel = null;
      }
      let touchStartX = 0, touchScrollLeft = 0;
      container.ontouchstart = function(e){ if(!hasOverflow()) return; isDown=true; touchStartX = e.touches[0].pageX; touchScrollLeft = container.scrollLeft; pauseAnimAndResume(); };
      container.ontouchend = function(){ isDown=false; };
      container.ontouchmove = function(e){ if(!isDown) return; const x = e.touches[0].pageX; const walk = (x - touchStartX) * 1.5; container.scrollLeft = touchScrollLeft - walk; if (container.scrollLeft < 0) container.scrollLeft = 0; pauseAnimAndResume(); };
    }
    function disableManualScroll(){ container.style.pointerEvents = "none"; container.onmousedown = e => e.preventDefault(); container.ontouchstart = e => e.preventDefault(); container.onwheel = e => e.preventDefault(); container.onmousemove = null; container.onmouseup = null; container.onmouseleave = null; container.ontouchend = null; container.ontouchmove = null; }
    function pauseAnimAndResume(){ pauseAnim(); if (resumeTimeout) clearTimeout(resumeTimeout); resumeTimeout = setTimeout(()=>{ if (hasOverflow()) startAnim(); }, resumeDelay); }
    window.addEventListener('resize', checkOverflowAndStart);
    checkOverflowAndStart();
  });
})();

// WhatsApp floating button behavior
(function(){
  const btnFloat = document.getElementById('whatsapp-float');
  const formContainer = document.getElementById('whatsapp-form-container');
  const form = document.getElementById('whatsapp-form');
  const textarea = document.getElementById('mensaje-whatsapp');
  const phone = '593961480654';
  const minimizeBtn = document.getElementById('minimize-btn');
  if (!btnFloat || !form || !textarea) return;

  btnFloat.addEventListener('click', (e) => {
    e.preventDefault();
    const expanded = btnFloat.getAttribute('aria-expanded') === 'true';
    if (expanded) { formContainer.style.display = 'none'; btnFloat.setAttribute('aria-expanded', 'false'); }
    else { formContainer.style.display = 'block'; btnFloat.setAttribute('aria-expanded', 'true'); textarea.focus(); }
  });

  if (minimizeBtn) minimizeBtn.addEventListener('click', () => { formContainer.style.display = 'none'; btnFloat.setAttribute('aria-expanded', 'false'); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const mensaje = textarea.value.trim();
    if (!mensaje) { alert('Por favor, escribe un mensaje.'); textarea.focus(); return; }
    const textoFormateado = `*_RDCR SOUND_*\n${mensaje}`;
    const textoCodificado = encodeURIComponent(textoFormateado);
    const url = `https://wa.me/${phone}?text=${textoCodificado}`;
    window.open(url, '_blank');
    form.reset(); formContainer.style.display = 'none'; btnFloat.setAttribute('aria-expanded', 'false');
  });

  document.addEventListener('click', (e) => {
    if (formContainer.style.display === 'block' && !btnFloat.contains(e.target) && !formContainer.contains(e.target)) {
      formContainer.style.display = 'none'; btnFloat.setAttribute('aria-expanded', 'false');
    }
  });

  formContainer.addEventListener('click', e => e.stopPropagation());
})();
