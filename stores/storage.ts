'use client';

type StorageShape = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const noopStorage: StorageShape = {
  getItem() {
    return null;
  },
  setItem() {},
  removeItem() {},
};

export function getBrowserStorage(): StorageShape {
  if (typeof window === 'undefined' || !window.localStorage) {
    return noopStorage;
  }

  return window.localStorage;
}
