const menuButton = document.querySelector("#menu-button");
const mainNav = document.querySelector("#main-nav");

if (menuButton && mainNav) {
  menuButton.addEventListener("click", () => {
    const open = mainNav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });
}

// Alterado seletor de classe incorreta para pegar direto do ID nav
const navLinks = [...document.querySelectorAll("#main-nav a")];
const sections = navLinks
  .map((link) => {
    const targetId = link.getAttribute("href");
    return targetId.startsWith("#") ? document.querySelector(targetId) : null;
  })
  .filter(Boolean);

const activeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const activeId = `#${entry.target.id}`;
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === activeId);
      });
    });
  },
  { rootMargin: "-35% 0px -55% 0px" }
);

sections.forEach((section) => activeObserver.observe(section));

const tabs = [...document.querySelectorAll(".tab")];
const cropPanels = [...document.querySelectorAll(".crop-panel")];

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const crop = tab.dataset.crop;

    tabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle("active", active);
      item.setAttribute("aria-selected", String(active));
    });

    cropPanels.forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.panel === crop);
    });
  });
});

const recommendations = {
  baixa: {
    presentes: {
      title: "Monitorar e preservar",
      text: "A pressão está baixa e há aliados naturais. Evite intervenção desnecessária e mantenha o acompanhamento.",
      items: ["Registrar pontos de amostragem.", "Reavaliar a área em poucos dias.", "Evitar produtos que afetem inimigos naturais."]
    },
    poucos: {
      title: "Monitorar com atenção",
      text: "A pressão ainda é baixa, mas há poucos inimigos naturais. Acompanhe a evolução antes de decidir.",
      items: ["Aumentar frequência de vistoria.", "Verificar bordaduras e plantas hospedeiras.", "Considerar práticas de prevenção."]
    }
  },
  moderada: {
    presentes: {
      title: "Comparar com nível de ação",
      text: "A pressão moderada exige comparação com o nível de ação da cultura. A presença de aliados pode segurar o avanço.",
      items: ["Confirmar espécie e estádio da praga.", "Consultar nível de ação local.", "Priorizar controle seletivo se a intervenção for necessária."]
    },
    poucos: {
      title: "Planejar intervenção integrada",
      text: "Com pressão moderada e poucos aliados, prepare uma ação integrada e reavalie rapidamente.",
      items: ["Checar clima e tecnologia de aplicação.", "Combinar táticas culturais, biológicas ou químicas.", "Registrar a decisão e retorno ao campo."]
    }
  },
  alta: {
    presentes: {
      title: "Agir com critério",
      text: "A pressão alta pode exigir controle. Mesmo assim, escolha táticas que preservem o máximo possível de organismos benéficos.",
      items: ["Confirmar se o nível de ação foi ultrapassado.", "Evitar aplicação generalizada sem necessidade.", "Avaliar resultado após a intervenção."]
    },
    poucos: {
      title: "Buscar orientação técnica",
      text: "Pressão alta e poucos inimigos naturais indicam risco maior. A decisão deve ser rápida, registrada e tecnicamente orientada.",
      items: ["Consultar assistência agronômica.", "Usar somente produtos registrados quando forem necessários.", "Rotacionar modo de ação para reduzir resistência."]
    }
  }
};

const cropAdvice = {
  soja: "Na soja, observe desfolha, vagens e percevejos em diferentes pontos da área.",
  milho: "No milho, olhe o cartucho e diferencie raspagem inicial de dano avançado.",
  hortalicas: "Em hortaliças, verifique a face inferior das folhas e brotações novas."
};

const cropSelect = document.querySelector("#crop-select");
const pressureSelect = document.querySelector("#pressure-select");
const naturalSelect = document.querySelector("#natural-select");
const stageSelect = document.querySelector("#stage-select");
const decisionTitle = document.querySelector("#decision-title");
const decisionText = document.querySelector("#decision-text");
const decisionList = document.querySelector("#decision-list");

function updateDecision() {
  if (!cropSelect || !pressureSelect || !naturalSelect || !stageSelect || !decisionTitle || !decisionText || !decisionList) return;

  const pressure = pressureSelect.value;
  const natural = naturalSelect.value;
  const crop = cropSelect.value;
  const stage = stageSelect.value;
  const result = recommendations[pressure][natural];

  decisionTitle.textContent = result.title;
  decisionText.textContent = `${result.text} ${cropAdvice[crop]} Estágio informado: ${stage}.`;
  decisionList.innerHTML = result.items.map((item) => `<li>${item}</li>`).join("");
}

[cropSelect, pressureSelect, naturalSelect, stageSelect].forEach((element) => {
  if (element) element.addEventListener("change", updateDecision);
});

updateDecision();

const checklistItems = [...document.querySelectorAll(".checklist-box input")];
const checkProgress = document.querySelector("#check-progress");
const progressBar = document.querySelector("#progress-bar");
const checkMessage = document.querySelector("#check-message");
const copyChecklist = document.querySelector("#copy-checklist");

function updateChecklist() {
  const total = checklistItems.length;
  const checked = checklistItems.filter((item) => item.checked).length;
  const pct = total ? Math.round((checked / total) * 100) : 0;

  if (checkProgress) checkProgress.textContent = `${checked} de ${total} itens`;
  if (progressBar) progressBar.style.width = `${pct}%`;

  if (!checkMessage) return;
  if (pct === 100) {
    checkMessage.textContent = "Checklist completo. A decisão está muito melhor documentada.";
  } else if (pct >= 60) {
    checkMessage.textContent = "Bom avanço. Falta fechar alguns pontos antes da recomendação.";
  } else {
    checkMessage.textContent = "Comece pelo diagnóstico. Uma decisão boa nasce de uma observação bem feita.";
  }
}

checklistItems.forEach((item) => item.addEventListener("change", updateChecklist));
updateChecklist();

if (copyChecklist) {
  copyChecklist.addEventListener("click", async () => {
    const checked = checklistItems.filter((item) => item.checked).length;
    const total = checklistItems.length;
    const text = `AgroMIP - checklist de campo: ${checked} de ${total} itens concluídos.`;

    try {
      await navigator.clipboard.writeText(text);
      copyChecklist.textContent = "Resumo copiado";
    } catch {
      copyChecklist.textContent = "Resumo: " + text;
    }

    setTimeout(() => {
      copyChecklist.textContent = "Copiar resumo";
    }, 2200);
  });
}

const glossarySearch = document.querySelector("#glossary-search");
const glossaryCards = [...document.querySelectorAll(".glossary-grid article")];
const glossaryEmpty = document.querySelector("#glossary-empty");

function normalizeText(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function filterGlossary() {
  if (!glossarySearch) return;

  const query = normalizeText(glossarySearch.value.trim());
  let visibleCount = 0;

  glossaryCards.forEach((card) => {
    const content = normalizeText(`${card.textContent} ${card.dataset.keywords || ""}`);
    const visible = !query || content.includes(query);
    card.classList.toggle("hidden", !visible);
    if (visible) visibleCount += 1;
  });

  if (glossaryEmpty) glossaryEmpty.hidden = visibleCount !== 0;
}

if (glossarySearch) {
  glossarySearch.addEventListener("input", filterGlossary);
}