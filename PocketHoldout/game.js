(function () {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const overlay = document.getElementById("overlay");
  const timerEl = document.getElementById("timer");
  const scoreEl = document.getElementById("score");
  const meter = document.getElementById("meter");
  const bestEl = document.getElementById("best");
  const title = document.getElementById("overlay-title");
  const copy = document.getElementById("overlay-copy");
  const sprites = {
    streetDoc: new Image(),
    dirtybob: new Image()
  };
  sprites.streetDoc.src = "/assets/streetdoc-sprite.png";
  sprites.dirtybob.src = "/assets/dirtybob-sprite.png";
  const state = {
    active: false, grip: false, runId: 0, started: 0, last: 0, elapsed: 0,
    tension: 0, docX: 350, bobX: 620, bobY: 340, direction: 1,
    score: 0, best: Number(localStorage.getItem("pocketHoldoutBest") || 0),
    keys: new Set(), pointer: null, target: null, nextTarget: 0,
    sound: false, audio: null, sparks: []
  };

  function timeText(ms) {
    const seconds = ms / 1000;
    return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(Math.floor(seconds % 60)).padStart(2, "0")}.${Math.floor(seconds % 1 * 10)}`;
  }
  bestEl.textContent = timeText(state.best);

  function start() {
    state.runId++;
    state.active = true;
    state.grip = true;
    state.started = state.last = performance.now();
    state.elapsed = state.tension = state.score = 0;
    state.docX = 350;
    state.bobX = 620;
    state.bobY = 340;
    state.direction = 1;
    state.target = null;
    state.nextTarget = state.started + 1100;
    state.sparks.length = 0;
    state.keys.clear();
    scoreEl.textContent = "0";
    meter.style.width = "0%";
    overlay.classList.add("hidden");
    requestAnimationFrame(now => frame(now, state.runId));
  }

  function finish() {
    if (!state.active) return;
    state.active = false;
    state.grip = false;
    if (state.elapsed > state.best) {
      state.best = state.elapsed;
      localStorage.setItem("pocketHoldoutBest", String(state.best));
      bestEl.textContent = timeText(state.best);
    }
    title.textContent = "Pocket escaped!";
    copy.textContent = `StreetDoc held on for ${timeText(state.elapsed)} and collected ${state.score} in loose change.`;
    document.getElementById("start").textContent = "Try again";
    overlay.classList.remove("hidden");
    beep(170, 0.18);
  }

  function beep(frequency, duration) {
    if (!state.sound) return;
    try {
      state.audio = state.audio || new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = state.audio.createOscillator();
      const gain = state.audio.createGain();
      oscillator.frequency.value = frequency;
      oscillator.type = "triangle";
      gain.gain.value = 0.035;
      oscillator.connect(gain);
      gain.connect(state.audio.destination);
      oscillator.start();
      gain.gain.exponentialRampToValueAtTime(0.001, state.audio.currentTime + duration);
      oscillator.stop(state.audio.currentTime + duration);
    } catch (_) {}
  }

  function character(image, x, groundY, label) {
    const height = 245;
    const width = height * 2 / 3;
    ctx.fillStyle = "#17111d";
    ctx.beginPath(); ctx.ellipse(x, groundY + 3, 48, 10, 0, 0, Math.PI * 2); ctx.fill();
    if (image.complete && image.naturalWidth) {
      ctx.drawImage(image, x - width / 2, groundY - height, width, height);
    }
    ctx.fillStyle = "#eee7f5"; ctx.font = "bold 13px system-ui"; ctx.textAlign = "center";
    ctx.fillText(label, x, groundY - height - 8);
  }

  function draw(now) {
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#241933"); sky.addColorStop(0.62, "#49314c"); sky.addColorStop(1, "#17111d");
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 8; i++) {
      const x = i * 145 - 30;
      ctx.fillStyle = "#19131f"; ctx.fillRect(x, 115 + (i % 2) * 24, 110, 245);
      ctx.fillStyle = "#76506b";
      for (let j = 0; j < 3; j++) ctx.fillRect(x + 18 + j * 31, 145 + (i % 2) * 24, 12, 30);
    }
    ctx.fillStyle = "#302438"; ctx.fillRect(0, 360, w, 180);
    ctx.strokeStyle = "#614d64"; ctx.lineWidth = 2;
    for (let x = 0; x < w; x += 90) { ctx.beginPath(); ctx.moveTo(x, 360); ctx.lineTo(x - 100, 540); ctx.stroke(); }
    ctx.fillStyle = "#dbccde"; ctx.globalAlpha = 0.18; ctx.font = "bold 24px system-ui";
    ctx.fillText("KINGDOM 167", 22, 402); ctx.globalAlpha = 1;

    const handX = state.docX + 43, handY = 270;
    const pocketX = state.bobX - 35, pocketY = state.bobY - 75;
    ctx.beginPath(); ctx.moveTo(handX, handY);
    ctx.quadraticCurveTo((handX + pocketX) / 2, 228 + Math.sin(now / 130) * 13, pocketX, pocketY);
    ctx.strokeStyle = state.grip ? "#d8b5ff" : "#db5476"; ctx.lineWidth = 7; ctx.stroke();
    ctx.fillStyle = "#542a4b";
    ctx.beginPath(); ctx.moveTo(state.bobX - 31, pocketY + 4); ctx.lineTo(state.bobX - 3, pocketY + 4);
    ctx.lineTo(state.bobX + 4, pocketY + 31); ctx.lineTo(state.bobX - 38, pocketY + 31); ctx.fill();
    ctx.fillStyle = "#ffcf5c"; ctx.fillRect(pocketX - 1, pocketY + 1, 13, 8);

    if (state.target) {
      ctx.save(); ctx.translate(state.target.x, state.target.y); ctx.rotate(now / 500);
      ctx.fillStyle = "#ffd66b"; ctx.shadowColor = "#ffd66b"; ctx.shadowBlur = 18;
      ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#7c4b19"; ctx.font = "bold 14px system-ui"; ctx.textAlign = "center"; ctx.fillText("$", 0, 5);
      ctx.restore();
    }
    state.sparks = state.sparks.filter(spark => spark.life > 0);
    state.sparks.forEach(spark => {
      spark.y -= 1.2; spark.life -= 0.025; ctx.globalAlpha = spark.life;
      ctx.fillStyle = "#ffd66b"; ctx.fillRect(spark.x, spark.y, 5, 5);
    });
    ctx.globalAlpha = 1;
    character(sprites.streetDoc, state.docX, 360, "STREETDOC");
    character(sprites.dirtybob, state.bobX, state.bobY + 20, "DIRTYBOB");
    ctx.fillStyle = "#fff"; ctx.font = "15px system-ui"; ctx.textAlign = "center";
    ctx.fillText(state.target ? "LOOSE CHANGE! MOVE STREETDOC TO GRAB IT" : "DON'T LET GO!", 480, 70);
  }

  function frame(now, runId) {
    if (!state.active || runId !== state.runId) return;
    const dt = Math.min((now - state.last) / 1000, 0.04);
    state.last = now;
    state.elapsed = now - state.started;
    const difficulty = 1 + state.elapsed / 50000;

    if (state.keys.has("ArrowLeft") || state.keys.has("KeyA")) state.docX -= 260 * dt;
    if (state.keys.has("ArrowRight") || state.keys.has("KeyD")) state.docX += 260 * dt;
    state.docX = Math.max(90, Math.min(510, state.docX));

    state.bobX += state.direction * (85 + state.elapsed / 1600) * difficulty * dt;
    state.bobY = 330 + Math.sin(now / 520) * 17;
    if (state.bobX > 850 || state.bobX < 560) state.direction *= -1;

    const gap = Math.max(0, Math.abs((state.bobX - 37) - (state.docX + 59)) - 145);
    state.tension += dt * (0.035 + gap / 1450);
    if (gap < 35) state.tension -= dt * 0.12;
    state.tension = Math.max(0, Math.min(1, state.tension));
    meter.style.width = `${state.tension * 100}%`;

    if (now >= state.nextTarget && !state.target) {
      state.target = { x: 120 + Math.random() * 420, y: 274 + Math.random() * 80 };
      state.nextTarget = now + 1800;
    }
    if (state.target && Math.abs(state.target.x - (state.docX + 30)) < 45) {
      state.score += 10;
      scoreEl.textContent = String(state.score);
      for (let i = 0; i < 8; i++) state.sparks.push({ x: state.target.x, y: state.target.y, life: 1 });
      state.target = null; state.nextTarget = now + 3000; state.tension = Math.max(0, state.tension - 0.12);
      beep(620, 0.1);
    }

    timerEl.textContent = timeText(state.elapsed);
    draw(now);
    if (!state.grip || state.tension >= 1) { finish(); return; }
    requestAnimationFrame(next => frame(next, runId));
  }

  document.getElementById("start").addEventListener("click", start);
  document.getElementById("restart").addEventListener("click", () => {
    if (state.active) { state.active = false; state.grip = false; }
    start();
  });
  document.getElementById("sound").addEventListener("click", event => {
    state.sound = !state.sound;
    event.currentTarget.textContent = `Sound: ${state.sound ? "on" : "off"}`;
    event.currentTarget.setAttribute("aria-pressed", String(state.sound));
    beep(440, 0.08);
  });

  window.addEventListener("keydown", event => {
    if (["Space", "ArrowLeft", "ArrowRight"].includes(event.code)) event.preventDefault();
    if (event.code === "Space") {
      if (!state.active) start();
      state.grip = true;
    }
    state.keys.add(event.code);
  });
  window.addEventListener("keyup", event => {
    state.keys.delete(event.code);
    if (event.code === "Space" && state.active) { state.grip = false; finish(); }
  });
  window.addEventListener("blur", () => {
    state.keys.clear(); state.pointer = null;
    if (state.active) { state.grip = false; finish(); }
  });

  canvas.addEventListener("pointerdown", event => {
    if (!state.active) start();
    canvas.setPointerCapture(event.pointerId);
    state.pointer = event.pointerId;
    state.grip = true;
    state.docX = Math.max(90, Math.min(510, event.offsetX / canvas.clientWidth * canvas.width - 30));
  });
  canvas.addEventListener("pointermove", event => {
    if (state.pointer !== event.pointerId) return;
    state.docX = Math.max(90, Math.min(510, event.offsetX / canvas.clientWidth * canvas.width - 30));
  });
  function release(event) {
    if (state.pointer !== event.pointerId) return;
    state.pointer = null;
    if (state.active) { state.grip = false; finish(); }
  }
  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", release);

  function idle(now) {
    if (!state.active) { state.bobX = 620 + Math.sin(now / 950) * 80; state.bobY = 330 + Math.sin(now / 520) * 17; draw(now); }
    requestAnimationFrame(idle);
  }
  requestAnimationFrame(idle);
})();
