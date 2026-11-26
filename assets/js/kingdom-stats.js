/* Shows the seven-day active governor count from the published MightPulse snapshot. */
/* Relative-path version: derives the site root from this script's own URL, */
/* so the same file works on GitHub Pages (/Kingdom167/) and Cloudflare Pages (/). */
(function () {
  const count = document.getElementById("kingdom-member-count");
  if (!count) return;

  // Site root from this script's URL, e.g.
  // GitHub:     https://kingshot167.github.io/Kingdom167/assets/js/kingdom-stats.js -> .../Kingdom167/
  // Cloudflare: https://kingdom167.pages.dev/assets/js/kingdom-stats.js          -> .../
  var scriptSrc = (document.currentScript && document.currentScript.src) || "";
  var base = scriptSrc ? scriptSrc.replace(/assets\/js\/kingdom-stats\.js.*$/, "") : "./";
  if (base && base.slice(-1) !== "/") base += "/";

  fetch(base + "assets/data/leaderboards.json", { cache: "no-store" })
    .then(function (response) {
      if (!response.ok) throw new Error("Kingdom snapshot unavailable");
      return response.json();
    })
    .then(function (snapshot) {
      const rawCount = snapshot.kingdom && snapshot.kingdom.active_7d;
      const activeMembers = Number(rawCount);
      count.textContent = rawCount !== null && rawCount !== undefined && rawCount !== "" && Number.isFinite(activeMembers)
        ? new Intl.NumberFormat().format(activeMembers)
        : "—";
    })
    .catch(function () {
      count.textContent = "—";
    });
})();
