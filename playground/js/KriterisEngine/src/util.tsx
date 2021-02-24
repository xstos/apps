export function Load() {}
Array.prototype.insertArray = function insertArray(index: number, ...items) {
  const pre = this.slice(0, index);
  const post = this.slice(index + 1);
  return pre.concat(items, post);
};
Array.prototype.findIndex2 = function (value) {
  return this.findIndex((v) => v === value);
};
export type TAccessor = { get: () => any; set: (value: any) => void };
export function accessor(target: any, prop: string | number): TAccessor {
  return {
    get() {
      return target[prop];
    },
    set(value: any) {
      target[prop] = value;
      return value;
    },
  };
}

export function renderTracker() {
  const map = new Map();
  return {
    set(key, value = undefined) {
      map.set(key, value);
      return key;
    },
    has(key) {
      return map.has(key);
    },
  };
}
