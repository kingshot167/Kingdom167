/* Fills alliance directory cards from the shared MightPulse snapshot. */
/* Relative-path version: derives the site root from this script's own URL, */
/* so the same file works on GitHub Pages (/Kingdom167/) and Cloudflare Pages (/). */
(function () {
  const cards = Array.from(document.querySelectorAll("[data-alliance-tag]"));
  const status = document.getElementById("alliance-hub-status");
  if (!cards.length || !status) return;

  function formatNumber(value, compact) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "—";
    return new Intl.NumberFormat(undefined, {
      notation: compact ? "compact" : "standard",
      maximumFractionDigits: compact ? 2 : 0
    }).format(number);
  }

  // Site root from this script's URL, e.g.
  // GitHub:     https://kingshot167.github.io/Kingdom167/assets/js/alliance-directory.js -> .../Kingdom167/
  // Cloudflare: https://kingdom167.pages.dev/assets/js/alliance-directory.js          -> .../
  var scriptSrc = (document.currentScript && document.currentScript.src) || "";
  var base = scriptSrc ? scriptSrc.replace(/assets\/js\/alliance-directory\.js.*$/, "") : "./";
  if (base && base.slice(-1) !== "/") base += "/";

  fetch(base + "assets/data/leaderboards.json", { cache: "no-store" })
    .then(function (response) {
      if (!response.ok) throw new Error("Alliance snapshot unavailable");
      return response.json();
    })
    .then(function (snapshot) {
      let loaded = 0;
      cards.forEach(function (card) {
        const alliance = snapshot.alliances && snapshot.alliances[card.dataset.allianceTag];
        if (!alliance) return;
        const name = card.querySelector("[data-alliance-name]");
        const memberCount = card.querySelector("[data-member-count]");
        const power = card.querySelector("[data-alliance-power]");
        if (name && alliance.name) name.textContent = alliance.name;
        if (memberCount) memberCount.textContent = formatNumber(alliance.member_count, false);
        if (power) power.textContent = formatNumber(alliance.power, true);
        loaded += 1;
      });

      status.textContent = loaded
        ? "MightPulse data · updated " + (snapshot.updated_at ? new Date(snapshot.updated_at).toLocaleString() : "recently")
        : "Alliance data will appear after the MightPulse refresh runs.";
    })
    .catch(function () {
      status.textContent = "Alliance data is not available yet. It will appear after the MightPulse refresh runs.";
    });
})();
