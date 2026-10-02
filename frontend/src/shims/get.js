export default function get(obj, path, defaultValue) {
  if (!obj) return defaultValue;
  const keys = Array.isArray(path) ? path : path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let result = obj;
  for (const key of keys) {
    if (result == null) return defaultValue;
    result = result[key];
  }
  return result === undefined ? defaultValue : result;
}
