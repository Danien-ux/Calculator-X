let display = document.getElementById('display');
let historyList = document.getElementById('history-list');
let history = JSON.parse(localStorage.getItem('calcHistory')) || [];
let currentMode = 'normal'; // 'normal' or 'scientific'

document.getElementById('mode-toggle').addEventListener('click', toggleMode);

function toggleMode() {
    const buttonsNormal = document.getElementById('buttons-normal');
    const buttonsScientific = document.getElementById('buttons-scientific');
    const modeBtn = document.getElementById('mode-toggle');
    
    if (currentMode === 'normal') {
        buttonsNormal.style.display = 'none';
        buttonsScientific.style.display = 'grid';
        modeBtn.textContent = 'Normal';
        currentMode = 'scientific';
    } else {
        buttonsNormal.style.display = 'grid';
        buttonsScientific.style.display = 'none';
        modeBtn.textContent = 'Scientific';
        currentMode = 'normal';
    }
}

function appendToDisplay(value) {
    display.value += value;
}

function clearDisplay() {
    display.value = '';
}

function deleteLast() {
    display.value = display.value.slice(0, -1);
}

function calculate() {
    try {
        let expression = display.value
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/sin\(/g, 'Math.sin(')
            .replace(/cos\(/g, 'Math.cos(')
            .replace(/tan\(/g, 'Math.tan(')
            .replace(/log\(/g, 'Math.log10(')
            .replace(/ln\(/g, 'Math.log(')
            .replace(/√\(/g, 'Math.sqrt(')
            .replace(/π/g, 'Math.PI')
            .replace(/±/g, '-'); // Simplified for ±, but handle in context if needed

        // Safe eval using Function constructor to avoid direct eval
        let result = Function('"use strict"; return (' + expression + ')')();
        
        if (isNaN(result) || !isFinite(result)) {
            throw new Error('Invalid calculation');
        }

        let fullExpression = display.value;
        let historyItem = `${fullExpression} = ${result}`;
        
        history.unshift(historyItem);
        if (history.length > 20) history.pop(); // Limit history to 20 items
        localStorage.setItem('calcHistory', JSON.stringify(history));
        updateHistory();
        
        display.value = result;
    } catch (error) {
        display.value = 'Error';
        setTimeout(clearDisplay, 1500);
    }
}

function updateHistory() {
    historyList.innerHTML = '';
    history.forEach((item, index) => {
        let div = document.createElement('div');
        div.className = 'history-item';
        div.textContent = item;
        div.onclick = () => {
            display.value = item.split(' = ')[1]; // Load result to display
        };
        historyList.appendChild(div);
    });
    document.getElementById('clear-history').onclick = clearHistory;
}

function clearHistory() {
    history = [];
    localStorage.removeItem('calcHistory');
    updateHistory();
}

// Initialize history on load
updateHistory();

// Keyboard support for normal mode
document.addEventListener('keydown', (e) => {
    if (['0','1','2','3','4','5','6','7','8','9','+','-','*','/','.','Enter','Backspace','Escape'].includes(e.key)) {
        e.preventDefault();
        if (e.key === 'Enter') calculate();
        else if (e.key === 'Backspace') deleteLast();
        else if (e.key === 'Escape') clearDisplay();
        else appendToDisplay(e.key.replace('*', '×').replace('/', '÷'));
    }
});
