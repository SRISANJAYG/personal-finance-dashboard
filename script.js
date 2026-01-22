const list = document.getElementById('history-list');
const entryForm = document.getElementById('entry-form');
const balanceEl = document.getElementById('net-balance');
const incEl = document.getElementById('inc-total');
const expEl = document.getElementById('exp-total');
const navItems = document.querySelectorAll('.nav-item, .nav-links li');
const panels = document.querySelectorAll('.panel');
const viewTitle = document.getElementById('view-title');

window.transactions = JSON.parse(localStorage.getItem('finance_data')) || [];
let donut;
let trend;
let usdToInr = 83.00;

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const target = item.getAttribute('data-section');
        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');

        panels.forEach(p => {
            p.classList.add('hidden');
            if(p.id === `${target}-section`) p.classList.remove('hidden');
        });

        viewTitle.innerText = item.innerText;
        if(target === 'reports') renderTrend();
    });
});

async function fetchRates() {
    try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await res.json();
        usdToInr = data.rates.INR;
        document.getElementById('api-widget').innerHTML = `Market USD/INR: ₹${usdToInr.toFixed(2)}`;
    } catch (e) {
        document.getElementById('api-widget').innerText = "Market Offline";
    }
}

function initUI() {
    const ctxD = document.getElementById('donutChart').getContext('2d');
    donut = new Chart(ctxD, {
        type: 'doughnut',
        data: {
            labels: ['Income', 'Expenses'],
            datasets: [{ data: [0, 0], backgroundColor: ['#10b981', '#f43f5e'], borderWidth: 0 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' }}}}
    });

    const ctxL = document.getElementById('lineTrend').getContext('2d');
    trend = new Chart(ctxL, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{ label: 'Balance', data: [], borderColor: '#8b5cf6', fill: true, tension: 0.4, backgroundColor: 'rgba(139, 92, 246, 0.1)' }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function renderTrend() {
    if (!trend) return;
    let current = 0;
    trend.data.labels = window.transactions.map(t => t.date.split(',')[0]);
    trend.data.datasets[0].data = window.transactions.map(t => {
        current += t.amount;
        return current;
    });
    trend.update();
}

function sync() {
    const vals = window.transactions.map(t => t.amount);
    const net = vals.reduce((a, b) => (a += b), 0).toFixed(2);
    const inc = vals.filter(x => x > 0).reduce((a, b) => (a += b), 0).toFixed(2);
    const exp = vals.filter(x => x < 0).reduce((a, b) => (a += b), 0).toFixed(2);

    balanceEl.innerText = `$${net}`;
    incEl.innerText = `+$${inc}`;
    expEl.innerText = `-$${Math.abs(exp).toFixed(2)}`;

    if(donut) {
        donut.data.datasets[0].data = [inc, Math.abs(exp)];
        donut.update();
    }

    const pct = Math.min((net / 5000) * 100, 100);
    document.getElementById('progress-inner').style.width = net > 0 ? `${pct}%` : '0%';
    document.getElementById('progress-label').innerText = `${Math.floor(pct)}% of $5,000 target`;

    list.innerHTML = '';
    window.transactions.forEach(t => {
        const li = document.createElement('li');
        li.className = t.amount < 0 ? 'minus' : 'plus';
        li.innerHTML = `<div><strong>${t.desc}</strong><br><small>${t.date}</small></div><span>${t.amount < 0 ? '-' : '+'}$${Math.abs(t.amount).toFixed(2)}</span>`;
        list.appendChild(li);
    });

    localStorage.setItem('finance_data', JSON.stringify(window.transactions));
}

entryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    let rawAmount = +document.getElementById('item-amt').value;
    const selectedCurr = document.getElementById('item-curr').value;
    
    if (selectedCurr === 'INR') {
        rawAmount = rawAmount / usdToInr;
    }

    window.transactions.push({
        id: Date.now(),
        desc: document.getElementById('item-desc').value,
        amount: rawAmount,
        date: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    });
    
    sync();
    entryForm.reset();
});

document.getElementById('current-date').innerText = new Date().toDateString();
fetchRates();
initUI();
sync();
