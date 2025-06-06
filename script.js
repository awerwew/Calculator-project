// Calculator program with history functionality
const inputBox = document.getElementById('input');
const expressionDiv = document.getElementById('expression');
const resultDiv = document.getElementById('result');
const historyItems = document.getElementById('history-items');
const clearHistoryBtn = document.querySelector('.btn-clear-history');

let expression = '';
let result = '';

// Store calculation history
let calculationHistory = [];

// Configuration
const MAX_EXPRESSION_LENGTH = 30;
const MAX_NUMBER_LENGTH = 15;
const MAX_HISTORY_ITEMS = 20;

// Add to history
function addToHistory(expression, result) {
    if (!expression || !result || result === '') return;
    
    // Add to history array
    calculationHistory.unshift({ expression, result });
    
    // Create history item element
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
        <div class="history-expression">${expression}</div>
        <div class="history-result">= ${formatNumber(result)}</div>
    `;
    
    // Add click event to recall calculation
    historyItem.addEventListener('click', () => {
        const historyEntry = calculationHistory.find(item => 
            item.expression === expression && item.result === result
        );
        if (historyEntry) {
            expression = historyEntry.expression;
            result = historyEntry.result;
            updateDisplay(expression, result);
        }
    });
    
    // Add to DOM
    historyItems.insertBefore(historyItem, historyItems.firstChild);
    
    // Limit history size
    if (calculationHistory.length > MAX_HISTORY_ITEMS) {
        calculationHistory.pop();
        historyItems.removeChild(historyItems.lastChild);
    }
}

// Clear history
clearHistoryBtn.addEventListener('click', () => {
    calculationHistory = [];
    historyItems.innerHTML = '';
});

function buttonClick(event) {
    const target = event.target;
    const action = target.dataset.action;
    const value = target.dataset.value;

    if (!action) return; // Ignore clicks without actions
    
    switch(action) {
        case 'number':
            addValue(value);
            break;
        case 'clear':
            clear();
            break;
        case 'backspace':
            backSpace();
            break;
        case 'addition':
        case 'subtraction':
        case 'multiplication':
        case 'division':
            if (expression === '' && result !== '') {
                startFromResult(value);
            }
            else if(expression !== '' && !isLastCharOperator()) {
                addOperator(value);
            }   
            break; 
        case 'submit':
            submit();
            break;
        case 'mod':
            percentage();
            break;
        case 'decimal':
            decimal(value); 
            break;
    }
    
    updateDisplay(expression, result);     
}

inputBox.addEventListener('click', buttonClick);

function addValue(value) {
    // Check if expression is too long
    if (expression.length >= MAX_EXPRESSION_LENGTH) return;
    
    // Check if current number is too long
    const parts = expression.split(/[+\-*/]/);
    const lastNumber = parts[parts.length - 1];
    
    if (lastNumber.length >= MAX_NUMBER_LENGTH && !isNaN(value)) return;
    
    if (value === '.') {
        if (!lastNumber.includes('.')) {
            expression += value;
        }
    } else {
        expression += value;
    }
}

function addOperator(value) {
    if (expression.length >= MAX_EXPRESSION_LENGTH) return;
    expression += value;
}

function updateDisplay(expression, result) {
    // Format expression with commas
    const formattedExpression = expression.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    expressionDiv.textContent = formattedExpression;
    
    // Format result with commas
    if (typeof result === 'number') {
        resultDiv.textContent = formatNumber(result);
    } else {
        resultDiv.textContent = result;
    }
}

function formatNumber(num) {
    // Return empty string for invalid numbers
    if (isNaN(num) || !isFinite(num)) return '';
    
    // Handle very large/small numbers with scientific notation
    if (Math.abs(num) >= 1e15 || Math.abs(num) <= 1e-15) {
        return num.toExponential(6).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    }
    
    // Format regular numbers with commas
    const parts = num.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    
    return parts.length > 1 ? parts.join('.') : parts[0];
}

function clear() {
    expression = "";
    result = "";
}        

function backSpace() {
    expression = expression.slice(0, -1);
}

function isLastCharOperator() {
    return isNaN(parseInt(expression.slice(-1)));
}

function startFromResult(value) {
    if (result.toString().length > MAX_NUMBER_LENGTH) return;
    expression = result + value; 
}

function submit() {
    if (expression === '') return;
    
    result = evaluateExpression();
    if (result !== '') {
        addToHistory(expression, result);
    }
    expression = '';
}

function evaluateExpression(){
    const evalResult = eval(expression);
    return isNaN(evalResult) || !isFinite(evalResult)
    ? ' '
    : evalResult < 1 
    ? parseFloat(evalResult.toFixed(10))
    : parseFloat(evalResult.toFixed(2));    
}
function percentage() {
    if (expression !== '') {
        result = evaluateExpression();
        if (!isNaN(result) && isFinite(result)) {
            result /= 100;
            addToHistory(expression, result);
            expression = '';
        } else {
            result = '';
        }
    } else if(result !== '') {
        result = parseFloat(result) / 100;
    }       
}

function decimal(value) {
    const parts = expression.split(/[+\-*/]/);
    const lastPart = parts[parts.length - 1];
    
    if (!lastPart.includes('.') && lastPart.length < MAX_NUMBER_LENGTH) {
        addValue(value);
    }
}

// Keyboard support
document.addEventListener('keydown', (e) => {
    const key = e.key;
    
    // Map keyboard keys to calculator buttons
    const keyMap = {
        '0': { action: 'number', value: '0' },
        '1': { action: 'number', value: '1' },
        '2': { action: 'number', value: '2' },
        '3': { action: 'number', value: '3' },
        '4': { action: 'number', value: '4' },
        '5': { action: 'number', value: '5' },
        '6': { action: 'number', value: '6' },
        '7': { action: 'number', value: '7' },
        '8': { action: 'number', value: '8' },
        '9': { action: 'number', value: '9' },
        '.': { action: 'decimal', value: '.' },
        '+': { action: 'addition', value: '+' },
        '-': { action: 'subtraction', value: '-' },
        '*': { action: 'multiplication', value: '×' },
        '/': { action: 'division', value: '÷' },
        '%': { action: 'mod', value: '%' },
        'Enter': { action: 'submit', value: '=' },
        '=': { action: 'submit', value: '=' },
        'Backspace': { action: 'backspace' },
        'Escape': { action: 'clear' },
        'Delete': { action: 'clear' }
    };
    
    if (keyMap[key]) {
        e.preventDefault();
        const action = keyMap[key].action;
        const value = keyMap[key].value;
        
        // Simulate button click
        switch(action) {
            case 'number':
                addValue(value);
                break;
            case 'clear':
                clear();
                break;
            case 'backspace':
                backSpace();
                break;
            case 'addition':
            case 'subtraction':
            case 'multiplication':
            case 'division':
                if (expression === '' && result !== '') {
                    startFromResult(value);
                }
                else if(expression !== '' && !isLastCharOperator()) {
                    addOperator(value);
                }   
                break; 
            case 'submit':
                submit();
                break;
            case 'mod':
                percentage();
                break;
            case 'decimal':
                decimal(value); 
                break;
        }
        
        updateDisplay(expression, result);
    }
});