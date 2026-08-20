/**
 * دمج المسودّة المحفوظة من لوحة التحكم (admin.html) — إن وُجدت —
 * قبل عرض الصفحة، حتى تشاهد تعديلاتك فوراً في نفس المتصفح دون
 * الحاجة لتنزيل الملفات ورفعها كل مرة أثناء المراجعة.
 *
 * ملاحظة: هذا يعمل داخل متصفحك فقط. لنشر التعديلات لجميع الزوار
 * يجب تنزيل الملفات المحدَّثة من لوحة التحكم ورفعها للاستضافة —
 * راجع README.md.
 */
(function () {
  try {
    var dp = localStorage.getItem("itqan_admin_projects");
    if (dp && typeof PROJECTS !== "undefined") PROJECTS = JSON.parse(dp);
  } catch (e) {}

  try {
    var dv = localStorage.getItem("itqan_admin_videos");
    if (dv && typeof VIDEOS !== "undefined") VIDEOS = JSON.parse(dv);
  } catch (e) {}

  try {
    var dc = localStorage.getItem("itqan_admin_config");
    if (dc) {
      var patch = JSON.parse(dc);
      Object.keys(patch).forEach(function (k) {
        if (patch[k] && typeof patch[k] === "object" && !Array.isArray(patch[k]) && SITE_CONFIG[k]) {
          Object.assign(SITE_CONFIG[k], patch[k]);
        } else {
          SITE_CONFIG[k] = patch[k];
        }
      });
    }
  } catch (e) {}
})();
