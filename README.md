# Pocket Battle 🔴⚪

A simple, single-file Pokémon-style battle game. No build step, no dependencies —
just open it in any browser.

## How to play

1. Open `index.html` in a web browser (double-click it, or run a local server).
2. Choose your starter: **Charmander** (Fire), **Squirtle** (Water), or **Bulbasaur** (Grass).
3. Pick a move each turn to battle a wild opponent.
4. Reduce the enemy's HP to zero to win — but watch out, it fights back!

## Features

- **Type triangle**: Fire → Grass → Water → Fire. Super-effective hits do 2× damage,
  not-very-effective hits do ½ damage.
- **Critical hits** (10% chance) and slight damage variance for replayability.
- **Simple enemy AI** that mostly picks its strongest move against your type.
- Animated hits, color-coded HP bars, and a battle log.

## Running with a local server (optional)

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

Enjoy! 🎮
