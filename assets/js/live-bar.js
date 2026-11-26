/* LIVE-BAR - shared status bar - File: /Kingdom167/assets/js/live-bar.js */
/* Injects <div class="live-bar"> right AFTER the topbar, BEFORE the hero, on any page that loads this file. */
/* Pages do NOT contain the bar HTML. Edit the events in /Kingdom167/assets/data/live-events.json only. */
/* If the JSON fails / is empty / has no active event, shows the static placeholder bar. */
(function () {
  // 1. Find the topbar. Works with both topbars.
  var topbar = document.querySelector(".topbar-simple") || document.querySelector(".topbar");
  if (!topbar) return;
  if (document.querySelector(".live-bar")) return; // already injected, do not double up

  // 2. Placeholder - what shows until events are tracked.
  var PLACEHOLDER = { label: "KINGDOM EVENT", details: ["6-week challenge", "3 legions"] };

  // 3. Build the bar DOM from an event object.
  function buildBar(event) {
    var bar = document.createElement("div");
    bar.className = "live-bar";
    if (event.status) bar.classList.add("is-" + event.status); // is-live / is-paused / is-ended
    var dot = document.createElement("span"); dot.className = "live-dot"; dot.setAttribute("aria-hidden", "true");
    var label = document.createElement("b"); label.textContent = event.label || "KINGDOM EVENT";
    bar.append(dot, label);
    (event.details || []).forEach(function (detail, i) {
      var sep = document.createElement("span"); sep.className = "sep"; sep.textContent = "\u2022";
      var text = document.createElement("span");
      // First detail stays visible on mobile, rest hide via .live-detail
      if (i > 0) text.className = "live-detail";
      text.textContent = detail;
      bar.append(sep, text);
    });
    return bar;
  }

  // 4. Insert right after the topbar = between topbar and hero.
  function insert(event) {
    var bar = buildBar(event);
    topbar.insertAdjacentElement("afterend", bar);
  }

  // 5. Try to load live events. Fallback to placeholder on ANY failure.
  fetch("/Kingdom167/assets/data/live-events.json", { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error("no events file"); return r.json(); })
    .then(function (data) {
      var events = (data && data.events) || [];
      // Pick first event marked active. If none marked, use first event.
      var active = events.find(function (e) { return e.active; }) || events[0];
      if (!active) { insert(PLACEHOLDER); return; }
      insert({
        label: active.label || "KINGDOM EVENT",
        details: active.details || [],
        status: active.status || "live"
      });
    })
    .catch(function () { insert(PLACEHOLDER); });
})();
