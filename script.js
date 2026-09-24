/* ============================================================
   АвтоБум — интерактив: меню, якоря, табы, аккордеон, модалка,
   маска телефона, отправка формы, cookie, кнопка «наверх».
   ============================================================ */

/*
  ПЛЕЙСХОЛДЕРЫ — заменить перед публикацией
  (продублированы комментарием в <head> index.html):
  {{PHONE}}, {{EMAIL}}, {{ADDRESS}}, {{TG_URL}}, {{MAX_URL}},
  {{VK_URL}}, {{YT_URL}}, {{DOMAIN}}, {{FORM_ENDPOINT}},
  {{YANDEX_MAP_EMBED}}, {{METRIKA_ID}}
*/
var CONFIG = Object.assign({
  PHONE: "+7 (962) 164-31-46",
  TEL: "+79621643146",
  EMAIL: "info@autoboom.ru",
ADDRESS: "г. Иваново, ул. Красных Зорь, 8",
  TG_URL: "https://t.me/nds137rus",
  MAX_URL: "https://max.ru/join/oWU05l0ZbDzXZfgCS7OIA2gwcXUiGLxqePAqBYwK_jc",
  VK_URL: "https://vk.ru/id131766175",
  YT_URL: "https://youtube.com/@autoboom",
  DOMAIN: "autoboom.ru",
  /* ВАЖНО: укажите реальный ENDPOINT. Пока пусто — формы работают в демо-режиме. */
  FORM_ENDPOINT: "",
  YANDEX_MAP_EMBED: "https://yandex.ru/map-widget/v1/?ll=40.954706%2C57.001662&z=17&pt=40.954706%2C57.001662%2Cpm2rdm&l=map",
  METRIKA_ID: "00000000"
}, window.CONFIG || {});

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function smooth() { return reduceMotion ? "auto" : "smooth"; }

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- [01] шапка: сжатие и «наверх» ---------- */
  var header = $("#header");
  var totop = $("#totop");
  var tStart = Date.now();

  var header_throttle = false;
  function onScroll() {
    if (header_throttle) return;
    header_throttle = true;
    requestAnimationFrame(function () {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      if (header) header.classList.toggle("is-shrink", y > 100);
      if (totop) totop.hidden = y < window.innerHeight * 2;
      header_throttle = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (totop) totop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: smooth() });
  });

  /* ---------- [01] мобильное меню ---------- */
  var burger = $("#burger");
  var mnav = $("#nav_mobile");
  if (burger && mnav) {
    function setMenu(open) {
      mnav.classList.toggle("is-open", open);
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    }
    burger.addEventListener("click", function () {
      setMenu(!mnav.classList.contains("is-open"));
    });
    var navClose = $("#nav_close");
    if (navClose) navClose.addEventListener("click", function () { setMenu(false); });
    $$("a", mnav).forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    var gotoLink = mnav.querySelector('a[href^="#request="]');
    if (gotoLink) {
      gotoLink.addEventListener("click", function (e) {
        e.preventDefault();
        setMenu(false);
        gotoRequest(gotoLink.getAttribute("href").split("=")[1]);
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mnav.classList.contains("is-open")) setMenu(false);
    });
  }

  /* ---------- [01] подсветка активного пункта меню ---------- */
  var navLinks = $$(".nav__link").filter(function (n) { return n.hash; });
  var sections = navLinks
    .map(function (n) { return document.querySelector(n.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var id = "#" + en.target.id;
          navLinks.forEach(function (n) {
            n.classList.toggle("is-active", n.getAttribute("href") === id);
          });
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px", threshold: 0 });
    sections.forEach(function (s) { io.observe(s); });
  }

  /* ---------- табы (generic): finder, форма, модалка ---------- */
  function initTabs(root) {
    var segs = $$(root ? ".rq__tabs, .m-tabs, .finder__tabs" : ".seg", root);
    segs.forEach(function (seg) {
      var tabs = $$('[role="tab"]', seg);
      tabs.forEach(function (tab) {
        tab.addEventListener("click", function () { activateTab(tab); });
        tab.addEventListener("keydown", function (e) {
          var k = e.key;
          var i = tabs.indexOf(tab);
          var next = null;
          if (k === "ArrowRight") next = tabs[(i + 1) % tabs.length];
          else if (k === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
          else if (k === "Home") next = tabs[0];
          else if (k === "End") next = tabs[tabs.length - 1];
          if (next) { e.preventDefault(); next.focus(); activateTab(next); }
        });
      });
    });
  }
  function activateTab(tab) {
    var seg = tab.closest(".seg");
    $$('[role="tab"]', seg).forEach(function (t) {
      var active = t === tab;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", active ? "true" : "false");
      var p = document.getElementById(t.getAttribute("aria-controls"));
      if (p) p.hidden = !active;
    });
  }
  initTabs(document);

  /* ---------- [08] табы заявки и состояние в URL (#request=parts|car) ---------- */
  function requestTabs() {
    return $$('.seg [data-tab]').filter(function (b) {
      return b.closest(".rq__tabs") || b.closest(".m-tabs");
    });
  }
  function activateRequestTab(type, scope) {
    var tabs = requestTabs().filter(function (b) {
      return !scope || b.closest(scope) === scope;
    });
    tabs.forEach(function (b) {
      if (b.getAttribute("data-tab") === type) activateTab(b);
    });
  }
  function gotoRequest(type) {
    activateRequestTab(type);
    var sec = document.getElementById("request");
    if (sec) sec.scrollIntoView({ behavior: smooth() });
    var hash = "#request=" + type;
    if (location.hash !== hash) {
      try { history.replaceState(null, "", hash); } catch (e) {}
    }
  }
  window.addEventListener("hashchange", function () {
    if (/^#request=(parts|car)$/.test(location.hash)) {
      var type = location.hash.split("=")[1];
      activateRequestTab(type);
      var sec = document.getElementById("request");
      if (sec) sec.scrollIntoView({ behavior: smooth() });
    }
  });
  $$("[data-goto-request]").forEach(function (b) {
    b.addEventListener("click", function () { gotoRequest(b.getAttribute("data-goto-request")); });
  });
  if (/^#request=(parts|car)$/.test(location.hash)) {
    activateRequestTab(location.hash.split("=")[1]);
  }

  /* ---------- аккордеон FAQ: один открытый ---------- */
  var faq = $(".faq");
  if (faq) {
    var items = $$("details", faq);
    var firstOpen = false;
    items.forEach(function (d) {
      if (d.open) {
        if (firstOpen) d.open = false; else firstOpen = true;
      }
      var q = $("summary", d);
      if (q) {
        q.addEventListener("click", function (ev) {
          ev.preventDefault();
          var wantOpen = !d.open;
          items.forEach(function (o) { o.open = false; });
          if (wantOpen) d.open = true;
        });
      }
    });
  }

  /* ---------- [12] модалка ---------- */
  var modal = $("#modal");
  var openTrigger = null;
  var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

  function openModal(type) {
    if (!modal) return;
    if (mnav && mnav.classList.contains("is-open") && setMenu) setMenu(false);
    openTrigger = document.activeElement;
    if (type) activateRequestTab(type, modal);
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    var first = $(FOCUSABLE, modal);
    if (first) first.focus();
  }
  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    if (openTrigger && openTrigger.focus) openTrigger.focus();
  }
  function setProduct(what, vin) {
    var w = $("#m-what");
    if (w) {
      var cat = /шины/i.test(what) ? "tires" : (/диск/i.test(what) ? "wheels" : "parts");
      w.value = cat;
    }
    var v = $("#m-vin");
    if (v && vin) v.value = vin;
  }
  $$("[data-open-modal]").forEach(function (b) {
    b.addEventListener("click", function () { openModal(b.getAttribute("data-open-modal")); });
  });
  $$("[data-product]").forEach(function (b) {
    b.addEventListener("click", function () {
      setProduct(b.getAttribute("data-product"), b.getAttribute("data-product"));
      openModal("parts");
    });
  });
  $$("[data-finder-submit]").forEach(function (b) {
    b.addEventListener("click", function () {
      var type = b.getAttribute("data-finder-submit");
      var input = $('.finder [name="' + type + '"]');
      var val = input ? input.value.trim() : "";
      setProduct(type === "vin" ? "Запчасти" : "Запчасти", val);
      openModal("parts");
    });
  });
  $$("[data-open-modal-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var type = form.getAttribute("data-open-modal-form");
      setProduct("Запчасти", "");
      var sina_kid = form.querySelector('[name="sz"]');
      var car = [form.querySelector('[name="mk"]'), form.querySelector('[name="md"]')]
        .map(function (i) { return i ? i.value.trim() : ""; }).filter(Boolean).join(" ");
      if (sina_kid && sina_kid.value.trim()) car = car + (car ? ", " : "") + sina_kid.value.trim();
      var mc = $("#m-car");
      if (mc && car) mc.value = car;
      var ph = form.querySelector('[name="ph"]');
      var mp = $("#m-phone");
      if (mp && ph && /\(\d{3}\) \d{3}-\d{2}-\d{2}/.test(ph.value)) mp.value = ph.value;
      openModal(type);
    });
  });
  if (modal) {
    $$(".modal__close", modal).forEach(function (b) {
      b.addEventListener("click", closeModal);
    });
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !modal.hidden) closeModal();
    });
    modal.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var items = $$(FOCUSABLE, modal);
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === modal)) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });
  }

  /* ---------- маска телефона ---------- */
  function maskPhone(input) {
    input.addEventListener("input", function () {
      var d = this.value.replace(/\D/g, "");
      if (!d) { this.value = ""; return; }
      if (d[0] !== "7" && d[0] !== "8") d = "7" + d;
      d = d.slice(0, 11);
      var out = "+7";
      if (d.length > 1) out += " (" + d.slice(1, 4);
      if (d.length >= 4) out += ") " + d.slice(4, 7);
      if (d.length >= 7) out += "-" + d.slice(7, 9);
      if (d.length >= 9) out += "-" + d.slice(9, 11);
      this.value = out;
    });
  }
  $$("[data-mask='phone']").forEach(maskPhone);

  /* ---------- формы: валидация, отправка ---------- */
  function setFieldError(input, msg) {
    var wrap = input.closest(".field");
    if (!wrap) return;
    if (msg) {
      var err = $(".err", wrap);
      if (!err) {
        err = document.createElement("span");
        err.className = "err";
        wrap.appendChild(err);
      }
      err.textContent = msg;
      wrap.classList.add("is-invalid");
    } else {
      wrap.classList.remove("is-invalid");
    }
  }
  function phoneOk(input) {
    return /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(input.value.trim());
  }
  function validateForm(form) {
    var ok = true;
    $$(".field input, .field select", form).forEach(function (input) {
      if (input.classList.contains("hp")) return;
      var isPhone = input.name === "phone" || input.dataset.mask === "phone";
      if (!isPhone && !input.required) return;
      var msg = "";
      if (isPhone) {
        if (!phoneOk(input)) msg = "Введите телефон целиком — по нему мы отправим расчёт";
      } else if (!input.value.trim()) {
        msg = "Заполните поле";
      }
      setFieldError(input, msg);
      if (msg) ok = false;
    });
    var consent = $('input[name="consent"]', form);
    if (consent && !consent.checked) {
      consent.closest(".consent").setAttribute("style", "color:var(--accent)");
      ok = false;
    } else if (consent) {
      consent.closest(".consent").removeAttribute("style");
    }
    return ok;
  }
  $$(".rq__form").forEach(function (form) {
    // валидация на blur
    $$("input, select", form).forEach(function (input) {
      input.addEventListener("blur", function () {
        if (input.classList.contains("hp")) return;
        var isPhone = input.name === "phone" || input.dataset.mask === "phone";
        if (!isPhone && !input.required) return;
        var msg = "";
        if (isPhone) {
          if (input.value && !phoneOk(input)) msg = "Введите телефон целиком — по нему мы отправим расчёт";
        } else if (input.value && !input.value.trim()) {
          msg = "Заполните поле";
        }
        setFieldError(input, msg);
      });
      input.addEventListener("input", function () { setFieldError(input, ""); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validateForm(form)) return;
      var hp = $('input[name="website"]', form);
      if (hp && hp.value) return;                     /* спам в honeypot */
      if (Date.now() - tStart < 3000) return;         /* слишком быстрая отправка */

      var btn = $('button[type="submit"]', form);
      btn.classList.add("is-loading");
      btn.disabled = true;

      var data = {};
      $$("input, select", form).forEach(function (i) {
        if (!i.name || i.classList.contains("hp")) return;
        if (i.type === "radio") { if (i.checked) data[i.name] = i.value; return; }
        if (i.type === "checkbox") { data[i.name] = i.checked; return; }
        data[i.name] = i.value.trim();
      });

      var utm = {};
      ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(function (k) {
        var v = new URLSearchParams(location.search).get(k);
        if (v) utm[k] = v;
      });

      var payload = {
        type: form.getAttribute("data-form"),
        fields: data,
        source: form.closest("#modal") ? "modal" : "section",
        page: location.href,
        utm: utm,
        ts: new Date().toISOString()
      };

      var done = function (err) {
        btn.classList.remove("is-loading");
        btn.disabled = false;
        if (err) {
          var note = $(".rq__foot", form);
          if (note) {
            var ex = $(".rq__err", note);
            if (!ex) {
              ex = document.createElement("p");
              ex.className = "rq__note rq__err";
              ex.style.color = "var(--accent)";
              note.appendChild(ex);
            }
            ex.textContent = "Не удалось отправить. Позвоните нам: " + CONFIG.PHONE;
          }
          return;
        }
        var panel = form.closest('[role="tabpanel"]');
        if (!panel) panel = form.parentElement;
        var ok = $(".rq__ok", panel);
        form.hidden = true;
        if (ok) ok.hidden = false;
      };

      var realEndpoint = CONFIG.FORM_ENDPOINT && /^https?:\/\//.test(CONFIG.FORM_ENDPOINT);
      if (!realEndpoint) {
        /* демо-режим: эмулируем отправку */
        setTimeout(function () { done(false); }, 900);
        return;
      }
      fetch(CONFIG.FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (r) { if (!r.ok) throw new Error("bad status"); done(false); })
        .catch(function () { done(true); });
    });
  });

  /* ---------- [03] категории запчастей: по 4 ---------- */
  var cats = $$(".cat");
  var CATS_PER = 4;
  var catsPrev = $("[data-cats-prev]");
  var catsNext = $("[data-cats-next]");
  var catsCount = $("[data-cats-count]");
  var catsPage = 1;
  function catsPages() { return Math.max(1, Math.ceil(cats.length / CATS_PER)); }
  function renderCats() {
    cats.forEach(function (c, i) {
      c.hidden = window.innerWidth > 1024 && Math.floor(i / CATS_PER) + 1 !== catsPage;
    });
    if (catsPrev) catsPrev.classList.toggle("is-disabled", catsPage === 1);
    if (catsNext) catsNext.classList.toggle("is-disabled", catsPage === catsPages());
    if (catsCount) catsCount.textContent = catsPage + " / " + catsPages();
  }
  if (cats.length > CATS_PER) {
    if (catsPrev) catsPrev.addEventListener("click", function () { catsPage -= 1; renderCats(); });
    if (catsNext) catsNext.addEventListener("click", function () { catsPage += 1; renderCats(); });
  }
  renderCats();

  /* ---------- [03а] шины: по 2 планки ---------- */
  var tires = $$(".tire-plank");
  var TIRES_PER = 2;
  var tiresNav = $(".tires__nav");
  var tiresPrev = $("[data-tires-prev]");
  var tiresNext = $("[data-tires-next]");
  var tiresPage = 1;
  function tiresPages() { return Math.max(1, Math.ceil(tires.length / TIRES_PER)); }
  function renderTires() {
    tires.forEach(function (t, i) {
      t.hidden = window.innerWidth > 1024 && Math.floor(i / TIRES_PER) + 1 !== tiresPage;
    });
    if (tiresPrev) tiresPrev.classList.toggle("is-disabled", tiresPage === 1);
    if (tiresNext) tiresNext.classList.toggle("is-disabled", tiresPage === tiresPages());
  }
  if (tires.length > TIRES_PER && tiresNav) {
    if (window.innerWidth > 1024) tiresNav.hidden = false;
    if (tiresPrev) tiresPrev.addEventListener("click", function () { tiresPage -= 1; renderTires(); });
    if (tiresNext) tiresNext.addEventListener("click", function () { tiresPage += 1; renderTires(); });
  }
  renderTires();

  /* ---------- [09] отзывы: листинг по 4 ---------- */
  var shots = $$(".shot");
  var SHOTS_PER = 4;
  var shotsNav = $(".shots__nav");
  var shotsPrev = $("[data-shots-prev]");
  var shotsNext = $("[data-shots-next]");
  var shotsCount = $("[data-shots-count]");
  var shotsPage = 1;
  function shotsPages() { return Math.max(1, Math.ceil(shots.length / SHOTS_PER)); }
  function renderShots() {
    shots.forEach(function (s, i) {
      s.hidden = window.innerWidth > 768 && Math.floor(i / SHOTS_PER) + 1 !== shotsPage;
    });
    if (shotsPrev) shotsPrev.classList.toggle("is-disabled", shotsPage === 1);
    if (shotsNext) shotsNext.classList.toggle("is-disabled", shotsPage === shotsPages());
    if (shotsCount) shotsCount.textContent = shotsPage + " / " + shotsPages();
  }
  if (shots.length > SHOTS_PER && shotsNav) {
    if (window.innerWidth > 768) shotsNav.hidden = false;
    if (shotsPrev) shotsPrev.addEventListener("click", function () { shotsPage -= 1; renderShots(); });
    if (shotsNext) shotsNext.addEventListener("click", function () { shotsPage += 1; renderShots(); });
  }
  renderShots();

  /* ---------- лайтбокс отзывов ---------- */
  var lbox = $("#lightbox");
  if (lbox) {
    $$("[data-zoom]").forEach(function (b) {
      b.addEventListener("click", function () {
        $("#lightboxImg").src = b.getAttribute("data-zoom");
        lbox.hidden = false;
        document.body.style.overflow = "hidden";
      });
    });
    function closeLbox() {
      lbox.hidden = true;
      document.body.style.overflow = "";
    }
    lbox.addEventListener("click", function (e) {
      if (e.target !== $("#lightboxImg")) closeLbox();
    });
    $$(".lightbox__close", lbox).forEach(function (b) { b.addEventListener("click", closeLbox); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !lbox.hidden) closeLbox();
    });
  }

  /* ---------- [12] cookie ---------- */
  var cookie = $("#cookie");
  if (cookie) {
    try {
      if (localStorage.getItem("autoboom_consent")) cookie.hidden = true;
    } catch (e) {}
    $$("[data-cookie]", cookie).forEach(function (b) {
      b.addEventListener("click", function () {
        try { localStorage.setItem("autoboom_consent", b.getAttribute("data-cookie")); } catch (e) {}
        cookie.hidden = true;
      });
    });
  }

  /* ---------- контакты из CONFIG ---------- */
  if (CONFIG.YANDEX_MAP_EMBED) {
    var mapIframe = $(".map iframe");
    if (mapIframe && /placeholder/.test(mapIframe.src)) mapIframe.src = CONFIG.YANDEX_MAP_EMBED;
  }

  /* ---------- адаптивная пагинация: перерендер при ресайзе ---------- */
  var winResize = function () {
    if (typeof renderTires === "function") renderTires();
    if (typeof renderCats === "function") renderCats();
    if (typeof renderShots === "function") renderShots();
  };
  window.addEventListener("resize", winResize);
})();