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
const combatantHpInput = document.getElementById('combatant-hp');
const combatantInitModInput = document.getElementById('combatant-init-mod');
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
function addCombatant(name, weapon, maxHp, initMod) {
    const roll = rollDice(20);
    const modifier = parseInt(initMod) || 0;
    const totalInitiative = roll + modifier;
    const hp = parseInt(maxHp) || 0;
    
    const combatant = {
        id: Date.now(),
        name: name,
        weapon: weapon,
        initiativeRoll: roll,
        initiativeModifier: modifier,
        totalInitiative: totalInitiative,
        maxHp: hp,
        currentHp: hp,
        status: 'active', // active, dead, out, missing_turn
        missingNextTurn: false
    };

    combatants.push(combatant);
    // Sort by total initiative (highest first)
    combatants.sort((a, b) => b.totalInitiative - a.totalInitiative);

    renderInitiativeList();
    updateCurrentTurn();
    
    // Reset form
    combatantNameInput.value = '';
    combatantHpInput.value = '';
    combatantInitModInput.value = '0';
    combatantWeaponInput.value = '';
    combatantNameInput.focus();
}

// Render the initiative list
function renderInitiativeList() {
    initiativeList.innerHTML = '';

    combatants.forEach((combatant, index) => {
        const li = document.createElement('li');
        li.className = 'initiative-item';
        if (index === currentTurnIndex && combatant.status === 'active') {
            li.classList.add('active');
        }
        if (combatant.status === 'dead') {
            li.classList.add('dead');
        } else if (combatant.status === 'out') {
            li.classList.add('out');
        } else if (combatant.missingNextTurn) {
            li.classList.add('missing-turn');
        }
        li.dataset.combatantId = combatant.id;

        const statusClass = `status-badge status-${combatant.status}`;
        const missingTurnBadge = combatant.missingNextTurn ? '<span class="status-badge status-missing">Missing Next</span>' : '';
        const hpPercent = combatant.maxHp > 0 ? (combatant.currentHp / combatant.maxHp) * 100 : 0;
        let hpColor = '#28a745'; // green
        if (hpPercent <= 33) hpColor = '#dc3545'; // red
        else if (hpPercent <= 66) hpColor = '#ffc107'; // yellow

        li.innerHTML = `
            <div class="initiative-position">${index + 1}</div>
            <div class="initiative-details">
                <div class="initiative-name">${combatant.name}</div>
                <div class="initiative-meta">Weapon: ${combatant.weapon || 'None'}</div>
                <div class="hp-display">
                    <div class="hp-bar-container">
                        <div class="hp-bar" style="width: ${Math.max(0, hpPercent)}%; background-color: ${hpColor};"></div>
                    </div>
                    <div class="hp-text">${combatant.currentHp}/${combatant.maxHp} HP</div>
                </div>
                <div class="hp-controls">
                    <button class="hp-btn hp-minus" data-id="${combatant.id}" aria-label="Take damage">-</button>
                    <input type="number" class="hp-input" data-id="${combatant.id}" value="1" min="1" max="${combatant.maxHp}" placeholder="Dmg">
                    <button class="hp-btn hp-plus" data-id="${combatant.id}" aria-label="Heal">+</button>
                    <button class="hp-btn hp-reset" data-id="${combatant.id}" aria-label="Reset to max HP">Max</button>
                </div>
                <div class="status-indicators">
                    ${missingTurnBadge}
                    <span class="${statusClass}">${combatant.status === 'out' ? 'Out of Game' : combatant.status === 'dead' ? 'Dead' : 'Active'}</span>
                </div>
            </div>
            <div class="initiative-display">
                <div class="init-breakdown">
                    <span class="init-label">Initiative:</span>
                    <span class="init-roll">${combatant.initiativeRoll}</span>
                    <span class="init-modifier">${combatant.initiativeModifier >= 0 ? '+' : ''}${combatant.initiativeModifier}</span>
                    <span class="init-total">=</span>
                    <span class="init-total-value">${combatant.totalInitiative}</span>
                </div>
                <button class="edit-mod-btn" data-id="${combatant.id}" aria-label="Edit initiative modifier for ${combatant.name}">✏️</button>
            </div>
            <div class="initiative-actions">
                <button class="status-btn btn-dead" data-status="dead" aria-label="Mark ${combatant.name} as dead" title="Dead">💀</button>
                <button class="status-btn btn-out" data-status="out" aria-label="Mark ${combatant.name} out of game" title="Out of Game">❌</button>
                <button class="status-btn btn-missing" data-status="missing" aria-label="Mark ${combatant.name} missing next turn" title="Missing Next Turn">⏭️</button>
                <button class="initiative-remove" aria-label="Remove ${combatant.name} from combat">Remove</button>
            </div>
        `;

        // HP control listeners
        const minusBtn = li.querySelector('.hp-minus');
        const plusBtn = li.querySelector('.hp-plus');
        const resetBtn = li.querySelector('.hp-reset');
        const hpInput = li.querySelector('.hp-input');

        minusBtn.addEventListener('click', () => {
            const dmg = parseInt(hpInput.value) || 1;
            combatant.currentHp = Math.max(0, combatant.currentHp - dmg);
            renderInitiativeList();
        });

        plusBtn.addEventListener('click', () => {
            const heal = parseInt(hpInput.value) || 1;
            combatant.currentHp = Math.min(combatant.maxHp, combatant.currentHp + heal);
            renderInitiativeList();
        });

        resetBtn.addEventListener('click', () => {
            combatant.currentHp = combatant.maxHp;
            renderInitiativeList();
        });

        // Edit initiative modifier button
        const editModBtn = li.querySelector('.edit-mod-btn');
        editModBtn.addEventListener('click', () => {
            const newMod = prompt(`Enter new initiative modifier for ${combatant.name}:`, combatant.initiativeModifier);
            if (newMod !== null && newMod !== '') {
                const modValue = parseInt(newMod);
                if (!isNaN(modValue)) {
                    combatant.initiativeModifier = modValue;
                    combatant.totalInitiative = combatant.initiativeRoll + combatant.initiativeModifier;
                    combatants.sort((a, b) => b.totalInitiative - a.totalInitiative);
                    renderInitiativeList();
                    updateCurrentTurn();
                }
            }
        });

        // Status button event listeners
        const statusBtns = li.querySelectorAll('.status-btn');
        statusBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const newStatus = btn.dataset.status;
                if (newStatus === 'missing') {
                    combatant.missingNextTurn = !combatant.missingNextTurn;
                } else {
                    combatant.status = combatant.status === newStatus ? 'active' : newStatus;
                }
                renderInitiativeList();
            });
        });

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

// Update current turn display and auto-populate dice roller
function updateCurrentTurn() {
    if (combatants.length === 0) {
        currentTurnDiv.hidden = true;
        characterNameInput.value = '';
        document.getElementById('in-combat-note').style.display = 'none';
        return;
    }

    // Find next active combatant (skip dead/out of game)
    let activeIndex = currentTurnIndex;
    let attempts = 0;
    while (attempts < combatants.length) {
        const current = combatants[activeIndex];
        if (current.status === 'active') {
            // Handle missing turn
            if (current.missingNextTurn) {
                current.missingNextTurn = false;
                activeIndex = (activeIndex + 1) % combatants.length;
                attempts++;
                continue;
            }
            break;
        }
        activeIndex = (activeIndex + 1) % combatants.length;
        attempts++;
    }

    currentTurnIndex = activeIndex;
    const current = combatants[currentTurnIndex];
    
    document.getElementById('turn-character').textContent = current.name;
    document.getElementById('turn-weapon').textContent = `Weapon: ${current.weapon || 'None'}`;
    currentTurnDiv.hidden = false;
    
    // Auto-populate character name in dice roller
    characterNameInput.value = current.name;
    document.getElementById('in-combat-note').style.display = 'inline';
}

// Move to next turn
function nextTurn() {
    if (combatants.length === 0) return;

    let nextIndex = (currentTurnIndex + 1) % combatants.length;
    let attempts = 0;
    
    // Skip to next active combatant
    while (attempts < combatants.length) {
        const combatant = combatants[nextIndex];
        if (combatant.status === 'active') {
            // Handle missing turn - skip this turn
            if (combatant.missingNextTurn) {
                combatant.missingNextTurn = false;
                nextIndex = (nextIndex + 1) % combatants.length;
                attempts++;
                continue;
            }
            break;
        }
        nextIndex = (nextIndex + 1) % combatants.length;
        attempts++;
    }

    currentTurnIndex = nextIndex;
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
    const hp = combatantHpInput.value.trim();
    const initMod = combatantInitModInput.value.trim();
    const weapon = combatantWeaponInput.value.trim();

    if (!name) {
        alert('Please enter a combatant name');
        combatantNameInput.focus();
        return;
    }

    if (!hp) {
        alert('Please enter max HP');
        combatantHpInput.focus();
        return;
    }

    addCombatant(name, weapon, hp, initMod);
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