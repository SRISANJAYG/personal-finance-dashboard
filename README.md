# FinanceDash Pro — Interactive Financial Ledger

## Project Description
FinanceDash Pro is a high-performance, single-page application (SPA) designed for real-time personal finance management. Built entirely with Vanilla JavaScript, the platform allows users to track income and expenses across multiple currencies (USD/INR) with automatic conversion. It provides a centralized dashboard for financial oversight, data visualization, and persistent record-keeping.

## Problem Statement
Individual financial tracking is often fragmented, and users frequently deal with multiple currencies without a clear way to see their unified net worth. FinanceDash Pro solves this by providing a responsive interface that automates currency conversion via live market rates, calculates balances instantly, and offers visual trend analysis to improve financial literacy.

## Features Implemented
* **Multi-Currency Support**: Integrated a currency selector (USD/INR) that automatically converts INR entries to the base USD value for unified reporting.
* **External API Integration**: Uses the `Fetch API` to retrieve real-time exchange rates from an external service to ensure conversion accuracy.
* **Interactive Charts**: Utilizes Chart.js for real-time spending analysis (Doughnut) and balance history trends (Line graph).
* **Single-Page Architecture**: A custom navigation system that toggles between Dashboard, Transactions, Reports, and Budget views without page reloads.
* **Data Persistence**: Full integration with the `LocalStorage API` to save transaction history across browser sessions.
* **Automated Budgeting**: A progress tracking system that dynamically calculates percentage completion against a $5,000 monthly target.

## DOM Concepts Used
* **Dynamic Element Creation**: Leveraging `document.createElement` and `appendChild` to render the transaction ledger based on user input.
* **Event-Driven Programming**: Implementation of `addEventListener` for form submissions, navigation switching, and interactive chart updates.
* **State Synchronization**: Logic that ensures the internal JavaScript data array and the DOM (Net Worth, Income, Expenses) stay perfectly in sync.
* **Conditional Rendering**: Managed section visibility using CSS class toggling (`hidden`) to create a fluid SPA experience.
* **Attribute Management**: Used `getAttribute` and `data-` attributes to handle navigation logic and unique transaction identification.

## Steps to Run the Project
1. Clone the repository: `git clone https://github.com/SRISANJAYG/personal-finance-dashboard.git`
2. Navigate to the project directory.
3. Open `index.html` in any modern web browser.
4. Ensure you have an active internet connection for live currency rate fetching.

## Known Limitations
* Data is stored locally; clearing browser cache will reset the application data.
* Live currency conversion requires an internet connection; it defaults to a static rate if the API is unreachable.
