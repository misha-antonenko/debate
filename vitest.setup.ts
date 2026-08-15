// Node v26 defines localStorage/sessionStorage as experimental globals (returning
// undefined without --localstorage-file). Vitest's populateGlobal skips keys that
// already exist on globalThis, so jsdom's implementations never reach the global
// scope. This setup file patches them back in.

if (typeof globalThis.jsdom !== "undefined") {
  for (const key of ["localStorage", "sessionStorage"] as const) {
    Object.defineProperty(globalThis, key, {
      value: globalThis.jsdom.window[key],
      configurable: true,
      writable: true,
    })
  }
}
