export default function sumBy(arr, fn) {
  if (!Array.isArray(arr)) return 0;
  const getKey = typeof fn === 'function' ? fn : (item) => item[fn];
  return arr.reduce((acc, item) => acc + (Number(getKey(item)) || 0), 0);
}
