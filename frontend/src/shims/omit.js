export default function omit(obj, keys) {
  if (!obj) return {};
  const keysSet = new Set(Array.isArray(keys) ? keys : [keys]);
  const result = {};
  for (const key of Object.keys(obj)) {
    if (!keysSet.has(key)) {
      result[key] = obj[key];
    }
  }
  return result;
}
