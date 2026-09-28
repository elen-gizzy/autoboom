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
  EMAIL: "nds_137@mail.ru",
ADDRESS: "г. Иваново, ул. Красных Зорь, 8",
  TG_URL: "https://t.me/nds137rus",
  MAX_URL: "https://max.ru/join/oWU05l0ZbDzXZfgCS7OIA2gwcXUiGLxqePAqBYwK_jc",
  VK_URL: "https://vk.ru/id131766175",
  AVITO_URL: "https://www.avito.ru/user/2ca2b7c6974ec5e779435b1f522c114f/profile/all?src=sharing&sellerId=2ca2b7c6974ec5e779435b1f522c114f",
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

  function initSmoothScroll() {
    if (reduceMotion) return;
    var scroller = document.scrollingElement || document.documentElement;
    var current = scroller.scrollTop;
    var target = current;
    var frame = 0;
    var last = 0;
    var lastSetPosition = current;
    var lastWriteTime = 0;
    var previousBehavior = "";
    var running = false;

    function maxScroll() {
      return Math.max(0, scroller.scrollHeight - window.innerHeight);
    }

    function setPosition(value) {
      lastSetPosition = value;
      lastWriteTime = performance.now();
      scroller.scrollTop = value;
    }

    function render(now) {
      if (!running) return;
      if (!last) last = now;
      var elapsed = Math.min(64, now - last);
      last = now;
      var limit = maxScroll();
      var goal = Math.min(target, limit);
      var ease = 1 - Math.pow(0.001, elapsed / 1000);
      current += (goal - current) * ease;
      if (Math.abs(goal - current) < 0.5) {
        current = goal;
        lastSetPosition = current;
        setPosition(current);
        if (target <= limit) target = current;
        stop();
        return;
      }
      lastSetPosition = current;
      setPosition(current);
      frame = requestAnimationFrame(render);
    }

    function stop() {
      running = false;
      frame = 0;
      last = 0;
      scroller.style.scrollBehavior = previousBehavior;
      previousBehavior = "";
    }

    function cancel() {
      stop();
      current = scroller.scrollTop;
      target = current;
      lastSetPosition = current;
    }

    function start() {
      if (running) return;
      previousBehavior = scroller.style.scrollBehavior;
      scroller.style.scrollBehavior = "auto";
      running = true;
      last = 0;
      frame = requestAnimationFrame(render);
    }

    function resume() {
      if (!running && target > scroller.scrollTop + 0.5) start();
    }

    function sync() {
      var position = scroller.scrollTop;
      if (running) {
        if (Math.abs(position - lastSetPosition) > 2 && performance.now() - lastWriteTime > 120) {
          stop();
          current = position;
          target = position;
          lastSetPosition = position;
        }
        return;
      }
      current = position;
      target = position;
      lastSetPosition = position;
    }

    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", function () {
      if (target < 0) target = 0;
      sync();
      resume();
    });
    window.addEventListener("load", resume);
    window.addEventListener("touchstart", cancel, { passive: true });
    window.addEventListener("pointerdown", cancel, { passive: true });
    window.addEventListener("keydown", function (event) {
      if (["PageDown", "PageUp", "Home", "End", "ArrowDown", "ArrowUp", " "].indexOf(event.key) !== -1) cancel();
    }, { passive: true });
    window.addEventListener("hashchange", cancel);
    window.addEventListener("click", function (event) {
      var targetNode = event.target;
      if (targetNode && targetNode.closest && targetNode.closest("a[href^='#']")) cancel();
    }, true);
    if (window.ResizeObserver) {
      new ResizeObserver(resume).observe(document.body);
    }
    window.addEventListener("wheel", function (event) {
      if (event.ctrlKey || event.defaultPrevented || document.body.style.overflow === "hidden") return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      var delta = event.deltaY;
      if (event.deltaMode === 1) delta *= 16;
      if (event.deltaMode === 2) delta *= window.innerHeight;
      if (!delta) return;
      event.preventDefault();
      var limit = maxScroll();
      var desired = target + delta;
      if (current >= limit - 2) desired = delta < 0 ? current + delta : limit;
      target = Math.max(0, desired);
      start();
    }, { passive: false });
  }

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

  function initScrollReveal() {
    if (reduceMotion) return;

    var items = [];
    var observer = null;
    var revealFrame = 0;

    function add(selector, type, distance, stagger) {
      $$(selector).forEach(function (node, index) {
        if (node.hasAttribute("data-reveal")) return;
        node.setAttribute("data-reveal", type);
        var item = {
          node: node,
          distance: distance,
          delay: Math.min((stagger || 0) * index, 480),
          prepared: false,
          pending: false,
          animating: false
        };
        node.__revealItem = item;
        items.push(item);
      });
    }

    function isHidden(node) {
      return node.hidden || getComputedStyle(node).display === "none";
    }

    function prepare(item) {
      if (item.prepared || isHidden(item.node)) return;
      var rect = item.node.getBoundingClientRect();
      if (!rect.height) return;
      item.prepared = true;
      if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) return;
      item.pending = true;
      item.node.style.opacity = "0";
      item.node.style.translate = "0 " + item.distance + "px";
      item.node.style.scale = "0.95";
      if (observer) observer.observe(item.node);
    }

    function show(item) {
      if (!item.pending || item.animating) return;
      item.pending = false;
      item.animating = true;
      if (observer) observer.unobserve(item.node);
      var start = { opacity: 0, translate: "0 " + item.distance + "px", scale: "0.95" };
      var peak = { opacity: 1, translate: "0 -6px", scale: "1.008", offset: 0.76 };
      var end = { opacity: 1, translate: "0 0", scale: "1" };
      var done = function () {
        item.node.style.opacity = "1";
        item.node.style.translate = "0 0";
        item.node.style.scale = "1";
        item.animating = false;
      };
      if (Element.prototype.animate) {
        var animation = item.node.animate([start, peak, end], {
          duration: 1350,
          delay: item.delay,
          easing: "cubic-bezier(.22,.61,.36,1)",
          fill: "both"
        });
        animation.finished.then(done).catch(done);
      } else {
        item.node.style.transition = "opacity 1.35s cubic-bezier(.22,.61,.36,1) " + item.delay + "ms, translate 1.35s cubic-bezier(.22,.61,.36,1) " + item.delay + "ms, scale 1.35s cubic-bezier(.22,.61,.36,1) " + item.delay + "ms";
        requestAnimationFrame(done);
      }
    }

    function update() {
      revealFrame = 0;
      items.forEach(function (item) {
        if (!item.prepared) {
          prepare(item);
          return;
        }
        if (!item.pending || isHidden(item.node)) return;
        var rect = item.node.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.92) show(item);
      });
    }

    function schedule() {
      if (!revealFrame) revealFrame = requestAnimationFrame(update);
    }

    add(".section:not(.hero)", "section", 140, 0);
    add(".sec-title", "title", 100, 0);
    add(".sec-lead", "text", 76, 0);
    add(".cats .cat", "card", 90, 110);
    add(".disc-tile", "card", 90, 110);
    add(".stages .stage", "card", 90, 110);
    add(".cta-panel", "panel", 94, 0);
    add(".guar__item", "card", 80, 110);
    add(".faq__item", "text", 72, 85);
    add(".last__info", "panel", 94, 0);
    add(".car-card", "card", 90, 110);
    add(".reviews__btn", "text", 72, 85);

    if (!items.length) return;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var item = entry.target.__revealItem;
          if (!item || !entry.isIntersecting) return;
          prepare(item);
          show(item);
        });
      }, { rootMargin: "0px 0px 15% 0px", threshold: 0 });
    }
    items.forEach(prepare);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    if (window.MutationObserver) {
      new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          var item = mutation.target.__revealItem;
          if (item && !isHidden(item.node)) schedule();
        });
      }).observe(document.body, { attributes: true, subtree: true, attributeFilter: ["hidden", "class"] });
    }
    schedule();
  }

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

  /* ---------- подпись поля VIN в зависимости от типа заявки ----------
     Список «Что нужно» идёт перед полем VIN, поэтому у двигателя и масла
     подпись другая: VIN у них не единственный идентификатор.
     Значения — по value опций (parts/tires/wheels/engine/oils).
     Меняем только текстовый узел, «(необязательно)» остаётся своим span. */
  var VIN_LABEL = { engine: "VIN или марка авто", oils: "Напишите название" };
  function bindWhatLabel(sel) {
    var form = sel.form;
    if (!form) return;
    var input = form.querySelector('[name="vin"]');
    if (!input || !input.id) return;
    var label = document.querySelector('label[for="' + input.id + '"]');
    if (!label) return;
    var text = [].slice.call(label.childNodes).filter(function (n) {
      return n.nodeType === 3 && n.nodeValue.trim();
    })[0];
    if (!text) return;
    var base = text.nodeValue.trim();
    var update = function () { text.nodeValue = " " + (VIN_LABEL[sel.value] || base) + " "; };
    sel.addEventListener("change", update);
    update();
  }
  $$('select[name="what"]').forEach(bindWhatLabel);

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

  var tires = $$(".tire-plank");
  var tiresList = $(".tires-list");
  var tiresNav = $(".tires__nav");
  var tiresPrev = $("[data-tires-prev]");
  var tiresNext = $("[data-tires-next]");
  var TIRES_DELAY = 4600;

  function initTiresCarousel() {
    if (!tiresList || tires.length < 2) return;

    var currentIndex = 0;
    var timer = 0;
    var interactionTimer = 0;
    var resizeFrame = 0;
    var inView = false;
    var hovered = false;
    var focused = false;
    var interacting = false;

    function maxScroll() {
      return Math.max(0, tiresList.scrollWidth - tiresList.clientWidth);
    }

    function targetFor(index) {
      var card = tires[index] || tires[tires.length - 1];
      return Math.min(card.offsetLeft - tires[0].offsetLeft, maxScroll());
    }

    function lastIndex() {
      var firstTarget = targetFor(0);
      var step = targetFor(1) - firstTarget;
      if (step <= 0) return 0;
      return Math.ceil((maxScroll() - firstTarget) / step);
    }

    function updateNav() {
      if (tiresPrev) tiresPrev.classList.toggle("is-disabled", currentIndex <= 0);
      if (tiresNext) tiresNext.classList.toggle("is-disabled", maxScroll() <= 0);
    }

    function goTo(index, behavior) {
      currentIndex = Math.max(0, Math.min(index, lastIndex()));
      var target = targetFor(currentIndex);
      if (typeof tiresList.scrollTo === "function") {
        tiresList.scrollTo({ left: target, behavior: behavior || (reduceMotion ? "auto" : "smooth") });
      } else {
        tiresList.scrollLeft = target;
      }
      updateNav();
    }

    function wrapToStart() {
      var end = lastIndex();
      for (var i = 0; i < end; i++) {
        var card = tiresList.firstElementChild;
        if (card) tiresList.appendChild(card);
      }
      tires = $$(".tire-plank");
      currentIndex = 0;
      var behavior = tiresList.style.scrollBehavior;
      tiresList.style.scrollBehavior = "auto";
      tiresList.scrollLeft = 0;
      tiresList.style.scrollBehavior = behavior;
      updateNav();
    }

    function advance() {
      if (currentIndex >= lastIndex()) {
        wrapToStart();
        goTo(1);
      } else {
        goTo(currentIndex + 1);
      }
    }

    function schedule() {
      window.clearTimeout(timer);
      timer = 0;
      if (reduceMotion || !inView || hovered || focused || interacting || document.hidden || maxScroll() <= 0) return;
      timer = window.setTimeout(function () {
        advance();
        schedule();
      }, TIRES_DELAY);
    }

    updateNav();

    function pauseForInteraction() {
      interacting = true;
      window.clearTimeout(interactionTimer);
      interactionTimer = window.setTimeout(function () {
        interacting = false;
        schedule();
      }, 1400);
      schedule();
    }

    function containsFocus(event) {
      var target = event.relatedTarget;
      return (tiresList.contains(target) || (tiresNav && tiresNav.contains(target)));
    }

    tiresPrev && tiresPrev.addEventListener("click", function () {
      pauseForInteraction();
      goTo(currentIndex - 1);
    });
    tiresNext && tiresNext.addEventListener("click", function () {
      pauseForInteraction();
      advance();
    });

    tiresList.addEventListener("pointerenter", function (event) {
      if (event.pointerType !== "mouse") return;
      hovered = true;
      schedule();
    });
    tiresList.addEventListener("pointerleave", function (event) {
      if (event.pointerType !== "mouse") return;
      hovered = false;
      schedule();
    });
    tiresList.addEventListener("pointerdown", pauseForInteraction);
    tiresList.addEventListener("wheel", pauseForInteraction, { passive: true });
    tiresList.addEventListener("focusin", function () {
      focused = true;
      schedule();
    });
    tiresList.addEventListener("focusout", function (event) {
      if (!containsFocus(event)) {
        focused = false;
        schedule();
      }
    });

    if (tiresNav) {
      tiresNav.addEventListener("pointerenter", function (event) {
        if (event.pointerType !== "mouse") return;
        hovered = true;
        schedule();
      });
      tiresNav.addEventListener("pointerleave", function (event) {
        if (event.pointerType !== "mouse") return;
        hovered = false;
        schedule();
      });
      tiresNav.addEventListener("focusin", function () {
        focused = true;
        schedule();
      });
      tiresNav.addEventListener("focusout", function (event) {
        if (!containsFocus(event)) {
          focused = false;
          schedule();
        }
      });
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        var entry = entries[0];
        inView = entry.isIntersecting && entry.intersectionRatio >= 0.25;
        schedule();
      }, { threshold: [0, 0.25, 0.5] }).observe(tiresList);
    } else {
      inView = true;
      schedule();
    }

    document.addEventListener("visibilitychange", schedule);
    window.addEventListener("resize", function () {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(function () {
        currentIndex = Math.min(currentIndex, lastIndex());
        tiresList.scrollLeft = targetFor(currentIndex);
        updateNav();
        schedule();
      });
    });
  }

  var shots = $$(".shot");
  var shotsList = $(".shots");
  var shotsNav = $(".shots__nav");
  var shotsPrev = $("[data-shots-prev]");
  var shotsNext = $("[data-shots-next]");
  var shotsCount = $("[data-shots-count]");
  var reviewsTimer = 0;
  var REVIEWS_DELAY = 4600;
  function initReviewsCarousel() {
    if (!shotsList || shots.length < 2) return;
    var currentIndex = 0;
    var hovered = false;
    var focused = false;
    var interacting = false;
    var inView = false;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function maxScroll() { return Math.max(0, shotsList.scrollWidth - shotsList.clientWidth); }
    function targetFor(index) {
      return Math.max(0, Math.min(shots[index].offsetLeft - shots[0].offsetLeft, maxScroll()));
    }
    function lastIndex() {
      var max = maxScroll();
      if (max <= 0) return 0;
      var step = targetFor(1) - targetFor(0);
      return step > 0 ? Math.ceil(max / step - 0.0001) : 0;
    }
    function updateNav() {
      var end = lastIndex();
      if (shotsNav) shotsNav.hidden = window.innerWidth <= 1024 || maxScroll() <= 0;
      if (shotsPrev) shotsPrev.classList.toggle("is-disabled", currentIndex <= 0);
      if (shotsNext) shotsNext.classList.toggle("is-disabled", maxScroll() <= 0);
      if (shotsCount) shotsCount.textContent = (currentIndex + 1) + " / " + (end + 1);
    }
    function goTo(index, behavior) {
      currentIndex = Math.max(0, Math.min(index, lastIndex()));
      var target = targetFor(currentIndex);
      if (typeof shotsList.scrollTo === "function") {
        shotsList.scrollTo({ left: target, behavior: behavior || (reduceMotion ? "auto" : "smooth") });
      } else {
        shotsList.scrollLeft = target;
      }
      updateNav();
    }

    function wrapToStart() {
      var end = lastIndex();
      for (var i = 0; i < end; i++) {
        var card = shotsList.firstElementChild;
        if (card) shotsList.appendChild(card);
      }
      shots = $$(".shot");
      currentIndex = 0;
      var behavior = shotsList.style.scrollBehavior;
      shotsList.style.scrollBehavior = "auto";
      shotsList.scrollLeft = 0;
      shotsList.style.scrollBehavior = behavior;
      updateNav();
    }

    function advance() {
      if (currentIndex >= lastIndex()) {
        wrapToStart();
        goTo(1);
      } else {
        goTo(currentIndex + 1);
      }
    }

    function schedule() {
      window.clearTimeout(reviewsTimer);
      reviewsTimer = 0;
      if (reduceMotion || !inView || hovered || focused || interacting || document.hidden || maxScroll() <= 0) return;
      reviewsTimer = window.setTimeout(function () {
        advance();
        schedule();
      }, REVIEWS_DELAY);
    }
    function resume() {
      window.setTimeout(schedule, 100);
    }
    if (shotsNav) shotsNav.hidden = window.innerWidth <= 1024 || maxScroll() <= 0;
    if (shotsPrev) shotsPrev.addEventListener("click", function () { clearTimeout(reviewsTimer); goTo(currentIndex - 1); schedule(); });
    if (shotsNext) shotsNext.addEventListener("click", function () { clearTimeout(reviewsTimer); advance(); schedule(); });
    shotsList.addEventListener("pointerenter", function () { hovered = true; clearTimeout(reviewsTimer); });
    shotsList.addEventListener("pointerleave", function () { hovered = false; resume(); });
    shotsList.addEventListener("pointerdown", function () { interacting = true; clearTimeout(reviewsTimer); });
    shotsList.addEventListener("pointerup", function () { interacting = false; resume(); });
    shotsList.addEventListener("focusin", function () { focused = true; clearTimeout(reviewsTimer); });
    shotsList.addEventListener("focusout", function () { focused = false; resume(); });
    shotsList.addEventListener("click", resume);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (inView) schedule();
        else clearTimeout(reviewsTimer);
      }, { rootMargin: "0px 0px -20% 0px", threshold: 0 }).observe(shotsList);
    } else {
      inView = true;
      schedule();
    }
    window.addEventListener("resize", function () {
      currentIndex = 0;
      shotsList.scrollLeft = 0;
      updateNav();
      schedule();
    });
    updateNav();
  }
  initReviewsCarousel();
  initScrollReveal();
  initTiresCarousel();
  initSmoothScroll();

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
    if (typeof renderCats === "function") renderCats();
  };
  window.addEventListener("resize", winResize);
})();