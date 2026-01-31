// ==================== CONFIGURATION ====================
const CONFIG = {
    API_PRIMARY: 'https://economia.awesomeapi.com.br/last/',
    API_FALLBACK: 'https://open.er-api.com/v6/latest/',
    CACHE_DURATION: 60000, // 1 minuto
    DEBOUNCE_DELAY: 500,
    MAX_HISTORY_ITEMS: 5,
    AUTO_REFRESH_INTERVAL: 300000, // 5 minutos
};

// Currency symbols mapping
const CURRENCY_SYMBOLS = {
    BRL: 'R$', USD: '$', EUR: '€', GBP: '£', JPY: '¥',
    CAD: 'CA$', AUD: 'A$', CHF: 'Fr', CNY: '¥', ARS: '$'
};

// ==================== DOM ELEMENTS ====================
const elements = {
    amountInput: document.getElementById("amount"),
    convertInput: document.getElementById("convert"),
    fromCurrency: document.getElementById("fromCurrency"),
    toCurrency: document.getElementById("toCurrency"),
    fromSymbol: document.getElementById("fromSymbol"),
    toSymbol: document.getElementById("toSymbol"),
    resultText: document.getElementById("result-text"),
    updateTime: document.getElementById("update-time"),
    rateTrend: document.getElementById("rate-trend"),
    btnConverter: document.getElementById("btn-converter"),
    swapBtn: document.getElementById("swapCurrencies"),
    refreshBtn: document.getElementById("refreshRate"),
    loadingOverlay: document.getElementById("loading-overlay"),
    quickHistory: document.getElementById("quickHistory"),
    historyItems: document.getElementById("historyItems"),
    toastContainer: document.getElementById("toast-container"),
};

// ==================== STATE MANAGEMENT ====================
const state = {
    cache: new Map(),
    lastRate: null,
    conversionHistory: [],
    isLoading: false,
    autoRefreshTimer: null,
};

// ==================== UTILITY FUNCTIONS ====================

// Debounce function
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Format number with locale
function formatNumber(value, currency = 'BRL') {
    const locale = currency === 'BRL' ? 'pt-BR' : 'en-US';
    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

// Parse input value (aceita vírgula ou ponto)
function parseInputValue(value) {
    if (!value) return 0;
    const cleaned = value.toString().replace(/[^\d,.-]/g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
}

// Validate currency pair
function validateCurrencyPair(from, to) {
    if (!from || !to) {
        throw new Error('Moedas inválidas');
    }
    if (from === to) {
        return false; // Mesma moeda
    }
    return true;
}

// Get cache key
function getCacheKey(from, to) {
    return `${from}-${to}`;
}

// Check cache validity
function getCachedRate(from, to) {
    const key = getCacheKey(from, to);
    const cached = state.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < CONFIG.CACHE_DURATION) {
        return cached.rate;
    }
    return null;
}

// Set cache
function setCacheRate(from, to, rate) {
    const key = getCacheKey(from, to);
    state.cache.set(key, {
        rate,
        timestamp: Date.now(),
    });
}

// ==================== UI FUNCTIONS ====================

// Show loading
function showLoading(show = true) {
    state.isLoading = show;
    elements.loadingOverlay.classList.toggle('active', show);
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.success}</span>
        <span class="toast-message">${message}</span>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Update currency symbols
function updateCurrencySymbols() {
    const from = elements.fromCurrency.value;
    const to = elements.toCurrency.value;
    
    elements.fromSymbol.textContent = CURRENCY_SYMBOLS[from] || from;
    elements.toSymbol.textContent = CURRENCY_SYMBOLS[to] || to;
}

// Update rate trend
function updateRateTrend(currentRate) {
    if (state.lastRate && state.lastRate !== currentRate) {
        const trend = currentRate > state.lastRate ? 'up' : 'down';
        const percentage = (((currentRate - state.lastRate) / state.lastRate) * 100).toFixed(2);
        
        elements.rateTrend.className = `rate-trend ${trend}`;
        elements.rateTrend.textContent = `${trend === 'up' ? '↑' : '↓'} ${Math.abs(percentage)}%`;
    } else {
        elements.rateTrend.textContent = '';
    }
    
    state.lastRate = currentRate;
}

// Update UI with conversion result
function updateUI(rate, from, to) {
    const amount = parseInputValue(elements.amountInput.value);
    const convertedValue = amount * rate;
    
    // Update converted value
    elements.convertInput.value = formatNumber(convertedValue, to);
    
    // Update rate display
    elements.resultText.textContent = `1.00 ${from} = ${formatNumber(rate, to)} ${to}`;
    
    // Update timestamp
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    elements.updateTime.innerHTML = `
        <span class="pulse-dot"></span>
        Atualizado às ${timeString}
    `;
    
    // Update trend
    updateRateTrend(rate);
    
    // Add to history
    addToHistory(from, to, amount, convertedValue);
}

// Format input on blur
function formatInputOnBlur(input) {
    const value = parseInputValue(input.value);
    if (value > 0) {
        input.value = formatNumber(value);
    }
}

// ==================== CONVERSION LOGIC ====================

// Fetch exchange rate from API
async function fetchExchangeRate(showLoader = false) {
    const from = elements.fromCurrency.value;
    const to = elements.toCurrency.value;
    
    // Validate
    try {
        if (!validateCurrencyPair(from, to)) {
            updateUI(1, from, to);
            return;
        }
    } catch (error) {
        showToast(error.message, 'error');
        return;
    }
    
    // Check cache
    const cachedRate = getCachedRate(from, to);
    if (cachedRate) {
        updateUI(cachedRate, from, to);
        return;
    }
    
    if (showLoader) showLoading(true);
    
    try {
        // Try primary API (AwesomeAPI)
        const response = await fetch(`${CONFIG.API_PRIMARY}${from}-${to}`, {
            signal: AbortSignal.timeout(5000)
        });
        
        if (!response.ok) throw new Error('API Error');
        
        const data = await response.json();
        const pair = `${from}${to}`;
        
        if (!data[pair] || !data[pair].bid) {
            throw new Error('Invalid response');
        }
        
        const rate = parseFloat(data[pair].bid);
        
        // Cache and update
        setCacheRate(from, to, rate);
        updateUI(rate, from, to);
        
    } catch (error) {
        console.warn('Primary API failed, trying fallback...', error);
        
        // Fallback API
        try {
            const response = await fetch(`${CONFIG.API_FALLBACK}${from}`, {
                signal: AbortSignal.timeout(5000)
            });
            
            if (!response.ok) throw new Error('Fallback API Error');
            
            const data = await response.json();
            
            if (!data.rates || !data.rates[to]) {
                throw new Error('Currency not found in fallback');
            }
            
            const rate = data.rates[to];
            
            // Cache and update
            setCacheRate(from, to, rate);
            updateUI(rate, from, to);
            
        } catch (fallbackError) {
            console.error('All APIs failed:', fallbackError);
            showToast('Erro ao buscar cotação. Tente novamente.', 'error');
            
            elements.resultText.textContent = 'Erro ao carregar';
            elements.updateTime.innerHTML = `
                <span class="pulse-dot" style="background: var(--error);"></span>
                Falha na conexão
            `;
        }
    } finally {
        if (showLoader) showLoading(false);
    }
}

// Debounced conversion for real-time updates
const debouncedConvert = debounce(() => {
    fetchExchangeRate(false);
}, CONFIG.DEBOUNCE_DELAY);

// ==================== HISTORY MANAGEMENT ====================

// Add conversion to history
function addToHistory(from, to, amount, result) {
    const historyItem = {
        from,
        to,
        amount,
        result,
        timestamp: Date.now(),
    };
    
    // Remove duplicates and keep only recent items
    state.conversionHistory = [
        historyItem,
        ...state.conversionHistory.filter(
            item => !(item.from === from && item.to === to)
        )
    ].slice(0, CONFIG.MAX_HISTORY_ITEMS);
    
    // Save to localStorage
    try {
        localStorage.setItem('conversionHistory', JSON.stringify(state.conversionHistory));
    } catch (e) {
        console.warn('Could not save history to localStorage');
    }
    
    renderHistory();
}

// Load history from localStorage
function loadHistory() {
    try {
        const saved = localStorage.getItem('conversionHistory');
        if (saved) {
            state.conversionHistory = JSON.parse(saved);
            renderHistory();
        }
    } catch (e) {
        console.warn('Could not load history from localStorage');
    }
}

// Render history items
function renderHistory() {
    if (state.conversionHistory.length === 0) {
        elements.quickHistory.style.display = 'none';
        return;
    }
    
    elements.quickHistory.style.display = 'block';
    elements.historyItems.innerHTML = state.conversionHistory.map(item => `
        <div class="history-item" data-from="${item.from}" data-to="${item.to}">
            <span class="history-from">${formatNumber(item.amount)} ${item.from}</span>
            <span>→</span>
            <span class="history-to">${formatNumber(item.result)} ${item.to}</span>
        </div>
    `).join('');
    
    // Add click listeners
    document.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => {
            elements.fromCurrency.value = item.dataset.from;
            elements.toCurrency.value = item.dataset.to;
            updateCurrencySymbols();
            fetchExchangeRate();
        });
    });
}

// ==================== EVENT LISTENERS ====================

// Swap currencies
elements.swapBtn.addEventListener('click', () => {
    const temp = elements.fromCurrency.value;
    elements.fromCurrency.value = elements.toCurrency.value;
    elements.toCurrency.value = temp;
    
    // Swap amounts too
    const tempAmount = elements.amountInput.value;
    elements.amountInput.value = elements.convertInput.value;
    
    updateCurrencySymbols();
    fetchExchangeRate();
    showToast('Moedas invertidas!', 'success');
});

// Main convert button
elements.btnConverter.addEventListener('click', () => {
    fetchExchangeRate(true);
});

// Refresh rate button
elements.refreshBtn.addEventListener('click', () => {
    // Clear cache for current pair
    const from = elements.fromCurrency.value;
    const to = elements.toCurrency.value;
    state.cache.delete(getCacheKey(from, to));
    
    fetchExchangeRate(true);
    showToast('Cotação atualizada!', 'success');
});

// Currency selectors change
[elements.fromCurrency, elements.toCurrency].forEach(select => {
    select.addEventListener('change', () => {
        updateCurrencySymbols();
        fetchExchangeRate();
    });
});

// Amount input - real-time conversion
elements.amountInput.addEventListener('input', (e) => {
    // Allow only numbers, comma, and dot
    let value = e.target.value.replace(/[^\d,.-]/g, '');
    e.target.value = value;
    
    debouncedConvert();
});

// Format on blur
elements.amountInput.addEventListener('blur', () => {
    formatInputOnBlur(elements.amountInput);
});

// Focus on amount input when clicking on convert input
elements.convertInput.addEventListener('click', () => {
    elements.amountInput.focus();
});

// Quick amount buttons
document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const amount = btn.dataset.amount;
        elements.amountInput.value = formatNumber(parseFloat(amount));
        fetchExchangeRate();
        
        // Visual feedback
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => btn.style.transform = '', 100);
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to convert
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        fetchExchangeRate(true);
    }
    
    // Ctrl/Cmd + Shift + S to swap
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        elements.swapBtn.click();
    }
});

// ==================== AUTO REFRESH ====================

function startAutoRefresh() {
    // Clear existing timer
    if (state.autoRefreshTimer) {
        clearInterval(state.autoRefreshTimer);
    }
    
    // Set new timer
    state.autoRefreshTimer = setInterval(() => {
        if (!state.isLoading) {
            console.log('Auto-refreshing exchange rate...');
            const from = elements.fromCurrency.value;
            const to = elements.toCurrency.value;
            state.cache.delete(getCacheKey(from, to));
            fetchExchangeRate(false);
        }
    }, CONFIG.AUTO_REFRESH_INTERVAL);
}

// Stop auto refresh when page is hidden
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (state.autoRefreshTimer) {
            clearInterval(state.autoRefreshTimer);
        }
    } else {
        startAutoRefresh();
        // Refresh immediately when page becomes visible again
        fetchExchangeRate(false);
    }
});

// ==================== INITIALIZATION ====================

function initialize() {
    console.log('🚀 BRL2GO Currency Converter initialized');
    
    // Load history
    loadHistory();
    
    // Update currency symbols
    updateCurrencySymbols();
    
    // Initial conversion
    fetchExchangeRate(true);
    
    // Start auto-refresh
    startAutoRefresh();
    
    // Focus on amount input
    setTimeout(() => {
        elements.amountInput.focus();
        elements.amountInput.select();
    }, 500);
    
    // Service Worker for offline support (optional)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            console.log('Service Worker registration failed');
        });
    }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

// Cleanup on unload
window.addEventListener('beforeunload', () => {
    if (state.autoRefreshTimer) {
        clearInterval(state.autoRefreshTimer);
    }
});
