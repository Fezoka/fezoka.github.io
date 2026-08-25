(() => {
    'use strict';

    const panels = [...document.querySelectorAll('[data-slide-panel]')];
    const steps = [...document.querySelectorAll('.story-step')];
    const previous = document.getElementById('previous-slide');
    const next = document.getElementById('next-slide');
    let current = 0;
    let animated = false;

    function showSlide(index, updateHash = true) {
        index = Number(index);
        if (!Number.isInteger(index) || index < 0 || index >= panels.length) return;
        panels.forEach((panel, position) => {
            panel.hidden = position !== index;
            panel.classList.toggle('is-active', position === index);
            if (position === index) panel.scrollTop = 0;
        });
        steps.forEach((step, position) => {
            step.classList.toggle('is-active', position === index);
            if (position === index) {
                step.setAttribute('aria-current', 'step');
                step.scrollIntoView({ block: 'nearest', inline: 'center' });
            } else step.removeAttribute('aria-current');
        });
        current = index;
        previous.disabled = index === 0;
        next.disabled = index === panels.length - 1;
        document.getElementById('current-slide-number').textContent = String(index + 1).padStart(2, '0');
        document.getElementById('slide-progress-fill').style.width = `${(index + 1) / panels.length * 100}%`;
        if (updateHash) history.replaceState(null, '', `#${panels[index].id}`);
        if (panels[index].id === 'inteligencia') requestAnimationFrame(drawCharts);
        if (panels[index].id === 'resultados' && !animated) {
            animated = true;
            document.querySelectorAll('[data-counter]').forEach(counter => {
                const value = Number(counter.dataset.counter);
                const started = performance.now();
                function tick(time) {
                    const progress = Math.min((time - started) / 1050, 1);
                    counter.textContent = Math.round(value * (1 - (1 - progress) ** 3)).toLocaleString('pt-BR');
                    if (progress < 1) requestAnimationFrame(tick);
                }
                requestAnimationFrame(tick);
            });
        }
    }

    steps.forEach(step => step.addEventListener('click', () => showSlide(step.dataset.slide)));
    document.querySelectorAll('[data-slide-link], [data-slide]:not(.story-step)').forEach(link => link.addEventListener('click', event => {
        event.preventDefault();
        showSlide(link.dataset.slideLink ?? link.dataset.slide);
    }));
    document.querySelectorAll('[data-next-slide]').forEach(button => button.addEventListener('click', () => showSlide(current + 1)));
    previous.addEventListener('click', () => showSlide(current - 1));
    next.addEventListener('click', () => showSlide(current + 1));
    document.addEventListener('keydown', event => {
        if (event.target instanceof HTMLElement && ['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return;
        if (['ArrowRight', 'PageDown'].includes(event.key)) showSlide(current + 1);
        if (['ArrowLeft', 'PageUp'].includes(event.key)) showSlide(current - 1);
    });
    let touch;
    document.querySelector('.slides-viewport').addEventListener('touchstart', event => { touch = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY }; }, { passive: true });
    document.querySelector('.slides-viewport').addEventListener('touchend', event => {
        if (!touch) return;
        const x = event.changedTouches[0].clientX - touch.x;
        const y = event.changedTouches[0].clientY - touch.y;
        touch = undefined;
        if (Math.abs(x) > 85 && Math.abs(x) > Math.abs(y) * 1.5) showSlide(current + (x < 0 ? 1 : -1));
    }, { passive: true });

    const sourceMessages = {
        erp: 'O Protheus permanece como fonte oficial das ordens, dos eventos e dos refugos. O operador não precisa registrar tudo novamente.',
        wise: 'Os coletores WISE registram pulsos físicos. Os intervalos válidos formam o ciclo real, e a cavidade vigente converte ciclos em peças.',
        joined: 'A plataforma consolida contexto oficial e produção física para calcular OEE, ritmo corrigido, alertas, gráficos e relatórios.',
    };
    document.querySelectorAll('[data-source]').forEach(button => button.addEventListener('click', () => {
        document.querySelectorAll('[data-source]').forEach(item => item.classList.toggle('is-active', item === button));
        document.querySelectorAll('.source-card').forEach(card => card.classList.remove('is-emphasized'));
        const key = button.dataset.source;
        const target = key === 'joined' ? '.source-result' : `#source-${key}`;
        document.querySelector(target).classList.add('is-emphasized');
        document.getElementById('integration-message').textContent = sourceMessages[key];
    }));

    const cells = {
        green: { label: 'Célula Verde', color: '#5ce198', total: 3, running: 2, pieces: 1840, oee: 83, machines: [['MQ-DEMO-11', 'Conjunto Aurora', 'Produzindo', 87, 820], ['MQ-DEMO-12', 'Tampa Prisma', 'Produzindo', 79, 1020], ['MQ-DEMO-13', 'Base Horizonte', 'Parada', 0, 0]], production: [86, 78, 61], scrap: 18, maintenance: 1 },
        red: { label: 'Célula Vermelha', color: '#ff6b76', total: 3, running: 2, pieces: 1530, oee: 76, machines: [['MQ-DEMO-21', 'Suporte Boreal', 'Produzindo', 81, 690], ['MQ-DEMO-22', 'Anel Nébula', 'Produzindo', 72, 840], ['MQ-DEMO-23', 'Capa Atlas', 'Aguardando', 0, 0]], production: [81, 72, 48], scrap: 26, maintenance: 0 },
        purple: { label: 'Célula Roxa', color: '#a487ff', total: 3, running: 2, pieces: 1670, oee: 88, machines: [['MQ-DEMO-31', 'Painel Órion', 'Produzindo', 91, 920], ['MQ-DEMO-32', 'Vedação Delta', 'Produzindo', 85, 750], ['MQ-DEMO-33', 'Estrutura Solar', 'Manutenção', 0, 0]], production: [91, 85, 67], scrap: 12, maintenance: 1 },
    };

    function renderPreview(key) {
        const cell = cells[key];
        document.querySelectorAll('[data-preview-cell]').forEach(button => button.classList.toggle('is-active', button.dataset.previewCell === key));
        document.getElementById('preview-kpis').innerHTML = [['MÁQUINAS', cell.total], ['PRODUZINDO', cell.running], ['PEÇAS SIMULADAS', cell.pieces.toLocaleString('pt-BR')], ['OEE MÉDIO', `${cell.oee}%`]].map(([label, value]) => `<article><span>${label}</span><strong>${value}</strong></article>`).join('');
        document.getElementById('preview-machines').innerHTML = cell.machines.map(([machine, product, status, oee, pieces]) => `<article class="preview-machine" style="--machine-color:${status === 'Produzindo' ? cell.color : status === 'Manutenção' ? '#ffbf64' : '#ff7781'}"><span>${machine} · ${status}</span><strong>${product}</strong><small>PROD-DEMO · informação fictícia</small><div class="preview-machine-metrics"><span>OEE <b>${oee ? `${oee}%` : '—'}</b></span><span>Peças <b>${pieces.toLocaleString('pt-BR')}</b></span></div></article>`).join('');
    }
    document.getElementById('preview-cell-switch').addEventListener('click', event => {
        const button = event.target.closest('[data-preview-cell]');
        if (button) renderPreview(button.dataset.previewCell);
    });

    function calculateOee() {
        const availability = Number(document.getElementById('availability-input').value);
        const performanceValue = Number(document.getElementById('performance-input').value);
        const quality = Number(document.getElementById('quality-input').value);
        [['availability', availability], ['performance', performanceValue], ['quality', quality]].forEach(([id, value]) => { document.getElementById(`${id}-value`).textContent = `${value}%`; });
        const oee = Math.round(availability * performanceValue * quality / 10000);
        document.getElementById('oee-result').textContent = `${oee}%`;
        document.getElementById('calculator-ring').style.setProperty('--score', oee);
        document.getElementById('formula-line').textContent = `${(availability / 100).toFixed(2).replace('.', ',')} × ${(performanceValue / 100).toFixed(2).replace('.', ',')} × ${(quality / 100).toFixed(2).replace('.', ',')} = ${(oee / 100).toFixed(2).replace('.', ',')}`;
    }
    ['availability', 'performance', 'quality'].forEach(id => document.getElementById(`${id}-input`).addEventListener('input', calculateOee));

    let pulseHistory = [];
    function renderPulses() {
        const ledger = document.getElementById('pulse-ledger');
        ledger.innerHTML = pulseHistory.length ? pulseHistory.map((entry, index) => `<div class="pulse-line"><i>${String(index + 1).padStart(2, '0')}</i><span>${entry.cycles} ciclos</span><span>${entry.cavities} cavidades</span><strong>${(entry.cycles * entry.cavities).toLocaleString('pt-BR')} peças</strong></div>`).join('') : '<div class="empty-ledger">Clique em um botão para registrar pulsos fictícios.</div>';
        const correct = pulseHistory.reduce((sum, entry) => sum + entry.cycles * entry.cavities, 0);
        const incorrect = pulseHistory.reduce((sum, entry) => sum + entry.cycles, 0) * (pulseHistory.at(-1)?.cavities ?? 0);
        document.getElementById('pulse-correct').textContent = `${correct.toLocaleString('pt-BR')} peças`;
        document.getElementById('pulse-incorrect').textContent = `${incorrect.toLocaleString('pt-BR')} peças`;
    }
    document.getElementById('pulse-six').addEventListener('click', () => { pulseHistory.push({ cycles: 100, cavities: 6 }); renderPulses(); });
    document.getElementById('pulse-eight').addEventListener('click', () => { pulseHistory.push({ cycles: 100, cavities: 8 }); renderPulses(); });
    document.getElementById('pulse-reset').addEventListener('click', () => { pulseHistory = []; renderPulses(); });

    function updateCavity() {
        const cavity = Number(document.getElementById('cavity-selector').value);
        const pace = Number(document.getElementById('pace-selector').value);
        const target = 1000 * cavity / 8;
        document.getElementById('corrected-target').innerHTML = `${target.toLocaleString('pt-BR')} <small>pç/h</small>`;
        document.getElementById('target-attainment').textContent = `${Math.round(pace / target * 100)}%`;
    }
    document.getElementById('cavity-selector').addEventListener('change', updateCavity);
    document.getElementById('pace-selector').addEventListener('change', updateCavity);

    function paintChart(id, first, second, max, firstColor = '#45dfc3', secondColor = '#a988ff') {
        const canvas = document.getElementById(id);
        const bounds = canvas.getBoundingClientRect();
        if (!bounds.width) return;
        const ratio = window.devicePixelRatio || 1;
        canvas.width = Math.round(bounds.width * ratio);
        canvas.height = Math.round(bounds.height * ratio);
        const context = canvas.getContext('2d');
        context.scale(ratio, ratio);
        const width = bounds.width;
        const height = bounds.height;
        const left = 26;
        const bottom = height - 20;
        context.strokeStyle = 'rgba(148,170,193,.15)';
        for (let row = 0; row < 4; row++) { const y = bottom - (bottom - 8) * row / 3; context.beginPath(); context.moveTo(left, y); context.lineTo(width - 5, y); context.stroke(); }
        first.forEach((value, index) => {
            const slot = (width - left - 9) / first.length;
            const x = left + index * slot + slot * .18;
            const barWidth = Math.max(5, slot * .24);
            const y = bottom - value / max * (bottom - 10);
            context.fillStyle = firstColor;
            context.fillRect(x, y, barWidth, bottom - y);
            if (second) { const y2 = bottom - second[index] / max * (bottom - 10); context.fillStyle = secondColor; context.fillRect(x + barWidth + 4, y2, barWidth, bottom - y2); }
            context.fillStyle = '#92a4b8';
            context.font = '9px Inter, sans-serif';
            context.fillText(`MQ-${index + 1}`, x, height - 5);
        });
    }
    function drawCharts() {
        paintChart('chart-oee', [87, 79, 91], [94, 86, 97], 100);
        paintChart('chart-production', [960, 1120, 880], [820, 1020, 850], 1300);
        paintChart('chart-cycle', [28, 31, 25], [29, 34, 26], 42, '#78bbff', '#45dfc3');
        paintChart('chart-pace', [680, 520, 760], [650, 495, 720], 900, '#a988ff', '#45dfc3');
    }
    window.addEventListener('resize', () => { if (panels[current].id === 'inteligencia') drawCharts(); });

    const alerts = {
        stopped: { title: 'Produção física durante parada administrativa', description: 'O coletor WISE registrou pulsos, mas o evento oficial aponta máquina parada. A equipe pode verificar o apontamento sem redigitar a produção.', evidence: [['ERP', 'Evento: parada'], ['WISE', 'Pulsos recentes: sim'], ['AÇÃO', 'Conferir evento oficial']] },
        'without-op': { title: 'Sensor registrou produção sem ordem ativa', description: 'A máquina demonstra atividade física, mas nenhuma OP administrativa está vinculada ao contexto atual.', evidence: [['ERP', 'OP ativa: não'], ['WISE', 'Produção física: sim'], ['AÇÃO', 'Vincular ordem correta']] },
        'without-pulse': { title: 'Ordem aberta sem confirmação de produção', description: 'Uma OP aberta não significa que a máquina esteja produzindo. Pulsos recentes e produção acumulada precisam confirmar a operação.', evidence: [['ERP', 'OP ativa: sim'], ['WISE', 'Pulsos recentes: zero'], ['AÇÃO', 'Inspecionar máquina']] },
        maintenance: { title: 'Monitor de produção em manutenção', description: 'O coletor está indisponível e a máquina fica sinalizada separadamente. Seus dados não entram nas médias, rankings ou gráficos.', evidence: [['MONITOR', 'Em manutenção'], ['INDICADORES', 'Excluído das médias'], ['AÇÃO', 'Restabelecer coletor']] },
    };
    function chooseAlert(key) {
        const alert = alerts[key];
        document.querySelectorAll('[data-alert]').forEach(button => button.classList.toggle('is-active', button.dataset.alert === key));
        document.getElementById('alert-title').textContent = alert.title;
        document.getElementById('alert-description').textContent = alert.description;
        document.getElementById('alert-evidence').innerHTML = alert.evidence.map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join('');
    }
    document.querySelectorAll('[data-alert]').forEach(button => button.addEventListener('click', () => chooseAlert(button.dataset.alert)));

    function renderReport(key) {
        const cell = cells[key];
        document.querySelectorAll('[data-report-cell]').forEach(button => button.classList.toggle('is-active', button.dataset.reportCell === key));
        document.getElementById('report-title').textContent = cell.label;
        document.getElementById('report-metrics').innerHTML = [['PRODUÇÃO', `${cell.pieces.toLocaleString('pt-BR')} pç`], ['OEE MÉDIO', `${cell.oee}%`], ['REFUGO', `${cell.scrap} pç`], ['MANUTENÇÃO', cell.maintenance]].map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join('');
        document.getElementById('report-bars').innerHTML = cell.production.map((value, index) => `<div class="report-bar" style="--cell-color:${cell.color}"><span>MQ-DEMO-${key === 'green' ? '1' : key === 'red' ? '2' : '3'}${index + 1}</span><div class="report-bar-track"><span style="width:${value}%"></span></div><strong>${value}%</strong></div>`).join('');
    }
    document.getElementById('report-cell-switch').addEventListener('click', event => {
        const button = event.target.closest('[data-report-cell]');
        if (button) renderReport(button.dataset.reportCell);
    });

    renderPreview('green');
    calculateOee();
    renderPulses();
    updateCavity();
    chooseAlert('stopped');
    renderReport('green');
    const initial = panels.findIndex(panel => `#${panel.id}` === location.hash);
    showSlide(initial < 0 ? 0 : initial, false);
})();
