(() => {
    'use strict';

    const employees = [
        { id: 'alex', name: 'Alex Horizonte', shift: '06:00 → 14:00', start: 6 * 60, end: 14 * 60, machines: ['MQ-DEMO-01', 'MQ-DEMO-03'] },
        { id: 'bruna', name: 'Bruna Prisma', shift: '14:00 → 22:00', start: 14 * 60, end: 22 * 60, machines: ['MQ-DEMO-01', 'MQ-DEMO-02'] },
        { id: 'caio', name: 'Caio Boreal', shift: '22:00 → 06:00', start: 22 * 60, end: 30 * 60, machines: ['MQ-DEMO-01', 'MQ-DEMO-02'] },
        { id: 'daniela', name: 'Daniela Nébula', shift: '08:00 → 16:00', start: 8 * 60, end: 16 * 60, machines: ['MQ-DEMO-02', 'MQ-DEMO-03'] },
    ];

    const machines = [
        { code: 'MQ-DEMO-01', name: 'Centro Aurora', type: 'Usinagem CNC', start: 6 * 60 },
        { code: 'MQ-DEMO-02', name: 'Erosão Prisma', type: 'Erosão controlada', start: 8 * 60 },
        { code: 'MQ-DEMO-03', name: 'Retífica Horizonte', type: 'Acabamento técnico', start: 6 * 60 },
    ];

    const operations = [
        { id: 'OP-DEMO-301', machine: 'MQ-DEMO-01', component: 'Inserto Aurora', customer: 'Cliente Aurora', duration: 180, setup: 30, status: 'planned', order: 1 },
        { id: 'OP-DEMO-302', machine: 'MQ-DEMO-01', component: 'Extrator Prisma', customer: 'Distribuidora Prisma', duration: 150, setup: 30, status: 'planned', order: 2 },
        { id: 'OP-DEMO-303', machine: 'MQ-DEMO-01', component: 'Base Horizonte', customer: 'Comércio Horizonte', duration: 210, setup: 30, status: 'planned', order: 3 },
        { id: 'OP-DEMO-304', machine: 'MQ-DEMO-01', component: 'Guia Nébula', customer: 'Grupo Boreal', duration: 120, setup: 30, status: 'completed', order: 4, actualOperator: 'Alex Horizonte' },
        { id: 'OP-DEMO-305', machine: 'MQ-DEMO-02', component: 'Cavidade Boreal', customer: 'Grupo Boreal', duration: 180, setup: 30, status: 'planned', order: 1 },
        { id: 'OP-DEMO-306', machine: 'MQ-DEMO-02', component: 'Punção Prisma', customer: 'Distribuidora Prisma', duration: 210, setup: 30, status: 'planned', order: 2 },
        { id: 'OP-DEMO-307', machine: 'MQ-DEMO-02', component: 'Inserto Horizonte', customer: 'Comércio Horizonte', duration: 120, setup: 30, status: 'completed', order: 3, actualOperator: 'Daniela Nébula' },
        { id: 'OP-DEMO-308', machine: 'MQ-DEMO-03', component: 'Base Aurora', customer: 'Cliente Aurora', duration: 150, setup: 30, status: 'planned', order: 1 },
        { id: 'OP-DEMO-309', machine: 'MQ-DEMO-03', component: 'Extrator Boreal', customer: 'Grupo Boreal', duration: 180, setup: 30, status: 'planned', order: 2 },
        { id: 'OP-DEMO-310', machine: 'MQ-DEMO-03', component: 'Cavidade Prisma', customer: 'Distribuidora Prisma', duration: 90, setup: 30, status: 'completed', order: 3, actualOperator: 'Alex Horizonte' },
    ];

    const profiles = {
        planejador: { name: 'Camila Atlas', initials: 'CA', label: 'Planejadora', planner: true },
        geral: { name: 'Visão Geral', initials: 'VG', label: 'Funcionário geral', planner: false },
        funcionario: { name: 'Alex Horizonte', initials: 'AH', label: 'Funcionário', planner: false, employee: 'alex' },
    };

    const history = [
        { label: 'Programação demonstrativa recalculada', description: 'Capacidade combinada e prioridades atualizadas automaticamente.', time: '25/08/2026 · 08:20' },
        { label: 'Guia Nébula concluída', description: 'MQ-DEMO-01 · executada por Alex Horizonte.', time: '25/08/2026 · 07:45' },
        { label: 'Inserto Horizonte concluído', description: 'MQ-DEMO-02 · executado por Daniela Nébula.', time: '24/08/2026 · 16:10' },
    ];

    let selectedRole = 'planejador';
    let activeRole = 'planejador';
    let activePage = 'programacoes';
    let activeMachine = 'MQ-DEMO-01';
    let pendingCompletion = null;
    let nextOperation = 311;
    let draggedOperation = null;

    const element = id => document.getElementById(id);
    const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
    const planner = () => activeRole === 'planejador';
    const machineByCode = code => machines.find(machine => machine.code === code);
    const eligibleFor = code => employees.filter(employee => employee.machines.includes(code));

    function timeLabel(minutes) {
        const day = Math.floor(minutes / (24 * 60));
        const withinDay = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
        return `${day > 0 ? `${25 + day}/08 ` : ''}${String(Math.floor(withinDay / 60)).padStart(2, '0')}:${String(withinDay % 60).padStart(2, '0')}`;
    }

    function dateTimeLabel(minutes) {
        const day = 25 + Math.floor(minutes / (24 * 60));
        const withinDay = minutes % (24 * 60);
        return `${String(day).padStart(2, '0')}/08 ${String(Math.floor(withinDay / 60)).padStart(2, '0')}:${String(withinDay % 60).padStart(2, '0')}`;
    }

    function durationLabel(minutes) {
        const hours = Math.floor(minutes / 60);
        const remainder = minutes % 60;
        return remainder ? `${hours}h${String(remainder).padStart(2, '0')}` : `${hours}h`;
    }

    function employeeAvailable(employee, minute) {
        const clock = minute % (24 * 60);
        if (employee.end > 24 * 60) return clock >= employee.start || clock < employee.end - 24 * 60;
        return clock >= employee.start && clock < employee.end;
    }

    function locateAvailableEmployee(code, candidate) {
        const qualified = eligibleFor(code);
        for (let minute = candidate; minute < candidate + 48 * 60; minute += 15) {
            const available = qualified.find(employee => employeeAvailable(employee, minute));
            if (available) return { employee: available, start: minute };
        }
        return { employee: qualified[0], start: candidate };
    }

    function consumeMachineCapacity(code, start, duration) {
        const qualified = eligibleFor(code);
        let remaining = duration;
        let cursor = start;
        while (remaining > 0 && cursor < start + 72 * 60) {
            if (qualified.some(employee => employeeAvailable(employee, cursor))) remaining -= Math.min(15, remaining);
            cursor += 15;
        }
        return cursor;
    }

    function recalculateMachine(code) {
        const machine = machineByCode(code);
        let cursor = machine.start;
        operations.filter(operation => operation.machine === code && operation.status !== 'completed').sort((a, b) => a.order - b.order).forEach((operation, index) => {
            operation.order = index + 1;
            const availability = locateAvailableEmployee(code, cursor);
            operation.operator = availability.employee?.id ?? null;
            operation.start = availability.start;
            operation.end = consumeMachineCapacity(code, availability.start, operation.setup + operation.duration);
            cursor = operation.end;
        });
    }

    function recalculateAll() {
        machines.forEach(machine => recalculateMachine(machine.code));
    }

    function notify(message, warning = false) {
        const toast = document.createElement('div');
        toast.className = `toast${warning ? ' warning' : ''}`;
        toast.textContent = message;
        element('toast-region').append(toast);
        window.setTimeout(() => toast.remove(), 3600);
    }

    function addHistory(label, description) {
        history.unshift({ label, description, time: '25/08/2026 · agora' });
    }

    function chooseLoginRole(role) {
        selectedRole = role;
        document.querySelectorAll('[data-login-role]').forEach(button => button.classList.toggle('is-selected', button.dataset.loginRole === role));
    }

    document.querySelectorAll('[data-login-role]').forEach(button => button.addEventListener('click', () => chooseLoginRole(button.dataset.loginRole)));

    function applyProfile() {
        const profile = profiles[activeRole];
        element('user-avatar').textContent = profile.initials;
        element('user-name').textContent = profile.name;
        element('user-role').textContent = profile.label;
        document.querySelectorAll('.planner-only').forEach(node => { node.hidden = !profile.planner; });
        element('general-machine-filter').hidden = activeRole !== 'geral';
        element('tasks-description').textContent = activeRole === 'geral'
            ? 'Visão universal de todas as programações, sem registrar ações em nome do funcionário geral.'
            : activeRole === 'funcionario'
                ? 'Acompanhe e conclua somente as operações atribuídas a você.'
                : 'Acompanhe todas as operações demonstrativas disponíveis para a equipe.';
    }

    element('enter-demo').addEventListener('click', () => {
        activeRole = selectedRole;
        element('login-screen').hidden = true;
        element('app-shell').hidden = false;
        applyProfile();
        showPage(activeRole === 'planejador' ? 'programacoes' : 'tarefas');
        notify(`Perfil demonstrativo "${profiles[activeRole].label}" carregado.`);
    });

    element('switch-role').addEventListener('click', () => {
        document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close());
        element('sidebar').classList.remove('is-open');
        element('app-shell').hidden = true;
        element('login-screen').hidden = false;
        chooseLoginRole(activeRole === 'planejador' ? 'geral' : activeRole === 'geral' ? 'funcionario' : 'planejador');
    });

    function showPage(page) {
        const allowed = ['programacoes', 'maquina-detalhe', 'visao-geral', 'maquinas', 'funcionarios', 'historico', 'cadastros', 'tarefas'];
        if (!allowed.includes(page)) return;
        if (!planner() && ['visao-geral', 'maquinas', 'funcionarios', 'historico', 'cadastros'].includes(page)) {
            notify('Este módulo está disponível apenas para o planejador.', true);
            return;
        }
        activePage = page;
        document.querySelectorAll('.page').forEach(panel => {
            panel.hidden = panel.id !== page;
            panel.classList.toggle('active', panel.id === page);
        });
        document.querySelectorAll('.nav-link').forEach(button => button.classList.toggle('active', button.dataset.page === page || page === 'maquina-detalhe' && button.dataset.page === 'programacoes'));
        element('sidebar').classList.remove('is-open');
        if (page === 'programacoes') renderDashboard();
        else if (page === 'maquina-detalhe') renderMachine(activeMachine);
        else if (page === 'visao-geral') renderSchedule();
        else if (page === 'maquinas') renderResources();
        else if (page === 'funcionarios') renderEmployees();
        else if (page === 'historico') renderHistory();
        else if (page === 'cadastros') renderManagement();
        else if (page === 'tarefas') renderTasks();
        window.scrollTo({ top: 0, behavior: 'auto' });
    }

    document.querySelectorAll('[data-page]').forEach(button => button.addEventListener('click', () => showPage(button.dataset.page)));
    document.querySelectorAll('[data-page-link]').forEach(button => button.addEventListener('click', event => {
        event.preventDefault();
        showPage(button.dataset.pageLink);
    }));
    element('menu-toggle').addEventListener('click', () => element('sidebar').classList.toggle('is-open'));

    function machineOperations(code, completed = false) {
        return operations.filter(operation => operation.machine === code && (completed ? operation.status === 'completed' : operation.status !== 'completed')).sort((a, b) => a.order - b.order);
    }

    function machineStats(code) {
        const entries = operations.filter(operation => operation.machine === code);
        const completed = entries.filter(operation => operation.status === 'completed').length;
        const active = entries.filter(operation => operation.status !== 'completed');
        const forecast = Math.max(...active.map(operation => operation.end || 0), 0);
        return { total: entries.length, completed, active: active.length, progress: Math.round(completed / Math.max(entries.length, 1) * 100), forecast, minutes: active.reduce((sum, operation) => sum + operation.duration + operation.setup, 0) };
    }

    function renderDashboard() {
        const completed = operations.filter(operation => operation.status === 'completed').length;
        const progress = Math.round(completed / Math.max(operations.length, 1) * 100);
        const forecast = Math.max(...operations.filter(operation => operation.status !== 'completed').map(operation => operation.end || 0), 0);
        const cards = [
            { icon: '▦', label: 'Máquinas', value: machines.length, detail: `${operations.length} operações no período`, tone: 'metric-primary' },
            { icon: '✓', label: 'Progresso', value: `${progress}%`, detail: `${completed} operações concluídas`, tone: '' },
            { icon: '◷', label: 'Previsão geral', value: dateTimeLabel(forecast).slice(0, 5), detail: `até ${timeLabel(forecast)}`, tone: '' },
            { icon: '△', label: 'Requerem revisão', value: 0, detail: 'Dados fictícios completos', tone: 'metric-warning' },
        ];
        element('dashboard-metrics').innerHTML = cards.map(card => `<article class="metric-card ${card.tone}"><span class="metric-icon">${card.icon}</span><div><small>${card.label}</small><strong>${card.value}</strong><span>${card.detail}</span></div></article>`).join('');
        element('history-chip').textContent = `Histórico: ${history.length}`;
        element('progress-donut').style.setProperty('--progress', progress);
        element('progress-percent').textContent = `${progress}%`;
        element('progress-copy').textContent = `${completed} de ${operations.length}`;
        element('forecast-date').textContent = `${25 + Math.floor(forecast / (24 * 60))} de agosto`;
        element('forecast-time').textContent = timeLabel(forecast);
        renderMachineCards();
    }

    function renderMachineCards() {
        const term = element('machine-search').value.trim().toLowerCase();
        const selected = machines.filter(machine => `${machine.code} ${machine.name}`.toLowerCase().includes(term));
        element('machine-cards').innerHTML = selected.map(machine => {
            const stats = machineStats(machine.code);
            const status = stats.active ? 'Em andamento' : 'Concluída';
            return `<button class="folder-card" type="button" data-open-machine="${machine.code}"><div class="folder-head"><span class="folder-icon">▦</span><span class="status-pill ${stats.active ? 'status-active' : 'status-done'}">${status}</span></div><div class="folder-body"><small>${machine.code}</small><h3>${machine.name}</h3><div class="folder-progress"><span style="width:${stats.progress}%"></span></div><div class="folder-progress-label"><span>${stats.progress}% concluído</span><span>${stats.completed}/${stats.total}</span></div><dl><div><dt>Previsão</dt><dd>${stats.forecast ? dateTimeLabel(stats.forecast) : 'Concluída'}</dd></div><div><dt>Carga prevista</dt><dd>${durationLabel(stats.minutes)}</dd></div></dl></div><footer><span>${eligibleFor(machine.code).length} habilitados</span><b>Ver máquina →</b></footer></button>`;
        }).join('') || '<p>Nenhuma máquina fictícia encontrada.</p>';
    }

    element('machine-search').addEventListener('input', renderMachineCards);

    function operationRow(operation, index, completed) {
        const employee = employees.find(item => item.id === operation.operator);
        const assigned = completed ? operation.actualOperator || 'Executor fictício' : employee?.name || 'A definir';
        const controls = planner() && !completed
            ? `<div class="row-actions"><button class="move-button" type="button" data-move="up" data-id="${operation.id}" aria-label="Aumentar prioridade de ${escapeHtml(operation.component)}"${index === 0 ? ' disabled' : ''}>↑</button><button class="move-button" type="button" data-move="down" data-id="${operation.id}" aria-label="Diminuir prioridade de ${escapeHtml(operation.component)}"${index === machineOperations(operation.machine).length - 1 ? ' disabled' : ''}>↓</button></div>`
            : '<div class="row-actions"></div>';
        return `<article class="operation-row${planner() && !completed ? ' draggable-operation' : ''}" data-operation-id="${operation.id}"${planner() && !completed ? ' draggable="true"' : ''}><span class="sequence">${completed ? '✓' : String(index + 1).padStart(2, '0')}</span><div class="operation-main"><strong>${escapeHtml(operation.component)}</strong><span>${escapeHtml(operation.customer)} · <b>${escapeHtml(assigned)}</b></span></div><div class="operation-date"><small>Início</small><strong>${completed ? '25/08 06:00' : dateTimeLabel(operation.start)}</strong></div><div class="operation-date"><small>${completed ? 'Concluído' : 'Fim'}</small><strong>${completed ? '25/08 08:00' : dateTimeLabel(operation.end)}</strong></div><div class="operation-duration"><small>Duração</small><strong>${durationLabel(operation.duration)}</strong></div>${controls}</article>`;
    }

    function renderMachine(code) {
        activeMachine = code;
        const machine = machineByCode(code);
        if (!machine) return;
        const stats = machineStats(code);
        element('machine-title').textContent = machine.name;
        element('machine-subtitle').textContent = `${machine.code} · ${machine.type} · programação demonstrativa`;
        const summary = [['Operações ativas', stats.active, 'fila da máquina'], ['Concluídas', stats.completed, 'execuções demonstrativas'], ['Carga prevista', durationLabel(stats.minutes), 'inclui setup'], ['Habilitados', eligibleFor(code).length, 'seleção automática']];
        element('machine-summary').innerHTML = summary.map(([label, value, detail]) => `<article><small>${label}</small><strong>${value}</strong><span>${detail}</span></article>`).join('');
        const active = machineOperations(code);
        const completed = machineOperations(code, true);
        element('active-operation-count').textContent = String(active.length);
        element('completed-operation-count').textContent = String(completed.length);
        element('operation-list').innerHTML = active.map((operation, index) => operationRow(operation, index, false)).join('') || '<p>Não há operações fictícias na fila.</p>';
        element('completed-operation-list').innerHTML = completed.map((operation, index) => operationRow(operation, index, true)).join('') || '<p>Nenhuma conclusão fictícia registrada.</p>';
        applyProfile();
    }

    function moveOperation(id, direction) {
        if (!planner()) {
            notify('Somente o planejador pode alterar prioridades.', true);
            return;
        }
        const operation = operations.find(item => item.id === id);
        if (!operation) return;
        const queue = machineOperations(operation.machine);
        const index = queue.findIndex(item => item.id === id);
        const target = index + direction;
        if (target < 0 || target >= queue.length) return;
        [queue[index].order, queue[target].order] = [queue[target].order, queue[index].order];
        recalculateMachine(operation.machine);
        addHistory('Prioridade alterada pelo planejador', `${operation.component} · ${operation.machine} · fila, responsável e prazos recalculados.`);
        renderMachine(operation.machine);
        notify('Prioridade alterada: fila, responsável e prazos recalculados automaticamente.');
    }

    element('operation-list').addEventListener('click', event => {
        const button = event.target.closest('[data-move]');
        if (button) moveOperation(button.dataset.id, button.dataset.move === 'up' ? -1 : 1);
    });

    element('operation-list').addEventListener('dragstart', event => {
        const row = event.target.closest('[data-operation-id]');
        if (!planner() || !row) return;
        draggedOperation = row.dataset.operationId;
        row.classList.add('is-dragging');
        event.dataTransfer.effectAllowed = 'move';
    });
    element('operation-list').addEventListener('dragover', event => {
        if (planner() && draggedOperation) event.preventDefault();
    });
    element('operation-list').addEventListener('drop', event => {
        event.preventDefault();
        const target = event.target.closest('[data-operation-id]');
        if (!planner() || !target || !draggedOperation || target.dataset.operationId === draggedOperation) return;
        const queue = machineOperations(activeMachine);
        const moved = queue.find(item => item.id === draggedOperation);
        const destination = queue.findIndex(item => item.id === target.dataset.operationId);
        const remaining = queue.filter(item => item.id !== draggedOperation);
        remaining.splice(destination, 0, moved);
        remaining.forEach((operation, index) => { operation.order = index + 1; });
        draggedOperation = null;
        recalculateMachine(activeMachine);
        addHistory('Fila reordenada visualmente', `${activeMachine} · nova prioridade calculada pelo sistema.`);
        renderMachine(activeMachine);
        notify('Fila arrastada: operadores e prazos atualizados automaticamente.');
    });
    element('operation-list').addEventListener('dragend', () => {
        draggedOperation = null;
        document.querySelectorAll('.is-dragging').forEach(row => row.classList.remove('is-dragging'));
    });

    document.addEventListener('click', event => {
        const machineButton = event.target.closest('[data-open-machine]');
        if (machineButton) {
            activeMachine = machineButton.dataset.openMachine;
            showPage('maquina-detalhe');
        }
    });
    element('back-to-machines').addEventListener('click', () => showPage('programacoes'));

    function renderSchedule() {
        element('schedule-board').innerHTML = machines.map(machine => {
            const queue = machineOperations(machine.code);
            return `<article class="schedule-machine"><header class="schedule-machine-header"><strong>${machine.code} · ${machine.name}</strong><span>${queue.length} operações</span></header><div class="schedule-track">${queue.map(operation => `<div class="schedule-block"><strong>${escapeHtml(operation.component)}</strong><span>${timeLabel(operation.start)} → ${timeLabel(operation.end)}</span><span>${escapeHtml(employees.find(employee => employee.id === operation.operator)?.name || 'A definir')}</span></div>`).join('') || '<span>Fila concluída.</span>'}</div></article>`;
        }).join('');
    }

    function renderResources() {
        element('resource-grid').innerHTML = machines.map(machine => {
            const stats = machineStats(machine.code);
            return `<article class="machine-resource"><span>${machine.code}</span><h2>${machine.name}</h2><div class="resource-meta"><span>Tipo: <strong>${machine.type}</strong></span><span>Operações ativas: <strong>${stats.active}</strong></span><span>Capacidade: <strong>${eligibleFor(machine.code).length} funcionários habilitados</strong></span></div><div class="qualification-tags">${eligibleFor(machine.code).map(employee => `<span>${employee.name}</span>`).join('')}</div><button class="secondary-button resource-action" type="button" data-open-machine="${machine.code}">Ver programação →</button></article>`;
        }).join('');
    }

    function renderEmployees() {
        element('employee-grid').innerHTML = employees.map(employee => `<article class="employee-card"><span>FUNCIONÁRIO FICTÍCIO</span><h2>${employee.name}</h2><div class="resource-meta"><span>Jornada: <strong>${employee.shift}</strong></span><span>Habilitações: <strong>${employee.machines.length} máquinas</strong></span></div><div class="qualification-tags">${employee.machines.map(code => `<span>${code}</span>`).join('')}</div></article>`).join('');
    }

    function renderHistory() {
        element('history-list').innerHTML = history.map(item => `<article class="history-entry"><i></i><div><strong>${escapeHtml(item.label)}</strong><span>${escapeHtml(item.description)}</span><small>${escapeHtml(item.time)}</small></div></article>`).join('');
    }

    function renderManagement() {
        const sections = [
            { eyebrow: 'CAPACIDADE', title: 'Jornadas semanais', items: employees.map(employee => [employee.name, employee.shift]) },
            { eyebrow: 'CALENDÁRIO', title: 'Exceções', items: [['Ausência demonstrativa', 'Sem ocorrências fictícias programadas']] },
            { eyebrow: 'PROJETOS', title: 'Moldes', items: [['MOLDE-DEMO-A01 · Aurora', 'Cliente Aurora'], ['MOLDE-DEMO-P02 · Prisma', 'Distribuidora Prisma'], ['MOLDE-DEMO-H03 · Horizonte', 'Comércio Horizonte']] },
            { eyebrow: 'PADRÕES', title: 'Tipos de componente', items: [['Inserto demonstrativo', 'Tempo padrão: 3h'], ['Extrator ilustrativo', 'Tempo padrão: 2h30'], ['Base fictícia', 'Tempo padrão: 4h']] },
            { eyebrow: 'COMERCIAL', title: 'Clientes', items: [['Cliente Aurora', 'Ativo · informação fictícia'], ['Distribuidora Prisma', 'Ativo · informação fictícia'], ['Grupo Boreal', 'Ativo · informação fictícia']] },
            { eyebrow: 'RASTREABILIDADE', title: 'Importações', items: [['Base demonstrativa', 'Nenhum arquivo real é importado ou exibido']] },
        ];
        element('management-grid').innerHTML = sections.map(section => `<article class="management-panel"><span class="eyebrow">${section.eyebrow}</span><h2>${section.title}</h2><div class="management-list">${section.items.map(([title, detail]) => `<div class="management-item"><div><strong>${escapeHtml(title)}</strong><small>${escapeHtml(detail)}</small></div><span>Demo</span></div>`).join('')}</div></article>`).join('');
    }

    function visibleTasks() {
        let selected = operations.filter(operation => operation.status !== 'completed');
        if (activeRole === 'funcionario') selected = selected.filter(operation => operation.operator === profiles.funcionario.employee);
        if (activeRole === 'geral' && element('task-machine').value !== 'todas') selected = selected.filter(operation => operation.machine === element('task-machine').value);
        return selected.sort((a, b) => a.start - b.start);
    }

    function renderTasks() {
        const tasks = visibleTasks();
        element('task-list').innerHTML = tasks.map(operation => {
            const assigned = employees.find(employee => employee.id === operation.operator);
            const state = operation.status === 'running' ? 'Em andamento' : operation.status === 'paused' ? 'Pausada' : 'Planejada';
            let buttons;
            if (activeRole === 'geral') buttons = `<button class="primary-button" type="button" data-task-action="general-complete" data-id="${operation.id}">Concluir operação</button><button class="secondary-button" type="button" data-open-machine="${operation.machine}">Ver programação</button>`;
            else if (activeRole === 'funcionario') {
                const primary = operation.status === 'running' ? ['pause', 'Pausar'] : operation.status === 'paused' ? ['resume', 'Retomar'] : ['start', 'Iniciar'];
                buttons = `<button class="secondary-button" type="button" data-task-action="${primary[0]}" data-id="${operation.id}">${primary[1]}</button><button class="primary-button" type="button" data-task-action="complete" data-id="${operation.id}">Concluir</button>`;
            } else buttons = `<button class="primary-button" type="button" data-open-machine="${operation.machine}">Ver máquina</button>`;
            return `<article class="task-card"><span class="status-pill ${operation.status === 'running' ? 'status-active' : 'status-planned'}">${state}</span><h2>${escapeHtml(operation.component)}</h2><p>${escapeHtml(machineByCode(operation.machine).name)} · ${escapeHtml(operation.customer)} · ${escapeHtml(assigned?.name || 'A definir')}</p><dl><div><dt>Início</dt><dd>${dateTimeLabel(operation.start)}</dd></div><div><dt>Fim previsto</dt><dd>${dateTimeLabel(operation.end)}</dd></div></dl><div class="task-buttons">${buttons}</div></article>`;
        }).join('') || '<article class="task-card"><p>Nenhuma tarefa fictícia encontrada para este perfil ou filtro.</p></article>';
    }

    element('apply-task-filter').addEventListener('click', renderTasks);
    element('task-machine').addEventListener('change', renderTasks);

    function openNewOperation(machineCode = activeMachine) {
        if (!planner()) {
            notify('Somente o planejador cadastra operações.', true);
            return;
        }
        element('new-machine').value = machineCode;
        element('operation-dialog').showModal();
    }

    element('new-schedule').addEventListener('click', () => openNewOperation(machines[0].code));
    element('add-machine-operation').addEventListener('click', () => openNewOperation(activeMachine));

    element('operation-form').addEventListener('submit', event => {
        event.preventDefault();
        if (!planner()) return;
        const machine = element('new-machine').value;
        const queue = machineOperations(machine);
        const operation = { id: `OP-DEMO-${nextOperation++}`, machine, component: element('new-component').value, customer: element('new-customer').value, duration: Number(element('new-duration').value), setup: 30, status: 'planned', order: queue.length + 1 };
        operations.push(operation);
        recalculateMachine(machine);
        addHistory('Operação programada automaticamente', `${operation.component} · ${machine} · responsável selecionado pela jornada.`);
        element('operation-dialog').close();
        activeMachine = machine;
        showPage('maquina-detalhe');
        notify(`${operation.component} adicionada: funcionário, horário e prazo calculados automaticamente.`);
    });

    function openCompletion(operation) {
        pendingCompletion = operation.id;
        const qualified = eligibleFor(operation.machine);
        element('completion-title').textContent = `Concluir · ${operation.component}`;
        element('completion-copy').className = 'completion-copy';
        element('completion-copy').textContent = `${operation.machine} · selecione quem realizou a atividade fictícia.`;
        element('completion-employee').innerHTML = qualified.map(employee => `<option value="${employee.id}">${employee.name}</option>`).join('');
        if (operation.operator && qualified.some(employee => employee.id === operation.operator)) element('completion-employee').value = operation.operator;
        element('completion-dialog').showModal();
    }

    function completeOperation(operation, executor) {
        operation.status = 'completed';
        operation.actualOperator = executor.name;
        recalculateMachine(operation.machine);
        addHistory('Operação concluída', `${operation.component} · ${operation.machine} · realizado por ${executor.name}.`);
        renderTasks();
        notify(`${operation.component} concluída por ${executor.name}; fila recalculada.`);
    }

    element('confirm-completion').addEventListener('click', () => {
        const operation = operations.find(item => item.id === pendingCompletion);
        const executor = employees.find(employee => employee.id === element('completion-employee').value);
        if (!operation || !executor) return;
        element('completion-dialog').close();
        completeOperation(operation, executor);
        pendingCompletion = null;
    });

    element('task-list').addEventListener('click', event => {
        const button = event.target.closest('[data-task-action]');
        if (!button) return;
        const operation = operations.find(item => item.id === button.dataset.id);
        if (!operation) return;
        if (button.dataset.taskAction === 'general-complete') {
            if (activeRole !== 'geral') return;
            openCompletion(operation);
            return;
        }
        if (activeRole !== 'funcionario' || operation.operator !== profiles.funcionario.employee) {
            notify('Você só pode executar operações atribuídas ao seu perfil.', true);
            return;
        }
        if (button.dataset.taskAction === 'complete') {
            completeOperation(operation, employees.find(employee => employee.id === profiles.funcionario.employee));
            return;
        }
        const actions = { start: ['running', 'iniciada'], pause: ['paused', 'pausada'], resume: ['running', 'retomada'] };
        const [status, label] = actions[button.dataset.taskAction];
        operation.status = status;
        addHistory(`Operação ${label}`, `${operation.component} · realizada por ${profiles.funcionario.name}.`);
        renderTasks();
        notify(`${operation.component} ${label} apenas nesta demonstração.`);
    });

    document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => element(button.dataset.close).close()));
    document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => {
        if (event.target === dialog) dialog.close();
    }));

    element('simulate-print').addEventListener('click', () => notify('Impressão do cronograma simulada; nenhum documento real foi gerado.'));
    element('simulate-new-machine').addEventListener('click', () => notify('Cadastro de máquina ilustrativo; nenhum recurso real foi alterado.'));
    element('simulate-new-employee').addEventListener('click', () => notify('Cadastro de funcionário ilustrativo; nenhuma pessoa real foi alterada.'));

    element('new-machine').innerHTML = machines.map(machine => `<option value="${machine.code}">${machine.code} · ${machine.name}</option>`).join('');
    element('task-machine').insertAdjacentHTML('beforeend', machines.map(machine => `<option value="${machine.code}">${machine.code} · ${machine.name}</option>`).join(''));
    recalculateAll();
    chooseLoginRole('planejador');
    applyProfile();
})();
