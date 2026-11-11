/* ============================================
   K167 — SHARED JS
   File: /assets/js/main.js
   One file for ALL pages. Pages load it with:
   <script src="/assets/js/main.js" defer></script>
   NEVER paste <script> into a page. Edit here only.
   ============================================ */

// ---------- ALLIANCE DATA ----------
const K167_ALLIANCES = [
  {code:"TNW", name:"The Night's Watch", color:"#55a7ff", beast:"🐺", beastName:"WOLF", lore:"The howl before the hunt", tag:"THE WATCHERS"},
  {code:"RYL", name:"Royal Legionnairs", color:"#ff4d5d", beast:"🦁", beastName:"LION", lore:"The crown never kneels", tag:"THE ROYAL LINE"},
  {code:"ONE", name:"One Nation Empire", color:"#3ddc84", beast:"🐉", beastName:"DRAGON", lore:"One banner, one breath", tag:"ONE NATION"},
  {code:"ITA", name:"Imperium Æternum", color:"#d7dce6", beast:"🦅", beastName:"EAGLE", lore:"Empire above the storm", tag:"ETERNAL EMPIRE"},
  {code:"JUS", name:"Justice", color:"#b47bff", beast:"🔥", beastName:"FLAME", lore:"Reborn in every war", tag:"THE REBORN"},
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
  k167InitAllianceSwitcher();
  k167Tick();
  setInterval(k167Tick, 1000);
});
