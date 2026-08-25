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
    let countersAnimated = false;
    let touchStart = null;

    function showSlide(index, updateHash = true) {
        const nextIndex = Number(index);

        if (!Number.isInteger(nextIndex) || nextIndex < 0 || nextIndex >= panels.length) {
            return;
        }

        const nextPanel = panels[nextIndex];
        panels.forEach(panel => {
            panel.hidden = panel !== nextPanel;
            panel.classList.remove('is-active');
        });

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

        if (nextPanel.id === 'dashboard') {
            requestAnimationFrame(renderDashboard);
        }

        if (nextPanel.id === 'resultados' && !countersAnimated) {
            countersAnimated = true;
            animateCounters();
        }
    }

    navigation.forEach(button => button.addEventListener('click', () => showSlide(button.dataset.slide)));

    document.querySelectorAll('[data-slide-link], [data-slide]:not(.story-step)').forEach(button => {
        button.addEventListener('click', event => {
            event.preventDefault();
            showSlide(button.dataset.slideLink ?? button.dataset.slide);
        });
    });

    document.querySelectorAll('[data-next-slide]').forEach(button => button.addEventListener('click', () => showSlide(activeSlide + 1)));
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

    const viewport = document.querySelector('.slides-viewport');
    viewport.addEventListener('touchstart', event => {
        const touch = event.changedTouches[0];
        touchStart = { x: touch.clientX, y: touch.clientY };
    }, { passive: true });

    viewport.addEventListener('touchend', event => {
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

    const senses = [
        {
            name: 'Seiri',
            meaning: 'Utilização',
            tone: '#48b9ff',
            explanation: 'Separar o necessário do desnecessário para manter apenas o que realmente contribui com a rotina.',
            questions: [
                ['Materiais sem utilização foram retirados?', 'Avalie documentos, objetos e itens sem uso recorrente.'],
                ['A estação mantém somente itens necessários?', 'Considere a frequência real de utilização.'],
                ['Arquivos duplicados foram identificados?', 'Inclui documentos digitais e impressos.'],
            ],
        },
        {
            name: 'Seiton',
            meaning: 'Organização',
            tone: '#35dbe2',
            explanation: 'Organizar cada material em um local conhecido, identificado e adequado à sua frequência de uso.',
            questions: [
                ['Os materiais possuem local identificado?', 'Verifique etiquetas e localização padronizada.'],
                ['Os documentos são encontrados facilmente?', 'Observe pastas físicas e digitais.'],
                ['A bancada segue uma organização visual?', 'Analise acessos, circulação e posicionamento.'],
            ],
        },
        {
            name: 'Seiso',
            meaning: 'Limpeza',
            tone: '#43e097',
            explanation: 'Manter ambientes e equipamentos limpos, identificando rapidamente fontes de sujeira e anomalias.',
            questions: [
                ['A estação de trabalho está limpa?', 'Avalie superfície, cadeira e área de circulação.'],
                ['Equipamentos apresentam boa conservação?', 'Considere telas, periféricos e ferramentas.'],
                ['Os resíduos são descartados corretamente?', 'Confira os recipientes de descarte disponíveis.'],
            ],
        },
        {
            name: 'Seiketsu',
            meaning: 'Padronização',
            tone: '#ffbd4a',
            explanation: 'Preservar os três primeiros sensos por meio de referências visuais, rotinas e padrões compartilhados.',
            questions: [
                ['A identificação visual segue um padrão?', 'Compare etiquetas, cores e sinalizações.'],
                ['A equipe conhece a rotina estabelecida?', 'Observe instruções e responsabilidades.'],
                ['Os controles estão atualizados?', 'Avalie formulários e registros demonstrativos.'],
            ],
        },
        {
            name: 'Shitsuke',
            meaning: 'Disciplina',
            tone: '#fd798a',
            explanation: 'Transformar as boas práticas em comportamento contínuo, sem depender apenas da proximidade de uma auditoria.',
            questions: [
                ['A rotina é praticada continuamente?', 'Considere a consistência entre as auditorias.'],
                ['As ações pendentes são acompanhadas?', 'Verifique responsáveis e prazos simulados.'],
                ['A equipe participa das melhorias?', 'Observe sugestões e participação demonstrativa.'],
            ],
        },
    ];

    const senseNavigation = document.getElementById('sense-navigation');
    const senseCaption = document.getElementById('sense-caption');
    const senseExplanation = document.getElementById('sense-explanation');
    const senseQuestionList = document.getElementById('sense-question-list');
    const senseProgressText = document.getElementById('sense-progress-text');
    const senseProgressBar = document.getElementById('sense-progress-bar');
    const auditFeedback = document.getElementById('audit-feedback');
    const senseAnswers = new Map();
    let activeSense = 0;

    function renderSenseNavigation() {
        senseNavigation.replaceChildren();

        senses.forEach((sense, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `sense-option${index === activeSense ? ' is-active' : ''}`;
            button.style.setProperty('--sense-tone', sense.tone);

            const number = document.createElement('i');
            number.textContent = `${index + 1}S`;
            const text = document.createElement('span');
            const name = document.createElement('strong');
            name.textContent = sense.name;
            const meaning = document.createElement('small');
            meaning.textContent = sense.meaning;
            text.append(name, meaning);
            button.append(number, text);
            button.addEventListener('click', () => {
                activeSense = index;
                renderSense();
            });
            senseNavigation.append(button);
        });
    }

    function updateSenseProgress() {
        const sense = senses[activeSense];
        const answered = sense.questions.filter((_, index) => senseAnswers.has(`${activeSense}-${index}`)).length;
        const hasNonconformity = sense.questions.some((_, index) => senseAnswers.get(`${activeSense}-${index}`) === 'nok');
        senseProgressText.textContent = `${answered} / ${sense.questions.length} respondidas`;
        senseProgressBar.style.width = `${(answered / sense.questions.length) * 100}%`;
        auditFeedback.classList.remove('is-warning', 'is-complete');

        if (hasNonconformity) {
            auditFeedback.textContent = '⚠ Não conformidade identificada: um plano de ação demonstrativo pode ser registrado.';
            auditFeedback.classList.add('is-warning');
        } else if (answered === sense.questions.length) {
            auditFeedback.textContent = '✓ Senso concluído. O resultado fictício já está disponível nos indicadores.';
            auditFeedback.classList.add('is-complete');
        } else {
            auditFeedback.textContent = 'Responda às perguntas para acompanhar o resultado.';
        }
    }

    function renderSense() {
        const sense = senses[activeSense];
        renderSenseNavigation();
        senseCaption.textContent = `${activeSense + 1}S · ${sense.name.toUpperCase()} / ${sense.meaning.toUpperCase()}`;
        senseExplanation.textContent = sense.explanation;
        senseQuestionList.replaceChildren();

        sense.questions.forEach(([question, context], questionIndex) => {
            const row = document.createElement('div');
            row.className = 'audit-question';
            const content = document.createElement('div');
            const title = document.createElement('strong');
            title.textContent = question;
            const detail = document.createElement('small');
            detail.textContent = context;
            content.append(title, detail);

            const answers = document.createElement('div');
            answers.className = 'answer-group';

            [['ok', 'OK'], ['nok', 'NOK'], ['na', 'N/A']].forEach(([value, label]) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'answer-button';
                button.dataset.value = value;
                button.textContent = label;
                button.setAttribute('aria-label', `${label}: ${question}`);

                if (senseAnswers.get(`${activeSense}-${questionIndex}`) === value) {
                    button.classList.add('is-selected');
                }

                button.addEventListener('click', () => {
                    senseAnswers.set(`${activeSense}-${questionIndex}`, value);
                    answers.querySelectorAll('button').forEach(item => item.classList.toggle('is-selected', item === button));
                    updateSenseProgress();
                });
                answers.append(button);
            });

            row.append(content, answers);
            senseQuestionList.append(row);
        });

        updateSenseProgress();
    }

    renderSense();

    const dashboardData = {
        atlas: { average: 87, trend: '+8 pontos', latest: '39 / 45', critical: 0, history: [63, 68, 73, 77, 81, 87], senses: [88, 76, 94, 83, 91] },
        horizonte: { average: 79, trend: '+5 pontos', latest: '36 / 45', critical: 1, history: [57, 63, 66, 71, 74, 79], senses: [81, 69, 88, 77, 80] },
        prisma: { average: 93, trend: '+11 pontos', latest: '42 / 45', critical: 0, history: [71, 75, 81, 86, 89, 93], senses: [94, 90, 97, 91, 93] },
    };

    const dashboardArea = document.getElementById('dashboard-area');
    const dashboardMetrics = document.getElementById('dashboard-metrics');

    function metricCard(label, value, tone, className = 'dashboard-metric') {
        const card = document.createElement('article');
        card.className = className;
        card.style.setProperty('--metric-tone', tone);
        const caption = document.createElement('span');
        caption.textContent = label;
        const content = document.createElement('strong');
        content.textContent = value;
        card.append(caption, content);
        return card;
    }

    function canvasContext(canvas) {
        const bounds = canvas.getBoundingClientRect();

        if (!bounds.width || !bounds.height) {
            return null;
        }

        const scale = window.devicePixelRatio || 1;
        canvas.width = Math.round(bounds.width * scale);
        canvas.height = Math.round(bounds.height * scale);
        const context = canvas.getContext('2d');
        context.setTransform(scale, 0, 0, scale, 0, 0);
        context.clearRect(0, 0, bounds.width, bounds.height);
        return { context, width: bounds.width, height: bounds.height };
    }

    function drawEvolution(values) {
        const chart = canvasContext(document.getElementById('evolution-chart'));

        if (!chart) {
            return;
        }

        const { context, width, height } = chart;
        const left = 29;
        const right = width - 12;
        const top = 18;
        const bottom = height - 28;
        const getY = value => bottom - ((value - 40) / 60) * (bottom - top);

        context.font = '10px Inter, sans-serif';
        context.fillStyle = '#8fa3b4';

        [40, 60, 80, 100].forEach(value => {
            const y = getY(value);
            context.strokeStyle = 'rgba(150, 177, 207, .13)';
            context.beginPath();
            context.moveTo(left, y);
            context.lineTo(right, y);
            context.stroke();
            context.fillText(`${value}`, 1, y + 4);
        });

        const points = values.map((value, index) => ({ x: left + (index / (values.length - 1)) * (right - left), y: getY(value) }));
        const gradient = context.createLinearGradient(0, top, 0, bottom);
        gradient.addColorStop(0, 'rgba(71, 224, 187, .3)');
        gradient.addColorStop(1, 'rgba(71, 224, 187, .015)');
        context.beginPath();
        points.forEach((point, index) => index === 0 ? context.moveTo(point.x, point.y) : context.lineTo(point.x, point.y));
        context.lineTo(right, bottom);
        context.lineTo(left, bottom);
        context.closePath();
        context.fillStyle = gradient;
        context.fill();

        context.beginPath();
        points.forEach((point, index) => index === 0 ? context.moveTo(point.x, point.y) : context.lineTo(point.x, point.y));
        context.strokeStyle = '#47e0bb';
        context.lineWidth = 2.5;
        context.stroke();

        points.forEach((point, index) => {
            context.beginPath();
            context.arc(point.x, point.y, 3.5, 0, Math.PI * 2);
            context.fillStyle = '#47e0bb';
            context.fill();
            context.fillStyle = '#8fa3b4';
            context.fillText(`C${index + 1}`, point.x - 6, height - 7);
        });
    }

    function drawSenses(values) {
        const chart = canvasContext(document.getElementById('sense-chart'));

        if (!chart) {
            return;
        }

        const { context, width, height } = chart;
        const rowHeight = height / values.length;
        const left = Math.min(76, width * .28);
        const right = width - 40;
        context.font = '10px Inter, sans-serif';

        values.forEach((value, index) => {
            const y = rowHeight * index + rowHeight * .54;
            context.fillStyle = '#a6b6c3';
            context.fillText(senses[index].name, 0, y + 4);
            context.fillStyle = 'rgba(255, 255, 255, .08)';
            context.fillRect(left, y - 5, right - left, 10);
            context.fillStyle = senses[index].tone;
            context.fillRect(left, y - 5, ((right - left) * value) / 100, 10);
            context.fillStyle = senses[index].tone;
            context.fillText(`${value}%`, right + 6, y + 4);
        });
    }

    function renderDashboard() {
        const data = dashboardData[dashboardArea.value];
        dashboardMetrics.replaceChildren(
            metricCard('Tendência fictícia', data.trend, '#47e0bb'),
            metricCard('Média demonstrativa', `${data.average}%`, '#48b9ff'),
            metricCard('Última auditoria', data.latest, '#50df99'),
            metricCard('Áreas de atenção', String(data.critical), data.critical ? '#ffbd4a' : '#50df99'),
        );
        drawEvolution(data.history);
        drawSenses(data.senses);
    }

    dashboardArea.addEventListener('change', renderDashboard);
    window.addEventListener('resize', () => {
        if (panels[activeSlide]?.id === 'dashboard') {
            renderDashboard();
        }
    });

    const productiveQuestions = [
        ['1S · Utilização', 'Os materiais utilizados possuem necessidade definida?'],
        ['2S · Organização', 'Ferramentas e componentes possuem localização identificada?'],
        ['3S · Limpeza', 'Bancadas e equipamentos estão em condições adequadas?'],
        ['4S · Padronização', 'A identificação visual segue o padrão definido?'],
        ['5S · Disciplina', 'A rotina de auditoria é mantida continuamente?'],
    ];

    const productiveScores = new Map();
    const productiveContainer = document.getElementById('productive-questions');
    const productiveScore = document.getElementById('productive-score');
    const productiveAnswered = document.getElementById('productive-answered');
    const productiveStatus = document.getElementById('productive-status');
    const productiveRing = document.getElementById('productive-ring');

    function updateProductiveScore() {
        const answered = productiveScores.size;
        const sum = Array.from(productiveScores.values()).reduce((total, value) => total + value, 0);
        const percent = answered ? Math.round((sum / (answered * 5)) * 100) : 0;
        productiveScore.textContent = `${percent}%`;
        productiveRing.style.setProperty('--score-progress', `${percent}%`);
        productiveAnswered.textContent = `${answered} de ${productiveQuestions.length} itens avaliados`;
        productiveStatus.textContent = answered === 0 ? 'Aguardando avaliação' : percent >= 80 ? '✓ Excelente resultado fictício' : percent >= 60 ? '↗ Oportunidade de melhoria' : '⚠ Atenção demonstrativa';
    }

    function renderProductiveQuestions() {
        productiveContainer.replaceChildren();

        productiveQuestions.forEach(([sense, question], index) => {
            const row = document.createElement('div');
            row.className = 'productive-question';
            const text = document.createElement('div');
            const title = document.createElement('strong');
            title.textContent = sense;
            const detail = document.createElement('small');
            detail.textContent = question;
            text.append(title, detail);

            const ratings = document.createElement('div');
            ratings.className = 'rating-group';

            for (let rating = 0; rating <= 5; rating += 1) {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'rating-button';
                button.textContent = String(rating);
                button.style.setProperty('--rating-tone', rating <= 1 ? '#ff5e6c' : rating <= 3 ? '#ffbd4a' : '#50df99');
                button.setAttribute('aria-label', `Nota ${rating}: ${sense}`);

                if (productiveScores.get(index) === rating) {
                    button.classList.add('is-selected');
                }

                button.addEventListener('click', () => {
                    productiveScores.set(index, rating);
                    ratings.querySelectorAll('button').forEach(item => item.classList.toggle('is-selected', item === button));
                    updateProductiveScore();
                });
                ratings.append(button);
            }

            row.append(text, ratings);
            productiveContainer.append(row);
        });
    }

    document.getElementById('reset-productive').addEventListener('click', () => {
        productiveScores.clear();
        renderProductiveQuestions();
        updateProductiveScore();
    });

    renderProductiveQuestions();

    const adminModules = {
        usuarios: {
            label: 'Usuários',
            title: 'Colaboradores fictícios',
            columns: ['Nome', 'E-mail demonstrativo', 'Área', 'Perfil'],
            rows: [
                ['Alex Aurora', 'alex.aurora@empresa-exemplo.test', 'Núcleo Atlas', 'Administrador'],
                ['Bruna Prisma', 'bruna.prisma@empresa-exemplo.test', 'Núcleo Horizonte', 'Gestora'],
                ['Caio Horizonte', 'caio.horizonte@empresa-exemplo.test', 'Núcleo Prisma', 'Auditor'],
            ],
        },
        setores: {
            label: 'Setores',
            title: 'Áreas demonstrativas',
            columns: ['Área fictícia', 'Identificador', 'Gestor fictício', 'Participantes'],
            rows: [
                ['Núcleo Atlas', 'AREA-DEMO-01', 'Alex Aurora', '8 pessoas'],
                ['Núcleo Horizonte', 'AREA-DEMO-02', 'Bruna Prisma', '6 pessoas'],
                ['Núcleo Prisma', 'AREA-DEMO-03', 'Caio Horizonte', '5 pessoas'],
            ],
        },
        ranking: {
            label: 'Ranking',
            title: 'Desempenho fictício por área',
            columns: ['Posição', 'Área fictícia', 'Conformidade', 'Tendência'],
            rows: [
                ['1º', 'Núcleo Prisma', '93%', '↗ +11 pontos'],
                ['2º', 'Núcleo Atlas', '87%', '↗ +8 pontos'],
                ['3º', 'Núcleo Horizonte', '79%', '↗ +5 pontos'],
            ],
        },
        planos: {
            label: 'Planos de ação',
            title: 'Ações demonstrativas',
            columns: ['Referência fictícia', 'Ação proposta', 'Responsável', 'Status'],
            rows: [
                ['ACAO-DEMO-01', 'Padronizar identificação das bancadas', 'Alex Aurora', 'Em andamento'],
                ['ACAO-DEMO-02', 'Revisar organização dos materiais', 'Bruna Prisma', 'Concluída'],
                ['ACAO-DEMO-03', 'Atualizar sinalização visual', 'Caio Horizonte', 'Planejada'],
            ],
        },
    };

    const adminStats = document.getElementById('admin-stats');
    const adminTabs = document.getElementById('admin-tabs');
    const adminContent = document.getElementById('admin-content');
    adminStats.append(
        metricCard('Pessoas fictícias', '19', '#48b9ff', 'admin-stat'),
        metricCard('Áreas demonstrativas', '03', '#50df99', 'admin-stat'),
        metricCard('Avisos simulados', '04', '#ffbd4a', 'admin-stat'),
        metricCard('Melhor índice', '93%', '#47e0bb', 'admin-stat'),
    );

    function showAdminModule(name) {
        const module = adminModules[name];

        if (!module) {
            return;
        }

        adminTabs.querySelectorAll('button').forEach(button => {
            const selected = button.dataset.module === name;
            button.classList.toggle('is-active', selected);
            button.setAttribute('aria-selected', String(selected));
        });

        const title = document.createElement('h3');
        title.textContent = module.title;
        const table = document.createElement('table');
        table.className = 'admin-table';
        const head = document.createElement('thead');
        const headerRow = document.createElement('tr');
        module.columns.forEach(value => {
            const cell = document.createElement('th');
            cell.textContent = value;
            headerRow.append(cell);
        });
        head.append(headerRow);

        const body = document.createElement('tbody');
        module.rows.forEach(values => {
            const row = document.createElement('tr');
            values.forEach((value, index) => {
                const cell = document.createElement('td');

                if (index === values.length - 1) {
                    const badge = document.createElement('span');
                    badge.className = 'admin-badge';
                    badge.textContent = value;
                    cell.append(badge);
                } else {
                    cell.textContent = value;
                }

                row.append(cell);
            });
            body.append(row);
        });

        table.append(head, body);
        adminContent.replaceChildren(title, table);
    }

    Object.entries(adminModules).forEach(([name, module], index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `admin-tab${index === 0 ? ' is-active' : ''}`;
        button.dataset.module = name;
        button.textContent = module.label;
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-selected', String(index === 0));
        button.addEventListener('click', () => showAdminModule(name));
        adminTabs.append(button);
    });

    showAdminModule('usuarios');

    const scheduleDays = document.getElementById('schedule-days');
    const completedDays = new Set([3, 8, 10]);
    const scheduledDays = new Set([17, 22, 26]);
    const dueDays = new Set([15, 29]);

    for (let day = 1; day <= 35; day += 1) {
        const item = document.createElement('div');
        const currentDay = day <= 31 ? day : day - 31;
        item.className = 'schedule-day';
        item.textContent = String(currentDay);

        if (day > 31) {
            item.classList.add('is-muted');
        } else if (completedDays.has(day)) {
            item.classList.add('is-complete');
        } else if (scheduledDays.has(day)) {
            item.classList.add('is-upcoming');
        } else if (dueDays.has(day)) {
            item.classList.add('is-due');
        }

        scheduleDays.append(item);
    }

    const notifications = [
        { type: 'AUDITORIA PROGRAMADA', title: 'Núcleo Atlas · ciclo demonstrativo', detail: 'Aviso fictício enviado com sete dias de antecedência.', tone: '#47e0bb' },
        { type: 'PRAZO PRÓXIMO', title: 'Núcleo Horizonte · ação demonstrativa', detail: 'Lembrete visual fictício para o responsável pela área.', tone: '#ffbd4a' },
        { type: 'AUDITORIA CONCLUÍDA', title: 'Núcleo Prisma · resultado registrado', detail: 'Indicadores demonstrativos atualizados automaticamente.', tone: '#50df99' },
    ];

    const notificationTimeline = document.getElementById('notification-timeline');

    function renderNotifications() {
        notificationTimeline.replaceChildren();
        notifications.slice(0, 4).forEach(notification => {
            const item = document.createElement('article');
            item.className = 'notification-item';
            item.style.setProperty('--notification-tone', notification.tone);
            const type = document.createElement('span');
            type.textContent = notification.type;
            const title = document.createElement('strong');
            title.textContent = notification.title;
            const detail = document.createElement('small');
            detail.textContent = notification.detail;
            item.append(type, title, detail);
            notificationTimeline.append(item);
        });
    }

    document.getElementById('simulate-reminder').addEventListener('click', () => {
        notifications.unshift({
            type: 'LEMBRETE SIMULADO AGORA',
            title: 'Célula Aurora · AUD-DEMO-015',
            detail: 'Demonstração visual: nenhum e-mail foi realmente enviado.',
            tone: '#48b9ff',
        });
        renderNotifications();
    });

    renderNotifications();

    function animateCounters() {
        document.querySelectorAll('[data-counter]').forEach(element => {
            const target = Number(element.dataset.counter);
            const duration = reducedMotion ? 0 : 900;
            const start = performance.now();

            function update(now) {
                const progress = duration === 0 ? 1 : Math.min((now - start) / duration, 1);
                element.textContent = String(Math.round(target * (1 - (1 - progress) ** 3)));

                if (progress < 1) {
                    requestAnimationFrame(update);
                }
            }

            requestAnimationFrame(update);
        });
    }

    const initialId = decodeURIComponent(window.location.hash.replace(/^#/, ''));
    const initialIndex = panels.findIndex(panel => panel.id === initialId);
    showSlide(initialIndex >= 0 ? initialIndex : 0, false);
})();
