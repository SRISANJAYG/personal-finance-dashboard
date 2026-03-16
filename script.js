let transactions = JSON.parse(localStorage.getItem('finance_data')) || [];
let savingsGoals = JSON.parse(localStorage.getItem('savings_goals')) || [];
let recurringBills = JSON.parse(localStorage.getItem('recurring_bills')) || [];
let savingsGoal = parseFloat(localStorage.getItem('savings_goal')) || 5000;
let activeType = 'income';
let donutChart, trendChart;
let usdToInr = 83.00;


function launchConfetti() {
    let canvas = document.getElementById('confetti-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'confetti-canvas';
        document.body.appendChild(canvas);
    }
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const pieces = [];
    const colors = ['#8b5cf6','#10b981','#f43f5e','#f59e0b','#06b6d4','#ec4899'];
    for (let i = 0; i < 120; i++) {
        pieces.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: Math.random() * 10 + 5,
            h: Math.random() * 6 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            r: Math.random() * Math.PI * 2,
            dr: (Math.random() - 0.5) * 0.2,
            dy: Math.random() * 3 + 2,
            dx: (Math.random() - 0.5) * 2
        });
    }
    let frame;
    let elapsed = 0;
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach(p => {
            p.y += p.dy;
            p.x += p.dx;
            p.r += p.dr;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.r);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
        });
        elapsed++;
        if (elapsed < 180) frame = requestAnimationFrame(draw);
        else { ctx.clearRect(0, 0, canvas.width, canvas.height); canvas.remove(); }
    }
    cancelAnimationFrame(frame);
    draw();
}


function animateCounter(el, target, prefix, suffix) {
    const start = 0;
    const duration = 900;
    const startTime = performance.now();
    function step(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const value = (start + (target - start) * ease).toFixed(2);
        el.textContent = prefix + value + (suffix || '');
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}


function renderHealthScore(income, expense) {
    const net = income - expense;
    const savingsRate = income > 0 ? ((net / income) * 100) : 0;
    let score = Math.min(100, Math.max(0, savingsRate * 2));
    let label, color;
    if (score >= 70)      { label = '🟢 Excellent'; color = '#10b981'; }
    else if (score >= 40) { label = '🟡 Good';      color = '#f59e0b'; }
    else if (score >= 15) { label = '🟠 Fair';       color = '#f97316'; }
    else                  { label = '🔴 Needs Work'; color = '#f43f5e'; }

    const net0 = document.getElementById('net-balance').closest('.stat-card');
    let wrap = net0.querySelector('.health-bar-wrap');
    if (!wrap) {
        wrap = document.createElement('div');
        wrap.className = 'health-bar-wrap';
        wrap.innerHTML = `
            <div class="health-label"><span>Financial Health</span><strong id="health-label-text"></strong></div>
            <div class="health-track"><div class="health-fill" id="health-fill"></div></div>`;
        net0.appendChild(wrap);
    }
    document.getElementById('health-label-text').textContent = label;
    const fill = document.getElementById('health-fill');
    fill.style.background = color;
    fill.style.boxShadow = `0 0 8px ${color}`;
    setTimeout(() => { fill.style.width = score + '%'; }, 50);
}


function renderStreak() {
    const dates = transactions.map(t => {
        const d = new Date(t.date);
        return isNaN(d) ? null : d.toDateString();
    }).filter(Boolean);
    const unique = [...new Set(dates)].sort((a, b) => new Date(b) - new Date(a));
    let streak = 0;
    let check = new Date();
    check.setHours(0, 0, 0, 0);
    for (let i = 0; i < unique.length; i++) {
        const d = new Date(unique[i]);
        d.setHours(0, 0, 0, 0);
        if (d.getTime() === check.getTime()) {
            streak++;
            check.setDate(check.getDate() - 1);
        } else break;
    }
    let badge = document.querySelector('.streak-badge');
    if (!badge) {
        badge = document.createElement('div');
        badge.className = 'streak-badge';
        const footer = document.querySelector('.sidebar-footer');
        footer.parentNode.insertBefore(badge, footer);
    }
    if (streak > 0) {
        badge.innerHTML = `<span class="streak-fire">🔥</span><span>${streak}-day streak! Keep it up!</span>`;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

const list = document.getElementById('history-list');
const entryForm = document.getElementById('entry-form');
const balanceEl = document.getElementById('net-balance');
const incEl = document.getElementById('inc-total');
const expEl = document.getElementById('exp-total');
const navItems = document.querySelectorAll('.nav-item');
const panels = document.querySelectorAll('.panel');
const viewTitle = document.getElementById('view-title');
const searchInput = document.getElementById('search-input');
const filterCat = document.getElementById('filter-cat');
const filterType = document.getElementById('filter-type');
const goalInput = document.getElementById('goal-input');

goalInput.value = savingsGoal;

const now = new Date();
document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

fetch('https://api.exchangerate-api.com/v4/latest/USD')
    .then(res => res.json())
    .then(data => {
        usdToInr = data.rates.INR;
        document.getElementById('api-widget').innerHTML = `<span class="pulse-dot"></span> USD/INR: ₹${usdToInr.toFixed(2)}`;
    })
    .catch(() => {
        document.getElementById('api-widget').innerHTML = `<span class="pulse-dot offline"></span> Offline`;
    });

const CAT_COLORS = {
    Salary: '#8b5cf6',
    Food: '#f59e0b',
    Transport: '#3b82f6',
    Shopping: '#ec4899',
    Bills: '#f43f5e',
    Entertainment: '#a78bfa',
    Health: '#06b6d4',
    Other: '#94a3b8'
};

const SECTION_TITLES = {
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    savings: 'Savings Goals',
    recurring: 'Recurring Bills',
    insights: 'Insights',
    reports: 'Reports',
    budget: 'Budget'
};

navItems.forEach(item => {
    item.addEventListener('click', function () {
        navItems.forEach(n => n.classList.remove('active'));
        this.classList.add('active');
        const section = this.dataset.section;
        viewTitle.textContent = SECTION_TITLES[section];
        panels.forEach(p => p.classList.add('hidden'));
        document.getElementById(section + '-section').classList.remove('hidden');
        if (section === 'dashboard') renderDashboard();
        if (section === 'transactions') renderTransactions();
        if (section === 'savings') renderGoals();
        if (section === 'recurring') renderRecurring();
        if (section === 'insights') renderInsights();
        if (section === 'reports') renderReports();
        if (section === 'budget') renderBudget();
    });
});

document.getElementById('type-toggle').addEventListener('click', function (e) {
    const btn = e.target.closest('.toggle-btn');
    if (!btn) return;
    activeType = btn.dataset.type;
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
});

entryForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const desc = document.getElementById('item-desc').value.trim();
    const rawAmt = parseFloat(document.getElementById('item-amt').value);
    const currency = document.getElementById('item-curr').value;
    const category = document.getElementById('item-cat').value;

    if (!desc || isNaN(rawAmt) || rawAmt <= 0) {
        alert('Please fill in all fields with valid values.');
        return;
    }

    let amount = rawAmt;
    if (currency === 'INR') amount = rawAmt / usdToInr;
    const finalAmount = activeType === 'income' ? Math.abs(amount) : -Math.abs(amount);

    transactions.unshift({
        id: Date.now(),
        desc,
        amount: parseFloat(finalAmount.toFixed(2)),
        type: activeType,
        category,
        date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    });

    localStorage.setItem('finance_data', JSON.stringify(transactions));
    entryForm.reset();
    document.getElementById('item-cat').value = 'Salary';
    renderDashboard();
});

function fmt(n) {
    return '$' + Math.abs(n).toFixed(2);
}

function renderDashboard() {
    let income = 0, expense = 0;
    transactions.forEach(t => {
        if (t.amount > 0) income += t.amount;
        else expense += Math.abs(t.amount);
    });
    const net = income - expense;

    animateCounter(balanceEl, Math.abs(net), net < 0 ? '-$' : '$');
    animateCounter(incEl, income, '+$');
    animateCounter(expEl, expense, '-$');

    renderHealthScore(income, expense);
    renderStreak();

    const catTotals = {};
    transactions.filter(t => t.amount < 0).forEach(t => {
        catTotals[t.category] = (catTotals[t.category] || 0) + Math.abs(t.amount);
    });

    const labels = Object.keys(catTotals);
    const values = Object.values(catTotals);
    const colors = labels.map(l => CAT_COLORS[l] || '#94a3b8');

    if (donutChart) donutChart.destroy();
    const ctx = document.getElementById('donutChart').getContext('2d');
    if (labels.length === 0) return;
    donutChart = new Chart(ctx, {
        type: 'doughnut',
        data: { labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 2, borderColor: '#1e293b' }] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 12, font: { size: 12 } } } }
        }
    });
}

function renderTransactions() {
    const query = searchInput.value.toLowerCase();
    const catFilter = filterCat.value;
    const typeFilter = filterType.value;

    const filtered = transactions.filter(t => {
        const matchSearch = t.desc.toLowerCase().includes(query) || t.category.toLowerCase().includes(query);
        const matchCat = catFilter === 'all' || t.category === catFilter;
        const matchType = typeFilter === 'all' || t.type === typeFilter;
        return matchSearch && matchCat && matchType;
    });

    if (filtered.length === 0) {
        list.innerHTML = '<li class="empty-state">No transactions found 💸</li>';
        return;
    }

    list.innerHTML = '';
    filtered.forEach(t => {
        const li = document.createElement('li');
        li.className = 'ledger-item fade-in';
        const color = t.amount > 0 ? '#34D399' : '#FB7185';
        const sign = t.amount > 0 ? '+' : '-';
        const badgeColor = CAT_COLORS[t.category] || '#71717A';
        const CAT_EMOJI = { Salary:'💼', Food:'🍔', Transport:'🚗', Shopping:'🛍️', Bills:'🧾', Entertainment:'🎬', Health:'💊', Other:'📦' };
        const emoji = CAT_EMOJI[t.category] || '📦';
        li.innerHTML = `
            <div class="ledger-left">
                <div class="ledger-accent" style="background:${badgeColor}22;">${emoji}</div>
                <div class="ledger-info">
                    <strong>${t.desc}</strong>
                    <small>${t.category} · ${t.date}</small>
                </div>
            </div>
            <div class="ledger-right">
                <span style="color:${color};font-weight:700;font-size:0.95rem;">${sign}${fmt(t.amount)}</span>
                <button class="del-btn" data-id="${t.id}">✕</button>
            </div>`;
        list.appendChild(li);
    });
}

list.addEventListener('click', function (e) {
    const btn = e.target.closest('.del-btn');
    if (!btn) return;
    const id = parseInt(btn.dataset.id);
    transactions = transactions.filter(t => t.id !== id);
    localStorage.setItem('finance_data', JSON.stringify(transactions));
    renderTransactions();
    renderDashboard();
});

searchInput.addEventListener('input', renderTransactions);
filterCat.addEventListener('change', renderTransactions);
filterType.addEventListener('change', renderTransactions);

document.getElementById('clear-btn').addEventListener('click', function () {
    if (!confirm('Delete all transactions? This cannot be undone.')) return;
    transactions = [];
    localStorage.setItem('finance_data', JSON.stringify(transactions));
    renderTransactions();
    renderDashboard();
});

function renderGoals() {
    const container = document.getElementById('goals-list');
    if (savingsGoals.length === 0) {
        container.innerHTML = '<p class="empty-state">No goals yet — add one! 🎯</p>';
        return;
    }
    container.innerHTML = '';
    savingsGoals.forEach(goal => {
        const pct = Math.min(100, (goal.saved / goal.target) * 100).toFixed(1);
        const done = goal.saved >= goal.target;
        const card = document.createElement('div');
        card.className = 'goal-card' + (done ? ' goal-done' : '');
        card.innerHTML = `
            <div class="goal-header">
                <div class="goal-emoji">${goal.emoji || '🎯'}</div>
                <div class="goal-info">
                    <strong>${goal.name}</strong>
                    <small>${fmt(goal.saved)} / ${fmt(goal.target)}</small>
                </div>
                <div class="goal-actions">
                    <button class="goal-add-btn" data-id="${goal.id}" title="Add savings">＋</button>
                    <button class="del-btn" data-goal-id="${goal.id}">✕</button>
                </div>
            </div>
            <div class="progress-outer" style="margin:10px 0 4px;">
                <div class="progress-bar" style="width:${pct}%;background:${done ? '#10b981' : '#8b5cf6'}"></div>
            </div>
            <div class="goal-footer">
                <span class="pct-chip">${pct}%</span>
                ${done ? '<span class="goal-badge">✅ Reached!</span>' : `<span class="goal-remaining">${fmt(goal.target - goal.saved)} to go</span>`}
            </div>`;
        container.appendChild(card);
    });
}

document.getElementById('goals-list').addEventListener('click', function (e) {
    if (e.target.closest('.goal-add-btn')) {
        const id = parseInt(e.target.closest('.goal-add-btn').dataset.id);
        const goal = savingsGoals.find(g => g.id === id);
        const added = parseFloat(prompt(`Add how much to "${goal.name}"? (Current: ${fmt(goal.saved)})`));
        if (isNaN(added) || added <= 0) return;
        const wasComplete = goal.saved >= goal.target;
        goal.saved = Math.min(goal.target, goal.saved + added);
        localStorage.setItem('savings_goals', JSON.stringify(savingsGoals));
        if (!wasComplete && goal.saved >= goal.target) launchConfetti();
        renderGoals();
        return;
    }
    if (e.target.closest('.del-btn')) {
        const id = parseInt(e.target.closest('.del-btn').dataset.goalId);
        savingsGoals = savingsGoals.filter(g => g.id !== id);
        localStorage.setItem('savings_goals', JSON.stringify(savingsGoals));
        renderGoals();
    }
});

document.getElementById('add-goal-btn').addEventListener('click', function () {
    document.getElementById('goal-form-wrap').classList.toggle('hidden');
});

document.getElementById('cancel-goal-btn').addEventListener('click', function () {
    document.getElementById('goal-form-wrap').classList.add('hidden');
    document.getElementById('goal-form').reset();
});

document.getElementById('goal-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('goal-name').value.trim();
    const target = parseFloat(document.getElementById('goal-target').value);
    const saved = parseFloat(document.getElementById('goal-saved').value) || 0;
    const emoji = document.getElementById('goal-emoji').value.trim() || '🎯';
    if (!name || isNaN(target) || target <= 0) { alert('Name and target amount are required.'); return; }
    savingsGoals.push({ id: Date.now(), name, target, saved, emoji });
    localStorage.setItem('savings_goals', JSON.stringify(savingsGoals));
    this.reset();
    document.getElementById('goal-form-wrap').classList.add('hidden');
    renderGoals();
});

function renderRecurring() {
    const ul = document.getElementById('rec-list');
    const summary = document.getElementById('rec-summary');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let monthlyTotal = 0;
    recurringBills.forEach(b => {
        if (b.freq === 'monthly') monthlyTotal += b.amount;
        else if (b.freq === 'yearly') monthlyTotal += b.amount / 12;
        else if (b.freq === 'weekly') monthlyTotal += b.amount * 4.33;
    });

    summary.innerHTML = recurringBills.length === 0 ? '' : `
        <span class="rec-stat-chip">📋 ${recurringBills.length} bills</span>
        <span class="rec-stat-chip">💸 ~${fmt(monthlyTotal)} / month</span>
        <span class="rec-stat-chip">📅 ~${fmt(monthlyTotal * 12)} / year</span>`;

    if (recurringBills.length === 0) {
        ul.innerHTML = '<li class="empty-state">No recurring bills yet — add one! 📋</li>';
        return;
    }

    const sorted = [...recurringBills].sort((a, b) => (a.due || '') > (b.due || '') ? 1 : -1);
    ul.innerHTML = '';
    sorted.forEach(b => {
        const color = CAT_COLORS[b.cat] || '#94a3b8';
        const dueDate = b.due ? new Date(b.due) : null;
        const daysUntil = dueDate && !isNaN(dueDate) ? Math.ceil((dueDate - today) / 86400000) : null;

        let dueBadge = '';
        if (daysUntil !== null) {
            if (daysUntil < 0) dueBadge = `<span class="due-badge overdue">Overdue</span>`;
            else if (daysUntil === 0) dueBadge = `<span class="due-badge today">Due Today!</span>`;
            else if (daysUntil <= 3) dueBadge = `<span class="due-badge soon">Due in ${daysUntil}D</span>`;
            else dueBadge = `<span class="due-badge ok">Due in ${daysUntil}D</span>`;
        }

        let monthlyEq = b.amount;
        if (b.freq === 'yearly') monthlyEq = b.amount / 12;
        else if (b.freq === 'weekly') monthlyEq = b.amount * 4.33;

        const li = document.createElement('li');
        li.className = 'ledger-item fade-in';
        li.innerHTML = `
            <div class="ledger-left">
                <div class="ledger-accent" style="background:${color}"></div>
                <div class="ledger-info">
                    <strong>${b.name}</strong>
                    <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:4px;">
                        <span class="cat-badge" style="background:${color}22;color:${color}">${b.cat}</span>
                        <span class="freq-badge">${b.freq}</span>
                        ${dueBadge}
                    </div>
                    <small>~${fmt(monthlyEq)}/mo</small>
                </div>
            </div>
            <div class="ledger-right">
                <span style="color:#f43f5e;font-weight:600;">${fmt(b.amount)}</span>
                <button class="del-btn" data-rec-id="${b.id}">✕</button>
            </div>`;
        ul.appendChild(li);
    });
}

document.getElementById('rec-list').addEventListener('click', function (e) {
    const btn = e.target.closest('.del-btn');
    if (!btn) return;
    const id = parseInt(btn.dataset.recId);
    recurringBills = recurringBills.filter(b => b.id !== id);
    localStorage.setItem('recurring_bills', JSON.stringify(recurringBills));
    renderRecurring();
});

document.getElementById('add-rec-btn').addEventListener('click', function () {
    document.getElementById('rec-form-wrap').classList.toggle('hidden');
});

document.getElementById('cancel-rec-btn').addEventListener('click', function () {
    document.getElementById('rec-form-wrap').classList.add('hidden');
    document.getElementById('rec-form').reset();
});

document.getElementById('rec-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('rec-name').value.trim();
    const amount = parseFloat(document.getElementById('rec-amount').value);
    const freq = document.getElementById('rec-freq').value;
    const cat = document.getElementById('rec-cat').value;
    const due = document.getElementById('rec-due').value;
    if (!name || isNaN(amount) || amount <= 0) { alert('Name and amount are required.'); return; }
    recurringBills.push({ id: Date.now(), name, amount, freq, cat, due });
    localStorage.setItem('recurring_bills', JSON.stringify(recurringBills));
    this.reset();
    document.getElementById('rec-form-wrap').classList.add('hidden');
    renderRecurring();
});

function renderInsights() {
    let income = 0, expense = 0;
    transactions.forEach(t => {
        if (t.amount > 0) income += t.amount;
        else expense += Math.abs(t.amount);
    });
    const savingsRate = income > 0 ? (((income - expense) / income) * 100).toFixed(1) : 0;
    const avgTx = transactions.length > 0 ? (transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / transactions.length) : 0;

    document.getElementById('insight-kpis').innerHTML = `
        <div class="card stat-card">
            <small class="stat-label">Savings Rate</small>
            <h2 class="stat-value" style="color:${savingsRate >= 20 ? '#10b981' : '#f43f5e'}">${savingsRate}%</h2>
        </div>
        <div class="card stat-card">
            <small class="stat-label">Avg. Transaction</small>
            <h2 class="stat-value">${fmt(avgTx)}</h2>
        </div>
        <div class="card stat-card">
            <small class="stat-label">Total Transactions</small>
            <h2 class="stat-value">${transactions.length}</h2>
        </div>`;

    const catTotals = {};
    transactions.filter(t => t.amount < 0).forEach(t => {
        catTotals[t.category] = (catTotals[t.category] || 0) + Math.abs(t.amount);
    });
    const sorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
    const totalExp = sorted.reduce((s, [, v]) => s + v, 0);

    document.getElementById('insight-top-cats').innerHTML = sorted.slice(0, 5).map(([cat, val], i) => {
        const color = CAT_COLORS[cat] || '#94a3b8';
        const pct = totalExp > 0 ? ((val / totalExp) * 100).toFixed(1) : 0;
        return `<div style="margin-bottom:14px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
                <span style="color:${color};font-weight:600;">#${i + 1} ${cat}</span>
                <span style="color:var(--muted);font-size:.83rem;">${pct}%&nbsp;&nbsp;${fmt(val)}</span>
            </div>
            <div class="progress-outer" style="height:7px;">
                <div class="progress-bar" style="width:${pct}%;background:${color};"></div>
            </div>
        </div>`;
    }).join('') || '<p class="empty-state">No expenses yet.</p>';

    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    let mIncome = 0, mExpense = 0, mCount = 0;
    transactions.forEach(t => {
        const d = new Date(t.date);
        if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) {
            mCount++;
            if (t.amount > 0) mIncome += t.amount;
            else mExpense += Math.abs(t.amount);
        }
    });
    const monthName = now.toLocaleString('default', { month: 'long' });
    document.getElementById('insight-month').innerHTML = `
        <div class="month-stat"><span>📅 ${monthName} Income</span><strong style="color:#10b981;">+${fmt(mIncome)}</strong></div>
        <div class="month-stat"><span>📅 ${monthName} Expenses</span><strong style="color:#f43f5e;">-${fmt(mExpense)}</strong></div>
        <div class="month-stat"><span>📊 ${monthName} Net</span><strong style="color:${mIncome - mExpense >= 0 ? '#10b981' : '#f43f5e'};">${fmt(mIncome - mExpense)}</strong></div>
        <div class="month-stat"><span>🔢 Transactions</span><strong>${mCount}</strong></div>`;

    const tips = [];
    if (savingsRate < 20) tips.push({ icon: '⚠️', text: `Your savings rate is <strong>${savingsRate}%</strong>. Aim for at least 20%.` });
    else tips.push({ icon: '✅', text: `Great job! Your savings rate of <strong>${savingsRate}%</strong> is on track.` });
    if (sorted.length > 0) tips.push({ icon: '🔍', text: `Biggest expense: <strong>${sorted[0][0]}</strong> (${fmt(sorted[0][1])}). Consider reducing it.` });
    if (recurringBills.length > 0) {
        let monthTotal = 0;
        recurringBills.forEach(b => {
            if (b.freq === 'monthly') monthTotal += b.amount;
            else if (b.freq === 'yearly') monthTotal += b.amount / 12;
            else if (b.freq === 'weekly') monthTotal += b.amount * 4.33;
        });
        tips.push({ icon: '📋', text: `You have <strong>${recurringBills.length} recurring bill(s)</strong> totalling ~${fmt(monthTotal)}/month.` });
    }
    const unfinished = savingsGoals.filter(g => g.saved < g.target);
    if (unfinished.length > 0) tips.push({ icon: '🎯', text: `You have <strong>${unfinished.length} active savings goal(s)</strong>. Keep contributing regularly!` });

    document.getElementById('insight-tips').innerHTML = tips.map(t =>
        `<div class="tip-item"><span class="tip-icon">${t.icon}</span><p>${t.text}</p></div>`
    ).join('');
}

function renderReports() {
    const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    let running = 0;
    const labels = [];
    const data = [];
    sorted.forEach(t => {
        running += t.amount;
        labels.push(t.date);
        data.push(parseFloat(running.toFixed(2)));
    });
    if (trendChart) trendChart.destroy();
    const ctx2 = document.getElementById('lineTrend').getContext('2d');
    trendChart = new Chart(ctx2, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Balance (USD)',
                data,
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139,92,246,0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: '#8b5cf6'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#94a3b8' } } },
            scales: {
                x: { ticks: { color: '#94a3b8', maxTicksLimit: 8 }, grid: { color: '#334155' } },
                y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
            }
        }
    });
}

function renderBudget() {
    let income = 0, expense = 0;
    transactions.forEach(t => {
        if (t.amount > 0) income += t.amount;
        else expense += Math.abs(t.amount);
    });
    const saved = income - expense;
    const pct = Math.min(100, savingsGoal > 0 ? (saved / savingsGoal) * 100 : 0);
    document.getElementById('progress-inner').style.width = pct + '%';
    document.getElementById('progress-label').textContent = `${fmt(Math.max(0, saved))} saved of ${fmt(savingsGoal)} (${pct.toFixed(1)}%)`;

    const catTotals = {};
    transactions.filter(t => t.amount < 0).forEach(t => {
        catTotals[t.category] = (catTotals[t.category] || 0) + Math.abs(t.amount);
    });
    const totalExp = Object.values(catTotals).reduce((a, b) => a + b, 0);
    const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
    const breakdownEl = document.getElementById('category-breakdown');
    if (sortedCats.length === 0) {
        breakdownEl.innerHTML = '<p class="empty-state">No expenses recorded yet.</p>';
        return;
    }
    breakdownEl.innerHTML = sortedCats.map(([cat, val]) => {
        const color = CAT_COLORS[cat] || '#94a3b8';
        const pct = totalExp > 0 ? ((val / totalExp) * 100).toFixed(1) : 0;
        return `<div style="margin-bottom:14px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                <span style="font-size:.88rem;">${cat}</span>
                <span style="font-size:.83rem;color:var(--muted);">${pct}% &nbsp; ${fmt(val)}</span>
            </div>
            <div class="progress-outer" style="height:8px;">
                <div class="progress-bar" style="width:${pct}%;background:${color};"></div>
            </div>
        </div>`;
    }).join('');
}

goalInput.addEventListener('change', function () {
    const val = parseFloat(this.value);
    if (!isNaN(val) && val > 0) {
        savingsGoal = val;
        localStorage.setItem('savings_goal', savingsGoal);
        renderBudget();
    }
});

renderDashboard();
