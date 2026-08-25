(() => {
    'use strict';

    const panels = Array.from(document.querySelectorAll('[data-slide-panel]'));
    const steps = Array.from(document.querySelectorAll('.story-step'));
    const previous = document.getElementById('previous-slide');
    const next = document.getElementById('next-slide');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let activeSlide = 0;
    let countersAnimated = false;

    function showSlide(index, updateHash = true) {
        const selected = Number(index);
        if (!Number.isInteger(selected) || selected < 0 || selected >= panels.length) return;

        panels.forEach((panel, panelIndex) => {
            panel.hidden = panelIndex !== selected;
            panel.classList.toggle('is-active', panelIndex === selected);
            if (panelIndex === selected) panel.scrollTop = 0;
        });

        steps.forEach((step, stepIndex) => {
            const isCurrent = stepIndex === selected;
            step.classList.toggle('is-active', isCurrent);
            if (isCurrent) {
                step.setAttribute('aria-current', 'step');
                step.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
            } else step.removeAttribute('aria-current');
        });

        activeSlide = selected;
        previous.disabled = selected === 0;
        next.disabled = selected === panels.length - 1;
        document.getElementById('slide-progress-fill').style.width = `${(selected + 1) / panels.length * 100}%`;
        document.getElementById('current-slide-number').textContent = String(selected + 1).padStart(2, '0');
        if (updateHash) history.replaceState(null, '', `#${panels[selected].id}`);
        if (panels[selected].id === 'dashboard') requestAnimationFrame(renderDashboard);
        if (panels[selected].id === 'resultados' && !countersAnimated) {
            countersAnimated = true;
            document.querySelectorAll('[data-counter]').forEach(counter => {
                const finalValue = Number(counter.dataset.counter);
                const start = performance.now();
                const animate = timestamp => {
                    const progress = Math.min((timestamp - start) / 900, 1);
                    counter.textContent = String(Math.round(finalValue * (1 - (1 - progress) ** 3)));
                    if (progress < 1) requestAnimationFrame(animate);
                };
                requestAnimationFrame(animate);
            });
        }
    }

    steps.forEach(step => step.addEventListener('click', () => showSlide(step.dataset.slide)));
    document.querySelectorAll('[data-slide-link], [data-slide]:not(.story-step)').forEach(element => {
        element.addEventListener('click', event => {
            event.preventDefault();
            showSlide(element.dataset.slideLink ?? element.dataset.slide);
        });
    });
    document.querySelectorAll('[data-next-slide]').forEach(button => button.addEventListener('click', () => showSlide(activeSlide + 1)));
    previous.addEventListener('click', () => showSlide(activeSlide - 1));
    next.addEventListener('click', () => showSlide(activeSlide + 1));

    document.addEventListener('keydown', event => {
        if (event.target instanceof HTMLElement && (event.target.isContentEditable || ['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName))) return;
        if (['ArrowRight', 'PageDown'].includes(event.key)) {
            event.preventDefault();
            showSlide(activeSlide + 1);
        } else if (['ArrowLeft', 'PageUp'].includes(event.key)) {
            event.preventDefault();
            showSlide(activeSlide - 1);
        }
    });

    let touchStart;
    const viewport = document.querySelector('.slides-viewport');
    viewport.addEventListener('touchstart', event => {
        touchStart = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
    }, { passive: true });
    viewport.addEventListener('touchend', event => {
        if (!touchStart) return;
        const deltaX = event.changedTouches[0].clientX - touchStart.x;
        const deltaY = event.changedTouches[0].clientY - touchStart.y;
        touchStart = undefined;
        if (Math.abs(deltaX) > 85 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) showSlide(activeSlide + (deltaX < 0 ? 1 : -1));
    }, { passive: true });

    const clientField = document.getElementById('intake-client');
    const productField = document.getElementById('intake-product');
    const problemField = document.getElementById('intake-problem');
    let simulatedProtocol = 2049;

    function updateIntakePreview() {
        const [code, description] = productField.value.split('|');
        document.getElementById('preview-client').textContent = clientField.value;
        document.getElementById('preview-code').textContent = code;
        document.getElementById('preview-product').textContent = description;
        document.getElementById('preview-problem').textContent = problemField.value;
    }

    [clientField, productField, problemField].forEach(field => field.addEventListener('change', updateIntakePreview));
    document.getElementById('intake-form').addEventListener('submit', event => {
        event.preventDefault();
        const protocol = `RMA-DEMO-${simulatedProtocol++}`;
        document.getElementById('intake-protocol').textContent = protocol;
        document.getElementById('intake-state').textContent = 'REGISTRADO · SIMULAÇÃO';
        document.getElementById('intake-feedback').textContent = `Protocolo ${protocol} criado visualmente e encaminhado para a engenharia fictícia.`;
    });

    const permissions = [
        ['Abrir uma nova solicitação', true, true],
        ['Consultar o andamento dos laudos', true, true],
        ['Editar identificação e reclamação', true, true],
        ['Excluir solicitação ainda aberta', true, true],
        ['Alterar análise, causa e ação técnica', false, true],
        ['Definir responsável e conclusão técnica', false, true],
        ['Alterar status de qualquer laudo', false, true],
        ['Excluir laudo já em análise ou fechado', false, true],
    ];

    function selectRole(role) {
        const technical = role === 'engenharia';
        document.querySelectorAll('.role-button').forEach(button => {
            const selected = button.dataset.role === role;
            button.classList.toggle('is-active', selected);
            button.setAttribute('aria-selected', String(selected));
        });
        document.getElementById('role-overline').textContent = technical ? 'ANÁLISE E RESPONSABILIDADE TÉCNICA' : 'ATENDIMENTO COMERCIAL';
        document.getElementById('role-heading').textContent = technical ? 'Alex Horizonte · Engenharia' : 'Bruna Prisma · Vendas';
        document.getElementById('role-tag').textContent = technical ? 'ACESSO TÉCNICO' : 'ACESSO COMERCIAL';
        document.getElementById('permission-list').innerHTML = permissions.map(([label, salesPermission, engineeringPermission]) => {
            const allowed = technical ? engineeringPermission : salesPermission;
            return `<div class="permission-item ${allowed ? 'is-allowed' : 'is-blocked'}"><i>${allowed ? '✓' : '×'}</i><span>${label}</span></div>`;
        }).join('');
        document.getElementById('role-note').textContent = technical
            ? 'Engenharia visualiza todos os campos técnicos, atualiza o status e consolida o parecer do atendimento.'
            : 'Campos de análise, causa, ação e responsável técnico ficam protegidos para a equipe de vendas.';
    }

    document.querySelectorAll('.role-button').forEach(button => button.addEventListener('click', () => selectRole(button.dataset.role)));

    const verdicts = {
        procedente: {
            diagnosis: 'Teste funcional fictício identificou desempenho térmico inferior ao parâmetro demonstrativo.',
            cause: 'Desvio simulado no conjunto de aquecimento do produto.',
            action: 'Substituição demonstrativa do componente e validação de funcionamento.',
            result: 'Garantia procedente · intervenção autorizada.',
            status: 'EM PROCESSO',
            color: '#43e097',
        },
        improcedente: {
            diagnosis: 'Avaliação ilustrativa encontrou sinais incompatíveis com uma falha de fabricação.',
            cause: 'Condição de uso fictícia fora das orientações demonstrativas.',
            action: 'Registrar o parecer e orientar comercialmente o cliente fictício.',
            result: 'Garantia improcedente · parecer registrado.',
            status: 'FECHADO',
            color: '#ffbd4a',
        },
        complementar: {
            diagnosis: 'As evidências fictícias disponíveis não permitem concluir a avaliação.',
            cause: 'Aguardando complemento visual e detalhes adicionais do cenário.',
            action: 'Solicitar evidência complementar à equipe comercial fictícia.',
            result: 'Avaliação pendente · documentação complementar solicitada.',
            status: 'EM PROCESSO',
            color: '#6fa8ff',
        },
    };

    function selectVerdict(key) {
        const verdict = verdicts[key];
        document.querySelectorAll('.verdict-button').forEach(button => button.classList.toggle('is-active', button.dataset.verdict === key));
        document.getElementById('analysis-diagnosis').textContent = verdict.diagnosis;
        document.getElementById('analysis-cause').textContent = verdict.cause;
        document.getElementById('analysis-action').textContent = verdict.action;
        document.getElementById('analysis-status').textContent = verdict.status;
        const result = document.getElementById('analysis-result');
        result.textContent = verdict.result;
        result.style.color = verdict.color;
    }

    document.querySelectorAll('.verdict-button').forEach(button => button.addEventListener('click', () => selectVerdict(button.dataset.verdict)));

    const reportSections = {
        identificacao: {
            title: 'Identificação do atendimento',
            rows: [['Protocolo', 'RMA-DEMO-2048'], ['Cliente fictício', 'Cliente Aurora'], ['Código fictício', 'PROD-DEMO-1001'], ['Produto fictício', 'Módulo Térmico Aurora'], ['Documento ilustrativo', 'NF-DEMO-015']],
        },
        ocorrencia: {
            title: 'Descrição da ocorrência',
            rows: [['Categoria', 'Aquecimento insuficiente'], ['Quantidade ilustrativa', '01 unidade'], ['Data demonstrativa', '18/08/2026']],
            text: 'Relato fictício: o equipamento apresenta aquecimento abaixo da referência demonstrativa durante o período de utilização.',
        },
        parecer: {
            title: 'Avaliação da engenharia',
            rows: [['Responsável fictício', 'Alex Horizonte'], ['Conclusão simulada', 'Garantia procedente']],
            text: 'Diagnóstico demonstrativo identificou uma variação no módulo térmico fictício. Recomenda-se a substituição ilustrativa do componente e um novo teste funcional.',
        },
        fechamento: {
            title: 'Conclusão e acompanhamento',
            rows: [['Status demonstrativo', 'Fechado'], ['Ação ilustrativa', 'Componente substituído'], ['Retorno simulado', 'Equipe comercial notificada']],
            text: 'Documento gerado para demonstração visual. Não corresponde a um cliente, produto, protocolo ou atendimento real.',
        },
    };

    function selectReportSection(key) {
        document.querySelectorAll('.outline-button').forEach(button => button.classList.toggle('is-active', button.dataset.reportSection === key));
        const section = reportSections[key];
        document.getElementById('document-body').innerHTML = `<h3>${section.title}</h3>${section.rows.map(([label, value]) => `<div class="paper-row"><span>${label}</span><strong>${value}</strong></div>`).join('')}${section.text ? `<p>${section.text}</p>` : ''}`;
    }

    document.querySelectorAll('.outline-button').forEach(button => button.addEventListener('click', () => selectReportSection(button.dataset.reportSection)));

    const dashboardScenarios = {
        geral: { metrics: [4, 7, 18, 29], problems: [8, 6, 4, 3], months: [3, 5, 4, 8, 6, 9] },
        aurora: { metrics: [1, 3, 6, 10], problems: [4, 2, 1, 1], months: [1, 2, 1, 3, 2, 4] },
        prisma: { metrics: [2, 2, 5, 9], problems: [2, 3, 1, 2], months: [1, 1, 2, 1, 3, 2] },
    };

    function prepareCanvas(id) {
        const canvas = document.getElementById(id);
        const rectangle = canvas.getBoundingClientRect();
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = Math.max(Math.round(rectangle.width * ratio), 1);
        canvas.height = Math.max(Math.round(rectangle.height * ratio), 1);
        const context = canvas.getContext('2d');
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        return { context, width: rectangle.width, height: rectangle.height };
    }

    function renderDashboard() {
        const scenario = dashboardScenarios[document.getElementById('dashboard-scenario').value];
        const labels = ['ABERTOS', 'EM PROCESSO', 'FECHADOS', 'TOTAL'];
        const colors = ['#ffbd4a', '#6fa8ff', '#43e097', '#f4f8fc'];
        document.getElementById('dashboard-cards').innerHTML = scenario.metrics.map((metric, index) => `<article class="dashboard-stat"><span>${labels[index]}</span><strong style="color:${colors[index]}">${metric}</strong></article>`).join('');

        const chart = prepareCanvas('problem-chart');
        const names = ['Não liga', 'Aquecimento', 'Vazamento', 'Display'];
        const max = Math.max(...scenario.problems);
        chart.context.font = '11px Inter, sans-serif';
        scenario.problems.forEach((value, index) => {
            const y = index * 36 + 8;
            chart.context.fillStyle = '#92a4b8';
            chart.context.fillText(names[index], 0, y + 10);
            const barX = Math.min(chart.width * .36, 108);
            const barWidth = Math.max(chart.width - barX - 26, 0);
            chart.context.fillStyle = 'rgba(111,168,255,.12)';
            chart.context.fillRect(barX, y, barWidth, 15);
            chart.context.fillStyle = '#6fa8ff';
            chart.context.fillRect(barX, y, barWidth * value / max, 15);
            chart.context.fillStyle = '#dbe7f2';
            chart.context.fillText(String(value), chart.width - 14, y + 11);
        });

        const monthly = prepareCanvas('monthly-chart');
        const monthlyMax = Math.max(...scenario.months);
        const chartHeight = monthly.height - 36;
        const columnWidth = Math.max((monthly.width - 18) / scenario.months.length - 13, 6);
        scenario.months.forEach((value, index) => {
            const x = index * (monthly.width / scenario.months.length) + 6;
            const height = value / monthlyMax * chartHeight;
            monthly.context.fillStyle = index === scenario.months.length - 1 ? '#43e097' : 'rgba(111,168,255,.7)';
            monthly.context.fillRect(x, chartHeight - height + 8, columnWidth, height);
            monthly.context.fillStyle = '#92a4b8';
            monthly.context.font = '10px Inter, sans-serif';
            monthly.context.fillText(['MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO'][index], x, monthly.height - 6);
        });
    }

    document.getElementById('dashboard-scenario').addEventListener('change', renderDashboard);
    window.addEventListener('resize', () => {
        if (panels[activeSlide].id === 'dashboard') renderDashboard();
    });

    const events = [{ label: 'Solicitação aberta por Bruna Prisma', detail: '08:45 · perfil comercial fictício' }, { label: 'Produto e evidências vinculados', detail: '08:48 · protocolo demonstrativo' }];

    function renderEvents() {
        document.getElementById('automation-events').innerHTML = events.slice(-4).map(event => `<div class="timeline-event"><i></i><div><strong>${event.label}</strong><span class="event-time">${event.detail}</span></div></div>`).join('');
    }

    const eventScenarios = {
        analysis: ['Análise técnica iniciada', 'Engenharia assumiu o protocolo demonstrativo.', 'O laudo fictício entrou em análise técnica e recebeu um responsável demonstrativo.'],
        report: ['Laudo técnico concluído', 'Parecer demonstrativo consolidado.', 'A avaliação fictícia foi concluída e o documento demonstrativo está disponível.'],
        mail: ['Notificação visual simulada', 'Nenhuma mensagem foi enviada.', 'Uma atualização ilustrativa foi exibida para demonstrar a automação do processo.'],
    };

    document.querySelectorAll('[data-event]').forEach(button => button.addEventListener('click', () => {
        const [label, detail, message] = eventScenarios[button.dataset.event];
        events.push({ label, detail: `agora · ${detail}` });
        renderEvents();
        document.getElementById('mail-subject').textContent = `${label} · RMA-DEMO-2048`;
        document.getElementById('mail-message').textContent = message;
    }));

    selectRole('vendas');
    selectVerdict('procedente');
    selectReportSection('identificacao');
    updateIntakePreview();
    renderEvents();
    const requestedSlide = panels.findIndex(panel => `#${panel.id}` === window.location.hash);
    showSlide(requestedSlide >= 0 ? requestedSlide : 0, false);
})();
