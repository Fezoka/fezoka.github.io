(() => {
    'use strict';

    const panels = Array.from(document.querySelectorAll('[data-slide-panel]'));
    const steps = Array.from(document.querySelectorAll('.story-step'));
    const previous = document.getElementById('previous-slide');
    const next = document.getElementById('next-slide');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let currentSlide = 0;
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
            const active = stepIndex === selected;
            step.classList.toggle('is-active', active);
            if (active) {
                step.setAttribute('aria-current', 'step');
                step.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
            } else step.removeAttribute('aria-current');
        });
        currentSlide = selected;
        previous.disabled = selected === 0;
        next.disabled = selected === panels.length - 1;
        document.getElementById('current-slide-number').textContent = String(selected + 1).padStart(2, '0');
        document.getElementById('slide-progress-fill').style.width = `${(selected + 1) / panels.length * 100}%`;
        if (updateHash) history.replaceState(null, '', `#${panels[selected].id}`);
        if (panels[selected].id === 'resultados' && !countersAnimated) {
            countersAnimated = true;
            document.querySelectorAll('[data-counter]').forEach(counter => {
                const value = Number(counter.dataset.counter);
                const started = performance.now();
                function tick(timestamp) {
                    const progress = Math.min((timestamp - started) / 900, 1);
                    counter.textContent = String(Math.round(value * (1 - (1 - progress) ** 3)));
                    if (progress < 1) requestAnimationFrame(tick);
                }
                requestAnimationFrame(tick);
            });
        }
    }

    steps.forEach(step => step.addEventListener('click', () => showSlide(step.dataset.slide)));
    document.querySelectorAll('[data-slide-link], [data-slide]:not(.story-step)').forEach(button => button.addEventListener('click', event => {
        event.preventDefault();
        showSlide(button.dataset.slideLink ?? button.dataset.slide);
    }));
    document.querySelectorAll('[data-next-slide]').forEach(button => button.addEventListener('click', () => showSlide(currentSlide + 1)));
    previous.addEventListener('click', () => showSlide(currentSlide - 1));
    next.addEventListener('click', () => showSlide(currentSlide + 1));
    document.addEventListener('keydown', event => {
        if (event.target instanceof HTMLElement && (event.target.isContentEditable || ['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName))) return;
        if (['ArrowRight', 'PageDown'].includes(event.key)) {
            event.preventDefault();
            showSlide(currentSlide + 1);
        } else if (['ArrowLeft', 'PageUp'].includes(event.key)) {
            event.preventDefault();
            showSlide(currentSlide - 1);
        }
    });

    let touchStart;
    document.querySelector('.slides-viewport').addEventListener('touchstart', event => {
        touchStart = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
    }, { passive: true });
    document.querySelector('.slides-viewport').addEventListener('touchend', event => {
        if (!touchStart) return;
        const deltaX = event.changedTouches[0].clientX - touchStart.x;
        const deltaY = event.changedTouches[0].clientY - touchStart.y;
        touchStart = undefined;
        if (Math.abs(deltaX) > 85 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) showSlide(currentSlide + (deltaX < 0 ? 1 : -1));
    }, { passive: true });

    const modules = {
        programacoes: { label: 'Programações', heading: 'CENTRAL DE PROGRAMAÇÕES', description: 'Acompanhe todas as máquinas, suas filas, o progresso, a previsão de conclusão e a carga planejada em uma única visão.', features: ['Painel consolidado por máquina', 'Prioridade visual das operações', 'Previsão automática de conclusão', 'Filtros por período e status'] },
        visao: { label: 'Visão geral', heading: 'CRONOGRAMA COMPLETO', description: 'Visualize a programação consolidada e entenda como as atividades se distribuem entre recursos, períodos e responsáveis.', features: ['Cronograma centralizado', 'Distribuição por máquina', 'Visão de carga e capacidade', 'Acompanhamento de prazos'] },
        maquinas: { label: 'Máquinas', heading: 'MÁQUINAS E FILAS', description: 'Cadastre os recursos produtivos, abra a programação específica de cada máquina e altere as prioridades sempre que necessário.', features: ['Fila independente por máquina', 'Reordenação de prioridades', 'Operações e setup', 'Impressão e envio simulados'] },
        funcionarios: { label: 'Funcionários', heading: 'EQUIPE E HABILITAÇÕES', description: 'Defina quem pode trabalhar em cada recurso e quais jornadas formam a capacidade real disponível.', features: ['Habilitação por máquina', 'Jornadas e turnos', 'Atribuição automática', 'Perfis de acesso específicos'] },
        cadastros: { label: 'Cadastros', heading: 'BASE OPERACIONAL', description: 'Mantenha jornadas, exceções, clientes, moldes e componentes disponíveis para que o motor programe de forma independente.', features: ['Jornadas semanais', 'Exceções e ausências', 'Moldes e componentes', 'Clientes e tempos padrão'] },
        historico: { label: 'Histórico', heading: 'RASTREABILIDADE OPERACIONAL', description: 'Consulte as alterações, observações e conclusões da operação para entender o caminho percorrido pela ferramentaria.', features: ['Histórico por operação', 'Responsável real da conclusão', 'Observações e imprevistos', 'Acompanhamento auditável'] },
    };

    function chooseModule(key) {
        const selected = modules[key];
        document.querySelectorAll('.module-button').forEach(button => button.classList.toggle('is-active', button.dataset.module === key));
        document.getElementById('module-heading').textContent = selected.heading;
        document.getElementById('module-description').textContent = selected.description;
        document.getElementById('module-features').innerHTML = selected.features.map(feature => `<div class="module-feature"><span>✓</span><span>${feature}</span></div>`).join('');
    }

    document.getElementById('planner-modules').innerHTML = Object.entries(modules).map(([key, module]) => `<button class="module-button${key === 'programacoes' ? ' is-active' : ''}" type="button" data-module="${key}">${module.label}</button>`).join('');
    document.getElementById('planner-modules').addEventListener('click', event => {
        const button = event.target.closest('[data-module]');
        if (button) chooseModule(button.dataset.module);
    });

    const queue = [
        { name: 'Inserto Aurora', customer: 'Cliente Aurora', minutes: 210, operator: 'Alex Horizonte' },
        { name: 'Extrator Prisma', customer: 'Distribuidora Prisma', minutes: 180, operator: 'Bruna Prisma' },
        { name: 'Base Horizonte', customer: 'Comércio Horizonte', minutes: 240, operator: 'Caio Boreal' },
        { name: 'Cavidade Nébula', customer: 'Grupo Boreal', minutes: 150, operator: 'Alex Horizonte' },
    ];

    function formatTime(minutes) {
        const hours = Math.floor(minutes / 60) % 24;
        return `${String(hours).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
    }

    function renderQueue() {
        let cursor = 6 * 60;
        document.getElementById('priority-queue').innerHTML = queue.map((operation, index) => {
            const start = formatTime(cursor);
            const assignedOperator = cursor < 14 * 60 ? 'Alex Horizonte' : cursor < 22 * 60 ? 'Bruna Prisma' : 'Caio Boreal';
            cursor += operation.minutes;
            const end = formatTime(cursor);
            return `<article class="priority-row"><span class="priority-index">${String(index + 1).padStart(2, '0')}</span><div class="priority-copy"><strong>${operation.name}</strong><span>${operation.customer}</span></div><div class="priority-time"><small>INÍCIO</small><strong>${start}</strong></div><div class="priority-time"><small>FIM</small><strong>${end}</strong></div><span class="priority-operator">${assignedOperator}</span><div class="priority-controls"><button type="button" data-move="up" data-index="${index}" aria-label="Aumentar prioridade de ${operation.name}"${index === 0 ? ' disabled' : ''}>↑</button><button type="button" data-move="down" data-index="${index}" aria-label="Diminuir prioridade de ${operation.name}"${index === queue.length - 1 ? ' disabled' : ''}>↓</button></div></article>`;
        }).join('');
    }

    document.getElementById('priority-queue').addEventListener('click', event => {
        const button = event.target.closest('[data-move]');
        if (!button) return;
        const index = Number(button.dataset.index);
        const target = index + (button.dataset.move === 'up' ? -1 : 1);
        if (target < 0 || target >= queue.length) return;
        [queue[index], queue[target]] = [queue[target], queue[index]];
        renderQueue();
        document.getElementById('queue-state').textContent = 'FILA E PRAZOS RECALCULADOS';
    });

    const scenarios = {
        normal: { steps: [['Prioridade', 'Ordem escolhida pelo planejador.'], ['Recurso', 'MQ-DEMO-01 disponível.'], ['Habilitação', 'Alex Horizonte pode operar a máquina.'], ['Jornada', 'Turno fictício começa às 06:00.'], ['Prazo', 'Setup + operação previstos até 09:30.']], result: 'Resultado demonstrativo: Inserto Aurora começa às 06:00 com Alex Horizonte e termina às 09:30 sem atribuição manual.' },
        priority: { steps: [['Nova ordem', 'Extrator Prisma sobe para a primeira posição.'], ['Fila', 'As demais operações são deslocadas.'], ['Habilitação', 'Bruna Prisma está disponível para o setup.'], ['Duração', 'Setup e tempo padrão são reaplicados.'], ['Recálculo', 'Todos os prazos seguintes são atualizados.']], result: 'Resultado demonstrativo: o planejador alterou apenas uma prioridade; responsável, início e término de toda a fila foram recalculados.' },
        shift: { steps: [['Fila', 'A operação alcança a troca de turno.'], ['Jornada', 'O expediente de Alex Horizonte termina.'], ['Capacidade', 'Bruna Prisma mantém a máquina disponível.'], ['Habilitação', 'A próxima pessoa habilitada é localizada.'], ['Continuidade', 'A previsão respeita a capacidade combinada.']], result: 'Resultado demonstrativo: jornadas de pessoas diferentes são unidas para determinar a capacidade real da máquina.' },
        exception: { steps: [['Exceção', 'Ausência fictícia bloqueia parte da jornada.'], ['Disponibilidade', 'A capacidade do recurso é revisada.'], ['Operador', 'Outro funcionário habilitado é localizado.'], ['Sequência', 'A fila permanece na ordem definida.'], ['Novo prazo', 'Horários são recalculados automaticamente.']], result: 'Resultado demonstrativo: uma exceção muda os horários disponíveis, mas o sistema preserva a prioridade e recalcula o cronograma.' },
    };

    function chooseEngineScenario(key) {
        const scenario = scenarios[key];
        document.querySelectorAll('[data-engine]').forEach(button => button.classList.toggle('is-active', button.dataset.engine === key));
        document.getElementById('engine-flow').innerHTML = scenario.steps.map(([title, description], index) => `<article class="engine-step"><i>0${index + 1}</i><strong>${title}</strong><span>${description}</span></article>`).join('');
        document.getElementById('engine-result').textContent = scenario.result;
    }

    document.querySelectorAll('[data-engine]').forEach(button => button.addEventListener('click', () => chooseEngineScenario(button.dataset.engine)));

    const machineCapacity = {
        aurora: { shifts: [['Alex Horizonte', '06:00 → 14:00', 68], ['Bruna Prisma', '14:00 → 22:00', 68], ['Caio Boreal', '22:00 → 00:00', 20]], total: '18 horas de capacidade combinada' },
        prisma: { shifts: [['Bruna Prisma', '07:00 → 15:00', 72], ['Caio Boreal', '15:00 → 21:00', 54]], total: '14 horas de capacidade combinada' },
        horizonte: { shifts: [['Alex Horizonte', '06:00 → 12:00', 48], ['Caio Boreal', '12:00 → 20:00', 70]], total: '14 horas de capacidade combinada' },
    };

    function renderCapacity() {
        const capacity = machineCapacity[document.getElementById('capacity-machine').value];
        document.getElementById('shift-rows').innerHTML = capacity.shifts.map(([name, interval, width]) => `<article class="shift-row"><div><strong>${name}</strong><span>${interval}</span></div><div class="shift-track"><span style="width:${width}%"></span></div></article>`).join('');
        document.getElementById('combined-capacity').innerHTML = `<span>Capacidade disponível</span><strong>${capacity.total}</strong>`;
    }

    document.getElementById('capacity-machine').addEventListener('change', renderCapacity);

    const profiles = {
        planejador: { overline: 'GESTÃO E PROGRAMAÇÃO', heading: 'Camila Atlas · Planejadora', tag: 'ACESSO COMPLETO', permissions: [true, true, true, true, true, true, true, true], note: 'O planejador administra filas, prioridades, máquinas, funcionários, cadastros, exceções e histórico.' },
        geral: { overline: 'CONSULTA UNIVERSAL', heading: 'Visão Geral · Acompanhamento', tag: 'TODAS AS MÁQUINAS', permissions: [true, true, false, false, false, true, false, false], note: 'O perfil geral enxerga todas as tarefas e filtra por máquina, mas nunca aparece como funcionário atribuído.' },
        funcionario: { overline: 'EXECUÇÃO INDIVIDUAL', heading: 'Alex Horizonte · Operador', tag: 'MINHAS TAREFAS', permissions: [true, false, false, false, false, false, true, false], note: 'O funcionário individual acompanha e conclui exclusivamente as operações atribuídas a ele.' },
    };

    const permissionLabels = ['Consultar programações disponíveis', 'Visualizar tarefas de todas as máquinas', 'Alterar prioridades da fila', 'Cadastrar e editar máquinas', 'Gerenciar funcionários e jornadas', 'Filtrar tarefas por máquina', 'Concluir a própria operação', 'Administrar cadastros e histórico'];

    function chooseProfile(key) {
        const profile = profiles[key];
        document.querySelectorAll('[data-profile]').forEach(button => button.classList.toggle('is-active', button.dataset.profile === key));
        document.getElementById('profile-overline').textContent = profile.overline;
        document.getElementById('profile-heading').textContent = profile.heading;
        document.getElementById('profile-tag').textContent = profile.tag;
        document.getElementById('profile-note').textContent = profile.note;
        document.getElementById('permission-list').innerHTML = permissionLabels.map((label, index) => `<div class="permission-item ${profile.permissions[index] ? 'is-allowed' : 'is-blocked'}"><i>${profile.permissions[index] ? '✓' : '×'}</i><span>${label}</span></div>`).join('');
    }

    document.querySelectorAll('[data-profile]').forEach(button => button.addEventListener('click', () => chooseProfile(button.dataset.profile)));

    const employeeTasks = {
        alex: [['MQ-DEMO-01', 'Inserto Aurora · Usinagem', '06:00 → 09:30'], ['MQ-DEMO-03', 'Cavidade Nébula · Acabamento', '13:00 → 15:30']],
        bruna: [['MQ-DEMO-01', 'Extrator Prisma · Ajuste', '09:30 → 12:30'], ['MQ-DEMO-02', 'Base Aurora · Erosão', '14:00 → 17:00']],
        caio: [['MQ-DEMO-02', 'Guia Horizonte · Erosão', '15:00 → 18:00'], ['MQ-DEMO-03', 'Base Boreal · Retífica', '18:00 → 21:00']],
    };

    function renderTasks() {
        const tasks = employeeTasks[document.getElementById('execution-employee').value];
        document.getElementById('task-preview-list').innerHTML = tasks.map(([machine, title, interval], index) => `<article class="task-preview-card"><div class="task-preview-copy"><span>${machine}</span><strong>${title}</strong><small>Previsão demonstrativa · ${interval}</small></div><button class="task-preview-action" type="button" data-task-index="${index}">Concluir operação</button></article>`).join('');
        document.getElementById('task-preview-feedback').textContent = '';
    }

    document.getElementById('execution-employee').addEventListener('change', renderTasks);
    document.getElementById('task-preview-list').addEventListener('click', event => {
        const button = event.target.closest('[data-task-index]');
        if (!button) return;
        const task = employeeTasks[document.getElementById('execution-employee').value][Number(button.dataset.taskIndex)];
        button.textContent = '✓ Concluída';
        button.disabled = true;
        document.getElementById('task-preview-feedback').textContent = `${task[1]} concluída visualmente. Nenhuma informação real foi alterada.`;
    });

    chooseModule('programacoes');
    renderQueue();
    chooseEngineScenario('normal');
    renderCapacity();
    chooseProfile('planejador');
    renderTasks();
    const hashIndex = panels.findIndex(panel => `#${panel.id}` === location.hash);
    showSlide(hashIndex >= 0 ? hashIndex : 0, false);
})();
