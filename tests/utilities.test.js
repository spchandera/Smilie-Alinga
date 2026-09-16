import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clamp,
  closest,
  debounce,
  isClickedOutside,
  isPointWithinElement,
  normalizeString,
  parseIntOrDefault,
  preventDefault,
  throttle,
} from '../assets/utilities.js';

describe('clamp', () => {
  it('returns the value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('clamps to the minimum', () => {
    expect(clamp(-1, 0, 10)).toBe(0);
  });

  it('clamps to the maximum', () => {
    expect(clamp(11, 0, 10)).toBe(10);
  });
});

describe('closest', () => {
  it('returns the value closest to the target', () => {
    expect(closest([1, 5, 10, 20], 3)).toBe(1);
    expect(closest([1, 5, 10, 20], 13)).toBe(10);
  });

  it('returns the only value for a single-element array', () => {
    expect(closest([7], 100)).toBe(7);
  });
});

describe('parseIntOrDefault', () => {
  it('parses a numeric string', () => {
    expect(parseIntOrDefault('42', 0)).toBe(42);
  });

  it('preserves zero as a valid parsed value', () => {
    expect(parseIntOrDefault('0', 99)).toBe(0);
  });

  it('falls back to the default for null, undefined, or empty string', () => {
    expect(parseIntOrDefault(null, 5)).toBe(5);
    expect(parseIntOrDefault(undefined, 5)).toBe(5);
    expect(parseIntOrDefault('', 5)).toBe(5);
  });

  it('falls back to the default when the value is not numeric', () => {
    expect(parseIntOrDefault('abc', 5)).toBe(5);
  });

  it('accepts a numeric (non-string) value', () => {
    expect(parseIntOrDefault(10, 0)).toBe(10);
  });

  it('supports a null default value', () => {
    expect(parseIntOrDefault('abc', null)).toBeNull();
  });
});

describe('normalizeString', () => {
  it('lowercases the string', () => {
    expect(normalizeString('HELLO')).toBe('hello');
  });

  it('strips diacritics', () => {
    expect(normalizeString('Café')).toBe('cafe');
  });
});

describe('preventDefault', () => {
  it('calls preventDefault on the given event', () => {
    const event = { preventDefault: vi.fn() };
    preventDefault(event);
    expect(event.preventDefault).toHaveBeenCalledOnce();
  });
});

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('only calls the function once after rapid successive calls', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 200);

    debounced('a');
    debounced('b');
    debounced('c');

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);

    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith('c');
  });

  it('cancel() prevents the pending call', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 200);

    debounced();
    debounced.cancel();

    vi.advanceTimersByTime(200);

    expect(fn).not.toHaveBeenCalled();
  });
});

describe('throttle', () => {
  // throttle() reads performance.now() directly, so we take control of the
  // clock rather than relying on the real elapsed process uptime.
  let now = 0;

  beforeEach(() => {
    // Start comfortably above 0 so the first call (lastCall starts at 0
    // inside throttle()) always clears the "at least `delay` ms" check.
    now = 1000;
    vi.spyOn(performance, 'now').mockImplementation(() => now);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls the function on the first invocation', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 200);

    throttled('first');

    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith('first');
  });

  it('ignores calls that happen before the delay has elapsed', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 200);

    throttled('first');
    now += 100;
    throttled('second');

    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith('first');
  });

  it('calls again once the delay has fully elapsed', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 200);

    throttled('first');
    now += 200;
    throttled('second');

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith('second');
  });

  it('cancel() marks the window as freshly started, suppressing an immediate next call', () => {
    // Note: despite the name, `cancel()` sets lastCall to now rather than
    // resetting it to 0 — so a call right after cancel() is still throttled.
    const fn = vi.fn();
    const throttled = throttle(fn, 200);

    throttled('first');
    throttled.cancel();
    now += 50;
    throttled('second');

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('first');
  });
});

describe('isPointWithinElement', () => {
  const element = /** @type {Element} */ ({
    getBoundingClientRect: () => ({ left: 10, right: 110, top: 20, bottom: 120 }),
  });

  it('returns true for a point inside the element', () => {
    expect(isPointWithinElement(50, 50, element)).toBe(true);
  });

  it('returns false for a point outside the element', () => {
    expect(isPointWithinElement(200, 200, element)).toBe(false);
  });

  it('treats the edges as inside', () => {
    expect(isPointWithinElement(10, 20, element)).toBe(true);
    expect(isPointWithinElement(110, 120, element)).toBe(true);
  });
});

describe('isClickedOutside', () => {
  it('returns false when the event target is inside the element', () => {
    const child = document.createElement('span');
    const element = document.createElement('div');
    element.appendChild(child);

    const event = /** @type {MouseEvent} */ ({ target: child });
    expect(isClickedOutside(event, element)).toBe(false);
  });

  it('returns true when the event target is outside the element', () => {
    const element = document.createElement('div');
    const outside = document.createElement('span');

    const event = /** @type {MouseEvent} */ ({ target: outside });
    expect(isClickedOutside(event, element)).toBe(true);
  });
});
