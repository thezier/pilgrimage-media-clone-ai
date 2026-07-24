// Site JavaScript: mobile menu toggle, smooth-scroll nav, and the contact form.
// Everything else is static HTML — the page renders fully without this file.
(function () {
  "use strict";

  var toggle = document.getElementById("nav-toggle");
  var close = document.getElementById("nav-close");
  var menu = document.getElementById("mobile-menu");
  if (!toggle || !close || !menu) return;

  function setOpen(open) {
    menu.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    // Class rather than an inline style, so the rule lives in the CSS
    // where you'd look for it.
    document.body.classList.toggle("menu-open", open);
    (open ? close : toggle).focus();
  }

  toggle.addEventListener("click", function () {
    setOpen(true);
  });
  close.addEventListener("click", function () {
    setOpen(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !menu.hidden) setOpen(false);
  });

  // Close after following an in-page anchor, otherwise the overlay stays
  // up over the section you just jumped to.
  menu.addEventListener("click", function (e) {
    if (e.target.closest("a")) setOpen(false);
  });
})();

// Smooth-scroll nav: clicking a nav link that points to a section on THIS page
// (e.g. "/#portfolio" while on the homepage) glides down to it instead of
// jumping. Links that genuinely go elsewhere — About, Contact, or "/#portfolio"
// clicked from a subpage — navigate normally, and the homepage then lands on
// the section as usual. Honors prefers-reduced-motion.
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var onHome =
    location.pathname === "/" || location.pathname === "/index.html";

  // Given a link's href, return the target element ONLY if it's a section on
  // the current page; otherwise null (let the browser navigate normally).
  function sectionOnThisPage(href) {
    if (!href) return null;
    var hash = href.indexOf("#");
    if (hash === -1) return null; // no fragment → a real navigation
    var id = href.slice(hash + 1);
    if (!id) return null;
    var pathPart = href.slice(0, hash);
    // "/#id" or absolute "…/#id" is only in-page when we're on the homepage;
    // from a subpage it must navigate home first.
    var pathIsHome = pathPart === "" || pathPart === "/" || pathPart === location.pathname;
    if (!pathIsHome || (pathPart !== "" && !onHome)) return null;
    return document.getElementById(id);
  }

  function glideTo(el) {
    // "instant" (not "auto") forces an immediate jump for reduced-motion users;
    // "auto" would defer to the CSS scroll-behavior, which is smooth.
    el.scrollIntoView({ behavior: reduce ? "instant" : "smooth", block: "start" });
  }

  // Delegated so it covers both the desktop nav and the mobile overlay (the
  // overlay closes itself first, then this scrolls the now-unlocked page).
  document.addEventListener("click", function (e) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest("a[href]");
    if (!a) return;
    var linkTarget = a.getAttribute("target");
    if (linkTarget && linkTarget !== "_self") return;

    var el = sectionOnThisPage(a.getAttribute("href"));
    if (!el) return;

    e.preventDefault();
    glideTo(el);
    // Keep the URL shareable and the back button working, without a second jump.
    if (history.pushState) history.pushState(null, "", "#" + el.id);
  });
})();

// Gallery lightbox: click any photo in a project's masonry gallery to view it
// full-size, with prev/next and keyboard navigation through the rest of that
// gallery. Only present on individual project pages — .project-gallery and
// #lightbox don't exist elsewhere, so this is a no-op there.
(function () {
  "use strict";

  var gallery = document.querySelector(".project-gallery");
  var lightbox = document.getElementById("lightbox");
  if (!gallery || !lightbox) return;

  var img = document.getElementById("lightbox-img");
  var closeBtn = document.getElementById("lightbox-close");
  var prevBtn = document.getElementById("lightbox-prev");
  var nextBtn = document.getElementById("lightbox-next");
  var photos = Array.prototype.slice.call(gallery.querySelectorAll("img"));
  var index = 0;
  var opener = null;

  function show(i) {
    index = (i + photos.length) % photos.length;
    var source = photos[index];
    // The <img>'s own src is already the largest generated size (see
    // build.mjs), so no separate full-res asset is needed here.
    img.src = source.src;
    img.alt = source.alt;
  }

  function open(i, trigger) {
    opener = trigger || null;
    show(i);
    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
    closeBtn.focus();
  }

  function close() {
    lightbox.hidden = true;
    document.body.classList.remove("lightbox-open");
    // Return focus to the thumbnail that opened it, not wherever the DOM
    // default would land (usually <body>).
    if (opener) opener.focus();
  }

  gallery.addEventListener("click", function (e) {
    var clicked = e.target.closest("img");
    if (!clicked) return;
    open(photos.indexOf(clicked), clicked);
  });

  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", function () {
    show(index - 1);
  });
  nextBtn.addEventListener("click", function () {
    show(index + 1);
  });

  // Click on the scrim (not the image or the nav buttons) also closes it.
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) close();
  });

  document.addEventListener("keydown", function (e) {
    if (lightbox.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(index - 1);
    else if (e.key === "ArrowRight") show(index + 1);
  });
})();

// Contact form: submit in place via fetch, so the visitor stays on the page and
// sees a status message. Without this, the form still works — it does a plain
// POST and the Worker returns an HTML thank-you page.
(function () {
  "use strict";

  var form = document.getElementById("enquiry");
  var status = document.getElementById("form-status");
  if (!form || !status) return;

  function show(message, isError) {
    status.textContent = message;
    status.classList.toggle("is-error", !!isError);
    status.hidden = false;
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    var button = form.querySelector('button[type="submit"]');

    // Bundle the fields, collapsing the multi-value "services" checkboxes.
    var fd = new FormData(form);
    var payload = {};
    fd.forEach(function (value, key) {
      if (key in payload) {
        payload[key] = [].concat(payload[key], value);
      } else {
        payload[key] = value;
      }
    });

    button.disabled = true;
    show("Sending…", false);

    try {
      var res = await fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      var data = await res.json().catch(function () {
        return {};
      });

      if (res.ok && data.ok) {
        form.reset();
        show("Thanks — your message is on its way. I'll be in touch soon.", false);
      } else {
        show(data.error || "Something went wrong. Please try again.", true);
        button.disabled = false;
      }
    } catch {
      show("Couldn't send — check your connection and try again.", true);
      button.disabled = false;
    }
  });
})();
