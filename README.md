# FinanceDash Pro

A personal finance tracker built with vanilla HTML, CSS, and JavaScript. Tracks income and expenses, manages savings goals, monitors recurring bills, and gives spending insights — all stored locally in the browser.

## Features

- **Dashboard** — Net worth, income, and expense summary cards with an animated counter and a financial health score bar
- **Transactions** — Add income or expense entries (USD or INR), search and filter by category or type, delete individual entries
- **Savings Goals** — Create goals with a target amount, track progress with a visual bar, get confetti 🎉 when you hit 100%
- **Recurring Bills** — Log subscriptions and bills with due dates; see overdue/upcoming warnings
- **Insights** — Savings rate, top spending categories, month summary, and smart tips
- **Reports** — Line chart showing balance trend over time
- **Budget** — Set a savings target and track how close you are
- **Streak tracker** 🔥 — Shows how many consecutive days you've logged transactions
- **Live USD/INR rate** — Pulled from exchangerate-api.com on load

## Tech Stack

| Layer | Tool |
|---|---|
| Structure | HTML5 |
| Styling | CSS3 (custom properties, glassmorphism, animations) |
| Logic | Vanilla JavaScript (no frameworks) |
| Charts | Chart.js (CDN) |
| Storage | localStorage |
| Font | Plus Jakarta Sans (Google Fonts) |

## Getting Started

Just open `index.html` in any modern browser — no build step, no dependencies to install.

If you use VS Code, the **Live Server** extension works great:
1. Right-click `index.html`
2. Select **Open with Live Server**

## Project Structure

```
personal_finance/
├── index.html      — App layout and markup
├── style.css       — All styles (Paylix-inspired dark theme)
├── script.js       — All app logic and DOM interactions
└── README.md       — This file
```

## Data Storage

Everything is saved in `localStorage` under these keys:

| Key | Contents |
|---|---|
| `finance_data` | Transaction history |
| `savings_goals` | Savings goal list |
| `recurring_bills` | Recurring bill list |
| `savings_goal` | Budget target amount |

Clearing browser storage will reset the app.

## Design Inspiration

UI inspired by the [Paylix](https://www.behance.net/gallery/244270373/Paylix-Budget-and-Expense-Tracker-App-UI-UX-Design) Finance Tracker concept on Behance — dark theme, large pill-shaped cards, vibrant purple accents, and clean bold typography.
