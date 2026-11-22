(function () {
  var KEY = "mv_aesthetic";
  var FUN_KEY = "mv_fun";
  var PASS_FUN = "lilypad";

  function isFunFile() {
    var path = (location.pathname || "").split("/").pop().toLowerCase();
    return /^(fun|paintings|sketchbook|writing|illustration|threed|library|library-music|library-books|library-movies|contact|cats)\.html$/.test(path);
  }

  function funOpen() {
    try {
      return sessionStorage.getItem(FUN_KEY) === "yes";
    } catch (e) {
      return false;
    }
  }

  if (isFunFile() && !funOpen()) {
    document.documentElement.classList.add("mv-fun-lock");
  }

  function read() {
    try {
      return localStorage.getItem(KEY) === "neo" ? "neo" : "clean";
    } catch (e) {
      return "clean";
    }
  }

  function write(mode) {
    try {
      localStorage.setItem(KEY, mode);
    } catch (e) {}
  }

  function ensureFont() {
    if (document.getElementById("neo-font")) return;
    var link = document.createElement("link");
    link.id = "neo-font";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=DotGothic16&family=Jacquarda+Bastarda+9&display=swap";
    document.head.appendChild(link);
  }

  function apply(mode) {
    var neo = mode === "neo";
    if (neo) {
      document.documentElement.setAttribute("data-aesthetic", "neo");
      ensureFont();
    } else {
      document.documentElement.removeAttribute("data-aesthetic");
    }
    var btn = document.getElementById("aesthetic-toggle");
    if (btn) {
      btn.setAttribute("aria-pressed", neo ? "true" : "false");
      btn.textContent = neo ? "job mode" : "fun mode";
      btn.setAttribute(
        "aria-label",
        neo ? "Switch to clean job mode" : "Switch to fun mode"
      );
    }
    var brand = document.querySelector(".brand");
    if (brand) {
      if (!brand.getAttribute("data-clean-href")) {
        brand.setAttribute("data-clean-href", brand.getAttribute("href") || "work.html?p=1");
      }
      brand.setAttribute("href", neo ? "fun.html" : brand.getAttribute("data-clean-href"));
    }
  }

  var here = (location.pathname || "").toLowerCase();

  apply(read());

  function mountFunGate() {
    if (!isFunFile() || funOpen()) {
      document.documentElement.classList.remove("mv-fun-lock");
      return;
    }
    if (document.querySelector(".fun-gate")) return;
    var gate = document.createElement("div");
    gate.className = "password-screen is-visible fun-gate";
    gate.setAttribute("aria-label", "Fun mode password");
    gate.innerHTML =
      '<div class="password-screen-inner">' +
      '<p class="password-screen-label">Password required</p>' +
      '<form class="password-form" autocomplete="off">' +
      '<input type="password" class="password-input" placeholder="Enter password" autocomplete="off" aria-label="Fun mode password" />' +
      '<button type="submit" class="password-submit"><span class="password-submit-job">Enter</span><span class="password-submit-fun">ENTER HERE</span></button>' +
      "</form>" +
      '<p class="password-splash-line">CLICK TO ENTER.</p>' +
      '<p class="password-error" aria-live="polite" hidden>Incorrect password</p>' +
      '<button type="button" class="fun-gate-job">job mode</button>' +
      "</div>";
    document.body.appendChild(gate);
    var form = gate.querySelector("form");
    var input = gate.querySelector("input");
    var error = gate.querySelector(".password-error");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if ((input.value || "").trim() === PASS_FUN) {
        try { sessionStorage.setItem(FUN_KEY, "yes"); } catch (err) {}
        write("neo");
        apply("neo");
        document.documentElement.classList.remove("mv-fun-lock");
        gate.remove();
        return;
      }
      error.hidden = false;
      input.focus();
    });
    gate.querySelector(".fun-gate-job").addEventListener("click", function () {
      write("clean");
      window.location.href = "work.html?p=1";
    });
    input.focus();
  }

  function mount() {
    mountFunGate();
    if (!document.getElementById("aesthetic-toggle")) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.id = "aesthetic-toggle";
      btn.className = "aesthetic-toggle";
      btn.addEventListener("click", function () {
        var funSite =
          document.body.classList.contains("neo-landing") ||
          document.body.classList.contains("neo-personal");
        var next =
          document.documentElement.getAttribute("data-aesthetic") === "neo"
            ? "clean"
            : "neo";
        write(next);
        apply(next);
        var onMisc = /(^|\/)misc\.html$/.test(here);
        if (next === "neo" && !funSite) {
          window.location.href = "fun.html";
          return;
        }
        if (next === "clean" && (funSite || onMisc)) {
          window.location.href = "work.html?p=1";
        }
      });
      document.body.appendChild(btn);
    }

    var page = document.querySelector(".page");
    if (page && !page.querySelector(".neo-chrome")) {
      var line =
        "welcome · thank you for visiting ^_^ · the way out is back home · ";
      var chrome = document.createElement("div");
      chrome.className = "neo-chrome";
      chrome.innerHTML =
        '<div class="neo-banner">' +
        '<p class="neo-kicker">welcome, traveller</p>' +
        '<div class="neo-marquee"><span><span>' +
        line +
        '</span><span aria-hidden="true">' +
        line +
        "</span></span></div></div>";
      page.insertBefore(chrome, page.firstChild);
    }

    var nav = document.querySelector(".nav");
    if (nav && !nav.getAttribute("data-clean-html")) {
      nav.setAttribute("data-clean-html", nav.innerHTML);
      nav.setAttribute("data-clean-label", nav.getAttribute("aria-label") || "Main navigation");
    }
    function paintNav() {
      if (!nav) return;
      if (read() === "neo" && !document.body.classList.contains("neo-landing")) {
        nav.setAttribute("aria-label", "Leave this room");
        nav.innerHTML = '<a class="nav-link neo-back" href="fun.html">back to home</a>';
      } else {
        nav.setAttribute("aria-label", nav.getAttribute("data-clean-label") || "Main navigation");
        nav.innerHTML = nav.getAttribute("data-clean-html") || nav.innerHTML;
      }
    }
    paintNav();

    var toggle = document.getElementById("aesthetic-toggle");
    if (toggle && !toggle.getAttribute("data-nav-bound")) {
      toggle.setAttribute("data-nav-bound", "1");
      toggle.addEventListener("click", paintNav);
    }

    apply(read());
    mountCursor();
    mountLightbox();
  }

  function mountLightbox() {
    if (document.getElementById("neo-lightbox")) return;
    if (!document.querySelector(".shelf-item img, .shelf-item video")) return;

    var box = document.createElement("div");
    box.id = "neo-lightbox";
    box.className = "neo-lightbox";
    box.hidden = true;
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Image");
    box.innerHTML =
      '<button type="button" class="neo-lightbox-close">close</button>' +
      '<button type="button" class="neo-lightbox-prev">prev</button>' +
      '<button type="button" class="neo-lightbox-next">next</button>' +
      '<figure class="neo-lightbox-stage">' +
      '<div class="neo-lightbox-media"></div>' +
      '<figcaption class="neo-lightbox-caption"></figcaption>' +
      "</figure>";
    document.body.appendChild(box);

    var stage = box.querySelector(".neo-lightbox-media");
    var caption = box.querySelector(".neo-lightbox-caption");
    var prevBtn = box.querySelector(".neo-lightbox-prev");
    var nextBtn = box.querySelector(".neo-lightbox-next");
    var closeBtn = box.querySelector(".neo-lightbox-close");
    var items = [];
    var index = 0;
    var lastFocus = null;

    function collect() {
      return [].slice.call(document.querySelectorAll(".shelf-item img, .shelf-item video"));
    }

    function show(i) {
      items = collect();
      if (!items.length) return;
      index = (i + items.length) % items.length;
      var srcEl = items[index];
      var src = srcEl.currentSrc || srcEl.getAttribute("src");
      stage.innerHTML = "";
      var media;
      if (srcEl.tagName === "VIDEO") {
        media = document.createElement("video");
        media.src = src;
        media.controls = true;
        media.autoplay = true;
        media.loop = true;
        media.playsInline = true;
        media.setAttribute("playsinline", "");
      } else {
        media = document.createElement("img");
        media.src = src;
        media.alt = srcEl.alt || "";
      }
      stage.appendChild(media);
      var fig = srcEl.closest("figure");
      var cap = fig && fig.querySelector("figcaption");
      caption.textContent = cap ? cap.textContent.replace(/\s+/g, " ").trim() : "";
      caption.hidden = !caption.textContent;
      box.setAttribute("aria-label", caption.textContent || "Image");
      var single = items.length < 2;
      prevBtn.hidden = single;
      nextBtn.hidden = single;
      box.hidden = false;
      document.body.classList.add("neo-lightbox-open");
      closeBtn.focus();
    }

    function close() {
      box.hidden = true;
      stage.innerHTML = "";
      document.body.classList.remove("neo-lightbox-open");
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    document.querySelectorAll(".shelf-item").forEach(function (fig) {
      if (!fig.querySelector("img, video")) return;
      fig.tabIndex = 0;
      fig.setAttribute("role", "button");
      var cap = fig.querySelector("figcaption");
      fig.setAttribute("aria-label", cap ? cap.textContent.replace(/\s+/g, " ").trim() : "Open image");
    });

    document.addEventListener("click", function (event) {
      var fig = event.target.closest(".shelf-item");
      if (!fig) return;
      var media = fig.querySelector("img, video");
      if (!media) return;
      event.preventDefault();
      lastFocus = fig;
      items = collect();
      show(Math.max(0, items.indexOf(media)));
    });

    document.addEventListener("keydown", function (event) {
      var fig = event.target.closest && event.target.closest(".shelf-item");
      if (fig && (event.key === "Enter" || event.key === " ")) {
        var media = fig.querySelector("img, video");
        if (!media) return;
        event.preventDefault();
        lastFocus = fig;
        items = collect();
        show(Math.max(0, items.indexOf(media)));
        return;
      }
      if (box.hidden) return;
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") show(index - 1);
      if (event.key === "ArrowRight") show(index + 1);
    });

    box.addEventListener("click", function (event) {
      if (event.target === box) close();
    });
    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", function () { show(index - 1); });
    nextBtn.addEventListener("click", function () { show(index + 1); });
  }

  function mountCursor() {
    if (read() !== "neo") return;
    if (document.documentElement.getAttribute("data-ani-cursor")) return;
    document.documentElement.setAttribute("data-ani-cursor", "1");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var fine = window.matchMedia("(pointer: fine)").matches;
    if (reduce || !fine) return;

    var seq = [0, 1, 2, 3, 4, 5, 6, 7, 8, 7, 6, 5, 4, 3, 2, 1];
    var frames = [];
    for (var i = 0; i < 9; i++) {
      var pre = new Image();
      pre.src = "assets/cursor/arrow/" + i + ".png";
      frames.push(pre);
    }
    var el = document.createElement("img");
    el.className = "neo-ani-cursor";
    el.alt = "";
    el.setAttribute("aria-hidden", "true");
    el.src = frames[0].src;
    document.body.appendChild(el);
    document.documentElement.classList.add("neo-ani-cursor");

    var step = 0;
    var last = 0;
    var x = 0;
    var y = 0;
    var visible = false;
    window.addEventListener("mousemove", function (event) {
      x = event.clientX;
      y = event.clientY;
      el.style.transform = "translate(" + x + "px," + y + "px)";
      if (!visible) {
        visible = true;
        el.classList.add("is-on");
      }
    });
    document.documentElement.addEventListener("mouseleave", function () {
      visible = false;
      el.classList.remove("is-on");
    });
    function tick(now) {
      if (!last) last = now;
      if (now - last >= (8 / 60) * 1000) {
        last = now;
        step = (step + 1) % seq.length;
        el.src = frames[seq[step]].src;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
