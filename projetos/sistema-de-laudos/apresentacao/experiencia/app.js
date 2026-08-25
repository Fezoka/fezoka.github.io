(() => {
    'use strict';

    const products = [
        { code: 'PROD-DEMO-1001', description: 'Módulo Térmico Aurora' },
        { code: 'PROD-DEMO-1002', description: 'Conjunto Hidráulico Prisma' },
        { code: 'PROD-DEMO-1003', description: 'Painel Digital Horizonte' },
        { code: 'PROD-DEMO-1004', description: 'Unidade de Controle Boreal' },
        { code: 'PROD-DEMO-1005', description: 'Sensor de Operação Nébula' },
    ];

    const profiles = {
        vendas: { name: 'Bruna Prisma', initials: 'BP', label: 'Vendas', caption: 'Perfil comercial · dados inventados' },
        engenharia: { name: 'Alex Horizonte', initials: 'AH', label: 'Engenharia / Técnico', caption: 'Perfil técnico · dados inventados' },
    };

    const cases = [
        { id: 'RMA-DEMO-2048', product: products[0], client: 'Cliente Aurora', returnDate: '2026-08-22', orderDate: '2026-08-10', issue: 'Aquecimento insuficiente', status: 'Em processo', quantity: 1, invoice: 'NF-DEMO-015', complaint: 'Equipamento fictício apresenta aquecimento abaixo do parâmetro demonstrativo.', analysis: 'Teste funcional demonstrativo confirmou a variação de aquecimento.', cause: 'Desvio fictício no conjunto térmico.', action: 'Substituição ilustrativa do componente.', owner: 'Alex Horizonte', notes: 'Acompanhamento inteiramente fictício.', created: '22/08/2026 · 09:15' },
        { id: 'RMA-DEMO-2047', product: products[1], client: 'Distribuidora Prisma', returnDate: '2026-08-21', orderDate: '2026-08-11', issue: 'Vazamento', status: 'Aberto', quantity: 2, invoice: 'NF-DEMO-019', complaint: 'Ocorrência ilustrativa de vazamento no conjunto demonstrativo.', analysis: '', cause: '', action: '', owner: '', notes: '', created: '21/08/2026 · 15:40' },
        { id: 'RMA-DEMO-2046', product: products[2], client: 'Comércio Horizonte', returnDate: '2026-08-20', orderDate: '2026-08-05', issue: 'Display com defeito', status: 'Fechado', quantity: 1, invoice: 'NF-DEMO-012', complaint: 'Painel demonstrativo apresenta falha visual simulada.', analysis: 'Verificação fictícia identificou uma anomalia de exibição.', cause: 'Conector ilustrativo com mau contato.', action: 'Ajuste demonstrativo e novo teste.', owner: 'Alex Horizonte', notes: 'Caso fictício concluído.', created: '20/08/2026 · 11:05' },
        { id: 'RMA-DEMO-2045', product: products[3], client: 'Grupo Boreal', returnDate: '2026-08-19', orderDate: '2026-08-03', issue: 'Não liga', status: 'Em processo', quantity: 1, invoice: 'NF-DEMO-008', complaint: 'Unidade demonstrativa não inicia após comando de acionamento.', analysis: 'Sequência de diagnóstico fictícia em andamento.', cause: 'Aguardando avaliação complementar.', action: '', owner: 'Alex Horizonte', notes: '', created: '19/08/2026 · 14:20' },
        { id: 'RMA-DEMO-2044', product: products[4], client: 'Cliente Aurora', returnDate: '2026-08-18', orderDate: '2026-08-01', issue: 'Não liga', status: 'Aberto', quantity: 3, invoice: 'NF-DEMO-006', complaint: 'Sensor fictício não responde ao acionamento demonstrativo.', analysis: '', cause: '', action: '', owner: '', notes: '', created: '18/08/2026 · 10:10' },
        { id: 'RMA-DEMO-2043', product: products[1], client: 'Distribuidora Prisma', returnDate: '2026-08-15', orderDate: '2026-07-29', issue: 'Vazamento', status: 'Fechado', quantity: 1, invoice: 'NF-DEMO-005', complaint: 'Vazamento ilustrativo identificado durante teste fictício.', analysis: 'Avaliação demonstrativa confirmou desvio na vedação.', cause: 'Ajuste ilustrativo no elemento de vedação.', action: 'Substituição demonstrativa e validação funcional.', owner: 'Alex Horizonte', notes: 'Encerramento fictício.', created: '15/08/2026 · 16:35' },
        { id: 'RMA-DEMO-2042', product: products[3], client: 'Comércio Horizonte', returnDate: '2026-08-13', orderDate: '2026-07-22', issue: 'Barulho excessivo', status: 'Fechado', quantity: 1, invoice: 'NF-DEMO-002', complaint: 'Ruído demonstrativo acima da referência fictícia.', analysis: 'Inspeção ilustrativa identificou desalinhamento.', cause: 'Fixação demonstrativa fora do padrão.', action: 'Correção ilustrativa da fixação.', owner: 'Alex Horizonte', notes: '', created: '13/08/2026 · 08:25' },
    ];

    let selectedLoginRole = 'vendas';
    let activeRole = 'vendas';
    let activePage = 'dashboard';
    let editingId = null;
    let selectedProduct = null;
    let nextProtocol = 2049;
    let attached = false;

    const element = id => document.getElementById(id);
    const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
    const statusClass = status => status === 'Aberto' ? 'open' : status === 'Fechado' ? 'closed' : 'process';
    const dateLabel = value => {
        if (!value) return '—';
        const [year, month, day] = value.split('-');
        return `${day}/${month}/${year}`;
    };

    function notify(message, warning = false) {
        const toast = document.createElement('div');
        toast.className = `toast${warning ? ' warning' : ''}`;
        toast.textContent = message;
        element('toast-region').append(toast);
        window.setTimeout(() => toast.remove(), 3400);
    }

    function setLoginSelection(role) {
        selectedLoginRole = role;
        document.querySelectorAll('[data-login-role]').forEach(button => button.classList.toggle('is-selected', button.dataset.loginRole === role));
    }

    document.querySelectorAll('[data-login-role]').forEach(button => button.addEventListener('click', () => setLoginSelection(button.dataset.loginRole)));

    function applyProfile() {
        const profile = profiles[activeRole];
        const engineering = activeRole === 'engenharia';
        element('sidebar-avatar').textContent = profile.initials;
        element('sidebar-user-name').textContent = profile.name;
        element('sidebar-user-role').textContent = profile.label;
        element('header-role-caption').textContent = profile.caption;
        element('technical-access-tag').textContent = engineering ? 'PERFIL TÉCNICO AUTORIZADO' : 'ACESSO RESTRITO';
        element('technical-lock').hidden = engineering;
        element('technical-fields').hidden = !engineering;
        ['technical-analysis', 'technical-cause', 'technical-action', 'technical-owner'].forEach(id => {
            element(id).disabled = !engineering;
        });
        element('role-permissions-note').textContent = engineering
            ? 'Engenharia pode editar análise, alterar status e gerenciar qualquer laudo.'
            : 'Vendas não altera campos técnicos e exclui somente laudos abertos.';
    }

    function startExperience() {
        activeRole = selectedLoginRole;
        element('login-screen').hidden = true;
        element('system-shell').hidden = false;
        applyProfile();
        resetForm();
        showPage('dashboard');
        notify(`Acesso demonstrativo liberado para ${profiles[activeRole].label}.`);
    }

    element('login-submit').addEventListener('click', startExperience);
    element('switch-profile').addEventListener('click', () => {
        closeDialogs();
        element('sidebar').classList.remove('is-open');
        element('system-shell').hidden = true;
        element('login-screen').hidden = false;
        setLoginSelection(activeRole === 'vendas' ? 'engenharia' : 'vendas');
    });

    function showPage(page) {
        if (!['dashboard', 'novo-laudo', 'lista-laudos'].includes(page)) return;
        activePage = page;
        document.querySelectorAll('.system-page').forEach(panel => {
            const selected = panel.id === page;
            panel.hidden = !selected;
            panel.classList.toggle('is-active', selected);
        });
        document.querySelectorAll('.navigation-button').forEach(button => button.classList.toggle('is-active', button.dataset.page === page));
        element('sidebar').classList.remove('is-open');
        if (page === 'dashboard') requestAnimationFrame(renderDashboard);
        if (page === 'lista-laudos') renderCaseList();
        window.scrollTo({ top: 0, behavior: 'auto' });
    }

    document.querySelectorAll('[data-page]').forEach(button => button.addEventListener('click', () => {
        if (button.dataset.page === 'novo-laudo' && !editingId) resetForm();
        showPage(button.dataset.page);
    }));
    document.querySelectorAll('[data-open-page]').forEach(button => button.addEventListener('click', () => {
        if (button.dataset.openPage === 'novo-laudo') resetForm();
        showPage(button.dataset.openPage);
    }));
    element('menu-toggle').addEventListener('click', () => element('sidebar').classList.toggle('is-open'));

    function actionMarkup(record) {
        const removable = activeRole === 'engenharia' || record.status === 'Aberto';
        return `<div class="row-actions"><button class="action-button" type="button" data-case-action="view" data-id="${escapeHtml(record.id)}" aria-label="Visualizar ${escapeHtml(record.id)}" title="Visualizar">◉</button><button class="action-button" type="button" data-case-action="edit" data-id="${escapeHtml(record.id)}" aria-label="Editar ${escapeHtml(record.id)}" title="Editar">✎</button><button class="action-button report" type="button" data-case-action="report" data-id="${escapeHtml(record.id)}" aria-label="Visualizar laudo ${escapeHtml(record.id)}" title="Laudo PDF">▤</button>${removable ? `<button class="action-button remove" type="button" data-case-action="remove" data-id="${escapeHtml(record.id)}" aria-label="Remover ${escapeHtml(record.id)}" title="Simular exclusão">×</button>` : ''}</div>`;
    }

    function tableRow(record) {
        return `<tr><td class="protocol-code">${escapeHtml(record.id)}</td><td>${escapeHtml(record.product.code)}</td><td>${escapeHtml(record.client)}</td><td>${escapeHtml(dateLabel(record.returnDate))}</td><td>${escapeHtml(record.issue)}</td><td><span class="status-pill ${statusClass(record.status)}">${escapeHtml(record.status)}</span></td><td>${actionMarkup(record)}</td></tr>`;
    }

    function countByStatus() {
        return {
            open: cases.filter(record => record.status === 'Aberto').length,
            process: cases.filter(record => record.status === 'Em processo').length,
            closed: cases.filter(record => record.status === 'Fechado').length,
            total: cases.length,
        };
    }

    function canvasContext(id) {
        const canvas = element(id);
        const rectangle = canvas.getBoundingClientRect();
        const pixelRatio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = Math.max(Math.round(rectangle.width * pixelRatio), 1);
        canvas.height = Math.max(Math.round(rectangle.height * pixelRatio), 1);
        const context = canvas.getContext('2d');
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        return { context, width: rectangle.width, height: rectangle.height };
    }

    function frequency(list) {
        const grouped = new Map();
        list.forEach(value => grouped.set(value, (grouped.get(value) || 0) + 1));
        return [...grouped.entries()].sort((left, right) => right[1] - left[1]).slice(0, 5);
    }

    function drawHorizontalBars(id, entries, color) {
        const { context, width, height } = canvasContext(id);
        const max = Math.max(...entries.map(([, value]) => value), 1);
        const rowHeight = Math.min(35, (height - 13) / Math.max(entries.length, 1));
        const left = Math.min(width * .44, 158);
        context.font = '11px Segoe UI, sans-serif';
        entries.forEach(([label, value], index) => {
            const y = 8 + index * rowHeight;
            context.fillStyle = '#68788b';
            const clipped = label.length > 20 ? `${label.slice(0, 18)}…` : label;
            context.fillText(clipped, 0, y + 12);
            const usableWidth = Math.max(width - left - 25, 0);
            context.fillStyle = '#edf1f6';
            context.fillRect(left, y + 1, usableWidth, 15);
            context.fillStyle = color;
            context.fillRect(left, y + 1, usableWidth * value / max, 15);
            context.fillStyle = '#516071';
            context.fillText(String(value), width - 14, y + 13);
        });
    }

    function drawStatusDonut() {
        const counts = countByStatus();
        const parts = [
            { label: 'Abertos', value: counts.open, color: '#ffc107' },
            { label: 'Em processo', value: counts.process, color: '#0d6efd' },
            { label: 'Fechados', value: counts.closed, color: '#198754' },
        ];
        const { context, width, height } = canvasContext('status-chart');
        const radius = Math.max(Math.min(width, height) * .34, 10);
        const x = width / 2;
        const y = height / 2;
        let angle = -Math.PI / 2;
        parts.forEach(part => {
            const nextAngle = angle + Math.PI * 2 * part.value / Math.max(counts.total, 1);
            context.beginPath();
            context.arc(x, y, radius, angle, nextAngle);
            context.strokeStyle = part.color;
            context.lineWidth = Math.max(radius * .34, 6);
            context.stroke();
            angle = nextAngle;
        });
        context.fillStyle = '#283747';
        context.font = '700 25px Segoe UI, sans-serif';
        context.textAlign = 'center';
        context.fillText(String(counts.total), x, y + 7);
        context.textAlign = 'start';
        element('status-legend').innerHTML = parts.map(part => `<div class="legend-item"><i style="background:${part.color}"></i><span>${part.label}</span><strong>${part.value}</strong></div>`).join('');
    }

    function drawMonthlyBars() {
        const { context, width, height } = canvasContext('monthly-chart');
        const values = [2, 3, 4, 2, 5, cases.length];
        const labels = ['MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO'];
        const max = Math.max(...values, 1);
        const drawableHeight = height - 39;
        const spacing = width / values.length;
        const barWidth = Math.max(spacing * .48, 8);
        values.forEach((value, index) => {
            const x = spacing * index + (spacing - barWidth) / 2;
            const barHeight = drawableHeight * value / max;
            context.fillStyle = index === values.length - 1 ? '#198754' : '#70a4f5';
            context.fillRect(x, drawableHeight - barHeight + 8, barWidth, barHeight);
            context.fillStyle = '#69798b';
            context.font = '10px Segoe UI, sans-serif';
            context.fillText(labels[index], x, height - 9);
            context.fillText(String(value), x + barWidth / 2 - 3, drawableHeight - barHeight + 3);
        });
    }

    function renderDashboard() {
        const counts = countByStatus();
        const metrics = [['Abertos', counts.open, 'open'], ['Em Processo', counts.process, 'process'], ['Fechados', counts.closed, 'closed'], ['Total', counts.total, 'total']];
        element('metric-grid').innerHTML = metrics.map(([label, value, tone]) => `<article class="metric-card ${tone}"><span>${label}</span><strong>${value}</strong></article>`).join('');
        element('recent-cases').innerHTML = cases.slice(0, 5).map(tableRow).join('');
        drawHorizontalBars('issues-chart', frequency(cases.map(record => record.issue)), '#5190ee');
        drawHorizontalBars('clients-chart', frequency(cases.map(record => record.client)), '#45a879');
        drawStatusDonut();
        drawMonthlyBars();
    }

    function renderCaseList() {
        const term = element('case-search').value.trim().toLowerCase();
        const status = element('status-filter').value;
        const filtered = cases.filter(record => {
            const matchesStatus = status === 'todos' || record.status === status;
            const searchable = [record.id, record.product.code, record.product.description, record.client, record.issue].join(' ').toLowerCase();
            return matchesStatus && searchable.includes(term);
        });
        element('all-cases').innerHTML = filtered.length
            ? filtered.map(tableRow).join('')
            : '<tr><td colspan="7">Nenhum laudo fictício encontrado para este filtro.</td></tr>';
        element('case-count').textContent = `${filtered.length} ${filtered.length === 1 ? 'laudo demonstrativo' : 'laudos demonstrativos'}`;
    }

    element('case-search').addEventListener('input', renderCaseList);
    element('status-filter').addEventListener('change', renderCaseList);

    function renderProductList() {
        const term = element('product-search').value.trim().toLowerCase();
        const filtered = products.filter(product => `${product.code} ${product.description}`.toLowerCase().includes(term));
        element('product-list').innerHTML = filtered.length
            ? filtered.map(product => `<button class="product-item" type="button" data-product-code="${escapeHtml(product.code)}"><span><strong>${escapeHtml(product.code)}</strong><small>${escapeHtml(product.description)}</small></span><i>Selecionar →</i></button>`).join('')
            : '<p>Nenhum produto fictício encontrado.</p>';
    }

    element('select-product').addEventListener('click', () => {
        element('product-search').value = '';
        renderProductList();
        element('product-dialog').showModal();
    });
    element('product-search').addEventListener('input', renderProductList);
    element('product-list').addEventListener('click', event => {
        const button = event.target.closest('[data-product-code]');
        if (!button) return;
        selectedProduct = products.find(product => product.code === button.dataset.productCode);
        element('product-select').value = selectedProduct.code;
        element('selected-product-label').value = `${selectedProduct.code} · ${selectedProduct.description}`;
        element('product-dialog').close();
    });

    element('issue-pattern').addEventListener('change', () => {
        const custom = element('issue-pattern').value === 'Outro/Novo';
        element('custom-issue-label').hidden = !custom;
        element('custom-issue').hidden = !custom;
        element('custom-issue').required = custom;
        if (!custom) element('custom-issue').value = '';
    });

    element('simulate-attachment').addEventListener('click', () => {
        attached = true;
        element('attachment-preview').hidden = false;
        notify('Evidência demonstrativa simulada; nenhum arquivo foi enviado.');
    });

    function resetForm() {
        editingId = null;
        selectedProduct = null;
        attached = false;
        element('case-form').reset();
        element('quantity').value = '1';
        element('selected-product-label').value = '';
        element('product-select').value = '';
        element('order-date').value = '2026-08-25';
        element('return-date').value = '2026-08-25';
        element('technical-owner').value = 'Alex Horizonte';
        element('attachment-preview').hidden = true;
        element('custom-issue-label').hidden = true;
        element('custom-issue').hidden = true;
        element('custom-issue').required = false;
        element('form-heading').textContent = 'Criar Novo Laudo';
        element('cancel-edit').hidden = true;
        element('save-case').textContent = 'Salvar laudo demonstrativo';
    }

    element('cancel-edit').addEventListener('click', () => {
        resetForm();
        showPage('lista-laudos');
    });

    function editCase(id) {
        const record = cases.find(item => item.id === id);
        if (!record) return;
        resetForm();
        editingId = id;
        selectedProduct = record.product;
        element('product-select').value = record.product.code;
        element('selected-product-label').value = `${record.product.code} · ${record.product.description}`;
        element('quantity').value = String(record.quantity);
        element('invoice').value = record.invoice || '';
        element('client-name').value = record.client;
        element('order-date').value = record.orderDate || '';
        element('return-date').value = record.returnDate || '';
        const knownIssue = Array.from(element('issue-pattern').options).some(option => option.value === record.issue);
        element('issue-pattern').value = knownIssue ? record.issue : 'Outro/Novo';
        element('custom-issue-label').hidden = knownIssue;
        element('custom-issue').hidden = knownIssue;
        element('custom-issue').required = !knownIssue;
        element('custom-issue').value = knownIssue ? '' : record.issue;
        element('complaint').value = record.complaint;
        element('technical-analysis').value = record.analysis || '';
        element('technical-cause').value = record.cause || '';
        element('technical-action').value = record.action || '';
        element('technical-owner').value = record.owner || 'Alex Horizonte';
        element('notes').value = record.notes || '';
        element('form-heading').textContent = `Editar Laudo · ${id}`;
        element('save-case').textContent = 'Salvar alterações demonstrativas';
        element('cancel-edit').hidden = false;
        closeDialogs();
        showPage('novo-laudo');
    }

    element('case-form').addEventListener('submit', event => {
        event.preventDefault();
        if (!selectedProduct) {
            notify('Selecione um produto fictício para continuar.', true);
            element('select-product').focus();
            return;
        }

        const existing = editingId ? cases.find(record => record.id === editingId) : null;
        const issue = element('issue-pattern').value === 'Outro/Novo' ? element('custom-issue').value.trim() : element('issue-pattern').value;
        const technical = activeRole === 'engenharia';
        const record = {
            id: existing?.id ?? `RMA-DEMO-${nextProtocol++}`,
            product: selectedProduct,
            client: element('client-name').value.trim(),
            returnDate: element('return-date').value,
            orderDate: element('order-date').value,
            issue,
            status: existing?.status ?? 'Aberto',
            quantity: Number(element('quantity').value),
            invoice: element('invoice').value.trim(),
            complaint: element('complaint').value.trim(),
            analysis: technical ? element('technical-analysis').value.trim() : existing?.analysis ?? '',
            cause: technical ? element('technical-cause').value.trim() : existing?.cause ?? '',
            action: technical ? element('technical-action').value.trim() : existing?.action ?? '',
            owner: technical ? element('technical-owner').value.trim() : existing?.owner ?? '',
            notes: element('notes').value.trim(),
            attached,
            created: existing?.created ?? '25/08/2026 · agora',
        };

        if (existing) cases.splice(cases.indexOf(existing), 1, record);
        else cases.unshift(record);

        const message = existing ? `Laudo ${record.id} atualizado apenas nesta demonstração.` : `Protocolo ${record.id} criado apenas nesta demonstração.`;
        resetForm();
        renderCaseList();
        showPage('lista-laudos');
        notify(message);
    });

    function detailsRows(record) {
        const items = [
            ['Protocolo', record.id], ['Status', record.status], ['Cliente fictício', record.client], ['Código fictício', record.product.code],
            ['Produto fictício', record.product.description], ['Problema', record.issue], ['Nota demonstrativa', record.invoice || '—'], ['Data de devolução', dateLabel(record.returnDate)],
        ];
        return items.map(([label, value]) => `<div class="detail-field"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('');
    }

    function showDetails(id) {
        const record = cases.find(item => item.id === id);
        if (!record) return;
        const technical = record.analysis
            ? `<h3 class="detail-section-title">Parecer técnico</h3><p class="detail-description"><strong>Análise:</strong> ${escapeHtml(record.analysis)}</p><p class="detail-description"><strong>Causa:</strong> ${escapeHtml(record.cause || 'Em avaliação')}</p><p class="detail-description"><strong>Ação:</strong> ${escapeHtml(record.action || 'Em definição')}</p><p class="detail-description"><strong>Responsável:</strong> ${escapeHtml(record.owner || 'Não definido')}</p>`
            : '<h3 class="detail-section-title">Parecer técnico</h3><p class="detail-description">Este atendimento ainda aguarda avaliação da engenharia fictícia.</p>';
        element('details-title').textContent = `Laudo · ${record.id}`;
        element('details-content').innerHTML = `<div class="detail-grid">${detailsRows(record)}</div><h3 class="detail-section-title">Reclamação do cliente</h3><p class="detail-description">${escapeHtml(record.complaint)}</p>${technical}<h3 class="detail-section-title">Linha do tempo demonstrativa</h3><div class="detail-timeline"><div>Solicitação comercial registrada<small>${escapeHtml(record.created)}</small></div>${record.status !== 'Aberto' ? '<div>Engenharia iniciou a avaliação<small>Atualização fictícia do processo</small></div>' : ''}${record.status === 'Fechado' ? '<div>Parecer concluído e atendimento encerrado<small>Fechamento exclusivamente demonstrativo</small></div>' : ''}</div>`;
        const statusActions = activeRole === 'engenharia'
            ? `<button class="button button-outline" type="button" data-update-status="Em processo" data-id="${escapeHtml(record.id)}">Iniciar análise</button><button class="button button-outline" type="button" data-update-status="Fechado" data-id="${escapeHtml(record.id)}">Concluir caso</button>`
            : '';
        element('details-actions').innerHTML = `${statusActions}<button class="button button-outline" type="button" data-case-action="edit" data-id="${escapeHtml(record.id)}">Editar</button><button class="button button-primary" type="button" data-case-action="report" data-id="${escapeHtml(record.id)}">Visualizar laudo</button>`;
        element('details-dialog').showModal();
    }

    function updateStatus(id, status) {
        if (activeRole !== 'engenharia') {
            notify('Somente a engenharia pode atualizar o status técnico.', true);
            return;
        }
        const record = cases.find(item => item.id === id);
        if (!record) return;
        record.status = status;
        if (status !== 'Aberto' && !record.owner) record.owner = 'Alex Horizonte';
        element('details-dialog').close();
        if (activePage === 'dashboard') renderDashboard();
        else renderCaseList();
        notify(`${record.id} atualizado para "${status}" nesta simulação.`);
    }

    function removeCase(id) {
        const record = cases.find(item => item.id === id);
        if (!record) return;
        if (activeRole === 'vendas' && record.status !== 'Aberto') {
            notify('Vendas só pode remover laudos que ainda estão abertos.', true);
            return;
        }
        cases.splice(cases.indexOf(record), 1);
        if (activePage === 'dashboard') renderDashboard();
        else renderCaseList();
        notify(`${record.id} removido apenas da simulação temporária.`);
    }

    function showReport(id) {
        const record = cases.find(item => item.id === id);
        if (!record) return;
        if (element('details-dialog').open) element('details-dialog').close();
        const rows = ([label, value]) => `<div class="report-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
        const identification = [['Protocolo fictício', record.id], ['Cliente fictício', record.client], ['Código fictício', record.product.code], ['Produto fictício', record.product.description], ['Nota demonstrativa', record.invoice || '—']];
        const occurrence = [['Problema', record.issue], ['Quantidade ilustrativa', String(record.quantity)], ['Status demonstrativo', record.status]];
        const analysis = [['Análise', record.analysis || 'Aguardando engenharia'], ['Causa', record.cause || 'Em avaliação'], ['Ação', record.action || 'Em definição'], ['Responsável fictício', record.owner || 'Não definido']];
        element('report-content').innerHTML = `<header class="report-paper-header"><div><span>EMPRESA EXEMPLO</span><strong>LAUDO TÉCNICO DE GARANTIA</strong></div><i>${escapeHtml(record.id)}</i></header><section class="report-section"><h3>Identificação do atendimento</h3>${identification.map(rows).join('')}</section><section class="report-section"><h3>Descrição da ocorrência</h3>${occurrence.map(rows).join('')}<p class="detail-description">${escapeHtml(record.complaint)}</p></section><section class="report-section"><h3>Parecer técnico</h3>${analysis.map(rows).join('')}</section><footer>DOCUMENTO DEMONSTRATIVO · SEM VALIDADE OPERACIONAL · DADOS TOTALMENTE FICTÍCIOS</footer>`;
        element('simulate-pdf').dataset.id = record.id;
        element('report-dialog').showModal();
    }

    element('simulate-pdf').addEventListener('click', event => {
        notify(`PDF de ${event.currentTarget.dataset.id} simulado; nenhum documento real foi gerado.`);
    });

    document.addEventListener('click', event => {
        const statusButton = event.target.closest('[data-update-status]');
        if (statusButton) {
            updateStatus(statusButton.dataset.id, statusButton.dataset.updateStatus);
            return;
        }
        const actionButton = event.target.closest('[data-case-action]');
        if (!actionButton) return;
        const { caseAction, id } = actionButton.dataset;
        if (caseAction === 'view') showDetails(id);
        else if (caseAction === 'edit') editCase(id);
        else if (caseAction === 'report') showReport(id);
        else if (caseAction === 'remove') removeCase(id);
    });

    function closeDialogs() {
        document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close());
    }

    document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => element(button.dataset.closeDialog).close()));
    document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => {
        if (event.target === dialog) dialog.close();
    }));

    element('export-csv').addEventListener('click', () => {
        notify('Exportação CSV simulada: nenhum arquivo ou informação real foi baixado.');
    });

    window.addEventListener('resize', () => {
        if (!element('system-shell').hidden && activePage === 'dashboard') renderDashboard();
    });

    setLoginSelection('vendas');
    applyProfile();
    resetForm();
})();
