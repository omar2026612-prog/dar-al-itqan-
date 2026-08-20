(function () {
  "use strict";

  var LS_PROJECTS = "itqan_admin_projects";
  var LS_VIDEOS = "itqan_admin_videos";
  var LS_CONFIG = "itqan_admin_config";
  var SS_AUTH = "itqan_admin_auth";
  // علم دائم (لا يُمسح بإغلاق المتصفح) يُستخدم لإظهار "وضع المالك" في كل صفحات
  // الموقع العامة (أيقونة التحكم + أزرار تعديل سريعة) — يبقى حتى تسجيل الخروج يدوياً.
  var LS_OWNER = "itqan_owner_mode";

  /* =========================================================
     تحميل الحالة الحالية (من المسودّة المحفوظة أو من ملفات المصدر)
     ========================================================= */
  function loadProjects() {
    try {
      var raw = localStorage.getItem(LS_PROJECTS);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return JSON.parse(JSON.stringify(window.PROJECTS || []));
  }
  function loadVideos() {
    try {
      var raw = localStorage.getItem(LS_VIDEOS);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return JSON.parse(JSON.stringify(window.VIDEOS || []));
  }
  function loadConfigPatch() {
    try {
      var raw = localStorage.getItem(LS_CONFIG);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {};
  }

  var state = {
    projects: loadProjects(),
    videos: loadVideos(),
    configPatch: loadConfigPatch(),
    editingProjectId: null,
    editingVideoId: null,
    pendingCoverImage: null, // {dataUrl, ext}
    pendingGalleryImages: [], // [{dataUrl, ext}]
  };

  function saveProjects() {
    localStorage.setItem(LS_PROJECTS, JSON.stringify(state.projects));
  }
  function saveVideos() {
    localStorage.setItem(LS_VIDEOS, JSON.stringify(state.videos));
  }
  function saveConfigPatch() {
    localStorage.setItem(LS_CONFIG, JSON.stringify(state.configPatch));
  }

  var CAT_LABELS = {
    kitchens: "مطابخ", wardrobes: "خزائن ملابس", bedrooms: "غرف نوم",
    decor: "ديكورات", promo: "دعائي عام",
  };

  /* =========================================================
     شاشة الدخول
     ========================================================= */
  function initGate() {
    var gate = document.getElementById("gate");
    var shell = document.getElementById("shell");
    var pass = document.getElementById("gatePass");
    var err = document.getElementById("gateErr");
    var btn = document.getElementById("gateBtn");

    // ملاحظة: كلمة المرور الافتراضية 123456789 مكتوبة هنا مباشرة كخيار احتياطي،
    // بحيث يعمل الدخول فوراً حتى لو تأخر تحميل js/config.js لأي سبب (بطء قرص،
    // مزامنة OneDrive، إلخ). إن كانت SITE_CONFIG.adminPasscode محمّلة ومختلفة
    // عن هذه القيمة، تُستخدم قيمتها هي (أي تعديلك في config.js له الأولوية).
    var FALLBACK_PASSCODE = "123456789";

    function normalizeDigits(str) {
      // يحوّل الأرقام العربية (٠-٩) والفارسية (۰-۹) إلى أرقام إنجليزية عادية
      var arabicIndic = "٠١٢٣٤٥٦٧٨٩";
      var persian = "۰۱۲۳۴۵۶۷۸۹";
      var converted = String(str).replace(/[٠-٩۰-۹]/g, function (ch) {
        var i = arabicIndic.indexOf(ch);
        if (i !== -1) return String(i);
        i = persian.indexOf(ch);
        if (i !== -1) return String(i);
        return ch;
      });
      // يزيل أي محارف غير مرئية (مثل علامات اتجاه النص RLM/LRM أو مسافات خاصة
      // قد تُنسخ عن طريق الخطأ من ملف PDF أو واتساب) ويُبقي الأرقام فقط
      return converted.replace(/\D/g, "");
    }

    // زر إظهار/إخفاء كلمة المرور — يساعد على التأكد من الأرقام المكتوبة فعلياً
    var toggleBtn = document.getElementById("gateShowPass");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", function () {
        pass.type = pass.type === "password" ? "text" : "password";
        toggleBtn.textContent = pass.type === "password" ? "إظهار" : "إخفاء";
      });
    }

    function tryEnter() {
      var code = normalizeDigits((window.SITE_CONFIG && SITE_CONFIG.adminPasscode) || FALLBACK_PASSCODE);
      var entered = normalizeDigits(pass.value);
      if (entered === code && entered.length > 0) {
        sessionStorage.setItem(SS_AUTH, "1");
        localStorage.setItem(LS_OWNER, "1"); // يُبقي صاحب الموقع مسجّلاً في هذا المتصفح ويُظهر له أدوات التحكم في كل صفحات الموقع
        gate.style.display = "none";
        shell.classList.add("is-active");
        renderAll();
        handleDeepLink();
      } else {
        err.textContent = "كلمة المرور غير صحيحة. (عدد الأرقام التي تم إدخالها: " + entered.length + " من أصل " + code.length + " مطلوبة)";
      }
    }
    btn.addEventListener("click", tryEnter);
    pass.addEventListener("keydown", function (e) { if (e.key === "Enter") tryEnter(); });

    if (sessionStorage.getItem(SS_AUTH) === "1" || localStorage.getItem(LS_OWNER) === "1") {
      gate.style.display = "none";
      shell.classList.add("is-active");
      renderAll();
      handleDeepLink();
    }

    document.getElementById("logoutBtn").addEventListener("click", function () {
      sessionStorage.removeItem(SS_AUTH);
      localStorage.removeItem(LS_OWNER); // يخفي أدوات وضع المالك فوراً من كل صفحات الموقع في هذا المتصفح
      location.reload();
    });
  }

  /* =========================================================
     روابط مباشرة من الموقع العام (أزرار "✎ تعديل" و"+ جديد" التي
     تظهر لصاحب الموقع فوق المشاريع/الفيديوهات) — تفتح لوحة التحكم
     مباشرة على التبويب والعنصر المطلوبين عبر رابط مثل:
     admin.html?edit=project&id=xxx  أو  admin.html?new=video
     ========================================================= */
  function goToPanel(name) {
    var btn = document.querySelector('.admin-nav button[data-panel="' + name + '"]');
    if (btn) btn.click();
  }
  function handleDeepLink() {
    var params = new URLSearchParams(location.search);
    var editSpec = params.get("edit"); // "project" أو "video"
    var newSpec = params.get("new");   // "project" أو "video"
    var id = params.get("id");

    if (editSpec === "project") {
      goToPanel("projects");
      var p = id ? state.projects.find(function (x) { return x.id === id; }) : null;
      openProjectForm(p || null);
    } else if (editSpec === "video") {
      goToPanel("videos");
      var v = id ? state.videos.find(function (x) { return x.id === id; }) : null;
      openVideoForm(v || null);
    } else if (newSpec === "project") {
      goToPanel("projects");
      openProjectForm(null);
    } else if (newSpec === "video") {
      goToPanel("videos");
      openVideoForm(null);
    }
    // ننظّف الرابط حتى لا يُعاد فتح نفس النموذج عند تحديث الصفحة
    if (editSpec || newSpec) {
      history.replaceState(null, "", "admin.html");
    }
  }

  /* =========================================================
     تبديل التبويبات
     ========================================================= */
  function initTabs() {
    var buttons = document.querySelectorAll(".admin-nav button");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        document.querySelectorAll(".admin-panel").forEach(function (p) { p.classList.remove("is-active"); });
        document.getElementById("panel-" + btn.dataset.panel).classList.add("is-active");
      });
    });
  }

  function renderAll() {
    renderProjectsTable();
    renderVideosTable();
    fillCompanyForm();
    var fbSpan = document.querySelector("[data-cfg-fb-url]");
    if (fbSpan) fbSpan.textContent = (SITE_CONFIG.social.facebook || "").replace(/^https?:\/\/(www\.)?/, "");
  }

  /* =========================================================
     أدوات مساعدة عامة
     ========================================================= */
  function slugId(prefix) {
    return prefix + "-" + Date.now().toString(36) + Math.floor(Math.random() * 100);
  }
  function fileToDataUrl(file) {
    return new Promise(function (resolve) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.readAsDataURL(file);
    });
  }
  function extFromFile(file) {
    var m = /\.([a-zA-Z0-9]+)$/.exec(file.name);
    return m ? m[1].toLowerCase() : "jpg";
  }
  function downloadBlob(filename, content, type) {
    var blob = new Blob([content], { type: type || "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }
  function downloadDataUrl(filename, dataUrl) {
    var a = document.createElement("a");
    a.href = dataUrl; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }

  /* =========================================================
     المشاريع — جدول + نموذج
     ========================================================= */
  function renderProjectsTable() {
    var tbody = document.getElementById("projectsTbody");
    var empty = document.getElementById("projectsEmpty");
    var table = document.getElementById("projectsTable");
    if (!state.projects.length) {
      table.hidden = true; empty.hidden = false; return;
    }
    table.hidden = false; empty.hidden = true;
    tbody.innerHTML = state.projects.map(function (p, i) {
      var img = p.cover ? '<img class="a-thumb" src="' + p.cover + '" alt="" />' : '<div class="a-thumb-ph">لا صورة</div>';
      return '<tr>' +
        '<td>' + img + '</td>' +
        '<td>' + (p.title && p.title.ar || "") + '</td>' +
        '<td>' + (CAT_LABELS[p.category] || p.category) + '</td>' +
        '<td class="a-row-actions">' +
          '<button class="a-btn sm outline" data-edit-project="' + i + '">تعديل</button>' +
          '<button class="a-btn sm danger" data-del-project="' + i + '">حذف</button>' +
        '</td></tr>';
    }).join("");

    tbody.querySelectorAll("[data-edit-project]").forEach(function (btn) {
      btn.addEventListener("click", function () { openProjectForm(state.projects[+btn.dataset.editProject]); });
    });
    tbody.querySelectorAll("[data-del-project]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (!confirm("حذف هذا المشروع؟")) return;
        state.projects.splice(+btn.dataset.delProject, 1);
        saveProjects(); renderProjectsTable();
      });
    });
  }

  function resetProjectForm() {
    state.editingProjectId = null;
    state.pendingCoverImage = null;
    state.pendingGalleryImages = [];
    document.getElementById("projectFormTitle").textContent = "مشروع جديد";
    ["pTitleAr", "pTitleEn", "pLocation", "pDescAr", "pDescEn"].forEach(function (id) { document.getElementById(id).value = ""; });
    document.getElementById("pCategory").value = "kitchens";
    document.getElementById("pCoverFile").value = "";
    document.getElementById("pGalleryFile").value = "";
    document.getElementById("pCoverPreview").innerHTML = "";
    document.getElementById("pGalleryPreview").innerHTML = "";
  }

  function openProjectForm(project) {
    resetProjectForm();
    var form = document.getElementById("projectForm");
    form.hidden = false;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    if (!project) return;
    state.editingProjectId = project.id;
    document.getElementById("projectFormTitle").textContent = "تعديل: " + project.title.ar;
    document.getElementById("pTitleAr").value = project.title.ar || "";
    document.getElementById("pTitleEn").value = (project.title && project.title.en) || "";
    document.getElementById("pLocation").value = (project.location && project.location.ar) || "";
    document.getElementById("pDescAr").value = (project.description && project.description.ar) || "";
    document.getElementById("pDescEn").value = (project.description && project.description.en) || "";
    document.getElementById("pCategory").value = project.category || "kitchens";
    if (project.cover) {
      document.getElementById("pCoverPreview").innerHTML = '<div class="a-thumb-item"><img src="' + project.cover + '" /></div>';
    }
    if (project.gallery && project.gallery.length) {
      document.getElementById("pGalleryPreview").innerHTML = project.gallery.map(function (src) {
        return '<div class="a-thumb-item"><img src="' + src + '" /></div>';
      }).join("");
    }
  }

  function initProjectForm() {
    document.getElementById("newProjectBtn").addEventListener("click", function () { openProjectForm(null); });
    document.getElementById("cancelProjectBtn").addEventListener("click", function () {
      document.getElementById("projectForm").hidden = true;
    });

    document.getElementById("pCoverFile").addEventListener("change", function (e) {
      var file = e.target.files[0];
      if (!file) return;
      fileToDataUrl(file).then(function (dataUrl) {
        state.pendingCoverImage = { dataUrl: dataUrl, ext: extFromFile(file) };
        document.getElementById("pCoverPreview").innerHTML = '<div class="a-thumb-item"><img src="' + dataUrl + '" /></div>';
      });
    });

    document.getElementById("pGalleryFile").addEventListener("change", function (e) {
      var files = Array.prototype.slice.call(e.target.files);
      Promise.all(files.map(function (file) {
        return fileToDataUrl(file).then(function (dataUrl) { return { dataUrl: dataUrl, ext: extFromFile(file) }; });
      })).then(function (results) {
        state.pendingGalleryImages = state.pendingGalleryImages.concat(results);
        document.getElementById("pGalleryPreview").innerHTML = state.pendingGalleryImages.map(function (img) {
          return '<div class="a-thumb-item"><img src="' + img.dataUrl + '" /></div>';
        }).join("");
      });
    });

    document.getElementById("projectForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var titleAr = document.getElementById("pTitleAr").value.trim();
      if (!titleAr) return;
      var category = document.getElementById("pCategory").value;

      var existing = state.editingProjectId ? state.projects.find(function (p) { return p.id === state.editingProjectId; }) : null;
      var id = existing ? existing.id : slugId(category);

      var cover = existing ? existing.cover : null;
      var gallery = existing ? (existing.gallery || []).slice() : [];

      if (state.pendingCoverImage) {
        cover = "images/projects/" + id + "-cover." + state.pendingCoverImage.ext;
      }
      if (state.pendingGalleryImages.length) {
        gallery = state.pendingGalleryImages.map(function (img, i) {
          return "images/projects/" + id + "-g" + (i + 1) + "." + img.ext;
        });
      }

      var record = {
        id: id,
        category: category,
        title: { ar: titleAr, en: document.getElementById("pTitleEn").value.trim() || titleAr },
        location: { ar: document.getElementById("pLocation").value.trim() || "معرض دار الإتقان", en: "Dar Al Itqan Showroom" },
        cover: cover,
        gallery: gallery.length ? gallery : (cover ? [cover] : []),
        description: {
          ar: document.getElementById("pDescAr").value.trim(),
          en: document.getElementById("pDescEn").value.trim(),
        },
        // نحتفظ بالصور الفعلية (Base64) مؤقتاً هنا للتنزيل عند التصدير — لا تُكتب داخل ملف projects.js النهائي
        _pendingCover: state.pendingCoverImage,
        _pendingGallery: state.pendingGalleryImages,
      };

      if (existing) {
        Object.assign(existing, record);
      } else {
        state.projects.push(record);
      }
      saveProjects();
      renderProjectsTable();
      document.getElementById("projectForm").hidden = true;
    });
  }

  function exportProjects() {
    if (!state.projects.length) { alert("لا توجد مشاريع لتصديرها بعد."); return; }
    // تنزيل الصور الجديدة (Base64) بأسمائها المقترحة
    state.projects.forEach(function (p) {
      if (p._pendingCover) downloadDataUrl(p.id + "-cover." + p._pendingCover.ext, p._pendingCover.dataUrl);
      if (p._pendingGallery && p._pendingGallery.length) {
        p._pendingGallery.forEach(function (img, i) {
          downloadDataUrl(p.id + "-g" + (i + 1) + "." + img.ext, img.dataUrl);
        });
      }
    });

    var clean = state.projects.map(function (p) {
      return { id: p.id, category: p.category, title: p.title, location: p.location, cover: p.cover, gallery: p.gallery, description: p.description };
    });

    var content =
      "/**\n * بيانات المشاريع / صور المعرض — تم إنشاؤه من لوحة التحكم\n" +
      " * ضع الصور المُنزَّلة معه داخل images/projects/ ثم ارفع هذا الملف\n" +
      " * ليحل محل js/projects.js على الاستضافة.\n */\n" +
      "let PROJECTS = " + JSON.stringify(clean, null, 2) + ";\n";

    downloadBlob("projects.js", content, "application/javascript;charset=utf-8");
  }

  /* =========================================================
     الفيديوهات — جدول + نموذج
     ========================================================= */
  function detectVideoType(url) {
    if (/facebook\.com|fb\.watch/.test(url)) return "facebook";
    if (/youtube\.com|youtu\.be/.test(url)) return "youtube";
    return "file";
  }

  function renderVideosTable() {
    var tbody = document.getElementById("videosTbody");
    var empty = document.getElementById("videosEmpty");
    var table = document.getElementById("videosTable");
    if (!state.videos.length) { table.hidden = true; empty.hidden = false; return; }
    table.hidden = false; empty.hidden = true;
    tbody.innerHTML = state.videos.map(function (v, i) {
      var src = v.type === "facebook" ? "فيسبوك" : v.type === "youtube" ? "يوتيوب" : "ملف";
      return '<tr>' +
        '<td>' + ((v.title && v.title.ar) || "") + '</td>' +
        '<td>' + src + '</td>' +
        '<td>' + (CAT_LABELS[v.category] || v.category) + '</td>' +
        '<td class="a-row-actions">' +
          '<a class="a-btn sm outline" href="' + v.url + '" target="_blank">فتح</a>' +
          '<button class="a-btn sm outline" data-edit-video="' + i + '">تعديل</button>' +
          '<button class="a-btn sm danger" data-del-video="' + i + '">حذف</button>' +
        '</td></tr>';
    }).join("");

    tbody.querySelectorAll("[data-edit-video]").forEach(function (btn) {
      btn.addEventListener("click", function () { openVideoForm(state.videos[+btn.dataset.editVideo]); });
    });
    tbody.querySelectorAll("[data-del-video]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (!confirm("حذف هذا الفيديو؟")) return;
        state.videos.splice(+btn.dataset.delVideo, 1);
        saveVideos(); renderVideosTable();
      });
    });
  }

  function resetVideoForm() {
    state.editingVideoId = null;
    document.getElementById("videoFormTitle").textContent = "فيديو جديد";
    ["vUrl", "vTitleAr", "vTitleEn"].forEach(function (id) { document.getElementById(id).value = ""; });
    document.getElementById("vCategory").value = "promo";
    document.getElementById("vTypeDetected").textContent = "";
  }

  function openVideoForm(video) {
    resetVideoForm();
    var form = document.getElementById("videoForm");
    form.hidden = false;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    if (!video) return;
    state.editingVideoId = video.id;
    document.getElementById("videoFormTitle").textContent = "تعديل: " + video.title.ar;
    document.getElementById("vUrl").value = video.url || "";
    document.getElementById("vTitleAr").value = (video.title && video.title.ar) || "";
    document.getElementById("vTitleEn").value = (video.title && video.title.en) || "";
    document.getElementById("vCategory").value = video.category || "promo";
  }

  function initVideoForm() {
    document.getElementById("newVideoBtn").addEventListener("click", function () { openVideoForm(null); });
    document.getElementById("cancelVideoBtn").addEventListener("click", function () {
      document.getElementById("videoForm").hidden = true;
    });
    document.getElementById("vUrl").addEventListener("input", function (e) {
      var type = detectVideoType(e.target.value.trim());
      var labels = { facebook: "تم التعرف عليه كفيديو فيسبوك ✓", youtube: "تم التعرف عليه كفيديو يوتيوب ✓", file: "سيُعامل كرابط ملف فيديو مباشر" };
      document.getElementById("vTypeDetected").textContent = e.target.value.trim() ? labels[type] : "";
    });

    document.getElementById("videoForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var url = document.getElementById("vUrl").value.trim();
      var titleAr = document.getElementById("vTitleAr").value.trim();
      if (!url || !titleAr) return;

      var existing = state.editingVideoId ? state.videos.find(function (v) { return v.id === state.editingVideoId; }) : null;
      var record = {
        id: existing ? existing.id : slugId("video"),
        type: detectVideoType(url),
        url: url,
        title: { ar: titleAr, en: document.getElementById("vTitleEn").value.trim() || titleAr },
        category: document.getElementById("vCategory").value,
      };
      if (existing) Object.assign(existing, record);
      else state.videos.push(record);

      saveVideos(); renderVideosTable();
      document.getElementById("videoForm").hidden = true;
    });
  }

  function exportVideos() {
    if (!state.videos.length) { alert("لا توجد فيديوهات لتصديرها بعد."); return; }
    var content =
      "/**\n * بيانات الفيديوهات — تم إنشاؤه من لوحة التحكم\n" +
      " * ارفع هذا الملف ليحل محل js/videos.js على الاستضافة.\n */\n" +
      "let VIDEOS = " + JSON.stringify(state.videos, null, 2) + ";\n";
    downloadBlob("videos.js", content, "application/javascript;charset=utf-8");
  }

  /* =========================================================
     استيراد رابط فيسبوك (معاينة + إضافة كفيديو)
     ========================================================= */
  function initFacebookImport() {
    document.getElementById("fbImportBtn").addEventListener("click", function () {
      var url = document.getElementById("fbImportUrl").value.trim();
      var box = document.getElementById("fbImportPreview");
      if (!url) return;
      var src = "https://www.facebook.com/plugins/video.php?href=" + encodeURIComponent(url) + "&show_text=false&width=400";
      box.hidden = false;
      box.innerHTML =
        '<iframe src="' + src + '" width="100%" height="280" style="border:0;" scrolling="no" frameborder="0" allowfullscreen loading="lazy"></iframe>' +
        '<div class="a-form-actions"><button type="button" class="a-btn sm" id="fbAddAsVideo">➕ إضافة كفيديو دعائي</button></div>';
      document.getElementById("fbAddAsVideo").addEventListener("click", function () {
        var title = prompt("عنوان مختصر لهذا الفيديو:", "فيديو من صفحتنا على فيسبوك");
        if (title === null) return;
        state.videos.push({ id: slugId("video"), type: "facebook", url: url, title: { ar: title, en: title }, category: "promo" });
        saveVideos(); renderVideosTable();
        alert("تمت الإضافة إلى قائمة الفيديوهات ✓");
      });
    });
  }

  /* =========================================================
     بيانات الشركة
     ========================================================= */
  function fillCompanyForm() {
    var c = SITE_CONFIG.contact, s = SITE_CONFIG.social;
    document.getElementById("cPhone").value = c.phone || "";
    document.getElementById("cWhatsapp").value = c.whatsapp || "";
    document.getElementById("cEmail").value = c.email || "";
    document.getElementById("cHoursAr").value = (c.workingHours && c.workingHours.ar) || "";
    document.getElementById("cAddrAr").value = (c.address && c.address.ar) || "";
    document.getElementById("cAddrEn").value = (c.address && c.address.en) || "";
    document.getElementById("cFacebook").value = s.facebook || "";
    document.getElementById("cInstagram").value = s.instagram || "";
    document.getElementById("cTiktok").value = s.tiktok || "";
    var mapsQuery = SITE_CONFIG.googleMapsQuery || "";
    document.getElementById("cMapsQuery").value = mapsQuery.startsWith("[") ? "" : mapsQuery;
    document.getElementById("cMaps").value = SITE_CONFIG.googleMapsEmbedUrl || "";
    updateMapPreview();
  }

  function updateMapPreview() {
    var field = document.getElementById("mapPreviewField");
    var frame = document.getElementById("mapPreviewFrame");
    var embed = document.getElementById("cMaps").value.trim();
    var query = document.getElementById("cMapsQuery").value.trim();
    var src = embed || (query ? "https://maps.google.com/maps?q=" + encodeURIComponent(query) + "&output=embed" : "");
    if (src) {
      frame.src = src;
      field.hidden = false;
    } else {
      field.hidden = true;
      frame.src = "";
    }
  }

  function initCompanyForm() {
    document.getElementById("cMapsQuery").addEventListener("input", updateMapPreview);
    document.getElementById("cMaps").addEventListener("input", updateMapPreview);

    document.getElementById("companyForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var patch = {
        contact: {
          phone: document.getElementById("cPhone").value.trim(),
          whatsapp: document.getElementById("cWhatsapp").value.trim(),
          email: document.getElementById("cEmail").value.trim(),
          workingHours: { ar: document.getElementById("cHoursAr").value.trim(), en: SITE_CONFIG.contact.workingHours.en },
          address: { ar: document.getElementById("cAddrAr").value.trim(), en: document.getElementById("cAddrEn").value.trim() },
        },
        social: {
          facebook: document.getElementById("cFacebook").value.trim(),
          instagram: document.getElementById("cInstagram").value.trim(),
          tiktok: document.getElementById("cTiktok").value.trim(),
        },
        googleMapsQuery: document.getElementById("cMapsQuery").value.trim(),
        googleMapsEmbedUrl: document.getElementById("cMaps").value.trim(),
      };
      state.configPatch = patch;
      saveConfigPatch();
      Object.assign(SITE_CONFIG.contact, patch.contact);
      Object.assign(SITE_CONFIG.social, patch.social);
      SITE_CONFIG.googleMapsQuery = patch.googleMapsQuery;
      SITE_CONFIG.googleMapsEmbedUrl = patch.googleMapsEmbedUrl;
      var note = document.getElementById("companySavedNote");
      note.hidden = false;
      setTimeout(function () { note.hidden = true; }, 4000);
    });

    document.getElementById("exportConfigBtn").addEventListener("click", exportConfig);
  }

  function exportConfig() {
    var c = SITE_CONFIG;
    var content =
      "/**\n * ============================================================\n" +
      " *  دار الإتقان للمطابخ والديكورات — ملف الإعدادات المركزي\n" +
      " *  تم إنشاؤه من لوحة التحكم — ارفعه ليحل محل js/config.js\n" +
      " * ============================================================\n */\n\n" +
      "const SITE_CONFIG = " + JSON.stringify({
        companyName: c.companyName, tagline: c.tagline, shortDescription: c.shortDescription, country: c.country,
        contact: c.contact, social: c.social, googleMapsQuery: c.googleMapsQuery, googleMapsEmbedUrl: c.googleMapsEmbedUrl,
        whatsappDefaultMessage: c.whatsappDefaultMessage, nav: c.nav, adminPasscode: c.adminPasscode,
      }, null, 2) + ";\n\n" +
      "function getWhatsAppLink(customMessage) {\n" +
      "  const number = SITE_CONFIG.contact.whatsapp.replace(/[^0-9]/g, \"\");\n" +
      "  const message = encodeURIComponent(customMessage || SITE_CONFIG.whatsappDefaultMessage.ar);\n" +
      "  return `https://wa.me/${number}?text=${message}`;\n" +
      "}\n\n" +
      "function getGoogleMapsSrc() {\n" +
      "  const embed = SITE_CONFIG.googleMapsEmbedUrl;\n" +
      "  if (embed && !embed.startsWith(\"[\")) return embed;\n" +
      "  const query = SITE_CONFIG.googleMapsQuery;\n" +
      "  if (query && !query.startsWith(\"[\") && query.trim()) {\n" +
      "    return `https://maps.google.com/maps?q=${encodeURIComponent(query.trim())}&output=embed`;\n" +
      "  }\n" +
      "  return \"\";\n" +
      "}\n";
    downloadBlob("config.js", content, "application/javascript;charset=utf-8");
  }

  /* =========================================================
     تشغيل
     ========================================================= */
  document.addEventListener("DOMContentLoaded", function () {
    initGate();
    initTabs();
    initProjectForm();
    initVideoForm();
    initFacebookImport();
    initCompanyForm();
    document.getElementById("exportProjectsBtn").addEventListener("click", exportProjects);
    document.getElementById("exportVideosBtn").addEventListener("click", exportVideos);
  });
})();
