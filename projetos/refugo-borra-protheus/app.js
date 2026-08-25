(() => {
    'use strict';

    const panels = Array.from(document.querySelectorAll('[data-slide-panel]'));
    const navigation = Array.from(document.querySelectorAll('.story-step'));
    const previousButton = document.getElementById('previous-slide');
    const nextButton = document.getElementById('next-slide');
    const progressFill = document.getElementById('slide-progress-fill');
    const slideNumber = document.getElementById('current-slide-number');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let activeSlide = 0;
    let touchStart = null;
    let impactAnimated = false;

    function showSlide(index, updateHash = true) {
        const nextIndex = Number(index);

        if (!Number.isInteger(nextIndex) || nextIndex < 0 || nextIndex >= panels.length) {
            return;
        }

        const currentPanel = panels[activeSlide];
        const nextPanel = panels[nextIndex];

        panels.forEach(panel => {
            panel.hidden = panel !== nextPanel;
            panel.classList.remove('is-active', 'is-leaving-left');
        });

        if (currentPanel !== nextPanel && nextIndex > activeSlide) {
            currentPanel.classList.add('is-leaving-left');
        }

        nextPanel.hidden = false;
        requestAnimationFrame(() => nextPanel.classList.add('is-active'));
        nextPanel.scrollTop = 0;
        activeSlide = nextIndex;

        navigation.forEach((button, buttonIndex) => {
            const isCurrent = buttonIndex === nextIndex;
            button.classList.toggle('is-active', isCurrent);

            if (isCurrent) {
                button.setAttribute('aria-current', 'step');
                button.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
            } else {
                button.removeAttribute('aria-current');
            }
        });

        previousButton.disabled = nextIndex === 0;
        nextButton.disabled = nextIndex === panels.length - 1;
        progressFill.style.width = `${((nextIndex + 1) / panels.length) * 100}%`;
        slideNumber.textContent = String(nextIndex + 1).padStart(2, '0');

        if (updateHash) {
            history.replaceState(null, '', `#${nextPanel.id}`);
        }

        if (nextIndex === panels.length - 1 && !impactAnimated) {
            impactAnimated = true;
            animateImpactCounters();
        }
    }

    navigation.forEach(button => {
        button.addEventListener('click', () => showSlide(button.dataset.slide));
    });

    document.querySelectorAll('[data-slide-link], [data-slide]:not(.story-step)').forEach(button => {
        button.addEventListener('click', event => {
            event.preventDefault();
            showSlide(button.dataset.slideLink ?? button.dataset.slide);
        });
    });

    document.querySelectorAll('[data-next-slide]').forEach(button => {
        button.addEventListener('click', () => showSlide(activeSlide + 1));
    });

    previousButton.addEventListener('click', () => showSlide(activeSlide - 1));
    nextButton.addEventListener('click', () => showSlide(activeSlide + 1));

    document.addEventListener('keydown', event => {
        const target = event.target;
        const isEditing = target instanceof HTMLElement && (
            target.isContentEditable || ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)
        );

        if (isEditing) {
            return;
        }

        if (event.key === 'ArrowRight' || event.key === 'PageDown') {
            event.preventDefault();
            showSlide(activeSlide + 1);
        }

        if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
            event.preventDefault();
            showSlide(activeSlide - 1);
        }
    });

    document.querySelector('.slides-viewport').addEventListener('touchstart', event => {
        const touch = event.changedTouches[0];
        touchStart = { x: touch.clientX, y: touch.clientY };
    }, { passive: true });

    document.querySelector('.slides-viewport').addEventListener('touchend', event => {
        if (!touchStart) {
            return;
        }

        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - touchStart.x;
        const deltaY = touch.clientY - touchStart.y;
        touchStart = null;

        if (Math.abs(deltaX) > 80 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
            showSlide(activeSlide + (deltaX < 0 ? 1 : -1));
        }
    }, { passive: true });

    const comparisonGrid = document.querySelector('[data-comparison-grid]');
    const comparisonButtons = Array.from(document.querySelectorAll('[data-comparison-focus]'));

    comparisonButtons.forEach(button => {
        button.addEventListener('click', () => {
            comparisonButtons.forEach(item => item.classList.toggle('is-active', item === button));
            comparisonGrid.dataset.focus = button.dataset.comparisonFocus;
        });
    });

    const wizard = {
        step: 0,
        values: {
            type: '',
            order: '',
            reason: '',
            quantity: 0,
        },
        records: [],
    };

    const productionOrders = [
        { value: 'OP DEMO-1001', label: 'OP DEMO-1001', detail: 'Máquina X1 · Célula Atlas' },
        { value: 'OP DEMO-1002', label: 'OP DEMO-1002', detail: 'Máquina X2 · Célula Horizonte' },
        { value: 'OP DEMO-1003', label: 'OP DEMO-1003', detail: 'Máquina X3 · Célula Prisma' },
    ];

    const scrapReasons = [
        { value: 'Peça incompleta', label: 'Peça incompleta', detail: 'Motivo DEMO-01' },
        { value: 'Acabamento irregular', label: 'Acabamento irregular', detail: 'Motivo DEMO-02' },
        { value: 'Ajuste dimensional', label: 'Ajuste dimensional', detail: 'Motivo DEMO-03' },
    ];

    const sludgeReasons = [
        { value: 'Set-up', label: 'Set-up', detail: 'Ajuste de máquina' },
        { value: 'Troca de material', label: 'Troca de material', detail: 'Limpeza do processo' },
        { value: 'Partida de máquina', label: 'Partida de máquina', detail: 'Início de produção' },
    ];

    const wizardIndicator = document.getElementById('wizard-step-indicator');
    const wizardProgress = document.getElementById('wizard-progress-fill');
    const wizardLabel = document.getElementById('wizard-step-label');
    const wizardQuestion = document.getElementById('wizard-question');
    const wizardOptions = document.getElementById('wizard-options');
    const wizardBack = document.getElementById('wizard-back');
    const activityList = document.getElementById('activity-list');
    const activityEmpty = document.getElementById('activity-empty');
    const demoCount = document.getElementById('demo-count');

    function createOption({ label, detail, value, danger = false }, onClick) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `wizard-option${danger ? ' option-danger' : ''}`;
        button.textContent = label;

        if (detail) {
            const helper = document.createElement('small');
            helper.textContent = detail;
            button.append(helper);
        }

        button.addEventListener('click', () => onClick(value));
        return button;
    }

    function advanceWizard(key, value) {
        wizard.values[key] = value;
        wizard.step += 1;
        renderWizard();
    }

    function addSummaryRow(container, label, value) {
        const row = document.createElement('div');
        const name = document.createElement('span');
        const content = document.createElement('strong');
        name.textContent = label;
        content.textContent = value;
        row.append(name, content);
        container.append(row);
    }

    function renderWizard() {
        wizardIndicator.textContent = `PASSO ${wizard.step + 1} DE 5`;
        wizardProgress.style.width = `${((wizard.step + 1) / 5) * 100}%`;
        wizardBack.hidden = wizard.step === 0;
        wizardOptions.replaceChildren();

        if (wizard.step === 0) {
            wizardLabel.textContent = 'COMECE PELO TIPO DE APONTAMENTO';
            wizardQuestion.textContent = 'O que você deseja lançar?';
            wizardOptions.append(
                createOption({ value: 'Refugo', label: 'REFUGO', detail: 'Peças não conformes', danger: true }, value => advanceWizard('type', value)),
                createOption({ value: 'Borra', label: 'BORRA', detail: 'Material descartado' }, value => advanceWizard('type', value)),
            );
            return;
        }

        if (wizard.step === 1) {
            wizardLabel.textContent = 'SELECIONE UMA OP DISPONÍVEL';
            wizardQuestion.textContent = 'Qual é a ordem de produção?';
            productionOrders.forEach(order => wizardOptions.append(createOption(order, value => advanceWizard('order', value))));
            return;
        }

        if (wizard.step === 2) {
            wizardLabel.textContent = wizard.values.type === 'Refugo' ? 'MOTIVOS PADRONIZADOS' : 'ORIGENS PADRONIZADAS';
            wizardQuestion.textContent = wizard.values.type === 'Refugo' ? 'Qual foi o motivo do refugo?' : 'Qual foi a origem da borra?';
            const options = wizard.values.type === 'Refugo' ? scrapReasons : sludgeReasons;
            options.forEach(option => wizardOptions.append(createOption(option, value => advanceWizard('reason', value))));
            return;
        }

        if (wizard.step === 3) {
            const isScrap = wizard.values.type === 'Refugo';
            wizardLabel.textContent = isScrap ? 'INFORME A QUANTIDADE DE PEÇAS' : 'INFORME O PESO APROXIMADO';
            wizardQuestion.textContent = isScrap ? 'Quantas peças devem ser lançadas?' : 'Qual é o peso da borra?';

            const quantity = document.createElement('input');
            quantity.type = 'number';
            quantity.className = 'wizard-field';
            quantity.min = isScrap ? '1' : '0.01';
            quantity.step = isScrap ? '1' : '0.01';
            quantity.placeholder = isScrap ? 'Exemplo: 18 peças' : 'Exemplo: 2,35 kg';
            quantity.setAttribute('aria-label', isScrap ? 'Quantidade de peças' : 'Peso em quilogramas');

            const submit = document.createElement('button');
            submit.type = 'button';
            submit.className = 'wizard-submit';
            submit.textContent = 'Continuar →';
            submit.addEventListener('click', () => {
                if (!quantity.checkValidity() || Number(quantity.value) <= 0) {
                    quantity.reportValidity();
                    quantity.focus();
                    return;
                }

                advanceWizard('quantity', Number(quantity.value));
            });

            quantity.addEventListener('keydown', event => {
                if (event.key === 'Enter') {
                    submit.click();
                }
            });

            wizardOptions.append(quantity, submit);
            return;
        }

        wizardLabel.textContent = 'TUDO PRONTO PARA O APONTAMENTO';
        wizardQuestion.textContent = 'Confira e confirme o lançamento.';

        const summary = document.createElement('div');
        summary.className = 'wizard-summary';
        const unit = wizard.values.type === 'Refugo' ? 'peças' : 'kg';
        addSummaryRow(summary, 'Tipo', wizard.values.type);
        addSummaryRow(summary, 'Ordem de produção', wizard.values.order);
        addSummaryRow(summary, wizard.values.type === 'Refugo' ? 'Motivo' : 'Origem', wizard.values.reason);
        addSummaryRow(summary, 'Quantidade', `${wizard.values.quantity.toLocaleString('pt-BR')} ${unit}`);

        const submit = document.createElement('button');
        submit.type = 'button';
        submit.className = 'wizard-submit';
        submit.textContent = 'Simular envio ao Protheus ✓';
        submit.addEventListener('click', saveDemoRecord);
        wizardOptions.append(summary, submit);
    }

    function saveDemoRecord() {
        const record = { ...wizard.values, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) };
        wizard.records.unshift(record);
        activityEmpty.hidden = true;
        demoCount.textContent = `${wizard.records.length} ${wizard.records.length === 1 ? 'lançamento' : 'lançamentos'}`;

        const item = document.createElement('article');
        item.className = 'activity-item';
        const title = document.createElement('strong');
        const description = document.createElement('span');
        title.textContent = `${record.type} · ${record.quantity.toLocaleString('pt-BR')} ${record.type === 'Refugo' ? 'pçs' : 'kg'}`;
        description.textContent = `${record.order} · ${record.time} · SIMULADO`;
        item.append(title, description);
        activityList.prepend(item);

        wizard.step = 0;
        wizard.values = { type: '', order: '', reason: '', quantity: 0 };
        renderWizard();
    }

    wizardBack.addEventListener('click', () => {
        if (wizard.step > 0) {
            wizard.step -= 1;
            renderWizard();
        }
    });

    renderWizard();

    const pipelineNodes = Array.from(document.querySelectorAll('[data-pipeline-node]'));
    const pipelineConnections = Array.from(document.querySelectorAll('[data-pipeline-connection]'));
    const terminal = document.getElementById('terminal-output');
    const integrationButton = document.getElementById('run-integration');

    function waitFor(milliseconds) {
        return new Promise(resolve => window.setTimeout(resolve, reducedMotion ? 30 : milliseconds));
    }

    function addTerminalLine(parts) {
        const line = document.createElement('p');

        parts.forEach(({ text, className }) => {
            const span = document.createElement('span');
            span.textContent = text;

            if (className) {
                span.className = className;
            }

            line.append(span);
        });

        terminal.append(line);
    }

    async function runIntegration() {
        if (integrationButton.disabled) {
            return;
        }

        integrationButton.disabled = true;
        integrationButton.textContent = 'Executando…';
        terminal.replaceChildren();
        pipelineNodes.forEach(node => node.classList.remove('is-running', 'is-complete'));
        pipelineConnections.forEach(connection => connection.classList.remove('is-running', 'is-complete'));

        const logs = [
            [{ text: '[OPERADOR] ', className: 'terminal-info' }, { text: 'Refugo selecionado · OP DEMO-1001 · 18 peças' }],
            [{ text: '[POWERSHELL] ', className: 'terminal-info' }, { text: 'Campos e listas validados para o lançamento' }],
            [{ text: '[API REST] ', className: 'terminal-key' }, { text: 'POST ' }, { text: '/api/demo/apontamentos', className: 'terminal-info' }],
            [{ text: '[PROTHEUS] ', className: 'terminal-success' }, { text: 'Apontamento registrado na rotina oficial' }],
        ];

        for (let index = 0; index < pipelineNodes.length; index += 1) {
            pipelineNodes[index].classList.add('is-running');
            addTerminalLine(logs[index]);
            await waitFor(550);
            pipelineNodes[index].classList.remove('is-running');
            pipelineNodes[index].classList.add('is-complete');

            if (pipelineConnections[index]) {
                pipelineConnections[index].classList.add('is-running');
                await waitFor(420);
                pipelineConnections[index].classList.remove('is-running');
                pipelineConnections[index].classList.add('is-complete');
            }
        }

        addTerminalLine([{ text: '✓ ', className: 'terminal-success' }, { text: 'Fluxo demonstrativo concluído. Nenhum dado real foi enviado.', className: 'terminal-success' }]);
        integrationButton.disabled = false;
        integrationButton.textContent = 'Executar novamente';
    }

    integrationButton.addEventListener('click', runIntegration);

    const reportDocument = document.getElementById('report-document');
    const reportTitle = document.getElementById('report-title');
    const reportMetrics = document.getElementById('report-metrics');
    const reportButtons = Array.from(document.querySelectorAll('[data-report]'));

    const reports = {
        refugo: {
            title: 'ANÁLISE CNQI · REFUGO',
            heading: 'Análise CNQI · exemplo demonstrativo',
            description: 'Relatório ilustrativo gerado exclusivamente com produtos e números inventados.',
            group: 'Refugo por produto · dados simulados',
            columns: ['Código', 'Descrição', 'Produzido', 'Refugo', '% refugo', 'Custo'],
            rows: [
                ['PX-DEMO-1047', 'Tampa Modular Aurora Azul', '4.800 pçs', '45 pçs', '0,94%', 'R$ 18,90'],
                ['PX-DEMO-2083', 'Suporte Prisma Cinza', '3.250 pçs', '31 pçs', '0,95%', 'R$ 12,40'],
                ['PX-DEMO-3156', 'Conector Horizonte Coral', '2.100 pçs', '22 pçs', '1,05%', 'R$ 9,70'],
            ],
            metrics: [
                { label: 'Refugo fictício', value: '186 peças' },
                { label: 'Borra fictícia', value: '5,680 kg' },
                { label: 'Produto exemplo', value: '4.800 pçs' },
                { label: 'Índice exemplo', value: '0,94%' },
            ],
        },
        borra: {
            title: 'ANÁLISE CNQI · BORRA',
            heading: 'Análise de borra · exemplo demonstrativo',
            description: 'Consolidação ilustrativa de lançamentos, células e ordens de produção fictícias.',
            group: 'Borra por célula · dados simulados',
            columns: ['Código', 'Descrição', 'Ordem', 'Célula', 'Turno', 'Peso'],
            rows: [
                ['PX-DEMO-1047', 'Tampa Modular Aurora Azul', 'DEMO-1001', 'Atlas', 'A', '1,250 kg'],
                ['PX-DEMO-2083', 'Suporte Prisma Cinza', 'DEMO-1002', 'Horizonte', 'B', '2,180 kg'],
                ['PX-DEMO-3156', 'Conector Horizonte Coral', 'DEMO-1003', 'Prisma', 'A', '2,250 kg'],
            ],
            metrics: [
                { label: 'Atlas · turno A', value: '1,250 kg' },
                { label: 'Horizonte · turno B', value: '2,180 kg' },
                { label: 'Prisma · turno A', value: '2,250 kg' },
                { label: 'Borra fictícia', value: '5,680 kg' },
            ],
        },
    };

    function renderReportDocument(report) {
        reportDocument.replaceChildren();

        const notice = document.createElement('div');
        notice.className = 'report-fictional-notice';
        notice.textContent = 'MODELO FICTÍCIO · NENHUM DADO REAL';

        const heading = document.createElement('h3');
        heading.textContent = report.heading;

        const description = document.createElement('p');
        description.className = 'report-description';
        description.textContent = report.description;

        const group = document.createElement('h4');
        group.textContent = report.group;

        const wrapper = document.createElement('div');
        wrapper.className = 'report-table-wrapper';

        const table = document.createElement('table');
        table.className = 'report-table';

        const header = document.createElement('thead');
        const headerRow = document.createElement('tr');
        report.columns.forEach(label => {
            const cell = document.createElement('th');
            cell.textContent = label;
            headerRow.append(cell);
        });
        header.append(headerRow);

        const body = document.createElement('tbody');
        report.rows.forEach(values => {
            const row = document.createElement('tr');
            values.forEach(value => {
                const cell = document.createElement('td');
                cell.textContent = value;
                row.append(cell);
            });
            body.append(row);
        });

        table.append(header, body);
        wrapper.append(table);
        reportDocument.append(notice, heading, description, group, wrapper);
    }

    function showReport(name) {
        const report = reports[name];

        if (!report) {
            return;
        }

        reportButtons.forEach(button => button.classList.toggle('is-active', button.dataset.report === name));
        reportTitle.textContent = report.title;
        renderReportDocument(report);
        reportMetrics.replaceChildren();

        report.metrics.forEach(({ label, value }) => {
            const item = document.createElement('div');
            item.className = 'report-metric';
            const itemLabel = document.createElement('span');
            itemLabel.textContent = label;
            const itemValue = document.createElement('strong');
            itemValue.textContent = value;
            item.append(itemLabel, itemValue);
            reportMetrics.append(item);
        });
    }

    reportButtons.forEach(button => button.addEventListener('click', () => showReport(button.dataset.report)));
    showReport('refugo');

    function animateImpactCounters() {
        document.querySelectorAll('[data-counter]').forEach(element => {
            const target = Number(element.dataset.counter);
            const decimalPlaces = Number(element.dataset.counterDecimals ?? 0);
            const duration = reducedMotion ? 0 : 1050;
            const start = performance.now();

            function update(now) {
                const progress = duration === 0 ? 1 : Math.min((now - start) / duration, 1);
                const eased = 1 - (1 - progress) ** 3;
                const value = target * eased;
                element.textContent = value.toLocaleString('pt-BR', {
                    minimumFractionDigits: decimalPlaces,
                    maximumFractionDigits: decimalPlaces,
                });

                if (progress < 1) {
                    requestAnimationFrame(update);
                }
            }

            requestAnimationFrame(update);
        });
    }

    const initialHash = decodeURIComponent(window.location.hash.slice(1));
    const initialIndex = panels.findIndex(panel => panel.id === initialHash);

    if (initialIndex > 0) {
        showSlide(initialIndex, false);
    }
})();
