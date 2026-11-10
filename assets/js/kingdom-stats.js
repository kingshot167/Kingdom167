/* Shows the seven-day active governor count from the published MightPulse snapshot. */
(function () {
  const count = document.getElementById("kingdom-member-count");
  if (!count) return;

  fetch("/Kingdom167/assets/data/leaderboards.json", { cache: "no-store" })
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
