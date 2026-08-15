// ============================================================
// playerChance.js — "everyone tap together" multi-touch chooser.
// Uses the Pointer Events API so genuine simultaneous touches on
// a shared tablet/phone are each tracked independently. Each touch
// is randomly assigned one of the four brand colours; once enough
// players have touched down, one is chosen at random as "up next".
//
// Plain script (no ES modules). Wrapped in an IIFE so internals
// stay private; only PlayerChance is attached to window.MIL.
// ============================================================
window.MIL = window.MIL || {};

(function () {
  const PALETTE = [
    { name: 'Red', hex: '#DB4A69', dark: '#B23752' },
    { name: 'Green', hex: '#07A465', dark: '#068050' },
    { name: 'Orange', hex: '#F5A776', dark: '#DD8552' },
    { name: 'Blue', hex: '#5CD1DE', dark: '#2FA6B4' },
  ];

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  class PlayerChance {
    /**
     * @param {Object} els
     * @param {HTMLElement} els.pad
     * @param {HTMLElement} els.hint
     * @param {HTMLElement} els.status
     * @param {HTMLElement} els.retryBtn
     */
    constructor({ pad, hint, status, retryBtn }) {
      this.pad = pad;
      this.hint = hint;
      this.status = status;
      this.retryBtn = retryBtn;

      this.required = 4;
      this.tokens = new Map(); // id -> { el, color }
      this.colorQueue = [];
      this.resolved = false;
      this._resolveFn = null;
      this._settleTimer = null;

      this._onPointerDown = this._onPointerDown.bind(this);
      this.retryBtn.addEventListener('click', () => this._restart());
    }

    /**
     * Starts a new round requiring `n` simultaneous players.
     * @param {number} n
     * @returns {Promise<{name:string, hex:string, dark:string}>}
     */
    start(n) {
      this.required = n;
      this._reset(false);
      this.pad.addEventListener('pointerdown', this._onPointerDown);
      return new Promise((resolve) => {
        this._resolveFn = resolve;
      });
    }

    _restart() {
      this._reset(false);
    }

    _reset(keepListener) {
      this.resolved = false;
      this.tokens.forEach((t) => t.el.remove());
      this.tokens.clear();
      this.colorQueue = shuffle(PALETTE);
      clearTimeout(this._settleTimer);
      this.retryBtn.hidden = false;
      this.hint.hidden = false;
      this.hint.textContent = 'Press & hold together';
      this.status.textContent = `Everyone place a finger on the pad below (${this.required} needed)`;
      if (!keepListener) {
        this.pad.removeEventListener('pointerdown', this._onPointerDown);
        this.pad.addEventListener('pointerdown', this._onPointerDown);
      }
    }

    _onPointerDown(evt) {
      if (this.resolved) return;
      if (this.tokens.size >= this.required) return;

      // Mouse always reports the same pointerId; treat each mouse click as a
      // distinct "player" so the game is still testable with one pointer.
      const id = evt.pointerType === 'mouse' ? `mouse-${Date.now()}-${Math.random()}` : evt.pointerId;
      if (this.tokens.has(id)) return;

      const rect = this.pad.getBoundingClientRect();
      const x = evt.clientX - rect.left;
      const y = evt.clientY - rect.top;
      const color = this.colorQueue[this.tokens.size];

      const el = document.createElement('div');
      el.className = 'chance-token';
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.background = color.hex;
      el.style.color = color.dark;
      el.innerHTML = '<span class="ring"></span><span class="ring ring-2"></span>';
      this.pad.appendChild(el);

      this.tokens.set(id, { el, color });
      this.hint.hidden = true;

      const remaining = this.required - this.tokens.size;
      this.status.textContent = remaining > 0
        ? `${remaining} more finger${remaining === 1 ? '' : 's'} needed…`
        : 'Hold tight…';

      if (this.tokens.size >= this.required) {
        this.pad.removeEventListener('pointerdown', this._onPointerDown);
        this._settleTimer = setTimeout(() => this._resolveWinner(), 700);
      }
    }

    _resolveWinner() {
      if (this.resolved) return;
      this.resolved = true;

      const entries = Array.from(this.tokens.values());
      const winnerIdx = Math.floor(Math.random() * entries.length);

      entries.forEach((t, i) => {
        if (i === winnerIdx) {
          t.el.classList.add('winner');
        } else {
          t.el.classList.add('faded');
        }
      });

      const winner = entries[winnerIdx].color;
      this.status.textContent = `${winner.name} goes first!`;

      setTimeout(() => {
        if (!this.resolved) return; // a retry happened before this fired — ignore stale result
        if (this._resolveFn) {
          const fn = this._resolveFn;
          this._resolveFn = null;
          fn(winner);
        }
      }, 1500);
    }
  }

  window.MIL.PlayerChance = PlayerChance;
})();
