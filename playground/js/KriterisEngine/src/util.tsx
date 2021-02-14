export function Load() {}
Array.prototype.insertArray = function insertArray(index: number, ...items) {
  const pre = this.slice(0, index);
  const post = this.slice(index + 1);
  return pre.concat(items, post);
};
Array.prototype.findIndex2 = function (value) {
  return this.findIndex((v) => v === value);
};
