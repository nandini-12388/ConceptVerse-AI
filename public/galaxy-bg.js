// =========================================================
// ConceptVerse AI — Multi-Universe 3D Canvas Engine
// Features 3D Galaxy Canvas for Space + Hogwarts Great Hall Floating Candles for Harry Potter
// =========================================================

class GalaxyRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Galaxy parameters - wide, cosmic 3D spiral
    this.particleCount = 11000;
    this.particles = [];
    this.armCount = 3;
    this.spiralTurns = 1.35;   // how many times each arm wraps around the core
    this.twistFactor = 0.0028;
    this.maxRadius = 750;
    this.coreRadius = 45;
    
    // 3D Camera / Orientation
    this.pitch = 0.95;
    this.yaw = 0;
    this.roll = 0.12;
    
    // Interactive mouse targets
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    this.mouseX = 0;
    this.mouseY = 0;

    // Hogwarts Floating Candle Particles
    this.hogwartsParticles = [];

    // Universe Color Palettes - Subtle cosmic hues on pure black
    this.currentTheme = 'default';
    this.themeColors = {
      default: {
        core: ['#ffffff', '#ede9fe', '#ddd6fe', '#f5d0fe', '#e0e7ff'],
        mid:  ['#c084fc', '#a855f7', '#e879f9', '#f472b6', '#8b5cf6', '#d8b4fe'],
        outer:['#818cf8', '#6366f1', '#60a5fa', '#38bdf8', '#22d3ee', '#a5b4fc'],
        halo: 'rgba(99, 102, 241, 0.05)'
      },
      harrypotter: {
        core: ['#ffffff', '#ffd700', '#fef08a', '#10b981'],
        mid:  ['#fbbf24', '#f59e0b', '#3b82f6', '#ef4444'],
        outer:['#ffd700', '#10b981', '#8b5cf6', '#f59e0b'],
        halo: 'rgba(212, 175, 55, 0.15)'
      },
      marvel: {
        core: ['#ffffff', '#ff4d5e', '#ffd166', '#00f2fe'],
        mid:  ['#ff0055', '#7000ff', '#3a86ff', '#00f2fe'],
        outer:['#00f2fe', '#ff4d5e', '#4895ef', '#e0aaff'],
        halo: 'rgba(255, 77, 94, 0.12)'
      },
      space: {
        core: ['#ffffff', '#fef3c7', '#fde68a', '#3fd4ff'],
        mid:  ['#f472b6', '#c084fc', '#a855f7', '#818cf8'],
        outer:['#38bdf8', '#22d3ee', '#34d399', '#94a3b8'],
        halo: 'rgba(56, 189, 248, 0.12)'
      },
      anime: {
        core: ['#ffffff', '#ff6fd8', '#f472b6', '#00ffff'],
        mid:  ['#e040fb', '#7c4dff', '#536dfe', '#00b0ff'],
        outer:['#1de9b6', '#ff80ab', '#ea80fc', '#ff6fd8'],
        halo: 'rgba(255, 111, 216, 0.12)'
      },
      mythology: {
        core: ['#ffffff', '#ffd166', '#ff9933', '#f57c00'],
        mid:  ['#ff9800', '#fb8c00', '#7c5cff', '#ab47bc'],
        outer:['#ce93d8', '#ffb74d', '#ffd166', '#ff9933'],
        halo: 'rgba(255, 153, 51, 0.12)'
      },
      pirates: {
        core: ['#ffffff', '#ffb340', '#00e5ff', '#80deea'],
        mid:  ['#0097a7', '#00acc1', '#ffb74d', '#ffa726'],
        outer:['#ffb340', '#00e5ff', '#f57c00', '#bf360c'],
        halo: 'rgba(0, 229, 255, 0.12)'
      }
    };

    // 3D Callout Locations
    this.locations = [
      { name: 'Milky Way Core', distance: '~26,000 ly', radiusRatio: 0.06, armAngle: 0, heightOffset: 12 },
      { name: 'Solar System', distance: '~27,000 ly', radiusRatio: 0.52, armAngle: 1.1, heightOffset: 5 },
      { name: 'Alpha Centauri', distance: '4.37 ly', radiusRatio: 0.60, armAngle: 1.25, heightOffset: -8 },
      { name: 'Sirius System', distance: '8.6 ly', radiusRatio: 0.45, armAngle: 2.8, heightOffset: 10 },
      { name: 'Orion Nebula', distance: '1,344 ly', radiusRatio: 0.75, armAngle: 4.1, heightOffset: -14 }
    ];

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    window.addEventListener('mousemove', (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      this.targetMouseX = (e.clientX - cx) / cx;
      this.targetMouseY = (e.clientY - cy) / cy;
    });

    this.createParticles();
    this.createHogwartsParticles();
    this.animate(0);
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    this.maxRadius = Math.max(this.width, this.height) * 0.68;
    if (this.maxRadius < 550) this.maxRadius = 550;

    if (this.currentTheme === 'harrypotter') {
      this.createHogwartsParticles();
    }
  }

  setTheme(themeName) {
    this.currentTheme = themeName;
    if (themeName === 'harrypotter') {
      this.createHogwartsParticles();
    } else if (this.themeColors[themeName]) {
      this.recolorParticles();
    }
  }

  createHogwartsParticles() {
    this.hogwartsParticles = [];
    const colors = ['#ffd700', '#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#ffffff', '#eab308'];

    // 50 Floating Enchanted Candles
    for (let i = 0; i < 50; i++) {
      this.hogwartsParticles.push({
        type: 'candle',
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        speed: 0.25 + Math.random() * 0.45,
        swaySpeed: 0.001 + Math.random() * 0.002,
        swayAmp: 8 + Math.random() * 16,
        flickerPhase: Math.random() * Math.PI * 2,
        height: 18 + Math.random() * 12,
        width: 3.5 + Math.random() * 2,
        alpha: 0.75 + Math.random() * 0.25
      });
    }

    // 400 Lumos Spell Sparks & House Magic Embers
    for (let i = 0; i < 400; i++) {
      this.hogwartsParticles.push({
        type: 'ember',
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        speed: 0.35 + Math.random() * 0.75,
        swaySpeed: 0.0015 + Math.random() * 0.003,
        swayAmp: 12 + Math.random() * 24,
        size: 1.2 + Math.random() * 2.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.25 + Math.random() * 0.65
      });
    }
  }

  createParticles() {
    this.particles = [];
    const colors = this.themeColors[this.currentTheme] || this.themeColors.default;

    for (let i = 0; i < this.particleCount; i++) {
      const isCore = i < this.particleCount * 0.07;
      const isHalo = i > this.particleCount * 0.84;

      let r, angle, y;

      if (isCore) {
        r = Math.pow(Math.random(), 2.2) * this.coreRadius * 1.6;
        angle = Math.random() * Math.PI * 2;
        y = (Math.random() - 0.5) * (this.coreRadius * 0.5) * Math.exp(-r / this.coreRadius);
      } else if (isHalo) {
        // Faint scattered stars filling the space between and beyond the arms
        r = Math.sqrt(Math.random()) * this.maxRadius * 1.3;
        angle = Math.random() * Math.PI * 2;
        y = (Math.random() - 0.5) * 120 * (1 - r / (this.maxRadius * 1.4));
      } else {
        const armIndex = i % this.armCount;
        const armBaseAngle = (armIndex * 2 * Math.PI) / this.armCount;
        const distRatio = Math.pow(Math.random(), 0.9);
        r = this.coreRadius * 0.6 + distRatio * (this.maxRadius - this.coreRadius * 0.6);
        const rRatioArm = r / this.maxRadius;

        // Logarithmic-style wrap: arms sweep ~1.35 turns from core to edge
        const spiralAngle = armBaseAngle + rRatioArm * this.spiralTurns * Math.PI * 2;
        // Arms get wider and more diffuse toward the edge
        const armWidth = 30 + rRatioArm * 170;
        const gauss = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
        const angleSpread = (gauss * armWidth) / r;
        angle = spiralAngle + angleSpread;

        const maxThickness = 36 * (1 - rRatioArm * 0.6);
        y = (Math.random() - 0.5) * (Math.random() - 0.5) * maxThickness * 2;
      }

      // Uniform rotation so the arms keep their spiral shape over time
      const speed = 0.00022;

      let color;
      const rRatio = r / this.maxRadius;

      if (rRatio < 0.08) {
        color = colors.core[Math.floor(Math.random() * colors.core.length)];
      } else if (rRatio < 0.5) {
        color = colors.mid[Math.floor(Math.random() * colors.mid.length)];
      } else {
        color = colors.outer[Math.floor(Math.random() * colors.outer.length)];
      }

      const size = Math.random() * 1.3 + (rRatio < 0.08 ? 0.6 : 0.3);
      const alpha = isHalo ? Math.random() * 0.18 + 0.05 : Math.random() * 0.32 + 0.1;

      this.particles.push({
        r,
        angle,
        y,
        speed,
        size,
        color,
        baseAlpha: alpha,
        twinkleSpeed: 0.3 + Math.random() * 1.5,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }
  }

  recolorParticles() {
    const colors = this.themeColors[this.currentTheme] || this.themeColors.default;
    for (let p of this.particles) {
      const rRatio = p.r / this.maxRadius;
      if (rRatio < 0.15) {
        p.color = colors.core[Math.floor(Math.random() * colors.core.length)];
      } else if (rRatio < 0.55) {
        p.color = colors.mid[Math.floor(Math.random() * colors.mid.length)];
      } else {
        p.color = colors.outer[Math.floor(Math.random() * colors.outer.length)];
      }
    }
  }

  animate(time) {
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.03;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.03;

    const currentPitch = this.pitch + this.mouseY * 0.08;
    const currentYaw = this.yaw + (time * 0.00005) + (this.mouseX * 0.12);
    const currentRoll = this.roll + (this.mouseX * 0.04);

    // Only draw while visible (first page); keeps other pages light
    if (!this.canvas.classList.contains('is-hidden')) {
      this.render(time, currentPitch, currentYaw, currentRoll);
    }
    requestAnimationFrame((t) => this.animate(t));
  }

  render(time, pitch, yaw, roll) {
    const ctx = this.ctx;
    const cx = this.width / 2;
    const cy = this.height / 2;

    // Check if Harry Potter Hogwarts mode is active
    if (this.currentTheme === 'harrypotter') {
      this.renderHogwartsBackground(time);
      return;
    }

    // Default 3D Space Galaxy Canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.width, this.height);

    const colors = this.themeColors[this.currentTheme] || this.themeColors.default;
    const bgGlow = ctx.createRadialGradient(cx, cy, 10, cx, cy, this.maxRadius * 1.2);
    bgGlow.addColorStop(0, colors.halo || 'rgba(168, 85, 247, 0.08)');
    bgGlow.addColorStop(0.4, 'rgba(10, 10, 18, 0.4)');
    bgGlow.addColorStop(1, '#000000');
    
    ctx.fillStyle = bgGlow;
    ctx.fillRect(0, 0, this.width, this.height);

    const cosP = Math.cos(pitch), sinP = Math.sin(pitch);
    const cosY = Math.cos(yaw),   sinY = Math.sin(yaw);
    const cosR = Math.cos(roll),  sinR = Math.sin(roll);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    
    const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, this.coreRadius * 1.3);
    coreGlow.addColorStop(0, 'rgba(237, 233, 254, 0.22)');
    coreGlow.addColorStop(0.3, 'rgba(167, 139, 250, 0.10)');
    coreGlow.addColorStop(0.6, 'rgba(99, 102, 241, 0.04)');
    coreGlow.addColorStop(1, 'transparent');
    
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, this.coreRadius * 1.3, 0, Math.PI * 2);
    ctx.fill();

    const projectedParticles = [];

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.angle += p.speed;

      const x0 = p.r * Math.cos(p.angle);
      const z0 = p.r * Math.sin(p.angle);
      const y0 = p.y;

      const x1 = x0 * cosY - z0 * sinY;
      const z1 = x0 * sinY + z0 * cosY;
      const y1 = y0;

      const x2 = x1;
      const y2 = y1 * cosP - z1 * sinP;
      const z2 = y1 * sinP + z1 * cosP;

      const x3 = x2 * cosR - y2 * sinR;
      const y3 = x2 * sinR + y2 * cosR;
      const z3 = z2;

      const fov = 850;
      const scale = fov / (fov + z3);
      const projX = cx + x3 * scale;
      const projY = cy + y3 * scale;

      const twinkle = Math.sin(time * 0.001 * p.twinkleSpeed + p.twinklePhase) * 0.1;
      const currentAlpha = Math.max(0.04, Math.min(0.55, (p.baseAlpha + twinkle) * scale));

      projectedParticles.push({
        x: projX,
        y: projY,
        z: z3,
        scale,
        size: p.size * scale,
        color: p.color,
        alpha: currentAlpha
      });
    }

    projectedParticles.sort((a, b) => b.z - a.z);

    for (let i = 0; i < projectedParticles.length; i++) {
      const p = projectedParticles[i];
      if (p.x < -40 || p.x > this.width + 40 || p.y < -40 || p.y > this.height + 40) continue;

      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      if (p.size > 1.3) {
        ctx.globalAlpha = p.alpha * 0.25;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();

    this.renderLocationMarkers(time, cosP, sinP, cosY, sinY, cosR, sinR, cx, cy);
  }

  // Renders Hogwarts Great Hall Atmosphere (Floating Candles & Lumos Embers)
  renderHogwartsBackground(time) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // Deep Gothic Night Sky backdrop
    const skyGradients = ctx.createLinearGradient(0, 0, 0, this.height);
    skyGradients.addColorStop(0, '#04020a');
    skyGradients.addColorStop(0.5, '#0b051a');
    skyGradients.addColorStop(1, '#05020c');
    ctx.fillStyle = skyGradients;
    ctx.fillRect(0, 0, this.width, this.height);

    // Soft warm golden & emerald Great Hall ambient light
    const hallGlow = ctx.createRadialGradient(this.width / 2, this.height * 0.7, 50, this.width / 2, this.height * 0.7, this.width * 0.6);
    hallGlow.addColorStop(0, 'rgba(212, 175, 55, 0.16)');
    hallGlow.addColorStop(0.5, 'rgba(16, 185, 129, 0.08)');
    hallGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = hallGlow;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.save();

    // Render Lumos spell embers & House Magic sparks
    ctx.globalCompositeOperation = 'lighter';
    for (let p of this.hogwartsParticles) {
      if (p.type === 'ember') {
        p.y -= p.speed;
        p.x += Math.sin(time * p.swaySpeed + p.y * 0.01) * 0.4;
        
        if (p.y < -10) {
          p.y = this.height + 10;
          p.x = Math.random() * this.width;
        }

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Render Floating Enchanted Candles
    for (let p of this.hogwartsParticles) {
      if (p.type === 'candle') {
        p.y -= p.speed;
        p.x += Math.sin(time * p.swaySpeed + p.y * 0.005) * 0.25;

        if (p.y < -40) {
          p.y = this.height + 40;
          p.x = Math.random() * this.width;
        }

        ctx.globalAlpha = p.alpha;

        // Wax Candle Pillar Body
        ctx.fillStyle = 'rgba(255, 248, 220, 0.88)';
        ctx.beginPath();
        ctx.roundRect(p.x - p.width / 2, p.y, p.width, p.height, 2);
        ctx.fill();

        // Candle Wick
        ctx.strokeStyle = '#4a3b2c';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x, p.y - 4);
        ctx.stroke();

        // Flickering Flame Core
        const flicker = Math.sin(time * 0.005 + p.flickerPhase) * 1.5;
        const flameY = p.y - 7;
        const flameRadius = 3.5 + flicker * 0.4;

        // Flame Outer Radial Glow
        const flameGlow = ctx.createRadialGradient(p.x, flameY, 0, p.x, flameY, flameRadius * 3.5);
        flameGlow.addColorStop(0, 'rgba(255, 215, 0, 0.9)');
        flameGlow.addColorStop(0.4, 'rgba(255, 140, 0, 0.5)');
        flameGlow.addColorStop(1, 'transparent');

        ctx.fillStyle = flameGlow;
        ctx.beginPath();
        ctx.arc(p.x, flameY, flameRadius * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Flame Core Teardrop
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, flameY, flameRadius * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  renderLocationMarkers(time, cosP, sinP, cosY, sinY, cosR, sinR, cx, cy) {
    const ctx = this.ctx;
    
    const selectionScreen = document.getElementById('universeSelectionScreen');
    if (!selectionScreen || selectionScreen.classList.contains('hidden-screen')) return;

    ctx.save();
    ctx.font = '500 11px "Inter", system-ui, sans-serif';

    for (let loc of this.locations) {
      const r = loc.radiusRatio * this.maxRadius;
      const currentAngle = loc.armAngle + (time * 0.00005 * (12 / Math.max(r, 15)));

      const x0 = r * Math.cos(currentAngle);
      const z0 = r * Math.sin(currentAngle);
      const y0 = loc.heightOffset;

      const x1 = x0 * cosY - z0 * sinY;
      const z1 = x0 * sinY + z0 * cosY;
      const y2 = y0 * cosP - z1 * sinP;
      const z2 = y0 * sinP + z1 * cosP;
      const x3 = x1 * cosR - y2 * sinR;
      const y3 = x1 * sinR + y2 * cosR;

      const fov = 850;
      const scale = fov / (fov + z2);
      const px = cx + x3 * scale;
      const py = cy + y3 * scale;

      ctx.globalAlpha = Math.min(0.65, Math.max(0.15, scale * 0.55));

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(px, py, 2.5 * scale, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + 12 * scale, py - 18 * scale);
      ctx.stroke();

      const labelX = px + 12 * scale;
      const labelY = py - 28 * scale;
      const textWidth = ctx.measureText(loc.name).width;
      const boxWidth = textWidth + 14;
      const boxHeight = 20;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      
      ctx.beginPath();
      ctx.roundRect(labelX, labelY, boxWidth, boxHeight, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#d1d5db';
      ctx.fillText(loc.name, labelX + 7, labelY + 14);
    }

    ctx.restore();
  }
}

window.GalaxyRenderer = GalaxyRenderer;
