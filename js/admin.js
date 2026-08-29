(function () {
  "use strict";

  var LS_PROJECTS = "itqan_admin_projects";
  var LS_VIDEOS = "itqan_admin_videos";
  var LS_INSTAGRAM = "itqan_admin_instagram";
  var LS_CONFIG = "itqan_admin_config";
  var LS_GITHUB = "itqan_github_settings"; // {owner, repo, branch, baseDir, token} — يبقى محلياً فقط، لا يُصدَّر أبداً
  var SS_AUTH = "itqan_admin_auth";
  var LS_OWNER = "itqan_owner_mode";

  function loadProjects() {
    return JSON.parse(JSON.stringify((typeof PROJECTS !== "undefined" && PROJECTS) || []));
  }
  function loadVideos() {
    return JSON.parse(JSON.stringify((typeof VIDEOS !== "undefined" && VIDEOS) || []));
  }
  function loadInstagramPosts() {
    return JSON.parse(JSON.stringify((typeof INSTAGRAM_POSTS !== "undefined" && INSTAGRAM_POSTS) || []));
  }
  function loadGithubSettings() {
    try {
      var raw = localStorage.getItem(LS_GITHUB);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { owner: "", repo: "", branch: "main", baseDir: "", token: "" };
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
    instagramPosts: loadInstagramPosts(),
    configPatch: loadConfigPatch(),
    github: loadGithubSettings(),
    editingProjectId: null,
    editingVideoId: null,
    editingInstagramId: null,
    pendingCoverImage: null,
    pendingGalleryImages: [],
    pendingVideoFile: null,
    videoMode: "link",
  };

  function saveProjects() {}
  function saveVideos() { return true; }
  function saveInstagramPosts() {}
  function saveConfigPatch() {
    localStorage.setItem(LS_CONFIG, JSON.stringify(state.configPatch));
  }
  function saveGithubSettings() {
    localStorage.setItem(LS_GITHUB, JSON.stringify(state.github));
  }

  var CAT_LABELS = {
    kitchens: "مطابخ", wardrobes: "خزائن ملابس", bedrooms: "غرف نوم",
    decor: "ديكورات", promo: "دعائي عام",
  };

  function initGate() {
    var gate = document.getElementById("gate");
    var shell = document.getElementById("shell");
    var pass = document.getElementById("gatePass");
    var err = document.getElementById("gateErr");
    var btn = document.getElementById("gateBtn");
    var FALLBACK_PASSCODE = "123456789";

    function normalizeDigits(str) {
      var arabicIndic = "٠١٢٣٤٥٦٧٨٩";
      var persian = "۰۱۲۳۴۵۶۷۸۹";
      var converted = String(str).replace(/[٠-٩۰-۹]/g, function (ch) {
        var i = arabicIndic.indexOf(ch);
        if (i !== -1) return String(i);
        i = persian.indexOf(ch);
        if (i !== -1) return String(i);
        return ch;
      });
      return converted.replace(/\D/g, "");
    }

    var toggleBtn = document.getElementById("gateShowPass");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", function () {
        pass.type = pass.type === "password" ? "text" : "password";
        toggleBtn.textContent = pass.type === "password" ? "إظهار" : "إخفاء";
      });
    }

    function tryEnter() {
      var code = normalizeDigits((typeof SITE_CONFIG !== "undefined" && SITE_CONFIG.adminPasscode) || FALLBACK_PASSCODE);
      var entered = normalizeDigits(pass.value);
      if (entered === code && entered.length > 0) {
        sessionStorage.setItem(SS_AUTH, "1");
        localStorage.setItem(LS_OWNER, "1");
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
      localStorage.removeItem(LS_OWNER);
      location.reload();
    });
  }

  function goToPanel(name) {
    var btn = document.querySelector('.admin-nav button[data-panel="' + name + '"]');
    if (btn) btn.click();
  }
  function handleDeepLink() {
    var params = new URLSearchParams(location.search);
    var editSpec = params.get("edit");
    var newSpec = params.get("new");
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
    } else if (newSpec === "instagram") {
      goToPanel("instagram");
    }
    if (editSpec || newSpec) {
      history.replaceState(null, "", "admin.html");
    }
  }

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
    renderInstagramTable();
    fillCompanyForm();
    var fbSpan = document.querySelector("[data-cfg-fb-url]");
    if (fbSpan) fbSpan.textContent = (SITE_CONFIG.social.facebook || "").replace(/^https?:\/\/(www\.)?/, "");
    var igSpan = document.querySelector("[data-cfg-ig-url]");
    if (igSpan) igSpan.textContent = (SITE_CONFIG.social.instagram || "").replace(/^https?:\/\/(www\.)?/, "");
  }

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
        alert("تم الحذف مؤقتاً هنا فقط. اضغط الآن زر \"🚀 نشر مباشر على الموقع\" فوق الجدول حتى يُحذف فعلياً من الموقع — وإلا سيعود للظهور عند إعادة فتح لوحة التحكم.");
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
      alert("تم الحفظ هنا فقط. اضغط الآن \"🚀 نشر مباشر على الموقع\" حتى يظهر التغيير فعلياً لكل الزوار.");
    });
  }

  function exportProjects() {
    if (!state.projects.length) { alert("لا توجد مشاريع لتصديرها بعد."); return; }
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

  function detectVideoType(url) {
    if (/facebook\.com|fb\.watch/.test(url)) return "facebook";
    if (/youtube\.com|youtu\.be/.test(url)) return "youtube";
    if (/instagram\.com/.test(url)) return "instagram";
    if (/tiktok\.com/.test(url)) return "tiktok";
    if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return "file";
    return "link";
  }

  function renderVideosTable() {
    var tbody = document.getElementById("videosTbody");
    var empty = document.getElementById("videosEmpty");
    var table = document.getElementById("videosTable");
    if (!state.videos.length) { table.hidden = true; empty.hidden = false; return; }
    table.hidden = false; empty.hidden = true;
    tbody.innerHTML = state.videos.map(function (v, i) {
      var srcLabels = { facebook: "فيسبوك", youtube: "يوتيوب", instagram: "انستغرام", tiktok: "تيك توك", file: "ملف مرفوع", link: "رابط خارجي" };
      var src = srcLabels[v.type] || "رابط خارجي";
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
        alert("تم الحذف مؤقتاً هنا فقط. اضغط الآن زر \"🚀 نشر مباشر على الموقع\" فوق الجدول حتى يُحذف فعلياً من الموقع — وإلا سيعود للظهور عند إعادة فتح لوحة التحكم.");
      });
    });
  }

  function setVideoMode(mode) {
    state.videoMode = mode;
    document.querySelectorAll("#vModeToggle .mode-btn").forEach(function (b) {
      b.classList.toggle("is-active", b.dataset.mode === mode);
    });
    document.getElementById("vLinkGroup").hidden = mode !== "link";
    document.getElementById("vFileGroup").hidden = mode !== "file";
  }

  function resetVideoForm() {
    state.editingVideoId = null;
    state.pendingVideoFile = null;
    document.getElementById("videoFormTitle").textContent = "فيديو جديد";
    ["vUrl", "vTitleAr", "vTitleEn"].forEach(function (id) { document.getElementById(id).value = ""; });
    document.getElementById("vFile").value = "";
    document.getElementById("vFilePreview").innerHTML = "";
    document.getElementById("vFileNotice").hidden = true;
    document.getElementById("vCategory").value = "promo";
    document.getElementById("vTypeDetected").textContent = "";
    setVideoMode("link");
  }

  function openVideoForm(video) {
    resetVideoForm();
    var form = document.getElementById("videoForm");
    form.hidden = false;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    if (!video) return;
    state.editingVideoId = video.id;
    document.getElementById("videoFormTitle").textContent = "تعديل: " + video.title.ar;
    document.getElementById("vTitleAr").value = (video.title && video.title.ar) || "";
    document.getElementById("vTitleEn").value = (video.title && video.title.en) || "";
    document.getElementById("vCategory").value = video.category || "promo";
    if (video.type === "file") {
      setVideoMode("file");
      document.getElementById("vFilePreview").innerHTML = '<div class="a-thumb-item" style="width:160px;height:100px;"><video src="' + video.url + '" controls></video></div>';
      document.getElementById("vFileNotice").hidden = false;
    } else {
      setVideoMode("link");
      document.getElementById("vUrl").value = video.url || "";
    }
  }

  function initVideoForm() {
    document.getElementById("newVideoBtn").addEventListener("click", function () { openVideoForm(null); });
    document.getElementById("cancelVideoBtn").addEventListener("click", function () {
      document.getElementById("videoForm").hidden = true;
    });
    document.querySelectorAll("#vModeToggle .mode-btn").forEach(function (b) {
      b.addEventListener("click", function () { setVideoMode(b.dataset.mode); });
    });
    document.getElementById("vUrl").addEventListener("input", function (e) {
      var type = detectVideoType(e.target.value.trim());
      var labels = { facebook: "تم التعرف عليه كفيديو فيسبوك ✓", youtube: "تم التعرف عليه كفيديو يوتيوب ✓", instagram: "تم التعرف عليه كمنشور انستغرام ✓", tiktok: "تم التعرف عليه كفيديو تيك توك ✓", file: "سيُعامل كرابط ملف فيديو مباشر", link: "سيُعرض كرابط خارجي يُفتح في نافذة جديدة" };
      document.getElementById("vTypeDetected").textContent = e.target.value.trim() ? labels[type] : "";
    });

    document.getElementById("vFile").addEventListener("change", function (e) {
      var file = e.target.files[0];
      if (!file) return;
      fileToDataUrl(file).then(function (dataUrl) {
        state.pendingVideoFile = { dataUrl: dataUrl, ext: extFromFile(file), name: file.name };
        document.getElementById("vFilePreview").innerHTML = '<div class="a-thumb-item" style="width:160px;height:100px;"><video src="' + dataUrl + '" controls></video></div>';
        document.getElementById("vFileNotice").hidden = false;
      });
    });

    document.getElementById("videoForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var titleAr = document.getElementById("vTitleAr").value.trim();
      if (!titleAr) return;

      var existing = state.editingVideoId ? state.videos.find(function (v) { return v.id === state.editingVideoId; }) : null;
      var id = existing ? existing.id : slugId("video");
      var record;

      if (state.videoMode === "file") {
        var pending = state.pendingVideoFile || (existing && existing._pendingVideo);
        var url = pending ? pending.dataUrl : (existing ? existing.url : null);
        if (!url) { alert("الرجاء اختيار ملف فيديو."); return; }
        record = {
          id: id,
          type: "file",
          url: url,
          title: { ar: titleAr, en: document.getElementById("vTitleEn").value.trim() || titleAr },
          category: document.getElementById("vCategory").value,
        };
        if (state.pendingVideoFile) record._pendingVideo = state.pendingVideoFile;
        else if (existing && existing._pendingVideo) record._pendingVideo = existing._pendingVideo;
      } else {
        var linkUrl = document.getElementById("vUrl").value.trim();
        if (!linkUrl) { alert("الرجاء إدخال رابط الفيديو."); return; }
        record = {
          id: id,
          type: detectVideoType(linkUrl),
          url: linkUrl,
          title: { ar: titleAr, en: document.getElementById("vTitleEn").value.trim() || titleAr },
          category: document.getElementById("vCategory").value,
        };
      }

      if (existing) Object.assign(existing, record);
      else state.videos.push(record);

      var saved = saveVideos();
      renderVideosTable();
      document.getElementById("videoForm").hidden = true;
      if (!saved) {
        alert("تمت الإضافة ويمكنك تنزيلها الآن، لكن الفيديو كبير جداً على مساحة التخزين المؤقت لهذا المتصفح — لن يبقى محفوظاً هنا بعد إغلاق الصفحة، فتأكد من تنزيل ملفات الفيديوهات الآن قبل إغلاق لوحة التحكم.");
      } else {
        alert("تم الحفظ هنا فقط. اضغط الآن \"🚀 نشر مباشر على الموقع\" حتى يظهر التغيير فعلياً لكل الزوار.");
      }
    });
  }

  function exportVideos() {
    if (!state.videos.length) { alert("لا توجد فيديوهات لتصديرها بعد."); return; }
    var hadFiles = false;
    state.videos.forEach(function (v) {
      if (v._pendingVideo) {
        hadFiles = true;
        var filename = v.id + "." + v._pendingVideo.ext;
        downloadDataUrl(filename, v._pendingVideo.dataUrl);
        v.url = "videos/" + filename;
      }
    });

    var clean = state.videos.map(function (v) {
      return { id: v.id, type: v.type, url: v.url, title: v.title, category: v.category };
    });

    var content =
      "/**\n * بيانات الفيديوهات — تم إنشاؤه من لوحة التحكم\n" +
      " * ارفع هذا الملف ليحل محل js/videos.js على الاستضافة.\n" +
      (hadFiles ? " * ضع أي ملفات فيديو تم تنزيلها معه داخل مجلد videos/ على الاستضافة.\n" : "") +
      " */\n" +
      "let VIDEOS = " + JSON.stringify(clean, null, 2) + ";\n";
    downloadBlob("videos.js", content, "application/javascript;charset=utf-8");

    state.videos.forEach(function (v) { delete v._pendingVideo; });
    saveVideos();
  }

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

  function ensureInstagramEmbedScript(cb) {
    if (window.instgrm) { cb(); return; }
    var existing = document.getElementById("ig-embed-script");
    if (existing) { existing.addEventListener("load", cb); return; }
    var s = document.createElement("script");
    s.id = "ig-embed-script";
    s.src = "https://www.instagram.com/embed.js";
    s.async = true;
    s.onload = cb;
    document.body.appendChild(s);
  }

  function igEmbedHtml(url) {
    return '<blockquote class="instagram-media" data-instgrm-permalink="' + url + '" data-instgrm-version="14" style="margin:0 auto;max-width:400px;"></blockquote>';
  }

  function renderInstagramTable() {
    var tbody = document.getElementById("instagramTbody");
    var empty = document.getElementById("instagramEmpty");
    var table = document.getElementById("instagramTable");
    if (!state.instagramPosts.length) { table.hidden = true; empty.hidden = false; return; }
    table.hidden = false; empty.hidden = true;
    tbody.innerHTML = state.instagramPosts.map(function (p, i) {
      return '<tr>' +
        '<td><a href="' + p.url + '" target="_blank" rel="noopener">' + p.url + '</a></td>' +
        '<td>' + (p.caption || "") + '</td>' +
        '<td class="a-row-actions"><button class="a-btn sm danger" data-del-ig="' + i + '">حذف</button></td></tr>';
    }).join("");
    tbody.querySelectorAll("[data-del-ig]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (!confirm("حذف هذا المنشور؟")) return;
        state.instagramPosts.splice(+btn.dataset.delIg, 1);
        saveInstagramPosts(); renderInstagramTable();
      });
    });
  }

  function initInstagramImport() {
    document.getElementById("igImportBtn").addEventListener("click", function () {
      var url = document.getElementById("igImportUrl").value.trim();
      var box = document.getElementById("igImportPreview");
      if (!url) return;
      box.hidden = false;
      box.innerHTML = igEmbedHtml(url) +
        '<div class="a-form-actions"><button type="button" class="a-btn sm" id="igAddPost">➕ إضافة كمنشور مميّز</button></div>';
      ensureInstagramEmbedScript(function () {
        if (window.instgrm) window.instgrm.Embeds.process();
      });
      document.getElementById("igAddPost").addEventListener("click", function () {
        var caption = prompt("وصف مختصر لهذا المنشور (اختياري):", "") || "";
        state.instagramPosts.push({ id: slugId("ig"), url: url, caption: caption });
        saveInstagramPosts(); renderInstagramTable();
        alert("تمت الإضافة إلى المنشورات المميزة ✓");
      });
    });
  }

  function exportInstagram() {
    if (!state.instagramPosts.length) { alert("لا توجد منشورات انستغرام لتصديرها بعد."); return; }
    var content =
      "/**\n * منشورات انستغرام المميّزة — تم إنشاؤه من لوحة التحكم\n" +
      " * ارفع هذا الملف ليحل محل js/instagram.js على الاستضافة.\n */\n" +
      "let INSTAGRAM_POSTS = " + JSON.stringify(state.instagramPosts, null, 2) + ";\n";
    downloadBlob("instagram.js", content, "application/javascript;charset=utf-8");
  }

  function ghConfigured() {
    return !!(state.github.owner && state.github.repo && state.github.token);
  }
  function ghEncodePath(path) {
    return path.split("/").map(encodeURIComponent).join("/");
  }
  function ghFullPath(path) {
    var base = (state.github.baseDir || "").replace(/^\/+|\/+$/g, "");
    return base ? base + "/" + path : path;
  }
  function ghApiBase() {
    return "https://api.github.com/repos/" + encodeURIComponent(state.github.owner) + "/" + encodeURIComponent(state.github.repo);
  }
  function ghHeaders() {
    return {
      Authorization: "Bearer " + state.github.token,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
  }
  function utf8ToBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }
  async function ghGetSha(path) {
    var branch = state.github.branch || "main";
    var res = await fetch(ghApiBase() + "/contents/" + ghEncodePath(ghFullPath(path)) + "?ref=" + encodeURIComponent(branch), { headers: ghHeaders() });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("تعذّر قراءة " + path + " (HTTP " + res.status + ")");
    var data = await res.json();
    return data.sha;
  }
  async function ghPutFile(path, base64Content, message) {
    var branch = state.github.branch || "main";
    var sha = await ghGetSha(path);
    var body = { message: message, content: base64Content, branch: branch };
    if (sha) body.sha = sha;
    var res = await fetch(ghApiBase() + "/contents/" + ghEncodePath(ghFullPath(path)), {
      method: "PUT",
      headers: Object.assign({ "Content-Type": "application/json" }, ghHeaders()),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      var msg = "HTTP " + res.status;
      try { var j = await res.json(); if (j.message) msg = j.message; } catch (e2) {}
      throw new Error("فشل نشر " + path + ": " + msg);
    }
    return res.json();
  }

  async function ghApiJson(path, method, payload) {
    var res = await fetch(ghApiBase() + path, {
      method: method,
      headers: Object.assign({ "Content-Type": "application/json" }, ghHeaders()),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      var msg = "HTTP " + res.status;
      try { var j = await res.json(); if (j.message) msg = j.message; } catch (e2) {}
      throw new Error(msg);
    }
    return res.json();
  }

  async function ghCommitFiles(files, message) {
    var branch = state.github.branch || "main";
    var refData = await ghApiJson("/git/ref/" + ghEncodePath("heads/" + branch), "GET").catch(function (e) {
      throw new Error("تعذّر قراءة الفرع \"" + branch + "\": " + e.message);
    });
    var headCommitSha = refData.object.sha;
    var commitData = await ghApiJson("/git/commits/" + headCommitSha, "GET");
    var baseTreeSha = commitData.tree.sha;

    var entries = [];
    for (var i = 0; i < files.length; i++) {
      var f = files[i];
      var b64 = f.isBase64 ? f.content : utf8ToBase64(f.content);
      var blob = await ghApiJson("/git/blobs", "POST", { content: b64, encoding: "base64" });
      entries.push({ path: ghFullPath(f.path), mode: "100644", type: "blob", sha: blob.sha });
    }

    var newTree = await ghApiJson("/git/trees", "POST", { base_tree: baseTreeSha, tree: entries });
    var newCommit = await ghApiJson("/git/commits", "POST", { message: message, tree: newTree.sha, parents: [headCommitSha] });
    await fetch(ghApiBase() + "/git/refs/" + ghEncodePath("heads/" + branch), {
      method: "PATCH",
      headers: Object.assign({ "Content-Type": "application/json" }, ghHeaders()),
      body: JSON.stringify({ sha: newCommit.sha }),
    }).then(function (res) {
      if (!res.ok) throw new Error("فشل تحديث الفرع بعد النشر (HTTP " + res.status + ")");
    });
  }

  function ghStatusNotice() {
    var el = document.getElementById("ghStatusNotice");
    if (!el) return;
    if (ghConfigured()) {
      el.className = "notice ok";
      el.innerHTML = "✓ متصل بمستودع <b>" + state.github.owner + "/" + state.github.repo + "</b> (الفرع: " + (state.github.branch || "main") + "). أزرار \"🚀 نشر مباشر\" في كل تبويب جاهزة للعمل الآن.";
    } else {
      el.className = "notice";
      el.textContent = "لسه ما اترابط بحساب GitHub — عبّي البيانات بالأسفل مرة واحدة، وبعدها أزرار \"🚀 نشر مباشر\" في باقي التبويبات هتشتغل مباشرة.";
    }
  }

  function initGithubForm() {
    document.getElementById("ghOwner").value = state.github.owner || "";
    document.getElementById("ghRepo").value = state.github.repo || "";
    document.getElementById("ghBranch").value = state.github.branch || "main";
    document.getElementById("ghBaseDir").value = state.github.baseDir || "";
    document.getElementById("ghToken").value = state.github.token || "";
    ghStatusNotice();

    document.getElementById("ghShowToken").addEventListener("click", function () {
      var f = document.getElementById("ghToken");
      var isPwd = f.type === "password";
      f.type = isPwd ? "text" : "password";
      this.textContent = isPwd ? "إخفاء" : "إظهار";
    });

    document.getElementById("githubForm").addEventListener("submit", function (e) {
      e.preventDefault();
      state.github = {
        owner: document.getElementById("ghOwner").value.trim(),
        repo: document.getElementById("ghRepo").value.trim(),
        branch: document.getElementById("ghBranch").value.trim() || "main",
        baseDir: document.getElementById("ghBaseDir").value.trim(),
        token: document.getElementById("ghToken").value.trim(),
      };
      saveGithubSettings();
      if (!ghConfigured()) { ghStatusNotice(); return; }

      var notice = document.getElementById("ghStatusNotice");
      notice.className = "notice";
      notice.textContent = "جارٍ اختبار الاتصال...";
      ghGetSha("js/videos.js").then(function () {
        ghStatusNotice();
        alert("تم الاتصال بنجاح ✓");
      }).catch(function (err) {
        notice.className = "notice danger";
        notice.textContent = "تعذّر الاتصال: " + err.message + " — تأكد من اسم المستخدم/المستودع والصلاحيات الممنوحة للمفتاح.";
      });
    });

    document.getElementById("ghDisconnectBtn").addEventListener("click", function () {
      if (!confirm("سيتم حذف بيانات ربط GitHub (بما فيها المفتاح) من هذا المتصفح. متابعة؟")) return;
      state.github = { owner: "", repo: "", branch: "main", baseDir: "", token: "" };
      saveGithubSettings();
      document.getElementById("githubForm").reset();
      document.getElementById("ghBranch").value = "main";
      ghStatusNotice();
    });
  }

  function requireGithub() {
    if (ghConfigured()) return true;
    if (confirm("لسه ما اترابط بحساب GitHub. هل تريد الانتقال لتبويب \"النشر المباشر\" لربطه الآن؟")) {
      goToPanel("publish");
    }
    return false;
  }

  function setBtnBusy(btn, busyText) {
    btn.disabled = true;
    btn.dataset.origText = btn.textContent;
    btn.textContent = busyText;
  }
  function clearBtnBusy(btn) {
    btn.disabled = false;
    if (btn.dataset.origText) btn.textContent = btn.dataset.origText;
  }

  async function publishProjects(btn) {
    if (!requireGithub()) return;
    if (!state.projects.length) { alert("لا توجد مشاريع لنشرها بعد."); return; }
    setBtnBusy(btn, "⏳ جارٍ التحضير...");
    try {
      var filesToCommit = [];
      for (var p of state.projects) {
        if (p._pendingCover) {
          var cf = p.id + "-cover." + p._pendingCover.ext;
          filesToCommit.push({ path: "images/projects/" + cf, content: p._pendingCover.dataUrl.split(",")[1], isBase64: true });
          p.cover = "images/projects/" + cf;
          delete p._pendingCover;
        }
        if (p._pendingGallery && p._pendingGallery.length) {
          for (var gi = 0; gi < p._pendingGallery.length; gi++) {
            var g = p._pendingGallery[gi];
            var gf = p.id + "-g" + (gi + 1) + "." + g.ext;
            filesToCommit.push({ path: "images/projects/" + gf, content: g.dataUrl.split(",")[1], isBase64: true });
          }
          delete p._pendingGallery;
        }
      }
      var clean = state.projects.map(function (p) {
        var c = Object.assign({}, p);
        delete c._pendingCover; delete c._pendingGallery;
        return c;
      });
      var content = "/**\n * بيانات المشاريع — تم إنشاؤه من لوحة التحكم\n */\n" + "let PROJECTS = " + JSON.stringify(clean, null, 2) + ";\n";
      filesToCommit.push({ path: "js/projects.js", content: content, isBase64: false });

      btn.textContent = filesToCommit.length > 1 ? "⏳ جارٍ رفع الصور ونشر البيانات..." : "⏳ جارٍ النشر...";
      await ghCommitFiles(filesToCommit, "تحديث المشاريع من لوحة التحكم");

      saveProjects();
      renderProjectsTable();
      alert("تم نشر المشاريع على الموقع مباشرة ✓ (سيظهر التحديث خلال دقيقة أو دقيقتين)");
    } catch (err) {
      alert("حدث خطأ أثناء النشر: " + err.message);
    } finally {
      clearBtnBusy(btn);
    }
  }

  async function publishVideos(btn) {
    if (!requireGithub()) return;
    if (!state.videos.length) { alert("لا توجد فيديوهات لنشرها بعد."); return; }
    setBtnBusy(btn, "⏳ جارٍ التحضير...");
    try {
      var filesToCommit = [];
      for (var v of state.videos) {
        if (v._pendingVideo) {
          var filename = v.id + "." + v._pendingVideo.ext;
          filesToCommit.push({ path: "videos/" + filename, content: v._pendingVideo.dataUrl.split(",")[1], isBase64: true });
          v.url = "videos/" + filename;
          delete v._pendingVideo;
        }
      }
      var clean = state.videos.map(function (v) {
        return { id: v.id, type: v.type, url: v.url, title: v.title, category: v.category };
      });
      var content = "/**\n * بيانات الفيديوهات — تم إنشاؤه من لوحة التحكم\n */\n" + "let VIDEOS = " + JSON.stringify(clean, null, 2) + ";\n";
      filesToCommit.push({ path: "js/videos.js", content: content, isBase64: false });

      btn.textContent = filesToCommit.length > 1 ? "⏳ جارٍ رفع الفيديو ونشر البيانات..." : "⏳ جارٍ النشر...";
      await ghCommitFiles(filesToCommit, "تحديث الفيديوهات من لوحة التحكم");

      saveVideos();
      renderVideosTable();
      alert("تم نشر الفيديو على الموقع مباشرة ✓ (سيظهر في صفحة الفيديوهات خلال دقيقة أو دقيقتين)");
    } catch (err) {
      alert("حدث خطأ أثناء النشر: " + err.message);
    } finally {
      clearBtnBusy(btn);
    }
  }

  async function publishInstagram(btn) {
    if (!requireGithub()) return;
    if (!state.instagramPosts.length) { alert("لا توجد منشورات انستغرام لنشرها بعد."); return; }
    setBtnBusy(btn, "⏳ جارٍ النشر...");
    try {
      var content = "/**\n * منشورات انستغرام المميّزة — تم إنشاؤه من لوحة التحكم\n */\n" + "let INSTAGRAM_POSTS = " + JSON.stringify(state.instagramPosts, null, 2) + ";\n";
      await ghPutFile("js/instagram.js", utf8ToBase64(content), "تحديث منشورات انستغرام من لوحة التحكم");
      alert("تم نشر منشورات انستغرام على الموقع مباشرة ✓");
    } catch (err) {
      alert("حدث خطأ أثناء النشر: " + err.message);
    } finally {
      clearBtnBusy(btn);
    }
  }

  async function publishConfig(btn) {
    if (!requireGithub()) return;
    setBtnBusy(btn, "⏳ جارٍ النشر...");
    try {
      if (state.pendingBgImage) {
        var bgPath = "images/branding/site-bg." + state.pendingBgImage.ext;
        SITE_CONFIG.siteBackgroundImage = bgPath;
        btn.textContent = "⏳ جارٍ رفع صورة الخلفية ونشر البيانات...";
        await ghCommitFiles([
          { path: bgPath, content: state.pendingBgImage.dataUrl.split(",")[1], isBase64: true },
          { path: "js/config.js", content: buildConfigFileContent(), isBase64: false },
        ], "تحديث بيانات الشركة وصورة الخلفية من لوحة التحكم");
        state.pendingBgImage = null;
      } else {
        await ghPutFile("js/config.js", utf8ToBase64(buildConfigFileContent()), "تحديث بيانات الشركة من لوحة التحكم");
      }
      alert("تم نشر بيانات الشركة على الموقع مباشرة ✓");
    } catch (err) {
      alert("حدث خطأ أثناء النشر: " + err.message);
    } finally {
      clearBtnBusy(btn);
    }
  }

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
    document.getElementById("cYoutube").value = s.youtube || "";
    document.getElementById("cSnapchat").value = s.snapchat || "";
    var mapsQuery = SITE_CONFIG.googleMapsQuery || "";
    document.getElementById("cMapsQuery").value = mapsQuery.startsWith("[") ? "" : mapsQuery;
    document.getElementById("cMaps").value = SITE_CONFIG.googleMapsEmbedUrl || "";
    document.getElementById("cTickerAr").value = (SITE_CONFIG.tickerText && SITE_CONFIG.tickerText.ar) || "";
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

    state.pendingBgImage = null;
    if (SITE_CONFIG.siteBackgroundImage && SITE_CONFIG.siteBackgroundImage.indexOf("[") !== 0 && SITE_CONFIG.siteBackgroundImage.trim()) {
      document.getElementById("cBgImagePreview").innerHTML = '<div class="a-thumb-item"><img src="' + SITE_CONFIG.siteBackgroundImage + '" /></div>';
    }
    document.getElementById("cBgImageFile").addEventListener("change", function (e) {
      var file = e.target.files[0];
      if (!file) return;
      fileToDataUrl(file).then(function (dataUrl) {
        state.pendingBgImage = { dataUrl: dataUrl, ext: extFromFile(file) };
        document.getElementById("cBgImagePreview").innerHTML = '<div class="a-thumb-item"><img src="' + dataUrl + '" /></div>';
      });
    });

    function applyCompanyFormPatch() {
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
          youtube: document.getElementById("cYoutube").value.trim(),
          snapchat: document.getElementById("cSnapchat").value.trim(),
        },
        googleMapsQuery: document.getElementById("cMapsQuery").value.trim(),
        googleMapsEmbedUrl: document.getElementById("cMaps").value.trim(),
        tickerText: {
          ar: document.getElementById("cTickerAr").value.trim(),
          en: (SITE_CONFIG.tickerText && SITE_CONFIG.tickerText.en) || "",
        },
      };
      state.configPatch = patch;
      saveConfigPatch();
      Object.assign(SITE_CONFIG.contact, patch.contact);
      Object.assign(SITE_CONFIG.social, patch.social);
      SITE_CONFIG.googleMapsQuery = patch.googleMapsQuery;
      SITE_CONFIG.googleMapsEmbedUrl = patch.googleMapsEmbedUrl;
      SITE_CONFIG.tickerText = patch.tickerText;
    }

    document.getElementById("companyForm").addEventListener("submit", function (e) {
      e.preventDefault();
      applyCompanyFormPatch();
      var note = document.getElementById("companySavedNote");
      note.hidden = false;
      setTimeout(function () { note.hidden = true; }, 4000);
    });

    document.getElementById("exportConfigBtn").addEventListener("click", exportConfig);
    document.getElementById("publishConfigBtn").addEventListener("click", function () {
      applyCompanyFormPatch();
      publishConfig(this);
    });
  }

  function buildConfigFileContent() {
    var c = SITE_CONFIG;
    return (
      "/**\n * ============================================================\n" +
      " *  دار الإتقان للمطابخ والديكورات — ملف الإعدادات المركزي\n" +
      " *  تم إنشاؤه من لوحة التحكم — ارفعه ليحل محل js/config.js\n" +
      " * ============================================================\n */\n\n" +
      "const SITE_CONFIG = " + JSON.stringify({
        companyName: c.companyName, tagline: c.tagline, shortDescription: c.shortDescription, country: c.country,
        contact: c.contact, social: c.social, googleMapsQuery: c.googleMapsQuery, googleMapsEmbedUrl: c.googleMapsEmbedUrl,
        siteBackgroundImage: c.siteBackgroundImage || "",
        whatsappDefaultMessage: c.whatsappDefaultMessage, tickerText: c.tickerText, nav: c.nav, adminPasscode: c.adminPasscode,
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
      "}\n"
    );
  }

  function exportConfig() {
    downloadBlob("config.js", buildConfigFileContent(), "application/javascript;charset=utf-8");
  }

  document.addEventListener("DOMContentLoaded", function () {
    initGate();
    initTabs();
    initProjectForm();
    initVideoForm();
    initFacebookImport();
    initInstagramImport();
    initCompanyForm();
    initGithubForm();
    document.getElementById("exportProjectsBtn").addEventListener("click", exportProjects);
    document.getElementById("exportVideosBtn").addEventListener("click", exportVideos);
    document.getElementById("exportInstagramBtn").addEventListener("click", exportInstagram);
    document.getElementById("publishProjectsBtn").addEventListener("click", function () { publishProjects(this); });
    document.getElementById("publishVideosBtn").addEventListener("click", function () { publishVideos(this); });
    document.getElementById("publishInstagramBtn").addEventListener("click", function () { publishInstagram(this); });
  });
})();
