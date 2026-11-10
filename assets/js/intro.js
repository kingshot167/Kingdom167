// Controls the one-time landscape reveal on the Kingdom 167 entry page.
(function () {
  const page = document.documentElement;
  const skipButton = document.getElementById("skip-intro");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const seenKey = "k167-intro-seen";

  function finishIntro() {
    page.classList.remove("intro-playing");
    page.classList.add("intro-revealed");

    try {
      window.sessionStorage.setItem(seenKey, "true");
    } catch (error) {
      // The intro still works when browser storage is unavailable.
    }
  }

  let alreadySeen = false;
  try {
    alreadySeen = window.sessionStorage.getItem(seenKey) === "true";
  } catch (error) {
    // Storage is optional; show the intro normally when it cannot be read.
  }

  if (reducedMotion.matches || alreadySeen) {
    finishIntro();
  } else {
    window.setTimeout(finishIntro, 4700);
  }

  if (skipButton) {
    skipButton.addEventListener("click", finishIntro);
  }
})();
