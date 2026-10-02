export default function isPlainObject(val) {
  if (val === null || typeof val !== 'object') return false;
  const proto = Object.getPrototypeOf(val);
  return proto === null || proto === Object.prototype;
}
