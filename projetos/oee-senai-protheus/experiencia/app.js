(() => {
    'use strict';

    const format = value => Number(value).toLocaleString('pt-BR');
    const definitions = {
        green: { name: 'Célula Verde', color: '#27bd82', soft: '#eaf9f2' },
        red: { name: 'Célula Vermelha', color: '#e85d67', soft: '#fff0f0' },
        purple: { name: 'Célula Roxa', color: '#8257e6', soft: '#f2edff' },
    };

    function createMachine(cell, number, product, code, status, details) {
        return {
            cell, id: `MQ-DEMO-${number}`, product, code: `PROD-DEMO-${code}`, order: `OP-DEMO-${number}01`, mold: `MOLDE-DEMO-${code}`, status,
            planned: details.planned, produced: details.produced, shift: details.shift, standardCavity: 8, cavities: details.cavities,
            cycleOp: details.cycleOp, cycleReal: details.cycleReal, availability: details.availability, performance: details.performance,
            quality: details.quality, scrap: details.scrap, pace: details.pace, event: details.event, operator: details.operator,
            maintenance: status === 'maintenance', alert: details.alert || '',
            history: [
                { time: '10:42', type: status === 'running' ? 'productive' : 'stop', text: status === 'running' ? 'Produção confirmada pelo sensor' : details.event, person: details.operator },
                { time: '09:18', type: 'productive', text: 'Evento produtivo recebido do ERP', person: details.operator },
                { time: '08:10', type: 'productive', text: 'Ordem fictícia sincronizada', person: 'Sistema demonstrativo' },
            ],
            scraps: details.scrap ? [{ time: '09:36', quantity: Math.min(details.scrap, 9), reason: 'Ajuste dimensional fictício', person: details.operator }] : [],
        };
    }

    const machines = [
        createMachine('green', 11, 'Conjunto Aurora', 501, 'running', { planned: 1800, produced: 1320, shift: 820, cavities: 8, cycleOp: 28, cycleReal: 29, availability: 95, performance: 94, quality: 98, scrap: 9, pace: 965, event: 'Produção ativa', operator: 'Alex Horizonte' }),
        createMachine('green', 12, 'Tampa Prisma', 502, 'running', { planned: 2200, produced: 1640, shift: 1020, cavities: 4, cycleOp: 31, cycleReal: 33, availability: 92, performance: 88, quality: 97, scrap: 15, pace: 436, event: 'Produção ativa', operator: 'Bruna Prisma' }),
        createMachine('green', 13, 'Base Horizonte', 503, 'stopped', { planned: 1400, produced: 390, shift: 0, cavities: 6, cycleOp: 32, cycleReal: 0, availability: 56, performance: 0, quality: 96, scrap: 3, pace: 0, event: 'Aguardando ajuste fictício', operator: 'Caio Boreal', alert: 'OP ativa sem pulsos recentes. Confirme se a máquina voltou a produzir.' }),
        createMachine('green', 14, 'Capa Boreal', 504, 'maintenance', { planned: 1600, produced: 210, shift: 0, cavities: 8, cycleOp: 26, cycleReal: 0, availability: 0, performance: 0, quality: 0, scrap: 0, pace: 0, event: 'Monitor de produção em manutenção', operator: 'Dani Aurora' }),
        createMachine('red', 21, 'Suporte Nébula', 601, 'running', { planned: 1900, produced: 1120, shift: 690, cavities: 6, cycleOp: 30, cycleReal: 32, availability: 91, performance: 92, quality: 98, scrap: 12, pace: 675, event: 'Produção ativa', operator: 'Eva Nébula' }),
        createMachine('red', 22, 'Anel Atlas', 602, 'running', { planned: 2100, produced: 1450, shift: 840, cavities: 8, cycleOp: 25, cycleReal: 29, availability: 88, performance: 86, quality: 96, scrap: 22, pace: 992, event: 'Produção ativa', operator: 'Fábio Atlas', alert: 'Produção física detectada durante parada administrativa simulada.' }),
        createMachine('red', 23, 'Painel Delta', 603, 'waiting', { planned: 1700, produced: 510, shift: 0, cavities: 4, cycleOp: 33, cycleReal: 0, availability: 72, performance: 0, quality: 99, scrap: 2, pace: 0, event: 'Aguardando próxima ordem fictícia', operator: 'Gabi Delta' }),
        createMachine('red', 24, 'Módulo Solar', 604, 'running', { planned: 1500, produced: 1060, shift: 590, cavities: 6, cycleOp: 27, cycleReal: 28, availability: 94, performance: 90, quality: 97, scrap: 8, pace: 771, event: 'Produção ativa', operator: 'Hugo Solar' }),
        createMachine('purple', 31, 'Estrutura Órion', 701, 'running', { planned: 2400, produced: 1740, shift: 920, cavities: 8, cycleOp: 24, cycleReal: 25, availability: 97, performance: 96, quality: 99, scrap: 5, pace: 1152, event: 'Produção ativa', operator: 'Iris Órion' }),
        createMachine('purple', 32, 'Vedação Lumen', 702, 'running', { planned: 1750, produced: 1280, shift: 750, cavities: 4, cycleOp: 29, cycleReal: 30, availability: 94, performance: 92, quality: 98, scrap: 7, pace: 480, event: 'Produção ativa', operator: 'João Lumen' }),
        createMachine('purple', 33, 'Cobertura Eclipse', 703, 'maintenance', { planned: 1300, produced: 180, shift: 0, cavities: 6, cycleOp: 31, cycleReal: 0, availability: 0, performance: 0, quality: 0, scrap: 0, pace: 0, event: 'Monitor de produção em manutenção', operator: 'Lia Eclipse' }),
        createMachine('purple', 34, 'Elemento Vértice', 704, 'running', { planned: 1650, produced: 950, shift: 510, cavities: 6, cycleOp: 28, cycleReal: 30, availability: 90, performance: 88, quality: 97, scrap: 11, pace: 720, event: 'Produção ativa', operator: 'Maya Vértice' }),
    ];

    const state = { view: 'monitoramento', cell: 'green', chartCell: 'green', chartMachine: 'all', historyCell: 'all', reportCell: 'green', tv: false, period: 'dia', readings: [], nextReading: 1, module: 'monitoramento' };

    function cellMachines(key, includeMaintenance = true) {
        return machines.filter(machine => machine.cell === key && (includeMaintenance || !machine.maintenance));
    }
    function machineOee(machine) {
        if (machine.maintenance || machine.status !== 'running') return 0;
        return Math.round(machine.availability * machine.performance * machine.quality / 10000);
    }
    function correctedTarget(machine) {
        return Math.round(3600 / machine.cycleOp * machine.cavities);
    }
    function statusValues(machine) {
        if (machine.maintenance) return { label: 'Manutenção', color: '#919cad', soft: '#eff2f5' };
        if (machine.status === 'running') return { label: 'Produzindo', color: '#27bd82', soft: '#eaf9f2' };
        if (machine.status === 'waiting') return { label: 'Aguardando', color: '#e9a43b', soft: '#fff7e7' };
        return { label: 'Parada', color: '#e85d67', soft: '#fff0f0' };
    }
    function totals(key) {
        const all = cellMachines(key);
        const valid = all.filter(machine => !machine.maintenance);
        const running = valid.filter(machine => machine.status === 'running');
        return {
            machines: all.length, running: running.length, shift: valid.reduce((sum, machine) => sum + machine.shift, 0),
            alerts: valid.filter(machine => machine.alert).length, oee: running.length ? Math.round(running.reduce((sum, machine) => sum + machineOee(machine), 0) / running.length) : 0,
            scrap: valid.reduce((sum, machine) => sum + machine.scrap, 0), maintenance: all.filter(machine => machine.maintenance), produced: valid.reduce((sum, machine) => sum + machine.produced, 0),
        };
    }
    function tabHtml(selected, attribute) {
        return Object.entries(definitions).map(([key, cell]) => `<button class="cell-tab${selected === key ? ' is-active' : ''}" type="button" data-${attribute}="${key}" style="--cell-color:${cell.color};--cell-soft:${cell.soft}">● ${cell.name}</button>`).join('');
    }
    function renderSelectors() {
        const options = Object.entries(definitions).map(([key, cell]) => `<option value="${key}">${cell.name}</option>`).join('');
        document.getElementById('chart-cell').innerHTML = options;
        document.getElementById('history-cell').innerHTML = '<option value="all">Todas as células</option>' + options;
    }
    function metricRing(label, value, color) {
        return `<div class="ring-item"><div class="metric-ring" style="--ring-value:${value};--ring-color:${color}"><strong>${value}%</strong></div><span>${label}</span></div>`;
    }
    function machineCard(machine) {
        const status = statusValues(machine);
        const style = `--status-color:${status.color};--status-soft:${status.soft}`;
        const header = `<div class="machine-card-header"><div class="machine-identity"><strong>${machine.id}</strong><small>${definitions[machine.cell].name} · coletor fictício</small></div><div class="machine-status"><span class="status-badge">${status.label}</span><small>${machine.maintenance ? 'Leitura indisponível' : 'Última leitura: agora'}</small></div></div>`;
        if (machine.maintenance) return `<article class="machine-card" style="${style}">${header}<div class="maintenance-panel"><strong>Monitor de produção em manutenção</strong><p>Sem leitura confiável. Este equipamento não participa das médias, dos gráficos nem do relatório de produção.</p><button class="maintenance-control admin-only" type="button" data-maintenance="${machine.id}">Restabelecer monitor fictício</button></div></article>`;
        const limit = state.tv ? 2 : 3;
        const history = machine.history.slice(0, limit).map(event => `<div class="history-item"><span>${event.text} · ${event.person.split(' ')[0]}</span><span>${event.time}</span></div>`).join('');
        const scraps = machine.scraps.slice(0, state.tv ? 1 : 2).map(scrap => `<div class="scrap-row">Refugo fictício · ${scrap.quantity} pç · ${scrap.reason} · ${scrap.time}</div>`).join('');
        const ratio = Math.min(100, Math.round(machine.produced / machine.planned * 100));
        return `<article class="machine-card" style="${style}">${header}<div class="machine-content"><div class="machine-product"><div><strong>${machine.product}</strong><span>${machine.code} · ${machine.order}</span></div><div><strong>${machine.cavities}/${machine.standardCavity} cav.</strong><span>${machine.mold}</span></div></div><div class="machine-rings">${metricRing('OEE', machineOee(machine), '#248af0')}${metricRing('Dispon.', machine.availability, '#27bd82')}${metricRing('Perform.', machine.performance, '#e9a43b')}${metricRing('Qualid.', machine.quality, '#8257e6')}</div><div class="machine-stats"><div><span>Peças turno</span><strong>${format(machine.shift)}</strong></div><div><span>Acumulado OP</span><strong>${format(machine.produced)}</strong></div><div><span>Ritmo / hora</span><strong>${format(machine.pace)}</strong></div><div><span>Refugo</span><strong>${format(machine.scrap)}</strong></div></div><div class="order-progress"><div class="progress-label"><span>${machine.order}</span><strong>${ratio}% · ${format(machine.produced)} / ${format(machine.planned)}</strong></div><div class="progress-track"><span style="width:${ratio}%"></span></div></div><div class="machine-history"><strong>Eventos e apontamentos recentes</strong>${history}${scraps}</div>${machine.alert ? `<div class="machine-alert">⚠ ${machine.alert}</div>` : ''}</div></article>`;
    }
    function renderMonitor() {
        const cell = definitions[state.cell];
        const summary = totals(state.cell);
        document.getElementById('monitor-cell-name').textContent = `— ${cell.name}`;
        document.getElementById('monitor-cells').innerHTML = tabHtml(state.cell, 'cell');
        document.getElementById('monitor-kpis').innerHTML = [
            ['MÁQUINAS DA CÉLULA', summary.machines, `${summary.maintenance.length} monitor(es) em manutenção`],
            ['PRODUZINDO AGORA', summary.running, 'confirmado por pulsos fictícios'],
            ['PEÇAS NO TURNO', format(summary.shift), 'produção física demonstrativa'],
            ['ALERTAS OPERACIONAIS', summary.alerts, 'divergências ERP × sensor'],
            ['OEE MÉDIO VÁLIDO', `${summary.oee}%`, 'manutenção excluída'],
        ].map(([label, value, note]) => `<article class="kpi-card"><span>${label}</span><strong>${value}</strong><small>${note}</small></article>`).join('');
        document.getElementById('machine-grid').innerHTML = cellMachines(state.cell).map(machineCard).join('');
    }

    function showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('is-visible');
        window.clearTimeout(showToast.timer);
        showToast.timer = window.setTimeout(() => toast.classList.remove('is-visible'), 3000);
    }
    function simulatePulse(machine = cellMachines(state.cell).find(item => item.status === 'running')) {
        if (!machine) return showToast('Nenhuma máquina fictícia está produzindo nesta célula.');
        machine.produced += machine.cavities;
        machine.shift += machine.cavities;
        machine.history.unshift({ time: '10:43', type: 'pulse', text: `Pulso físico convertido em ${machine.cavities} peças`, person: 'Coletor demonstrativo' });
        renderMonitor();
        showToast(`${machine.id}: 1 pulso fictício × ${machine.cavities} cavidades = ${machine.cavities} peças.`);
    }
    document.getElementById('monitor-cells').addEventListener('click', event => {
        const button = event.target.closest('[data-cell]');
        if (!button) return;
        state.cell = button.dataset.cell;
        renderMonitor();
    });
    document.getElementById('simulate-pulse').addEventListener('click', () => simulatePulse());
    document.getElementById('simulate-stop').addEventListener('click', () => {
        const machine = cellMachines(state.cell).find(item => item.status === 'running');
        if (!machine) return showToast('Não há máquina fictícia produzindo para simular parada.');
        machine.status = 'stopped';
        machine.pace = 0;
        machine.performance = 0;
        machine.alert = 'Parada administrativa simulada; aguardando confirmação por nova leitura física.';
        machine.history.unshift({ time: '10:43', type: 'stop', text: 'Parada administrativa simulada', person: machine.operator });
        renderMonitor();
        showToast(`${machine.id}: parada simulada localmente, sem alterar nenhum sistema real.`);
    });
    document.getElementById('machine-grid').addEventListener('click', event => {
        const button = event.target.closest('[data-maintenance]');
        if (!button) return;
        const machine = machines.find(item => item.id === button.dataset.maintenance);
        machine.maintenance = false;
        machine.status = 'waiting';
        machine.availability = 80;
        machine.quality = 99;
        machine.event = 'Aguardando ordem fictícia após restabelecimento';
        renderMonitor();
        showToast(`${machine.id}: monitor demonstrativo restabelecido.`);
    });

    function visibleChartMachines() {
        return cellMachines(state.chartCell, false).filter(machine => state.chartMachine === 'all' || machine.id === state.chartMachine);
    }
    function refreshChartOptions() {
        const list = cellMachines(state.chartCell, false);
        document.getElementById('chart-machine').innerHTML = '<option value="all">Todas as máquinas</option>' + list.map(machine => `<option value="${machine.id}">${machine.id}</option>`).join('');
        if (!list.some(machine => machine.id === state.chartMachine)) state.chartMachine = 'all';
        document.getElementById('chart-machine').value = state.chartMachine;
    }
    function groupedChart(canvasId, entries, datasets, requestedMax) {
        const canvas = document.getElementById(canvasId);
        const rect = canvas.getBoundingClientRect();
        if (!rect.width) return;
        const ratio = window.devicePixelRatio || 1;
        canvas.width = Math.round(rect.width * ratio);
        canvas.height = Math.round(rect.height * ratio);
        const context = canvas.getContext('2d');
        context.scale(ratio, ratio);
        const width = rect.width;
        const height = rect.height;
        const left = 45;
        const bottom = height - 33;
        const top = 14;
        const max = requestedMax || Math.max(1, ...datasets.flatMap(dataset => dataset.values)) * 1.15;
        for (let index = 0; index < 5; index++) {
            const y = bottom - (bottom - top) * index / 4;
            context.strokeStyle = '#e9edf3';
            context.beginPath(); context.moveTo(left, y); context.lineTo(width - 8, y); context.stroke();
            context.fillStyle = '#8290a3'; context.font = '10px Arial, sans-serif';
            context.fillText(format(Math.round(max * index / 4)), 2, y + 3);
        }
        entries.forEach((machine, index) => {
            const slot = (width - left - 14) / entries.length;
            const start = left + slot * index + slot * .15;
            const bar = Math.min(30, slot * .68 / datasets.length);
            datasets.forEach((dataset, offset) => {
                const value = dataset.values[index] || 0;
                const barHeight = value / max * (bottom - top);
                context.fillStyle = dataset.color;
                context.fillRect(start + offset * (bar + 3), bottom - barHeight, Math.max(4, bar), barHeight);
            });
            context.fillStyle = '#68778a'; context.font = '10px Arial, sans-serif';
            context.fillText(machine.id.replace('MQ-DEMO-', 'MQ-'), start, height - 12);
        });
    }
    function renderCharts() {
        const list = visibleChartMachines();
        document.getElementById('chart-cell-name').textContent = `— ${definitions[state.chartCell].name}`;
        groupedChart('experience-chart-oee', list, [{ color: '#248af0', values: list.map(machineOee) }, { color: '#27bd82', values: list.map(machine => machine.availability) }, { color: '#edaa41', values: list.map(machine => machine.performance) }, { color: '#8257e6', values: list.map(machine => machine.quality) }], 100);
        groupedChart('experience-chart-production', list, [{ color: '#248af0', values: list.map(machine => machine.planned) }, { color: '#27bd82', values: list.map(machine => machine.produced) }]);
        groupedChart('experience-chart-cycle', list, [{ color: '#248af0', values: list.map(machine => machine.cycleOp) }, { color: '#edaa41', values: list.map(machine => machine.cycleReal) }]);
        groupedChart('experience-chart-pace', list, [{ color: '#8257e6', values: list.map(correctedTarget) }, { color: '#27bd82', values: list.map(machine => machine.pace) }]);
        document.getElementById('machine-details').innerHTML = list.map(machine => {
            const status = statusValues(machine);
            const target = correctedTarget(machine);
            return `<tr><td><strong>${machine.id}</strong></td><td><span class="table-status" style="--status-color:${status.color};--status-soft:${status.soft}">${status.label}</span></td><td>${machine.order}</td><td>${machine.cavities}/${machine.standardCavity}</td><td>${machine.cycleOp}s</td><td>${machine.cycleReal ? `${machine.cycleReal}s` : '—'}</td><td>${format(target)}</td><td>${format(machine.pace)}</td><td>${target ? Math.round(machine.pace / target * 100) : 0}%</td><td>${machine.scrap}</td><td>${machine.status === 'running' ? 'Turno simulado' : '—'}</td></tr>`;
        }).join('');
    }
    document.getElementById('chart-cell').addEventListener('change', event => {
        state.chartCell = event.target.value;
        state.chartMachine = 'all';
        refreshChartOptions();
        renderCharts();
    });
    document.getElementById('chart-machine').addEventListener('change', event => { state.chartMachine = event.target.value; renderCharts(); });

    function renderIntegration() {
        const example = machines[0];
        const currentCavity = Number(document.getElementById('integration-cavity').value);
        document.getElementById('erp-values').innerHTML = [['ORDEM FICTÍCIA', example.order], ['PRODUTO FICTÍCIO', example.code], ['DESCRIÇÃO', example.product], ['EVENTO OFICIAL', 'Produção ativa'], ['CICLO DE REFERÊNCIA', `${example.cycleOp} s`]].map(([label, value]) => `<div class="key-value"><span>${label}</span><strong>${value}</strong></div>`).join('');
        document.getElementById('sensor-values').innerHTML = [['MÁQUINA FICTÍCIA', example.id], ['LEITURAS RECEBIDAS', state.readings.length], ['CAVIDADE ATUAL', currentCavity], ['ÚLTIMO PULSO', state.readings.length ? 'agora · simulado' : 'aguardando'], ['CONEXÃO EXTERNA', 'nenhuma']].map(([label, value]) => `<div class="key-value"><span>${label}</span><strong>${value}</strong></div>`).join('');
        const total = state.readings.reduce((sum, reading) => sum + reading.cycles * reading.cavity, 0);
        document.getElementById('integration-total').innerHTML = `${format(total)} <span>peças</span>`;
        document.getElementById('integration-proof').textContent = state.readings.length ? state.readings.map(reading => `${reading.cycles} × ${reading.cavity}`).join(' + ') + ` = ${format(total)} peças históricas` : 'Aguardando pulsos demonstrativos.';
        let accumulated = 0;
        document.getElementById('integration-history').innerHTML = state.readings.length ? state.readings.map(reading => {
            const produced = reading.cycles * reading.cavity;
            accumulated += produced;
            return `<tr><td>LEITURA-DEMO-${String(reading.number).padStart(3, '0')}</td><td>${reading.cycles}</td><td>${reading.cavity}</td><td>${format(produced)}</td><td><strong>${format(accumulated)}</strong></td><td>Coletor demonstrativo</td></tr>`;
        }).join('') : '<tr><td colspan="6">Nenhum pulso fictício registrado. Utilize o botão acima para iniciar.</td></tr>';
    }
    document.getElementById('integration-pulse').addEventListener('click', () => {
        const cavity = Number(document.getElementById('integration-cavity').value);
        state.readings.push({ number: state.nextReading++, cycles: 100, cavity });
        renderIntegration();
        showToast(`100 ciclos fictícios × ${cavity} cavidades = ${format(100 * cavity)} peças neste intervalo.`);
    });
    document.getElementById('integration-cavity').addEventListener('change', () => {
        renderIntegration();
        showToast('Cavidade atual alterada; as leituras anteriores continuam preservadas.');
    });
    document.getElementById('sync-erp').addEventListener('click', () => showToast('Contexto fictício atualizado localmente. Nenhuma consulta ao ERP foi realizada.'));

    function renderHistory() {
        const list = state.historyCell === 'all' ? machines.filter(machine => !machine.maintenance) : cellMachines(state.historyCell, false);
        const rows = list.flatMap(machine => {
            const events = machine.history.map(event => ({ machine, time: event.time, type: event.type, description: event.text, person: event.person, source: event.type === 'pulse' ? 'WISE fictício' : 'ERP fictício' }));
            const scraps = machine.scraps.map(scrap => ({ machine, time: scrap.time, type: 'scrap', description: `${scrap.quantity} peças · ${scrap.reason}`, person: scrap.person, source: 'ERP fictício' }));
            return [...events, ...scraps];
        }).sort((first, second) => second.time.localeCompare(first.time));
        const pulses = rows.filter(row => row.type === 'pulse').length;
        const scrap = rows.filter(row => row.type === 'scrap').length;
        document.getElementById('history-summary').innerHTML = [['EVENTOS DEMONSTRATIVOS', rows.length], ['MÁQUINAS COM HISTÓRICO', list.length], ['REGISTROS DE REFUGO', scrap], ['PULSOS SIMULADOS', pulses]].map(([label, value]) => `<article class="summary-card"><span>${label}</span><strong>${value}</strong></article>`).join('');
        document.getElementById('history-table').innerHTML = rows.map(row => {
            const kind = row.type === 'scrap' ? 'Refugo' : row.type === 'pulse' ? 'Pulso' : row.type === 'stop' ? 'Parada' : 'Produção';
            return `<tr><td>${row.time}</td><td>${definitions[row.machine.cell].name}</td><td>${row.machine.id}</td><td><span class="event-type ${row.type}">${kind}</span></td><td>${row.description}</td><td>${row.person}</td><td>${row.source}</td></tr>`;
        }).join('');
    }
    document.getElementById('history-cell').addEventListener('change', event => { state.historyCell = event.target.value; renderHistory(); });

    function renderOrders() {
        const list = machines.filter(machine => !machine.maintenance);
        const running = list.filter(machine => machine.status === 'running');
        document.getElementById('orders-summary').innerHTML = [['ORDENS FICTÍCIAS', list.length], ['EM PRODUÇÃO', running.length], ['PLANEJADO SIMULADO', format(list.reduce((sum, machine) => sum + machine.planned, 0))], ['PRODUÇÃO FÍSICA', format(list.reduce((sum, machine) => sum + machine.produced, 0))]].map(([label, value]) => `<article class="summary-card"><span>${label}</span><strong>${value}</strong></article>`).join('');
        document.getElementById('orders-table').innerHTML = list.map(machine => {
            const status = statusValues(machine);
            return `<tr><td>${machine.order}</td><td>${machine.code}</td><td>${machine.product}</td><td>${machine.id}</td><td>${machine.cavities}/${machine.standardCavity}</td><td>${format(machine.planned)}</td><td>${format(machine.produced)}</td><td>${Math.round(machine.produced / machine.planned * 100)}%</td><td><span class="table-status" style="--status-color:${status.color};--status-soft:${status.soft}">${status.label}</span></td></tr>`;
        }).join('');
    }
    document.getElementById('refresh-orders').addEventListener('click', () => { renderOrders(); showToast('Ordens fictícias sincronizadas localmente. Nenhum sistema externo foi acessado.'); });

    function renderReport() {
        const cell = definitions[state.reportCell];
        const summary = totals(state.reportCell);
        const valid = cellMachines(state.reportCell, false);
        const running = valid.filter(machine => machine.status === 'running');
        document.getElementById('report-cells').innerHTML = tabHtml(state.reportCell, 'report-cell');
        document.getElementById('document-cell').textContent = cell.name;
        document.getElementById('report-kpis').innerHTML = [['PRODUÇÃO NO TURNO', `${format(summary.shift)} pç`], ['OEE MÉDIO VÁLIDO', `${summary.oee}%`], ['REFUGO FICTÍCIO', `${summary.scrap} pç`], ['MÁQUINAS PRODUZINDO', `${summary.running}/${valid.length}`]].map(([label, value]) => `<div class="report-kpi"><span>${label}</span><strong>${value}</strong></div>`).join('');
        document.getElementById('report-performance').innerHTML = running.length ? running.map(machine => `<div class="document-bar" style="--cell-color:${cell.color}"><span>${machine.id}</span><div class="document-bar-track"><span style="width:${machineOee(machine)}%"></span></div><strong>${machineOee(machine)}%</strong></div>`).join('') : '<p>Nenhuma máquina fictícia produzindo neste momento.</p>';
        document.getElementById('report-quality').innerHTML = [['Produção física acumulada', `${format(summary.produced)} peças`], ['Refugo registrado', `${format(summary.scrap)} peças`], ['Máquinas com alerta', summary.alerts], ['Cavidade contextual', 'respeitada por intervalo']].map(([label, value]) => `<div class="document-detail-row"><span>${label}</span><strong>${value}</strong></div>`).join('');
        document.getElementById('report-maintenance').innerHTML = summary.maintenance.length ? summary.maintenance.map(machine => `<div class="document-detail-row"><span>${machine.id}</span><strong>Monitor em manutenção</strong></div>`).join('') : '<div class="document-detail-row"><span>Monitores indisponíveis</span><strong>Nenhum</strong></div>';
    }
    document.getElementById('report-cells').addEventListener('click', event => {
        const button = event.target.closest('[data-report-cell]');
        if (!button) return;
        state.reportCell = button.dataset.reportCell;
        renderReport();
    });
    document.getElementById('report-period').addEventListener('click', event => {
        state.period = state.period === 'dia' ? 'semana' : 'dia';
        event.currentTarget.textContent = `Período: ${state.period} fictíci${state.period === 'dia' ? 'o' : 'a'}`;
        showToast(`Período demonstrativo alterado para ${state.period}; os dados continuam fictícios.`);
    });
    document.getElementById('simulate-report').addEventListener('click', () => showToast('Relatório demonstrativo preparado localmente. Nenhum e-mail foi enviado.'));

    const modules = {
        monitoramento: { icon: '▣', name: 'Monitoramento', short: 'Painéis e TVs por célula.', description: 'Visão operacional que combina ordem ativa, status oficial, pulsos do sensor, OEE, ritmo, refugo e alertas.', features: ['Painel administrativo por célula', 'Modo TV com histórico compacto', 'Produção física confirmada', 'Monitores em manutenção separados'] },
        graficos: { icon: '▥', name: 'Gráficos', short: 'Eficiência, produção, ciclo e ritmo.', description: 'Análise visual por célula e máquina, baseada em contexto oficial e produção física convertida corretamente.', features: ['OEE e componentes', 'Previsto versus produção real', 'Ciclo OP versus ciclo real', 'Meta corrigida versus ritmo real'] },
        ordens: { icon: '☷', name: 'Ordens', short: 'OPs e produtos vindos do ERP.', description: 'Sincronização de ordens e dados de produção, sem necessidade de cadastrar novamente a mesma informação.', features: ['OP ativa e produto fictício', 'Meta planejada e cavidades', 'Acompanhamento de conclusão', 'Fonte oficial única'] },
        usuarios: { icon: '♙', name: 'Usuários', short: 'Gestão de acesso demonstrativa.', description: 'Representação dos perfis administrativos e de acompanhamento presentes na plataforma industrial.', features: ['Acesso administrativo', 'Acompanhamento operacional', 'Visualização dedicada de TV', 'Identificação fictícia nos eventos'] },
        historico: { icon: '↺', name: 'Histórico', short: 'Eventos, refugos e rastreabilidade.', description: 'Linha temporal consolidada com eventos produtivos, paradas, alterações e motivos de refugo.', features: ['Eventos produtivos e improdutivos', 'Primeiro nome do responsável', 'Refugos com quantidade e motivo', 'Consulta consolidada por célula'] },
        motivos: { icon: '⚙', name: 'Cadastros', short: 'Motivos e parâmetros operacionais.', description: 'Base de categorias administrativas utilizadas pela aplicação para classificar eventos e apoiar a gestão.', features: ['Motivos produtivos fictícios', 'Motivos de parada fictícios', 'Categorias operacionais', 'Estrutura de apoio aos eventos'] },
        celulas: { icon: '◉', name: 'Células', short: 'Verde, Vermelha e Roxa.', description: 'Separação visual e analítica da operação industrial em células independentes.', features: ['Célula Verde demonstrativa', 'Célula Vermelha demonstrativa', 'Célula Roxa demonstrativa', 'Indicadores e relatórios separados'] },
        integracao: { icon: '⇄', name: 'Integração', short: 'Contexto ERP e pulsos WISE.', description: 'Camada de integração que cruza fontes oficiais e leituras físicas com processamento incremental.', features: ['Sincronização do ERP', 'Coleta de pulsos do sensor', 'Cavidade válida por intervalo', 'Alertas entre físico e administrativo'] },
    };
    function renderModules() {
        document.getElementById('module-grid').innerHTML = Object.entries(modules).map(([key, module]) => `<button class="module-card${key === state.module ? ' is-active' : ''}" type="button" data-module="${key}"><span class="module-icon">${module.icon}</span><strong>${module.name}</strong><small>${module.short}</small></button>`).join('');
        const module = modules[state.module];
        document.getElementById('module-detail').innerHTML = `<h2>${module.icon} ${module.name}</h2><p>${module.description}</p><div class="module-features">${module.features.map(feature => `<div><span>✓</span>${feature}</div>`).join('')}</div>`;
    }
    document.getElementById('module-grid').addEventListener('click', event => {
        const button = event.target.closest('[data-module]');
        if (!button) return;
        state.module = button.dataset.module;
        renderModules();
    });

    function navigate(view, setHash = true) {
        if (!document.getElementById(`view-${view}`)) return;
        state.view = view;
        document.querySelectorAll('.page-view').forEach(panel => {
            const active = panel.id === `view-${view}`;
            panel.hidden = !active;
            panel.classList.toggle('is-active', active);
        });
        document.querySelectorAll('[data-view]').forEach(button => button.classList.toggle('is-active', button.dataset.view === view));
        document.querySelector('.primary-nav').classList.remove('is-open');
        if (view === 'monitoramento') renderMonitor();
        if (view === 'graficos') { refreshChartOptions(); requestAnimationFrame(renderCharts); }
        if (view === 'integracao') renderIntegration();
        if (view === 'historico') renderHistory();
        if (view === 'ordens') renderOrders();
        if (view === 'relatorios') renderReport();
        if (view === 'cadastros') renderModules();
        if (setHash) history.replaceState(null, '', `#${view}`);
        window.scrollTo({ top: 0 });
    }
    document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => navigate(button.dataset.view)));
    document.querySelectorAll('[data-navigate]').forEach(button => button.addEventListener('click', () => { state.chartCell = state.cell; document.getElementById('chart-cell').value = state.cell; navigate(button.dataset.navigate); }));
    document.querySelector('.app-brand').addEventListener('click', event => { event.preventDefault(); navigate('monitoramento'); });
    document.getElementById('mobile-menu').addEventListener('click', () => document.querySelector('.primary-nav').classList.toggle('is-open'));
    document.getElementById('mode-toggle').addEventListener('click', event => {
        state.tv = !state.tv;
        document.body.classList.toggle('tv-mode', state.tv);
        event.currentTarget.textContent = state.tv ? 'Modo administrador' : 'Modo TV';
        renderMonitor();
        showToast(state.tv ? 'Modo TV ativado: histórico compacto e controles administrativos ocultos.' : 'Modo administrador ativado: controles demonstrativos disponíveis.');
    });
    window.addEventListener('resize', () => { if (state.view === 'graficos') renderCharts(); });

    renderSelectors();
    document.getElementById('chart-cell').value = state.chartCell;
    renderMonitor();
    renderIntegration();
    renderModules();
    const requested = location.hash.slice(1);
    navigate(requested && document.getElementById(`view-${requested}`) ? requested : 'monitoramento', false);
})();
