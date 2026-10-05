/* ===== polish.js — add with <script src="polish.js" defer></script> (after the inline script is fine) ===== */
(function(){
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const $$ = (s,r=document)=>[...r.querySelectorAll(s)];

  /* 1. Staggered reveals inside grids */
  ['.projects-grid > *','.stack-grid > *','.stats-row > *'].forEach(sel=>{
    $$(sel).forEach((el,i)=>{ el.style.setProperty('--d',(i%6)*90+'ms'); });
  });
  $$('.about-grid > *').forEach((el,i)=>el.style.setProperty('--d',i*120+'ms'));

  /* 2. Active nav link while scrolling */
  const links = $$('.nav-links a[href^="#"]:not(.nav-cta)');
  const map = new Map(links.map(a=>[a.getAttribute('href').slice(1),a]));
  const secObs = new IntersectionObserver(es=>{
    es.forEach(e=>{
      if(e.isIntersecting){
        links.forEach(l=>l.classList.remove('active'));
        const a = map.get(e.target.id); if(a) a.classList.add('active');
      }
    });
  },{rootMargin:'-45% 0px -50% 0px'});
  $$('section[id]').forEach(s=>secObs.observe(s));

  /* 3. Mobile menu: animated icon, Esc + outside click close */
  const toggle = document.getElementById('navToggle'), menu = document.getElementById('navLinks');
  if(toggle && menu){
    const sync = ()=>toggle.classList.toggle('open', menu.classList.contains('open'));
    new MutationObserver(sync).observe(menu,{attributes:true,attributeFilter:['class']});
    document.addEventListener('keydown',e=>{ if(e.key==='Escape') menu.classList.remove('open'); });
    document.addEventListener('click',e=>{ if(!menu.contains(e.target) && !toggle.contains(e.target)) menu.classList.remove('open'); });
  }

  /* 4. Cursor spotlight on cards */
  if(fine && !reduce){
    $$('.project-card,.stack-group,.stat-card').forEach(c=>{
      c.addEventListener('pointermove',e=>{
        const r=c.getBoundingClientRect();
        c.style.setProperty('--mx',(e.clientX-r.left)+'px');
        c.style.setProperty('--my',(e.clientY-r.top)+'px');
      },{passive:true});
    });

    /* 5. Gentle hero parallax */
    const hero = document.getElementById('hero');
    if(hero){
      hero.addEventListener('pointermove',e=>{
        const r=hero.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
        hero.style.setProperty('--px',(x*14).toFixed(1)+'px');
        hero.style.setProperty('--py',(y*14).toFixed(1)+'px');
      },{passive:true});
      hero.addEventListener('pointerleave',()=>{hero.style.setProperty('--px','0px');hero.style.setProperty('--py','0px');});
    }
  }

  /* 6. Count-up stats */
  const nums = $$('.stat-num span');
  const cObs = new IntersectionObserver(es=>{
    es.forEach(e=>{
      if(!e.isIntersecting) return;
      cObs.unobserve(e.target);
      const el=e.target, m=el.textContent.match(/^(\d+)(.*)$/); if(!m||reduce) return;
      const end=+m[1], suf=m[2], t0=performance.now(), dur=1200;
      (function tick(t){
        const p=Math.min((t-t0)/dur,1), v=Math.round(end*(1-Math.pow(1-p,3)));
        el.textContent=v+suf; if(p<1) requestAnimationFrame(tick);
      })(t0);
    });
  },{threshold:.6});
  nums.forEach(n=>cObs.observe(n));

  /* 7. Keyboard-accessible project cards */
  $$('.project-card').forEach(c=>{
    c.setAttribute('role','button'); c.setAttribute('tabindex','0');
    c.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); c.click(); } });
  });

  /* 8. Back-to-top button */
  const up=document.createElement('button');
  up.className='to-top'; up.setAttribute('aria-label','Back to top');
  up.innerHTML='<svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  up.onclick=()=>scrollTo({top:0,behavior:reduce?'auto':'smooth'});
  document.body.appendChild(up);
  let ticking=false;
  addEventListener('scroll',()=>{
    if(ticking) return; ticking=true;
    requestAnimationFrame(()=>{ up.classList.toggle('show',scrollY>700); ticking=false; });
  },{passive:true});
})();
