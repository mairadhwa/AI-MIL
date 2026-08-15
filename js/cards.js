// ============================================================
// cards.js — category metadata + no-repeat-until-exhausted decks
//
// Plain script (no ES modules) so this also works when index.html
// is opened directly by double-click, not just from a web server.
// Wrapped in an IIFE so internals stay private; only the small
// public API below is attached to the shared window.MIL namespace.
// ============================================================
window.MIL = window.MIL || {};

(function () {
  /**
   * Wheel slice order (clockwise from 12 o'clock / 0deg), matching
   * the conic-gradient defined in css/style.css (.wheel).
   */
  const CATEGORIES = [
    {
      id: 'icbr',
      name: 'Ice Breaking',
      color: 'red',
      hex: '#DB4A69',
      hexDark: '#B23752',
      sliceStart: 0,
      folder: 'icbr',
      count: 3,
    },
    {
      id: 'ai-lang',
      name: 'AI Language',
      color: 'green',
      hex: '#07A465',
      hexDark: '#068050',
      sliceStart: 90,
      folder: 'ai-lang',
      count: 5,
    },
    {
      id: 'deepfake',
      name: 'AI Deepfake',
      color: 'orange',
      hex: '#F5A776',
      hexDark: '#DD8552',
      sliceStart: 180,
      folder: 'deepfake',
      count: 5,
    },
    {
      id: 'mi',
      name: 'Misinformation',
      color: 'blue',
      hex: '#5CD1DE',
      hexDark: '#2FA6B4',
      sliceStart: 270,
      folder: 'mi',
      count: 5,
    },
  ];

  function getCategoryById(id) {
    return CATEGORIES.find((c) => c.id === id);
  }

  /** Fisher-Yates shuffle (non-mutating). */
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /**
   * Shuffle-bag deck per category: deals every question once in a
   * random order before any question repeats, and avoids repeating
   * the exact same card twice in a row across a reshuffle boundary.
   */
  class CardDeck {
    constructor(category) {
      this.category = category;
      this.bag = [];
      this.lastDealt = null;
    }

    _refill() {
      let next = shuffle(Array.from({ length: this.category.count }, (_, i) => i + 1));
      if (next.length > 1 && next[0] === this.lastDealt) {
        // Avoid an immediate repeat right after a reshuffle.
        [next[0], next[1]] = [next[1], next[0]];
      }
      this.bag = next;
    }

    draw() {
      if (this.bag.length === 0) this._refill();
      const value = this.bag.pop();
      this.lastDealt = value;
      return value;
    }
  }

  const decks = new Map(CATEGORIES.map((c) => [c.id, new CardDeck(c)]));

  /**
   * Draw the next card for a category. Returns { src, alt, questionNumber }.
   */
  function drawCard(categoryId) {
    const category = getCategoryById(categoryId);
    const deck = decks.get(categoryId);
    const questionNumber = deck.draw();
    return {
      category,
      questionNumber,
      src: `assets/cards/${category.folder}/q${questionNumber}.webp`,
      alt: `${category.name} question ${questionNumber}`,
    };
  }

  function getCoverSrc(categoryId) {
    const category = getCategoryById(categoryId);
    return `assets/cards/${category.folder}/cover.webp`;
  }

  window.MIL.CATEGORIES = CATEGORIES;
  window.MIL.getCategoryById = getCategoryById;
  window.MIL.drawCard = drawCard;
  window.MIL.getCoverSrc = getCoverSrc;
})();
