const STORAGE_KEY = "portfolio-lang";
const DEFAULT_LANG = "ru";
const SUPPORTED_LANGS = ["ru", "en"];

const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navHome = siteNav.parentElement;
const navLinks = siteNav.querySelectorAll("a");
const langButtons = document.querySelectorAll("[data-lang]");

function isMobileNav() {
  return window.matchMedia("(max-width: 767px)").matches;
}

function mountMobileNav() {
  if (isMobileNav() && siteNav.parentElement !== document.body) {
    document.body.appendChild(siteNav);
  }
}

function unmountMobileNav() {
  if (siteNav.parentElement === document.body) {
    navHome.appendChild(siteNav);
  }
}

function getNested(obj, path) {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}

function detectLanguage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && SUPPORTED_LANGS.includes(saved)) {
    return saved;
  }

  const browserLang = navigator.language.slice(0, 2).toLowerCase();
  if (browserLang === "en") return "en";
  return DEFAULT_LANG;
}

function setLanguage(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) {
    lang = DEFAULT_LANG;
  }

  const t = translations[lang];
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const value = getNested(t, el.dataset.i18n);
    if (typeof value === "string") {
      el.textContent = value;
    }
  });

  document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    el.dataset.i18nAttr.split(";").forEach((pair) => {
      const [attr, key] = pair.split(":").map((part) => part.trim());
      const value = getNested(t, key);
      if (typeof value === "string") {
        el.setAttribute(attr, value);
      }
    });
  });

  document.querySelectorAll("[data-i18n-list]").forEach((list) => {
    const items = getNested(t, list.dataset.i18nList);
    if (Array.isArray(items)) {
      list.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
    }
  });

  document.querySelectorAll("[data-i18n-tags]").forEach((container) => {
    const tags = getNested(t, container.dataset.i18nTags);
    if (Array.isArray(tags)) {
      container.innerHTML = tags.map((tag) => `<span>${tag}</span>`).join("");
    }
  });

  document.querySelectorAll("[data-i18n-certs]").forEach((list) => {
    const downloadLabel = getNested(t, "education.certDownload");
    const downloadAria = getNested(t, "education.certDownloadAria");

    list.innerHTML = certificateItems
      .map((cert) => {
        const fileName = cert.file.split("/").pop();
        const ariaLabel =
          typeof downloadAria === "string"
            ? downloadAria.replace("{title}", cert.title)
            : cert.title;

        return `<li class="cert-item">
          <div class="cert-item__info">
            <span class="cert-year">${cert.year}</span>
            <span class="cert-item__title">${cert.title}</span>
          </div>
          <a class="cert-download" href="${cert.file}" download="${fileName}" aria-label="${ariaLabel}">
            <svg class="cert-download__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 3v12"/>
              <path d="m7 10 5 5 5-5"/>
              <path d="M5 21h14"/>
            </svg>
            <span>${downloadLabel}</span>
          </a>
        </li>`;
      })
      .join("");
  });

  const cvLink = document.querySelector("[data-i18n-cv]");
  if (cvLink && t.meta?.cvUrl) {
    cvLink.href = t.meta.cvUrl;
  }

  document.title = t.meta.title;
  const description = document.querySelector('meta[name="description"]');
  if (description) {
    description.content = t.meta.description;
  }

  langButtons.forEach((button) => {
    const isActive = button.dataset.lang === lang;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function closeNav() {
  navToggle.setAttribute("aria-expanded", "false");
  siteNav.classList.remove("is-open");
  document.body.style.overflow = "";
  unmountMobileNav();
}

navToggle.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";

  if (!isOpen && isMobileNav()) {
    mountMobileNav();
  }

  navToggle.setAttribute("aria-expanded", String(!isOpen));
  siteNav.classList.toggle("is-open", !isOpen);
  document.body.style.overflow = isOpen ? "" : "hidden";

  if (isOpen) {
    unmountMobileNav();
  }
});

window.addEventListener("resize", () => {
  if (!isMobileNav()) {
    closeNav();
  }
});

navLinks.forEach((link) => {
  link.addEventListener("click", closeNav);
});

langButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setLanguage(button.dataset.lang);
    closeNav();
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeNav();
  }
});

const sections = document.querySelectorAll("section[id]");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          link.style.color =
            link.getAttribute("href") === `#${entry.target.id}`
              ? "var(--text)"
              : "";
        });
      }
    });
  },
  { rootMargin: "-40% 0px -50% 0px" }
);

sections.forEach((section) => observer.observe(section));

setLanguage(detectLanguage());
