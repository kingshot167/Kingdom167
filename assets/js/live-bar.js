/* LIVE-BAR v4 - File: /Kingdom167/assets/js/live-bar.js - replaces v2. ADDS: slow scroll left ONLY if text overflows. */
(function () {
  var topbar = document.querySelector(".topbar-simple") || document.querySelector(".topbar");
  if (!topbar) return;
  if (document.querySelector(".live-bar")) return;
  var PLACEHOLDER = { label: "KINGDOM EVENT", details: ["6-week challenge", "3 legions"] };

  function buildBar(event) {
    var bar = document.createElement("div");
    bar.className = "live-bar";
    if (event.status) bar.classList.add("is-" + event.status);
    // Track = the one copy of the content. Scroll animation moves this track.
    var track = document.createElement("div");
    track.className = "live-track";
    var dot = document.createElement("span"); dot.className = "live-dot"; dot.setAttribute("aria-hidden", "true");
    var label = document.createElement("b"); label.textContent = event.label || "KINGDOM EVENT";
    track.append(dot, label);
    (event.details || []).forEach(function (detail, i) {
      var item = document.createElement("span");
      item.className = "live-item" + (i > 0 ? " is-extra" : "");
      var sep = document.createElement("span"); sep.className = "sep"; sep.textContent = "\u2022";
      var text = document.createElement("span"); text.textContent = detail;
      item.append(sep, text);
      track.appendChild(item);
    });
    bar.appendChild(track);
    return bar;
  }

  // Check overflow: if the single copy is wider than the bar, duplicate it + turn scrolling on.
  // If it fits, leave it alone - no scroll, no duplicate, stays centred.
  function checkOverflow(bar) {
    var track = bar.querySelector(".live-track");
    if (!track) return;
    // Reset first so measurement is of ONE copy only.
    bar.classList.remove("is-scrolling");
    var copies = track.querySelectorAll("[data-live-copy]");
    copies.forEach(function (c) { c.remove(); });
    // Let layout settle, then measure.
    requestAnimationFrame(function () {
      if (track.scrollWidth > bar.clientWidth + 2) {
        // Duplicate the content once, mark it as the copy, then scroll -50% (one copy width).
        var copy = track.cloneNode(true);
        copy.setAttribute("data-live-copy", "true");
        copy.setAttribute("aria-hidden", "true");
        track.appendChild(copy);
        // Actually: for the -50% loop to work, both copies must be inside the SAME animated track.
        // So move copy's children into track instead of nesting a track inside a track.
        // Undo the nested copy, redo flat:
        copy.remove();
        var children = Array.from(track.children).map(function (el) { return el.cloneNode(true); });
        children.forEach(function (el) { el.setAttribute("data-live-copy", "true"); el.setAttribute("aria-hidden", "true"); track.appendChild(el); });
        bar.classList.add("is-scrolling");
      }
    });
  }

  function insert(event) {
    var bar = buildBar(event);
    topbar.insertAdjacentElement("afterend", bar);
    checkOverflow(bar);
    // Recheck on resize / rotation - a bar that fit on desktop may overflow on mobile, and vice versa.
    var timer;
    window.addEventListener("resize", function () {
      clearTimeout(timer);
      timer = setTimeout(function () { checkOverflow(bar); }, 150);
    });
  }

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
