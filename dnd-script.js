// D&D Dice Roller JavaScript

// DOM elements
const rollerForm = document.getElementById('roller-form');
const characterNameInput = document.getElementById('character-name');
const diceButtons = document.querySelectorAll('.dice-btn');
const selectedDiceInput = document.getElementById('selected-dice');
const rollResult = document.getElementById('roll-result');
const rollHistory = document.getElementById('roll-history');
const clearHistoryBtn = document.getElementById('clear-history-btn');

// Combat tracker DOM elements
const startCombatBtn = document.getElementById('start-combat-btn');
const endCombatBtn = document.getElementById('end-combat-btn');
const combatInactive = document.getElementById('combat-inactive');
const combatActive = document.getElementById('combat-active');
const initiativeForm = document.getElementById('initiative-form');
const combatantNameInput = document.getElementById('combatant-name');
const combatantWeaponInput = document.getElementById('combatant-weapon');
const initiativeList = document.getElementById('initiative-list');
const currentTurnDiv = document.getElementById('current-turn');
const nextTurnBtn = document.getElementById('next-turn-btn');

// Store rolls in memory and localStorage
let rolls = [];
let combatants = [];
let currentTurnIndex = 0;
let isCombatActive = false;

// Dice configuration
const diceConfig = {
    d4: { sides: 4, label: '4-sided die' },
    d6: { sides: 6, label: '6-sided die' },
    d8: { sides: 8, label: '8-sided die' },
    d10: { sides: 10, label: '10-sided die' },
    d12: { sides: 12, label: '12-sided die' },
    d20: { sides: 20, label: '20-sided die' },
    d100: { sides: 100, label: '100-sided die (percentile)' }
};

// Roll a die with given number of sides
function rollDice(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

// Handle dice button clicks
diceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const diceType = btn.dataset.dice;
        const characterName = characterNameInput.value.trim();

        if (!characterName) {
            alert('Please enter a character/player name');
            characterNameInput.focus();
            return;
        }

        // Update selected dice
        diceButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedDiceInput.value = diceType;

        // Perform the roll
        performRoll(diceType, characterName);
    });
});

// Perform roll and update UI
function performRoll(diceType, characterName) {
    const sides = diceConfig[diceType].sides;
    const result = rollDice(sides);

    // Create roll object
    const rollObj = {
        id: Date.now(),
        characterName: characterName,
        diceType: diceType,
        result: result,
        timestamp: new Date().toLocaleTimeString()
    };

    // Add to rolls array
    rolls.unshift(rollObj);
    saveRolls();

    // Update display
    displayRollResult(rollObj);
    addToHistory(rollObj);
}

// Display roll result
function displayRollResult(rollObj) {
    const diceLabel = diceConfig[rollObj.diceType].label;
    rollResult.innerHTML = `
        <p class="result-text">${rollObj.characterName} rolled ${rollObj.diceType}:</p>
        <div class="result-number">${rollObj.result}</div>
        <p class="result-dice">${diceLabel}</p>
    `;
}

// Add roll to history list
function addToHistory(rollObj) {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.dataset.rollId = rollObj.id;

    const diceLabel = diceConfig[rollObj.diceType].label;

    li.innerHTML = `
        <div class="history-item-left">
            <div class="history-character">${rollObj.characterName}</div>
            <div class="history-meta">${rollObj.diceType} (${diceLabel}) • ${rollObj.timestamp}</div>
        </div>
        <div class="history-result">${rollObj.result}</div>
    `;

    rollHistory.insertBefore(li, rollHistory.firstChild);

    // Limit history to prevent performance issues
    if (rollHistory.children.length > 50) {
        rollHistory.removeChild(rollHistory.lastChild);
        rolls.pop();
        saveRolls();
    }
}

// Save rolls to localStorage
function saveRolls() {
    localStorage.setItem('dndRolls', JSON.stringify(rolls));
}

// Load rolls from localStorage
function loadRolls() {
    const saved = localStorage.getItem('dndRolls');
    if (saved) {
        rolls = JSON.parse(saved);
        rolls.forEach(roll => {
            addToHistory(roll);
        });
    } else {
        displayEmptyState();
    }
}

// Display empty state when no history
function displayEmptyState() {
    if (rolls.length === 0 && rollHistory.children.length === 0) {
        rollHistory.innerHTML = `
            <div class="empty-state">
                <p>🎲 No rolls yet. Make your first roll!</p>
            </div>
        `;
    }
}

// Clear all history
clearHistoryBtn.addEventListener('click', () => {
    if (rolls.length > 0 && confirm('Are you sure you want to clear all roll history?')) {
        rolls = [];
        rollHistory.innerHTML = '';
        saveRolls();
        displayEmptyState();
    }
});

// Set initial active dice button
diceButtons.forEach(btn => {
    if (btn.dataset.dice === 'd20') {
        btn.classList.add('active');
    }
});

// ============ COMBAT TRACKER FUNCTIONS ============

// Start a new combat session
function startCombatSession() {
    isCombatActive = true;
    combatants = [];
    currentTurnIndex = 0;

    combatInactive.hidden = true;
    combatActive.hidden = false;
    startCombatBtn.disabled = true;
    endCombatBtn.disabled = false;

    initiativeList.innerHTML = '';
    currentTurnDiv.hidden = true;
    combatantNameInput.focus();
}

// End combat session
function endCombatSession() {
    if (confirm('End combat session? All combatants will be cleared.')) {
        isCombatActive = false;
        combatants = [];
        currentTurnIndex = 0;

        combatInactive.hidden = false;
        combatActive.hidden = true;
        startCombatBtn.disabled = false;
        endCombatBtn.disabled = true;

        initiativeList.innerHTML = '';
        currentTurnDiv.hidden = true;
    }
}

// Add combatant to combat
function addCombatant(name, weapon) {
    const initiativeRoll = rollDice(20);
    
    const combatant = {
        id: Date.now(),
        name: name,
        weapon: weapon,
        initiative: initiativeRoll
    };

    combatants.push(combatant);
    combatants.sort((a, b) => b.initiative - a.initiative);

    renderInitiativeList();
    updateCurrentTurn();
    
    // Reset form
    combatantNameInput.value = '';
    combatantWeaponInput.value = '';
    combatantNameInput.focus();
}

// Render the initiative list
function renderInitiativeList() {
    initiativeList.innerHTML = '';

    combatants.forEach((combatant, index) => {
        const li = document.createElement('li');
        li.className = 'initiative-item';
        if (index === currentTurnIndex) {
            li.classList.add('active');
        }
        li.dataset.combatantId = combatant.id;

        li.innerHTML = `
            <div class="initiative-position">${index + 1}</div>
            <div class="initiative-details">
                <div class="initiative-name">${combatant.name}</div>
                <div class="initiative-meta">Weapon: ${combatant.weapon || 'None'}</div>
            </div>
            <div class="initiative-roll">${combatant.initiative}</div>
            <button class="initiative-remove" aria-label="Remove ${combatant.name} from combat">Remove</button>
        `;

        const removeBtn = li.querySelector('.initiative-remove');
        removeBtn.addEventListener('click', () => {
            removeCombatant(combatant.id);
        });

        initiativeList.appendChild(li);
    });
}

// Remove a combatant from initiative
function removeCombatant(id) {
    combatants = combatants.filter(c => c.id !== id);
    
    if (currentTurnIndex >= combatants.length && combatants.length > 0) {
        currentTurnIndex = combatants.length - 1;
    }

    renderInitiativeList();
    updateCurrentTurn();
}

// Update current turn display
function updateCurrentTurn() {
    if (combatants.length === 0) {
        currentTurnDiv.hidden = true;
        return;
    }

    const current = combatants[currentTurnIndex];
    document.getElementById('turn-character').textContent = current.name;
    document.getElementById('turn-weapon').textContent = `Weapon: ${current.weapon || 'None'}`;
    currentTurnDiv.hidden = false;
}

// Move to next turn
function nextTurn() {
    if (combatants.length === 0) return;

    currentTurnIndex = (currentTurnIndex + 1) % combatants.length;
    renderInitiativeList();
    updateCurrentTurn();

    // Highlight announcement
    const currentItem = initiativeList.querySelector('.initiative-item.active');
    if (currentItem) {
        currentItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Initialize combat tracker event listeners
startCombatBtn.addEventListener('click', startCombatSession);
endCombatBtn.addEventListener('click', endCombatSession);
nextTurnBtn.addEventListener('click', nextTurn);

initiativeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = combatantNameInput.value.trim();
    const weapon = combatantWeaponInput.value.trim();

    if (!name) {
        alert('Please enter a combatant name');
        combatantNameInput.focus();
        return;
    }

    addCombatant(name, weapon);
});

// Set initial active dice button
diceButtons.forEach(btn => {
    if (btn.dataset.dice === 'd20') {
        btn.classList.add('active');
    }
});

// Load initial rolls on page load
document.addEventListener('DOMContentLoaded', () => {
    loadRolls();
    
    // Set initial focus
    characterNameInput.focus();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Alt + D followed by number for quick dice rolling
    if (e.altKey && e.key.match(/[0-9]/)) {
        const diceMap = {
            '4': 'd4',
            '6': 'd6',
            '8': 'd8',
            '0': 'd10',
            '2': 'd20'
        };
        
        if (diceMap[e.key]) {
            const characterName = characterNameInput.value.trim();
            if (characterName) {
                const button = document.querySelector(`[data-dice="${diceMap[e.key]}"]`);
                if (button) {
                    button.click();
                }
            }
        }
    }
});