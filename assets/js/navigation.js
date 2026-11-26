/* navigation.js v8 - INJECTS topbar-simple + rail. Pages do NOT contain <header class="topbar-simple"> any more. */
/* KEEP THIS VERSION - has KvK Season 23 + topbar injection. */
(function () {
  /* ---- EDIT THIS ONE LINE to change the subtitle on EVERY page ---- */
  var SUBTITLE = "THE MISFITS"; // was "THE DIRTYBOB REALM" on older pages
  var home = "/Kingdom167/Home/";

  /* ---------- 1. INJECT TOPBAR-SIMPLE (if page doesn't already have one) ---------- */
  /* Pages are now just: <div class="shell" id="top"><main>...</main></div> */
  /* If a page still has the old copy-pasted header, we leave it alone - no double topbar. */
  var shell = document.querySelector(".shell");
  var existingTopbar = document.querySelector(".topbar-simple") || document.querySelector(".topbar");
  if (shell && !existingTopbar) {
    var header = document.createElement("header");
    header.className = "topbar-simple";
    header.innerHTML =
      '<div class="topbar-simple-inner topbar-inner">' +
        '<button class="top-icon-btn" type="button" disabled title="Language - coming soon" aria-label="Change language - coming soon"><span aria-hidden="true">\uD83C\uDF10</span></button>' +
        '<a class="brand-simple" href="' + home + '"><span class="brand-simple-name">KINGDOM 167</span><small>' + SUBTITLE + '</small></a>' +
        '<div class="topbar-simple-actions">' +
          '<button class="btn-login" type="button" disabled title="Log in / Register - coming soon"><span aria-hidden="true">\u25C7</span> Log In / Register</button>' +
          '<button class="btn-discord" type="button" disabled title="Sign in with Discord - coming soon"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19.5 5.3A16.3 16.3 0 0 0 15.4 4l-.5 1a14.2 14.2 0 0 0-5.8 0l-.5-1a16.5 16.5 0 0 0-4.1 1.3C1.9 9.2 1.2 13 1.5 16.7A16.7 16.7 0 0 0 6.6 19l1.2-1.7a10.7 10.7 0 0 1-1.9-.9l.5-.4c3.7 1.7 7.6 1.7 11.2 0l.5.4c-.6.4-1.2.7-1.9.9l1.2 1.7a16.5 16.5 0 0 0 5.1-2.3c.4-4.4-.7-8.2-3-11.4ZM8.7 14.5c-1.1 0-2-1-2-2.2s.9-2.2 2-2.2 2 1 2 2.2-.9 2.2-2 2.2Zm6.6 0c-1.1 0-2-1-2-2.2s.9-2.2 2-2.2 2 1 2 2.2-.9 2.2-2 2.2Z"/></svg> SIGN IN</button>' +
        '</div>' +
      '</div>';
    /* First child of .shell = above <main>, below nothing else. Live-bar.js then inserts AFTER this header. */
    shell.insertAdjacentElement("afterbegin", header);
  }

  /* ---------- 2. RAIL (unchanged, still injected) ---------- */
  var items = [
    { label: "Home", icon: "\u2302", href: home, key: "home" },
    { label: "Alliances", icon: "\u265C", href: "/Kingdom167/Alliances/", key: "alliances" },
    { label: "Transfer Application", icon: "\u21E2", href: "/Kingdom167/TransferApplication/", key: "transfer" },
    { label: "Member Portal", icon: "\u2659", href: "/Kingdom167/MemberPortal/", key: "portal" },
    { label: "Rankings", icon: "\u265C", href: "/Kingdom167/Rankings/", key: "rankings" },
    { label: "Swordland Summit", short: "Swordland", icon: "\u2694", href: "/Kingdom167/SwordlandSummit/", key: "swordland" },
    { label: "Alliance Brawl", icon: "\u2662", href: "/Kingdom167/AllianceBrawl/", key: "brawl" },
    { label: "Prep Week", icon: "\u25A4", href: "/Kingdom167/PrepWeek/", key: "prep" },
    { label: "Sanctuaries", icon: "\u265C", href: "/Kingdom167/Sanctuaries/", key: "sanctuaries" },
    { label: "Flame Dragon Tyrant", short: "Dragon Tyrant", icon: "\u2668", href: "/Kingdom167/FlameDragonTyrant/", key: "dragon" },
    { label: "KvK Themes", icon: "\u2727", href: "/Kingdom167/KvKThemes/", key: "themes" },
    { label: "KvK Season 23", short: "KvK Season 23", icon: "\u2694", href: "/Kingdom167/KvK/", key: "kvk" },
    { label: "Event Calendar", icon: "\u25A6", href: "/Kingdom167/EventCalendar/", key: "calendar" },
    { label: "KvK Command Board", short: "KvK Board", icon: "\u2691", href: "/Kingdom167/KvKCommandBoard/", key: "command" },
    { label: "Recognition Board", short: "Recognition", icon: "\u2605", href: "/Kingdom167/RecognitionBoard/", key: "recognition" },
    { label: "Resource Library", short: "Resources", icon: "\u25A4", href: "/Kingdom167/ResourceLibrary/", key: "resources" },
    { label: "Announcements", icon: "\u2709", href: "/Kingdom167/Announcements/", key: "announcements" },
    { label: "Event Rosters", icon: "\u265F", href: "/Kingdom167/EventRosters/", key: "rosters" },
    { label: "Contact Us", icon: "\u2709", href: "/Kingdom167/ContactUs/", key: "contact" },
    { label: "Gift Code Redemption", short: "Gift Codes", icon: "\u2727", href: "/Kingdom167/GiftCode/", key: "giftcode" },
    { label: "Kingdom Directory", short: "Directory", icon: "\u25CE", href: "/Kingdom167/KingdomDirectory/", key: "directory" },
    { label: "Pocket Holdout", short: "Pocket Holdout", icon: "\u270A", href: "/Kingdom167/PocketHoldout/", key: "pocket" },
    { label: "Rules & FAQ", short: "Rules & FAQ", icon: "\u2756", href: "/Kingdom167/RulesFAQ/", key: "rules" }
  ];
  function railMarkup(intro) {
    var links = items.map(function (item) {
      if (intro && item.key !== "home") return '<span class="rail-link is-disabled" aria-disabled="true"><span class="rail-icon" aria-hidden="true">' + item.icon + '</span><span>' + (item.short || item.label) + '</span></span>';
      return '<a class="rail-link" data-rail-key="' + item.key + '" href="' + item.href + '" aria-label="' + item.label + '"><span class="rail-icon" aria-hidden="true">' + item.icon + '</span><span>' + (item.short || item.label) + '</span></a>';
    }).join("");
    return '<aside class="kingdom-rail" aria-label="Kingdom navigation"><a class="rail-brand" href="' + home + '" aria-label="Kingdom 167 command centre"><span class="rail-crest" aria-hidden="true"><span>K</span><b>167</b><i>\u265B</i></span><span class="rail-brand-name">KINGDOM 167<small>' + SUBTITLE + '</small></span></a><nav class="rail-nav" aria-label="Kingdom pages">' + links + '</nav><div class="rail-footer"><span class="rail-status-dot"></span><span>KINGDOM ONLINE</span></div></aside>';
  }
  function toggleMarkup() { return '<button class="nav-toggle" type="button" aria-label="Open kingdom menu" aria-expanded="false" aria-controls="kingdom-navigation"><span aria-hidden="true">\u2630</span></button>'; }
  var intro = document.body.classList.contains("kingdom-intro");
  var rail = document.querySelector(".kingdom-rail");
  if (!rail && document.body.classList.contains("site-with-rail")) { document.body.insertAdjacentHTML("afterbegin", railMarkup(false)); rail = document.querySelector(".kingdom-rail"); }
  if (!rail) return; rail.id = "kingdom-navigation";
  if (!intro) { var topbarInner = document.querySelector(".topbar-inner"); if (topbarInner && !topbarInner.querySelector(".nav-toggle")) topbarInner.insertAdjacentHTML("afterbegin", toggleMarkup()); }
  var toggle = document.querySelector(".nav-toggle");
  var backdrop = document.createElement("button"); backdrop.className = "rail-backdrop"; backdrop.type = "button"; backdrop.setAttribute("aria-label", "Close kingdom menu"); document.body.appendChild(backdrop);
  var path = window.location.pathname.replace(/\/$/, "") || "/"; var hash = window.location.hash; var activeKey = "";
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
  else if (path.indexOf("/KvK/") !== -1) activeKey = "kvk";
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
  var activeLink = rail.querySelector('[data-rail-key="' + activeKey + '"]');
  if (activeLink) { activeLink.classList.add("is-active"); activeLink.setAttribute("aria-current", "page"); }
  function closeMenu() { document.body.classList.remove("nav-open"); var layout = document.querySelector(".intro-layout"); if (layout) layout.classList.remove("nav-open"); if (toggle) { toggle.setAttribute("aria-expanded", "false"); toggle.setAttribute("aria-label", "Open kingdom menu"); var icon = toggle.querySelector("span"); if (icon) icon.textContent = "\u2630"; } }
  function openMenu() { document.body.classList.add("nav-open"); var layout = document.querySelector(".intro-layout"); if (layout) layout.classList.add("nav-open"); if (toggle) { toggle.setAttribute("aria-expanded", "true"); toggle.setAttribute("aria-label", "Close kingdom menu"); var icon = toggle.querySelector("span"); if (icon) icon.textContent = "\u00D7"; } }
  if (toggle) toggle.addEventListener("click", function () { if (document.body.classList.contains("nav-open")) closeMenu(); else openMenu(); });
  backdrop.addEventListener("click", closeMenu);
  document.addEventListener("keydown", function (event) { if (event.key === "Escape") closeMenu(); });
  rail.addEventListener("click", function (event) { if (event.target.closest("a")) closeMenu(); });
})();
