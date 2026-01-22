const list = document.getElementById('history-list');
const ledgerForm = document.getElementById('ledger-form');
const balanceDisplay = document.getElementById('total-val');
const incDisplay = document.getElementById('inc-val');
const expDisplay = document.getElementById('exp-val');
const navTabs = document.querySelectorAll('.nav-item');
const panels = document.querySelectorAll('.view-panel');
const headTitle = document.getElementById('view-title');

let dataStore = JSON.parse(localStorage.getItem('ledger_data')) || [];
let donut;
let line;

navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const key = tab.getAttribute('data-section');
        navTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        panels.forEach(p => {
            p.classList.add('hidden');
            if(p.id === `${key}-section`) p.classList.remove('hidden');
        });

        headTitle.innerText = tab.innerText;
        if(key === 'reports') drawLine();
    });
});

function setupCharts() {
    const ctxD = document.getElementById('mainDonut').getContext('2d');
    donut = new Chart(ctxD, {
        type: 'doughnut',
        data: {
            labels: ['In', 'Out'],
            datasets: [{
                data: [0, 0],
                backgroundColor: ['#10b981', '#f43f5e'],
                borderWidth: 0
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' }}}}
    });

    const ctxL = document.getElementById('trendLine').getContext('2d');
    line = new Chart(ctxL, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Balance History',
                data: [],
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            }
        }
    });
}

function drawLine() {
    if (!line) return;
    let cumm = 0;
    const stamps = dataStore.map(t => t.stamp.split(',')[0]);
    const values = dataStore.map(t => {
        cumm += t.qty;
        return cumm;
    });
    line.data.labels = stamps;
    line.data.datasets[0].data = values;
    line.update();
}

function sync() {
    const qtys = dataStore.map(t => t.qty);
    const net = qtys.reduce((a, b) => (a += b), 0).toFixed(2);
    const pos = qtys.filter(x => x > 0).reduce((a, b) => (a += b), 0).toFixed(2);
    const neg = qtys.filter(x => x < 0).reduce((a, b) => (a += b), 0).toFixed(2);

    balanceDisplay.innerText = `$${net}`;
    incDisplay.innerText = `+$${pos}`;
    expDisplay.innerText = `-$${Math.abs(neg).toFixed(2)}`;

    if(donut) {
        donut.data.datasets[0].data = [pos, Math.abs(neg)];
        donut.update();
    }

    const ratio = Math.min((net / 5000) * 100, 100);
    document.getElementById('bar-inner').style.width = net > 0 ? `${ratio}%` : '0%';
    document.getElementById('goal-stat').innerText = `${Math.floor(ratio)}% toward $5,000 monthly target`;

    refreshList();
    localStorage.setItem('ledger_data', JSON.stringify(dataStore));
}

function refreshList() {
    list.innerHTML = '';
    dataStore.forEach(t => {
        const row = document.createElement('li');
        row.classList.add(t.qty < 0 ? 'minus' : 'plus');
        row.innerHTML = `
            <div class="item-meta">
                <strong>${t.label}</strong>
                <span class="item-date">${t.stamp}</span>
            </div>
            <span>${t.qty < 0 ? '-' : '+'}$${Math.abs(t.qty)}</span>
        `;
        list.appendChild(row);
    });
}

ledgerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const entry = {
        uid: Date.now(),
        label: document.getElementById('desc-input').value,
        qty: +document.getElementById('amt-input').value,
        stamp: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    dataStore.push(entry);
    sync();
    ledgerForm.reset();
});

document.getElementById('date-string').innerText = new Date().toDateString();
setupCharts();
sync();