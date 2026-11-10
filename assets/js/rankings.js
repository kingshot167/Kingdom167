/* Reads the published leaderboard snapshot. A future MightPulse sync fills the JSON. */
(function () {
  const dataUrl = "/Kingdom167/assets/data/leaderboards.json";
  const boardSelect = document.getElementById("board-select");
  const allianceSelect = document.getElementById("alliance-select");
  const list = document.getElementById("rankings-list");
  if (!boardSelect || !allianceSelect || !list) return;

  const status = document.getElementById("rankings-status");
  const updated = document.getElementById("rankings-updated");
  const title = document.getElementById("board-title");
  const kindLabel = document.getElementById("board-kind");
  const count = document.getElementById("board-count");
  const boardLabels = new Map(Array.from(boardSelect.options).map(function (option) {
    return [option.value, option.textContent];
  }));
  let snapshot = null;

  function formatScore(score) {
    const value = Number(score);
    if (!Number.isFinite(value)) return String(score == null ? "—" : score);
    return new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 2 }).format(value);
  }

  function showEmpty(message) {
    list.replaceChildren();
    const item = document.createElement("li");
    item.className = "rankings-empty";
    item.textContent = message;
    list.appendChild(item);
    count.textContent = "0 / 100";
  }

  function createEntry(entry, position, isAlliance) {
    const row = document.createElement("li");
    row.className = "ranking-entry" + (position <= 3 ? " is-top-three" : "");

    const rank = document.createElement("span");
    rank.className = "ranking-place";
    rank.textContent = "#" + (entry.rank || position);

    const emblem = document.createElement("span");
    emblem.className = "ranking-emblem";
    emblem.setAttribute("aria-hidden", "true");
    emblem.textContent = (entry.name || entry.nick_name || entry.abbr || "K").trim().slice(0, 1).toUpperCase();

    const identity = document.createElement("span");
    identity.className = "ranking-identity";
    const name = document.createElement("b");
    name.textContent = entry.name || entry.nick_name || entry.abbr || "Unknown governor";
    const detail = document.createElement("small");
    if (isAlliance) detail.textContent = "Alliance: " + (entry.abbr || "—");
    else {
      const alliance = entry.alliance_abbr || entry.abbr || "Unassigned";
      const governorId = entry.governor_id ? "Governor: " + entry.governor_id : "Governor ID unavailable";
      detail.textContent = governorId + " · " + alliance;
    }
    identity.append(name, detail);

    const score = document.createElement("span");
    score.className = "ranking-score";
    score.innerHTML = "<small>SCORE</small>";
    const scoreValue = document.createElement("b");
    scoreValue.textContent = formatScore(entry.score);
    score.appendChild(scoreValue);

    row.append(rank, emblem, identity, score);
    return row;
  }

  function render() {
    if (!snapshot) return;
    const key = boardSelect.value;
    const board = snapshot.leaderboards && snapshot.leaderboards[key];
    const isAlliance = key === "alliance_power" || key === "alliance_kills";
    title.textContent = boardLabels.get(key) || "Leaderboard";
    kindLabel.textContent = isAlliance ? "ALLIANCE LEADERBOARD" : "GOVERNOR LEADERBOARD";

    if (!board || !Array.isArray(board.entries) || board.entries.length === 0) {
      showEmpty("No cached rankings for this board yet. The JSON snapshot will populate when the MightPulse refresh is connected.");
      return;
    }

    const filter = allianceSelect.value;
    const entries = board.entries
      .filter(function (entry) { return filter === "all" || (entry.alliance_abbr || entry.abbr) === filter; })
      .sort(function (a, b) { return Number(a.rank || 9999) - Number(b.rank || 9999); })
      .slice(0, 100);

    list.replaceChildren();
    if (entries.length === 0) {
      showEmpty("No entries for this alliance in the selected leaderboard snapshot.");
      return;
    }
    entries.forEach(function (entry, index) { list.appendChild(createEntry(entry, index + 1, isAlliance)); });
    count.textContent = entries.length + " / 100";
  }

  boardSelect.addEventListener("change", render);
  allianceSelect.addEventListener("change", render);

  fetch(dataUrl, { cache: "no-store" })
    .then(function (response) {
      if (!response.ok) throw new Error("Leaderboard snapshot unavailable");
      return response.json();
    })
    .then(function (data) {
      snapshot = data;
      if (data.updated_at) {
        const date = new Date(data.updated_at);
        updated.textContent = Number.isNaN(date.getTime()) ? "Snapshot date unavailable" : "JSON refreshed " + date.toLocaleString();
      } else updated.textContent = "Waiting for the first JSON refresh";
      status.textContent = "JSON snapshot loaded · " + (data.kingdom_name || "Kingdom 167");
      render();
    })
    .catch(function () {
      updated.textContent = "JSON snapshot unavailable";
      status.textContent = "Could not load the local leaderboard JSON. Check the file path and try again.";
      showEmpty("Leaderboard data is not available right now.");
    });
})();
