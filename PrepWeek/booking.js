/* Demo-only scheduler. No booking data is persisted or sent to a server. */
(() => {
  const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const defaults = ["Construction", "Research", "No default perk", "Troop Training", "Construction", "Prep Week ends at 12:00 UTC"];
  const perks = [...defaults];
  const bookings = [];
  let selected = null;
  const $ = id => document.getElementById(id);
  const daySelect = $("day-select"), grid = $("slot-grid");
  const monday = nextMondayUTC(new Date());
  const dateLabel = d => d.toLocaleDateString("en-GB", {timeZone:"UTC",day:"2-digit",month:"short",year:"numeric",weekday:"short"});
  $("week-dates").textContent = `${dateLabel(monday)} – ${dateLabel(new Date(monday.getTime()+5*86400000))} · UTC`;
  DAY_NAMES.forEach((name,i) => { const o=document.createElement("option");o.value=i;o.textContent=`${name} · ${perks[i]}`;daySelect.append(o); });
  function nextMondayUTC(now){const d=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()));let n=(8-d.getUTCDay())%7;if(n===0)n=7;d.setUTCDate(d.getUTCDate()+n);return d;}
  function slotAt(day,index){return new Date(monday.getTime()+day*86400000+15*60000+index*30*60000);}
  function time(d){return `${String(d.getUTCHours()).padStart(2,"0")}:${String(d.getUTCMinutes()).padStart(2,"0")}`;}
  function render(){const day=Number(daySelect.value||0);selected=null;$("day-name").textContent=`DAY ${day+1} · ${DAY_NAMES[day].toUpperCase()}`;$("perk-title").textContent=perks[day];$("day-note").textContent=day===2?"No default perk configured.":day===4?"Choose Construction or Research.":day===5?"Final prep day. Schedule closes at 12:00 UTC.":"Select a 30-minute window. All times are UTC.";grid.replaceChildren();
    // Midnight-anchored slots end at :15/:45. The final Saturday slot would
    // end at 12:15, past the hard noon close, so only 23 full slots fit.
    const count=day===5?23:48;
    for(let i=0;i<count;i++){const start=slotAt(day,i),end=new Date(start.getTime()+1800000),cross=end.getUTCDate()!==start.getUTCDate();const booked=bookings.find(b=>b.start===start.toISOString());const button=document.createElement("button");button.type="button";button.className="slot"+(booked?" is-booked":"");button.disabled=!!booked;button.setAttribute("aria-label",`${time(start)} to ${time(end)} UTC${booked?`, booked by ${booked.ign}`:" available"}`);button.innerHTML=`<span>${time(start)}–${time(end)}</span><small>${booked?`${escapeHtml(booked.ign)} · ${escapeHtml(booked.perk)}`:cross?"Crosses midnight · UTC":"Available"}</small>`;button.onclick=()=>{selected={day,index,start,end};document.querySelectorAll(".slot").forEach(x=>x.classList.remove("is-selected"));button.classList.add("is-selected");$("selection-label").textContent=`Selected ${DAY_NAMES[day]} ${time(start)}–${DAY_NAMES[(day+(cross?1:0))%7]} ${time(end)} UTC · ${perks[day]}`;updateButton();};grid.append(button);}
    $("selection-label").textContent="Select an available time slot.";updateButton();renderBookings();}
  function updateButton(){$("book-button").disabled=!selected||!$("ign").value.trim();}
  function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function renderBookings(){const out=$("booking-list");out.replaceChildren();if(!bookings.length){out.innerHTML='<p class="muted">No bookings in this session.</p>';return;}bookings.forEach(b=>{const row=document.createElement("div");row.className="booking-item";const info=document.createElement("div");info.innerHTML=`<b>${escapeHtml(b.ign)} · ${escapeHtml(b.perk)}</b><small>${b.dayName} ${time(new Date(b.start))}–${b.endDayName} ${time(new Date(b.end))} UTC</small>`;const cancel=document.createElement("button");cancel.textContent="Cancel";cancel.disabled=Date.now()>=new Date(b.start).getTime();if(cancel.disabled)cancel.title="Started bookings cannot be changed.";cancel.onclick=()=>{const at=bookings.indexOf(b);if(at>=0)bookings.splice(at,1);$("feedback").textContent="Demo booking cancelled. You can book a replacement before its start time.";render();};row.append(info,cancel);out.append(row);});}
  daySelect.onchange=render;$("ign").oninput=updateButton;$("book-button").onclick=()=>{if(!selected)return;const ign=$("ign").value.trim();if(!ign)return;const end=new Date(selected.start.getTime()+1800000);const day=selected.day;bookings.push({start:selected.start.toISOString(),end:end.toISOString(),ign,perk:perks[day],dayName:DAY_NAMES[day],endDayName:DAY_NAMES[(day+(end.getUTCDate()!==selected.start.getUTCDate()?1:0))%7]});$("feedback").textContent="Demo booking confirmed for this browser session.";render();};
  document.querySelectorAll("[data-perk-day]").forEach(control=>control.onchange=()=>{const i=Number(control.dataset.perkDay);perks[i]=control.value;const option=daySelect.options[i];option.textContent=`${DAY_NAMES[i]} · ${perks[i]}`;if(Number(daySelect.value)===i)render();});
  const finish=Date.UTC(monday.getUTCFullYear(),monday.getUTCMonth(),monday.getUTCDate()+5,12);function tick(){const diff=finish-Date.now();$("countdown").textContent=diff<=0?"Prep Week closed":`${Math.floor(diff/86400000)}d ${String(Math.floor(diff/3600000)%24).padStart(2,"0")}h ${String(Math.floor(diff/60000)%60).padStart(2,"0")}m`;$("week-status").textContent=diff<=0?"SCHEDULE CLOSED":"NEXT PREP WEEK";}tick();setInterval(tick,60000);render();
})();
