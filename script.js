/* ═══════════════════════════════════════════════════════════
   AgroMIP — script.js
   Autor: AgroMIP · Agrinho 2026
   Descrição: JavaScript principal do site AgroMIP
   Seções:
     1.  Splash Screen
     2.  Tema (Modo Escuro / Claro) + Cookies
     3.  Navbar (scroll, menu mobile, link ativo)
     4.  Animações por scroll (Intersection Observer)
     5.  Contadores animados
     6.  Galeria (filtros + lightbox)
     7.  Quiz interativo
     8.  Formulário de contato (validação JS)
     9.  Newsletter (validação JS)
    10.  Sistema de Login / Conta (localStorage)
    11.  Botão voltar ao topo
    12.  Cookies de sessão / preferências
    13.  Inicialização geral
════════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────────
   UTILITÁRIOS GLOBAIS
───────────────────────────────────────────────────────── */

/**
 * Atalho para document.querySelector
 * @param {string} sel - seletor CSS
 * @param {Element} [ctx=document] - contexto de busca
 * @returns {Element|null}
 */
const $ = (sel, ctx = document) => ctx.querySelector(sel);

/**
 * Atalho para document.querySelectorAll (retorna Array)
 * @param {string} sel - seletor CSS
 * @param {Element} [ctx=document] - contexto de busca
 * @returns {Element[]}
 */
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/**
 * Adiciona classe 'visible' a um elemento (usado com Intersection Observer)
 * @param {Element} el
 */
const revealEl = (el) => el.classList.add('visible');


/* ═══════════════════════════════════════════════════════════
   1. SPLASH SCREEN
   Exibe animação de entrada e some após carregamento
════════════════════════════════════════════════════════════ */
(function initSplash() {
  const splash   = $('#splash');
  const progress = $('#splash-progress');

  if (!splash || !progress) return;

  let pct = 0; // porcentagem atual da barra

  // Avança a barra de progresso a cada 30ms
  const interval = setInterval(() => {
    pct += Math.random() * 12 + 4; // incremento aleatório entre 4–16%

    if (pct >= 100) {
      pct = 100;
      clearInterval(interval);

      // Aguarda 400ms na barra cheia e some
      setTimeout(() => {
        splash.classList.add('hidden');

        // Remove do DOM após transição para não bloquear foco
        splash.addEventListener('transitionend', () => splash.remove(), { once: true });
      }, 400);
    }

    progress.style.width = pct + '%';
  }, 30);
})();


/* ═══════════════════════════════════════════════════════════
   2. TEMA — MODO ESCURO / CLARO + COOKIES
   Lembra preferência do usuário via cookie
════════════════════════════════════════════════════════════ */

/* -- Funções auxiliares de Cookie -- */

/**
 * Define um cookie com validade em dias
 * @param {string} name
 * @param {string} value
 * @param {number} days
 */
function setCookie(name, value, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
}

/**
 * Lê um cookie pelo nome
 * @param {string} name
 * @returns {string|null}
 */
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Remove um cookie
 * @param {string} name
 */
function deleteCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}

/* -- Inicialização do tema -- */
(function initTheme() {
  const toggleBtn = $('#theme-toggle');
  const themeIcon = $('#theme-icon');
  const body      = document.body;

  if (!toggleBtn) return;

  // Lê preferência salva em cookie (ou usa prefers-color-scheme)
  const savedTheme = getCookie('agromip_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;

  // Aplica o tema inicial sem transição
  body.classList.toggle('dark-mode', isDark);
  themeIcon.textContent = isDark ? '☀️' : '🌙';

  // Alterna o tema ao clicar
  toggleBtn.addEventListener('click', () => {
    const nowDark = body.classList.toggle('dark-mode');
    themeIcon.textContent = nowDark ? '☀️' : '🌙';
    setCookie('agromip_theme', nowDark ? 'dark' : 'light');
  });
})();


/* ═══════════════════════════════════════════════════════════
   3. NAVBAR
   Scroll shadow, menu mobile e marcação de link ativo
════════════════════════════════════════════════════════════ */
(function initNavbar() {
  const navbar     = $('#navbar');
  const menuToggle = $('#menu-toggle');
  const navLinks   = $('#nav-links');
  const links      = $$('a', navLinks);

  if (!navbar) return;

  /* Sombra ao scrollar */
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    updateActiveLink();
  }, { passive: true });

  /* Menu hamburguer (mobile) */
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      menuToggle.classList.toggle('open', isOpen);
      menuToggle.setAttribute('aria-expanded', isOpen);
    });

    // Fecha menu ao clicar em qualquer link
    links.forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        menuToggle.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* Link ativo conforme seção visível */
  function updateActiveLink() {
    const sections = $$('section[id]');
    const scrollY  = window.scrollY + 100;

    sections.forEach(section => {
      const top    = section.offsetTop;
      const height = section.offsetHeight;
      const id     = section.getAttribute('id');
      const link   = $(`a[href="#${id}"]`, navLinks);

      if (link) {
        link.classList.toggle('active', scrollY >= top && scrollY < top + height);
      }
    });
  }

  updateActiveLink();
})();


/* ═══════════════════════════════════════════════════════════
   4. ANIMAÇÕES POR SCROLL (Intersection Observer)
   Revela elementos com classe .reveal e .pillar-card ao entrar na tela
════════════════════════════════════════════════════════════ */
(function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // para de observar após revelar
        }
      });
    },
    { threshold: 0.15 }
  );

  // Aplica a elementos com .reveal e .pillar-card
  $$('.reveal, .pillar-card, .stat-card, .gallery-card, .contact-form-wrap, .newsletter-wrap')
    .forEach(el => {
      el.classList.add('reveal');
      observer.observe(el);
    });
})();


/* ═══════════════════════════════════════════════════════════
   5. CONTADORES ANIMADOS
   Anima os números das estatísticas quando entram na tela
════════════════════════════════════════════════════════════ */
(function initCounters() {
  const counters = $$('.stat-number');
  if (!counters.length) return;

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el      = entry.target;
        const target  = +el.dataset.target;   // valor final
        const suffix  = el.dataset.suffix || ''; // ex: "%", "+", " anos"
        const duration = 1800;  // duração da animação em ms
        const steps    = 60;    // frames
        const stepTime = duration / steps;
        let current    = 0;

        const timer = setInterval(() => {
          current += target / steps;

          if (current >= target) {
            current = target;
            clearInterval(timer);
          }

          // Formata com separador de milhar para números grandes
          const formatted = target >= 1000
            ? Math.floor(current).toLocaleString('pt-BR')
            : Math.floor(current);

          el.textContent = formatted + suffix;
        }, stepTime);

        counterObserver.unobserve(el); // executa só uma vez
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(c => counterObserver.observe(c));
})();


/* ═══════════════════════════════════════════════════════════
   6. GALERIA — FILTROS + LIGHTBOX
   Filtra cards por categoria e abre imagem ampliada
════════════════════════════════════════════════════════════ */
(function initGallery() {
  const filterBtns = $$('.filter-btn');
  const cards      = $$('.gallery-card');
  const lightbox   = $('#lightbox');
  const lbImg      = $('#lightbox-img');
  const lbCaption  = $('#lightbox-caption');
  const lbClose    = $('#lightbox-close');

  /* ── Filtros ── */
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Atualiza botão ativo
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter; // "all" | "pragas" | "aliados" | "lavoura"

      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('hidden', !match);
      });
    });
  });

  /* ── Lightbox ── */

  // Abre lightbox ao clicar no botão de zoom
  cards.forEach(card => {
    const zoomBtn = $('.gallery-zoom', card);
    const img     = $('img', card);
    const caption = $('.gallery-info p', card);

    if (!zoomBtn || !img) return;

    zoomBtn.addEventListener('click', () => openLightbox(img.src, img.alt, caption?.textContent || ''));
  });

  /**
   * Abre o lightbox com a imagem e legenda fornecidas
   * @param {string} src - URL da imagem
   * @param {string} alt - texto alternativo
   * @param {string} caption - legenda exibida abaixo
   */
  function openLightbox(src, alt, caption) {
    lbImg.src        = src;
    lbImg.alt        = alt;
    lbCaption.textContent = caption;
    lightbox.hidden  = false;
    document.body.style.overflow = 'hidden'; // impede scroll enquanto aberto
    lbClose.focus();
  }

  /** Fecha o lightbox */
  function closeLightbox() {
    lightbox.hidden = true;
    lbImg.src       = '';
    document.body.style.overflow = '';
  }

  // Fecha ao clicar no botão X
  if (lbClose) lbClose.addEventListener('click', closeLightbox);

  // Fecha ao clicar fora da imagem
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  // Fecha com tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
  });
})();


/* ═══════════════════════════════════════════════════════════
   7. QUIZ INTERATIVO
   5 perguntas sobre MIP com pontuação e feedback
════════════════════════════════════════════════════════════ */
(function initQuiz() {
  /* -- Banco de perguntas -- */
  const perguntas = [
    {
      pergunta: "O que significa a sigla MIP?",
      opcoes: [
        "Método Integrado de Produção",
        "Manejo Integrado de Pragas",
        "Monitoramento Intensivo de Plantio",
        "Modelo de Inspeção de Pesticides"
      ],
      correta: 1,
      explicacao: "MIP significa Manejo Integrado de Pragas — uma estratégia que combina diferentes métodos de controle para reduzir o uso de agrotóxicos."
    },
    {
      pergunta: "Qual é o primeiro passo recomendado pelo MIP antes de qualquer intervenção na lavoura?",
      opcoes: [
        "Aplicar inseticida preventivamente",
        "Consultar o vizinho sobre o que fazer",
        "Monitorar e identificar a praga",
        "Fazer rotação de culturas imediatamente"
      ],
      correta: 2,
      explicacao: "O monitoramento é o alicerce do MIP. Só após identificar a praga e avaliar sua população é que se toma a decisão de intervir."
    },
    {
      pergunta: "O que é o 'nível de ação' no contexto do MIP?",
      opcoes: [
        "A quantidade máxima de agrotóxico permitida por hectare",
        "A densidade de plantas por metro quadrado",
        "O ponto em que a praga começa a causar dano econômico e se justifica agir",
        "O número mínimo de insetos necessários para polinização"
      ],
      correta: 2,
      explicacao: "O nível de ação (ou nível de controle) é a densidade populacional da praga em que os prejuízos econômicos justificam o custo de um controle."
    },
    {
      pergunta: "Qual dos organismos abaixo é considerado um aliado natural no MIP?",
      opcoes: [
        "Spodoptera frugiperda (lagarta-do-cartucho)",
        "Trichogramma spp. (microparasitoide de ovos)",
        "Euschistus heros (percevejo-marrom)",
        "Bemisia tabaci (mosca-branca)"
      ],
      correta: 1,
      explicacao: "O Trichogramma é uma vespinha que parasita ovos de pragas antes que eclodam, sendo um dos agentes de controle biológico mais usados no Brasil."
    },
    {
      pergunta: "Qual benefício ambiental direto o MIP oferece quando comparado ao controle químico convencional?",
      opcoes: [
        "Elimina completamente todas as pragas da lavoura",
        "Aumenta o uso de agrotóxicos para garantir mais eficiência",
        "Reduz a contaminação do solo, da água e preserva inimigos naturais",
        "Substitui a necessidade de irrigação"
      ],
      correta: 2,
      explicacao: "O MIP reduz significativamente o uso de agrotóxicos, diminuindo a contaminação ambiental e preservando a biodiversidade, incluindo os próprios inimigos naturais das pragas."
    }
  ];

  /* -- Variáveis de estado do quiz -- */
  let questaoAtual = 0;  // índice da pergunta atual
  let pontuacao    = 0;  // quantidade de acertos
  let respondeu    = false; // controla se já respondeu a questão

  /* -- Elementos DOM -- */
  const questionEl  = $('#quiz-question');
  const optionsEl   = $('#quiz-options');
  const feedbackEl  = $('#quiz-feedback');
  const feedbackTxt = $('#quiz-feedback-text');
  const nextBtn     = $('#quiz-next');
  const counterEl   = $('#quiz-counter');
  const progressBar = $('#quiz-progress-bar');
  const resultEl    = $('#quiz-result');
  const resultEmoji = $('#result-emoji');
  const resultTitle = $('#result-title');
  const resultScore = $('#result-score');
  const restartBtn  = $('#quiz-restart');
  const questionArea= $('#quiz-question-area');

  if (!questionEl) return;

  /** Renderiza a pergunta atual na tela */
  function renderPergunta() {
    respondeu = false;
    nextBtn.disabled = true;
    feedbackEl.hidden = true;

    const q = perguntas[questaoAtual];

    // Atualiza progresso
    const progresso = (questaoAtual / perguntas.length) * 100;
    progressBar.style.width = progresso + '%';
    counterEl.textContent = `Pergunta ${questaoAtual + 1} de ${perguntas.length}`;

    // Insere a pergunta
    questionEl.textContent = q.pergunta;

    // Limpa e insere as opções
    optionsEl.innerHTML = '';

    q.opcoes.forEach((opcao, i) => {
      const li = document.createElement('li');
      li.className = 'quiz-option';
      li.textContent = opcao;
      li.setAttribute('role', 'button');
      li.setAttribute('tabindex', '0');
      li.setAttribute('aria-label', `Opção ${i + 1}: ${opcao}`);

      // Clique na opção
      li.addEventListener('click', () => responder(i, li));

      // Acessibilidade — Enter/Space também respondem
      li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          responder(i, li);
        }
      });

      optionsEl.appendChild(li);
    });
  }

  /**
   * Processa a resposta do usuário
   * @param {number} indice - índice da opção escolhida
   * @param {Element} el - elemento clicado
   */
  function responder(indice, el) {
    if (respondeu) return; // impede dupla resposta
    respondeu = true;

    const q       = perguntas[questaoAtual];
    const acertou = indice === q.correta;

    if (acertou) pontuacao++;

    // Marca visualmente certo/errado
    const opcoes = $$('.quiz-option', optionsEl);
    opcoes.forEach((op, i) => {
      op.classList.add('disabled');
      if (i === q.correta) op.classList.add('correct');
      if (i === indice && !acertou) op.classList.add('wrong');
    });

    // Exibe feedback com explicação
    feedbackTxt.innerHTML = `
      <strong>${acertou ? '✅ Correto!' : '❌ Incorreto!'}</strong>
      ${q.explicacao}
    `;
    feedbackEl.hidden = false;

    // Habilita o botão "Próxima"
    nextBtn.disabled = false;

    // Atualiza melhor pontuação no localStorage se usuário logado
    salvarPontuacaoQuiz(pontuacao);
  }

  /** Avança para a próxima pergunta ou exibe resultado final */
  function avancar() {
    questaoAtual++;

    if (questaoAtual < perguntas.length) {
      renderPergunta();
    } else {
      exibirResultado();
    }
  }

  /** Exibe o resultado final do quiz */
  function exibirResultado() {
    progressBar.style.width = '100%';
    questionArea.hidden = true;
    feedbackEl.hidden   = true;
    nextBtn.hidden      = true;
    counterEl.hidden    = true;
    resultEl.hidden     = false;

    const pct = (pontuacao / perguntas.length) * 100;

    // Emoji e mensagem conforme desempenho
    let emoji, titulo;
    if (pct === 100) {
      emoji  = '🏆';
      titulo = 'Perfeito! Você é um especialista em MIP!';
    } else if (pct >= 60) {
      emoji  = '🌱';
      titulo = 'Muito bem! Você conhece bastante sobre MIP!';
    } else {
      emoji  = '📚';
      titulo = 'Continue estudando! O MIP tem muito a ensinar.';
    }

    resultEmoji.textContent = emoji;
    resultTitle.textContent = titulo;
    resultScore.textContent = `Você acertou ${pontuacao} de ${perguntas.length} perguntas.`;
  }

  /** Reinicia o quiz do zero */
  function reiniciar() {
    questaoAtual = 0;
    pontuacao    = 0;

    questionArea.hidden = false;
    nextBtn.hidden      = false;
    counterEl.hidden    = false;
    resultEl.hidden     = true;

    renderPergunta();
  }

  // Eventos
  if (nextBtn)    nextBtn.addEventListener('click', avancar);
  if (restartBtn) restartBtn.addEventListener('click', reiniciar);

  // Inicializa
  renderPergunta();
})();


/* ═══════════════════════════════════════════════════════════
   8. FORMULÁRIO DE CONTATO — VALIDAÇÃO JS
════════════════════════════════════════════════════════════ */
(function initContactForm() {
  const sendBtn    = $('#btn-send-contact');
  const successMsg = $('#contact-success');

  if (!sendBtn) return;

  sendBtn.addEventListener('click', () => {
    // Coleta valores
    const name    = $('#contact-name');
    const email   = $('#contact-email');
    const message = $('#contact-message');

    let valido = true;

    // Limpa erros anteriores
    clearError('contact-name',    'error-name');
    clearError('contact-email',   'error-email');
    clearError('contact-message', 'error-message');

    // Valida nome
    if (!name.value.trim() || name.value.trim().length < 2) {
      showError(name, 'error-name', 'Informe seu nome (mínimo 2 caracteres).');
      valido = false;
    }

    // Valida e-mail com regex
    if (!isValidEmail(email.value.trim())) {
      showError(email, 'error-email', 'Informe um e-mail válido.');
      valido = false;
    }

    // Valida mensagem
    if (!message.value.trim() || message.value.trim().length < 10) {
      showError(message, 'error-message', 'A mensagem deve ter ao menos 10 caracteres.');
      valido = false;
    }

    if (!valido) return;

    // Simula envio (sem backend)
    sendBtn.disabled = true;
    sendBtn.textContent = 'Enviando…';

    setTimeout(() => {
      successMsg.hidden = false;
      sendBtn.hidden    = true;

      // Limpa formulário
      $('#contact-name').value    = '';
      $('#contact-email').value   = '';
      $('#contact-subject').value = '';
      $('#contact-message').value = '';
    }, 1000);
  });
})();


/* ═══════════════════════════════════════════════════════════
   9. NEWSLETTER — VALIDAÇÃO JS
════════════════════════════════════════════════════════════ */
(function initNewsletter() {
  const subscribeBtn = $('#btn-subscribe');
  const successMsg   = $('#newsletter-success');

  if (!subscribeBtn) return;

  subscribeBtn.addEventListener('click', () => {
    const emailEl = $('#newsletter-email');
    clearError('newsletter-email', 'error-newsletter');

    if (!isValidEmail(emailEl.value.trim())) {
      showError(emailEl, 'error-newsletter', 'Informe um e-mail válido para se inscrever.');
      return;
    }

    // Salva e-mail inscrito no localStorage
    const inscritos = getStorage('agromip_newsletter') || [];
    if (!inscritos.includes(emailEl.value.trim())) {
      inscritos.push(emailEl.value.trim());
      setStorage('agromip_newsletter', inscritos);
    }

    subscribeBtn.disabled = true;
    subscribeBtn.textContent = 'Inscrevendo…';

    setTimeout(() => {
      successMsg.hidden       = false;
      subscribeBtn.hidden     = true;
      $('#newsletter-name').value  = '';
      emailEl.value                = '';
    }, 800);
  });
})();


/* ═══════════════════════════════════════════════════════════
   10. SISTEMA DE LOGIN / CONTA — localStorage
   Cadastro, login, logout e exibição de dados do usuário
════════════════════════════════════════════════════════════ */
(function initAuth() {
  /* -- Elementos DOM -- */
  const btnAccount   = $('#btn-account');
  const accountLabel = $('#account-label');
  const modal        = $('#modal-auth');
  const modalOverlay = $('#modal-overlay');
  const modalClose   = $('#modal-close');

  const tabLogin     = $('#tab-login');
  const tabRegister  = $('#tab-register');
  const panelLogin   = $('#panel-login');
  const panelRegister= $('#panel-register');
  const panelLogged  = $('#panel-logged');

  const btnLogin     = $('#btn-login');
  const btnRegister  = $('#btn-register');
  const btnLogout    = $('#btn-logout');

  if (!modal) return;

  /* -- Abre/fecha modal -- */

  btnAccount.addEventListener('click', () => {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    atualizarModalParaEstado();
  });

  function fecharModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    clearError('login-email',    'error-login');
    clearError('reg-email',      'error-register');
  }

  modalClose.addEventListener('click', fecharModal);
  modalOverlay.addEventListener('click', fecharModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) fecharModal();
  });

  /* -- Abas login / cadastro -- */

  tabLogin.addEventListener('click', () => mudarAba('login'));
  tabRegister.addEventListener('click', () => mudarAba('register'));

  /**
   * Alterna entre painéis de login e cadastro
   * @param {'login'|'register'} aba
   */
  function mudarAba(aba) {
    const isLogin = aba === 'login';
    tabLogin.classList.toggle('active', isLogin);
    tabRegister.classList.toggle('active', !isLogin);
    tabLogin.setAttribute('aria-selected', isLogin);
    tabRegister.setAttribute('aria-selected', !isLogin);
    panelLogin.hidden    = !isLogin;
    panelRegister.hidden = isLogin;
    clearError('login-email',  'error-login');
    clearError('reg-email',    'error-register');
  }

  /* -- Cadastro -- */

  btnRegister.addEventListener('click', () => {
    clearError('reg-email', 'error-register');

    const name     = $('#reg-name').value.trim();
    const email    = $('#reg-email').value.trim();
    const password = $('#reg-password').value;

    // Validações
    if (!name) {
      showError($('#reg-name'), 'error-register', 'Informe seu nome.');
      return;
    }
    if (!isValidEmail(email)) {
      showError($('#reg-email'), 'error-register', 'Informe um e-mail válido.');
      return;
    }
    if (password.length < 6) {
      showError($('#reg-password'), 'error-register', 'A senha deve ter ao menos 6 caracteres.');
      return;
    }

    // Verifica se e-mail já existe
    const usuarios = getStorage('agromip_users') || {};
    if (usuarios[email]) {
      showError($('#reg-email'), 'error-register', 'Este e-mail já está cadastrado.');
      return;
    }

    // Salva usuário (NUNCA salve senhas em texto puro em produção real!)
    usuarios[email] = { name, email, password, quizBest: 0 };
    setStorage('agromip_users', usuarios);

    // Faz login automático após cadastro
    logarUsuario(usuarios[email]);
  });

  /* -- Login -- */

  btnLogin.addEventListener('click', () => {
    clearError('login-email', 'error-login');

    const email    = $('#login-email').value.trim();
    const password = $('#login-password').value;

    if (!isValidEmail(email)) {
      showError($('#login-email'), 'error-login', 'Informe um e-mail válido.');
      return;
    }

    const usuarios = getStorage('agromip_users') || {};
    const usuario  = usuarios[email];

    if (!usuario || usuario.password !== password) {
      showError($('#login-email'), 'error-login', 'E-mail ou senha incorretos.');
      return;
    }

    logarUsuario(usuario);
  });

  /* -- Logout -- */

  btnLogout.addEventListener('click', () => {
    deleteCookie('agromip_session');
    atualizarNavbarConta(null);
    fecharModal();
    atualizarModalParaEstado();
  });

  /**
   * Salva sessão e atualiza UI após login bem-sucedido
   * @param {{ name: string, email: string }} usuario
   */
  function logarUsuario(usuario) {
    // Salva sessão em cookie (1 dia)
    setCookie('agromip_session', JSON.stringify({ email: usuario.email, name: usuario.name }), 1);
    atualizarNavbarConta(usuario);
    atualizarModalParaEstado();
  }

  /**
   * Atualiza o botão de conta na navbar
   * @param {{ name: string }|null} usuario - null se deslogado
   */
  function atualizarNavbarConta(usuario) {
    if (usuario) {
      accountLabel.textContent = usuario.name.split(' ')[0]; // primeiro nome
      $('#account-icon').textContent = '✅';
    } else {
      accountLabel.textContent = 'Entrar';
      $('#account-icon').textContent = '👤';
    }
  }

  /** Exibe o painel correto no modal conforme estado de sessão */
  function atualizarModalParaEstado() {
    const sessaoCookie = getCookie('agromip_session');
    const tabs = $('.modal-tabs', modal);

    if (sessaoCookie) {
      try {
        const sessao   = JSON.parse(sessaoCookie);
        const usuarios = getStorage('agromip_users') || {};
        const usuario  = usuarios[sessao.email];

        // Esconde abas e mostra painel de usuário logado
        tabs.hidden          = true;
        panelLogin.hidden    = true;
        panelRegister.hidden = true;
        panelLogged.hidden   = false;

        $('#logged-name').textContent         = `Olá, ${sessao.name.split(' ')[0]}! 👋`;
        $('#logged-email-display').textContent = sessao.email;
        $('#logged-quiz-score').textContent    = usuario?.quizBest ?? '0';

      } catch {
        deleteCookie('agromip_session');
      }
    } else {
      tabs.hidden          = false;
      panelLogged.hidden   = true;
      mudarAba('login');
    }
  }

  /* Verifica sessão ao carregar a página */
  const sessaoCookie = getCookie('agromip_session');
  if (sessaoCookie) {
    try {
      const sessao = JSON.parse(sessaoCookie);
      atualizarNavbarConta(sessao);
    } catch {
      deleteCookie('agromip_session');
    }
  }
})();

/**
 * Salva melhor pontuação do quiz no perfil do usuário logado
 * @param {number} pontuacao
 */
function salvarPontuacaoQuiz(pontuacao) {
  const sessaoCookie = getCookie('agromip_session');
  if (!sessaoCookie) return;

  try {
    const sessao   = JSON.parse(sessaoCookie);
    const usuarios = getStorage('agromip_users') || {};

    if (usuarios[sessao.email]) {
      const melhor = usuarios[sessao.email].quizBest || 0;

      if (pontuacao > melhor) {
        usuarios[sessao.email].quizBest = pontuacao;
        setStorage('agromip_users', usuarios);

        // Atualiza exibição no painel logado
        const scoreEl = $('#logged-quiz-score');
        if (scoreEl) scoreEl.textContent = pontuacao;
      }
    }
  } catch (e) {
    console.warn('Erro ao salvar pontuação:', e);
  }
}


/* ═══════════════════════════════════════════════════════════
   11. BOTÃO VOLTAR AO TOPO
════════════════════════════════════════════════════════════ */
(function initBackToTop() {
  const btn = $('#btn-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.hidden = window.scrollY < 400;
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ═══════════════════════════════════════════════════════════
   12. COOKIES DE PREFERÊNCIAS ADICIONAIS
   Registra primeira visita e exibe boas-vindas
════════════════════════════════════════════════════════════ */
(function initPreferencesCookie() {
  const primeiraVisita = getCookie('agromip_visited');

  if (!primeiraVisita) {
    // Primeira vez que o usuário acessa o site
    setCookie('agromip_visited', 'true', 365);
    console.log('👋 Bem-vindo(a) ao AgroMIP! Primeira visita registrada.');
  } else {
    console.log('🌿 Bem-vindo(a) de volta ao AgroMIP!');
  }

  // Registra data/hora da última visita
  setCookie('agromip_last_visit', new Date().toISOString(), 365);
})();


/* ═══════════════════════════════════════════════════════════
   FUNÇÕES AUXILIARES COMPARTILHADAS
════════════════════════════════════════════════════════════ */

/**
 * Valida formato de e-mail com regex
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Exibe mensagem de erro em campo de formulário
 * @param {Element} input - campo com erro
 * @param {string} errorId - id do elemento de erro
 * @param {string} msg - mensagem de erro
 */
function showError(input, errorId, msg) {
  if (input)  input.classList.add('error');
  const errEl = $(`#${errorId}`);
  if (errEl) errEl.textContent = msg;
}

/**
 * Limpa erro de campo de formulário
 * @param {string} inputId - id do campo
 * @param {string} errorId - id do elemento de erro
 */
function clearError(inputId, errorId) {
  const input = $(`#${inputId}`);
  const errEl = $(`#${errorId}`);
  if (input)  input.classList.remove('error');
  if (errEl)  errEl.textContent = '';
}

/**
 * Salva dado no localStorage como JSON
 * @param {string} key
 * @param {*} value
 */
function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('localStorage indisponível:', e);
  }
}

/**
 * Lê e parseia dado do localStorage
 * @param {string} key
 * @returns {*|null}
 */
function getStorage(key) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.warn('Erro ao ler localStorage:', e);
    return null;
  }
}
