(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  // Terminal intro
  const lines = [
    ['> ', 'whoami'],
    ['', 'Damilola Akinluwo, software developer'],
    ['> ', 'cat stack.txt'],
    ['', 'python · fastapi · supabase · mcp'],
  ];
  const term = document.getElementById('term');
  const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
  function render(done, cur) {
    let h = done.map(([p,t]) => (p ? `<span class="p">${p}</span>` : '') + esc(t)).join('\n');
    if (cur) h += (done.length ? '\n' : '') + (cur[0] ? `<span class="p">${cur[0]}</span>` : '') + esc(cur[1]);
    term.innerHTML = h + '<span class="c"></span>';
  }
  if (reduce) render(lines);
  else {
    let i = 0, j = 0; const done = [];
    (function step() {
      if (i >= lines.length) return render(done);
      const [p, t] = lines[i];
      if (!p) { done.push(lines[i++]); render(done); return setTimeout(step, 350); }
      if (j <= t.length) { render(done, [p, t.slice(0, j++)]); return setTimeout(step, 70); }
      done.push(lines[i++]); j = 0; setTimeout(step, 250);
    })();
  }

  // Scroll reveal
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(el => reduce ? el.classList.add('in') : io.observe(el));

  // Pointer glow
  const move = (x, y) => { root.style.setProperty('--mx', x + 'px'); root.style.setProperty('--my', y + 'px'); pointer.x = x; pointer.y = y; };
  const pointer = { x: -999, y: -999 };
  addEventListener('pointermove', e => move(e.clientX, e.clientY), { passive: true });
  addEventListener('touchmove', e => { const t = e.touches[0]; move(t.clientX, t.clientY); }, { passive: true });

  // Card tilt + inner glow
  const fine = matchMedia('(pointer: fine)').matches;
  document.querySelectorAll('.card').forEach(c => {
    c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      c.style.setProperty('--gx', px * 100 + '%'); c.style.setProperty('--gy', py * 100 + '%');
      if (fine && !reduce) c.style.transform = `perspective(800px) rotateY(${(px - .5) * 10}deg) rotateX(${(.5 - py) * 10}deg)`;
    });
    c.addEventListener('pointerleave', () => c.style.transform = '');
  });

  // Skill filter
  const chips = document.querySelectorAll('.chips button'), cards = document.querySelectorAll('.card');
  chips.forEach(b => b.addEventListener('click', () => {
    const on = !b.classList.contains('on');
    chips.forEach(x => x.classList.remove('on'));
    cards.forEach(c => c.classList.remove('hit', 'dim'));
    if (!on) return;
    b.classList.add('on');
    const k = b.dataset.k; let any = false;
    cards.forEach(c => { const m = c.dataset.skills.split(' ').includes(k); c.classList.add(m ? 'hit' : 'dim'); any ||= m; });
    if (!any) cards.forEach(c => c.classList.remove('dim'));
    document.getElementById('projects').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }));

  // Reactive grid-particle background
  const cv = document.getElementById('bg'), ctx = cv.getContext('2d');
  let W, H, dots = [], dpr = Math.min(devicePixelRatio || 1, 2);
  function size() {
    W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const gap = W < 640 ? 34 : 42; dots = [];
    for (let y = gap / 2; y < H; y += gap) for (let x = gap / 2; x < W; x += gap) dots.push({ x, y });
  }
  size(); addEventListener('resize', size);
  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    for (const d of dots) {
      const dx = d.x - pointer.x, dy = d.y - pointer.y, dist = Math.hypot(dx, dy), f = Math.max(0, 1 - dist / 170);
      const wave = reduce ? 0 : Math.sin(t / 1400 + d.x / 120 + d.y / 160) * .5 + .5;
      const ox = f ? dx / dist * f * 10 : 0, oy = f ? dy / dist * f * 10 : 0;
      ctx.fillStyle = f > 0 ? `rgba(34,227,196,${.25 + f * .75})` : `rgba(90,130,220,${.08 + wave * .12})`;
      ctx.beginPath(); ctx.arc(d.x + ox, d.y + oy, 1.1 + f * 1.8, 0, 6.283); ctx.fill();
    }
    if (!reduce) requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
  if (reduce) addEventListener('pointermove', () => requestAnimationFrame(draw), { passive: true });
})();
