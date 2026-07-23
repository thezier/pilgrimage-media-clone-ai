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
