import { cleanup } from "@testing-library/preact";
import { afterEach } from "vitest";

afterEach(cleanup);

// jsdom lacks what Glisse's controls use (the same stand-ins its own tests install).
window.matchMedia ??= (query: string) =>
  ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }) as unknown as MediaQueryList;

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

Element.prototype.setPointerCapture ??= function () {};
Element.prototype.releasePointerCapture ??= function () {};
Element.prototype.hasPointerCapture ??= () => false;
