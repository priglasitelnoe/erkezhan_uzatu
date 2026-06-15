const eventDate = new Date("2026-07-15T17:00:00+05:00");
const phone = "77762019595";
const musicStartAt = 29;
const music = document.getElementById("wedding-music");
const musicToggle = document.querySelector(".music-toggle");

const pad = (value) => String(value).padStart(2, "0");

function setMusicStart(force = false) {
  if (!music || Number.isNaN(music.duration)) return;

  if (force || music.currentTime < musicStartAt - 0.5) {
    music.currentTime = musicStartAt;
  }
}

function syncMusicButton() {
  if (!musicToggle || !music) return;

  musicToggle.classList.toggle("is-paused", music.paused);
  musicToggle.textContent = music.paused ? "♪" : "♫";
}

async function playMusicFromStartPoint() {
  if (!music) return;

  if (music.readyState >= 1) {
    setMusicStart();
  }

  try {
    await music.play();
    musicToggle?.classList.remove("needs-tap");
  } catch {
    musicToggle?.classList.add("needs-tap", "is-paused");
  } finally {
    syncMusicButton();
  }
}

if (music) {
  music.addEventListener("loadedmetadata", () => {
    setMusicStart(true);
    playMusicFromStartPoint();
  });

  music.addEventListener("canplay", () => {
    setMusicStart();
  });

  music.addEventListener("timeupdate", () => {
    if (!music.paused && music.currentTime > 0 && music.currentTime < musicStartAt - 0.5) {
      setMusicStart(true);
    }
  });

  music.addEventListener("ended", () => {
    setMusicStart(true);
    playMusicFromStartPoint();
  });

  music.addEventListener("play", syncMusicButton);
  music.addEventListener("pause", syncMusicButton);

  playMusicFromStartPoint();

  function unlockMusic(event) {
    if (event.target.closest?.(".music-toggle")) return;
    playMusicFromStartPoint();
  }

  ["pointerdown", "keydown", "touchstart"].forEach((eventName) => {
    document.addEventListener(eventName, unlockMusic, { once: true });
  });
}

musicToggle?.addEventListener("click", () => {
  if (!music) return;

  if (music.paused) {
    playMusicFromStartPoint();
  } else {
    music.pause();
  }
});

function updateCountdown() {
  const now = new Date();
  const distance = Math.max(0, eventDate.getTime() - now.getTime());

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  document.getElementById("days").textContent = pad(days);
  document.getElementById("hours").textContent = pad(hours);
  document.getElementById("minutes").textContent = pad(minutes);
  document.getElementById("seconds").textContent = pad(seconds);
}

updateCountdown();
setInterval(updateCountdown, 1000);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.28 },
);

document.querySelectorAll(".reveal").forEach((item) => {
  revealObserver.observe(item);
});

const sections = [...document.querySelectorAll(".screen")];
const dots = [...document.querySelectorAll(".dots a")];

const dotObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const activeIndex = sections.indexOf(entry.target);
      dots.forEach((dot, index) => {
        dot.classList.toggle("is-active", index === activeIndex);
      });
    });
  },
  { threshold: 0.58 },
);

sections.forEach((section) => dotObserver.observe(section));

document.getElementById("rsvp-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const form = new FormData(event.currentTarget);
  const guestName = String(form.get("guestName") || "").trim();
  const guestCount = String(form.get("guestCount") || "").trim();
  const attendance = String(form.get("attendance") || "Келемін");

  const lines = [
    "Сәлеметсіз бе!",
    `Еркежанның ұзату тойына жауабым: ${attendance}.`,
  ];

  if (guestName) {
    lines.push(`Аты-жөнім: ${guestName}.`);
  }

  if (guestCount) {
    lines.push(`Келетін адам саны: ${guestCount}.`);
  }

  window.location.href = `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
});
