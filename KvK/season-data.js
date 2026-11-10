/*
 * SEASON DATA ONLY: copy this file's object for the next season and update
 * the values. K167 is fixed; update opponent.kid for a new matchup. The daily
 * MightPulse refresh fills kingdom names and banner_url values for both IDs.
 * Layout and styling live in assets/js/kvk-page.js and assets/css/kvk.css.
 */
window.KVK_HOME_KINGDOM = Object.freeze({
  kid: 167,
  name: "Kingdom 167"
});

window.KVK_SEASON = {
  season: 23,
  // Update this kingdom object for each matchup. The home kingdom above is fixed.
  opponent: { kid: 154, name: "Kingdom 154" },
  snapshot: [
    { label: "Active players", home: 1168, away: 849 },
    { label: "Governor power", home: 60.75, away: 54.56, suffix: "B", decimals: 2 },
    { label: "Governor kills", home: 7.64, away: 6.06, suffix: "B", decimals: 2 },
    { label: "Troop power", home: 41.86, away: 36.37, suffix: "B", decimals: 2 },
    { label: "Migrant score", home: 173.9, away: 158.1, suffix: "M", decimals: 1 },
    { label: "Mystic trial", home: 242.6, away: 228.9, suffix: "K", decimals: 1 }
  ],
  prep: {
    homeTotal: 6587573328,
    awayTotal: 4181292849,
    days: [
      { label: "I", home: 1511865110, away: 1092631330, status: "Ended" },
      { label: "II", home: 1308462174, away: 814080906, status: "Ended" },
      { label: "III", home: 994502617, away: 564168612, status: "Ended" },
      { label: "IV", home: 1635420211, away: 938166551, status: "Ended" },
      { label: "V", home: 1137323216, away: 772245450, status: "Ended" }
    ]
  },
  castleRecord: { taken: 8, lost: 2 },
  history: [
    { date: "8 Nov 2026", opponent: "K154", prep: "Won", prepScore: "6.59B – 4.18B", castle: "Won" },
    { date: "11 Oct 2026", opponent: "K151", prep: "Won", prepScore: "7.48B – 6.90B", castle: "Lost" },
    { date: "12 Sep 2026", opponent: "K200", prep: "Won", castle: "Won" },
    { date: "15 Aug 2026", opponent: "K146", prep: "Lost", castle: "Held" },
    { date: "18 Jul 2026", opponent: "K268", prep: "Won", castle: "Won" },
    { date: "20 Jun 2026", opponent: "K396", prep: "Won", castle: "Won" },
    { date: "23 May 2026", opponent: "K108", prep: "Won", castle: "Lost" },
    { date: "25 Apr 2026", opponent: "K5", prep: "Won", castle: "Won" },
    { date: "28 Mar 2026", opponent: "K87", prep: "Won", castle: "Lost" },
    { date: "28 Feb 2026", opponent: "K188", prep: "Won", castle: "Won" },
    { date: "31 Jan 2026", opponent: "K120", prep: "Won", castle: "Won" },
    { date: "3 Jan 2026", opponent: "K151", prep: "Won", castle: "Lost" },
    { date: "6 Dec 2025", opponent: "K127", prep: "Won", castle: "Lost" },
    { date: "8 Nov 2025", opponent: "K134", prep: "Lost", castle: "Held" },
    { date: "11 Oct 2025", opponent: "K154", prep: "Lost", castle: "Lost" },
    { date: "13 Sep 2025", opponent: "K136", prep: "Lost", castle: "Lost" },
    { date: "16 Aug 2025", opponent: "K146", prep: "Won", castle: "Won" },
    { date: "19 Jul 2025", opponent: "K157", prep: "Won", castle: "Lost" }
  ]
};
