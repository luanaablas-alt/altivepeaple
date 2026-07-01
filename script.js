var SUPABASE_URL = 'https://srjyazwxuohdcsvsmtxb.supabase.co';
var SUPABASE_ANON_KEY = 'sb_publishable_S7rdcKELpP8xGcYo63EVag_pw8sPhA3';

function supabaseInsert(table, row) {
  return fetch(SUPABASE_URL + '/rest/v1/' + table, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
    },
    body: JSON.stringify(row)
  }).then(function (res) {
    if (!res.ok) throw new Error('Falha ao salvar (' + res.status + ')');
    return res;
  });
}

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Ano no rodapé ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header: sombra ao rolar ---------- */
  var header = document.getElementById('siteHeader');
  var onScroll = function () {
    if (window.scrollY > 12) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');
  var headerCtas = document.querySelector('.header-ctas');

  function closeMenu() {
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menu');
    mainNav.classList.remove('is-open');
    if (headerCtas) headerCtas.classList.remove('is-open');
  }

  navToggle.addEventListener('click', function () {
    var expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navToggle.setAttribute('aria-label', expanded ? 'Abrir menu' : 'Fechar menu');
    mainNav.classList.toggle('is-open');
    if (headerCtas) headerCtas.classList.toggle('is-open');
  });

  // Fecha o menu ao clicar em um link
  document.querySelectorAll('.main-nav a, .header-ctas a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Fecha o menu ao redimensionar para desktop
  window.addEventListener('resize', function () {
    if (window.innerWidth > 920) closeMenu();
  });

  /* ---------- Scroll reveal (IntersectionObserver) ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = (Math.min(i % 4, 3) * 70) + 'ms';
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Contadores animados (seção Sobre) ---------- */
  var counters = document.querySelectorAll('.stat-num');
  if (counters.length && 'IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    counters.forEach(function (el) { countObserver.observe(el); });
  }

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var duration = 1400;
    var start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.floor(eased * target);
      el.textContent = value.toLocaleString('pt-BR');
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString('pt-BR');
      }
    }
    window.requestAnimationFrame(step);
  }

  /* ---------- Formulário do rodapé (demo, sem back-end) ---------- */
  var footerForm = document.getElementById('footerForm');
  var formFeedback = document.getElementById('formFeedback');

  if (footerForm) {
    footerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var emailInput = document.getElementById('footerEmail');
      var email = emailInput.value.trim();
      var isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!isValid) {
        formFeedback.textContent = 'Digite um e-mail válido para continuar.';
        formFeedback.style.color = '#F87171';
        return;
      }

      formFeedback.style.color = '';
      formFeedback.textContent = 'Recebido! Nosso time entra em contato em até 1 dia útil.';
      footerForm.reset();
    });
  }

  /* ---------- Contato empresas (grava no Supabase) ---------- */
  var contatoForm = document.getElementById('contatoEmpresasForm');
  var contatoFeedback = document.getElementById('contatoEmpresasFeedback');

  if (contatoForm) {
    contatoForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = document.getElementById('ceNome').value.trim();
      var empresa = document.getElementById('ceEmpresa').value.trim();
      var email = document.getElementById('ceEmail').value.trim();
      var telefone = document.getElementById('ceTelefone').value.trim();
      var colaboradores = document.getElementById('ceColaboradores').value;
      var mensagem = document.getElementById('ceMensagem').value.trim();
      var isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!nome || !empresa || !isValidEmail) {
        contatoFeedback.textContent = 'Preencha nome, empresa e um e-mail corporativo válido para continuar.';
        contatoFeedback.style.color = '#F87171';
        return;
      }

      var submitBtn = contatoForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      contatoFeedback.style.color = '';
      contatoFeedback.textContent = 'Enviando...';

      supabaseInsert('leads_contato_empresas', {
        nome: nome, empresa: empresa, email: email,
        telefone: telefone, colaboradores: colaboradores, mensagem: mensagem
      }).then(function () {
        contatoFeedback.textContent = 'Recebido! Um especialista da Altive entra em contato em até 1 dia útil.';
        contatoForm.reset();
      }).catch(function () {
        contatoFeedback.style.color = '#F87171';
        contatoFeedback.textContent = 'Não conseguimos enviar agora. Tente novamente em instantes.';
      }).finally(function () {
        submitBtn.disabled = false;
      });
    });
  }

  /* ---------- Checkout: seleção de curso ---------- */
  var checkoutEmpty = document.getElementById('checkoutEmpty');
  var checkoutItem = document.getElementById('checkoutItem');
  var checkoutCat = document.getElementById('checkoutCat');
  var checkoutName = document.getElementById('checkoutName');
  var checkoutPrice = document.getElementById('checkoutPrice');
  var checkoutSubmit = document.getElementById('checkoutSubmit');
  var courseButtons = document.querySelectorAll('.course-footer [data-course-name]');

  function showSelectedCourse(course) {
    if (!checkoutItem) return;
    checkoutCat.textContent = course.cat;
    checkoutName.textContent = course.name;
    checkoutPrice.textContent = course.price;
    checkoutEmpty.hidden = true;
    checkoutItem.hidden = false;
    if (checkoutSubmit) checkoutSubmit.disabled = false;
  }

  courseButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var course = {
        name: btn.getAttribute('data-course-name'),
        cat: btn.getAttribute('data-course-cat'),
        price: btn.getAttribute('data-course-price')
      };
      sessionStorage.setItem('altive_selected_course', JSON.stringify(course));
      showSelectedCourse(course);
    });
  });

  (function restoreSelectedCourse() {
    var raw = sessionStorage.getItem('altive_selected_course');
    if (!raw) return;
    try {
      showSelectedCourse(JSON.parse(raw));
    } catch (e) { /* seleção inválida, ignora */ }
  })();

  /* ---------- Checkout: envio (grava no Supabase) ---------- */
  var checkoutForm = document.getElementById('checkoutForm');
  var checkoutFeedback = document.getElementById('checkoutFeedback');

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = document.getElementById('coNome').value.trim();
      var email = document.getElementById('coEmail').value.trim();
      var isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      var rawCourse = sessionStorage.getItem('altive_selected_course');

      if (!rawCourse) {
        checkoutFeedback.textContent = 'Selecione um curso na seção "Cursos" antes de continuar.';
        checkoutFeedback.style.color = '#F87171';
        return;
      }
      if (!nome || !isValidEmail) {
        checkoutFeedback.textContent = 'Preencha nome e um e-mail válido para continuar.';
        checkoutFeedback.style.color = '#F87171';
        return;
      }

      var course = JSON.parse(rawCourse);
      var submitBtn = document.getElementById('checkoutSubmit');
      submitBtn.disabled = true;
      checkoutFeedback.style.color = '';
      checkoutFeedback.textContent = 'Enviando...';

      supabaseInsert('pedidos_checkout', {
        nome: nome, email: email,
        curso_nome: course.name, curso_categoria: course.cat, curso_preco: course.price
      }).then(function () {
        checkoutFeedback.textContent = 'Inscrição recebida! Enviamos as instruções de pagamento e acesso para o seu e-mail.';
        checkoutForm.reset();
        sessionStorage.removeItem('altive_selected_course');
      }).catch(function () {
        checkoutFeedback.style.color = '#F87171';
        checkoutFeedback.textContent = 'Não conseguimos enviar agora. Tente novamente em instantes.';
      }).finally(function () {
        submitBtn.disabled = false;
      });
    });
  }

  /* ---------- Ativa item de menu conforme a seção visível ---------- */
  var sections = document.querySelectorAll('main section[id]');
  var navLinks = document.querySelectorAll('.main-nav a');

  if (sections.length && 'IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var id = entry.target.getAttribute('id');
        var link = document.querySelector('.main-nav a[href="#' + id + '"]');
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) { l.style.color = ''; });
          link.style.color = 'var(--teal-dark)';
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px' });

    sections.forEach(function (s) { navObserver.observe(s); });
  }

});
