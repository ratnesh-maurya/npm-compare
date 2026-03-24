type StorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  key: (index: number) => string | null;
  readonly length: number;
};

function createNoopStorage(): StorageLike {
  return {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
    clear: () => undefined,
    key: () => null,
    length: 0,
  };
}

export async function register() {
  const maybeStorage = (globalThis as { localStorage?: unknown }).localStorage;
  const hasGetItem =
    typeof maybeStorage === 'object' &&
    maybeStorage !== null &&
    typeof (maybeStorage as { getItem?: unknown }).getItem === 'function';

  // Some Node/dev setups expose a malformed localStorage object.
  if (typeof maybeStorage !== 'undefined' && !hasGetItem) {
    (globalThis as { localStorage: StorageLike }).localStorage = createNoopStorage();
  }
}
