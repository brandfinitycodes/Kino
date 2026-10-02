export default function uniqBy(arr, fn) {
  if (!Array.isArray(arr)) return [];
  const getKey = typeof fn === 'function' ? fn : (item) => item[fn];
  const seen = new Set();
  const result = [];
  for (const item of arr) {
    const val = getKey(item);
    if (!seen.has(val)) {
      seen.add(val);
      result.push(item);
    }
  }
  return result;
}
