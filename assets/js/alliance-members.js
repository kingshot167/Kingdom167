/* Shows the latest MightPulse roster snapshot on each alliance profile. */
(function () {
  const tags = ["RYL", "JUS", "TNW", "ONE", "ITA"];
  const tag = tags.find(function (value) {
    return document.body.classList.contains("alliance-" + value.toLowerCase());
  });
  const eventLinks = document.getElementById("events");
  if (!tag || !eventLinks) return;

  const section = document.createElement("section");
  section.className = "alliance-roster-section";
  section.id = "members";
  section.setAttribute("aria-labelledby", "roster-title");

  const heading = document.createElement("div");
  heading.className = "alliance-section-heading";
  heading.innerHTML = '<span class="kicker">MIGHTPULSE ROSTER · ' + tag + '</span><h2 id="roster-title">Alliance members</h2><p>Members are grouped by their alliance role.</p>';
  section.appendChild(heading);

  const status = document.createElement("p");
  status.className = "alliance-roster-status";
  status.setAttribute("role", "status");
  status.textContent = "Loading the latest roster…";
  section.appendChild(status);

  const groups = document.createElement("div");
  groups.className = "alliance-roster-groups";
  section.appendChild(groups);
  const eventsHeading = eventLinks.previousElementSibling;
  (eventsHeading || eventLinks).before(section);

  fetch("/Kingdom167/assets/data/leaderboards.json", { cache: "no-store" })
    .then(function (response) {
      if (!response.ok) throw new Error("Roster snapshot unavailable");
      return response.json();
    })
    .then(function (snapshot) {
      const roster = snapshot.alliances && snapshot.alliances[tag];
      const members = roster && Array.isArray(roster.members) ? roster.members : [];
      const order = ["R5", "R4", "R3", "R2", "R1"];
      groups.replaceChildren();

      order.forEach(function (rank) {
        const rankedMembers = members.filter(function (member) { return member.rank === rank; });
        if (!rankedMembers.length) return;

        const group = document.createElement("section");
        group.className = "alliance-roster-group";
        const title = document.createElement("h3");
        title.textContent = rank;
        const count = document.createElement("span");
        count.textContent = rankedMembers.length + (rankedMembers.length === 1 ? " MEMBER" : " MEMBERS");
        const groupHead = document.createElement("div");
        groupHead.className = "alliance-roster-group-head";
        groupHead.append(title, count);

        const grid = document.createElement("div");
        grid.className = "alliance-member-grid";
        rankedMembers.forEach(function (member) {
          const card = document.createElement("article");
          card.className = "alliance-member-card";
          const avatar = document.createElement("div");
          avatar.className = "alliance-member-avatar";
          const fallback = document.createElement("span");
          fallback.className = "alliance-member-fallback";
          fallback.textContent = (member.name || "?").trim().slice(0, 1).toUpperCase();
          avatar.appendChild(fallback);
          if (member.avatar_url) {
            const image = document.createElement("img");
            image.src = member.avatar_url;
            image.alt = "";
            image.loading = "lazy";
            image.referrerPolicy = "no-referrer";
            image.addEventListener("error", function () { image.remove(); });
            avatar.appendChild(image);
          }
          const name = document.createElement("span");
          name.className = "alliance-member-name";
          name.textContent = member.name || "Unknown governor";
          card.append(avatar, name);
          grid.appendChild(card);
        });
        group.append(groupHead, grid);
        groups.appendChild(group);
      });

      status.textContent = members.length
        ? members.length + " members · roster updated " + (snapshot.updated_at ? new Date(snapshot.updated_at).toLocaleString() : "recently")
        : "No member roster is available in the latest snapshot.";
    })
    .catch(function () {
      status.textContent = "Roster data is not available yet. It will appear after the MightPulse refresh runs.";
    });
})();
