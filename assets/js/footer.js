FOOTER v1 - shared injected footer (same pattern as topbar)
- footer.css -> /Kingdom167/assets/css/footer.css (or /assets/css/footer.css on Cloudflare)
- footer.js  -> /Kingdom167/assets/js/footer.js
Add to every page:
  In <head> after navigation.css: <link rel="stylesheet" href="/Kingdom167/assets/css/footer.css">
  Before </body> after navigation.js: <script src="/Kingdom167/assets/js/footer.js" defer></script>
Then DELETE the old <footer>...</footer> block from each page - JS injects the new one inside .shell.
Base-aware: uses /Kingdom167/ on GitHub Pages, / on Cloudflare/custom domain (same fix as rankings.js).
To change links/subtitle/year: edit footer.js once - changes every page.
