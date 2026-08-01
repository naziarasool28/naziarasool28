(function () {
  "use strict";

  /* ---------- theme toggle ---------- */
  var root = document.documentElement;
  var themeToggle = document.getElementById("themeToggle");
  var storedTheme = null;
  try { storedTheme = localStorage.getItem("theme"); } catch (e) {}
  if (storedTheme) root.setAttribute("data-theme", storedTheme);

  function isDark() {
    var attr = root.getAttribute("data-theme");
    if (attr === "dark") return true;
    if (attr === "light") return false;
    // dark is the default look; only explicit light OS preference opts out
    return !window.matchMedia("(prefers-color-scheme: light)").matches;
  }
  function updateThemeIcon() {
    if (themeToggle) themeToggle.textContent = isDark() ? "☀" : "◐";
  }
  updateThemeIcon();
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      updateThemeIcon();
    });
  }

  /* ---------- mobile nav ---------- */
  var hamburger = document.getElementById("hamburger");
  var navLinks = document.getElementById("navLinks");
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      hamburger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navLinks.classList.remove("is-open");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- scroll-spy nav highlighting (single-page anchors) ---------- */
  if (navLinks) {
    var anchorLinks = Array.prototype.slice.call(navLinks.querySelectorAll('a[href^="#"]'));
    var spySections = anchorLinks
      .map(function (a) {
        var id = a.getAttribute("href").slice(1);
        var el = document.getElementById(id);
        return el ? { link: a, el: el } : null;
      })
      .filter(Boolean);

    if (spySections.length && "IntersectionObserver" in window) {
      var spyObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            var match = spySections.find(function (s) { return s.el === entry.target; });
            if (!match) return;
            if (entry.isIntersecting) {
              anchorLinks.forEach(function (a) { a.removeAttribute("aria-current"); });
              match.link.setAttribute("aria-current", "page");
            }
          });
        },
        { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
      );
      spySections.forEach(function (s) { spyObserver.observe(s.el); });
    }
  }

  /* ---------- scroll reveal ---------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- case studies: filter ---------- */
  var filterBar = document.getElementById("filterBar");
  var caseCards = document.querySelectorAll(".case-card");
  if (filterBar && caseCards.length) {
    filterBar.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-filter]");
      if (!btn) return;
      filterBar.querySelectorAll("button").forEach(function (b) {
        b.setAttribute("aria-pressed", "false");
      });
      btn.setAttribute("aria-pressed", "true");
      var filter = btn.getAttribute("data-filter");
      caseCards.forEach(function (card) {
        var match = filter === "all" || card.getAttribute("data-category") === filter;
        card.style.display = match ? "" : "none";
      });
    });
  }

  /* ---------- case studies: detail modal ---------- */
  var modal = document.getElementById("caseModal");
  if (modal) {
    var modalBody = modal.querySelector("[data-modal-body]");
    var modalCloseEls = modal.querySelectorAll("[data-modal-close]");
    var lastFocused = null;

    function openModal(card) {
      var detail = card.querySelector(".case-detail");
      if (!detail || !modalBody) return;
      modalBody.innerHTML = detail.innerHTML;
      lastFocused = document.activeElement;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      var closeBtn = modal.querySelector(".modal-close");
      if (closeBtn) closeBtn.focus();
    }
    function closeModal() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lastFocused) lastFocused.focus();
    }
    caseCards.forEach(function (card) {
      var trigger = card.querySelector("[data-open-modal]");
      if (trigger) {
        trigger.addEventListener("click", function () { openModal(card); });
      }
    });
    modalCloseEls.forEach(function (el) {
      el.addEventListener("click", closeModal);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
    });
  }

  /* ---------- contact form validation ---------- */
  var form = document.getElementById("contactForm");
  if (form) {
    var statusEl = document.getElementById("formStatus");

    function setError(field, message) {
      var wrap = field.closest(".field");
      if (!wrap) return;
      wrap.classList.add("has-error");
      var msg = wrap.querySelector(".error-msg");
      if (msg) msg.textContent = message;
    }
    function clearError(field) {
      var wrap = field.closest(".field");
      if (!wrap) return;
      wrap.classList.remove("has-error");
    }
    function validEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      var name = form.querySelector("#name");
      var email = form.querySelector("#email");
      var subject = form.querySelector("#subject");
      var msg = form.querySelector("#message");

      [name, email, subject, msg].forEach(clearError);

      if (!name.value.trim()) { setError(name, "Please enter your name."); valid = false; }
      if (!email.value.trim()) { setError(email, "Please enter your email."); valid = false; }
      else if (!validEmail(email.value.trim())) { setError(email, "Please enter a valid email address."); valid = false; }
      if (!subject.value.trim()) { setError(subject, "Please add a subject."); valid = false; }
      if (!msg.value.trim() || msg.value.trim().length < 10) {
        setError(msg, "Please add a message (at least 10 characters).");
        valid = false;
      }

      if (!valid) {
        if (statusEl) {
          statusEl.textContent = "Please fix the highlighted fields and try again.";
          statusEl.className = "form-status show";
        }
        return;
      }

      var reason = form.querySelector("#reason");
      var reasonLine = reason && reason.value ? "Re: " + reason.value + "\n\n" : "";
      var mailSubject = encodeURIComponent(subject.value.trim());
      var mailBody = encodeURIComponent(
        reasonLine + msg.value.trim() + "\n\n— " + name.value.trim() + " (" + email.value.trim() + ")"
      );
      window.location.href = "mailto:naziarasool28@gmail.com?subject=" + mailSubject + "&body=" + mailBody;

      if (statusEl) {
        statusEl.textContent =
          "Thanks, " + name.value.trim().split(" ")[0] + "! Your email app should be opening now — if it doesn't, email naziarasool28@gmail.com directly.";
        statusEl.className = "form-status show success";
      }
      form.reset();
    });
  }
})();
