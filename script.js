(() => {
  const nav = document.querySelector(".site-nav");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  const internalLinks = [
    ...document.querySelectorAll('.nav-links a[href^="#"]'),
  ];
  const year = document.querySelector("#current-year");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  const updateNavigationSurface = () => {
    nav?.classList.toggle("scrolled", window.scrollY > 18);
  };

  updateNavigationSurface();
  window.addEventListener("scroll", updateNavigationSurface, { passive: true });

  const closeNavigation = () => {
    navToggle?.setAttribute("aria-expanded", "false");
    navLinks?.classList.remove("open");
    document.body.classList.remove("nav-open");
  };

  navToggle?.addEventListener("click", () => {
    const willOpen = navToggle.getAttribute("aria-expanded") !== "true";
    navToggle.setAttribute("aria-expanded", String(willOpen));
    navLinks?.classList.toggle("open", willOpen);
    document.body.classList.toggle("nav-open", willOpen);
  });

  internalLinks.forEach((link) =>
    link.addEventListener("click", closeNavigation),
  );

  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) {
      closeNavigation();
    }
  });

  const reveals = document.querySelectorAll(".reveal");

  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    reveals.forEach((element) => element.classList.add("visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px" },
    );

    reveals.forEach((element) => revealObserver.observe(element));
  }

  const observedSections = [...document.querySelectorAll("main section[id]")];

  if ("IntersectionObserver" in window && observedSections.length) {
    const activeSectionObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visibleEntry) return;

        internalLinks.forEach((link) => {
          const isCurrent =
            link.getAttribute("href") === `#${visibleEntry.target.id}`;
          if (isCurrent) {
            link.setAttribute("aria-current", "true");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      },
      { threshold: [0.25, 0.45, 0.65], rootMargin: "-18% 0px -58%" },
    );

    observedSections.forEach((section) =>
      activeSectionObserver.observe(section),
    );
  }

  const canvas = document.querySelector("#matrix");

  if (!canvas || reduceMotion.matches) return;

  const context = canvas.getContext("2d");
  if (!context) return;

  const characters = "01";
  const fontSize = 15;
  let columns = 0;
  let drops = [];
  let animationFrame = null;
  let lastFrame = 0;

  const resizeCanvas = () => {
    const bounds = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.max(1, Math.floor(bounds.width * ratio));
    canvas.height = Math.max(1, Math.floor(bounds.height * ratio));
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    columns = Math.ceil(bounds.width / fontSize);
    drops = Array.from({ length: columns }, () => Math.random() * -45);
  };

  const drawMatrix = (timestamp) => {
    animationFrame = window.requestAnimationFrame(drawMatrix);
    if (document.hidden || timestamp - lastFrame < 62) return;
    lastFrame = timestamp;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    context.fillStyle = "rgba(5, 10, 18, 0.09)";
    context.fillRect(0, 0, width, height);
    context.fillStyle = "rgba(103, 242, 179, 0.72)";
    context.font = `${fontSize}px SFMono-Regular, Consolas, monospace`;

    for (let index = 0; index < drops.length; index += 1) {
      const character =
        characters[Math.floor(Math.random() * characters.length)];
      context.fillText(character, index * fontSize, drops[index] * fontSize);

      if (drops[index] * fontSize > height && Math.random() > 0.978) {
        drops[index] = Math.random() * -18;
      }

      drops[index] += 0.72;
    }
  };

  resizeCanvas();
  animationFrame = window.requestAnimationFrame(drawMatrix);

  let resizeTimer;
  window.addEventListener(
    "resize",
    () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resizeCanvas, 120);
    },
    { passive: true },
  );

  reduceMotion.addEventListener?.("change", (event) => {
    if (!event.matches) return;
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    canvas.style.display = "none";
  });
})();
