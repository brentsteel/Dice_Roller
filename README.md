# D&D Dice Roller & Combat Tracker

A modern, responsive web application for Dungeons & Dragons players to roll dice, track combat, manage initiative, and keep weapon records during gameplay sessions.

## Features

### 🎲 Dice Roller
- Roll all standard D&D dice types: d4, d6, d8, d10, d12, d20, d100
- Character/player name assignment for all rolls
- Animated roll results with visual feedback
- Complete roll history with timestamps
- Persistent storage using localStorage

### ⚔️ Combat Tracker
- **Initiative System**: Start combat sessions and roll initiative (d20) for all combatants
- **Turn Management**: Automatic turn order based on initiative rolls
- **Weapon Tracking**: Record and display weapon information for each combatant
- **Combat Display**: Current turn highlighting with character and weapon info
- **Easy Management**: Add/remove combatants during combat

### 🎨 Design Features
- Modern gradient UI with fantasy theme
- Fully responsive design (desktop, tablet, mobile)
- Semantic HTML5 for accessibility
- ARIA labels and keyboard navigation support
- Smooth animations and hover effects
- Screen reader compatible

## Files

- **dnd-roller.html** - Main HTML structure with semantic markup
- **dnd-styles.css** - Modern CSS styling with responsive design
- **dnd-script.js** - JavaScript for dice rolling and combat mechanics

### Companion Application
- **taskmanager.html** - Task management application
- **styles.css** - Task manager styles
- **script.js** - Task manager functionality

## How to Use

### Dice Roller
1. Enter your character or player name
2. Select a dice type (d4 through d100)
3. Click the die button to roll
4. View your result and entire roll history

### Combat Tracker
1. Click **"Start Combat"** to begin a new combat session
2. Enter each combatant's name and weapon
3. Click **"Roll Initiative"** - each combatant rolls a d20
4. Combatants are automatically sorted by initiative score
5. Click **"Next Turn"** to advance through the turn order
6. Click **"End Combat"** when the battle is over

## Getting Started

1. Open `dnd-roller.html` in your web browser
2. No installation or dependencies required
3. All data is stored locally in your browser

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- All modern mobile browsers

## Accessibility

- Fully keyboard navigable
- ARIA labels for screen readers
- Semantic HTML structure
- High contrast styling
- Focus indicators on all interactive elements

## Local Storage

The application automatically saves:
- All dice rolls with character names and timestamps
- Combat sessions (until cleared)
- Persistence across browser sessions

## Keyboard Shortcuts

- **Alt + 4**: Quick roll d4
- **Alt + 6**: Quick roll d6
- **Alt + 8**: Quick roll d8
- **Alt + 0**: Quick roll d10
- **Alt + 2**: Quick roll d20

## License

Free to use and modify for personal or educational purposes.

## Tips for D&D Players

- Use the dice roller for all rolls in your campaign
- Initialize combat in the Combat Tracker to manage turn order
- Keep the weapon tracker updated for accurate combat information
- Check the roll history to verify previous results
- Use on desktop or mobile during game sessions

Enjoy your adventure! 🐉