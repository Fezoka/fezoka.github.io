(() => {
    'use strict';

    const app = document.getElementById('application');
    const toastStack = document.getElementById('toast-stack');

    const senses = [
        {
            id: 'seiri',
            name: 'Seiri',
            title: 'Utilização e Descarte',
            color: '#0d6efd',
            icon: '▣',
            groups: [
                ['Mesa de trabalho', ['A mesa contém somente materiais necessários para a atividade atual.', 'Documentos duplicados e rascunhos sem utilidade foram retirados.']],
                ['Armários e equipamentos', ['Materiais estão dentro da validade e em quantidade adequada.', 'Equipamentos sem utilização foram identificados corretamente.']],
            ],
        },
        {
            id: 'seiton',
            name: 'Seiton',
            title: 'Organização',
            color: '#0dcaf0',
            icon: '⌘',
            groups: [
                ['Identificação visual', ['Os materiais possuem locais definidos e identificados.', 'Documentos digitais seguem estrutura padronizada de pastas.']],
                ['Acesso e localização', ['Itens de uso frequente estão acessíveis.', 'A disposição da bancada facilita a execução das atividades.']],
            ],
        },
        {
            id: 'seiso',
            name: 'Seiso',
            title: 'Limpeza',
            color: '#198754',
            icon: '✧',
            groups: [
                ['Estação de trabalho', ['Superfícies, equipamentos e periféricos estão limpos.', 'Os recipientes de descarte estão organizados.']],
                ['Ambiente compartilhado', ['Áreas comuns apresentam condições adequadas de limpeza.', 'A origem de possíveis resíduos é identificada rapidamente.']],
            ],
        },
        {
            id: 'seiketsu',
            name: 'Seiketsu',
            title: 'Padronização',
            color: '#e8ad0c',
            icon: '✓',
            groups: [
                ['Padrões definidos', ['A equipe segue o padrão de identificação estabelecido.', 'Os procedimentos de organização estão disponíveis.']],
                ['Gestão visual', ['Sinalizações e orientações estão atualizadas.', 'A disposição da estação respeita o modelo definido.']],
            ],
        },
        {
            id: 'shitsuke',
            name: 'Shitsuke',
            title: 'Disciplina',
            color: '#dc3545',
            icon: '◎',
            groups: [
                ['Rotina de acompanhamento', ['O checklist é realizado conforme o cronograma.', 'As melhorias anteriores continuam sendo praticadas.']],
                ['Cultura e participação', ['A equipe participa das ações de melhoria contínua.', 'Não conformidades são acompanhadas dentro do prazo.']],
            ],
        },
    ];

    const productiveQuestions = [
        { sense: 'seiri', title: 'Materiais ou componentes', question: 'Existem materiais ou componentes sem utilização na área?', detail: 'Considere matéria-prima, embalagens e componentes demonstrativos.' },
        { sense: 'seiri', title: 'Máquinas e equipamentos', question: 'Os equipamentos disponíveis são necessários para a operação?', detail: 'Observe bancadas, dispositivos e itens de apoio.' },
        { sense: 'seiton', title: 'Identificação visual', question: 'Ferramentas e materiais possuem localização identificada?', detail: 'Verifique locais, etiquetas e marcações demonstrativas.' },
        { sense: 'seiton', title: 'Organização operacional', question: 'A disposição dos recursos facilita a execução das atividades?', detail: 'Observe circulação, acesso e posicionamento.' },
        { sense: 'seiso', title: 'Limpeza e conservação', question: 'Bancadas e equipamentos apresentam boas condições de limpeza?', detail: 'Considere a estação e o entorno da área fictícia.' },
        { sense: 'seiso', title: 'Gestão de resíduos', question: 'Resíduos e materiais descartados estão em locais adequados?', detail: 'Avalie recipientes e rotinas demonstrativas.' },
        { sense: 'seiketsu', title: 'Padrão visual', question: 'A sinalização segue os padrões definidos para a área?', detail: 'Observe cores, identificação e layout fictício.' },
        { sense: 'seiketsu', title: 'Referências do processo', question: 'Instruções e indicadores estão organizados?', detail: 'Considere somente referências visuais demonstrativas.' },
        { sense: 'shitsuke', title: 'Rotina de auditoria', question: 'Os registros são preenchidos conforme o cronograma?', detail: 'Avalie o acompanhamento fictício das auditorias.' },
        { sense: 'shitsuke', title: 'Melhoria contínua', question: 'A equipe acompanha ações corretivas e oportunidades?', detail: 'Observe responsáveis e planos demonstrativos.' },
    ];

    const state = {
        signedIn: false,
        route: 'login',
        adminTab: 'usuarios',
        noticeOpen: false,
        auditCompleted: false,
        productiveCompleted: false,
        auditAnswers: new Map(),
        productiveAnswers: new Map(),
        profile: { name: 'Alex Aurora', email: 'alex.aurora@empresa-exemplo.test', area: 'Núcleo Atlas', initials: 'AA' },
        users: [
            { name: 'Alex Aurora', email: 'alex.aurora@empresa-exemplo.test', role: 'Analista', area: 'Núcleo Atlas', profile: 'Admin' },
            { name: 'Bruna Prisma', email: 'bruna.prisma@empresa-exemplo.test', role: 'Coordenadora', area: 'Núcleo Horizonte', profile: 'Gerente' },
            { name: 'Caio Horizonte', email: 'caio.horizonte@empresa-exemplo.test', role: 'Auditor', area: 'Núcleo Prisma', profile: 'Colaborador' },
            { name: 'Diana Nuvem', email: 'diana.nuvem@empresa-exemplo.test', role: 'Assistente', area: 'Núcleo Atlas', profile: 'Colaborador' },
        ],
        sectors: [
            { name: 'Núcleo Atlas', description: 'Área administrativa demonstrativa', manager: 'Alex Aurora', members: 8 },
            { name: 'Núcleo Horizonte', description: 'Operação ilustrativa de apoio', manager: 'Bruna Prisma', members: 6 },
            { name: 'Núcleo Prisma', description: 'Equipe fictícia de qualidade', manager: 'Caio Horizonte', members: 5 },
        ],
        actions: [
            { id: 1, description: 'Padronizar identificação visual das bancadas', deadline: '18/09/20XX', user: 'Alex Aurora', area: 'Núcleo Atlas', done: false },
            { id: 2, description: 'Reorganizar documentos demonstrativos', deadline: '22/09/20XX', user: 'Bruna Prisma', area: 'Núcleo Horizonte', done: true },
        ],
        notifications: [
            { id: 1, text: 'Faltam 7 dias para a auditoria demonstrativa do Núcleo Atlas.', user: 'Alex Aurora', moment: 'Ciclo 08 · 09:15', read: false },
            { id: 2, text: 'O plano de ação fictício de identificação visual está próximo do prazo.', user: 'Bruna Prisma', moment: 'Ciclo 08 · 10:30', read: false },
            { id: 3, text: 'Auditoria produtiva da Célula Aurora registrada com sucesso.', user: 'Caio Horizonte', moment: 'Ciclo 08 · 14:20', read: false },
        ],
        schedules: [
            { id: 1, date: '12/09/20XX', area: 'Núcleo Atlas', auditor: 'Alex Aurora', shift: 'Comercial', status: 'Executado' },
            { id: 2, date: '18/09/20XX', area: 'Célula Aurora', auditor: 'Bruna Prisma', shift: 'A', status: 'Pendente' },
            { id: 3, date: '24/09/20XX', area: 'Núcleo Prisma', auditor: 'Caio Horizonte', shift: 'B', status: 'Programado' },
        ],
    };

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
    }

    function toast(message) {
        const item = document.createElement('div');
        item.className = 'toast';
        item.textContent = `✓ ${message}`;
        toastStack.append(item);
        window.setTimeout(() => item.remove(), 3400);
    }

    function icon(label) {
        return `<span aria-hidden="true">${label}</span>`;
    }

    function unreadCount() {
        return state.notifications.filter(notification => !notification.read).length;
    }

    function navigate(route, replace = false) {
        const allowed = new Set(['login', 'dashboard', 'produtivo', 'admin', 'perfil']);
        state.route = allowed.has(route) ? route : 'dashboard';

        if (!state.signedIn && state.route !== 'login') {
            state.route = 'login';
        }

        const url = `#${state.route}`;

        if (replace) {
            history.replaceState(null, '', url);
        } else {
            history.pushState(null, '', url);
        }

        render();
        window.scrollTo({ top: 0, behavior: 'auto' });
    }

    function metric(label, value, note, color) {
        return `<article class="metric-card" style="--metric-color:${escapeHtml(color)}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(note)}</small></article>`;
    }

    function badge(value, kind = 'primary') {
        return `<span class="badge badge-${escapeHtml(kind)}">${escapeHtml(value)}</span>`;
    }

    function createTable(columns, rows) {
        return `<div class="table-wrapper"><table class="table"><thead><tr>${columns.map(column => `<th>${escapeHtml(column)}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
    }

    function avatar() {
        return `<a class="avatar" href="#perfil" data-route="perfil" aria-label="Abrir perfil demonstrativo">${escapeHtml(state.profile.initials)}</a>`;
    }

    function header() {
        const notices = unreadCount();
        return `<div class="card"><div class="page-header">${avatar()}<div class="header-title"><h1>Auditoria 5S</h1><small>Ciclo demonstrativo · 08/20XX</small><div class="header-links"><button class="button button-warning button-sm" data-route="admin">${icon('▦')} Painel Admin</button><button class="button button-primary button-sm" data-route="produtivo">${icon('⚙')} 5S Produtivo</button></div></div><div class="header-actions"><button class="button button-outline button-sm notification-button" data-action="toggle-notices" aria-label="Visualizar notificações">${icon('♧')}${notices ? `<span class="notification-badge">${notices}</span>` : ''}</button><button class="button button-danger button-sm" data-action="logout">Sair</button></div></div>${state.noticeOpen ? notificationPopover() : ''}</div>`;
    }

    function notificationPopover() {
        const items = state.notifications.filter(item => !item.read).slice(0, 3);
        return `<div class="alert alert-info"><h3>Notificações demonstrativas</h3>${items.length ? items.map(item => `<p>${escapeHtml(item.text)}</p>`).join('') : '<p>Nenhuma notificação pendente.</p>'}<button class="button button-outline-primary button-sm mt-8" data-route="admin" data-admin-tab="notificacoes">Abrir central de notificações</button></div>`;
    }

    function loginView() {
        return `<section class="auth-layout"><article class="card auth-card"><span class="auth-icon">⛨</span><h1>Gestão de 5S</h1><p>Experiência visual do sistema</p><div class="demo-hint">Os campos abaixo representam um acesso fictício. Nenhum login real é necessário.</div><form id="login-form"><div class="field"><label for="login-email">E-mail corporativo fictício</label><input id="login-email" class="form-control" type="email" value="alex.aurora@empresa-exemplo.test" autocomplete="off"></div><div class="field"><label for="login-password">Senha demonstrativa</label><input id="login-password" class="form-control" type="password" value="Teste@01" autocomplete="off"></div><button class="button button-primary button-block" type="submit">Entrar na demonstração</button></form><p class="soft-note center mt-14">Ambiente estático: nenhuma informação é enviada.</p></article></section>`;
    }

    function dashboardMetrics() {
        return `<div class="metric-grid">${metric('Tendência', '↗ Melhorando', 'Variação fictícia de 8 pontos', '#198754')}${metric('Média Geral', '87%', 'de 45 pontos possíveis', '#0d6efd')}${metric('Última Auditoria', '39 / 45', '86,7% de conformidade', '#198754')}${metric('Áreas Críticas', '1', 'com menos de 60% fictícios', '#dc3545')}</div>`;
    }

    function administrativeQuestions() {
        return senses.flatMap(sense => sense.groups.flatMap(([group, questions]) => questions.map((question, index) => ({ sense, group, question, id: `${sense.id}-${group}-${index}` }))));
    }

    function auditProgress() {
        const total = administrativeQuestions().length;
        const answered = state.auditAnswers.size;
        const percent = Math.round((answered / total) * 100);
        return `<div class="audit-progress"><span>Auditoria demonstrativa: <strong>${answered} / ${total}</strong></span><div class="progress-track" aria-label="Progresso da auditoria"><span style="width:${percent}%"></span></div></div>`;
    }

    function answerGroup(id, question) {
        return `<div class="option-group" role="group" aria-label="Responder: ${escapeHtml(question)}">${[['OK', '#198754'], ['NOK', '#dc3545'], ['N/A', '#6c757d']].map(([value, color]) => `<button type="button" class="option-button${state.auditAnswers.get(id) === value ? ' is-selected' : ''}" style="--option-color:${color}" data-answer-id="${escapeHtml(id)}" data-answer-value="${escapeHtml(value)}" aria-label="${escapeHtml(value)}: ${escapeHtml(question)}">${escapeHtml(value)}</button>`).join('')}</div>`;
    }

    function auditCards() {
        return senses.map((sense, senseIndex) => `<article class="sense-card" style="--sense-color:${sense.color}"><h2>${sense.icon} ${senseIndex + 1}. ${sense.name} <span>(${sense.title})</span></h2><p class="sense-description">Avalie os critérios abaixo considerando a área fictícia ${escapeHtml(state.profile.area)}.</p>${sense.groups.map(([group, questions]) => `<div class="question-group-title">${escapeHtml(group)}</div>${questions.map((question, questionIndex) => { const id = `${sense.id}-${group}-${questionIndex}`; return `<div class="question-row"><span>${escapeHtml(question)}</span>${answerGroup(id, question)}</div>`; }).join('')}`).join('')}</article>`).join('');
    }

    function completedAudit() {
        return `<div class="alert alert-success"><h3>✓ Auditoria Concluída!</h3><p>Os registros demonstrativos deste ciclo foram simulados com sucesso. Nenhuma informação foi enviada.</p></div><div class="metric-grid">${senses.slice(0, 4).map((sense, index) => metric(sense.name, `${[9, 8, 7, 6][index]} / ${[10, 10, 8, 7][index]}`, sense.title, sense.color)).join('')}</div><button class="button button-outline-primary mt-14" data-action="restart-audit">Preencher uma nova auditoria</button>`;
    }

    function auditForm() {
        if (state.auditCompleted) {
            return completedAudit();
        }

        return `<div class="alert alert-info"><h3>ⓘ Critérios de Avaliação do Checklist</h3><ul class="criteria-list"><li><strong>OK (Conforme):</strong> o item atende ao padrão definido.</li><li><strong>NOK (Não Conforme):</strong> o item apresenta desvios e pede uma ação.</li><li><strong>N/A (Não Aplicável):</strong> o item não se aplica à área avaliada.</li></ul></div>${auditProgress()}${auditCards()}<button class="button button-success button-block" data-action="complete-audit">✓ Registrar Auditoria</button>`;
    }

    function dashboardCharts() {
        return `<div class="charts-grid"><article class="card chart-card"><h2>↗ Evolução do Desempenho</h2><canvas id="dashboard-evolution" aria-label="Evolução fictícia das auditorias"></canvas></article><article class="card chart-card"><h2>◎ Perfil da Última Auditoria</h2><canvas id="dashboard-radar" aria-label="Perfil fictício dos cinco sensos"></canvas></article></div>`;
    }

    function actionPlans() {
        const items = state.actions.map(action => `<div class="action-item${action.done ? ' is-complete' : ''}" style="--item-color:${action.done ? '#198754' : '#ffc107'}"><div><strong>${escapeHtml(action.description)}</strong><small>Prazo: ${escapeHtml(action.deadline)} · Status: <strong>${action.done ? 'Concluída' : 'Pendente'}</strong></small></div>${action.done ? badge('Concluída', 'success') : `<button class="button button-outline-success button-sm" data-complete-action="${action.id}">✓ Concluir</button>`}</div>`).join('');
        return `<article class="card"><h2 class="panel-title">☑ Plano de Ação</h2><div class="alert alert-warning"><strong>Área demonstrativa de atenção:</strong> organização da documentação fictícia.</div><form id="action-form" class="action-form"><input class="form-control" name="description" placeholder="O que será feito para melhorar?" required><input class="form-control" type="date" name="deadline" required><button class="button button-primary" type="submit">+ Adicionar</button></form>${items || '<p class="empty-state">Nenhum plano demonstrativo cadastrado.</p>'}</article>`;
    }

    function historyTable() {
        const rows = [
            ['Ciclo 03', '7 / 10', '7 / 10', '6 / 8', '5 / 7', '7 / 10', '32 / 45', '71%'],
            ['Ciclo 04', '8 / 10', '7 / 10', '6 / 8', '6 / 7', '8 / 10', '35 / 45', '78%'],
            ['Ciclo 05', '8 / 10', '8 / 10', '7 / 8', '6 / 7', '8 / 10', '37 / 45', '82%'],
            ['Ciclo 06', '9 / 10', '8 / 10', '7 / 8', '6 / 7', '9 / 10', '39 / 45', '87%'],
        ].map(values => `<tr>${values.map(value => `<td>${escapeHtml(value)}</td>`).join('')}</tr>`);
        return `<article class="card"><h2 class="panel-title">▤ Histórico de Registros</h2>${createTable(['Referência', 'Seiri', 'Seiton', 'Seiso', 'Seiketsu', 'Shitsuke', 'Total', '%'], rows)}</article>`;
    }

    function dashboardView() {
        return `<div class="container">${header()}<article class="card">${dashboardMetrics()}${auditForm()}</article>${dashboardCharts()}${actionPlans()}${historyTable()}</div>`;
    }

    function productiveRating(question, questionIndex) {
        return `<div class="rating-group" role="group" aria-label="Avaliar: ${escapeHtml(question.question)}">${Array.from({ length: 6 }, (_, rating) => { const color = ['#dc3545', '#e3a700', '#6c757d', '#0d6efd', '#0698bc', '#198754'][rating]; return `<button type="button" class="rating-button${state.productiveAnswers.get(questionIndex) === rating ? ' is-selected' : ''}" style="--option-color:${color}" data-productive-question="${questionIndex}" data-productive-value="${rating}" aria-label="Nota ${rating}: ${escapeHtml(question.question)}">${rating}</button>`; }).join('')}</div>`;
    }

    function productiveCards() {
        return senses.map((sense, senseIndex) => { const items = productiveQuestions.map((question, index) => ({ question, index })).filter(({ question }) => question.sense === sense.id); return `<article class="sense-card" style="--sense-color:${sense.color}"><h2>${sense.icon} ${senseIndex + 1}S. ${sense.title}</h2>${items.map(({ question, index }) => `<div class="productive-question-row"><div><strong>${escapeHtml(question.question)}</strong><small><strong>${escapeHtml(question.title)}:</strong> ${escapeHtml(question.detail)}</small></div>${productiveRating(question, index)}</div>`).join('')}</article>`; }).join('');
    }

    function productivePercentage() {
        const answered = state.productiveAnswers.size;
        const total = Array.from(state.productiveAnswers.values()).reduce((sum, value) => sum + value, 0);
        return answered ? Math.round((total / (answered * 5)) * 100) : 0;
    }

    function productiveView() {
        const completed = state.productiveCompleted ? '<div class="alert alert-success"><h3>✓ Auditoria produtiva registrada!</h3><p>Este registro é totalmente fictício e existe apenas nesta demonstração.</p></div>' : '';
        return `<div class="container"><article class="card"><div class="productive-header"><h1>⚙ AUDITORIA 5S PRODUTIVO</h1><button class="button button-outline button-sm" data-route="dashboard">← Voltar</button></div>${completed}<div class="alert alert-info"><h3>ⓘ Critérios de Avaliação e Legenda</h3><div class="scale-legend"><span style="color:#dc3545">0 · Muito ruim</span><span style="color:#a77a00">1 · Ruim</span><span style="color:#6c757d">2 · Regular</span><span style="color:#0d6efd">3 · Bom</span><span style="color:#0698bc">4 · Muito bom</span><span style="color:#198754">5 · Excelente</span></div></div><div class="productive-meta"><div class="field"><label for="productive-area">Área Auditada</label><select id="productive-area" class="form-select"><option>Célula Aurora</option><option>Estação Horizonte</option><option>Setor Prisma</option></select></div><div class="field"><label for="productive-leader">Líder da Área</label><input id="productive-leader" class="form-control" value="Bruna Prisma"></div><div class="field"><label>Auditor</label><input class="form-control" value="${escapeHtml(state.profile.name)}" readonly></div><div class="field"><label>Referência</label><input class="form-control" value="AUD-DEMO-015" readonly></div></div><div class="productive-score"><span>${state.productiveAnswers.size} de ${productiveQuestions.length} critérios avaliados</span><strong>${productivePercentage()}%</strong></div><div class="mt-14">${productiveCards()}</div><button class="button button-success button-block" data-action="complete-productive">✓ Finalizar Auditoria Produtiva</button></article></div>`;
    }

    function profileView() {
        return `<div class="container"><article class="card profile-wrap"><h1>♙ Meu Perfil</h1><div class="avatar profile-avatar">${escapeHtml(state.profile.initials)}</div><div class="demo-hint">Perfil fictício apresentado apenas para demonstrar a interface.</div><form id="profile-form"><div class="field"><label for="profile-name">Nome Completo</label><input id="profile-name" name="name" class="form-control" value="${escapeHtml(state.profile.name)}" required></div><div class="field"><label>E-mail demonstrativo</label><input class="form-control" value="${escapeHtml(state.profile.email)}" readonly></div><div class="field"><label>Setor fictício</label><input class="form-control" value="${escapeHtml(state.profile.area)}" readonly></div><button class="button button-success button-block" type="submit">Salvar Alterações</button><button class="button button-outline button-block mt-8" type="button" data-route="dashboard">Voltar</button></form></article></div>`;
    }

    const adminTabs = [
        ['usuarios', '♙ Usuários'],
        ['setores', '▦ Setores'],
        ['dashboards', '↗ Dashboards'],
        ['planos', '☑ Planos de Ação'],
        ['cronograma', '▤ Cronograma'],
        ['notificacoes', '♧ Notificações'],
    ];

    function adminHeader() {
        return `<article class="card"><div class="admin-top"><div class="admin-title"><h1>▦ Painel Administrativo</h1><small>Sistema 5S · gestão demonstrativa de setores e usuários</small></div><div class="inline-actions"><button class="button button-outline-primary" data-route="dashboard">⌂ Voltar</button><button class="button button-danger" data-action="logout">Sair</button></div></div></article>`;
    }

    function adminMetrics() {
        return `<div class="admin-metric-grid">${metric('Total de Usuários', String(state.users.length), 'Colaboradores fictícios', '#0d6efd')}${metric('Total de Setores', String(state.sectors.length), 'Áreas demonstrativas', '#198754')}${metric('Notificações', String(unreadCount()), 'Pendências simuladas', '#c38d00')}${metric('Maior Pontuação', '42 / 45', 'Ranking demonstrativo', '#dc3545')}</div>`;
    }

    function adminNavigation() {
        return `<nav class="admin-tabs" aria-label="Módulos administrativos">${adminTabs.map(([id, label]) => `<button class="admin-tab${state.adminTab === id ? ' is-active' : ''}" data-admin-tab="${id}">${label}${id === 'notificacoes' && unreadCount() ? ` ${badge(String(unreadCount()), 'danger')}` : ''}</button>`).join('')}</nav>`;
    }

    function usersModule() {
        const rows = state.users.map(user => `<tr><td>${escapeHtml(user.name)}</td><td>${escapeHtml(user.email)}</td><td>${escapeHtml(user.role)}</td><td>${escapeHtml(user.area)}</td><td>${badge(user.profile, user.profile === 'Admin' ? 'danger' : user.profile === 'Gerente' ? 'warning' : 'muted')}</td><td><button class="button button-outline-primary button-sm" data-action="demo-edit-user">✎ Editar</button></td></tr>`);
        return `<article class="card"><div class="module-header"><h2>♙ Gerenciar Usuários</h2><button class="button button-warning button-sm" data-action="general-notice">♧ Aviso Geral</button></div><form id="user-form" class="module-form"><input name="name" class="form-control" placeholder="Nome fictício" required><input name="email" type="email" class="form-control" placeholder="nome@empresa-exemplo.test" required><select name="area" class="form-select">${state.sectors.map(sector => `<option>${escapeHtml(sector.name)}</option>`).join('')}</select><button class="button button-primary" type="submit">+ Adicionar</button></form>${createTable(['Nome', 'E-mail demonstrativo', 'Cargo', 'Setor', 'Função', 'Ações'], rows)}</article>`;
    }

    function sectorsModule() {
        const rows = state.sectors.map(sector => `<tr><td><strong>${escapeHtml(sector.name)}</strong></td><td>${escapeHtml(sector.description)}</td><td>${escapeHtml(sector.manager)}</td><td>${sector.members}</td><td><button class="button button-outline-primary button-sm" data-action="demo-edit-sector">✎ Editar</button></td></tr>`);
        return `<article class="card"><div class="module-header"><h2>▦ Gerenciar Setores</h2></div><form id="sector-form" class="module-form"><input name="name" class="form-control" placeholder="Nome fictício da área" required><input name="description" class="form-control" placeholder="Descrição demonstrativa" required><input name="manager" class="form-control" placeholder="Responsável fictício" required><button class="button button-success" type="submit">+ Criar setor</button></form>${createTable(['Setor', 'Descrição', 'Responsável', 'Participantes', 'Ações'], rows)}</article>`;
    }

    function dashboardModule() {
        const ranking = [
            ['1º', 'Bruna Prisma', 'Núcleo Horizonte', '42 / 45'],
            ['2º', 'Alex Aurora', 'Núcleo Atlas', '39 / 45'],
            ['3º', 'Caio Horizonte', 'Núcleo Prisma', '36 / 45'],
        ].map(values => `<tr>${values.map(value => `<td>${escapeHtml(value)}</td>`).join('')}</tr>`);
        return `<article class="card"><div class="module-header"><h2>↗ Dashboards Gerenciais</h2><span class="soft-note">Todas as métricas são fictícias</span></div><div class="admin-chart-grid"><article class="admin-chart-card"><h3>Usuários por setor</h3><canvas id="admin-doughnut" aria-label="Distribuição fictícia de usuários"></canvas></article><article class="admin-chart-card"><h3>Desempenho por setor</h3><canvas id="admin-bars" aria-label="Desempenho fictício por setor"></canvas></article></div><h3 class="mt-14">🏆 Ranking demonstrativo</h3>${createTable(['Posição', 'Nome fictício', 'Setor', 'Pontuação'], ranking)}</article>`;
    }

    function plansModule() {
        const rows = state.actions.map(action => `<tr><td>Ciclo 08</td><td>${escapeHtml(action.deadline)}</td><td>${escapeHtml(action.user)}</td><td>${escapeHtml(action.area)}</td><td>${escapeHtml(action.description)}</td><td>${badge(action.done ? 'Concluída' : 'Pendente', action.done ? 'success' : 'warning')}</td></tr>`);
        return `<article class="card"><div class="module-header"><h2>☑ Planos de Ação (Geral)</h2></div>${createTable(['Cadastro', 'Prazo limite', 'Responsável', 'Setor', 'Ação proposta', 'Status'], rows)}</article>`;
    }

    function scheduleModule() {
        const rows = state.schedules.map(schedule => `<tr><td>${escapeHtml(schedule.date)}</td><td>${escapeHtml(schedule.area)}</td><td>${escapeHtml(schedule.auditor)}</td><td>${escapeHtml(schedule.shift)}</td><td>${badge(schedule.status, schedule.status === 'Executado' ? 'success' : schedule.status === 'Pendente' ? 'warning' : 'primary')}</td><td><button class="button button-outline-primary button-sm" data-action="demo-edit-schedule">✎ Editar</button></td></tr>`);
        return `<article class="card"><div class="module-header"><h2>▤ Cronograma de Auditorias</h2></div><form id="schedule-form" class="module-form"><input class="form-control" type="date" name="date" required><input class="form-control" name="area" placeholder="Área fictícia" required><input class="form-control" name="auditor" placeholder="Auditor fictício" required><button class="button button-success" type="submit">+ Agendar</button></form>${createTable(['Data prevista', 'Local', 'Auditor', 'Turno', 'Status', 'Ações'], rows)}</article>`;
    }

    function notificationsModule() {
        const items = state.notifications.filter(notification => !notification.read).map(notification => `<article class="notice-item" style="--item-color:#dc3545"><strong>${escapeHtml(notification.text)}</strong><small>♙ ${escapeHtml(notification.user)} · ◷ ${escapeHtml(notification.moment)}</small></article>`).join('');
        return `<article class="card"><div class="module-header"><h2>♧ Notificações Recentes</h2><button class="button button-outline-success button-sm" data-action="mark-all-read">✓ Marcar todas como lidas</button></div>${items || '<p class="empty-state">Nenhuma notificação pendente.</p>'}</article>`;
    }

    function adminView() {
        const moduleView = ({ usuarios: usersModule, setores: sectorsModule, dashboards: dashboardModule, planos: plansModule, cronograma: scheduleModule, notificacoes: notificationsModule })[state.adminTab] ?? usersModule;
        return `<div class="container container-wide">${adminHeader()}${adminMetrics()}${adminNavigation()}${moduleView()}</div>`;
    }

    function canvasContext(id) {
        const canvas = document.getElementById(id);

        if (!canvas) {
            return null;
        }

        const bounds = canvas.getBoundingClientRect();

        if (!bounds.width || !bounds.height) {
            return null;
        }

        const ratio = window.devicePixelRatio || 1;
        canvas.width = Math.round(bounds.width * ratio);
        canvas.height = Math.round(bounds.height * ratio);
        const context = canvas.getContext('2d');
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        context.clearRect(0, 0, bounds.width, bounds.height);
        return { context, width: bounds.width, height: bounds.height };
    }

    function drawLine(id, values, color = '#0d6efd') {
        const chart = canvasContext(id);

        if (!chart) {
            return;
        }

        const { context, width, height } = chart;
        const left = 34;
        const right = width - 12;
        const top = 18;
        const bottom = height - 30;
        const y = value => bottom - ((value - 40) / 60) * (bottom - top);
        context.font = '11px Segoe UI, sans-serif';
        context.fillStyle = '#68717a';

        [40, 60, 80, 100].forEach(value => {
            context.strokeStyle = '#e9ecef';
            context.beginPath();
            context.moveTo(left, y(value));
            context.lineTo(right, y(value));
            context.stroke();
            context.fillText(String(value), 6, y(value) + 4);
        });

        const points = values.map((value, index) => ({ x: left + (index / (values.length - 1)) * (right - left), y: y(value) }));
        context.beginPath();
        points.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y));
        context.lineTo(right, bottom);
        context.lineTo(left, bottom);
        context.closePath();
        context.fillStyle = 'rgba(13, 110, 253, .09)';
        context.fill();
        context.beginPath();
        points.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y));
        context.strokeStyle = color;
        context.lineWidth = 2.4;
        context.stroke();

        points.forEach((point, index) => {
            context.beginPath();
            context.arc(point.x, point.y, 3.5, 0, Math.PI * 2);
            context.fillStyle = color;
            context.fill();
            context.fillStyle = '#68717a';
            context.fillText(`C${index + 1}`, point.x - 7, height - 9);
        });
    }

    function drawRadar(id, values) {
        const chart = canvasContext(id);

        if (!chart) {
            return;
        }

        const { context, width, height } = chart;
        const x = width / 2;
        const y = height / 2;
        const radius = Math.min(width, height) * .33;
        const point = (index, amount) => { const angle = -Math.PI / 2 + (index / 5) * Math.PI * 2; return [x + Math.cos(angle) * amount, y + Math.sin(angle) * amount]; };

        [0.25, 0.5, 0.75, 1].forEach(scale => {
            context.beginPath();
            senses.forEach((_, index) => { const [px, py] = point(index, radius * scale); index ? context.lineTo(px, py) : context.moveTo(px, py); });
            context.closePath();
            context.strokeStyle = '#dfe5e7';
            context.stroke();
        });

        senses.forEach((sense, index) => {
            const [px, py] = point(index, radius);
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(px, py);
            context.strokeStyle = '#dfe5e7';
            context.stroke();
            const [labelX, labelY] = point(index, radius + 18);
            context.fillStyle = '#59636c';
            context.font = '11px Segoe UI, sans-serif';
            context.textAlign = index === 0 ? 'center' : index < 3 ? 'left' : 'right';
            context.fillText(sense.name, labelX, labelY + 3);
        });

        context.beginPath();
        values.forEach((value, index) => { const [px, py] = point(index, radius * (value / 100)); index ? context.lineTo(px, py) : context.moveTo(px, py); });
        context.closePath();
        context.fillStyle = 'rgba(13, 110, 253, .19)';
        context.fill();
        context.strokeStyle = '#0d6efd';
        context.lineWidth = 2;
        context.stroke();
        context.textAlign = 'start';
    }

    function drawDoughnut(id) {
        const chart = canvasContext(id);

        if (!chart) {
            return;
        }

        const { context, width, height } = chart;
        const centerX = width * .38;
        const centerY = height / 2;
        const radius = Math.min(width * .2, height * .36);
        const values = [8, 6, 5];
        const colors = ['#0d6efd', '#198754', '#ffc107'];
        const total = values.reduce((sum, value) => sum + value, 0);
        let angle = -Math.PI / 2;

        values.forEach((value, index) => {
            const next = angle + (value / total) * Math.PI * 2;
            context.beginPath();
            context.arc(centerX, centerY, radius, angle, next);
            context.strokeStyle = colors[index];
            context.lineWidth = 29;
            context.stroke();
            angle = next;
        });

        context.textAlign = 'center';
        context.fillStyle = '#313b44';
        context.font = '700 24px Segoe UI, sans-serif';
        context.fillText(String(total), centerX, centerY + 7);
        context.textAlign = 'start';

        ['Atlas', 'Horizonte', 'Prisma'].forEach((label, index) => {
            const y = centerY - 27 + index * 29;
            context.fillStyle = colors[index];
            context.fillRect(width * .66, y - 8, 9, 9);
            context.fillStyle = '#59636c';
            context.font = '11px Segoe UI, sans-serif';
            context.fillText(label, width * .66 + 15, y);
        });
    }

    function drawBars(id) {
        const chart = canvasContext(id);

        if (!chart) {
            return;
        }

        const { context, width, height } = chart;
        const values = [87, 79, 93];
        const labels = ['Atlas', 'Horizonte', 'Prisma'];
        const colors = ['#0d6efd', '#198754', '#ffc107'];
        const left = 32;
        const bottom = height - 27;
        const usable = height - 48;
        const gap = (width - left - 20) / values.length;
        context.font = '11px Segoe UI, sans-serif';

        values.forEach((value, index) => {
            const barWidth = gap * .43;
            const x = left + gap * index + gap * .28;
            const barHeight = usable * (value / 100);
            context.fillStyle = colors[index];
            context.fillRect(x, bottom - barHeight, barWidth, barHeight);
            context.fillStyle = '#59636c';
            context.textAlign = 'center';
            context.fillText(`${value}%`, x + barWidth / 2, bottom - barHeight - 7);
            context.fillText(labels[index], x + barWidth / 2, bottom + 16);
        });

        context.textAlign = 'start';
    }

    function drawVisibleCharts() {
        if (state.route === 'dashboard') {
            drawLine('dashboard-evolution', [63, 68, 73, 77, 82, 87]);
            drawRadar('dashboard-radar', [88, 76, 94, 83, 91]);
        }

        if (state.route === 'admin' && state.adminTab === 'dashboards') {
            drawDoughnut('admin-doughnut');
            drawBars('admin-bars');
        }
    }

    function render() {
        const view = ({ login: loginView, dashboard: dashboardView, produtivo: productiveView, admin: adminView, perfil: profileView })[state.route] ?? loginView;
        app.innerHTML = view();
        requestAnimationFrame(drawVisibleCharts);
    }

    function updateAuditAnswer(button) {
        const id = button.dataset.answerId;
        state.auditAnswers.set(id, button.dataset.answerValue);
        const row = button.closest('.question-row');
        row.querySelectorAll('.option-button').forEach(option => option.classList.toggle('is-selected', option === button));
        const total = administrativeQuestions().length;
        const answered = state.auditAnswers.size;
        const progress = app.querySelector('.audit-progress');

        if (progress) {
            progress.querySelector('strong').textContent = `${answered} / ${total}`;
            progress.querySelector('.progress-track span').style.width = `${Math.round((answered / total) * 100)}%`;
        }

        if (button.dataset.answerValue === 'NOK') {
            toast('Não conformidade fictícia sinalizada para o plano de ação.');
        }
    }

    function updateProductiveAnswer(button) {
        const index = Number(button.dataset.productiveQuestion);
        const value = Number(button.dataset.productiveValue);
        state.productiveAnswers.set(index, value);
        button.closest('.rating-group').querySelectorAll('.rating-button').forEach(option => option.classList.toggle('is-selected', option === button));
        const score = app.querySelector('.productive-score');

        if (score) {
            score.querySelector('span').textContent = `${state.productiveAnswers.size} de ${productiveQuestions.length} critérios avaliados`;
            score.querySelector('strong').textContent = `${productivePercentage()}%`;
        }
    }

    function handleAction(action, button) {
        if (action === 'logout') {
            state.signedIn = false;
            state.noticeOpen = false;
            navigate('login');
            toast('Sessão demonstrativa encerrada.');
            return;
        }

        if (action === 'toggle-notices') {
            state.noticeOpen = !state.noticeOpen;
            render();
            return;
        }

        if (action === 'complete-audit') {
            if (state.auditAnswers.size < administrativeQuestions().length) {
                toast(`Preencha os ${administrativeQuestions().length} critérios antes de concluir a simulação.`);
                return;
            }

            state.auditCompleted = true;
            render();
            toast('Auditoria administrativa fictícia registrada somente no navegador.');
            return;
        }

        if (action === 'restart-audit') {
            state.auditAnswers.clear();
            state.auditCompleted = false;
            render();
            toast('Nova auditoria demonstrativa iniciada.');
            return;
        }

        if (action === 'complete-productive') {
            if (state.productiveAnswers.size < productiveQuestions.length) {
                toast(`Avalie os ${productiveQuestions.length} itens antes de finalizar a demonstração.`);
                return;
            }

            state.productiveCompleted = true;
            render();
            toast(`Auditoria produtiva fictícia concluída com ${productivePercentage()}%.`);
            return;
        }

        if (action === 'mark-all-read') {
            state.notifications.forEach(notification => { notification.read = true; });
            render();
            toast('Notificações demonstrativas marcadas como lidas.');
            return;
        }

        if (action === 'general-notice') {
            state.notifications.unshift({ id: Date.now(), text: 'Aviso geral fictício: auditorias do novo ciclo estão disponíveis.', user: 'Administração demonstrativa', moment: 'Agora', read: false });
            render();
            toast('Aviso geral simulado. Nenhum e-mail foi enviado.');
            return;
        }

        if (action.startsWith('demo-edit-')) {
            toast('Edição demonstrativa disponível apenas visualmente; nenhum dado real é alterado.');
            return;
        }

        if (button.dataset.completeAction) {
            const item = state.actions.find(entry => entry.id === Number(button.dataset.completeAction));

            if (item) {
                item.done = true;
                render();
                toast('Plano de ação fictício marcado como concluído.');
            }
        }
    }

    app.addEventListener('click', event => {
        const button = event.target.closest('button, a[data-route]');

        if (!button) {
            return;
        }

        if (button.dataset.answerId) {
            updateAuditAnswer(button);
            return;
        }

        if (button.dataset.productiveQuestion !== undefined) {
            updateProductiveAnswer(button);
            return;
        }

        if (button.dataset.adminTab) {
            state.adminTab = button.dataset.adminTab;

            if (button.dataset.route) {
                event.preventDefault();
                navigate(button.dataset.route);
            } else {
                render();
            }

            return;
        }

        if (button.dataset.route) {
            event.preventDefault();
            navigate(button.dataset.route);
            return;
        }

        if (button.dataset.completeAction) {
            handleAction('complete-action', button);
            return;
        }

        if (button.dataset.action) {
            handleAction(button.dataset.action, button);
        }
    });

    app.addEventListener('submit', event => {
        event.preventDefault();
        const form = event.target;
        const fields = new FormData(form);

        if (form.id === 'login-form') {
            state.signedIn = true;
            navigate('dashboard');
            toast('Bem-vindo à experiência demonstrativa do sistema 5S.');
            return;
        }

        if (form.id === 'action-form') {
            state.actions.unshift({ id: Date.now(), description: String(fields.get('description')).trim(), deadline: String(fields.get('deadline')).split('-').reverse().join('/'), user: state.profile.name, area: state.profile.area, done: false });
            render();
            toast('Plano de ação fictício adicionado localmente.');
            return;
        }

        if (form.id === 'user-form') {
            const email = String(fields.get('email')).trim();

            if (!email.endsWith('@empresa-exemplo.test')) {
                toast('Utilize apenas o domínio fictício @empresa-exemplo.test.');
                return;
            }

            state.users.push({ name: String(fields.get('name')).trim(), email, role: 'Colaborador', area: String(fields.get('area')), profile: 'Colaborador' });
            render();
            toast('Usuário fictício adicionado somente nesta demonstração.');
            return;
        }

        if (form.id === 'sector-form') {
            state.sectors.push({ name: String(fields.get('name')).trim(), description: String(fields.get('description')).trim(), manager: String(fields.get('manager')).trim(), members: 0 });
            render();
            toast('Setor fictício criado localmente.');
            return;
        }

        if (form.id === 'schedule-form') {
            state.schedules.push({ id: Date.now(), date: String(fields.get('date')).split('-').reverse().join('/'), area: String(fields.get('area')).trim(), auditor: String(fields.get('auditor')).trim(), shift: 'Comercial', status: 'Programado' });
            render();
            toast('Auditoria fictícia adicionada ao cronograma.');
            return;
        }

        if (form.id === 'profile-form') {
            state.profile.name = String(fields.get('name')).trim();
            state.profile.initials = state.profile.name.split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase() ?? '').join('');
            render();
            toast('Perfil demonstrativo atualizado somente no navegador.');
        }
    });

    window.addEventListener('resize', drawVisibleCharts);
    window.addEventListener('popstate', () => {
        const route = window.location.hash.replace(/^#/, '') || 'login';
        state.route = state.signedIn || route === 'login' ? route : 'login';
        render();
    });

    const initialRoute = window.location.hash.replace(/^#/, '');
    navigate(initialRoute || 'login', true);
})();
