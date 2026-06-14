// =====================================================
// AGROMIP - script.js COMPLETO (Nível 4 - Agrinho 2026)
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('%c AgroMIP carregado com sucesso! 🌱', 'color: #2e7d32; font-size: 16px; font-weight: bold');

    // ====================== VARIÁVEIS GLOBAIS ======================
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const greeting = document.getElementById('greeting');
    const nameInput = document.getElementById('user-name-input');
    const saveNameBtn = document.getElementById('save-name-btn');
    const nameBar = document.getElementById('name-bar');
    const menuButton = document.getElementById('menu-button');
    const mainNav = document.getElementById('main-nav');

    // ====================== TEMA (Dark / Light) ======================
    function setTheme(theme) {
        if (theme === 'dark') {
            body.classList.remove('light');
            body.setAttribute('data-theme', 'dark');
            themeIcon.textContent = '☀️';
        } else {
            body.classList.add('light');
            body.removeAttribute('data-theme');
            themeIcon.textContent = '🌙';
        }
        localStorage.setItem('theme', theme);
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        setTheme(currentTheme);
    });

    // Carregar tema salvo
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    // ====================== SAUDAÇÃO PERSONALIZADA ======================
    function loadGreeting() {
        const savedName = localStorage.getItem('userName');
        if (savedName) {
            greeting.textContent = `Olá, ${savedName}! 🌱`;
            if (nameBar) nameBar.style.display = 'none';
        } else {
            greeting.textContent = 'Olá, visitante! 👋';
        }
    }

    saveNameBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (name.length > 1) {
            localStorage.setItem('userName', name);
            greeting.textContent = `Olá, ${name}! 🌱`;
            if (nameBar) nameBar.style.display = 'none';
        }
    });

    loadGreeting();

    // ====================== MENU MOBILE ======================
    menuButton.addEventListener('click', () => {
        const expanded = menuButton.getAttribute('aria-expanded') === 'true';
        menuButton.setAttribute('aria-expanded', !expanded);
        mainNav.classList.toggle('active');
    });

    // Fechar menu ao clicar em link
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                mainNav.classList.remove('active');
                menuButton.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // ====================== GALERIA - FILTROS E LIGHTBOX ======================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryCards = document.querySelectorAll('.gallery-card');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            galleryCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Zoom Lightbox
    document.querySelectorAll('.zoom-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const img = e.target.closest('.gallery-img-wrap').querySelector('img');
            lightboxImg.src = img.src;
            lightboxCaption.textContent = img.alt;
            lightbox.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    });

    lightboxClose.addEventListener('click', () => {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'visible';
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = 'none';
            document.body.style.overflow = 'visible';
        }
    });

    // ====================== MATRIZ DE DECISÃO ======================
    const decisionForm = document.getElementById('decision-form');
    const decisionTitle = document.getElementById('decision-title');
    const decisionText = document.getElementById('decision-text');
    const decisionList = document.getElementById('decision-list');

    function updateDecision() {
        const crop = document.getElementById('crop-select').value;
        const pressure = document.getElementById('pressure-select').value;
        const natural = document.getElementById('natural-select').value;

        if (pressure === 'baixa' && natural === 'presentes') {
            decisionTitle.textContent = "✅ Monitorar";
            decisionText.textContent = "Situação excelente! Inimigos naturais estão controlando a praga.";
            decisionList.innerHTML = `
                <li>Continue registrando observações</li>
                <li>Reavaliar em 5-7 dias</li>
                <li>Preservar os aliados naturais</li>`;
        } else if (pressure === 'moderada') {
            decisionTitle.textContent = "⚠️ Ação Moderada";
            decisionText.textContent = "Recomenda-se controle biológico ou cultural antes de químico.";
        } else {
            decisionTitle.textContent = "🚨 Atenção Alta";
            decisionText.textContent = "Nível de ação atingido. Avaliar opções de controle com critério técnico.";
        }
    }

    if (decisionForm) {
        decisionForm.addEventListener('change', updateDecision);
        // Atualização inicial
        updateDecision();
    }

    // ====================== GLOSSÁRIO COM BUSCA ======================
    const glossarySearch = document.getElementById('glossary-search');
    const glossaryArticles = document.querySelectorAll('.glossary-grid article');
    const emptyState = document.getElementById('glossary-empty');

    if (glossarySearch) {
        glossarySearch.addEventListener('input', () => {
            const term = glossarySearch.value.toLowerCase().trim();
            let hasResults = false;

            glossaryArticles.forEach(article => {
                const text = article.textContent.toLowerCase();
                const keywords = (article.getAttribute('data-keywords') || '').toLowerCase();

                if (text.includes(term) || keywords.includes(term)) {
                    article.style.display = 'block';
                    hasResults = true;
                } else {
                    article.style.display = 'none';
                }
            });

            if (emptyState) emptyState.hidden = hasResults;
        });
    }

    // ====================== CHECKLIST PROGRESSO ======================
    const checkboxes = document.querySelectorAll('.checklist-box input[type="checkbox"]');
    const progressText = document.getElementById('check-progress');
    const progressBar = document.getElementById('progress-bar');
    const checkMessage = document.getElementById('check-message');

    function updateChecklistProgress() {
        const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
        const total = checkboxes.length;

        if (progressText) progressText.textContent = `${checkedCount} de ${total} itens`;
        if (progressBar) progressBar.style.width = `${(checkedCount / total) * 100}%`;

        if (checkedCount === total && checkMessage) {
            checkMessage.innerHTML = '✅ <strong>Checklist completo!</strong> Você está pronto para tomar uma decisão responsável.';
            checkMessage.style.color = 'var(--success)';
        }
    }

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateChecklistProgress);
    });

    // Botão copiar checklist
    const copyBtn = document.getElementById('copy-checklist');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const checkedItems = Array.from(checkboxes)
                .filter(cb => cb.checked)
                .map(cb => '✓ ' + cb.parentElement.textContent.trim());

            const text = `Checklist MIP - AgroMIP\nData: ${new Date().toLocaleDateString('pt-BR')}\n\n${checkedItems.join('\n')}`;
            
            navigator.clipboard.writeText(text).then(() => {
                alert('✅ Checklist copiado com sucesso!');
            });
        });
    }

    // ====================== SCROLL REVEAL ANIMATION ======================
    const revealElements = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => observer.observe(el));

    // ====================== TECLADO (ESC para fechar lightbox) ======================
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.style.display === 'flex') {
            lightbox.style.display = 'none';
            document.body.style.overflow = 'visible';
        }
    });

    // ====================== FINALIZAÇÃO ======================
    console.log('%c Todas as funcionalidades do AgroMIP foram carregadas com sucesso!', 'color: #43a047; font-weight: bold');
});