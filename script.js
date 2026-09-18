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

  /* ---------- Booking form ---------- */
  var form = document.getElementById('booking-form');
  if (form) {
    var successMsg = document.getElementById('form-success');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // ---------------------------------------------------------------
      // ТОЧКА ИНТЕГРАЦИИ: здесь должен быть реальный вызов бэкенда/CRM
      // (fetch на серверный обработчик, интеграция с amoCRM/Bitrix24,
      // сервис форм типа Formspree/Getform, либо mailto: как fallback).
      // Сейчас сайт статический и бэкенда нет, поэтому ниже — только
      // имитация успешной отправки для пользователя.
      // Пример варианта с mailto (раскомментировать при необходимости):
      // var name = form.elements['name'].value;
      // var phone = form.elements['phone'].value;
      // var format = form.querySelector('input[name="format"]:checked');
      // var message = form.elements['message'].value;
      // window.location.href = 'mailto:klln@mail.ru?subject=' +
      //   encodeURIComponent('Заявка с сайта от ' + name) +
      //   '&body=' + encodeURIComponent('Телефон: ' + phone +
      //     '\nФормат: ' + (format ? format.value : '') +
      //     '\nСообщение: ' + message);
      // ---------------------------------------------------------------

      form.classList.add('is-hidden');
      if (successMsg) {
        successMsg.classList.add('is-visible');
        successMsg.setAttribute('tabindex', '-1');
        successMsg.focus();
      }
    });
  }
});
