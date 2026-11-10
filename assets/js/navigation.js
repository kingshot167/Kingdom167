/* Shared navigation for every Kingdom 167 page. */
(function () {
  const home = "/Kingdom167/Home/";
  const items = [
    { label: "Home", icon: "⌂", href: home, key: "home" },
    { label: "Alliances", icon: "♜", href: "/Kingdom167/Alliances/", key: "alliances" },
    { label: "Transfer Application", icon: "⇢", href: "/Kingdom167/TransferApplication/", key: "transfer" },
    { label: "Member Portal", icon: "♙", href: "/Kingdom167/MemberPortal/", key: "portal" },
    { label: "Rankings", icon: "♜", href: "/Kingdom167/Rankings/", key: "rankings" },
    { label: "Swordland Summit", short: "Swordland", icon: "⚔", href: "/Kingdom167/SwordlandSummit/", key: "swordland" },
    { label: "Alliance Brawl", icon: "♢", href: "/Kingdom167/AllianceBrawl/", key: "brawl" },
    { label: "Prep Week", icon: "▤", href: "/Kingdom167/PrepWeek/", key: "prep" },
    { label: "Sanctuaries", icon: "♜", href: "/Kingdom167/Sanctuaries/", key: "sanctuaries" },
    { label: "Flame Dragon Tyrant", short: "Dragon Tyrant", icon: "♨", href: "/Kingdom167/FlameDragonTyrant/", key: "dragon" },
    { label: "KvK Themes", icon: "✧", href: "/Kingdom167/KvKThemes/", key: "themes" },
    { label: "Event Calendar", icon: "▦", href: "/Kingdom167/EventCalendar/", key: "calendar" },
    { label: "KvK Command Board", short: "KvK Board", icon: "⚑", href: "/Kingdom167/KvKCommandBoard/", key: "command" },
    { label: "Recognition Board", short: "Recognition", icon: "★", href: "/Kingdom167/RecognitionBoard/", key: "recognition" },
    { label: "Resource Library", short: "Resources", icon: "▤", href: "/Kingdom167/ResourceLibrary/", key: "resources" },
    { label: "Announcements", icon: "✉", href: "/Kingdom167/Announcements/", key: "announcements" },
    { label: "Event Rosters", icon: "♟", href: "/Kingdom167/EventRosters/", key: "rosters" },
    { label: "Contact Us", icon: "✉", href: "/Kingdom167/ContactUs/", key: "contact" },
    { label: "Gift Code Redemption", short: "Gift Codes", icon: "✧", href: "/Kingdom167/GiftCode/", key: "giftcode" },
    { label: "Kingdom Directory", short: "Directory", icon: "◎", href: "/Kingdom167/KingdomDirectory/", key: "directory" },
    { label: "Pocket Holdout", short: "Pocket Holdout", icon: "✊", href: "/Kingdom167/PocketHoldout/", key: "pocket" },
    { label: "Rules & FAQ", short: "Rules & FAQ", icon: "❖", href: "/Kingdom167/RulesFAQ/", key: "rules" }
  ];

  function railMarkup(intro) {
    const links = items.map(function (item) {
      if (intro && item.key !== "home") {
        return '<span class="rail-link is-disabled" aria-disabled="true"><span class="rail-icon" aria-hidden="true">' + item.icon + '</span><span>' + (item.short || item.label) + '</span></span>';
      }
      return '<a class="rail-link" data-rail-key="' + item.key + '" href="' + item.href + '" aria-label="' + item.label + '"><span class="rail-icon" aria-hidden="true">' + item.icon + '</span><span>' + (item.short || item.label) + '</span></a>';
    }).join("");

    return '<aside class="kingdom-rail" aria-label="Kingdom navigation">' +
      '<a class="rail-brand" href="' + home + '" aria-label="Kingdom 167 command centre">' +
      '<span class="rail-crest" aria-hidden="true"><span>K</span><b>167</b><i>♛</i></span>' +
      '<span class="rail-brand-name">KINGDOM 167<small>THE DIRTYBOB REALM</small></span></a>' +
      '<nav class="rail-nav" aria-label="Kingdom pages">' + links + '</nav>' +
      '<div class="rail-footer"><span class="rail-status-dot"></span><span>KINGDOM ONLINE</span></div></aside>';
  }

  function toggleMarkup() {
    return '<button class="nav-toggle" type="button" aria-label="Open kingdom menu" aria-expanded="false" aria-controls="kingdom-navigation"><span aria-hidden="true">☰</span></button>';
  }

  const intro = document.body.classList.contains("kingdom-intro");
  let rail = document.querySelector(".kingdom-rail");

  if (!rail && document.body.classList.contains("site-with-rail")) {
    document.body.insertAdjacentHTML("afterbegin", railMarkup(false));
    rail = document.querySelector(".kingdom-rail");
  }

  if (!rail) return;
  rail.id = "kingdom-navigation";

  if (!intro) {
    const topbar = document.querySelector(".topbar-inner");
    if (topbar && !topbar.querySelector(".nav-toggle")) topbar.insertAdjacentHTML("afterbegin", toggleMarkup());
  }

  const toggle = document.querySelector(".nav-toggle");
  const backdrop = document.createElement("button");
  backdrop.className = "rail-backdrop";
  backdrop.type = "button";
  backdrop.setAttribute("aria-label", "Close kingdom menu");
  document.body.appendChild(backdrop);

  const path = window.location.pathname.replace(/\/$/, "") || "/";
  const hash = window.location.hash;
  let activeKey = "";
  if (path === "/Kingdom167" || path === "/Kingdom167/Home") activeKey = hash === "#alliances" ? "alliances" : "home";
  else if (path.indexOf("/Alliances") !== -1) activeKey = "alliances";
  else if (path.indexOf("TransferApplication") !== -1) activeKey = "transfer";
  else if (path.indexOf("MemberPortal") !== -1) activeKey = "portal";
  else if (path.indexOf("Rankings") !== -1) activeKey = "rankings";
  else if (path.indexOf("SwordlandSummit") !== -1) activeKey = "swordland";
  else if (path.indexOf("AllianceBrawl") !== -1) activeKey = "brawl";
  else if (path.indexOf("PrepWeek") !== -1) activeKey = "prep";
  else if (path.indexOf("Sanctuaries") !== -1) activeKey = "sanctuaries";
  else if (path.indexOf("FlameDragonTyrant") !== -1) activeKey = "dragon";
  else if (path.indexOf("KvKThemes") !== -1) activeKey = "themes";
  else if (path.indexOf("EventCalendar") !== -1) activeKey = "calendar";
  else if (path.indexOf("KvKCommandBoard") !== -1) activeKey = "command";
  else if (path.indexOf("RecognitionBoard") !== -1) activeKey = "recognition";
  else if (path.indexOf("ResourceLibrary") !== -1) activeKey = "resources";
  else if (path.indexOf("Announcements") !== -1) activeKey = "announcements";
  else if (path.indexOf("EventRosters") !== -1) activeKey = "rosters";
  else if (path.indexOf("ContactUs") !== -1) activeKey = "contact";
  else if (path.indexOf("GiftCode") !== -1) activeKey = "giftcode";
  else if (path.indexOf("KingdomDirectory") !== -1) activeKey = "directory";
  else if (path.indexOf("PocketHoldout") !== -1) activeKey = "pocket";
  else if (path.indexOf("RulesFAQ") !== -1) activeKey = "rules";
  const activeLink = rail.querySelector('[data-rail-key="' + activeKey + '"]');
  if (activeLink) {
    activeLink.classList.add("is-active");
    activeLink.setAttribute("aria-current", "page");
  }

  function closeMenu() {
    document.body.classList.remove("nav-open");
    const layout = document.querySelector(".intro-layout");
    if (layout) layout.classList.remove("nav-open");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open kingdom menu");
      const icon = toggle.querySelector("span");
      if (icon) icon.textContent = "☰";
    }
  }

  function openMenu() {
    document.body.classList.add("nav-open");
    const layout = document.querySelector(".intro-layout");
    if (layout) layout.classList.add("nav-open");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close kingdom menu");
      const icon = toggle.querySelector("span");
      if (icon) icon.textContent = "×";
    }
  }

  if (toggle) toggle.addEventListener("click", function () {
    if (document.body.classList.contains("nav-open")) closeMenu();
    else openMenu();
  });
  backdrop.addEventListener("click", closeMenu);
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeMenu();
  });
  rail.addEventListener("click", function (event) {
    if (event.target.closest("a")) closeMenu();
  });
})();
