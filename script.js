/* ═══════════════════════════════════════════════════════════
   AgroMIP — script.js  |  Agrinho 2026
   Seções:
     1.  Utilitários (seletores e cookies)
     2.  Modo Escuro / Claro  (cookie de preferência)
     3.  Saudação personalizada ao usuário  (variável JS + localStorage)
     4.  Navbar — scroll, hamburguer, link ativo
     5.  Reveal por scroll  (Intersection Observer)
     6.  Tabs de culturas
     7.  Galeria — filtros + lightbox
     8.  Matriz de decisão
     9.  Checklist de campo
    10.  Glossário com busca
════════════════════════════════════════════════════════════ */

'use strict';

/* ── 1. UTILITÁRIOS ────────────────────────────────────── */

// Atalhos para querySelector / querySelectorAll
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/**
 * Define um cookie
 * @param {string} name
 * @param {string} value
 * @param {number} days
 */
function setCookie(name, value, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
}

/**
 * Lê um cookie pelo nome — retorna null se não existir
 * @param {string} name
 * @returns {string|null}
 */
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Salva valor no localStorage (com tratamento de erro)
 * @param {string} key
 * @param {string} value
 */
function saveLocal(key, value) {
  try { localStorage.setItem(key, value); } catch (e) { /* privado/anônimo */ }
}

/**
 * Lê valor do localStorage
 * @param {string} key
 * @returns {string|null}
 */
function getLocal(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}


/* ── 2. MODO ESCURO / CLARO ────────────────────────────── */
(function initTheme() {
  const body       = document.body;
  const toggleBtn  = $('#theme-toggle');
  const themeIcon  = $('#theme-icon');
  if (!toggleBtn) return;

  // Lê preferência salva em cookie; se não houver, usa prefers-color-scheme
  const saved      = getCookie('agromip_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark     = saved ? saved === 'dark' : prefersDark;

  // Aplica tema inicial
  body.classList.toggle('dark', isDark);
  themeIcon.textContent = isDark ? '☀️' : '🌙';

  // Alterna ao clicar
  toggleBtn.addEventListener('click', () => {
    const nowDark = body.classList.toggle('dark');
    themeIcon.textContent = nowDark ? '☀️' : '🌙';
    setCookie('agromip_theme', nowDark ? 'dark' : 'light'); // salva em cookie
  });
})();


/* ── 3. SAUDAÇÃO PERSONALIZADA ─────────────────────────── */
/*
   Armazena o nome do usuário em variável JS e no localStorage.
   Exibe "Olá, [nome]!" na navbar.
   A barra de nome aparece para quem ainda não se identificou.
*/
(function initGreeting() {
  const namebar   = $('#name-bar');
  const nameInput = $('#user-name-input');
  const saveBtn   = $('#save-name-btn');
  const greetEl   = $('#greeting');
  if (!namebar || !greetEl) return;

  // Variável JS que armazena o nome do usuário nesta sessão
  let userName = getLocal('agromip_user_name') || '';

  /**
   * Exibe a saudação na navbar e oculta a barra de nome
   * @param {string} name — nome do usuário
   */
  function showGreeting(name) {
    userName = name; // atualiza a variável JS
    greetEl.textContent = `Olá, ${name}! 👋`;
    namebar.classList.remove('visible');
  }

  if (userName) {
    // Usuário já identificado em visita anterior
    showGreeting(userName);
  } else {
    // Primeira visita — exibe barra pedindo o nome
    namebar.classList.add('visible');
  }

  // Salvar nome ao clicar no botão
  saveBtn.addEventListener('click', () => {
    const inputValue = nameInput.value.trim();
    if (!inputValue) {
      nameInput.focus();
      nameInput.style.outline = '2px solid #c0392b';
      return;
    }
    nameInput.style.outline = '';
    saveLocal('agromip_user_name', inputValue); // persiste no localStorage
    setCookie('agromip_visited', 'true', 365);  // marca primeira visita em cookie
    showGreeting(inputValue);
  });

  // Também salva ao pressionar Enter no campo
  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveBtn.click();
  });
})();


/* ── 4. NAVBAR ─────────────────────────────────────────── */
(function initNavbar() {
  const header      = $('.site-header');
  const menuButton  = $('#menu-button');
  const mainNav     = $('#main-nav');
  if (!header || !menuButton || !mainNav) return;

  // Sombra ao scrollar
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
    updateActiveLink();
  }, { passive: true });

  // Hamburguer mobile
  menuButton.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    menuButton.classList.toggle('open', isOpen);
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });

  // Fecha menu ao clicar em link
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      menuButton.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });

  // Link ativo conforme seção visível
  const navLinks = $$('#main-nav a');

  function updateActiveLink() {
    const scrollY = window.scrollY + 120;
    $$('section[id]').forEach(section => {
      const top  = section.offsetTop;
      const bot  = top + section.offsetHeight;
      const id   = section.id;
      const link = navLinks.find(a => a.getAttribute('href') === `#${id}`);
      if (link) link.classList.toggle('active', scrollY >= top && scrollY < bot);
    });
  }

  updateActiveLink();
})();


/* ── 5. REVEAL POR SCROLL ──────────────────────────────── */
/*
   Usa IntersectionObserver para revelar elementos .reveal
   quando entram na viewport — efeito de fade-in suave.
*/
(function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  $$('.reveal').forEach(el => observer.observe(el));
})();


/* ── 6. TABS DE CULTURAS ───────────────────────────────── */
(function initTabs() {
  const tabs       = $$('.tab');
  const cropPanels = $$('.crop-panel');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const crop = tab.dataset.crop;

      // Atualiza estado dos botões
      tabs.forEach(t => {
        const active = t === tab;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', String(active));
      });

      // Exibe painel correspondente
      cropPanels.forEach(panel => {
        panel.classList.toggle('active', panel.dataset.panel === crop);
      });
    });
  });
})();


/* ── 7. GALERIA — FILTROS + LIGHTBOX ──────────────────── */
(function initGallery() {
  const filterBtns = $$('.filter-btn');
  const cards      = $$('.gallery-card');
  const lightbox   = $('#lightbox');
  const lbImg      = $('#lightbox-img');
  const lbCaption  = $('#lightbox-caption');
  const lbClose    = $('#lightbox-close');

  /* Filtros */
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter; // "all" | "praga" | "aliado" | "lavoura"
      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('hidden', !match);
      });
    });
  });

  /* Lightbox */
  function openLightbox(src, alt, caption) {
    lbImg.src              = src;
    lbImg.alt              = alt;
    lbCaption.textContent  = caption;
    lightbox.hidden        = false;
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lbImg.src       = '';
    document.body.style.overflow = '';
  }

  // Botão de zoom em cada card
  cards.forEach(card => {
    const zoomBtn = $('.zoom-btn', card);
    const img     = $('img', card);
    const caption = $('.gallery-info p', card);
    if (!zoomBtn || !img) return;

    zoomBtn.addEventListener('click', () =>
      openLightbox(img.src, img.alt, caption?.textContent || '')
    );
  });

  if (lbClose)   lbClose.addEventListener('click', closeLightbox);
  if (lightbox)  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !lightbox?.hidden) closeLightbox(); });
})();


/* ── 8. MATRIZ DE DECISÃO ──────────────────────────────── */
(function initDecision() {
  // Banco de recomendações indexado por [pressão][inimigos_naturais]
  const recommendations = {
    baixa: {
      presentes: {
        title: 'Monitorar e preservar',
        text:  'A pressão está baixa e há aliados naturais. Evite intervenção desnecessária e mantenha o acompanhamento.',
        items: ['Registrar pontos de amostragem.', 'Reavaliar a área em poucos dias.', 'Evitar produtos que afetem inimigos naturais.']
      },
      poucos: {
        title: 'Monitorar com atenção',
        text:  'A pressão ainda é baixa, mas há poucos inimigos naturais. Acompanhe a evolução antes de decidir.',
        items: ['Aumentar frequência de vistoria.', 'Verificar bordaduras e plantas hospedeiras.', 'Considerar práticas de prevenção.']
      }
    },
    moderada: {
      presentes: {
        title: 'Comparar com nível de ação',
        text:  'A pressão moderada exige comparação com o nível de ação da cultura. A presença de aliados pode segurar o avanço.',
        items: ['Confirmar espécie e estádio da praga.', 'Consultar nível de ação local.', 'Priorizar controle seletivo se a intervenção for necessária.']
      },
      poucos: {
        title: 'Planejar intervenção integrada',
        text:  'Com pressão moderada e poucos aliados, prepare uma ação integrada e reavalie rapidamente.',
        items: ['Checar clima e tecnologia de aplicação.', 'Combinar táticas culturais, biológicas ou químicas.', 'Registrar a decisão e retorno ao campo.']
      }
    },
    alta: {
      presentes: {
        title: 'Agir com critério',
        text:  'A pressão alta pode exigir controle. Mesmo assim, escolha táticas que preservem organismos benéficos.',
        items: ['Confirmar se o nível de ação foi ultrapassado.', 'Evitar aplicação generalizada sem necessidade.', 'Avaliar resultado após a intervenção.']
      },
      poucos: {
        title: 'Buscar orientação técnica',
        text:  'Pressão alta e poucos inimigos naturais indicam risco maior. A decisão deve ser rápida e tecnicamente orientada.',
        items: ['Consultar assistência agronômica.', 'Usar somente produtos registrados quando necessários.', 'Rotacionar modo de ação para reduzir resistência.']
      }
    }
  };

  // Dica adicional por cultura — variável JS armazenando dados do usuário
  const cropAdvice = {
    soja:      'Na soja, observe desfolha, vagens e percevejos em diferentes pontos da área.',
    milho:     'No milho, olhe o cartucho e diferencie raspagem inicial de dano avançado.',
    hortalicas:'Em hortaliças, verifique a face inferior das folhas e brotações novas.'
  };

  const cropSelect     = $('#crop-select');
  const pressureSelect = $('#pressure-select');
  const naturalSelect  = $('#natural-select');
  const stageSelect    = $('#stage-select');
  const decisionTitle  = $('#decision-title');
  const decisionText   = $('#decision-text');
  const decisionList   = $('#decision-list');

  if (!cropSelect) return;

  function updateDecision() {
    // Lê os valores dos selects — variáveis JS guardando dados do usuário
    const pressure = pressureSelect.value;
    const natural  = naturalSelect.value;
    const crop     = cropSelect.value;
    const stage    = stageSelect.value;

    const result = recommendations[pressure][natural];

    // Manipula o DOM para exibir a recomendação
    decisionTitle.textContent = result.title;
    decisionText.textContent  = `${result.text} ${cropAdvice[crop]} Estágio informado: ${stage}.`;
    decisionList.innerHTML    = result.items.map(item => `<li>${item}</li>`).join('');
  }

  [cropSelect, pressureSelect, naturalSelect, stageSelect].forEach(el => {
    if (el) el.addEventListener('change', updateDecision);
  });

  updateDecision(); // exibe resultado inicial
})();


/* ── 9. CHECKLIST DE CAMPO ─────────────────────────────── */
(function initChecklist() {
  const checklistItems = $$('.checklist-box input');
  const checkProgress  = $('#check-progress');
  const progressBar    = $('#progress-bar');
  const checkMessage   = $('#check-message');
  const copyChecklist  = $('#copy-checklist');
  if (!checklistItems.length) return;

  function updateChecklist() {
    const total   = checklistItems.length;
    const checked = checklistItems.filter(i => i.checked).length;
    const pct     = total ? Math.round((checked / total) * 100) : 0;

    if (checkProgress) checkProgress.textContent = `${checked} de ${total} itens`;
    if (progressBar)   progressBar.style.width   = `${pct}%`;

    if (!checkMessage) return;
    if (pct === 100) {
      checkMessage.textContent = 'Checklist completo. A decisão está muito melhor documentada.';
    } else if (pct >= 60) {
      checkMessage.textContent = 'Bom avanço. Falta fechar alguns pontos antes da recomendação.';
    } else {
      checkMessage.textContent = 'Comece pelo diagnóstico. Uma decisão boa nasce de uma observação bem feita.';
    }
  }

  checklistItems.forEach(item => item.addEventListener('change', updateChecklist));
  updateChecklist();

  // Botão copiar resumo — usa variável JS para construir o texto
  if (copyChecklist) {
    copyChecklist.addEventListener('click', async () => {
      const checked = checklistItems.filter(i => i.checked).length;
      const total   = checklistItems.length;
      const text    = `AgroMIP — checklist de campo: ${checked} de ${total} itens concluídos.`;

      try {
        await navigator.clipboard.writeText(text);
        copyChecklist.textContent = 'Resumo copiado ✓';
      } catch {
        copyChecklist.textContent = text; // fallback
      }

      setTimeout(() => { copyChecklist.textContent = 'Copiar resumo'; }, 2200);
    });
  }
})();


/* ── 10. GLOSSÁRIO COM BUSCA ───────────────────────────── */
(function initGlossary() {
  const searchInput  = $('#glossary-search');
  const cards        = $$('.glossary-grid article');
  const emptyState   = $('#glossary-empty');
  if (!searchInput) return;

  // Remove acentos para comparação sem erros de digitação
  function normalize(str) {
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function filterGlossary() {
    // Variável JS que armazena o termo buscado pelo usuário
    const query = normalize(searchInput.value.trim());
    let visible = 0;

    cards.forEach(card => {
      const content = normalize(`${card.textContent} ${card.dataset.keywords || ''}`);
      const match   = !query || content.includes(query);
      card.classList.toggle('hidden', !match);
      if (match) visible++;
    });

    if (emptyState) emptyState.hidden = visible > 0;
  }

  searchInput.addEventListener('input', filterGlossary);
})();