/* Reusable KVK season page renderer. Season values are in /KvK/season-data.js. */
(function () {
  const season = window.KVK_SEASON;
  const home = window.KVK_HOME_KINGDOM;
  if (!season || !home || !season.opponent) return;

  const text = (selector, value) => {
    const node = document.querySelector(selector);
    if (node) node.textContent = value;
  };
  const number = (value, decimals) => Number(value).toLocaleString("en-US", {
    minimumFractionDigits: decimals || 0,
    maximumFractionDigits: decimals || 0
  });
  const resultClass = (result) => result.toLowerCase();
  const homeName = home.name;
  const awayName = season.opponent.name;
  const homeCode = `K${home.kid}`;
  const awayCode = `K${season.opponent.kid}`;
  const setBanner = (selector, kingdom, fallbackSelector) => {
    const image = document.querySelector(selector);
    if (!image || !kingdom.banner_url) return;
    image.src = kingdom.banner_url;
    image.hidden = false;
    const fallback = document.querySelector(fallbackSelector);
    if (fallback) fallback.hidden = true;
  };

  document.title = `KvK Season ${season.season} | Kingdom 167`;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = `${homeName} vs ${awayName}: KvK season ${season.season} snapshot, prep day scores and castle history.`;
  text(".live-bar span:nth-of-type(3)", `Season ${season.season}`);
  text("[data-season-heading]", `KINGDOM WAR · SEASON ${season.season}`);
  text("[data-season-pill]", `SEASON ${season.season}`);
  text("[data-home-code]", homeCode);
  text("[data-home-name]", homeName);
  text("[data-away-code]", awayCode);
  text("[data-away-name]", awayName);
  text("[data-legend-home]", homeName);
  text("[data-legend-away]", awayName);
  text("[data-score-home-name]", `Kingdom #${home.kid}`);
  text("[data-score-away-name]", `Kingdom #${season.opponent.kid}`);
  setBanner("[data-home-banner]", home, ".home-kingdom .crest");
  setBanner("[data-away-banner]", season.opponent, ".away-kingdom .crest");
  text("[data-score-home]", number(season.prep.homeTotal));
  text("[data-score-away]", number(season.prep.awayTotal));

  const homeShare = (home, away) => Math.round((home / (home + away)) * 100);
  const stats = document.querySelector("[data-snapshot]");
  stats.innerHTML = season.snapshot.map((item) => {
    const home = `${number(item.home, item.decimals)}${item.suffix || ""}`;
    const away = `${number(item.away, item.decimals)}${item.suffix || ""}`;
    return `<div class="stat-row"><div class="stat-value ours">${home}</div><div class="stat-main"><div class="stat-label">${item.label}</div><div class="compare"><span style="--share:${homeShare(item.home, item.away)}%"></span><i></i></div></div><div class="stat-value">${away}</div></div>`;
  }).join("");
  const advantage = season.snapshot.filter((item) => item.home > item.away).length;
  text(".snapshot-note", `${homeCode} leads across ${advantage} of ${season.snapshot.length} measures`);

  const prepPercent = homeShare(season.prep.homeTotal, season.prep.awayTotal);
  document.querySelector("[data-total-bar]").style.width = `${prepPercent}%`;
  const days = document.querySelector("[data-prep-days]");
  days.innerHTML = season.prep.days.map((day) => `<div class="day-row"><b class="roman">${day.label}</b><strong>${number(day.home)}</strong><div class="day-track"><i style="--share:${homeShare(day.home, day.away)}%"></i></div><strong>${number(day.away)}</strong><span class="ended">${day.status}</span></div>`).join("");
  text(".result-badge", season.prep.homeTotal >= season.prep.awayTotal ? `${homeCode} AHEAD` : `${awayCode} AHEAD`);

  const record = document.querySelector(".record-summary");
  record.innerHTML = `<span><b>${season.castleRecord.taken}</b> castles taken</span><span><b>${season.castleRecord.lost}</b> castles lost</span>`;
  const history = document.querySelector("[data-history]");
  history.innerHTML = season.history.map((row) => `<tr class="${row.castle === "Held" ? "held-row" : ""}"><td>${row.date}</td><td><b class="opponent">${row.opponent}</b></td><td><span class="${resultClass(row.prep)}">${row.prep}</span>${row.prepScore ? `<small>${row.prepScore}</small>` : ""}</td><td><span class="${resultClass(row.castle)}">${row.castle}</span></td></tr>`).join("");

  fetch("/assets/data/leaderboards.json", { cache: "no-store" })
    .then((response) => response.ok ? response.json() : Promise.reject(new Error("MightPulse kingdom details unavailable")))
    .then((snapshot) => {
      const profiles = snapshot.kingdom_profiles || {};
      [[home, "home"], [season.opponent, "away"]].forEach(([kingdom, side]) => {
        const profile = profiles[String(kingdom.kid)];
        if (!profile) return;
        if (profile.name) text(`[data-${side}-name]`, profile.name);
        setBanner(`[data-${side}-banner]`, profile, `.${side}-kingdom .crest`);
      });
    })
    .catch(() => { /* Season data names and crest fallbacks remain visible offline. */ });
})();
