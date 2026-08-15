// ============================================================
// wheel.js — animated spin wheel with real deceleration + a
// uniformly random, always-forward-spinning result.
//
// Plain script (no ES modules). Wrapped in an IIFE so internals
// stay private; only SpinWheel is attached to window.MIL.
// ============================================================
window.MIL = window.MIL || {};

(function () {
  const SLICE_SIZE = 360 / window.MIL.CATEGORIES.length; // 90deg
  const SLICE_MARGIN = 12; // keep the landing point away from slice edges

  class SpinWheel {
    /** @param {HTMLElement} wheelEl */
    constructor(wheelEl) {
      this.wheelEl = wheelEl;
      this.rotation = 0;
      this.spinning = false;
    }

    /**
     * Spins the wheel and resolves with the winning category once the
     * CSS transition finishes.
     * @returns {Promise<object>}
     */
    spin() {
      if (this.spinning) return Promise.reject(new Error('Already spinning'));
      this.spinning = true;

      const categories = window.MIL.CATEGORIES;
      const winner = categories[Math.floor(Math.random() * categories.length)];
      const withinSlice = SLICE_MARGIN + Math.random() * (SLICE_SIZE - SLICE_MARGIN * 2);
      const targetAbsolute = (winner.sliceStart + withinSlice) % 360;

      // The pointer sits at the top (0deg / 12 o'clock). We need the wheel's
      // rotation R such that (targetAbsolute + R) mod 360 === 0.
      const targetMod = (360 - targetAbsolute) % 360;

      const currentMod = ((this.rotation % 360) + 360) % 360;
      let delta = targetMod - currentMod;
      if (delta <= 0) delta += 360;

      const EXTRA_SPINS = 6 + Math.floor(Math.random() * 3); // 6-8 full turns
      this.rotation += delta + EXTRA_SPINS * 360;

      this.wheelEl.classList.add('spinning');
      // Force reflow so the transition reliably applies before we set the new value.
      // eslint-disable-next-line no-unused-expressions
      this.wheelEl.offsetHeight;
      this.wheelEl.style.transform = `rotate(${this.rotation}deg)`;

      return new Promise((resolve) => {
        const onEnd = (evt) => {
          if (evt.propertyName !== 'transform') return;
          this.wheelEl.removeEventListener('transitionend', onEnd);
          this.wheelEl.classList.remove('spinning');
          this.spinning = false;
          resolve(winner);
        };
        this.wheelEl.addEventListener('transitionend', onEnd);
      });
    }
  }

  window.MIL.SpinWheel = SpinWheel;
})();
