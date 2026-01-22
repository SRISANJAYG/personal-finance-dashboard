# FinanceDash  - Interactive Financial Dashboard

## Project Description
FinanceDash Pro is a comprehensive frontend web application designed to help users manage their personal finances through a clean, intuitive dashboard interface. It provides a real-time overview of net worth, income, and expenses, while offering historical tracking and visual trend analysis.

## Problem Statement
Managing personal daily expenses often feels scattered or overly complex with manual ledgers. Users need a centralized, automated tool that not only records transactions but also provides immediate visual feedback on their financial health and progress toward savings goals.

## Features Implemented
* **Dynamic Dashboard:** Real-time calculation of Net Worth, Total Income, and Total Expenses.
* **Interactive Charts:** Doughnut charts for expense distribution and Line graphs for balance trends over time.
* **Single Page Navigation:** Smooth switching between Dashboard, Transactions, Reports, and Budget views using JavaScript state logic.
* **Persistence:** Integration with Browser LocalStorage to ensure data remains available after page refreshes.
* **Automated Budgeting:** A dynamic progress tracking system based on a $5,000 monthly target.
* **Timestamped History:** Automatic logging of date and time for every transaction entry.

## DOM Concepts Used
* **Dynamic Element Creation:** Using `document.createElement` and `appendChild` to render the transaction ledger.
* **Event Handling:** Utilizing `addEventListener` for form submissions, navigation clicks, and dynamic data filtering.
* **State Manipulation:** Synchronizing JavaScript objects with the DOM to reflect balance updates instantly.
* **Conditional Rendering:** Using CSS classes (`hidden`) and JS logic to toggle views without reloading the page.
* **Attribute Management:** Leveraging `data-` attributes to handle navigation and unique transaction IDs.

## Steps to Run the Project
1. Clone the repository:```bash
    git clone [https://github.com/SRISANJAYG/personal-finance-dashboard.git](https://github.com/SRISANJAYG/personal-finance-dashboard.git)
    ```
2. Navigate to the project folder.
3. Open `index.html` in any modern web browser.
4. (Optional) Use a Live Server extension in VS Code for a better development experience.

## Known Limitations
* Data is stored locally in the browser; clearing browser cache will reset the ledger.
* Currently supports a single currency ($).
