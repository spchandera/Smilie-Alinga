import { vi } from 'vitest';

// jsdom does not implement matchMedia or ResizeObserver; several assets/*.js
// modules call/reference them at import time (module-level `const`s and
// `class ... extends ResizeObserver`), so they must exist before any module
// under test is imported.
// Always overwritten (rather than `??=`): jsdom defines a `matchMedia` that
// throws "not implemented" when called, so a nullish check would miss it.
globalThis.matchMedia = vi.fn((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

globalThis.ResizeObserver ??= class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
