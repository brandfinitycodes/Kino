export default function sortBy(arr, fn) {
  if (!Array.isArray(arr)) return [];
  const getKey = typeof fn === 'function' ? fn : (item) => item[fn];
  return [...arr].sort((a, b) => {
    const valA = getKey(a);
    const valB = getKey(b);
    if (valA < valB) return -1;
    if (valA > valB) return 1;
    return 0;
  });
}
