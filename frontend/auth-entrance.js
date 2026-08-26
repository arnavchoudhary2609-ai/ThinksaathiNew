/* 
 * ThinkSaathi - Cinematic Authentication Entrance Logic 
 */

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("thoughts-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  
  // Set canvas size
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  // Particle System (Thoughts)
  const particles = [];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const particleCount = prefersReducedMotion ? 10 : (window.innerWidth < 768 ? 40 : 80);
  
  class Particle {
    constructor() {
      this.reset();
      this.y = Math.random() * canvas.height;
    }
    
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + Math.random() * 200;
      this.size = Math.random() * 2.5 + 0.5;
      
      // Initial chaotic movement
      this.speedX = (Math.random() - 0.5) * 2;
      this.speedY = (Math.random() * -1) - 0.5;
      
      this.opacity = Math.random() * 0.5 + 0.1;
      this.calming = false;
    }
    
    update(timeElapsed) {
      if (timeElapsed > 3000 && !this.calming) {
        // Start calming down after 3 seconds
        this.calming = true;
      }
      
      if (this.calming) {
        // Slow down and move towards center gracefully
        this.speedX *= 0.98;
        
        // Very subtle upward float
        this.speedY = -0.3;
        
        // Gentle sway
        this.x += Math.sin(Date.now() / 2000 + this.size) * 0.2;
      } else {
        // Chaotic movement
        this.x += this.speedX + Math.sin(Date.now() / 1000 + this.size);
      }
      
      this.y += this.speedY;
      
      // Reset if off screen
      if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
        this.reset();
      }
    }
    
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
      ctx.fill();
    }
  }
  
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
  
  const startTime = Date.now(); // ms
  let animationFrameId;

  // ───── LAKE WAVES ─────
  // Draw layered animated sine-wave river at the bottom of the canvas.
  function drawLake(t) {
    const lakeTop = canvas.height * 0.72;
    const lakeH   = canvas.height - lakeTop;

    // solid lake body fill - BLUE
    const grad = ctx.createLinearGradient(0, lakeTop, 0, canvas.height);
    grad.addColorStop(0, "rgba(72, 150, 135, 0.45)");
grad.addColorStop(0.5, "rgba(35, 125, 110, 0.62)");
grad.addColorStop(1, "rgba(18, 90, 80, 0.78)");
ctx.fillStyle = grad;
    ctx.fillRect(0, lakeTop + 12, canvas.width, lakeH);

    const drawWave = (amplitude, frequency, phaseShift, colorStop0, colorStop1) => {
      const wGrad = ctx.createLinearGradient(0, lakeTop, 0, canvas.height);
      wGrad.addColorStop(0, colorStop0);
      wGrad.addColorStop(1, colorStop1);
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      for (let x = 0; x <= canvas.width; x += 3) {
        const y = lakeTop + amplitude + amplitude * Math.sin((x * frequency) + phaseShift + t);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fillStyle = wGrad;
      ctx.fill();
    };

    // back wave - deeper blue
drawWave(10, 0.008, t * 0.4,
  "rgba(45, 135, 120, 0.55)",
  "rgba(15, 85, 75, 0.85)"
);
    // mid wave
    drawWave(7, 0.012, t * 0.7 + 1.2,
  "rgba(80, 165, 145, 0.45)",
  "rgba(30, 115, 100, 0.72)"
);
    // front wave - lightest, fastest
  drawWave(5, 0.018, t * 1.1 + 2.5,
  "rgba(180, 220, 205, 0.35)",
  "rgba(90, 170, 150, 0.55)"
);
    // subtle horizontal ripple lines
    ctx.strokeStyle = "rgba(224, 242, 254, 0.3)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const ry = lakeTop + 18 + i * (lakeH / 6);
      const rx = (t * 30 * (i % 2 === 0 ? 1 : -1)) % canvas.width;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx + canvas.width * 0.3, ry);
      ctx.stroke();
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const t = Date.now() / 1000; // smooth time in seconds
    const timeElapsed = Date.now() - startTime; // ms elapsed

    // Draw lake FIRST (background layer on canvas)
    if (!prefersReducedMotion) {
      drawLake(t);
    } else {
     grad.addColorStop(0, "rgba(72, 150, 135, 0.45)");
grad.addColorStop(1, "rgba(18, 90, 80, 0.78)"); const grad = ctx.createLinearGradient(0, canvas.height * 0.72, 0, canvas.height);
   
      ctx.fillStyle = grad;
      ctx.fillRect(0, canvas.height * 0.72, canvas.width, canvas.height * 0.28);
    }

    // Draw particles on top
    particles.forEach(p => {
      if (!prefersReducedMotion) {
        p.update(timeElapsed);
      }
      p.draw();
    });

    animationFrameId = requestAnimationFrame(animate);
  }

  animate();

  // Handle Entrance Transition API
  window.authEntrance = {
    hide: () => {
      const entrance = document.getElementById("cinematic-entrance");
      const appWrapper = document.getElementById("app-wrapper");
      
      if (entrance) {
        entrance.classList.add("hidden");
        // Stop animation after transition completes
        setTimeout(() => {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          }
        }, 1500);
      }
      
      if (appWrapper) {
        appWrapper.style.display = "block";
        // Force reflow
        void appWrapper.offsetWidth; 
        appWrapper.style.opacity = "1";
        appWrapper.style.pointerEvents = "auto";
        appWrapper.style.visibility = "visible";
      }
    },
    
    show: () => {
      const entrance = document.getElementById("cinematic-entrance");
      const appWrapper = document.getElementById("app-wrapper");
      
      if (appWrapper) {
        appWrapper.style.opacity = "0";
        appWrapper.style.pointerEvents = "none";
        appWrapper.style.visibility = "hidden";
        setTimeout(() => {
          appWrapper.style.display = "none";
        }, 1000);
      }
      
      if (entrance) {
        entrance.classList.remove("hidden");
        // Restart animation
        if (!animationFrameId) {
          animate();
        }
      }
    },
    
    showError: (message) => {
      const errorDiv = document.getElementById("auth-error-msg");
      if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.opacity = "1";
      }
    },

    clearError: () => {
      const errorDiv = document.getElementById("auth-error-msg");
      if (errorDiv) {
        errorDiv.style.opacity = "0";
      }
    }
  };
});
