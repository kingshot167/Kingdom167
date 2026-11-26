/* LIVE-BAR v2 - File: /Kingdom167/assets/js/live-bar.js - replaces v1 completely */
/* FIX: wraps each detail in <span class="live-item"><span class="sep"> + <span>detail</span></span> so mobile hiding removes the dot too. */
(function () {
  var topbar = document.querySelector(".topbar-simple") || document.querySelector(".topbar");
  if (!topbar) return;
  if (document.querySelector(".live-bar")) return;
  var PLACEHOLDER = { label: "KINGDOM EVENT", details: ["6-week challenge", "3 legions"] };
  function buildBar(event) {
    var bar = document.createElement("div");
    bar.className = "live-bar";
    if (event.status) bar.classList.add("is-" + event.status);
    var dot = document.createElement("span"); dot.className = "live-dot"; dot.setAttribute("aria-hidden", "true");
    var label = document.createElement("b"); label.textContent = event.label || "KINGDOM EVENT";
    bar.append(dot, label);
    (event.details || []).forEach(function (detail, i) {
      var item = document.createElement("span");
      item.className = "live-item" + (i > 0 ? " is-extra" : ""); // first detail stays on mobile, rest hide WITH their dot
      var sep = document.createElement("span"); sep.className = "sep"; sep.textContent = "\u2022";
      var text = document.createElement("span"); text.textContent = detail;
      item.append(sep, text);
      bar.appendChild(item);
    });
    return bar;
  }
  function insert(event) { topbar.insertAdjacentElement("afterend", buildBar(event)); }
  fetch("/Kingdom167/assets/data/live-events.json", { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error("no events file"); return r.json(); })
    .then(function (data) {
      var events = (data && data.events) || [];
      var active = events.find(function (e) { return e.active; }) || events[0];
      if (!active) { insert(PLACEHOLDER); return; }
      insert({ label: active.label || "KINGDOM EVENT", details: active.details || [], status: active.status || "live" });
    })
    .catch(function () { insert(PLACEHOLDER); });
})();
