# AI Detective Treasure 🕵️‍♀️

A browser-based Media & Information Literacy (MIL) party game, built for UNESCO MIL Hackathon. Spin the wheel, land on a topic, and put your AI-detective skills to the test with your friends.

No build step, no dependencies, no backend — just static HTML/CSS/JS, ready for GitHub Pages.

## How it works

- **Cover → Menu** — a tap-anywhere splash screen leads into the main menu (Play / Multi Player / Tutorial / Policy).
- **Play (single player)** — goes straight to the spin wheel.
- **Multi Player** — choose 2–4 players, then everyone places a finger on the "Tap together!" pad at once. Each touch is randomly assigned one of four colours, and one player is randomly chosen to go next.
- **Spin wheel** — a four-colour prize wheel (Red · Green · Orange · Blue) spins with real deceleration physics and lands on a uniformly random slice.
- **Question card** — the matching MIL question card for that colour is displayed (Ice Breaking · AI Language · AI Deepfake · Misinformation). Cards are dealt from a shuffle-bag per topic, so nothing repeats until every question in that topic has been seen.
- **Next Turn** — loops back to the spin wheel (single player) or back to the "tap together" chooser (multiplayer), per round.
- **Tutorial / Policy** — static reference screens, reachable from the menu or the home button on any screen.

## Project structure

```
ai-detective-treasure/
├── index.html              # single-page app shell (all screens)
├── css/
│   └── style.css           # full design system (palette, type, layout, animation)
├── js/
│   ├── app.js               # screen navigation + game state machine
│   ├── wheel.js              # spin wheel physics/randomness
│   ├── playerChance.js       # multi-touch "tap together" chooser
│   └── cards.js               # topic metadata + no-repeat deck logic
└── assets/
    └── cards/
        ├── icbr/      cover.webp, q1–q3.webp   (Ice Breaking — red)
        ├── ai-lang/   cover.webp, q1–q5.webp   (AI Language — green)
        ├── deepfake/  cover.webp, q1–q5.webp   (AI Deepfake — orange)
        └── mi/        cover.webp, q1–q5.webp   (Misinformation — blue)
```

All card artwork is your original `png_kartu` assets, resized and re-encoded as WebP (kept visually lossless at normal viewing sizes) to cut asset weight roughly in half for faster loading.

The screens themselves (cover, wheel, player-chance, tutorial, etc.) are **rebuilt in HTML/CSS**, not shipped as the original multi-megabyte Figma SVG exports — same palette, type, and layout, but a fraction of the download size and fully responsive.

## Running locally

**Step 1 — fully extract the ZIP first.** Don't open `index.html` by double-clicking it *inside* the zip preview (Windows Explorer / Edge will silently extract only that one file to a temp folder, and the game will load with no styling or interactivity because `css/` and `js/` never came along).

Right-click the `.zip` → **Extract All…** (Windows) or double-click it (Mac) to get a real, standalone `ai-detective-treasure` folder on disk, *then* open `index.html` from inside that folder.

**Step 2 — open it.** Once properly extracted, you can just double-click `index.html` and it will run directly in your browser — no server required.

If you'd rather serve it locally (e.g. while developing), any static file server works too:

```bash
cd ai-detective-treasure
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploying to GitHub Pages

1. Push this folder's contents to a GitHub repository (root of the repo, or a `/docs` folder).
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to "Deploy from a branch", pick your branch and the folder (`/root` or `/docs`).
4. Save — your game will be live at `https://<your-username>.github.io/<repo-name>/` within a minute or two.

No further configuration needed — there's no build step, bundler, or environment variable required.

## Customizing

- **Colours / fonts** — edit the CSS custom properties at the top of `css/style.css`.
- **Wheel categories** — edit the `CATEGORIES` array in `js/cards.js` (colour, name, folder, question count).
- **Adding more questions** — drop new `qN.webp` files into the matching `assets/cards/<folder>/` directory and bump that category's `count` in `js/cards.js`.
- **Policy text** — the Policy screen ships with placeholder house-rules/privacy copy since no source design was provided for it; edit the `[data-screen="policy"]` section in `index.html` directly.

## Browser support

Built on standard, widely-supported web platform features — CSS `conic-gradient`, the Pointer Events API (for genuine simultaneous multi-touch detection on the player-chance screen), and ES modules. Works on current versions of Chrome, Safari, Firefox and Edge, desktop and mobile.
