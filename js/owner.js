/**
 * =========================================================
 * وضع المالك (Owner Mode) — دار الإتقان
 * =========================================================
 * بعد تسجيل الدخول مرة واحدة من admin.html بكلمة المرور، يبقى هذا
 * المتصفح "متعرّفاً" على صاحب الموقع (عبر علامة محفوظة محلياً في
 * هذا الجهاز فقط) وتظهر له تلقائياً في كل صفحات الموقع:
 *   - أيقونة تحكم عائمة لفتح لوحة التحكم أو تسجيل الخروج.
 *   - أزرار "✎ تعديل" صغيرة فوق كل مشروع/فيديو تنقله مباشرة
 *     لنموذج التعديل الخاص به في لوحة التحكم.
 *   - بطاقة "+ إضافة" في نهاية شبكات المشاريع/الفيديوهات.
 *
 * لأي زائر آخر لا تحمل هذه العلامة في متصفحه، هذا الملف لا يضيف
 * أي عنصر إطلاقاً — الموقع يظهر له جاهزاً للعرض فقط كما هو.
 * =========================================================
 */
(function () {
  "use strict";
  var LS_OWNER = "itqan_owner_mode";

  function isOwner() {
    try { return localStorage.getItem(LS_OWNER) === "1"; } catch (e) { return false; }
  }
  if (!isOwner()) return; // زائر عادي — لا شيء يُضاف للصفحة

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function injectStyles() {
    if (document.getElementById("ownerModeStyles")) return;
    var css = `
      #ownerBadge{position:fixed;z-index:200;bottom:22px;inset-inline-start:22px;display:flex;flex-direction:column;align-items:flex-start;gap:10px;font-family:var(--font-body,sans-serif);}
      #ownerToggle{width:56px;height:56px;border-radius:50%;background:var(--charcoal,#18161A);color:var(--bronze-light,#CBA06A);border:2px solid var(--bronze,#B08652);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.35);transition:transform .25s;}
      #ownerToggle:hover{transform:scale(1.07);}
      #ownerToggle svg{width:26px;height:26px;}
      #ownerMenu{display:none;flex-direction:column;background:var(--charcoal,#18161A);border:1px solid var(--bronze,#B08652);border-radius:6px;overflow:hidden;min-width:230px;box-shadow:0 10px 30px rgba(0,0,0,.4);}
      #ownerMenu.is-open{display:flex;}
      #ownerMenu a, #ownerMenu button{all:unset;box-sizing:border-box;display:block;width:100%;padding:13px 16px;color:var(--ivory,#F6F1E7);font-size:14px;cursor:pointer;text-align:start;border-bottom:1px solid rgba(246,241,231,.1);}
      #ownerMenu a:last-child, #ownerMenu button:last-child{border-bottom:none;}
      #ownerMenu a:hover, #ownerMenu button:hover{background:var(--bronze,#B08652);color:var(--charcoal,#18161A);}
      #ownerMenu .om-logout{color:#e08a8a;}
      #ownerMenu .om-logout:hover{background:#c0504f;color:#fff;}
      .owner-edit-pin{position:absolute;top:8px;inset-inline-end:8px;z-index:5;width:32px;height:32px;border-radius:50%;background:rgba(24,22,26,.78);color:var(--bronze-light,#CBA06A);display:flex;align-items:center;justify-content:center;text-decoration:none;border:1px solid rgba(203,160,106,.6);transition:transform .2s;}
      .owner-edit-pin:hover{transform:scale(1.1);background:var(--bronze,#B08652);color:var(--charcoal,#18161A);}
      .owner-edit-pin svg{width:15px;height:15px;}
      .owner-add-tile{display:flex;align-items:center;justify-content:center;min-height:180px;border:2px dashed var(--bronze,#B08652);color:var(--bronze,#B08652);text-decoration:none;font-weight:700;font-size:14px;text-align:center;padding:20px;flex-direction:column;gap:8px;transition:all .2s;}
      .owner-add-tile:hover{background:var(--bronze,#B08652);color:var(--ivory,#F6F1E7);}
      .owner-add-tile svg{width:26px;height:26px;}
      .owner-detail-edit{position:fixed;z-index:150;bottom:22px;inset-inline-start:92px;background:var(--bronze,#B08652);color:var(--charcoal,#18161A);padding:12px 18px;border-radius:30px;font-size:13.5px;font-weight:700;text-decoration:none;box-shadow:0 8px 20px rgba(0,0,0,.3);display:flex;align-items:center;gap:8px;}
    `;
    var style = document.createElement("style");
    style.id = "ownerModeStyles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  var ICON_GEAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 5 15a1.7 1.7 0 0 0-1.55-1H3.4a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 5 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1z"/></svg>';
  var ICON_PENCIL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>';
  var ICON_PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>';

  function renderBadge() {
    if (document.getElementById("ownerBadge")) return;

    var wrap = document.createElement("div");
    wrap.id = "ownerBadge";
    wrap.innerHTML =
      '<div id="ownerMenu" role="menu">' +
        '<span style="display:block;padding:10px 16px;font-size:11.5px;color:var(--bronze-light,#CBA06A);opacity:.8;border-bottom:1px solid rgba(246,241,231,.1);">وضع المالك — ظاهر لك فقط في هذا المتصفح</span>' +
        '<a href="admin.html" target="_blank" rel="noopener">🗂️ لوحة التحكم الكاملة</a>' +
        '<a href="admin.html?new=project" target="_blank" rel="noopener">➕ إضافة مشروع جديد</a>' +
        '<a href="admin.html?new=video" target="_blank" rel="noopener">➕ إضافة فيديو جديد</a>' +
        '<a href="admin.html?new=instagram" target="_blank" rel="noopener">📸 إضافة منشور انستغرام</a>' +
        '<button type="button" class="om-logout" id="ownerLogoutBtn">↩ الخروج من وضع المالك</button>' +
      '</div>' +
      '<button type="button" id="ownerToggle" aria-label="أدوات التحكم" title="أدوات التحكم (خاصة بك)">' + ICON_GEAR + "</button>";
    document.body.appendChild(wrap);

    var toggle = document.getElementById("ownerToggle");
    var menu = document.getElementById("ownerMenu");
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
    document.addEventListener("click", function (e) {
      if (!wrap.contains(e.target)) menu.classList.remove("is-open");
    });
    document.getElementById("ownerLogoutBtn").addEventListener("click", function () {
      try { localStorage.removeItem(LS_OWNER); } catch (e) {}
      try { sessionStorage.removeItem("itqan_admin_auth"); } catch (e) {}
      location.reload();
    });
  }

  function pin(href) {
    var a = document.createElement("a");
    a.className = "owner-edit-pin";
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener";
    a.title = "تعديل من لوحة التحكم";
    a.innerHTML = ICON_PENCIL;
    a.addEventListener("click", function (e) { e.stopPropagation(); });
    return a;
  }

  function decorateProjectCards() {
    document.querySelectorAll(".m-item[data-project-id]").forEach(function (card) {
      if (card.querySelector(".owner-edit-pin")) return;
      card.style.position = card.style.position || "relative";
      card.appendChild(pin("admin.html?edit=project&id=" + encodeURIComponent(card.dataset.projectId)));
    });

    var grid = document.getElementById("portfolioGrid") || document.getElementById("homePreviewGrid");
    if (grid && !grid.querySelector(".owner-add-tile")) {
      var tile = document.createElement("a");
      tile.className = "owner-add-tile reveal is-visible";
      tile.href = "admin.html?new=project";
      tile.target = "_blank";
      tile.rel = "noopener";
      tile.innerHTML = ICON_PLUS + "<span>إضافة مشروع جديد</span>";
      grid.appendChild(tile);
    }
  }

  function decorateVideoCards() {
    document.querySelectorAll(".video-card[data-video-id]").forEach(function (card) {
      if (card.querySelector(".owner-edit-pin")) return;
      card.style.position = card.style.position || "relative";
      card.appendChild(pin("admin.html?edit=video&id=" + encodeURIComponent(card.dataset.videoId)));
    });

    var grid = document.getElementById("videoGrid");
    if (grid && grid.hidden) {
      // لا توجد فيديوهات بعد — نُظهر شبكة فارغة لصاحب الموقع فقط ليتمكن من الإضافة مباشرة
      grid.hidden = false;
      var emptyMsg = document.getElementById("videoEmpty");
      if (emptyMsg) emptyMsg.hidden = true;
    }
    if (grid && !grid.querySelector(".owner-add-tile")) {
      var tile = document.createElement("a");
      tile.className = "owner-add-tile";
      tile.href = "admin.html?new=video";
      tile.target = "_blank";
      tile.rel = "noopener";
      tile.innerHTML = ICON_PLUS + "<span>إضافة فيديو جديد</span>";
      grid.appendChild(tile);
    }
  }

  function decorateInstagramGrid() {
    var grid = document.getElementById("igGrid");
    if (!grid) return;
    if (grid.hidden) grid.hidden = false;
    var emptyMsg = document.getElementById("igEmpty");
    if (emptyMsg) emptyMsg.hidden = true;
    if (!grid.querySelector(".owner-add-tile")) {
      var tile = document.createElement("a");
      tile.className = "owner-add-tile";
      tile.href = "admin.html?new=instagram";
      tile.target = "_blank";
      tile.rel = "noopener";
      tile.innerHTML = ICON_PLUS + "<span>إضافة منشور انستغرام</span>";
      grid.appendChild(tile);
    }
  }

  function decorateProjectDetails() {
    var id = document.body.dataset.ownerProjectId;
    if (!id || document.querySelector(".owner-detail-edit")) return;
    var a = document.createElement("a");
    a.className = "owner-detail-edit";
    a.href = "admin.html?edit=project&id=" + encodeURIComponent(id);
    a.target = "_blank";
    a.rel = "noopener";
    a.innerHTML = ICON_PENCIL + "<span>تعديل هذا المشروع</span>";
    document.body.appendChild(a);
  }

  ready(function () {
    injectStyles();
    renderBadge();
    decorateProjectCards();
    decorateVideoCards();
    decorateInstagramGrid();
    decorateProjectDetails();
  });
})();
