// ============================================
// Money Flow - Application Logic
// ============================================

// State Management
const state = {
    wallets: [],
    transactions: [],
    loans: [],
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    currentPage: 'dashboard',
    currentLoanTab: 'given',
    editingWalletId: null,
    editingTransactionId: null
};

// DOM Elements
const elements = {
    // Navigation
    navItems: document.querySelectorAll('.nav-item'),
    pages: document.querySelectorAll('.page'),
    pageTitle: document.querySelector('.page-title'),

    // Month Selector
    prevMonth: document.getElementById('prevMonth'),
    nextMonth: document.getElementById('nextMonth'),
    currentMonth: document.getElementById('currentMonth'),

    // Buttons
    addTransactionBtn: document.getElementById('addTransactionBtn'),
    addWalletBtn: document.getElementById('addWalletBtn'),
    addLoanBtn: document.getElementById('addLoanBtn'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),

    // Grids & Lists
    walletsGrid: document.getElementById('walletsGrid'),
    recentTransactions: document.getElementById('recentTransactions'),
    allTransactions: document.getElementById('allTransactions'),
    loansList: document.getElementById('loansList'),

    // Summary
    totalIncome: document.getElementById('totalIncome'),
    totalExpenses: document.getElementById('totalExpenses'),
    netBalance: document.getElementById('netBalance'),

    // Filters
    filterType: document.getElementById('filterType'),
    filterWallet: document.getElementById('filterWallet'),

    // Loan Tabs
    loanTabs: document.querySelectorAll('.tab-btn'),

    // Modals
    transactionModal: document.getElementById('transactionModal'),
    walletModal: document.getElementById('walletModal'),
    loanModal: document.getElementById('loanModal'),
    paymentModal: document.getElementById('paymentModal'),

    // Forms
    transactionForm: document.getElementById('transactionForm'),
    walletForm: document.getElementById('walletForm'),
    loanForm: document.getElementById('loanForm'),
    paymentForm: document.getElementById('paymentForm'),

    // Transaction Form Fields
    transactionWallet: document.getElementById('transactionWallet'),
    toWallet: document.getElementById('toWallet'),
    transactionAmount: document.getElementById('transactionAmount'),
    transactionCategory: document.getElementById('transactionCategory'),
    transactionDescription: document.getElementById('transactionDescription'),
    transactionDate: document.getElementById('transactionDate'),
    typeBtns: document.querySelectorAll('.type-btn[data-type]'),
    transferField: document.querySelector('.transfer-field'),
    nonTransferFields: document.querySelectorAll('.non-transfer-field'),

    // Wallet Form Fields
    walletName: document.getElementById('walletName'),
    walletCurrency: document.getElementById('walletCurrency'),
    walletBalance: document.getElementById('walletBalance'),

    // Loan Form Fields
    loanPerson: document.getElementById('loanPerson'),
    loanAmount: document.getElementById('loanAmount'),
    loanCurrency: document.getElementById('loanCurrency'),
    loanDate: document.getElementById('loanDate'),
    loanDueDate: document.getElementById('loanDueDate'),
    loanNote: document.getElementById('loanNote'),
    loanTypeBtns: document.querySelectorAll('.type-btn[data-loan-type]'),

    // Payment Form Fields
    paymentLoanId: document.getElementById('paymentLoanId'),
    paymentAmount: document.getElementById('paymentAmount'),
    paymentDate: document.getElementById('paymentDate'),

    // Toast
    toastContainer: document.getElementById('toastContainer'),

    // Sidebar
    sidebar: document.querySelector('.sidebar'),

    // Theme Toggle
    themeToggle: document.getElementById('themeToggle')
};

// Category Lists for Income and Expense
const categories = {
    income: [
        { value: 'Freelance', label: '💼 Freelance' },
        { value: 'Upwork', label: '🔗 Upwork' },
        { value: 'Fiverr', label: '🎯 Fiverr' },
        { value: 'Client Direct', label: '🤝 Client Direct' },
        { value: 'Salary', label: '💰 Salary' },
        { value: 'Investment', label: '📈 Investment' },
        { value: 'Bonus', label: '🎁 Bonus' },
        { value: 'Refund', label: '↩️ Refund' },
        { value: 'Other Income', label: '💵 Other Income' }
    ],
    expense: [
        { value: 'Food', label: '🍔 Food' },
        { value: 'Transport', label: '🚌 Transport' },
        { value: 'Bills', label: '📃 Bills' },
        { value: 'Rent', label: '🏠 Rent' },
        { value: 'Server/Hosting', label: '🖥️ Server/Hosting' },
        { value: 'Software', label: '💿 Software' },
        { value: 'Marketing', label: '📢 Marketing' },
        { value: 'Office', label: '🏢 Office' },
        { value: 'Shopping', label: '🛒 Shopping' },
        { value: 'Entertainment', label: '🎬 Entertainment' },
        { value: 'Healthcare', label: '🏥 Healthcare' },
        { value: 'Education', label: '📚 Education' },
        { value: 'Personal', label: '👤 Personal' },
        { value: 'Other Expense', label: '💸 Other Expense' }
    ]
};

// Function to update category dropdown based on type
function updateCategoryDropdown(type) {
    const categorySelect = elements.transactionCategory;
    const categoryList = categories[type] || categories.income;

    categorySelect.innerHTML = categoryList.map(cat =>
        `<option value="${cat.value}">${cat.label}</option>`
    ).join('');
}

// ============================================
// Utility Functions
// ============================================

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatCurrency(amount, currency) {
    const symbols = {
        LKR: 'Rs.',
        USDT: 'USDT',
        USD: '$'
    };

    const formatted = amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    if (currency === 'USD') {
        return `$${formatted}`;
    }
    return `${symbols[currency]} ${formatted}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function getMonthName(month, year) {
    const date = new Date(year, month);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${type === 'success' ? '✓' : '✕'}</span>
        <span>${message}</span>
    `;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ============================================
// Local Storage
// ============================================

function saveToStorage() {
    localStorage.setItem('moneyflow_wallets', JSON.stringify(state.wallets));
    localStorage.setItem('moneyflow_transactions', JSON.stringify(state.transactions));
    localStorage.setItem('moneyflow_loans', JSON.stringify(state.loans));
}

function loadFromStorage() {
    const wallets = localStorage.getItem('moneyflow_wallets');
    const transactions = localStorage.getItem('moneyflow_transactions');
    const loans = localStorage.getItem('moneyflow_loans');

    if (wallets) state.wallets = JSON.parse(wallets);
    if (transactions) state.transactions = JSON.parse(transactions);
    if (loans) state.loans = JSON.parse(loans);
}

// ============================================
// Wallet Management
// ============================================

function createWallet(name, currency, balance = 0) {
    const wallet = {
        id: generateId(),
        name,
        currency,
        balance: parseFloat(balance)
    };
    state.wallets.push(wallet);
    saveToStorage();
    return wallet;
}

function updateWallet(id, data) {
    const index = state.wallets.findIndex(w => w.id === id);
    if (index !== -1) {
        state.wallets[index] = { ...state.wallets[index], ...data };
        saveToStorage();
    }
}

function deleteWallet(id) {
    const hasTransactions = state.transactions.some(t => t.walletId === id || t.toWalletId === id);
    if (hasTransactions) {
        showToast('Cannot delete wallet with transactions', 'error');
        return false;
    }
    state.wallets = state.wallets.filter(w => w.id !== id);
    saveToStorage();
    return true;
}

function getWallet(id) {
    return state.wallets.find(w => w.id === id);
}

function renderWallets() {
    if (state.wallets.length === 0) {
        elements.walletsGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1">
                <div class="empty-state-icon">💳</div>
                <p>No wallets yet. Add your first wallet!</p>
            </div>
        `;
        return;
    }

    elements.walletsGrid.innerHTML = state.wallets.map(wallet => `
        <div class="wallet-card ${wallet.currency.toLowerCase()}">
            <div class="wallet-header">
                <div class="wallet-currency">
                    <span class="currency-badge">${wallet.currency}</span>
                </div>
                <div class="wallet-actions">
                    <button class="wallet-action-btn" onclick="editWallet('${wallet.id}')" title="Edit">✏️</button>
                    <button class="wallet-action-btn" onclick="confirmDeleteWallet('${wallet.id}')" title="Delete">🗑️</button>
                </div>
            </div>
            <div class="wallet-name">${wallet.name}</div>
            <div class="wallet-balance">${formatCurrency(wallet.balance, wallet.currency)}</div>
            <div class="wallet-balance-label">Available Balance</div>
        </div>
    `).join('');
}

function populateWalletSelects() {
    const options = state.wallets.map(w =>
        `<option value="${w.id}">${w.name} (${w.currency})</option>`
    ).join('');

    elements.transactionWallet.innerHTML = options || '<option value="">No wallets available</option>';
    elements.toWallet.innerHTML = options || '<option value="">No wallets available</option>';
    elements.filterWallet.innerHTML = '<option value="all">All Wallets</option>' + options;
}

function editWallet(id) {
    const wallet = getWallet(id);
    if (!wallet) return;

    state.editingWalletId = id;
    elements.walletName.value = wallet.name;
    elements.walletCurrency.value = wallet.currency;
    elements.walletBalance.value = wallet.balance;
    document.querySelector('#walletModal .modal-title').textContent = 'Edit Wallet';
    openModal(elements.walletModal);
}

function confirmDeleteWallet(id) {
    if (confirm('Are you sure you want to delete this wallet?')) {
        if (deleteWallet(id)) {
            showToast('Wallet deleted successfully');
            renderAll();
        }
    }
}

// ============================================
// Transaction Management
// ============================================

function createTransaction(data) {
    const wallet = getWallet(data.walletId);
    if (!wallet) return null;

    const transaction = {
        id: generateId(),
        type: data.type,
        amount: parseFloat(data.amount),
        walletId: data.walletId,
        toWalletId: data.toWalletId || null,
        category: data.category || '',
        description: data.description || '',
        date: data.date
    };

    // Update wallet balances
    if (data.type === 'income') {
        wallet.balance += transaction.amount;
    } else if (data.type === 'expense') {
        wallet.balance -= transaction.amount;
    } else if (data.type === 'transfer') {
        const toWallet = getWallet(data.toWalletId);
        if (!toWallet) return null;
        wallet.balance -= transaction.amount;
        toWallet.balance += transaction.amount;
    }

    state.transactions.push(transaction);
    saveToStorage();
    return transaction;
}

function deleteTransaction(id) {
    const transaction = state.transactions.find(t => t.id === id);
    if (!transaction) return;

    const wallet = getWallet(transaction.walletId);
    if (wallet) {
        if (transaction.type === 'income') {
            wallet.balance -= transaction.amount;
        } else if (transaction.type === 'expense') {
            wallet.balance += transaction.amount;
        } else if (transaction.type === 'transfer') {
            const toWallet = getWallet(transaction.toWalletId);
            wallet.balance += transaction.amount;
            if (toWallet) toWallet.balance -= transaction.amount;
        }
    }

    state.transactions = state.transactions.filter(t => t.id !== id);
    saveToStorage();
}

function getFilteredTransactions(limit = null) {
    let filtered = state.transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === state.currentMonth &&
            date.getFullYear() === state.currentYear;
    });

    // Apply type filter
    const typeFilter = elements.filterType.value;
    if (typeFilter !== 'all') {
        filtered = filtered.filter(t => t.type === typeFilter);
    }

    // Apply wallet filter
    const walletFilter = elements.filterWallet.value;
    if (walletFilter !== 'all') {
        filtered = filtered.filter(t =>
            t.walletId === walletFilter || t.toWalletId === walletFilter
        );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (limit) {
        return filtered.slice(0, limit);
    }
    return filtered;
}

function renderTransactions(container, transactions) {
    if (transactions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <p>No transactions for this month</p>
            </div>
        `;
        return;
    }

    container.innerHTML = transactions.map(t => {
        const wallet = getWallet(t.walletId);
        const toWallet = t.toWalletId ? getWallet(t.toWalletId) : null;

        const icons = {
            income: '📈',
            expense: '📉',
            transfer: '↔️'
        };

        const prefixes = {
            income: '+',
            expense: '-',
            transfer: ''
        };

        let walletDisplay = wallet ? `${wallet.currency}` : '';
        if (t.type === 'transfer' && toWallet) {
            walletDisplay = `${wallet?.currency || ''} → ${toWallet.currency}`;
        }

        return `
            <div class="transaction-item ${t.type}">
                <div class="transaction-icon">${icons[t.type]}</div>
                <div class="transaction-details">
                    <div class="transaction-title">${t.description || t.category || t.type}</div>
                    <div class="transaction-meta">
                        <span>${formatDate(t.date)}</span>
                        ${t.category ? `<span>${t.category}</span>` : ''}
                    </div>
                </div>
                <div class="transaction-amount">
                    <div class="amount">${prefixes[t.type]}${formatCurrency(t.amount, wallet?.currency || 'LKR')}</div>
                    <div class="wallet-name">${walletDisplay}</div>
                </div>
                <div class="transaction-actions">
                    <button class="wallet-action-btn" onclick="confirmDeleteTransaction('${t.id}')" title="Delete">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

function confirmDeleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        deleteTransaction(id);
        showToast('Transaction deleted');
        renderAll();
    }
}

function calculateMonthlySummary() {
    const transactions = getFilteredTransactions();

    // Group by currency for totals
    const totals = {
        income: { LKR: 0, USDT: 0, USD: 0 },
        expense: { LKR: 0, USDT: 0, USD: 0 }
    };

    transactions.forEach(t => {
        const wallet = getWallet(t.walletId);
        if (!wallet) return;

        if (t.type === 'income') {
            totals.income[wallet.currency] += t.amount;
        } else if (t.type === 'expense') {
            totals.expense[wallet.currency] += t.amount;
        }
    });

    // Display the primary currency or mixed
    const displayIncome = formatMultiCurrency(totals.income);
    const displayExpense = formatMultiCurrency(totals.expense);
    const displayNet = formatNetBalance(totals.income, totals.expense);

    elements.totalIncome.textContent = displayIncome;
    elements.totalExpenses.textContent = displayExpense;
    elements.netBalance.textContent = displayNet;
}

function formatMultiCurrency(amounts) {
    const nonZero = Object.entries(amounts).filter(([_, val]) => val > 0);
    if (nonZero.length === 0) return 'Rs. 0.00';
    if (nonZero.length === 1) {
        return formatCurrency(nonZero[0][1], nonZero[0][0]);
    }
    return nonZero.map(([cur, val]) => formatCurrency(val, cur)).join(' | ');
}

function formatNetBalance(income, expense) {
    // Calculate net for each currency
    const currencies = ['LKR', 'USDT', 'USD'];
    const nets = currencies
        .map(cur => ({ currency: cur, amount: income[cur] - expense[cur] }))
        .filter(n => n.amount !== 0);

    if (nets.length === 0) return 'Rs. 0.00';
    if (nets.length === 1) {
        return formatCurrency(nets[0].amount, nets[0].currency);
    }
    return nets.map(n => formatCurrency(n.amount, n.currency)).join(' | ');
}

// ============================================
// Loan Management
// ============================================

function createLoan(data) {
    const loan = {
        id: generateId(),
        type: data.type,
        personName: data.personName,
        amount: parseFloat(data.amount),
        currency: data.currency,
        date: data.date,
        dueDate: data.dueDate || null,
        note: data.note || '',
        status: 'pending',
        payments: []
    };

    state.loans.push(loan);
    saveToStorage();
    return loan;
}

function addPayment(loanId, amount, date) {
    const loan = state.loans.find(l => l.id === loanId);
    if (!loan) return;

    loan.payments.push({
        id: generateId(),
        amount: parseFloat(amount),
        date
    });

    // Check if fully paid
    const totalPaid = loan.payments.reduce((sum, p) => sum + p.amount, 0);
    if (totalPaid >= loan.amount) {
        loan.status = 'paid';
    }

    saveToStorage();
}

function deleteLoan(id) {
    state.loans = state.loans.filter(l => l.id !== id);
    saveToStorage();
}

function getFilteredLoans() {
    return state.loans.filter(l => l.type === state.currentLoanTab);
}

function renderLoans() {
    const loans = getFilteredLoans();

    if (loans.length === 0) {
        elements.loansList.innerHTML = `
            <div class="empty-state" style="background: var(--bg-card); border-radius: var(--radius-lg); padding: 3rem;">
                <div class="empty-state-icon">💳</div>
                <p>No ${state.currentLoanTab === 'given' ? 'money given' : 'money taken'} records</p>
            </div>
        `;
        return;
    }

    elements.loansList.innerHTML = loans.map(loan => {
        const totalPaid = loan.payments.reduce((sum, p) => sum + p.amount, 0);
        const remaining = loan.amount - totalPaid;
        const progress = (totalPaid / loan.amount) * 100;

        return `
            <div class="loan-card">
                <div class="loan-header">
                    <div class="loan-person">${loan.personName}</div>
                    <span class="loan-status ${loan.status}">${loan.status === 'paid' ? 'Paid' : 'Pending'}</span>
                </div>
                <div class="loan-amount-row">
                    <div class="loan-amount">${formatCurrency(loan.amount, loan.currency)}</div>
                    ${loan.status !== 'paid' ? `<div class="loan-remaining">Remaining: ${formatCurrency(remaining, loan.currency)}</div>` : ''}
                </div>
                <div class="loan-progress">
                    <div class="loan-progress-bar" style="width: ${progress}%"></div>
                </div>
                <div class="loan-meta">
                    <span>📅 ${formatDate(loan.date)}</span>
                    ${loan.dueDate ? `<span>⏰ Due: ${formatDate(loan.dueDate)}</span>` : ''}
                    ${loan.note ? `<span>📝 ${loan.note}</span>` : ''}
                </div>
                <div class="loan-actions">
                    ${loan.status !== 'paid' ? `<button class="btn btn-success btn-sm" onclick="openPaymentModal('${loan.id}')">+ Add Payment</button>` : ''}
                    <button class="btn btn-outline btn-sm" onclick="confirmDeleteLoan('${loan.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function confirmDeleteLoan(id) {
    if (confirm('Are you sure you want to delete this loan record?')) {
        deleteLoan(id);
        showToast('Loan deleted');
        renderLoans();
    }
}

function openPaymentModal(loanId) {
    elements.paymentLoanId.value = loanId;
    elements.paymentAmount.value = '';
    elements.paymentDate.value = new Date().toISOString().split('T')[0];
    openModal(elements.paymentModal);
}

// ============================================
// Modal Management
// ============================================

function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function closeAllModals() {
    [elements.transactionModal, elements.walletModal, elements.loanModal, elements.paymentModal]
        .forEach(modal => closeModal(modal));
}

// ============================================
// Navigation
// ============================================

function switchPage(pageName) {
    state.currentPage = pageName;

    elements.navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.page === pageName);
    });

    elements.pages.forEach(page => {
        page.classList.toggle('active', page.id === `${pageName}Page`);
    });

    const titles = {
        dashboard: 'Dashboard',
        transactions: 'Transactions',
        loans: 'Loans'
    };
    elements.pageTitle.textContent = titles[pageName];

    // Close mobile menu
    elements.sidebar.classList.remove('active');

    // Render page-specific content
    if (pageName === 'transactions') {
        renderTransactions(elements.allTransactions, getFilteredTransactions());
    } else if (pageName === 'loans') {
        renderLoans();
    }
}

function updateMonthDisplay() {
    elements.currentMonth.textContent = getMonthName(state.currentMonth, state.currentYear);
}

function previousMonth() {
    state.currentMonth--;
    if (state.currentMonth < 0) {
        state.currentMonth = 11;
        state.currentYear--;
    }
    updateMonthDisplay();
    renderAll();
}

function nextMonth() {
    state.currentMonth++;
    if (state.currentMonth > 11) {
        state.currentMonth = 0;
        state.currentYear++;
    }
    updateMonthDisplay();
    renderAll();
}

// ============================================
// Event Listeners
// ============================================

function initEventListeners() {
    // Navigation
    elements.navItems.forEach(item => {
        item.addEventListener('click', () => switchPage(item.dataset.page));
    });

    // View All buttons
    document.querySelectorAll('[data-page]').forEach(btn => {
        if (!btn.classList.contains('nav-item')) {
            btn.addEventListener('click', () => switchPage(btn.dataset.page));
        }
    });

    // Month navigation
    elements.prevMonth.addEventListener('click', previousMonth);
    elements.nextMonth.addEventListener('click', nextMonth);

    // Mobile menu
    elements.mobileMenuBtn.addEventListener('click', () => {
        elements.sidebar.classList.toggle('active');
    });

    // Add buttons
    elements.addTransactionBtn.addEventListener('click', () => {
        resetTransactionForm();
        openModal(elements.transactionModal);
    });

    elements.addWalletBtn.addEventListener('click', () => {
        resetWalletForm();
        openModal(elements.walletModal);
    });

    elements.addLoanBtn.addEventListener('click', () => {
        resetLoanForm();
        openModal(elements.loanModal);
    });

    // Close modals
    document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
        el.addEventListener('click', closeAllModals);
    });

    document.getElementById('cancelTransaction').addEventListener('click', () => closeModal(elements.transactionModal));
    document.getElementById('cancelWallet').addEventListener('click', () => closeModal(elements.walletModal));
    document.getElementById('cancelLoan').addEventListener('click', () => closeModal(elements.loanModal));
    document.getElementById('cancelPayment').addEventListener('click', () => closeModal(elements.paymentModal));

    // Transaction type buttons
    elements.typeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.typeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const isTransfer = btn.dataset.type === 'transfer';
            elements.transferField.style.display = isTransfer ? 'block' : 'none';
            elements.nonTransferFields.forEach(f => f.style.display = isTransfer ? 'none' : 'block');

            // Update category dropdown based on type
            if (!isTransfer) {
                updateCategoryDropdown(btn.dataset.type);
            }
        });
    });

    // Loan type buttons
    elements.loanTypeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.loanTypeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Loan tabs
    elements.loanTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            elements.loanTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            state.currentLoanTab = tab.dataset.tab;
            renderLoans();
        });
    });

    // Filters
    elements.filterType.addEventListener('change', () => {
        renderTransactions(elements.allTransactions, getFilteredTransactions());
    });

    elements.filterWallet.addEventListener('change', () => {
        renderTransactions(elements.allTransactions, getFilteredTransactions());
    });

    // Form submissions
    elements.transactionForm.addEventListener('submit', handleTransactionSubmit);
    elements.walletForm.addEventListener('submit', handleWalletSubmit);
    elements.loanForm.addEventListener('submit', handleLoanSubmit);
    elements.paymentForm.addEventListener('submit', handlePaymentSubmit);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllModals();
    });

    // Theme Toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
}

// ============================================
// Form Handlers
// ============================================

function resetTransactionForm() {
    elements.transactionForm.reset();
    elements.typeBtns.forEach(b => b.classList.remove('active'));
    elements.typeBtns[0].classList.add('active');
    elements.transferField.style.display = 'none';
    elements.nonTransferFields.forEach(f => f.style.display = 'block');
    elements.transactionDate.value = new Date().toISOString().split('T')[0];
    document.querySelector('#transactionModal .modal-title').textContent = 'Add Transaction';
    // Initialize category dropdown with income categories (default)
    updateCategoryDropdown('income');
}

function resetWalletForm() {
    elements.walletForm.reset();
    state.editingWalletId = null;
    document.querySelector('#walletModal .modal-title').textContent = 'Add Wallet';
}

function resetLoanForm() {
    elements.loanForm.reset();
    elements.loanTypeBtns.forEach(b => b.classList.remove('active'));
    elements.loanTypeBtns[0].classList.add('active');
    elements.loanDate.value = new Date().toISOString().split('T')[0];
}

function handleTransactionSubmit(e) {
    e.preventDefault();

    const type = document.querySelector('.type-btn[data-type].active').dataset.type;
    const data = {
        type,
        walletId: elements.transactionWallet.value,
        toWalletId: type === 'transfer' ? elements.toWallet.value : null,
        amount: elements.transactionAmount.value,
        category: elements.transactionCategory.value,
        description: elements.transactionDescription.value,
        date: elements.transactionDate.value
    };

    if (!data.walletId) {
        showToast('Please select a wallet', 'error');
        return;
    }

    if (type === 'transfer' && data.walletId === data.toWalletId) {
        showToast('Cannot transfer to the same wallet', 'error');
        return;
    }

    createTransaction(data);
    showToast('Transaction added successfully');
    closeModal(elements.transactionModal);
    renderAll();
}

function handleWalletSubmit(e) {
    e.preventDefault();

    const name = elements.walletName.value;
    const currency = elements.walletCurrency.value;
    const balance = elements.walletBalance.value || 0;

    if (state.editingWalletId) {
        updateWallet(state.editingWalletId, { name, currency, balance: parseFloat(balance) });
        showToast('Wallet updated successfully');
    } else {
        createWallet(name, currency, balance);
        showToast('Wallet created successfully');
    }

    closeModal(elements.walletModal);
    renderAll();
}

function handleLoanSubmit(e) {
    e.preventDefault();

    const type = document.querySelector('.type-btn[data-loan-type].active').dataset.loanType;
    const data = {
        type,
        personName: elements.loanPerson.value,
        amount: elements.loanAmount.value,
        currency: elements.loanCurrency.value,
        date: elements.loanDate.value,
        dueDate: elements.loanDueDate.value,
        note: elements.loanNote.value
    };

    createLoan(data);
    showToast('Loan record added successfully');
    closeModal(elements.loanModal);

    // Switch to the correct tab
    state.currentLoanTab = type;
    elements.loanTabs.forEach(t => {
        t.classList.toggle('active', t.dataset.tab === type);
    });

    renderLoans();
}

function handlePaymentSubmit(e) {
    e.preventDefault();

    const loanId = elements.paymentLoanId.value;
    const amount = elements.paymentAmount.value;
    const date = elements.paymentDate.value;

    addPayment(loanId, amount, date);
    showToast('Payment recorded successfully');
    closeModal(elements.paymentModal);
    renderLoans();
}

// ============================================
// Render All
// ============================================

function renderAll() {
    renderWallets();
    populateWalletSelects();
    renderTransactions(elements.recentTransactions, getFilteredTransactions(5));
    calculateMonthlySummary();

    if (state.currentPage === 'transactions') {
        renderTransactions(elements.allTransactions, getFilteredTransactions());
    } else if (state.currentPage === 'loans') {
        renderLoans();
    }
}

// ============================================
// Theme Management
// ============================================

function toggleTheme() {
    const body = document.body;
    const isLight = body.classList.toggle('light-theme');

    // Update icon
    const icon = elements.themeToggle.querySelector('.theme-icon');
    icon.textContent = isLight ? '☀️' : '🌙';

    // Save preference
    localStorage.setItem('moneyflow_theme', isLight ? 'light' : 'dark');
}

function loadTheme() {
    const savedTheme = localStorage.getItem('moneyflow_theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        const icon = elements.themeToggle.querySelector('.theme-icon');
        if (icon) icon.textContent = '☀️';
    }
}

// ============================================
// Initialize App
// ============================================

function initApp() {
    loadFromStorage();
    loadTheme();
    updateMonthDisplay();
    initEventListeners();
    renderAll();

    // Create default wallets if none exist
    if (state.wallets.length === 0) {
        createWallet('Main LKR Account', 'LKR', 0);
        createWallet('Crypto Wallet', 'USDT', 0);
        createWallet('USD Account', 'USD', 0);
        renderAll();
    }
}

// Start the app
document.addEventListener('DOMContentLoaded', initApp);

// ============================================
// Print Monthly Ledger
// ============================================
function printMonthlyLedger() {
    console.log('Print function called!');
    showToast('Preparing ledger...');
    const transactions = getMonthTransactions();
    const monthName = new Date(state.currentYear, state.currentMonth).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    // Calculate totals by wallet
    const walletTotals = {};
    state.wallets.forEach(w => {
        walletTotals[w.id] = { name: w.name, currency: w.currency, income: 0, expense: 0 };
    });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
        if (t.type === 'income') {
            totalIncome += t.amount;
            if (walletTotals[t.walletId]) walletTotals[t.walletId].income += t.amount;
        } else if (t.type === 'expense') {
            totalExpense += t.amount;
            if (walletTotals[t.walletId]) walletTotals[t.walletId].expense += t.amount;
        }
    });

    // Sort transactions by date
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Generate rows
    const transactionRows = sortedTransactions.map(t => {
        const wallet = getWallet(t.walletId);
        const typeIcon = t.type === 'income' ? '📈' : t.type === 'expense' ? '📉' : '↔️';
        const typeClass = t.type === 'income' ? 'color: #10b981;' : t.type === 'expense' ? 'color: #ef4444;' : 'color: #3b82f6;';
        const amount = t.type === 'income' ? `+${formatCurrency(t.amount, wallet?.currency || 'LKR')}` :
            t.type === 'expense' ? `-${formatCurrency(t.amount, wallet?.currency || 'LKR')}` :
                formatCurrency(t.amount, wallet?.currency || 'LKR');

        return `
            <tr>
                <td>${formatDate(t.date)}</td>
                <td>${typeIcon} ${t.type.charAt(0).toUpperCase() + t.type.slice(1)}</td>
                <td>${t.category || '-'}</td>
                <td>${t.description || '-'}</td>
                <td>${wallet?.name || '-'}</td>
                <td style="${typeClass} font-weight: 600;">${amount}</td>
            </tr>
        `;
    }).join('');

    // Wallet summary rows
    const walletSummaryRows = Object.values(walletTotals).filter(w => w.income > 0 || w.expense > 0).map(w => `
        <tr>
            <td>${w.name}</td>
            <td>${w.currency}</td>
            <td style="color: #10b981;">+${formatCurrency(w.income, w.currency)}</td>
            <td style="color: #ef4444;">-${formatCurrency(w.expense, w.currency)}</td>
            <td style="font-weight: 600;">${formatCurrency(w.income - w.expense, w.currency)}</td>
        </tr>
    `).join('');

    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Monthly Ledger - ${monthName}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Segoe UI', Arial, sans-serif; 
                    padding: 20px; 
                    color: #333;
                    font-size: 12px;
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 30px; 
                    border-bottom: 2px solid #6366f1;
                    padding-bottom: 15px;
                }
                .header h1 { 
                    color: #6366f1; 
                    font-size: 24px;
                    margin-bottom: 5px;
                }
                .header .month { 
                    font-size: 18px; 
                    color: #666;
                }
                .header .date { 
                    font-size: 11px; 
                    color: #999;
                    margin-top: 5px;
                }
                .summary-section { 
                    display: flex; 
                    justify-content: space-around; 
                    margin-bottom: 25px;
                    gap: 15px;
                }
                .summary-box { 
                    flex: 1;
                    padding: 15px; 
                    border-radius: 8px; 
                    text-align: center;
                    border: 1px solid #ddd;
                }
                .summary-box.income { background: #f0fdf4; border-color: #10b981; }
                .summary-box.expense { background: #fef2f2; border-color: #ef4444; }
                .summary-box.balance { background: #f0f9ff; border-color: #6366f1; }
                .summary-box .label { font-size: 11px; color: #666; margin-bottom: 5px; }
                .summary-box .value { font-size: 18px; font-weight: 700; }
                .summary-box.income .value { color: #10b981; }
                .summary-box.expense .value { color: #ef4444; }
                .summary-box.balance .value { color: #6366f1; }
                
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-bottom: 25px;
                }
                th { 
                    background: #f8fafc; 
                    padding: 10px 8px; 
                    text-align: left;
                    border-bottom: 2px solid #e2e8f0;
                    font-weight: 600;
                    font-size: 11px;
                    text-transform: uppercase;
                    color: #64748b;
                }
                td { 
                    padding: 10px 8px; 
                    border-bottom: 1px solid #e2e8f0;
                }
                tr:hover { background: #f8fafc; }
                
                .section-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #334155;
                    margin: 20px 0 10px 0;
                    padding-bottom: 5px;
                    border-bottom: 1px solid #e2e8f0;
                }
                
                .footer {
                    margin-top: 30px;
                    padding-top: 15px;
                    border-top: 1px solid #e2e8f0;
                    text-align: center;
                    font-size: 10px;
                    color: #999;
                }
                
                .no-data {
                    text-align: center;
                    padding: 40px;
                    color: #999;
                }
                
                @media print {
                    body { padding: 10px; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>💰 Money Flow Ledger</h1>
                <div class="month">${monthName}</div>
                <div class="date">Generated on: ${new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })}</div>
            </div>
            
            <div class="summary-section">
                <div class="summary-box income">
                    <div class="label">Total Income</div>
                    <div class="value">Rs. ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                </div>
                <div class="summary-box expense">
                    <div class="label">Total Expenses</div>
                    <div class="value">Rs. ${totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                </div>
                <div class="summary-box balance">
                    <div class="label">Net Balance</div>
                    <div class="value">Rs. ${(totalIncome - totalExpense).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                </div>
            </div>
            
            ${walletSummaryRows ? `
                <div class="section-title">📊 Wallet Summary</div>
                <table>
                    <thead>
                        <tr>
                            <th>Wallet</th>
                            <th>Currency</th>
                            <th>Income</th>
                            <th>Expense</th>
                            <th>Net</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${walletSummaryRows}
                    </tbody>
                </table>
            ` : ''}
            
            <div class="section-title">📋 Transaction Details (${sortedTransactions.length} transactions)</div>
            ${sortedTransactions.length > 0 ? `
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Category</th>
                            <th>Description</th>
                            <th>Wallet</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${transactionRows}
                    </tbody>
                </table>
            ` : '<div class="no-data">No transactions for this month</div>'}
            
            <div class="footer">
                Money Flow - Personal Finance Manager | Generated automatically
            </div>
        </body>
        </html>
    `;
    // Direct download approach - always works
    const blob = new Blob([printContent], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);

    // Get current month for filename
    const fileMonth = new Date(state.currentYear, state.currentMonth).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    }).replace(' ', '_');

    // Create download link
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `Money_Flow_Ledger_${fileMonth}.html`;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

    showToast('📄 Ledger downloaded! Open file → Ctrl+P → Save as PDF');
}

// Expose functions to global scope for onclick handlers
window.confirmDeleteTransaction = confirmDeleteTransaction;
window.confirmDeleteWallet = confirmDeleteWallet;
window.confirmDeleteLoan = confirmDeleteLoan;
window.editWallet = editWallet;
window.openPaymentModal = openPaymentModal;
