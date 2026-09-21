// ============================================
// Любава Князева — психолог. Общий JS сайта.
// Ванильный JS, без зависимостей.
// ============================================

document.addEventListener('DOMContentLoaded', function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sticky header ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var updateHeader = function () {
      if (window.scrollY > 8) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    };
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  /* ---------- Mobile burger menu ---------- */
  var burger = document.querySelector('.burger');
  var navLinks = document.querySelector('.nav-links');
  if (burger && navLinks) {
    burger.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- Top bar: hide on scroll down; back only within the first screen ---------- */
  (function () {
    var header = document.querySelector('.site-header');
    if (!header || !header.querySelector('.topbar')) return;
    var lastY = window.scrollY;
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y <= 10 || (y < lastY - 4 && y < window.innerHeight)) header.classList.remove('topbar-hidden');
      else if (y > lastY + 4 && y > 80) header.classList.add('topbar-hidden');
      lastY = y;
    }, { passive: true });
  })();

  /* ---------- Hero entrance (one-time on load, not per-scroll) ---------- */
  var heroEnterEls = document.querySelectorAll('.hero-enter');
  if (heroEnterEls.length) {
    if (reduceMotion) {
      heroEnterEls.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      window.requestAnimationFrame(function () {
        heroEnterEls.forEach(function (el, i) {
          window.setTimeout(function () {
            el.classList.add('is-visible');
          }, i * 100);
        });
      });
    }
  }

  /* ---------- Accordions (service cards "Подробнее", documents list) ---------- */
  var accordionTriggers = document.querySelectorAll('[data-accordion-trigger]');
  accordionTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      var item = trigger.closest('[data-accordion-item]');
      trigger.setAttribute('aria-expanded', String(!isExpanded));
      if (item) {
        item.classList.toggle('is-expanded', !isExpanded);
      }
      var label = trigger.querySelector('[data-accordion-label]');
      if (label) {
        label.textContent = !isExpanded ? 'Свернуть' : 'Подробнее';
      }
    });
  });


  /* ---------- Scroll reveal (subtle, one-time) ---------- */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var revealSel = '.fact, .request-item, .method-step, .card, .testi-card, .program-card, .book-feature, .book-mini, .photo-tile, .photo-banner, .photo-card, .teach-item, .contact-card, .edu-group, .ethics-item, .doc-item, .cta-band, .note-band, .gallery-head, .method-intro, .about-wrap, .teach-main, .teach-photo, .form-wrap > div';
    var revealEls = Array.prototype.slice.call(document.querySelectorAll(revealSel));
    var vh = window.innerHeight;
    var revealIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.classList.add('is-in');
        revealIo.unobserve(el);
        window.setTimeout(function () {
          el.removeAttribute('data-reveal');
          el.classList.remove('is-in');
          el.style.removeProperty('--d');
        }, 1400);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) return;
      if (el.parentElement && el.parentElement.closest('[data-reveal]')) return;
      var idx = Array.prototype.indexOf.call(el.parentElement.children, el);
      el.style.setProperty('--d', Math.min(idx, 6) * 70 + 'ms');
      el.setAttribute('data-reveal', '');
      revealIo.observe(el);
    });
  }

  /* ---------- Booking: phone mask, validation, two forms in one popup ---------- */
  // Куда отправлять заявки. Укажите адрес формы (например Formspree:
  // 'https://formspree.io/f/xxxxxxx') — тогда заявки будут приходить сразу на почту.
  // Пока адрес пустой, вместо этого открывается готовое письмо на CONTACT_EMAIL.
  var FORM_ENDPOINT = '';
  var CONTACT_EMAIL = 'klln@mail.ru';
  var CONTACT_PHONE = '8 (913) 914-33-62';
  var POLICY_LINK = '<a href="politika-konfidencialnosti.html" target="_blank" rel="noopener">политикой конфиденциальности</a>';

  var PROGRAMS = [
    'Песочная терапия как инструмент жизненных изменений. Базовый курс плюс',
    'Базовый курс интегративной песочной терапии',
    'Разрешение травмы. Интеграция методов песочной терапии и соматического переживания Питера Левина',
    'Песочная терапия в работе с детьми',
    'Песочная терапия в работе с семьёй',
    'В поисках золотой тени',
    'Решение психосоматических проблем в психологической песочнице',
    'Шёпот рода'
  ];

  function isProgram(name) {
    return PROGRAMS.indexOf(name) !== -1;
  }

  function fillProgramSelect(select, selected) {
    select.textContent = '';
    var def = document.createElement('option');
    def.value = '';
    def.textContent = 'Выберите программу';
    select.appendChild(def);
    var found = false;
    PROGRAMS.forEach(function (name) {
      var o = document.createElement('option');
      o.value = name;
      o.textContent = name;
      if (name === selected) { o.selected = true; found = true; }
      select.appendChild(o);
    });
    if (selected && !found) {
      var extra = document.createElement('option');
      extra.value = selected;
      extra.textContent = selected;
      extra.selected = true;
      select.insertBefore(extra, select.children[1]);
    }
  }

  /* --- phone mask: +7 (XXX) XXX-XX-XX --- */
  function phoneDigits(value) {
    var d = value.replace(/\D/g, '');
    if (!d) return '';
    if (d.charAt(0) === '8') d = '7' + d.slice(1);
    else if (d.charAt(0) !== '7') d = '7' + d;
    return d.slice(0, 11);
  }
  function formatPhone(d) {
    if (!d) return '';
    var rest = d.slice(1);
    var out = '+7';
    if (rest.length > 0) out += ' (' + rest.slice(0, 3);
    if (rest.length > 3) out += ') ' + rest.slice(3, 6);
    if (rest.length > 6) out += '-' + rest.slice(6, 8);
    if (rest.length > 8) out += '-' + rest.slice(8, 10);
    return out;
  }
  function attachPhoneMask(input) {
    var prevDigits = '';
    input.setAttribute('inputmode', 'tel');
    input.setAttribute('autocomplete', 'tel');
    input.setAttribute('placeholder', '+7 (___) ___-__-__');
    input.setAttribute('maxlength', '18');

    input.addEventListener('focus', function () {
      if (!input.value) { input.value = '+7 '; prevDigits = '7'; }
    });
    input.addEventListener('blur', function () {
      if (phoneDigits(input.value).length <= 1) { input.value = ''; prevDigits = ''; }
    });
    input.addEventListener('input', function (e) {
      var raw = input.value;
      var caret = input.selectionStart || 0;
      var digitsBeforeCaret = phoneDigits(raw.slice(0, caret)).length;
      var digits = phoneDigits(raw);
      var deleting = e.inputType && e.inputType.indexOf('deleteContent') === 0;
      if (deleting && digits === prevDigits && digits.length > 1) {
        digits = digits.slice(0, -1);
        digitsBeforeCaret = Math.max(0, digitsBeforeCaret - 1);
      }
      if (digits.length <= 1) {
        input.value = deleting ? '' : (digits ? '+7 ' : '');
        prevDigits = digits;
        return;
      }
      var formatted = formatPhone(digits);
      input.value = formatted;
      prevDigits = digits;
      var pos = formatted.length;
      if (digitsBeforeCaret < digits.length) {
        var seen = 0;
        pos = 0;
        for (var i = 0; i < formatted.length; i++) {
          if (/\d/.test(formatted.charAt(i))) seen++;
          pos = i + 1;
          if (seen >= digitsBeforeCaret && digitsBeforeCaret > 0) break;
        }
      }
      input.setSelectionRange(pos, pos);
    });
  }

  /* --- validation helpers --- */
  function fieldWrap(el) {
    return el.closest('.field') || el.closest('.consent-row');
  }
  function setFieldError(el, message) {
    var wrap = fieldWrap(el);
    if (!wrap) return;
    var err = wrap.querySelector('.field-error');
    if (!err) {
      err = document.createElement('div');
      err.className = 'field-error';
      err.setAttribute('role', 'alert');
      wrap.appendChild(err);
    }
    err.textContent = message || '';
    wrap.classList.toggle('is-invalid', !!message);
    if (message) el.setAttribute('aria-invalid', 'true');
    else el.removeAttribute('aria-invalid');
  }
  function validateForm(form) {
    var first = null;
    function fail(el, msg) { setFieldError(el, msg); if (!first) first = el; }
    var mode = form.getAttribute('data-mode');

    var name = form.elements['name'];
    if (name.value.trim().length < 2) fail(name, mode === 'training' ? 'Укажите фамилию, имя и отчество' : 'Укажите, как к вам обращаться');
    else setFieldError(name, '');

    var phone = form.elements['phone'];
    var digits = phoneDigits(phone.value);
    if (digits.length <= 1) fail(phone, 'Укажите телефон для связи');
    else if (digits.length < 11) fail(phone, 'Введите номер полностью: +7 (XXX) XXX-XX-XX');
    else setFieldError(phone, '');

    var email = form.elements['email'];
    if (email) {
      var v = email.value.trim();
      if (!v) fail(email, 'Укажите почту');
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) fail(email, 'Проверьте адрес почты, например name@mail.ru');
      else setFieldError(email, '');
    }

    if (mode === 'training') {
      var program = form.elements['service'];
      if (!program.value) fail(program, 'Выберите программу');
      else setFieldError(program, '');
    }

    var consent = form.elements['consent'];
    if (!consent.checked) fail(consent, 'Нужно согласие на обработку персональных данных');
    else setFieldError(consent, '');

    if (first) first.focus();
    return !first;
  }

  function collectData(form) {
    var fmt = form.querySelector('input[name="format"]:checked');
    var svc = form.elements['service'];
    var email = form.elements['email'];
    var msg = form.elements['message'];
    return {
      type: form.getAttribute('data-mode') === 'training' ? 'Обучение' : 'Консультация',
      name: form.elements['name'].value.trim(),
      phone: formatPhone(phoneDigits(form.elements['phone'].value)),
      email: email ? email.value.trim() : '',
      service: svc ? svc.value : '',
      format: fmt ? fmt.value : '',
      message: msg ? msg.value.trim() : '',
      page: document.title
    };
  }

  function sendApplication(data) {
    if (FORM_ENDPOINT) {
      return fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (res) {
        if (!res.ok) throw new Error('bad status');
        return 'sent';
      });
    }
    var lines = [
      'Тип заявки: ' + data.type,
      'Имя: ' + data.name,
      'Телефон: ' + data.phone
    ];
    if (data.email) lines.push('Почта: ' + data.email);
    lines.push((data.type === 'Обучение' ? 'Программа: ' : 'Услуга: ') + (data.service || 'не выбрана'));
    if (data.format) lines.push('Формат: ' + data.format);
    if (data.message) lines.push('Сообщение: ' + data.message);
    var subject = 'Заявка с сайта: ' + (data.service || data.type.toLowerCase());
    window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
    return Promise.resolve('mailto');
  }

  function successOf(form) {
    var n = form.nextElementSibling;
    return n && n.classList.contains('form-success') ? n : null;
  }

  function initBookingForm(form) {
    if (!form.getAttribute('data-mode')) form.setAttribute('data-mode', 'consult');
    attachPhoneMask(form.elements['phone']);
    var btn = form.querySelector('button[type="submit"]');
    btn.setAttribute('data-label', btn.textContent);
    var program = form.elements['service'];
    if (program && program.tagName === 'SELECT' && !program.options.length) fillProgramSelect(program, '');

    Array.prototype.forEach.call(form.querySelectorAll('input, textarea, select'), function (el) {
      el.addEventListener('input', function () { setFieldError(el, ''); });
      el.addEventListener('change', function () { setFieldError(el, ''); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateForm(form)) return;

      btn.disabled = true;
      btn.textContent = 'Отправляем…';
      var success = successOf(form);

      sendApplication(collectData(form)).then(function (mode) {
        form.classList.add('is-hidden');
        if (success) {
          success.textContent = mode === 'mailto'
            ? 'Мы подготовили письмо в вашей почтовой программе — нажмите «Отправить». Если оно не открылось, позвоните: ' + CONTACT_PHONE + '.'
            : 'Спасибо, заявка отправлена! Я свяжусь с вами в ближайшее время.';
          success.classList.add('is-visible');
          success.setAttribute('tabindex', '-1');
          success.focus();
        }
      }).catch(function () {
        btn.disabled = false;
        btn.textContent = btn.getAttribute('data-label');
        var err = form.querySelector('.form-error');
        if (!err) {
          err = document.createElement('div');
          err.className = 'form-error';
          err.setAttribute('role', 'alert');
          form.appendChild(err);
        }
        err.textContent = 'Не удалось отправить заявку. Попробуйте ещё раз или позвоните: ' + CONTACT_PHONE + '.';
      });
    });
  }

  function resetBookingForm(form) {
    form.reset();
    form.classList.remove('is-hidden');
    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = false;
    btn.textContent = btn.getAttribute('data-label') || btn.textContent;
    Array.prototype.forEach.call(form.querySelectorAll('.field-error'), function (n) { n.textContent = ''; });
    Array.prototype.forEach.call(form.querySelectorAll('.is-invalid'), function (n) { n.classList.remove('is-invalid'); });
    var formErr = form.querySelector('.form-error');
    if (formErr) formErr.textContent = '';
    var success = successOf(form);
    if (success) { success.classList.remove('is-visible'); success.textContent = ''; }
  }

  /* --- popup with two forms: consultation / training --- */
  var popup = null;
  var lastFocus = null;

  function consultFormHtml() {
    return '' +
      '<form class="booking-form" data-mode="consult" novalidate>' +
        '<input type="hidden" name="service" value="">' +
        '<div class="field"><label for="pc-name">Имя*</label>' +
          '<input type="text" id="pc-name" name="name" required autocomplete="name"></div>' +
        '<div class="field"><label for="pc-phone">Телефон*</label>' +
          '<input type="tel" id="pc-phone" name="phone" required></div>' +
        '<div class="field"><label>Формат</label><div class="radio-row">' +
          '<label><input type="radio" name="format" value="Очно" checked> Очно</label>' +
          '<label><input type="radio" name="format" value="Онлайн"> Онлайн</label></div></div>' +
        '<div class="field"><label for="pc-message">Сообщение</label>' +
          '<textarea id="pc-message" name="message" placeholder="Коротко о вашем запросе — необязательно"></textarea></div>' +
        '<div class="consent-row"><input type="checkbox" id="pc-consent" name="consent" required>' +
          '<label for="pc-consent">Отправляя форму, вы соглашаетесь на обработку персональных данных в соответствии с ' + POLICY_LINK + '.</label></div>' +
        '<button type="submit" class="btn btn-primary">Отправить заявку</button>' +
      '</form>' +
      '<div class="form-success" role="status"></div>';
  }

  function trainingFormHtml() {
    return '' +
      '<form class="booking-form" data-mode="training" novalidate>' +
        '<div class="field"><label for="pt-name">ФИО*</label>' +
          '<input type="text" id="pt-name" name="name" required autocomplete="name" placeholder="Фамилия Имя Отчество"></div>' +
        '<div class="field"><label for="pt-phone">Телефон*</label>' +
          '<input type="tel" id="pt-phone" name="phone" required></div>' +
        '<div class="field"><label for="pt-email">Почта*</label>' +
          '<input type="email" id="pt-email" name="email" required autocomplete="email" placeholder="name@mail.ru"></div>' +
        '<div class="field"><label for="pt-program">Программа*</label>' +
          '<select id="pt-program" name="service"></select></div>' +
        '<div class="consent-row"><input type="checkbox" id="pt-consent" name="consent" required>' +
          '<label for="pt-consent">Отправляя форму, вы соглашаетесь на обработку персональных данных в соответствии с ' + POLICY_LINK + '.</label></div>' +
        '<button type="submit" class="btn btn-primary">Записаться на обучение</button>' +
      '</form>' +
      '<div class="form-success" role="status"></div>';
  }

  function buildPopup() {
    var dlg = document.createElement('dialog');
    dlg.className = 'popup bg-block';
    dlg.setAttribute('aria-labelledby', 'popup-title');
    dlg.innerHTML =
      '<button type="button" class="popup-close" aria-label="Закрыть">' +
        '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
      '</button>' +
      '<div class="popup-body">' +
        '<h2 id="popup-title"></h2>' +
        '<p class="popup-lede"></p>' +
        '<p class="popup-chosen" hidden></p>' +
        consultFormHtml() +
        trainingFormHtml() +
      '</div>';
    document.body.appendChild(dlg);

    dlg.querySelector('.popup-close').addEventListener('click', closePopup);
    dlg.addEventListener('click', function (e) { if (e.target === dlg) closePopup(); });
    dlg.addEventListener('close', function () {
      document.documentElement.classList.remove('popup-open');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    });
    Array.prototype.forEach.call(dlg.querySelectorAll('form'), initBookingForm);
    return dlg;
  }

  function openPopup(service, mode) {
    if (!popup) popup = buildPopup();
    lastFocus = document.activeElement;
    mode = mode || (isProgram(service) ? 'training' : 'consult');
    popup.setAttribute('data-mode', mode);

    Array.prototype.forEach.call(popup.querySelectorAll('form'), function (f) {
      var active = f.getAttribute('data-mode') === mode;
      f.hidden = !active;
      var s = successOf(f);
      if (s) s.hidden = !active;
      if (active) resetBookingForm(f);
    });

    var form = popup.querySelector('form[data-mode="' + mode + '"]');
    var chosen = popup.querySelector('.popup-chosen');
    if (mode === 'training') {
      popup.querySelector('#popup-title').textContent = 'Запись на обучение';
      popup.querySelector('.popup-lede').textContent = 'Оставьте контакты и выберите программу — свяжусь с вами и расскажу о ближайшем наборе.';
      fillProgramSelect(form.elements['service'], service || '');
      chosen.hidden = true;
    } else {
      popup.querySelector('#popup-title').textContent = 'Запись на консультацию';
      popup.querySelector('.popup-lede').textContent = 'Оставьте контакты — свяжусь с вами и подберу удобное время.';
      form.elements['service'].value = service || '';
      chosen.hidden = !service;
      chosen.textContent = service ? 'Вы записываетесь: ' + service : '';
    }

    if (typeof popup.showModal === 'function') {
      if (!popup.open) popup.showModal();
    } else {
      popup.setAttribute('open', '');
    }
    document.documentElement.classList.add('popup-open');
    window.setTimeout(function () { form.elements['name'].focus(); }, 60);
  }

  function closePopup() {
    if (!popup) return;
    if (typeof popup.close === 'function') popup.close();
    else {
      popup.removeAttribute('open');
      document.documentElement.classList.remove('popup-open');
    }
  }

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('a[href$="#zapis"], [data-popup]');
    if (!trigger) return;
    e.preventDefault();
    openPopup(trigger.getAttribute('data-service') || '', trigger.getAttribute('data-mode') || '');
  });

  // inline consultation form at the bottom of the home page shares the same logic
  var inlineForm = document.getElementById('booking-form');
  if (inlineForm) initBookingForm(inlineForm);
});
