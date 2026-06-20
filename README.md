# ⚡ Pocket Battle

A simple, self-contained Pokémon-style game that runs entirely in your browser.
No build step, no dependencies — just open the file and play.

## How to play

Open `index.html` in any modern browser:

```bash
# either double-click index.html, or serve it:
python3 -m http.server 8000
# then visit http://localhost:8000
```

1. **Choose a partner** — Charmander, Squirtle, Bulbasaur, or Pikachu.
2. **Battle wild monsters** — pick one of four moves each turn.
3. **Win to level up** — your partner gets stronger after every victory.
4. **Run** if a fight is going badly (75% escape chance).

## Game mechanics

- **Turn-based combat** — you attack, then the wild foe attacks.
- **Type effectiveness** — fire 🔥 > grass 🌱 > water 💧 > fire, and
  electric ⚡ is strong against water.
- **STAB bonus** — moves matching your monster's type hit 50% harder.
- **Damage variance** — a little randomness keeps every fight fresh.
- **Leveling** — winning raises your level, max HP, and attack.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page structure |
| `style.css`  | Styling and animations |
| `game.js`    | All game logic |

Built as a tiny, dependency-free demo. Enjoy!
