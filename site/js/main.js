// The only JavaScript on the site: the mobile menu toggle.
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
