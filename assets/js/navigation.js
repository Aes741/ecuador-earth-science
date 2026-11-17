const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#site-navigation");

if (menuButton && navigation) {
  const closeMenu = () => {
    menuButton.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
  };

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    navigation.classList.toggle("is-open", !isOpen);
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) {
      closeMenu();
    }
  });
}

const musicPlayer = document.createElement("aside");
musicPlayer.className = "music-player";
musicPlayer.setAttribute("aria-label", "Andean instrumental music");
musicPlayer.innerHTML = `
  <audio id="background-music" loop preload="none">
    <source src="https://cdn.budgetpixel.com/audio-library/music/andean-folk-calm-mellow-pan-1kd300.wav" type="audio/wav">
  </audio>
  <button id="music-toggle" class="music-toggle" type="button" aria-pressed="false">
    <span aria-hidden="true">♫</span> <span id="music-label" aria-live="polite">Play Andean music</span>
  </button>
  <a href="https://budgetpixel.com/background-music/andean-mountain-breeze-03445ebb" target="_blank" rel="noreferrer">Andean Mountain Breeze · CC BY 4.0</a>
`;
document.body.appendChild(musicPlayer);

const music = musicPlayer.querySelector("#background-music");
const musicToggle = musicPlayer.querySelector("#music-toggle");
const musicLabel = musicPlayer.querySelector("#music-label");
music.volume = 0.22;

const loadPageWithoutReload = async (url, addHistoryEntry = true) => {
  document.body.setAttribute("aria-busy", "true");

  try {
    const response = await fetch(url.href);
    if (!response.ok) {
      throw new Error(`Page request failed with status ${response.status}.`);
    }

    const pageHtml = await response.text();
    const nextDocument = new DOMParser().parseFromString(pageHtml, "text/html");
    const nextMain = nextDocument.querySelector("main");
    if (!nextMain) {
      throw new Error("The requested page does not contain a main content region.");
    }

    document.querySelector("main").replaceWith(nextMain);
    document.title = nextDocument.title;
    document.querySelectorAll("#site-navigation a").forEach((navLink) => {
      navLink.removeAttribute("aria-current");
      if (new URL(navLink.href, window.location.href).pathname === url.pathname) {
        navLink.setAttribute("aria-current", "page");
      }
    });

    if (addHistoryEntry) {
      window.history.pushState({ page: url.href }, "", url.href);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    closeMenuIfAvailable();
  } catch (error) {
    console.error("Unable to load the page without restarting the music.", error);
    window.location.href = url.href;
  } finally {
    document.body.removeAttribute("aria-busy");
  }
};

const closeMenuIfAvailable = () => {
  if (menuButton && navigation) {
    menuButton.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
  }
};

document.querySelectorAll("a[href]").forEach((link) => {
  link.addEventListener("click", (event) => {
    const url = new URL(link.href, window.location.href);
    const isInternalPage = url.origin === window.location.origin
      && url.pathname.endsWith(".html")
      && !(url.pathname === window.location.pathname && url.hash)
      && !link.target
      && !event.metaKey
      && !event.ctrlKey
      && !event.shiftKey
      && !event.altKey;

    if (isInternalPage) {
      event.preventDefault();
      loadPageWithoutReload(url);
    }
  });
});

window.addEventListener("popstate", () => {
  loadPageWithoutReload(new URL(window.location.href), false);
});

musicToggle.addEventListener("click", async () => {
  if (music.paused) {
    try {
      await music.play();
      musicToggle.setAttribute("aria-pressed", "true");
      musicLabel.textContent = "Pause Andean music";
    } catch (error) {
      musicLabel.textContent = "Music unavailable";
      console.error("Unable to play the Andean music track.", error);
    }
  } else {
    music.pause();
    musicToggle.setAttribute("aria-pressed", "false");
    musicLabel.textContent = "Play Andean music";
  }
});
