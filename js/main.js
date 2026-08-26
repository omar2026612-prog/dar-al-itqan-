/* =========================================================
   دار الإتقان — Main JS
   يبني الهيدر والفوتر وزر واتساب من config.js تلقائياً
   ========================================================= */
(function () {
  const LANG = localStorage.getItem("itqan_lang") || "ar";
  document.documentElement.lang = LANG === "ar" ? "ar" : "en";
  document.documentElement.dir = LANG === "ar" ? "rtl" : "ltr";

  const t = (obj) => (obj && typeof obj === "object" ? obj[LANG] || obj.ar : obj);

  /* ---------- الشريط المتحرك ---------- */
  function renderTicker() {
    const el = document.getElementById("site-header");
    if (!el) return;
    const text = t(SITE_CONFIG.tickerText);
    if (!text || !text.trim()) return;
    const sep = "&nbsp;&nbsp;•&nbsp;&nbsp;";
    const item = text.trim();
    // نكرر النص عدة مرات في مسار واحد طويل لضمان تعبئة الشاشة وحلقة تمرير سلسة بلا فراغات
    const track = Array(8).fill(item).join(sep);
    const wrap = document.createElement("div");
    wrap.className = "site-ticker";
    wrap.innerHTML = `<div class="ticker-track"><span>${track}${sep}</span><span aria-hidden="true">${track}${sep}</span></div>`;
    el.insertAdjacentElement("beforebegin", wrap);
    document.body.classList.add("has-ticker");
  }

  /* ---------- Header ---------- */
  function renderHeader() {
    const el = document.getElementById("site-header");
    if (!el) return;
    const current = document.body.dataset.page;
    const navHtml = SITE_CONFIG.nav
      .map(
        (n) =>
          `<a href="${n.href}" class="${current === n.key ? "is-active" : ""}">${t(n)}</a>`
      )
      .join("");

    el.innerHTML = `
      <header class="site-header" id="siteHeader">
        <div class="container">
          <a href="index.html" class="brand">
            <span class="brand-ar">${SITE_CONFIG.companyName.ar}</span>
            <span class="brand-en">${SITE_CONFIG.companyName.en}</span>
          </a>
          <nav class="nav-list" aria-label="التنقل الرئيسي">${navHtml}</nav>
          <div class="header-cta">
            <button class="lang-toggle" id="langToggle">${LANG === "ar" ? "EN" : "AR"}</button>
            <a class="btn btn--primary" href="contact.html">${LANG === "ar" ? "اطلب استشارتك" : "Get a Consultation"}</a>
          </div>
          <button class="nav-toggle" id="navToggle" aria-label="فتح القائمة" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>
      <div class="mobile-menu" id="mobileMenu">
        <button class="mm-close" id="mmClose" aria-label="إغلاق القائمة">&times;</button>
        ${SITE_CONFIG.nav.map((n) => `<a href="${n.href}">${t(n)}</a>`).join("")}
        <a class="btn btn--primary" style="width:fit-content" href="contact.html">${LANG === "ar" ? "اطلب استشارتك" : "Get a Consultation"}</a>
      </div>
    `;

    const header = document.getElementById("siteHeader");
    window.addEventListener("scroll", () => {
      header.classList.toggle("is-scrolled", window.scrollY > 40);
    });

    const navToggle = document.getElementById("navToggle");
    const mobileMenu = document.getElementById("mobileMenu");
    const mmClose = document.getElementById("mmClose");
    navToggle.addEventListener("click", () => {
      mobileMenu.classList.add("is-open");
      navToggle.setAttribute("aria-expanded", "true");
    });
    mmClose.addEventListener("click", () => {
      mobileMenu.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
    mobileMenu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => mobileMenu.classList.remove("is-open"))
    );

    document.getElementById("langToggle").addEventListener("click", () => {
      localStorage.setItem("itqan_lang", LANG === "ar" ? "en" : "ar");
      location.reload();
    });
  }

  /* ---------- Footer ---------- */
  function renderFooter() {
    const el = document.getElementById("site-footer");
    if (!el) return;
    const year = new Date().getFullYear();
    el.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <span class="brand-ar" style="font-size:24px;color:var(--ivory);font-family:var(--font-display)">${SITE_CONFIG.companyName.ar}</span>
              <p>${t(SITE_CONFIG.shortDescription)}</p>
              <div class="social-row">
                ${SITE_CONFIG.social.facebook ? `<a href="${SITE_CONFIG.social.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${icon("fb")}</a>` : ""}
                ${SITE_CONFIG.social.instagram && !SITE_CONFIG.social.instagram.startsWith("[") ? `<a href="${SITE_CONFIG.social.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${icon("ig")}</a>` : ""}
                <a href="${getWhatsAppLink()}" target="_blank" rel="noopener" aria-label="WhatsApp">${icon("wa")}</a>
              </div>
            </div>
            <div>
              <h5>${LANG === "ar" ? "روابط سريعة" : "Quick Links"}</h5>
              <ul>${SITE_CONFIG.nav.map((n) => `<li><a href="${n.href}">${t(n)}</a></li>`).join("")}
              <li><a href="portfolio.html">${LANG === "ar" ? "المشاريع" : "Projects"}</a></li></ul>
            </div>
            <div>
              <h5>${LANG === "ar" ? "تواصل معنا" : "Contact"}</h5>
              <ul>
                <li>${SITE_CONFIG.contact.phone}</li>
                <li>${SITE_CONFIG.contact.email}</li>
                <li>${t(SITE_CONFIG.contact.address)}</li>
              </ul>
            </div>
            <div>
              <h5>${LANG === "ar" ? "ساعات العمل" : "Working Hours"}</h5>
              <ul><li>${t(SITE_CONFIG.contact.workingHours)}</li></ul>
            </div>
          </div>
          <div class="footer-bottom">
            &copy; ${year} ${SITE_CONFIG.companyName.ar} &mdash; ${SITE_CONFIG.country.ar}. ${LANG === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved."}
          </div>
        </div>
      </footer>
    `;
  }

  function icon(name) {
    const icons = {
      fb: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z"/></svg>',
      ig: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c2.7 0 3.1 0 4.1.1 1.1 0 1.8.2 2.5.5.7.3 1.2.6 1.7 1.1.5.5.9 1 1.1 1.7.3.7.5 1.4.5 2.5.1 1 .1 1.4.1 4.1s0 3.1-.1 4.1c0 1.1-.2 1.8-.5 2.5-.3.7-.6 1.2-1.1 1.7-.5.5-1 .9-1.7 1.1-.7.3-1.4.5-2.5.5-1 .1-1.4.1-4.1.1s-3.1 0-4.1-.1c-1.1 0-1.8-.2-2.5-.5-.7-.3-1.2-.6-1.7-1.1-.5-.5-.9-1-1.1-1.7-.3-.7-.5-1.4-.5-2.5C2 15.1 2 14.7 2 12s0-3.1.1-4.1c0-1.1.2-1.8.5-2.5.3-.7.6-1.2 1.1-1.7.5-.5 1-.9 1.7-1.1.7-.3 1.4-.5 2.5-.5C8.9 2 9.3 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zM17.4 6.4a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z"/></svg>',
      wa: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm0 18.1a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.1 8.1 0 1 1 12 20.1zm4.4-6c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5l.4-.4.2-.4c0-.2 0-.3 0-.5-.1-.1-.5-1.2-.6-1.7-.2-.4-.3-.4-.5-.4h-.4c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2s1 2.6 1.1 2.7c.1.2 1.9 3 4.7 4.1.7.3 1.2.4 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.2-.3-.2-.5-.3z"/></svg>',
    };
    return icons[name] || "";
  }

  /* ---------- WhatsApp float ---------- */
  function renderWaFloat() {
    if (document.getElementById("waFloat")) return;
    const a = document.createElement("a");
    a.id = "waFloat";
    a.className = "wa-float";
    a.href = getWhatsAppLink();
    a.target = "_blank";
    a.rel = "noopener";
    a.setAttribute("aria-label", "تواصل عبر واتساب");
    a.innerHTML = icon("wa").replace("16", "30");
    document.body.appendChild(a);
  }

  /* ---------- أيقونة عائمة: وسائل التواصل الاجتماعي (فيسبوك/انستغرام) ---------- */
  function renderSocialFloat() {
    if (document.getElementById("socialFloat")) return;
    if (document.body.dataset.page === "social") return; // لا داعي لها في نفس الصفحة
    const a = document.createElement("a");
    a.id = "socialFloat";
    a.className = "social-float";
    a.href = "social.html";
    a.setAttribute("aria-label", LANG === "ar" ? "آخر منشوراتنا على فيسبوك وانستغرام" : "Latest posts on Facebook & Instagram");
    a.title = LANG === "ar" ? "آخر منشوراتنا على فيسبوك وانستغرام" : "Latest posts on Facebook & Instagram";
    a.innerHTML = icon("ig").replace(/16/g, "26");
    document.body.appendChild(a);
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || items.length === 0) {
      items.forEach((i) => i.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    items.forEach((i) => io.observe(i));
  }

  /* ---------- Portfolio filter ---------- */
  function initFilters() {
    const bar = document.querySelector(".filter-bar");
    if (!bar) return;
    const items = document.querySelectorAll(".m-item");
    bar.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-btn");
      if (!btn) return;
      bar.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const cat = btn.dataset.filter;
      items.forEach((it) => {
        const show = cat === "all" || it.dataset.category === cat;
        it.style.display = show ? "" : "none";
      });
    });
  }

  /* ---------- Lightbox ---------- */
  function initLightbox() {
    const items = Array.from(document.querySelectorAll(".m-item:not(.m-item--link)"));
    if (items.length === 0) return;
    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML = `
      <button class="lb-close" aria-label="إغلاق">&times;</button>
      <button class="lb-prev" aria-label="السابق">&#8594;</button>
      <div class="lb-stage"></div>
      <button class="lb-next" aria-label="التالي">&#8592;</button>
      <div class="lb-counter"></div>
    `;
    document.body.appendChild(lb);
    const stage = lb.querySelector(".lb-stage");
    const counter = lb.querySelector(".lb-counter");
    let idx = 0;

    function open(i) {
      idx = i;
      stage.innerHTML = items[idx].querySelector(".m-media").innerHTML;
      counter.textContent = `${idx + 1} / ${items.length}`;
      lb.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }
    function close() {
      lb.classList.remove("is-open");
      document.body.style.overflow = "";
    }
    items.forEach((it, i) => it.addEventListener("click", () => open(i)));
    lb.querySelector(".lb-close").addEventListener("click", close);
    lb.addEventListener("click", (e) => {
      if (e.target === lb) close();
    });
    lb.querySelector(".lb-prev").addEventListener("click", () => open((idx + 1) % items.length));
    lb.querySelector(".lb-next").addEventListener("click", () => open((idx - 1 + items.length) % items.length));
    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") open((idx + 1) % items.length);
      if (e.key === "ArrowRight") open((idx - 1 + items.length) % items.length);
    });
  }

  /* ---------- Before/After slider ---------- */
  function initBeforeAfter() {
    document.querySelectorAll(".ba-wrap").forEach((wrap) => {
      const before = wrap.querySelector(".ba-before");
      const line = wrap.querySelector(".ba-line");
      const handle = wrap.querySelector(".ba-handle");
      let dragging = false;
      function setPos(clientX) {
        const rect = wrap.getBoundingClientRect();
        let pct = ((clientX - rect.left) / rect.width) * 100;
        pct = Math.max(4, Math.min(96, pct));
        before.style.width = pct + "%";
        line.style.insetInlineStart = pct + "%";
        handle.style.insetInlineStart = pct + "%";
      }
      wrap.addEventListener("pointerdown", (e) => {
        dragging = true;
        setPos(e.clientX);
      });
      window.addEventListener("pointermove", (e) => dragging && setPos(e.clientX));
      window.addEventListener("pointerup", () => (dragging = false));
    });
  }

  /* ---------- Contact / consultation form ---------- */
  function initForm() {
    const form = document.getElementById("consultForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const parts = [];
      form.querySelectorAll("[name]").forEach((f) => {
        if (f.type === "file") return;
        const label = form.querySelector(`label[for="${f.id}"]`);
        parts.push(`${label ? label.textContent : f.name}: ${f.value || "-"}`);
      });
      const msg = encodeURIComponent(parts.join("\n"));
      const number = SITE_CONFIG.contact.whatsapp.replace(/[^0-9]/g, "");
      window.open(`https://wa.me/${number}?text=${msg}`, "_blank");
      const note = document.getElementById("formNote");
      if (note) note.textContent = LANG === "ar" ? "تم تجهيز طلبك — أكمل الإرسال عبر واتساب." : "Your request is ready — complete sending via WhatsApp.";
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderTicker();
    renderHeader();
    renderFooter();
    renderWaFloat();
    renderSocialFloat();
    initReveal();
    initFilters();
    initLightbox();
    initBeforeAfter();
    initForm();
  });
})();
