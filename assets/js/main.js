/* ============================================
   K167 — SHARED JS
   File: /Kingdom167/assets/js/main.js
   One file for ALL pages. Pages load it with:
   <script src="/Kingdom167/assets/js/main.js" defer></script>
   NEVER paste <script> into a page. Edit here only.
   ============================================ */

// ---------- ALLIANCE DATA ----------
const K167_ALLIANCES = [
  {code:"TNW", name:"The Night's Watch", color:"#55a7ff", beast:"🐺", beastName:"WOLF", lore:"The howl before the hunt", tag:"THE WATCHERS"},
  {code:"RYL", name:"Royal Legionnairs", color:"#ff4d5d", beast:"🦁", beastName:"LION", lore:"The crown never kneels", tag:"THE ROYAL LINE"},
  {code:"JUS", name:"Justice", color:"#b47bff", beast:"🔥", beastName:"FLAME", lore:"Reborn in every war", tag:"THE REBORN"},
  {code:"ONE", name:"One Nation Empire", color:"#3ddc84", beast:"🐉", beastName:"DRAGON", lore:"One banner, one breath", tag:"ONE NATION"},
  {code:"ITA", name:"Imperium Æternum", color:"#d7dce6", beast:"🦅", beastName:"EAGLE", lore:"Empire above the storm", tag:"ETERNAL EMPIRE"},
];

// ---------- SANCTUARY PHASE ----------
// Anchor: Mon 02 Nov 2026 00:00 UTC = Phase 1
// Cycle: Mon 00:00 phase starts, Wed 00:00 reg opens, Fri 00:00 reg closes / battle, Sun 00:00 phase ends
const K167_ANCHOR = Date.UTC(2026, 10, 2);
function k167GetPhase(nowMs){
  const diffDays = Math.floor((nowMs - K167_ANCHOR) / 86400000);
  return Math.floor(diffDays / 7) + 1;
}
function k167NextWeekdayUTC(fromMs, weekday, hour){
  const d = new Date(fromMs);
  const cur = d.getUTCDay();
  let add = (weekday - cur + 7) % 7;
  const target = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + add, hour, 0, 0);
  if(target <= fromMs) return target + 7*86400000;
  return target;
}
function k167FmtCountdown(ms){
  if(ms < 0) ms = 0;
  const totalSec = Math.floor(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if(d > 0) return d + "d " + String(h).padStart(2,"0") + "h " + String(m).padStart(2,"0") + "m";
  return String(h).padStart(2,"0") + "h " + String(m).padStart(2,"0") + "m " + String(s).padStart(2,"0") + "s";
}
function k167Set(id, txt){
  const el = document.getElementById(id);
  if(el) el.textContent = txt;
}

// ---------- KINGDOM THEME PLAYER ----------
function k167InitMusicPlayer(){
  if(document.getElementById('k167-music-player')) return;
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  const sharedScript = Array.from(document.scripts).find(script => /\/assets\/js\/main\.js(?:\?|$)/.test(script.src));
  style.href = new URL('../css/music-player.css', sharedScript ? sharedScript.src : location.href).href;
  document.head.appendChild(style);

  const player = document.createElement('aside');
  player.id = 'k167-music-player';
  player.className = 'k167-player';
  player.setAttribute('aria-label', 'Kingdom theme music player');
  player.innerHTML = '<button class="k167-play" type="button" aria-label="Play kingdom theme">▶</button><div class="k167-track"><strong>EMBERFALL</strong><span>Kingdom Theme · Sample</span></div><label class="k167-volume-label" title="Volume"><span aria-hidden="true">♪</span><input class="k167-volume" type="range" min="0" max="100" value="22" aria-label="Music volume"></label>';
  document.body.appendChild(player);

  const playButton = player.querySelector('.k167-play');
  const volume = player.querySelector('.k167-volume');
  let context = null, master = null, timer = null, nextBeat = 0, beat = 0, playing = false;
  const savedVolume = Number(localStorage.getItem('k167-music-volume'));
  if(Number.isFinite(savedVolume) && savedVolume >= 0 && savedVolume <= 100) volume.value = String(savedVolume);
  const chords = [[146.83,174.61,220],[116.54,146.83,174.61],[130.81,164.81,196],[130.81,164.81,196]];
  const melody = [293.66,0,349.23,440,0,392,349.23,0,293.66,0,261.63,293.66,0,220,261.63,0, 261.63,0,293.66,349.23,0,392,349.23,0,440,0,392,349.23,0,293.66,261.63,0];
  function setVolume(){ if(master) master.gain.setTargetAtTime(Number(volume.value)/100*.16,context.currentTime,.08); }
  function tone(freq, at, duration, type, loudness){
    if(!freq || !context) return;
    const osc=context.createOscillator(), gain=context.createGain();
    osc.type=type; osc.frequency.setValueAtTime(freq,at);
    gain.gain.setValueAtTime(.0001,at); gain.gain.exponentialRampToValueAtTime(loudness,at+.045); gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
    osc.connect(gain); gain.connect(master); osc.start(at); osc.stop(at+duration+.03);
  }
  function schedule(){
    const now=context.currentTime;
    while(nextBeat<now+.35){
      const step=beat%8, bar=Math.floor(beat/8)%4, at=nextBeat;
      if(step===0){ chords[bar].forEach(f=>tone(f,at,2.75,'triangle',.17)); tone(chords[bar][0]/2,at,2.8,'sine',.18); }
      const note=melody[(Math.floor(beat/2))%melody.length];
      if(beat%2===0) tone(note,at,.52,'sine',.32);
      nextBeat+=60/84/2; beat++;
    }
  }
  async function start(){
    const AudioCtx=window.AudioContext||window.webkitAudioContext;
    if(!AudioCtx){ player.classList.add('k167-no-audio'); return; }
    if(!context){ context=new AudioCtx(); master=context.createGain(); master.connect(context.destination); setVolume(); }
    try{ await context.resume(); }catch(_){ return; }
    if(playing) return;
    playing=true; nextBeat=context.currentTime+.08; timer=window.setInterval(schedule,100);
    playButton.textContent='Ⅱ'; playButton.setAttribute('aria-label','Pause kingdom theme'); player.classList.add('k167-playing');
    localStorage.setItem('k167-music-playing','true');
  }
  function pause(){
    if(!playing) return;
    playing=false; window.clearInterval(timer); timer=null;
    if(context) context.suspend();
    playButton.textContent='▶'; playButton.setAttribute('aria-label','Play kingdom theme'); player.classList.remove('k167-playing');
    localStorage.setItem('k167-music-playing','false');
  }
  playButton.addEventListener('click',()=>playing?pause():start());
  volume.addEventListener('input',()=>{localStorage.setItem('k167-music-volume',volume.value);setVolume();});
  if(localStorage.getItem('k167-music-playing')==='true'){
    playButton.title='Tap to resume the kingdom theme';
    playButton.setAttribute('aria-label','Resume kingdom theme');
    start();
  }
}

// ---------- ALLIANCE SWITCHER (Home only) ----------
function k167InitAllianceSwitcher(){
  const chips = document.querySelectorAll('#alliance-chips .chip');
  if(!chips.length) return;
  const dots = document.querySelectorAll('#f-dots .dot');
  function setAlliance(i){
    const a = K167_ALLIANCES[i];
    const pad = String(i+1).padStart(2,"0");
    const feat = document.getElementById('alliance-feature');
    if(feat) feat.style.setProperty('--ac', a.color);
    k167Set('f-tag', a.tag);
    k167Set('f-count', pad + " / 05");
    k167Set('f-beast', a.beast);
    k167Set('f-code', a.code + " — " + a.beastName);
    k167Set('f-name', a.name);
    k167Set('f-lore', "“" + a.lore + "”");
    k167Set('c-beast', a.beast);
    k167Set('c-code', a.code);
    k167Set('c-name', a.name);
    k167Set('c-meta', "ALLIANCE " + pad + " OF 05");
    chips.forEach((c,ci)=>{ c.classList.toggle('active', ci===i); c.setAttribute('aria-selected', ci===i ? "true":"false"); });
    dots.forEach((d,di)=> d.classList.toggle('on', di===i));
  }
  chips.forEach(c => c.addEventListener('click', ()=> setAlliance(Number(c.dataset.index))));
}

// ---------- LIVE BAR + COUNTDOWNS ----------
function k167Tick(){
  const now = Date.now();
  const phase = k167GetPhase(now);
  const nowDate = new Date(now);
  const day = nowDate.getUTCDay();
  let regText = "";
  if(day === 1 || day === 2) regText = "Registration opens Wed 00:00 UTC";
  else if(day === 3 || day === 4) regText = "Registration OPEN — closes Fri 00:00 UTC";
  else regText = "Registration CLOSED — opens next Wed 00:00 UTC";
  k167Set('live-phase', "PHASE " + phase);
  k167Set('live-reg', regText);
  k167Set('hero-phase', "— PHASE " + phase);
  k167Set('phase-label', "PHASE " + phase);
  k167Set('current-phase', "Phase " + phase);
  k167Set('phase-note', "📍 Today is " + nowDate.toUTCString().slice(0,16) + " UTC — Phase " + phase + ". Next phase starts Mon 00:00 UTC.");
  // Countdowns (if on page)
  const nextWed = k167NextWeekdayUTC(now, 3, 0);
  const nextFri = k167NextWeekdayUTC(now, 5, 0);
  let regMs, regLabel;
  if(day === 3 || day === 4){ regMs = nextFri - now; regLabel = "Fri 00:00 UTC • Closes"; }
  else { regMs = nextWed - now; regLabel = "Wed 00:00 UTC • Opens"; }
  k167Set('cd-reg', k167FmtCountdown(regMs));
  k167Set('cd-reg-sub', regLabel);
  k167Set('cd-battle', k167FmtCountdown(nextFri - now));
  k167Set('cd-battle-sub', "Fri 00:00 UTC • Sanctuary Battle");
  // Sanctuaries page: Sanctuary 2 rotation
  const ROTATION = ["TNW","ONE","RYL","JUS","ITA"];
  const holder = ROTATION[(phase - 1) % ROTATION.length];
  const nextHolder = ROTATION[phase % ROTATION.length];
  k167Set('sanc2-holder', holder);
  k167Set('sanc2-phase', "Phase " + phase);
  k167Set('sanc2-next', nextHolder);
  k167Set('s2-row', holder);
  k167Set('sanc2-body', "This week (Phase " + phase + ") Sanctuary 2 belongs to " + holder + ". Next week it goes to " + nextHolder + ".");
}

// ---------- BOOT ----------
document.addEventListener('DOMContentLoaded', ()=>{
  k167InitMusicPlayer();
  k167InitAllianceSwitcher();
  k167Tick();
  setInterval(k167Tick, 1000);
});
