// ─── Year ───
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ─── Custom Cursor ───
if (!reduceMotion && window.matchMedia("(min-width: 721px)").matches) {
  const cursor = document.getElementById("cursor");
  const ring = document.getElementById("cursorRing");

  if (cursor && ring) {
    let mx = -100, my = -100;
    let rx = -100, ry = -100;

    document.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.left = mx + "px";
      cursor.style.top = my + "px";
    });

    // Ring follows with lag
    function animateRing() {
      rx += (mx - rx) * 0.13;
      ry += (my - ry) * 0.13;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
      requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover state on interactive elements
    const interactiveEls = document.querySelectorAll("a, button, .project-card, .hero-orb, .chip-list li");
    interactiveEls.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cursor.classList.add("hovered");
        ring.classList.add("hovered");
      });
      el.addEventListener("mouseleave", () => {
        cursor.classList.remove("hovered");
        ring.classList.remove("hovered");
      });
    });
  }
}

// ─── Scroll reveal ───
const revealEls = document.querySelectorAll(".reveal");
if (reduceMotion) {
  revealEls.forEach((el) => el.classList.add("show"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => revealObserver.observe(el));
}

// ─── Draggable Project Cards ───
const stage = document.getElementById("dragStage");
if (stage && !reduceMotion && window.matchMedia("(min-width: 981px)").matches) {
  const cards = Array.from(stage.querySelectorAll(".project-card"));
  let z = 4;

  cards.forEach((card, index) => {
    const x = Number(card.dataset.x || 20 + index * 40);
    const y = Number(card.dataset.y || 20 + index * 40);
    const r = Number(card.dataset.r || 0);

    card.dataset.tx = String(x);
    card.dataset.ty = String(y);
    card.style.setProperty("--tx", `${x}px`);
    card.style.setProperty("--ty", `${y}px`);
    card.style.setProperty("--rot", `${r}deg`);
    card.style.zIndex = String(index + 1);

    let dragging = false;
    let startX = 0;
    let startY = 0;
    let baseX = x;
    let baseY = y;

    // Prevent HTML5 ghost dragging entirely
    card.addEventListener("dragstart", (e) => e.preventDefault());

    card.addEventListener("pointerdown", (e) => {
      // Only drag if it's the main mouse button (or touch)
      if (e.button !== 0 && e.pointerType === 'mouse') return;

      dragging = true;
      card.classList.add("dragging");

      // Store exact pointer starting coordinates 
      startX = e.clientX;
      startY = e.clientY;

      // Store exact parsed dataset base coordinates
      baseX = Number(card.dataset.tx || 0);
      baseY = Number(card.dataset.ty || 0);

      z += 1;
      card.style.zIndex = String(z);
      card.setPointerCapture(e.pointerId);
      e.preventDefault(); // Prevent text selection while dragging
    });

    card.addEventListener("pointermove", (e) => {
      if (!dragging) return;

      // Exact delta from the mouse starting position
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      // Add exact delta to the absolute card base position
      const nx = baseX + dx;
      const ny = baseY + dy;

      card.dataset.tx = String(nx);
      card.dataset.ty = String(ny);
      card.style.setProperty("--tx", `${nx}px`);
      card.style.setProperty("--ty", `${ny}px`);
    });

    const stop = (e) => {
      if (!dragging) return;
      dragging = false;
      card.classList.remove("dragging");
      card.releasePointerCapture(e.pointerId);
    };

    card.addEventListener("pointerup", stop);
    card.addEventListener("pointercancel", stop);
  });
}

// ─── Header shrink on scroll ───
const header = document.querySelector(".site-header");
if (header) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 60) {
      header.style.background = "rgba(5,5,10,0.92)";
    } else {
      header.style.background = "rgba(5,5,10,0.75)";
    }
  }, { passive: true });
}

// ─── Fast Shimmering Interactive Moving Stars Background ───
const particleCanvas = document.getElementById("particleCanvas");
if (particleCanvas && !reduceMotion) {
  const ctx = particleCanvas.getContext("2d");
  let width, height;

  function resize() {
    width = particleCanvas.width = window.innerWidth;
    height = particleCanvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  const numParticles = window.matchMedia("(max-width: 768px)").matches ? 200 : 500;
  const particles = [];

  for (let i = 0; i < numParticles; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      // Fast drift speed
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      // Very small star sizes
      radius: Math.random() * 0.8 + 0.1,
      // Individual blink speeds & phases
      blinkPhase: Math.random() * Math.PI * 2,
      blinkSpeed: Math.random() * 0.05 + 0.01 // Faster blink
    });
  }

  // Track mouse for interactions
  let mouse = {
    x: undefined,
    y: undefined,
    radius: 150 // Interaction radius
  }

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = undefined;
    mouse.y = undefined;
  });


  function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      // Mouse interaction - scattering stars
      if (mouse.x != undefined && mouse.y != undefined) {
        let dx = mouse.x - p.x;
        let dy = mouse.y - p.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          // Mouse push force multiplier
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const maxDistance = mouse.radius;
          // Stronger push as mouse gets closer
          const force = (maxDistance - distance) / maxDistance;
          const directionX = forceDirectionX * force * 5;
          const directionY = forceDirectionY * force * 5;

          // Scatter away from cursor
          p.x -= directionX;
          p.y -= directionY;
        }
      }

      // Base fast Movement
      p.x += p.vx;
      p.y += p.vy;

      // Wrapping logic (so they loop seamlessly across the screen)
      if (p.x < 0) p.x = width;
      else if (p.x > width) p.x = 0;

      if (p.y < 0) p.y = height;
      else if (p.y > height) p.y = 0;

      // Shimmering
      p.blinkPhase += p.blinkSpeed;
      const alpha = 0.5 + 0.4 * Math.sin(p.blinkPhase);

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;

      // Only brightest stars have a tiny glow
      if (alpha > 0.7) {
        ctx.shadowBlur = p.radius * 3;
        ctx.shadowColor = `rgba(255, 255, 255, ${alpha * 0.8})`;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.fill();
    });

    requestAnimationFrame(animate);
  }
  animate();
}
