/* rankings.js - BASE-PATH FIX: works on GitHub Pages (/Kingdom167/) AND Cloudflare (/) */
/* File: /assets/js/rankings.js (path depends on your host - see README) */
(function () {
  /* ---- BASE DETECTION ---- */
  /* GitHub Pages: page is at /Kingdom167/Rankings/ -> base is /Kingdom167/ */
  /* Cloudflare: page is at /Rankings/ -> base is / */
  /* Custom domain on GH Pages: also / -> base is / */
  function detectBase() {
    if (window.location.pathname.indexOf("/Kingdom167/") === 0) return "/Kingdom167/";
    return "/";
  }
  var BASE = detectBase();
  /* Candidate URLs, in order. If the first 404s, try the next. This is what fixes CF. */
  var CANDIDATES = [
    BASE + "assets/data/leaderboards.json",
    "/Kingdom167/assets/data/leaderboards.json",
    "/assets/data/leaderboards.json",
    "assets/data/leaderboards.json",
    "../assets/data/leaderboards.json"
  ];
  /* De-duplicate, keep order. */
  CANDIDATES = CANDIDATES.filter(function (u, i) { return CANDIDATES.indexOf(u) === i; });

  var boardSelect = document.getElementById("board-select");
  var allianceSelect = document.getElementById("alliance-select");
  var list = document.getElementById("rankings-list");
  if (!boardSelect || !allianceSelect || !list) return;
  var status = document.getElementById("rankings-status");
  var updated = document.getElementById("rankings-updated");
  var title = document.getElementById("board-title");
  var kindLabel = document.getElementById("board-kind");
  var count = document.getElementById("board-count");
  var boardLabels = new Map(Array.from(boardSelect.options).map(function (o) { return [o.value, o.textContent]; }));
  var snapshot = null;

  function formatScore(score) {
    var v = Number(score);
    if (!Number.isFinite(v)) return String(score == null ? "\u2014" : score);
    return new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 2 }).format(v);
  }
  function showEmpty(message) {
    list.replaceChildren();
    var item = document.createElement("li"); item.className = "rankings-empty"; item.textContent = message; list.appendChild(item);
    count.textContent = "0 / 100";
  }
  function createEntry(entry, position, isAlliance) {
    var row = document.createElement("li");
    row.className = "ranking-entry" + (position <= 3 ? " is-top-three" : "");
    var rank = document.createElement("span"); rank.className = "ranking-place"; rank.textContent = "#" + (entry.rank || position);
    var emblem = document.createElement("span"); emblem.className = "ranking-emblem"; emblem.setAttribute("aria-hidden", "true");
    emblem.textContent = (entry.name || entry.nick_name || entry.abbr || "K").trim().slice(0, 1).toUpperCase();
    var identity = document.createElement("span"); identity.className = "ranking-identity";
    var name = document.createElement("b"); name.textContent = entry.name || entry.nick_name || entry.abbr || "Unknown governor";
    var detail = document.createElement("small");
    if (isAlliance) detail.textContent = "Alliance: " + (entry.abbr || "\u2014");
    else detail.textContent = entry.governor_id ? "Governor: " + entry.governor_id : "Governor ID unavailable";
    identity.append(name, detail);
    var score = document.createElement("span"); score.className = "ranking-score"; score.innerHTML = "<small>SCORE</small>";
    var scoreValue = document.createElement("b"); scoreValue.textContent = formatScore(entry.score); score.appendChild(scoreValue);
    if (!isAlliance) {
      var alliance = entry.alliance_abbr || entry.abbr || "Unassigned";
      var tag = document.createElement("span");
      tag.className = "alliance-tag alliance-" + alliance.toLowerCase(); tag.textContent = alliance;
      row.append(rank, emblem, identity, tag, score);
    } else { row.append(rank, emblem, identity, score); }
    return row;
  }
  function render() {
    if (!snapshot) return;
    var key = boardSelect.value;
    var board = snapshot.leaderboards && snapshot.leaderboards[key];
    var isAlliance = Boolean(board && board.kind === "alliance");
    title.textContent = boardLabels.get(key) || "Leaderboard";
    kindLabel.textContent = isAlliance ? "ALLIANCE LEADERBOARD" : "GOVERNOR LEADERBOARD";
    if (!board || !Array.isArray(board.entries) || board.entries.length === 0) { showEmpty("No rankings are available for this board in the latest snapshot."); return; }
    var filter = allianceSelect.value;
    var entries = board.entries.filter(function (e) { return filter === "all" || (e.alliance_abbr || e.abbr) === filter; })
      .sort(function (a, b) { return Number(a.rank || 9999) - Number(b.rank || 9999); }).slice(0, 100);
    list.replaceChildren();
    if (entries.length === 0) { showEmpty("No entries for this alliance in the selected leaderboard snapshot."); return; }
    entries.forEach(function (entry, index) { list.appendChild(createEntry(entry, index + 1, isAlliance)); });
    count.textContent = entries.length + " / 100";
  }
  boardSelect.addEventListener("change", render);
  allianceSelect.addEventListener("change", render);

  /* Try each candidate URL until one returns OK. Log the winner to console so you can see which base CF used. */
  function tryFetch(i) {
    if (i >= CANDIDATES.length) throw new Error("No leaderboard JSON found");
    return fetch(CANDIDATES[i], { cache: "no-store" }).then(function (r) {
      if (!r.ok) return tryFetch(i + 1);
      console.log("[Rankings] JSON loaded from:", CANDIDATES[i]);
      return r.json();
    });
  }
  tryFetch(0).then(function (data) {
    snapshot = data;
    if (data.updated_at) { var d = new Date(data.updated_at); updated.textContent = Number.isNaN(d.getTime()) ? "Snapshot date unavailable" : "Snapshot updated " + d.toLocaleString(); }
    else updated.textContent = "Waiting for the first JSON refresh";
    status.textContent = "MightPulse snapshot loaded \u00b7 " + (data.kingdom_name || "Kingdom 167"); render();
  }).catch(function () {
    updated.textContent = "JSON snapshot unavailable";
    status.textContent = "Could not load the local leaderboard JSON. Tried: " + CANDIDATES.join(", ");
    showEmpty("Leaderboard data is not available right now.");
  });
})();
