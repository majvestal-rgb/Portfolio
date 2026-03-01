/**
 * Loads content.json and injects values into elements with data-content or data-content-html.
 * Use data-content="path.to.key" for plain text, data-content-html="path.to.key" for HTML.
 */
(function () {
  function get(obj, path) {
    if (!obj || !path) return undefined;
    return path.split(".").reduce(function (o, k) {
      return o != null ? o[k] : undefined;
    }, obj);
  }

  function apply(content) {
    document.querySelectorAll("[data-content]").forEach(function (el) {
      var key = el.getAttribute("data-content");
      var val = get(content, key);
      if (val != null && typeof val === "string") el.textContent = val;
    });
    document.querySelectorAll("[data-content-html]").forEach(function (el) {
      var key = el.getAttribute("data-content-html");
      var val = get(content, key);
      if (val != null && typeof val === "string") el.innerHTML = val;
    });
  }

  function init() {
    fetch("./content.json")
      .then(function (r) {
        if (!r.ok) throw new Error("Failed to load content.json");
        return r.json();
      })
      .then(apply)
      .catch(function (err) {
        console.warn("Content loader:", err.message);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
