/* LIVE-BAR v7 - File: assets/js/live-bar.js - replaces v4. ALWAYS scrolls, NEVER hides. */
/* Relative-path version: derives the site root from this script's own URL, */
/* so the same file works on GitHub Pages (/Kingdom167/) and Cloudflare Pages (/). */
(function () {
  var topbar = document.querySelector(".topbar-simple") || document.querySelector(".topbar");
  if (!topbar) return;
  if (document.querySelector(".live-bar")) return;
  var PLACEHOLDER = { label: "KINGDOM EVENT", details: ["6-week challenge", "3 legions"] };

  function buildBar(event) {
    var bar = document.createElement("div");
    bar.className = "live-bar";
    if (event.status) bar.classList.add("is-" + event.status);
    var track = document.createElement("div");
    track.className = "live-track";
    var dot = document.createElement("span"); dot.className = "live-dot"; dot.setAttribute("aria-hidden", "true");
    var label = document.createElement("b"); label.textContent = event.label || "KINGDOM EVENT";
    track.append(dot, label);
    // ALL details, always. No is-extra, nothing hidden on mobile.
    (event.details || []).forEach(function (detail) {
      var item = document.createElement("span");
      item.className = "live-item";
      var sep = document.createElement("span"); sep.className = "sep"; sep.textContent = "\u2022";
      var text = document.createElement("span"); text.textContent = detail;
      item.append(sep, text);
      track.appendChild(item);
    });
    // Duplicate the WHOLE set once for a seamless loop: [A][A] -> slide -50% = back to start, no jump.
    // Add a gap separator between the two copies so the loop doesn't run together.
    var second = track.cloneNode(true);
    second.setAttribute("aria-hidden", "true");
    second.querySelectorAll("*").forEach(function (el) { el.setAttribute("aria-hidden", "true"); });
    // Track holds copy 1 + copy 2 flat, so -50% = exactly one full copy.
    // cloneNode above made a nested track - flatten it: move its children into track.
    Array.from(second.children).forEach(function (child) { track.appendChild(child); });
    bar.appendChild(track);
    return bar;
  }

  function insert(event) {
    var bar = buildBar(event);
    topbar.insertAdjacentElement("afterend", bar);
  }

  // Site root from this script's URL, e.g.
  // GitHub:     https://kingshot167.github.io/Kingdom167/assets/js/live-bar.js -> .../Kingdom167/
  // Cloudflare: https://kingdom167.pages.dev/assets/js/live-bar.js          -> .../
  var scriptSrc = (document.currentScript && document.currentScript.src) || "";
  var base = scriptSrc ? scriptSrc.replace(/assets\/js\/live-bar\.js.*$/, "") : "./";
  if (base && base.slice(-1) !== "/") base += "/";

  fetch(base + "assets/data/live-events.json", { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error("no events file"); return r.json(); })
    .then(function (data) {
      var events = (data && data.events) || [];
      var active = events.find(function (e) { return e.active; }) || events[0];
      if (!active) { insert(PLACEHOLDER); return; }
      insert({ label: active.label || "KINGDOM EVENT", details: active.details || [], status: active.status || "live" });
    })
    .catch(function () { insert(PLACEHOLDER); });
})();
