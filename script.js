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

  /* ---------- Booking: phone mask, validation, popup ---------- */
  // Куда отправлять заявки. Укажите адрес формы (например Formspree:
  // 'https://formspree.io/f/xxxxxxx') — тогда заявки будут приходить сразу на почту.
  // Пока адрес пустой, вместо этого открывается готовое письмо на CONTACT_EMAIL.
  var FORM_ENDPOINT = '';
  var CONTACT_EMAIL = 'klln@mail.ru';
  var CONTACT_PHONE = '8 (913) 914-33-62';

  var SERVICE_GROUPS = [
    { label: 'Консультации', items: [
      'Индивидуальные консультации',
      'Семейные и детско-родительские консультации',
      'Песочная терапия'
    ] },
    { label: 'Программы обучения', items: [
      'Песочная терапия как инструмент жизненных изменений. Базовый курс плюс',
      'Базовый курс интегративной песочной терапии',
      'Разрешение травмы. Интеграция методов песочной терапии и соматического переживания Питера Левина',
      'Песочная терапия в работе с детьми',
      'Песочная терапия в работе с семьёй',
      'В поисках золотой тени',
      'Решение психосоматических проблем в психологической песочнице',
      'Шёпот рода'
    ] }
  ];

  function isProgram(name) {
    return SERVICE_GROUPS[1].items.indexOf(name) !== -1;
  }

  function fillServiceSelect(select, selected) {
    select.textContent = '';
    var def = document.createElement('option');
    def.value = '';
    def.textContent = 'Пока не определился(-ась) — подскажите';
    select.appendChild(def);
    var found = false;
    SERVICE_GROUPS.forEach(function (group) {
      var og = document.createElement('optgroup');
      og.label = group.label;
      group.items.forEach(function (name) {
        var o = document.createElement('option');
        o.value = name;
        o.textContent = name;
        if (name === selected) { o.selected = true; found = true; }
        og.appendChild(o);
      });
      select.appendChild(og);
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
      // restore caret next to the same digit
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

    var name = form.elements['name'];
    if (name.value.trim().length < 2) fail(name, 'Укажите, как к вам обращаться');
    else setFieldError(name, '');

    var phone = form.elements['phone'];
    var digits = phoneDigits(phone.value);
    if (digits.length <= 1) fail(phone, 'Укажите телефон для связи');
    else if (digits.length < 11) fail(phone, 'Введите номер полностью: +7 (XXX) XXX-XX-XX');
    else setFieldError(phone, '');

    var consent = form.elements['consent'];
    if (!consent.checked) fail(consent, 'Нужно согласие на обработку персональных данных');
    else setFieldError(consent, '');

    if (first) first.focus();
    return !first;
  }

  function collectData(form) {
    var fmt = form.querySelector('input[name="format"]:checked');
    var svc = form.elements['service'];
    return {
      name: form.elements['name'].value.trim(),
      phone: formatPhone(phoneDigits(form.elements['phone'].value)),
      service: svc ? svc.value : '',
      format: fmt ? fmt.value : '',
      message: form.elements['message'].value.trim(),
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
    var body = [
      'Имя: ' + data.name,
      'Телефон: ' + data.phone,
      'Услуга / программа: ' + (data.service || 'не выбрана'),
      'Формат: ' + data.format,
      'Сообщение: ' + (data.message || '—')
    ].join('\n');
    var subject = 'Заявка с сайта: ' + (data.service || 'консультация');
    window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    return Promise.resolve('mailto');
  }

  function initBookingForm(form) {
    var phone = form.elements['phone'];
    attachPhoneMask(phone);
    var svcSelect = form.elements['service'];
    if (svcSelect && !svcSelect.options.length) fillServiceSelect(svcSelect, '');

    Array.prototype.forEach.call(form.querySelectorAll('input, textarea, select'), function (el) {
      el.addEventListener('input', function () { setFieldError(el, ''); });
      el.addEventListener('change', function () { setFieldError(el, ''); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateForm(form)) return;

      var btn = form.querySelector('button[type="submit"]');
      var btnText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Отправляем…';
      var success = form.parentNode.querySelector('.form-success');

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
        btn.textContent = btnText;
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
    btn.textContent = 'Отправить заявку';
    Array.prototype.forEach.call(form.querySelectorAll('.field-error'), function (n) { n.textContent = ''; });
    Array.prototype.forEach.call(form.querySelectorAll('.is-invalid'), function (n) { n.classList.remove('is-invalid'); });
    var formErr = form.querySelector('.form-error');
    if (formErr) formErr.textContent = '';
    var success = form.parentNode.querySelector('.form-success');
    if (success) { success.classList.remove('is-visible'); success.textContent = ''; }
  }

  /* --- popup --- */
  var popup = null;
  var lastFocus = null;

  function popupFormHtml() {
    return '' +
      '<form class="booking-form" novalidate>' +
        '<div class="field"><label for="p-name">Имя*</label>' +
          '<input type="text" id="p-name" name="name" required autocomplete="name"></div>' +
        '<div class="field"><label for="p-phone">Телефон*</label>' +
          '<input type="tel" id="p-phone" name="phone" required></div>' +
        '<div class="field"><label for="p-service">Услуга или программа</label>' +
          '<select id="p-service" name="service"></select></div>' +
        '<div class="field"><label>Формат</label><div class="radio-row">' +
          '<label><input type="radio" name="format" value="Очно" checked> Очно</label>' +
          '<label><input type="radio" name="format" value="Онлайн"> Онлайн</label></div></div>' +
        '<div class="field"><label for="p-message">Сообщение</label>' +
          '<textarea id="p-message" name="message" placeholder="Коротко о вашем запросе — необязательно"></textarea></div>' +
        '<div class="consent-row"><input type="checkbox" id="p-consent" name="consent" required>' +
          '<label for="p-consent">Отправляя форму, вы соглашаетесь на обработку персональных данных в соответствии с политикой конфиденциальности.</label></div>' +
        '<button type="submit" class="btn btn-primary">Отправить заявку</button>' +
      '</form>' +
      '<div class="form-success" role="status"></div>';
  }

  function updatePopupTitle() {
    var svc = popup.querySelector('select[name="service"]').value;
    popup.querySelector('#popup-title').textContent = isProgram(svc) ? 'Запись на обучение' : 'Запись на консультацию';
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
        '<h2 id="popup-title">Запись на консультацию</h2>' +
        '<p class="popup-lede">Оставьте контакты — свяжусь с вами и подберу удобное время.</p>' +
        popupFormHtml() +
      '</div>';
    document.body.appendChild(dlg);

    dlg.querySelector('.popup-close').addEventListener('click', closePopup);
    dlg.addEventListener('click', function (e) { if (e.target === dlg) closePopup(); });
    dlg.addEventListener('close', function () {
      document.documentElement.classList.remove('popup-open');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    });
    var form = dlg.querySelector('form');
    initBookingForm(form);
    form.elements['service'].addEventListener('change', function () { updatePopupTitle(); });
    return dlg;
  }

  function openPopup(service) {
    if (!popup) popup = buildPopup();
    lastFocus = document.activeElement;
    var form = popup.querySelector('form');
    resetBookingForm(form);
    fillServiceSelect(form.elements['service'], service || '');
    updatePopupTitle();
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
    openPopup(trigger.getAttribute('data-service') || '');
  });

  // inline form at the bottom of the home page shares the same logic
  var inlineForm = document.getElementById('booking-form');
  if (inlineForm) initBookingForm(inlineForm);
});
